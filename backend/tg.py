import telebot
from telebot import types
import requests
import time
import threading
from PIL import Image, ImageDraw, ImageFont
import io
import json
import os
import shutil
from datetime import datetime, timedelta
import random
import string
import re

# Configuration
#BOT_TOKEN = '8244180352:AAFIdvcXNBpDrWF1VzlL-DISzJAnHYeXPrs'
BOT_TOKEN = '7072295245:AAEDwh_bX45eQ8FnEYAqcOHtMDI8pLJFcTU'  # Replace with your bot token
BACKEND_URL = "https://api.soulpredictor.xyz"
POLLING_INTERVAL = 1 # seconds

# Admin user IDs (add your admin user IDs here)
# To get your user ID, send a message to @userinfobot on Telegram
ADMIN_IDS = [5758343460]  # Add admin user IDs like [123456789, 987654321]

# Initialize bot
bot = telebot.TeleBot(BOT_TOKEN)

# Users file
USERS_FILE = "users.json"
USERS_TXT_FILE = "users.txt"
KEYS_FILE = "keys.json"  # Kept for backward compatibility, not used for new users

# Backend API URL for login verification
BACKEND_API_URL = "https://api.soulpredictor.xyz"

# Store user data: {user_id: {'username': str, 'last_mines': [], 'last_gems': [], 'polling_thread': Thread, 'is_polling': bool, 'message_ids': [], 'waiting_username': bool, 'menu_message_id': int}}
user_data = {}

# Grid configuration (5x5 = 25 tiles)
GRID_SIZE = 5
TOTAL_TILES = 25

# Demo limits
DEMO_MINES_LIMIT_PER_DAY = 4
DEMO_CRASH_LIMIT_PER_DAY = 4
DEMO_BLACKJACK_LIMIT_PER_DAY = 4
DEMO_MOLES_LIMIT_PER_DAY = 4
DEMO_TOTAL_LIMIT_PER_DAY = 4
DEMO_RESET_INTERVAL_HOURS = 12
PLAN_SYNC_CACHE_SECONDS = 60
DEMO_RESET_CHECK_INTERVAL_SECONDS = 300
REMOTE_LIMIT_RESET_SYNC_SECONDS = 60

remote_limit_sync_cache = {}
USERS_FILE_LOCK = threading.Lock()
USERS_FILE_BACKUP = f"{USERS_FILE}.bak"

def write_users(users):
    temp_file = f"{USERS_FILE}.tmp"
    with USERS_FILE_LOCK:
        try:
            if os.path.exists(USERS_FILE):
                try:
                    shutil.copy2(USERS_FILE, USERS_FILE_BACKUP)
                except Exception:
                    pass
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(users, f, indent=2, ensure_ascii=False)
                f.flush()
                os.fsync(f.fileno())
            os.replace(temp_file, USERS_FILE)
            return True
        finally:
            if os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except Exception:
                    pass

# Image file paths
GEM_IMAGE_PATH = r"gem.jpg"
MINE_IMAGE_PATH = r"mine.jpg"

# Load gem and mine images (will be loaded when needed)
gem_img = None
mine_img = None

def load_images():
    """Load gem and mine images"""
    global gem_img, mine_img
    try:
        gem_img = Image.open(GEM_IMAGE_PATH)
        mine_img = Image.open(MINE_IMAGE_PATH)
        print(f"Loaded images: gem.jpg ({gem_img.size}), mine.jpg ({mine_img.size})")
    except Exception as e:
        print(f"Error loading images: {e}")
        gem_img = None
        mine_img = None

# Load images on startup
load_images()


def load_users():
    try:
        with USERS_FILE_LOCK:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                content = f.read().strip()

                if not content:
                    return {}

                try:
                    loaded = json.loads(content)
                    if isinstance(loaded, dict):
                        return loaded
                    return {}
                except json.JSONDecodeError:
                    print("users.json is corrupted. Trying backup recovery.")
        if os.path.exists(USERS_FILE_BACKUP):
            with open(USERS_FILE_BACKUP, 'r', encoding='utf-8') as bf:
                backup_content = bf.read().strip()
                if backup_content:
                    backup_users = json.loads(backup_content)
                    if isinstance(backup_users, dict):
                        print("Recovered users from users.json.bak")
                        return backup_users
        return {}

    except FileNotFoundError:
        return {}
    except Exception as e:
        print(f"Error loading users.json: {e}")
        return {}



def load_users_from_txt():
    """Load user IDs from users.txt file (format: user_id,name,username)"""
    user_ids = []
    try:
        with open(USERS_TXT_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:  # Skip empty lines
                    parts = line.split(',')
                    if len(parts) >= 1:
                        try:
                            user_id = int(parts[0].strip())
                            user_ids.append(user_id)
                        except ValueError:
                            # Skip invalid user IDs
                            continue
    except FileNotFoundError:
        # File doesn't exist, return empty list
        pass
    except Exception as e:
        print(f"Error loading users from {USERS_TXT_FILE}: {e}")
    
    return user_ids


def load_full_users_from_txt():
    """Load full user data from users.txt file (format: user_id,name,username)"""
    users_list = []
    try:
        with open(USERS_TXT_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:  # Skip empty lines
                    parts = line.split(',')
                    if len(parts) >= 1:
                        try:
                            user_id = int(parts[0].strip())
                            name = parts[1].strip() if len(parts) >= 2 else 'N/A'
                            username = parts[2].strip() if len(parts) >= 3 else 'N/A'
                            if username.lower() == 'none':
                                username = 'N/A'
                            users_list.append({
                                'user_id': user_id,
                                'name': name,
                                'username': username
                            })
                        except (ValueError, IndexError):
                            # Skip invalid user IDs
                            continue
    except FileNotFoundError:
        # File doesn't exist, return empty list
        pass
    except Exception as e:
        print(f"Error loading users from {USERS_TXT_FILE}: {e}")
    
    return users_list


def save_user(user_id, name, username):
    """Save user data to JSON file - auto-creates users.json if not exists"""
    users = load_users()
    user_id_str = str(user_id)
    
    # Preserve existing plan if user exists
    if user_id_str in users:
        existing_plan = users[user_id_str].get('plan')
        # Update name and username
        users[user_id_str]['name'] = name
        users[user_id_str]['username'] = username
    else:
        existing_plan = None
        users[user_id_str] = {
            'name': name,
            'username': username,
            'user_id': user_id,
            'joined_at': datetime.now().isoformat()
        }
    
    # Initialize plan if not exists
    if not existing_plan:
        users[user_id_str]['plan'] = {
            'plan': 'demo',
            'activated_at': None,
            'expires_at': None,
            'predictions_today': 0,  # legacy (keep)
            'predictions_today_total': 0,
            'predictions_today_mines': 0,
            'predictions_today_crash': 0,
            'predictions_today_blackjack': 0,
            'predictions_today_moles': 0,
            'last_prediction_date': None
        }
    else:
        users[user_id_str]['plan'] = existing_plan
    
    # Auto-create file if not exists
    write_users(users)


def save_user_email(user_id, email):
    """Persist email to users.json for backend stats linkage (track-prediction)"""
    users = load_users()
    user_id_str = str(user_id)
    if user_id_str not in users:
        users[user_id_str] = {'name': '', 'username': '', 'user_id': user_id, 'joined_at': datetime.now().isoformat()}
    users[user_id_str]['email'] = email
    write_users(users)


def clear_user_email(user_id):
    """Clear persisted dashboard email to force fresh OTP login session."""
    users = load_users()
    user_id_str = str(user_id)
    if user_id_str in users and isinstance(users[user_id_str], dict) and 'email' in users[user_id_str]:
        users[user_id_str].pop('email', None)
        write_users(users)


def verify_user_login(email):
    """Verify user login via backend API and get their plan info"""
    try:
        response = requests.post(
            f"{BACKEND_API_URL}/user-login",
            json={"email": email},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success' and data.get('user'):
                user = data['user']
                return {
                    'success': True,
                    'email': email,
                    'subscription_plan': user.get('subscription_plan', 'free'),
                    'plan_active': user.get('plan_active', False),
                    'plan_expires_at': user.get('plan_expires_at'),
                    'mines_access_enabled': user.get('mines_access_enabled', False),
                    'crash_access_enabled': user.get('crash_access_enabled', False),
                    'blackjack_access_enabled': user.get('blackjack_access_enabled', False),
                    'moles_access_enabled': user.get('moles_access_enabled', False),
                    'status': user.get('status'),
                    'active': user.get('active', False)
                }
        return {'success': False, 'error': 'Invalid login or user not registered'}
    except Exception as e:
        print(f"Error verifying user login: {e}")
        return {'success': False, 'error': 'Connection error. Please try again.'}


def update_user_plan_from_login(user_id, login_data):
    """Update user's plan based on backend login response"""
    users = load_users()
    user_id_str = str(user_id)
    
    if user_id_str not in users:
        users[user_id_str] = {}
    
    plan_type = login_data.get('subscription_plan', 'demo')
    # Map backend plan names to bot plan names
    plan_mapping = {
        'free': 'demo',
        'silver': 'silver',
        'gold': 'gold',
        'turbo': 'turbo'
    }
    bot_plan = plan_mapping.get(plan_type, 'demo')
    
    # Calculate expiration
    expires_at = None
    plan_expires_at = login_data.get('plan_expires_at')
    if plan_expires_at:
        try:
            expires_at = datetime.fromisoformat(plan_expires_at.replace('Z', '+00:00'))
        except:
            expires_at = None
    
    # Only update if plan is active or user is approved
    if login_data.get('plan_active') or (login_data.get('status') == 'approved' and login_data.get('active')):
        users[user_id_str]['plan'] = {
            'plan': bot_plan,
            'activated_at': datetime.now().isoformat(),
            'expires_at': plan_expires_at,
            'predictions_today': 0,
            'predictions_today_total': 0,
            'predictions_today_mines': 0,
            'predictions_today_crash': 0,
            'predictions_today_blackjack': 0,
            'predictions_today_moles': 0,
            'last_prediction_date': None,
            'login_email': login_data.get('email'),
            'backend_plan': plan_type
        }
        
        write_users(users)
        return True
    return False


def get_user_count():
    """Get total number of users"""
    users = load_users()
    return len(users)


def is_admin(user_id):
    """Check if user is admin"""
    return user_id in ADMIN_IDS


def delete_user_message(chat_id, message_id):
    """Delete user message"""
    try:
        bot.delete_message(chat_id, message_id)
    except:
        pass


# ==================== PLAN MANAGEMENT SYSTEM ====================

def load_keys():
    """Load keys from JSON file - auto-creates if not exists"""
    try:
        with open(KEYS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        # Auto-create empty keys.json file
        with open(KEYS_FILE, 'w', encoding='utf-8') as f:
            json.dump({'keys': {}, 'users': {}}, f, indent=2, ensure_ascii=False)
        return {'keys': {}, 'users': {}}


def save_keys(data):
    """Save keys to JSON file"""
    with open(KEYS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def safe_parse_datetime(dt_str):
    """Safely parse datetime string, handling various formats including 5-digit microseconds"""
    if not dt_str:
        return None
    try:
        import re
        from datetime import timezone
        
        # Handle microseconds with 1-6 digits by normalizing to 6 digits
        # Pattern: .00002+00:00 or .52958Z -> .000020+00:00 or .529580+00:00
        def normalize_microseconds(match):
            microsec = match.group(1)
            tz_part = match.group(2) if match.group(2) else ''
            # Pad microseconds to 6 digits
            microsec_normalized = microsec.ljust(6, '0')[:6]
            return '.' + microsec_normalized + tz_part
        
        # First normalize microseconds before timezone
        # Match: .(1-6 digits)(timezone like +00:00 or Z or end)
        dt_str_normalized = re.sub(r'\.(\d{1,6})([+-]\d{2}:\d{2})', normalize_microseconds, dt_str)
        # Then handle microseconds at end or with Z
        dt_str_normalized = re.sub(r'\.(\d{1,6})(Z|$)', lambda m: '.' + m.group(1).ljust(6, '0')[:6] + (m.group(2) if m.group(2) == 'Z' else ''), dt_str_normalized)
        
        # Remove Z and replace with +00:00 if needed
        if dt_str_normalized.endswith('Z'):
            dt_str_normalized = dt_str_normalized[:-1] + '+00:00'
        
        # Parse the normalized string
        dt = datetime.fromisoformat(dt_str_normalized)
        if dt.tzinfo is not None:
            dt = dt.replace(tzinfo=None)
        return dt
    except Exception as e:
        print(f"Error converting datetime: {e}")
        # Try alternative parsing method - strip timezone, normalize, then add UTC
        try:
            # Extract timezone if present
            tz_match = re.search(r'([+-]\d{2}:\d{2}|Z)$', dt_str)
            has_tz = tz_match is not None
            
            # Remove timezone temporarily
            dt_str_no_tz = re.sub(r'[+-]\d{2}:\d{2}|Z$', '', dt_str)
            # Normalize microseconds
            dt_str_no_tz = re.sub(r'\.(\d{1,6})$', lambda m: '.' + m.group(1).ljust(6, '0')[:6], dt_str_no_tz)
            
            # Parse without timezone
            dt = datetime.fromisoformat(dt_str_no_tz)
            # Always return naive datetime for local comparisons
            if dt.tzinfo is not None:
                dt = dt.replace(tzinfo=None)
            return dt
        except Exception as e2:
            print(f"Alternative datetime parsing also failed: {e2}")
            return None


def sync_remote_demo_limit_reset(user_id, user, plan_info):
    if not isinstance(plan_info, dict):
        return False
    if str(plan_info.get('plan') or '').lower() != 'demo':
        return False

    email = str(user.get('email') or '').strip().lower()
    if not email and user_id in user_data:
        email = str(user_data[user_id].get('login_email') or '').strip().lower()
    if not email or '@' not in email:
        return False

    now_ts = time.time()
    last_ts = remote_limit_sync_cache.get(user_id, 0)
    if now_ts - last_ts < REMOTE_LIMIT_RESET_SYNC_SECONDS:
        return False
    remote_limit_sync_cache[user_id] = now_ts

    try:
        resp = requests.post(
            f"{BACKEND_API_URL}/bot/limit-reset-status",
            json={"email": email},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        if resp.status_code != 200:
            return False
        js = resp.json() or {}
        if js.get('status') != 'success':
            return False

        remote_reset_at = js.get('bot_limits_reset_at')
        if not remote_reset_at:
            return False

        remote_dt = safe_parse_datetime(remote_reset_at)
        applied_str = plan_info.get('last_remote_limit_reset_applied_at')
        applied_dt = safe_parse_datetime(applied_str) if applied_str else None

        should_apply = False
        if remote_dt:
            if not applied_dt or remote_dt > applied_dt:
                should_apply = True
        else:
            if not applied_str or str(remote_reset_at) > str(applied_str):
                should_apply = True

        if not should_apply:
            return False

        now = datetime.now()
        plan_info['predictions_today_total'] = 0
        plan_info['predictions_today_mines'] = 0
        plan_info['predictions_today_crash'] = 0
        plan_info['predictions_today_blackjack'] = 0
        plan_info['predictions_today_moles'] = 0
        plan_info['predictions_today'] = 0
        plan_info['limit_window_started_at'] = now.isoformat()
        plan_info['last_prediction_date'] = now.date().isoformat()
        plan_info['last_remote_limit_reset_applied_at'] = str(remote_reset_at)
        return True
    except Exception as e:
        print(f"Error syncing remote demo limit reset: {e}")
        return False


def _get_dashboard_plan_info(chat_id):
    """Fetch plan info directly from dashboard API. Returns (dashboard_plan, expires_at, plan_active) or None."""
    dashboard_email = None
    if chat_id in user_data and user_data[chat_id].get('login_email'):
        dashboard_email = user_data[chat_id]['login_email']
    else:
        users = load_users()
        dashboard_email = users.get(str(chat_id), {}).get('email')

    if not dashboard_email:
        return None

    try:
        resp = requests.post(
            f"{BACKEND_URL}/auth/profile",
            json={"email": dashboard_email},
            headers={"Content-Type": "application/json"},
            timeout=8
        )
        if resp.status_code == 200:
            js = resp.json()
            if js.get('status') == 'success' and js.get('user'):
                u = js['user']
                return (
                    u.get('subscription_plan', 'free'),
                    u.get('plan_expires_at'),
                    u.get('plan_active', False)
                )
    except Exception as e:
        print(f"Error fetching subscription for {chat_id}: {e}")
    return None


def _derive_effective_plan(plan_info):
    """Derive the effective plan from stored subscription info.
    Priority: live dashboard API > stored dashboard_plan.
    Returns the plan string to use ('demo','silver','gold','turbo')."""
    dashboard_plan = plan_info.get('dashboard_plan')
    dashboard_expires = plan_info.get('dashboard_plan_expires_at')

    if dashboard_expires:
        expires_at = safe_parse_datetime(dashboard_expires)
        if expires_at and datetime.now() >= expires_at:
            return 'demo'

    plan_mapping = {'free': 'demo', 'silver': 'silver', 'gold': 'gold', 'turbo': 'turbo'}
    return plan_mapping.get(dashboard_plan, 'demo')


def get_user_plan(user_id):
    """Get user's current plan, always using the dashboard as source of truth.
    Effective plan is derived from stored subscription; if a cached login_email
    exists, a live API call is made to refresh it (with in-memory caching)."""
    users = load_users()
    user_id_str = str(user_id)

    default_plan = {
        'plan': 'demo',
        'dashboard_plan': None,
        'dashboard_plan_expires_at': None,
        'activated_at': None,
        'expires_at': None,
        'predictions_today': 0,
        'predictions_today_total': 0,
        'predictions_today_mines': 0,
        'predictions_today_crash': 0,
        'predictions_today_blackjack': 0,
        'predictions_today_moles': 0,
        'last_prediction_date': None,
        'limit_window_started_at': None
    }

    if user_id_str not in users:
        return default_plan

    user = users[user_id_str]
    plan_info = user.get('plan', {})
    if not isinstance(plan_info, dict):
        plan_info = {}

    for k, v in default_plan.items():
        plan_info.setdefault(k, v)

    if 'predictions_today_total' not in plan_info:
        plan_info['predictions_today_total'] = plan_info.get('predictions_today', 0) or 0
    if 'predictions_today_mines' not in plan_info:
        plan_info['predictions_today_mines'] = 0
    if 'predictions_today_crash' not in plan_info:
        plan_info['predictions_today_crash'] = 0
    if 'predictions_today_blackjack' not in plan_info:
        plan_info['predictions_today_blackjack'] = 0
    if 'predictions_today_moles' not in plan_info:
        plan_info['predictions_today_moles'] = 0
    plan_info['predictions_today'] = plan_info.get('predictions_today_total', 0) or 0

    live_info = None
    cache_key = f'_live_plan_cache_{user_id}'
    session_state = user_data.setdefault(user_id, {})
    has_dashboard_email = bool(session_state.get('login_email') or user.get('email'))
    if has_dashboard_email:
        cached = session_state.get(cache_key)
        if cached:
            cached_at, live_info = cached
            if time.time() - cached_at > PLAN_SYNC_CACHE_SECONDS:
                live_info = None
        if live_info is None:
            live_info = _get_dashboard_plan_info(user_id)
            if live_info:
                session_state[cache_key] = (time.time(), live_info)

    dashboard_plan = None
    dashboard_expires = None
    if live_info:
        dashboard_plan, dashboard_expires, _ = live_info
        plan_info['dashboard_plan'] = dashboard_plan
        plan_info['dashboard_plan_expires_at'] = dashboard_expires
    elif plan_info.get('dashboard_plan'):
        dashboard_plan = plan_info['dashboard_plan']
        dashboard_expires = plan_info.get('dashboard_plan_expires_at')
    else:
        dashboard_plan = 'free'
        plan_info['dashboard_plan'] = dashboard_plan

    if dashboard_expires:
        expires_dt = safe_parse_datetime(dashboard_expires)
        if expires_dt and datetime.now() >= expires_dt:
            dashboard_plan = 'demo'
            plan_info['dashboard_plan'] = dashboard_plan
            plan_info['dashboard_plan_expires_at'] = None

    effective_plan = _derive_effective_plan(plan_info)
    plan_info['plan'] = effective_plan

    changed = False
    if effective_plan == 'demo':
        if sync_remote_demo_limit_reset(user_id, user, plan_info):
            changed = True
        local_changed = reset_demo_plan_window(plan_info)
        if local_changed:
            changed = True
        if 'limit_window_started_at' not in plan_info:
            plan_info['limit_window_started_at'] = None
        if changed:
            user['plan'] = plan_info
            users[user_id_str] = user
            write_users(users)

    return plan_info


PLAN_DISPLAY_NAMES = {
    'demo': 'Free',
    'free': 'Free',
    'silver': 'Diamond',
    'gold': 'Obsidian',
    'turbo': 'Obsidian'
}


def format_plan_display_name(plan):
    key = str(plan or '').strip().lower()
    return PLAN_DISPLAY_NAMES.get(key, str(plan or '').strip())


def update_user_plan(user_id, plan_type, duration_days=None):
    """Update user's plan"""
    users = load_users()
    user_id_str = str(user_id)
    
    if user_id_str not in users:
        users[user_id_str] = {}
    
    activated_at = datetime.now()
    expires_at = None
    
    if duration_days:
        # Handle fractional days (for minutes/hours)
        if duration_days < 1:
            # Convert to seconds for timedelta
            expires_at = activated_at + timedelta(seconds=int(duration_days * 24 * 60 * 60))
        else:
            expires_at = activated_at + timedelta(days=duration_days)
    
    users[user_id_str]['plan'] = {
        'plan': plan_type,
        'activated_at': activated_at.isoformat(),
        'expires_at': expires_at.isoformat() if expires_at else None,
        'predictions_today': 0,  # legacy (keep)
        'predictions_today_total': 0,
        'predictions_today_mines': 0,
        'predictions_today_crash': 0,
        'predictions_today_blackjack': 0,
        'predictions_today_moles': 0,
        'last_prediction_date': None,
        'limit_window_started_at': None
    }
    
    write_users(users)


def can_generate_prediction(user_id, game_type='mines'):
    """Check if user can generate prediction (for Demo plan limits).

    Demo limits:
    - Mines: 3 per 12h window
    - Crash: 7 per window
    - Blackjack: 7 per window
    - Moles: 7 per window
    - Total (all games): 10 per window
    """
    plan_info = get_user_plan(user_id)
    
    if plan_info['plan'] == 'demo':
        total = plan_info.get('predictions_today_total', plan_info.get('predictions_today', 0)) or 0
        mines = plan_info.get('predictions_today_mines', 0) or 0
        crash = plan_info.get('predictions_today_crash', 0) or 0
        blackjack = plan_info.get('predictions_today_blackjack', 0) or 0
        moles = plan_info.get('predictions_today_moles', 0) or 0

        if total >= DEMO_TOTAL_LIMIT_PER_DAY:
            return False, {'total': total, 'mines': mines, 'crash': crash, 'blackjack': blackjack, 'moles': moles, 'reason': 'total'}

        gt = (game_type or 'mines').lower()
        if gt == 'crash' and crash >= DEMO_CRASH_LIMIT_PER_DAY:
            return False, {'total': total, 'mines': mines, 'crash': crash, 'blackjack': blackjack, 'reason': 'crash'}
        if gt == 'blackjack' and blackjack >= DEMO_BLACKJACK_LIMIT_PER_DAY:
            return False, {'total': total, 'mines': mines, 'crash': crash, 'blackjack': blackjack, 'moles': moles, 'reason': 'blackjack'}
        if gt == 'moles' and moles >= DEMO_MOLES_LIMIT_PER_DAY:
            return False, {'total': total, 'mines': mines, 'crash': crash, 'blackjack': blackjack, 'moles': moles, 'reason': 'moles'}
        if gt == 'mines' and mines >= DEMO_MINES_LIMIT_PER_DAY:
            return False, {'total': total, 'mines': mines, 'crash': crash, 'blackjack': blackjack, 'moles': moles, 'reason': 'mines'}

        return True, {'total': total, 'mines': mines, 'crash': crash, 'blackjack': blackjack, 'moles': moles}
    
    return True, {'total': 0, 'mines': 0, 'crash': 0, 'blackjack': 0, 'moles': 0}


def increment_prediction_count(user_id, game_type='mines'):
    """Increment prediction count for Demo plan (per-game and total)"""
    users = load_users()
    user_id_str = str(user_id)
    
    if user_id_str not in users:
        return
    
    plan_info = users[user_id_str].get('plan', {})
    now = datetime.now()

    # Normalize counters (support old schema)
    if 'predictions_today_total' not in plan_info:
        plan_info['predictions_today_total'] = plan_info.get('predictions_today', 0) or 0
    if 'predictions_today_mines' not in plan_info:
        plan_info['predictions_today_mines'] = 0
    if 'predictions_today_crash' not in plan_info:
        plan_info['predictions_today_crash'] = 0
    if 'predictions_today_blackjack' not in plan_info:
        plan_info['predictions_today_blackjack'] = 0
    if 'predictions_today_moles' not in plan_info:
        plan_info['predictions_today_moles'] = 0

    if reset_demo_plan_window(plan_info, now=now):
        pass
    elif not plan_info.get('limit_window_started_at'):
        plan_info['limit_window_started_at'] = now.isoformat()

    plan_info['last_prediction_date'] = now.date().isoformat()

    # Increment
    plan_info['predictions_today_total'] = (plan_info.get('predictions_today_total', 0) or 0) + 1
    gt_inc = (game_type or 'mines').lower()
    if gt_inc == 'crash':
        plan_info['predictions_today_crash'] = (plan_info.get('predictions_today_crash', 0) or 0) + 1
    elif gt_inc == 'blackjack':
        plan_info['predictions_today_blackjack'] = (plan_info.get('predictions_today_blackjack', 0) or 0) + 1
    elif gt_inc == 'moles':
        plan_info['predictions_today_moles'] = (plan_info.get('predictions_today_moles', 0) or 0) + 1
    else:
        plan_info['predictions_today_mines'] = (plan_info.get('predictions_today_mines', 0) or 0) + 1

    # Keep legacy field in sync
    plan_info['predictions_today'] = plan_info.get('predictions_today_total', 0) or 0
    
    users[user_id_str]['plan'] = plan_info
    
    write_users(users)

    try:
        user = users.get(user_id_str) or {}
        username = user.get('email') or user.get('username')
        if username:
            effective_plan_info = get_user_plan(user_id)
            plan_type = effective_plan_info.get('plan', 'demo')
            payload = {
                "username": username,
                "email": username if '@' in str(username) else None,
                "type": (game_type or 'mines').lower(),
                "source": "telegram",
                "plan": plan_type
            }
            try:
                requests.post(
                    f"{BACKEND_URL}/track-prediction",
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=4
                )
            except Exception as e:
                print(f"Error sending prediction tracking to backend: {e}")
    except Exception as e:
        print(f"Error preparing prediction tracking payload: {e}")


def get_demo_usage_counts(user_id):
    plan_info = get_user_plan(user_id)
    return {
        'total': plan_info.get('predictions_today_total', plan_info.get('predictions_today', 0)) or 0,
        'mines': plan_info.get('predictions_today_mines', 0) or 0,
        'crash': plan_info.get('predictions_today_crash', 0) or 0,
        'blackjack': plan_info.get('predictions_today_blackjack', 0) or 0,
        'moles': plan_info.get('predictions_today_moles', 0) or 0
    }


def format_demo_limit_message(game_type='mines', counts=None):
    counts = counts or {}
    total = counts.get('total', 0) or 0
    mines = counts.get('mines', 0) or 0
    crash = counts.get('crash', 0) or 0
    blackjack = counts.get('blackjack', 0) or 0
    moles = counts.get('moles', 0) or 0
    reason = (counts.get('reason') or '').lower()

    if reason == 'mines':
        reason_line = "Mines limit reached for today."
    elif reason == 'crash':
        reason_line = "Crash limit reached for today."
    elif reason == 'blackjack':
        reason_line = "Blackjack limit reached for today."
    elif reason == 'moles':
        reason_line = "Moles limit reached for today."
    elif reason == 'total':
        reason_line = "Total Free limit reached for today."
    else:
        reason_line = "Free limit reached."

    return (
        f"* Aborted, Limit Reached*\n\n"
        f"{reason_line}\n"
        f"• Mines: {mines}/{DEMO_MINES_LIMIT_PER_DAY}\n"
        f"• Crash: {crash}/{DEMO_CRASH_LIMIT_PER_DAY}\n"
        f"• Blackjack: {blackjack}/{DEMO_BLACKJACK_LIMIT_PER_DAY}\n"
        f"• Moles: {moles}/{DEMO_MOLES_LIMIT_PER_DAY}\n"
        f"• Total: {total}/{DEMO_TOTAL_LIMIT_PER_DAY}\n\n"
        f"Limits reset automatically every {DEMO_RESET_INTERVAL_HOURS} hours."
    )


def format_demo_limit_popup(game_type='mines', counts=None):
    counts = counts or {}
    total = counts.get('total', 0) or 0
    mines = counts.get('mines', 0) or 0
    crash = counts.get('crash', 0) or 0
    blackjack = counts.get('blackjack', 0) or 0
    moles = counts.get('moles', 0) or 0
    reason = (counts.get('reason') or '').lower()
    if reason == 'mines':
        return f"Today's Mines limit reached ({mines}/{DEMO_MINES_LIMIT_PER_DAY})."
    if reason == 'crash':
        return f"Today's Crash limit reached ({crash}/{DEMO_CRASH_LIMIT_PER_DAY})."
    if reason == 'blackjack':
        return f"Today's Blackjack limit reached ({blackjack}/{DEMO_BLACKJACK_LIMIT_PER_DAY})."
    if reason == 'moles':
        return f"Today's Moles limit reached ({moles}/{DEMO_MOLES_LIMIT_PER_DAY})."
    if reason == 'total':
        return f"Today's Total limit reached ({total}/{DEMO_TOTAL_LIMIT_PER_DAY})."
    return "Today's Free limit reached."


def delete_message_after_delay(chat_id, message_id, delay_seconds=10):
    def _worker():
        try:
            time.sleep(delay_seconds)
            bot.delete_message(chat_id, message_id)
        except:
            pass
    threading.Thread(target=_worker, daemon=True).start()


def handle_demo_limit_reached(user_id, game_type='mines', counts=None, schedule_last_prediction_delete=False):
    resolved_counts = dict(counts or {})
    if not resolved_counts:
        can_gen, resolved_counts = can_generate_prediction(user_id, game_type=game_type)
    if schedule_last_prediction_delete:
        last_msg_id = user_data.get(user_id, {}).get('last_prediction_msg_id')
        if last_msg_id:
            delete_message_after_delay(user_id, last_msg_id, delay_seconds=10)
    bot.send_message(user_id, format_demo_limit_message(game_type=game_type, counts=resolved_counts), parse_mode='Markdown')


def reset_demo_plan_window(plan_info, now=None, force=False):
    if plan_info.get('plan') != 'demo':
        return False
    now = now or datetime.now()
    window_start = plan_info.get('limit_window_started_at')
    window_dt = safe_parse_datetime(window_start) if window_start else None
    should_reset = force
    if window_dt and (now - window_dt >= timedelta(hours=DEMO_RESET_INTERVAL_HOURS)):
        should_reset = True
    if should_reset:
        plan_info['predictions_today_total'] = 0
        plan_info['predictions_today_mines'] = 0
        plan_info['predictions_today_crash'] = 0
        plan_info['predictions_today_blackjack'] = 0
        plan_info['predictions_today_moles'] = 0
        plan_info['predictions_today'] = 0
        plan_info['limit_window_started_at'] = now.isoformat()
        plan_info['last_prediction_date'] = now.date().isoformat()
        return True
    if 'limit_window_started_at' not in plan_info:
        plan_info['limit_window_started_at'] = None
    return False


def reset_demo_limits_for_all_users(force=False):
    users = load_users()
    now = datetime.now()
    changed = False
    for user_id_str, user in users.items():
        plan_info = user.get('plan')
        if not isinstance(plan_info, dict):
            continue
        if reset_demo_plan_window(plan_info, now=now, force=force):
            user['plan'] = plan_info
            users[user_id_str] = user
            changed = True
    if changed:
        write_users(users)
    return changed


def run_demo_limit_maintenance():
    while True:
        try:
            reset_demo_limits_for_all_users(force=False)
        except Exception as e:
            print(f"Error in demo limit maintenance: {e}")
        time.sleep(DEMO_RESET_CHECK_INTERVAL_SECONDS)


def _load_preferred_font(size):
    """Best-effort font loader across common Linux/Windows deployments."""
    font_candidates = [
        # Linux common
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
        # Windows common (if running locally)
        "arial.ttf",
        "Arial.ttf",
    ]
    for fp in font_candidates:
        try:
            return ImageFont.truetype(fp, size)
        except:
            continue
    return ImageFont.load_default()


def _draw_rocket_icon(draw, x, y, size, color=(255, 255, 255)):
    """Draw a simple rocket icon (no emoji/font dependency)."""
    # Body
    body_w = int(size * 0.45)
    body_h = int(size * 0.70)
    body_x1 = x + int(size * 0.20)
    body_y1 = y + int(size * 0.18)
    body_x2 = body_x1 + body_w
    body_y2 = body_y1 + body_h
    draw.rounded_rectangle([body_x1, body_y1, body_x2, body_y2], radius=int(size * 0.10), outline=color, width=max(2, size // 18))

    # Nose cone
    nose = [
        (body_x1, body_y1),
        (body_x2, body_y1),
        (x + size // 2, y),
    ]
    draw.polygon(nose, outline=color)

    # Fins
    fin_h = int(size * 0.22)
    left_fin = [
        (body_x1, body_y2 - fin_h),
        (body_x1 - int(size * 0.16), body_y2),
        (body_x1, body_y2),
    ]
    right_fin = [
        (body_x2, body_y2 - fin_h),
        (body_x2 + int(size * 0.16), body_y2),
        (body_x2, body_y2),
    ]
    draw.polygon(left_fin, outline=color)
    draw.polygon(right_fin, outline=color)

    # Window
    win_r = int(size * 0.09)
    cx = x + size // 2
    cy = y + int(size * 0.42)
    draw.ellipse([cx - win_r, cy - win_r, cx + win_r, cy + win_r], outline=color, width=max(2, size // 22))


def generate_crash_image(multiplier):
    """Generate a mines-style background image with big '🚀 1.50X' text."""
    try:
        # Bigger image
        width, height = 1200, 700

        # Use the same background style as mines (dark black -> green gradient)
        # Stronger green so it doesn't look pure black in Telegram preview
        img = create_gradient_background(width, height, max_green=85)
        draw = ImageDraw.Draw(img)

        # Big text like:
        # 🚀 1.50×
        # Use multiplication sign × (not letter X)
        value_text = f"{float(multiplier):.2f}×"

        # Large font (fallback safe)
        value_font = _load_preferred_font(160)

        # Draw a rocket icon so it's never missing (emoji fonts are not always available)
        rocket_size = 150
        icon_gap = 28

        # Measure text
        bbox = draw.textbbox((0, 0), value_text, font=value_font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        total_w = rocket_size + icon_gap + tw
        x0 = (width - total_w) / 2
        y0 = (height - max(th, rocket_size)) / 2

        # Icon
        _draw_rocket_icon(draw, int(x0), int(y0 + (max(th, rocket_size) - rocket_size) / 2), rocket_size, color=(255, 255, 255))

        # Text to the right of icon
        x = x0 + rocket_size + icon_gap
        y = y0 + (max(th, rocket_size) - th) / 2

        # Subtle shadow for readability
        shadow_offset = 4
        draw.text((x + shadow_offset, y + shadow_offset), value_text, fill=(0, 0, 0), font=value_font)
        draw.text((x, y), value_text, fill=(255, 255, 255), font=value_font)

        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        return img_bytes
    except Exception as e:
        print(f"Error generating crash image: {e}")
        # Fallback minimal image
        img = Image.new('RGB', (600, 300), color=(0, 0, 0))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        return img_bytes


def fetch_crash_prediction_from_backend(api_token):
    """Fetch crash prediction. Prefer /get_prediction (extension path). Fallback to /crash_predict (direct).
    Returns (safe_pred, medium_pred, hist, error_msg)."""
    # 1) Try extension cache/push path
    try:
        response = requests.post(
            f"{BACKEND_URL}/get_prediction",
            json={"token": api_token},
            headers={"Content-Type": "application/json"},
            timeout=6
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success' and data.get('prediction'):
                prediction = data['prediction']
                if prediction.get('game_type') == 'crash' and prediction.get('predictions'):
                    preds = prediction.get('predictions', {})
                    hist = prediction.get('historical_data', {}) or {}
                    safe_pred = preds.get('safe_prediction')
                    medium_pred = preds.get('medium_prediction')
                    if safe_pred is not None:
                        return float(safe_pred), float(medium_pred) if medium_pred is not None else None, hist, None
            elif data.get('status') == 'waiting':
                return None, None, None, "Waiting for prediction from extension..."
    except Exception as e:
        print(f"Error fetching crash prediction (/get_prediction): {e}")
        return None, None, None, f"Connection error: {e}"

    # 2) Fallback to direct crash predictor
    try:
        response = requests.post(
            f"{BACKEND_URL}/crash_predict",
            json={"access_token": api_token},
            headers={"Content-Type": "application/json"},
            timeout=8
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success' and data.get('predictions'):
                preds = data.get('predictions', {})
                hist = data.get('historical_data', {}) or {}
                safe_pred = preds.get('safe_prediction')
                medium_pred = preds.get('medium_prediction')
                if safe_pred is not None:
                    return float(safe_pred), float(medium_pred) if medium_pred is not None else None, hist, None
            elif data.get('status') == 'error':
                err = data.get('error', 'Unknown error')
                return None, None, None, err
    except Exception as e:
        print(f"Error fetching crash prediction (/crash_predict): {e}")
        return None, None, None, f"Connection error: {e}"

    return None, None, None, "No crash history received yet. Play a few crash rounds on Stake first, then restart."


def generate_key(plan_type, duration_str):
    """Generate activation key for a plan"""
    # Parse duration (e.g., "1min", "1h", "1d", "1m", "1w", "1y")
    duration_match = re.match(r'(\d+)(min|h|d|w|m|y)', duration_str.lower())
    if not duration_match:
        return None, "Invalid duration format. Use: 1min, 1h, 1d, 1w, 1m, 1y"
    
    amount, unit = duration_match.groups()
    amount = int(amount)
    
    # Convert to days (stored as days, but can be fractional)
    if unit == 'min':
        days = amount / (24 * 60)  # minutes to days
    elif unit == 'h':
        days = amount / 24  # hours to days
    elif unit == 'd':
        days = amount
    elif unit == 'w':
        days = amount * 7
    elif unit == 'm':
        days = amount * 30  # months to days
    elif unit == 'y':
        days = amount * 365
    else:
        return None, "Invalid duration unit. Use: min, h, d, w, m, y"
    
    # Generate random key
    key = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
    
    keys_data = load_keys()
    keys_data['keys'][key] = {
        'plan': plan_type,
        'duration_days': days,
        'duration_str': duration_str.lower(),  # Store original string for display
        'created_at': datetime.now().isoformat(),
        'used_by': None,
        'used_at': None
    }
    save_keys(keys_data)
    
    return key, None


def activate_key(user_id, key):
    """Activate a plan key for user"""
    keys_data = load_keys()
    
    if key not in keys_data['keys']:
        return False, "Invalid activation key"
    
    key_info = keys_data['keys'][key]
    
    if key_info['used_by']:
        return False, "This key has already been used"
    
    # Activate plan
    update_user_plan(user_id, key_info['plan'], key_info['duration_days'])
    
    # Mark key as used
    key_info['used_by'] = user_id
    key_info['used_at'] = datetime.now().isoformat()
    keys_data['keys'][key] = key_info
    
    # Track in users
    if 'users' not in keys_data:
        keys_data['users'] = {}
    keys_data['users'][str(user_id)] = {
        'key': key,
        'plan': key_info['plan'],
        'activated_at': datetime.now().isoformat()
    }
    
    save_keys(keys_data)
    return True, None


def validate_server_seed(seed):
    """Validate server seed: 64 chars, letters and numbers, min 10 letters and 10 numbers"""
    if len(seed) != 64:
        return False, "Server seed must be exactly 64 characters"
    
    letters = sum(1 for c in seed if c.isalpha())
    numbers = sum(1 for c in seed if c.isdigit())
    
    if letters < 10:
        return False, "Server seed must contain at least 10 letters"
    if numbers < 10:
        return False, "Server seed must contain at least 10 numbers"
    
    if not all(c.isalnum() for c in seed):
        return False, "Server seed must contain only letters and numbers"
    
    return True, None


def validate_client_seed(seed):
    """Validate client seed: 10 chars, letters and numbers"""
    if len(seed) != 10:
        return False, "Client seed must be exactly 10 characters"
    
    if not all(c.isalnum() for c in seed):
        return False, "Client seed must contain only letters and numbers"
    
    return True, None


def generate_manual_prediction(mines_count):
    """Generate manual prediction with random gems based on mines count"""
    # Determine gem count based on mines
    gem_ranges = {
        1: (8, 14),  # 8-14 gems
        2: (4, 7),   # 4-7 gems
        3: (4, 6),   # 4-6 gems
        4: (3, 5),   # 3-5 gems
        5: (2, 4),   # 2-4 gems
        6: (1, 3)    # 1-3 gems
    }
    
    if mines_count not in gem_ranges:
        mines_count = 1
    
    min_gems, max_gems = gem_ranges[mines_count]
    gem_count = random.randint(min_gems, max_gems)
    
    # Generate random positions
    all_positions = list(range(25))
    random.shuffle(all_positions)
    
    # Select gem positions (no mines, just gems and empty)
    gems = all_positions[:gem_count]
    mines = []  # No mines shown in manual predictions
    
    return mines, gems


def create_gradient_background(width, height, max_green=30):
    """Create a dark black to green gradient background.

    max_green controls the bottom green intensity (0-255).
    """
    img = Image.new('RGB', (width, height), color='#000000')
    draw = ImageDraw.Draw(img)
    
    # Create gradient from black (top) to dark green (bottom)
    for y in range(height):
        # Calculate green intensity (0 at top, max at bottom)
        # Using a more visible green gradient
        progress = y / height
        green_intensity = int(progress * int(max_green))  # Dark green at bottom
        color = (0, green_intensity, 0)
        draw.line([(0, y), (width, y)], fill=color)
    
    return img


def generate_grid_image(mines_location, gems_location, show_bombs=True):
    """
    Generate a grid image showing mines and gems locations
    Grid is 5x5 (25 tiles total) - using actual gem.jpg and mine.jpg images
    show_bombs: If False, only show gems (for Demo/Silver plans)
    """
    # Image dimensions - increased tile size, reduced gap
    tile_size = 115
    gap = 4
    padding = 50
    grid_width = GRID_SIZE * tile_size + (GRID_SIZE - 1) * gap + 2 * padding
    grid_height = GRID_SIZE * tile_size + (GRID_SIZE - 1) * gap + 2 * padding + 80  # Extra for text
    
    # Create image with dark black + green gradient background
    img = create_gradient_background(grid_width, grid_height, max_green=30)
    draw = ImageDraw.Draw(img)
    
    # Calculate grid start position
    start_y = 70
    
    # Reload images if needed (in case they weren't loaded)
    if gem_img is None or mine_img is None:
        load_images()
    
    # Prepare resized gem and mine images with black background (do this once before the loop)
    gem_resized = None
    mine_resized = None
    
    if gem_img:
        # Resize gem image to fit in tile
        gem_resized = gem_img.copy().resize((int(tile_size * 0.85), int(tile_size * 0.85)), Image.Resampling.LANCZOS)
        # Convert to RGBA
        if gem_resized.mode != 'RGBA':
            gem_resized = gem_resized.convert('RGBA')
        
        # Replace white/light pixels with black background
        pixels = gem_resized.load()
        width, height = gem_resized.size
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                # If pixel is white or very light (threshold 200), make it black
                if r > 200 and g > 200 and b > 200:
                    pixels[x, y] = (0, 0, 0, 255)  # Black
        
        # Create black background and paste gem on it
        gem_with_bg = Image.new('RGBA', gem_resized.size, (0, 0, 0, 255))
        gem_with_bg.paste(gem_resized, (0, 0), gem_resized)
        gem_resized = gem_with_bg
    
    if mine_img:
        # Resize mine image to fit in tile - use as-is, no background changes
        mine_resized = mine_img.copy().resize((int(tile_size * 0.85), int(tile_size * 0.85)), Image.Resampling.LANCZOS)
        # Convert to RGBA if needed for transparency
        if mine_resized.mode != 'RGBA':
            mine_resized = mine_resized.convert('RGBA')
    
    # Draw grid with dark grey background (start_y already calculated above)
    for row in range(GRID_SIZE):
        for col in range(GRID_SIZE):
            tile_index = row * GRID_SIZE + col
            x = padding + col * (tile_size + gap)
            y = start_y + row * (tile_size + gap)
            
            # Determine tile type
            is_mine = tile_index in mines_location
            is_gem = tile_index in gems_location
            
            # Draw tile background (dark grey rectangle)
            draw.rectangle([x, y, x + tile_size, y + tile_size], fill='#2C2C2C', outline='#1A1A1A', width=2)
            
            # Draw gem or mine using actual images
            if is_gem and gem_resized:
                # Paste gem image centered in tile
                gem_x = x + (tile_size - gem_resized.width) // 2
                gem_y = y + (tile_size - gem_resized.height) // 2
                img.paste(gem_resized, (gem_x, gem_y), gem_resized)
                
            elif is_mine and mine_resized and show_bombs:
                # Only show mine if show_bombs is True (for Diamond plan)
                # For Demo/Silver, mines are not shown (blank tiles)
                mine_x = x + (tile_size - mine_resized.width) // 2
                mine_y = y + (tile_size - mine_resized.height) // 2
                img.paste(mine_resized, (mine_x, mine_y), mine_resized)
    
    # Convert to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes


def fetch_auto_locations(username):
    """Fetch auto-generated mines and gems locations from API (for Diamond plan)"""
    try:
        response = requests.post(
            f"{BACKEND_URL}/mines_get_auto_locations",
            json={"stake_username": username},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                mines = data.get('auto_mines_location', [])
                gems = data.get('auto_gems_location', [])
                return mines, gems
    except Exception as e:
        print(f"Error fetching locations: {e}")
    return None, None


def fetch_prediction_from_backend(api_token):
    """Fetch prediction from backend using API token (for Demo/Silver plans)"""
    try:
        response = requests.post(
            f"{BACKEND_URL}/get_prediction",
            json={"token": api_token},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success' and data.get('prediction'):
                prediction = data['prediction']
                if prediction.get('game_type') == 'mines':
                    gems = prediction.get('gems', [])
                    bombs = prediction.get('bombs', [])
                    mines_count = prediction.get('mines_count', 3)
                    return gems, bombs, mines_count
            elif data.get('status') == 'waiting':
                # No active bet yet
                return None, None, None
    except Exception as e:
        print(f"Error fetching prediction: {e}")
    return None, None, None


def fetch_blackjack_prediction_from_backend(api_token):
    """Fetch live blackjack basic-strategy payload from /get_prediction (extension path)."""
    try:
        response = requests.post(
            f"{BACKEND_URL}/get_prediction",
            json={"token": api_token},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        if response.status_code != 200:
            return None, "Prediction service unavailable"
        data = response.json()
        if data.get('status') == 'success' and data.get('prediction'):
            prediction = data['prediction']
            if prediction.get('game_type') == 'blackjack':
                return prediction, None
            return None, None
        if data.get('status') == 'waiting':
            return None, None
        return None, None
    except Exception as e:
        print(f"Error fetching blackjack prediction: {e}")
        return None, str(e)


def fetch_moles_prediction_from_backend(api_token):
    """Fetch live moles predictor payload from /get_prediction (extension path)."""
    try:
        response = requests.post(
            f"{BACKEND_URL}/get_prediction",
            json={"token": api_token},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        if response.status_code != 200:
            return None, "Prediction service unavailable"
        data = response.json()
        if data.get('status') == 'success' and data.get('prediction'):
            prediction = data['prediction']
            if prediction.get('game_type') == 'moles':
                return prediction, None
            return None, None
        if data.get('status') == 'waiting':
            return None, None
        return None, None
    except Exception as e:
        print(f"Error fetching moles prediction: {e}")
        return None, str(e)


def blackjack_prediction_signature(pred):
    """Stable fingerprint so we only notify when table state / advice changes."""
    try:
        hands = pred.get('player_hands') or []
        sig_hands = []
        for h in hands:
            rec = h.get('recommendation') or {}
            cards = h.get('cards') or []
            sig_hands.append({
                'c': [[c.get('rank'), c.get('suit')] for c in cards],
                'a': rec.get('action'),
                't': rec.get('player_total'),
            })
        dealer = pred.get('dealer_cards') or []
        key = {
            'bid': pred.get('bet_id'),
            'd': [[c.get('rank'), c.get('suit')] for c in dealer],
            'h': sig_hands,
        }
        return json.dumps(key, sort_keys=True, separators=(',', ':'))
    except Exception:
        return str(pred.get('bet_id') or '') + str(time.time())


def moles_prediction_signature(pred):
    """Stable fingerprint so we only notify on new round/state changes."""
    try:
        last_result = pred.get('last_result') or {}
        key = {
            'bid': pred.get('bet_id'),
            'r': pred.get('current_round'),
            'lr': last_result.get('round_index') if isinstance(last_result, dict) else None,
        }
        return json.dumps(key, sort_keys=True, separators=(',', ':'))
    except Exception:
        return str(pred.get('bet_id') or '') + str(pred.get('current_round') or '') + str(time.time())


def format_blackjack_advice_text(pred):
    """Plain-text coach summary for Telegram (avoids Markdown parse errors)."""
    lines = ['Blackjack coach', '']
    if pred.get('strategy'):
        lines.append(f"Strategy: {pred['strategy']}")
    amt = pred.get('bet_amount')
    cur = (pred.get('currency') or '')
    if amt is not None:
        lines.append(f"Bet: {amt} {str(cur).upper()}".strip())
    bid = pred.get('bet_id')
    if bid:
        lines.append(f"Bet id: {bid}")
    for i, hand in enumerate(pred.get('player_hands') or []):
        cards = hand.get('cards') or []
        cs = ' '.join(f"{c.get('rank', '?')}{c.get('suit', '')}" for c in cards)
        rec = hand.get('recommendation') or {}
        act = (rec.get('action') or '—')
        tot = rec.get('player_total')
        if tot is None:
            tot = hand.get('computed_total', hand.get('value'))
        lines.append(f"Hand {i + 1}: {cs}  |  total {tot}  →  {str(act).upper()}")
    dealer = pred.get('dealer_cards') or []
    if dealer:
        ds = ' '.join(f"{c.get('rank', '?')}{c.get('suit', '')}" for c in dealer)
        lines.append('')
        lines.append(f"Dealer: {ds}")
    dv = pred.get('dealer_up_value')
    dr = pred.get('dealer_up_rank')
    if dr:
        lines.append(f"Dealer up-card: {dr} (value {dv})")
    lines.append('')
    lines.append('Play on Stake with the connector linked.')
    return '\n'.join(lines)


def format_moles_advice_text(pred):
    """Compact Markdown moles summary for Telegram."""
    predicted_hole = pred.get('predicted_hole')
    current_round = pred.get('current_round')
    lines = ['🕳️ Moles Predictor', '']

    if isinstance(predicted_hole, int):
        lines.append(f"Prediction: Hole {predicted_hole + 1}")
    else:
        lines.append("Prediction: Waiting...*")

    if current_round is not None:
        lines.append(f"Round: {current_round}")

    bid = pred.get('bet_id')
    if bid:
        lines.append(f"Bet id: {bid}")

    last_result = pred.get('last_result') or pred.get('last_round_result') or {}
    if isinstance(last_result, dict) and isinstance(last_result.get('hit'), bool):
        label = 'Win' if last_result.get('hit') else 'Lose'
        pick = last_result.get('pick')
        if isinstance(pick, int) and 0 <= pick <= 6:
            label += f" | Pick H{pick + 1}"
        lines.append(f"Last result: {label}")

    hole_icons = ['🔴'] * 7
    if isinstance(predicted_hole, int) and 0 <= predicted_hole <= 6:
        hole_icons[predicted_hole] = '🟢'

    grid_lines = [
        f"      {hole_icons[0]}       {hole_icons[1]}",
        f" {hole_icons[2]}    {hole_icons[3]}     {hole_icons[4]}",
        f"      {hole_icons[5]}      {hole_icons[6]}",
    ]

    lines.append('')
    lines.append("")
    lines.extend(grid_lines)
    lines.append("")
    return '\n'.join(lines)


def poll_and_send(user_id, username=None, api_token=None, predictor='mines'):
    """Poll API and send images when locations are detected (mines) or crash predictions."""
    last_mines = []
    last_gems = []
    last_crash_signature = None
    last_blackjack_signature = None
    last_moles_signature = None
    last_counted_moles_round_key = None
    plan_info = get_user_plan(user_id)
    plan_type = plan_info['plan']
    predictor = (predictor or 'mines').lower()
    
    while (user_id in user_data and 
           user_data[user_id].get('is_polling', False)):
        
        # Diamond plan currently supports mines only (username-based)
        if predictor == 'crash' and plan_type == 'diamond':
            # Not supported with username-only mode
            user_data[user_id]['is_polling'] = False
            bot.send_message(user_id, "Crash predictor is not available on username-only connection. Please connect using the API token (extension).", parse_mode='Markdown')
            break

        if predictor == 'blackjack' and plan_type == 'diamond':
            user_data[user_id]['is_polling'] = False
            bot.send_message(user_id, "Blackjack predictor is not available on username-only connection. Please connect using the API token (extension).", parse_mode='Markdown')
            break

        if predictor == 'moles' and plan_type == 'diamond':
            user_data[user_id]['is_polling'] = False
            bot.send_message(user_id, "Moles predictor is not available on username-only connection. Please connect using the API token (extension).", parse_mode='Markdown')
            break

        if predictor == 'mines' and plan_type == 'diamond' and username:
            # Diamond plan: use username-based polling
            mines, gems = fetch_auto_locations(username)
            mines_count = None
            
            if mines is not None and gems is not None:
                # Check if locations changed
                mines_changed = sorted(mines) != sorted(last_mines)
                gems_changed = sorted(gems) != sorted(last_gems)
                
                if (mines_changed or gems_changed) and (len(mines) > 0 or len(gems) > 0):
                    # Delete previous prediction message if exists
                    if 'last_prediction_msg_id' in user_data[user_id]:
                        try:
                            bot.delete_message(user_id, user_data[user_id]['last_prediction_msg_id'])
                        except:
                            pass
                    
                    # Generate and send image
                    img_bytes = generate_grid_image(mines, gems)
                    
                    try:
                        # Create keyboard with stop button
                        keyboard = types.InlineKeyboardMarkup()
                        stop_btn = types.InlineKeyboardButton("Stop AUTO Predictions", callback_data=f"stop_{user_id}")
                        keyboard.add(stop_btn)
                        
                        # Send photo with stop button (no caption)
                        sent_msg = bot.send_photo(user_id, img_bytes, reply_markup=keyboard)
                        
                        # Store last prediction message ID for auto-deletion
                        user_data[user_id]['last_prediction_msg_id'] = sent_msg.message_id
                        
                        # Also keep in message_ids list for manual deletion on stop
                        if 'message_ids' not in user_data[user_id]:
                            user_data[user_id]['message_ids'] = []
                        user_data[user_id]['message_ids'].append(sent_msg.message_id)
                        
                        last_mines = mines.copy()
                        last_gems = gems.copy()
                        user_data[user_id]['last_mines'] = mines
                        user_data[user_id]['last_gems'] = gems
                    except Exception as e:
                        print(f"Error sending photo: {e}")
        
        elif predictor == 'mines' and plan_type in ('demo', 'silver', 'gold', 'turbo') and api_token:
            # Demo/Silver mines: use API token-based polling (from extension)
            gems, bombs, mines_count = fetch_prediction_from_backend(api_token)
            
            if gems is not None and bombs is not None and mines_count is not None:
                # Check if gems/bombs changed (new bet detected)
                gems_changed = sorted(gems) != sorted(last_gems)
                bombs_changed = sorted(bombs) != sorted(last_mines)
                
                if gems_changed or bombs_changed:
                    if plan_type == 'demo':
                        can_gen, counts = can_generate_prediction(user_id, game_type='mines')
                        if not can_gen:
                            user_data[user_id]['is_polling'] = False
                            handle_demo_limit_reached(
                                user_id,
                                game_type='mines',
                                counts=counts,
                                schedule_last_prediction_delete=True
                            )
                            break
                    
                    # Delete previous prediction message if exists
                    if 'last_prediction_msg_id' in user_data[user_id]:
                        try:
                            bot.delete_message(user_id, user_data[user_id]['last_prediction_msg_id'])
                        except:
                            pass
                    
                    # Generate and send image (bombs are mines, but don't show bombs for Demo/Silver)
                    img_bytes = generate_grid_image(bombs, gems, show_bombs=False)  # bombs = mines location, gems = gems location, show_bombs=False for Demo/Silver
                    
                    try:
                        # Create keyboard with stop button
                        keyboard = types.InlineKeyboardMarkup()
                        stop_btn = types.InlineKeyboardButton("Stop AUTO Predictions", callback_data=f"stop_{user_id}")
                        keyboard.add(stop_btn)
                        
                        # Send photo with caption showing mines count
                        caption = f"Mines: {mines_count} | Gems: {len(gems)}"
                        sent_msg = bot.send_photo(user_id, img_bytes, caption=caption, reply_markup=keyboard)
                        
                        # Store last prediction message ID for auto-deletion
                        user_data[user_id]['last_prediction_msg_id'] = sent_msg.message_id
                        
                        # Also keep in message_ids list for manual deletion on stop
                        if 'message_ids' not in user_data[user_id]:
                            user_data[user_id]['message_ids'] = []
                        user_data[user_id]['message_ids'].append(sent_msg.message_id)
                        
                        last_mines = bombs.copy()
                        last_gems = gems.copy()
                        user_data[user_id]['last_mines'] = bombs
                        user_data[user_id]['last_gems'] = gems
                        
                        increment_prediction_count(user_id, game_type='mines')
                        if plan_type == 'demo':
                            latest_counts = get_demo_usage_counts(user_id)
                            if latest_counts.get('total', 0) >= DEMO_TOTAL_LIMIT_PER_DAY:
                                latest_counts['reason'] = 'total'
                                user_data[user_id]['is_polling'] = False
                                handle_demo_limit_reached(
                                    user_id,
                                    game_type='mines',
                                    counts=latest_counts,
                                    schedule_last_prediction_delete=True
                                )
                                break
                            if latest_counts.get('mines', 0) >= DEMO_MINES_LIMIT_PER_DAY:
                                latest_counts['reason'] = 'mines'
                                user_data[user_id]['is_polling'] = False
                                handle_demo_limit_reached(
                                    user_id,
                                    game_type='mines',
                                    counts=latest_counts,
                                    schedule_last_prediction_delete=True
                                )
                                break
                    except Exception as e:
                        print(f"Error sending photo: {e}")

        elif predictor == 'crash' and plan_type in ('demo', 'silver', 'gold', 'turbo') and api_token:
            safe_pred, medium_pred, hist, err = fetch_crash_prediction_from_backend(api_token)
            if safe_pred is not None:
                last_crash_error_msg = None
                if user_data[user_id].get('last_crash_error_msg'):
                    try:
                        bot.delete_message(user_id, user_data[user_id]['last_crash_error_msg'])
                    except:
                        pass
                    user_data[user_id]['last_crash_error_msg'] = None

                sig = None
                try:
                    crash_points = (hist or {}).get('crash_points', None)
                    if crash_points and isinstance(crash_points, list) and len(crash_points) > 0:
                        sig = f"cp:{float(crash_points[0]):.4f}"
                except:
                    pass
                if sig is None:
                    sig = f"sp:{float(safe_pred):.4f}"

                if sig != last_crash_signature:
                    if plan_type == 'demo':
                        can_gen, counts = can_generate_prediction(user_id, game_type='crash')
                        if not can_gen:
                            user_data[user_id]['is_polling'] = False
                            handle_demo_limit_reached(
                                user_id,
                                game_type='crash',
                                counts=counts,
                                schedule_last_prediction_delete=True
                            )
                            break

                    if 'last_prediction_msg_id' in user_data[user_id]:
                        try:
                            bot.delete_message(user_id, user_data[user_id]['last_prediction_msg_id'])
                        except:
                            pass

                    img_bytes = generate_crash_image(safe_pred)
                    try:
                        keyboard = types.InlineKeyboardMarkup()
                        stop_btn = types.InlineKeyboardButton("Stop AUTO Predictions", callback_data=f"stop_{user_id}")
                        keyboard.add(stop_btn)

                        sent_msg = bot.send_photo(user_id, img_bytes, reply_markup=keyboard)

                        user_data[user_id]['last_prediction_msg_id'] = sent_msg.message_id
                        if 'message_ids' not in user_data[user_id]:
                            user_data[user_id]['message_ids'] = []
                        user_data[user_id]['message_ids'].append(sent_msg.message_id)

                        last_crash_signature = sig

                        increment_prediction_count(user_id, game_type='crash')
                        if plan_type == 'demo':
                            latest_counts = get_demo_usage_counts(user_id)
                            if latest_counts.get('total', 0) >= DEMO_TOTAL_LIMIT_PER_DAY:
                                latest_counts['reason'] = 'total'
                                user_data[user_id]['is_polling'] = False
                                handle_demo_limit_reached(
                                    user_id,
                                    game_type='crash',
                                    counts=latest_counts,
                                    schedule_last_prediction_delete=True
                                )
                                break
                            if latest_counts.get('crash', 0) >= DEMO_CRASH_LIMIT_PER_DAY:
                                latest_counts['reason'] = 'crash'
                                user_data[user_id]['is_polling'] = False
                                handle_demo_limit_reached(
                                    user_id,
                                    game_type='crash',
                                    counts=latest_counts,
                                    schedule_last_prediction_delete=True
                                )
                                break
                    except Exception as e:
                        print(f"Error sending crash photo: {e}")
            elif err:
                if not user_data[user_id].get('last_crash_error_msg') or \
                   user_data[user_id].get('last_crash_error_shown_at', 0) < time.time() - 60:
                    try:
                        err_msg = bot.send_message(
                            user_id,
                            f"*Crash Prediction Unavailable*\n\n{err}\n\n_Auto-retrying..._",
                            parse_mode='Markdown'
                        )
                        user_data[user_id]['last_crash_error_msg'] = err_msg.message_id
                        user_data[user_id]['last_crash_error_shown_at'] = time.time()
                    except:
                        pass

        elif predictor == 'blackjack' and plan_type in ('demo', 'silver', 'gold', 'turbo') and api_token:
            pred, bj_err = fetch_blackjack_prediction_from_backend(api_token)
            if pred:
                if user_data[user_id].get('last_blackjack_error_msg'):
                    try:
                        bot.delete_message(user_id, user_data[user_id]['last_blackjack_error_msg'])
                    except Exception:
                        pass
                    user_data[user_id]['last_blackjack_error_msg'] = None

                sig = blackjack_prediction_signature(pred)
                if sig != last_blackjack_signature:
                    if plan_type == 'demo':
                        can_gen, counts = can_generate_prediction(user_id, game_type='blackjack')
                        if not can_gen:
                            user_data[user_id]['is_polling'] = False
                            handle_demo_limit_reached(
                                user_id,
                                game_type='blackjack',
                                counts=counts,
                                schedule_last_prediction_delete=True
                            )
                            break

                    if 'last_prediction_msg_id' in user_data[user_id]:
                        try:
                            bot.delete_message(user_id, user_data[user_id]['last_prediction_msg_id'])
                        except Exception:
                            pass

                    body = format_blackjack_advice_text(pred)
                    try:
                        keyboard = types.InlineKeyboardMarkup()
                        stop_btn = types.InlineKeyboardButton("Stop AUTO Predictions", callback_data=f"stop_{user_id}")
                        keyboard.add(stop_btn)

                        sent_msg = bot.send_message(user_id, body, reply_markup=keyboard, parse_mode='Markdown')

                        user_data[user_id]['last_prediction_msg_id'] = sent_msg.message_id
                        if 'message_ids' not in user_data[user_id]:
                            user_data[user_id]['message_ids'] = []
                        user_data[user_id]['message_ids'].append(sent_msg.message_id)

                        last_blackjack_signature = sig

                        increment_prediction_count(user_id, game_type='blackjack')
                        if plan_type == 'demo':
                            latest_counts = get_demo_usage_counts(user_id)
                            if latest_counts.get('total', 0) >= DEMO_TOTAL_LIMIT_PER_DAY:
                                latest_counts['reason'] = 'total'
                                user_data[user_id]['is_polling'] = False
                                handle_demo_limit_reached(
                                    user_id,
                                    game_type='blackjack',
                                    counts=latest_counts,
                                    schedule_last_prediction_delete=True
                                )
                                break
                            if latest_counts.get('blackjack', 0) >= DEMO_BLACKJACK_LIMIT_PER_DAY:
                                latest_counts['reason'] = 'blackjack'
                                user_data[user_id]['is_polling'] = False
                                handle_demo_limit_reached(
                                    user_id,
                                    game_type='blackjack',
                                    counts=latest_counts,
                                    schedule_last_prediction_delete=True
                                )
                                break
                    except Exception as e:
                        print(f"Error sending blackjack message: {e}")
            elif bj_err:
                if not user_data[user_id].get('last_blackjack_error_msg') or \
                   user_data[user_id].get('last_blackjack_error_shown_at', 0) < time.time() - 60:
                    try:
                        err_msg = bot.send_message(
                            user_id,
                            f"Blackjack coach unavailable\n\n{bj_err}\n\nAuto-retrying…",
                        )
                        user_data[user_id]['last_blackjack_error_msg'] = err_msg.message_id
                        user_data[user_id]['last_blackjack_error_shown_at'] = time.time()
                    except Exception:
                        pass
        
        elif predictor == 'moles' and plan_type in ('demo', 'silver', 'gold', 'turbo') and api_token:
            pred, moles_err = fetch_moles_prediction_from_backend(api_token)
            if pred:
                if user_data[user_id].get('last_moles_error_msg'):
                    try:
                        bot.delete_message(user_id, user_data[user_id]['last_moles_error_msg'])
                    except Exception:
                        pass
                    user_data[user_id]['last_moles_error_msg'] = None

                sig = moles_prediction_signature(pred)
                if sig != last_moles_signature:
                    if plan_type == 'demo':
                        can_gen, counts = can_generate_prediction(user_id, game_type='moles')
                        if not can_gen:
                            user_data[user_id]['is_polling'] = False
                            handle_demo_limit_reached(
                                user_id,
                                game_type='moles',
                                counts=counts,
                                schedule_last_prediction_delete=True
                            )
                            break

                    if 'last_prediction_msg_id' in user_data[user_id]:
                        try:
                            bot.delete_message(user_id, user_data[user_id]['last_prediction_msg_id'])
                        except Exception:
                            pass

                    body = format_moles_advice_text(pred)
                    try:
                        keyboard = types.InlineKeyboardMarkup()
                        stop_btn = types.InlineKeyboardButton("Stop AUTO Predictions", callback_data=f"stop_{user_id}")
                        keyboard.add(stop_btn)

                        sent_msg = bot.send_message(user_id, body, reply_markup=keyboard)

                        user_data[user_id]['last_prediction_msg_id'] = sent_msg.message_id
                        if 'message_ids' not in user_data[user_id]:
                            user_data[user_id]['message_ids'] = []
                        user_data[user_id]['message_ids'].append(sent_msg.message_id)

                        last_moles_signature = sig

                        last_res = pred.get('last_result') if isinstance(pred.get('last_result'), dict) else {}
                        moles_round_key = (
                            str(pred.get('bet_id') or ''),
                            pred.get('current_round'),
                            last_res.get('round_index') if isinstance(last_res, dict) else None
                        )
                        if moles_round_key != last_counted_moles_round_key:
                            increment_prediction_count(user_id, game_type='moles')
                            last_counted_moles_round_key = moles_round_key
                        if plan_type == 'demo':
                            latest_counts = get_demo_usage_counts(user_id)
                            if latest_counts.get('total', 0) >= DEMO_TOTAL_LIMIT_PER_DAY:
                                latest_counts['reason'] = 'total'
                                user_data[user_id]['is_polling'] = False
                                handle_demo_limit_reached(
                                    user_id,
                                    game_type='moles',
                                    counts=latest_counts,
                                    schedule_last_prediction_delete=True
                                )
                                break
                            if latest_counts.get('moles', 0) >= DEMO_MOLES_LIMIT_PER_DAY:
                                latest_counts['reason'] = 'moles'
                                user_data[user_id]['is_polling'] = False
                                handle_demo_limit_reached(
                                    user_id,
                                    game_type='moles',
                                    counts=latest_counts,
                                    schedule_last_prediction_delete=True
                                )
                                break
                    except Exception as e:
                        print(f"Error sending moles message: {e}")
            elif moles_err:
                if not user_data[user_id].get('last_moles_error_msg') or \
                   user_data[user_id].get('last_moles_error_shown_at', 0) < time.time() - 60:
                    try:
                        err_msg = bot.send_message(
                            user_id,
                            f"Moles predictor unavailable\n\n{moles_err}\n\nAuto-retrying…",
                        )
                        user_data[user_id]['last_moles_error_msg'] = err_msg.message_id
                        user_data[user_id]['last_moles_error_shown_at'] = time.time()
                    except Exception:
                        pass
        
        time.sleep(POLLING_INTERVAL)


def show_welcome_menu(chat_id, message_id=None):
    """Show welcome menu with buttons and plan info"""
    plan_info = get_user_plan(chat_id)
    dashboard_plan_name = format_plan_display_name(plan_info.get('dashboard_plan') or 'free')
    
    # Format plan info
    plan_text = f"*Subscription: {dashboard_plan_name}*"
    if plan_info.get('dashboard_plan_expires_at'):
        expires = safe_parse_datetime(plan_info['dashboard_plan_expires_at'])
        if expires:
            plan_text += f"\nExpires: {expires.strftime('%Y-%m-%d')}"
    
    welcome_text = f"""*👋 Soul AI Boat*

{plan_text}

✨ Real-time connection
✨ Crash . Blackjack . Moles . Mines
"""

    keyboard = types.InlineKeyboardMarkup(row_width=2)
    connect_btn = types.InlineKeyboardButton("🔌 Connect Stake", callback_data="connect")
    login_btn = types.InlineKeyboardButton("🔐 Access Panel", callback_data="login_email")
    profile_btn = types.InlineKeyboardButton("👤 Account", callback_data="profile")
    logout_btn = types.InlineKeyboardButton("❌ Logout", callback_data="logout")
    view_plans_btn = types.InlineKeyboardButton("💳 Plans", callback_data="view_plans")
    support_btn = types.InlineKeyboardButton("❔ Help", url="https://t.me/iorpx")
    
    # Sync plan from dashboard if user has login email
    sync_plan_from_dashboard(chat_id)
    
    plan_info = get_user_plan(chat_id)
    is_logged_in = bool(chat_id in user_data and user_data[chat_id].get('login_email'))
    
    if is_logged_in:
        # Logged in: Connect | Profile
        #            View Plans | Logout
        #            Support
        keyboard.add(connect_btn, profile_btn)
        keyboard.add(view_plans_btn, logout_btn)
        keyboard.add(support_btn)
    else:
        # Not logged in: Connect | Login
        #               View Plans | Support
        keyboard.add(connect_btn, login_btn)
        keyboard.add(view_plans_btn, support_btn)
    
    try:
        if message_id:
            bot.edit_message_text(welcome_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
            if chat_id in user_data:
                user_data[chat_id]['menu_message_id'] = message_id
        else:
            sent = bot.send_message(chat_id, welcome_text, reply_markup=keyboard, parse_mode='Markdown')
            if chat_id in user_data:
                user_data[chat_id]['menu_message_id'] = sent.message_id
    except Exception as e:
        if "message is not modified" in str(e).lower():
            # Content is the same, that's fine
            pass
        elif "there is no text" in str(e).lower():
            # Message is a photo, send new text message
            sent = bot.send_message(chat_id, welcome_text, reply_markup=keyboard, parse_mode='Markdown')
            if chat_id in user_data:
                user_data[chat_id]['menu_message_id'] = sent.message_id
        else:
            raise


def show_login_success_menu(chat_id, message_id):
    """Show the login success message with Profile and Home buttons"""
    if chat_id not in user_data:
        show_welcome_menu(chat_id, message_id)
        return
    
    email = user_data[chat_id].get('login_email', 'Unknown')
    plan_info = get_user_plan(chat_id)
    dashboard_plan_name = format_plan_display_name(plan_info.get('dashboard_plan') or 'free')
    
    expires_text = ""
    if plan_info.get('dashboard_plan_expires_at'):
        expires = safe_parse_datetime(plan_info['dashboard_plan_expires_at'])
        if expires:
            expires_text = f"\nExpires: {expires.strftime('%Y-%m-%d')}"
    
    success_text = f"""*Login Successful!*

Email: `{email}`
Plan: *{dashboard_plan_name}*{expires_text}

You can now use predictors according to your subscription limits."""
    
    keyboard = types.InlineKeyboardMarkup(row_width=1)
    home_btn = types.InlineKeyboardButton("Home", callback_data="home_menu")
    keyboard.add(home_btn)
    
    try:
        if message_id:
            bot.edit_message_text(success_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
        else:
            sent = bot.send_message(chat_id, success_text, reply_markup=keyboard, parse_mode='Markdown')
            if chat_id in user_data:
                user_data[chat_id]['menu_message_id'] = sent.message_id
    except Exception as e:
        if "message is not modified" in str(e).lower():
            pass
        else:
            # If edit fails, send new message
            sent = bot.send_message(chat_id, success_text, reply_markup=keyboard, parse_mode='Markdown')
            if chat_id in user_data:
                user_data[chat_id]['menu_message_id'] = sent.message_id


def show_connect_menu(chat_id, message_id):
    """Show connect menu asking for API token (Demo/Silver) or username (Max)"""
    plan_info = get_user_plan(chat_id)
    plan_type = plan_info['plan']
    
    if plan_type == 'diamond':
        # Diamond plan: only username needed (auto predictions)
        connect_text = """*Connect Your Stake Account*
    
Please send your Stake email to connect.

The bot will automatically detect mines and gems locations from your account."""
        
        keyboard = types.InlineKeyboardMarkup()
        cancel_btn = types.InlineKeyboardButton("? Abort", callback_data="cancel_connect")
        keyboard.add(cancel_btn)
        
        bot.edit_message_text(connect_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
        
        if chat_id in user_data:
            user_data[chat_id]['waiting_username'] = True
            user_data[chat_id]['connect_step'] = 'username'
    else:
        # Demo/Silver: Ask to use extension and add API token
        connect_text = """*Connect Your Stake Account*

*Step 1 — Install Connector*
• Open *Get Connector*
• Select region: *Asia/Global* or *Only US*
• Add userscript in Tampermonkey

*Step 2 — Add API Token*
• Tap *Add Token*
• Paste the same token used in connector

After setup, predictions sync automatically with your active session."""
        
        keyboard = types.InlineKeyboardMarkup()
        add_token_btn = types.InlineKeyboardButton("Add Token", callback_data="add_token")
        get_connector_btn = types.InlineKeyboardButton("Connector Script", callback_data="get_connector")
        cancel_btn = types.InlineKeyboardButton("? Abort", callback_data="cancel_connect")
        keyboard.add(add_token_btn)
        keyboard.add(get_connector_btn)
        keyboard.add(cancel_btn)
        
        bot.edit_message_text(connect_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
        
        if chat_id in user_data:
            user_data[chat_id]['waiting_token'] = False  # Will be set to True when button clicked


def show_premium_menu(chat_id, message_id, username):
    """Show premium user menu after successful connection"""
    plan_info = get_user_plan(chat_id)
    plan_type = plan_info['plan']
    dashboard_plan_name = format_plan_display_name(plan_info.get('dashboard_plan') or 'free')
    
    # Format connection info based on plan type
    if plan_type == 'diamond':
        connection_info = f"⧽ Username: `{username}`"
    else:
        # Demo/Silver: show API token info
        if chat_id in user_data and user_data[chat_id].get('api_token'):
            token_preview = user_data[chat_id]['api_token'][:10] + "..."
            connection_info = f"⧽ API Token: `{token_preview}`"
        else:
            connection_info = f"Username: `{username}`"
    
    menu_text = f""" ⧽ Connected

{connection_info}
 ⧽ Status: Running
 ⧽ Subscription: {dashboard_plan_name}
"""

    keyboard = types.InlineKeyboardMarkup(row_width=2)
    mines_btn = types.InlineKeyboardButton("Mines", callback_data="start_mines")
    crash_btn = types.InlineKeyboardButton("Crash", callback_data="start_crash")
    blackjack_btn = types.InlineKeyboardButton("Blackjack", callback_data="start_blackjack")
    moles_btn = types.InlineKeyboardButton("Moles", callback_data="start_moles")
    profile_btn = types.InlineKeyboardButton("?? Account", callback_data="profile")
    home_btn = types.InlineKeyboardButton("Back", callback_data="home_menu")
    
    # Check if user is connected to show Connect or Disconnect button
    is_connected = chat_id in user_data and (user_data[chat_id].get('username') or user_data[chat_id].get('api_token'))
    if is_connected:
        connect_btn = types.InlineKeyboardButton("Disconnect", callback_data="disconnect")
    else:
        connect_btn = types.InlineKeyboardButton("Connect", callback_data="connect")
    
    keyboard.add(mines_btn, crash_btn)
    keyboard.add(blackjack_btn, moles_btn)
    keyboard.add(profile_btn, home_btn)
    keyboard.add(connect_btn)
    
    try:
        if message_id:
            bot.edit_message_text(menu_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
        else:
            sent = bot.send_message(chat_id, menu_text, reply_markup=keyboard, parse_mode='Markdown')
            message_id = sent.message_id
    except Exception as e:
        if "message is not modified" in str(e).lower():
            # Content is the same, that's fine
            pass
        elif "there is no text" in str(e).lower():
            # Message is a photo, send new text message
            sent = bot.send_message(chat_id, menu_text, reply_markup=keyboard, parse_mode='Markdown')
            message_id = sent.message_id
        else:
            raise
    
    if chat_id in user_data:
        user_data[chat_id]['menu_message_id'] = message_id


def sync_plan_from_dashboard(chat_id, force=False):
    """Sync user's plan from dashboard to bot - stores raw subscription in users.json.
    get_user_plan() always derives the effective plan from stored dashboard fields."""
    dashboard_email = None
    if chat_id in user_data and user_data[chat_id].get('login_email'):
        dashboard_email = user_data[chat_id]['login_email']
    else:
        users = load_users()
        dashboard_email = users.get(str(chat_id), {}).get('email')

    if chat_id in user_data and not force:
        last_sync_at = user_data[chat_id].get('last_plan_sync_at')
        if last_sync_at and (time.time() - last_sync_at < PLAN_SYNC_CACHE_SECONDS):
            return False
        user_data[chat_id]['last_plan_sync_at'] = time.time()

    if not dashboard_email:
        return False

    try:
        resp = requests.post(
            f"{BACKEND_URL}/auth/profile",
            json={"email": dashboard_email},
            headers={"Content-Type": "application/json"},
            timeout=8
        )
        if resp.status_code == 200:
            js = resp.json()
            if js.get('status') == 'success' and js.get('user'):
                dashboard_user = js['user']
                sub_plan = (dashboard_user.get('subscription_plan') or 'free').lower()
                plan_expires_at = dashboard_user.get('plan_expires_at')

                users = load_users()
                user_id_str = str(chat_id)
                if user_id_str not in users:
                    users[user_id_str] = {}
                if 'plan' not in users[user_id_str] or not isinstance(users[user_id_str].get('plan'), dict):
                    users[user_id_str]['plan'] = {}
                plan_dict = users[user_id_str]['plan']
                plan_dict['dashboard_plan'] = sub_plan
                plan_dict['dashboard_plan_expires_at'] = plan_expires_at
                if user_data.get(chat_id):
                    user_data[chat_id]['login_email'] = dashboard_email
                    cache_key = f'_live_plan_cache_{chat_id}'
                    user_data[chat_id][cache_key] = (
                        time.time(), (sub_plan, plan_expires_at, dashboard_user.get('plan_active', False))
                    )

                write_users(users)
                return True
    except Exception as e:
        print(f"Error syncing plan from dashboard for {chat_id}: {e}")
    return False


def show_profile(chat_id, message_id):
    """Show user profile with plan, dashboard linkage and telemetry"""
    # Sync plan from dashboard first
    sync_plan_from_dashboard(chat_id, force=True)
    
    plan_info = get_user_plan(chat_id)
    plan_type = plan_info['plan']
    users = load_users()
    user_str = str(chat_id)
    joined_at = users.get(user_str, {}).get('joined_at') if user_str in users else None
    dashboard_email = users.get(user_str, {}).get('email') if user_str in users else None
    if chat_id in user_data and user_data[chat_id].get('login_email'):
        dashboard_email = user_data[chat_id]['login_email']

    profile_text = f"""*Profile*

User ID: `{chat_id}`"""

    if joined_at:
        jd = safe_parse_datetime(joined_at)
        if jd:
            profile_text += f"\nRegistered: {jd.strftime('%Y-%m-%d %H:%M')}"

    dashboard_profile = None
    dashboard_stats = None

    if dashboard_email:
        try:
            resp = requests.post(
                f"{BACKEND_URL}/auth/profile",
                json={"email": dashboard_email},
                headers={"Content-Type": "application/json"},
                timeout=8
            )
            if resp.status_code == 200:
                js = resp.json()
                if js.get('status') == 'success' and js.get('user'):
                    dashboard_profile = js['user']
        except Exception as e:
            print(f"Error fetching dashboard profile for {chat_id}: {e}")

        try:
            resp2 = requests.post(
                f"{BACKEND_URL}/user-stats",
                json={"username": dashboard_email},
                headers={"Content-Type": "application/json"},
                timeout=8
            )
            if resp2.status_code == 200:
                js2 = resp2.json()
                if js2.get('status') == 'success' and js2.get('stats'):
                    dashboard_stats = js2['stats']
        except Exception as e:
            print(f"Error fetching dashboard stats for {chat_id}: {e}")

    if plan_type == 'demo':
        profile_text += f"\nTime Left: ∞ (resets every 12h)"

    if dashboard_email:
        profile_text += f"\nEmail: `{dashboard_email}`"

    if dashboard_profile:
        sub_plan = format_plan_display_name(dashboard_profile.get('subscription_plan') or 'free')
        profile_text += f"\nPlan: *{sub_plan}*"
        created_at = dashboard_profile.get('created_at')
        if created_at:
            created_dt = safe_parse_datetime(created_at)
            if created_dt:
                profile_text += f"\nRegistered: {created_dt.strftime('%Y-%m-%d %H:%M')}"
        expires_at = dashboard_profile.get('plan_expires_at')
        if expires_at:
            exp_dt = safe_parse_datetime(expires_at)
            if exp_dt:
                profile_text += f"\nPlan Expires: {exp_dt.strftime('%Y-%m-%d %H:%M')}"
    elif plan_info.get('dashboard_plan'):
        profile_text += f"\nPlan: *{format_plan_display_name(plan_info.get('dashboard_plan'))}*"

    if plan_type == 'demo':
        total = plan_info.get('predictions_today_total', plan_info.get('predictions_today', 0)) or 0
        mines = plan_info.get('predictions_today_mines', 0) or 0
        crash = plan_info.get('predictions_today_crash', 0) or 0
        blackjack = plan_info.get('predictions_today_blackjack', 0) or 0
        moles = plan_info.get('predictions_today_moles', 0) or 0
        profile_text += (
            f"\nToday: {total}/{DEMO_TOTAL_LIMIT_PER_DAY} total"
            f"\nMines: {mines}/{DEMO_MINES_LIMIT_PER_DAY}"
            f"\nCrash: {crash}/{DEMO_CRASH_LIMIT_PER_DAY}"
            f"\nBlackjack: {blackjack}/{DEMO_BLACKJACK_LIMIT_PER_DAY}"
            f"\nMoles: {moles}/{DEMO_MOLES_LIMIT_PER_DAY}"
        )

    if dashboard_stats:
        fm = dashboard_stats.get('fake_mines_login_count', 0)
        su = dashboard_stats.get('script_usage_count', 0)
        wc = dashboard_stats.get('web_crash_demo_count', 0)
        wm = dashboard_stats.get('web_mines_demo_count', 0)
        td = dashboard_stats.get('telegram_demo_count', 0)
        tp = dashboard_stats.get('telegram_premium_count', 0)
        mp = dashboard_stats.get('mines_predictions_count', 0)
        cp = dashboard_stats.get('crash_predictions_count', 0)
        bjp = dashboard_stats.get('blackjack_predictions_count', 0)
        wbj = dashboard_stats.get('web_blackjack_demo_count', 0)
        profile_text += (
            "\n\n*Telemetry*"
            f"\n• larp Mines logins: {fm}"
            f"\n• Script usage: {su}"
            f"\n• Web Mines Free: {wm}"
            f"\n• Web Crash Free: {wc}"
            f"\n• Web Blackjack Free: {wbj}"
            f"\n• Telegram Free: {td}"
            f"\n• Telegram premium: {tp}"
            f"\n• Mines predictions: {mp}"
            f"\n• Crash predictions: {cp}"
            f"\n• Blackjack predictions: {bjp}"
        )
    
    if chat_id in user_data:
        if user_data[chat_id].get('username'):
            username = user_data[chat_id]['username']
            profile_text += f"\n\nConnection: Active"
            profile_text += f"\nUsername: `{username}`"
        elif user_data[chat_id].get('api_token'):
            profile_text += f"\n\nConnection: Active (Extension)"
            profile_text += f"\nAPI Token: `{user_data[chat_id]['api_token'][:10]}...`"
        else:
            profile_text += f"\n\nConnection: Not Connected"
    else:
        profile_text += f"\n\nConnection: Not Connected"

    keyboard = types.InlineKeyboardMarkup()
    # Go back to the previous menu (stored when clicking profile)
    previous_menu = user_data.get(chat_id, {}).get('previous_menu', 'welcome')
    if previous_menu == 'predictor':
        back_btn = types.InlineKeyboardButton("Back", callback_data="back_to_predictor")
    else:
        back_btn = types.InlineKeyboardButton("Back", callback_data="back_menu")
    keyboard.add(back_btn)
    
    bot.edit_message_text(profile_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')


def stop_predictions(user_id, show_menu=True):
    """Stop auto predictions and clean up messages"""
    if user_id not in user_data:
        return
    
    # Stop polling
    user_data[user_id]['is_polling'] = False
    
    # Delete all prediction messages
    if 'message_ids' in user_data[user_id]:
        for msg_id in user_data[user_id]['message_ids']:
            try:
                bot.delete_message(user_id, msg_id)
            except:
                pass
        user_data[user_id]['message_ids'] = []
    
    # Clear last prediction message ID
    if 'last_prediction_msg_id' in user_data[user_id]:
        del user_data[user_id]['last_prediction_msg_id']

    bj_err_mid = user_data[user_id].get('last_blackjack_error_msg')
    if bj_err_mid:
        try:
            bot.delete_message(user_id, bj_err_mid)
        except Exception:
            pass
        user_data[user_id]['last_blackjack_error_msg'] = None

    crash_err_mid = user_data[user_id].get('last_crash_error_msg')
    if crash_err_mid:
        try:
            bot.delete_message(user_id, crash_err_mid)
        except Exception:
            pass
        user_data[user_id]['last_crash_error_msg'] = None

    moles_err_mid = user_data[user_id].get('last_moles_error_msg')
    if moles_err_mid:
        try:
            bot.delete_message(user_id, moles_err_mid)
        except Exception:
            pass
        user_data[user_id]['last_moles_error_msg'] = None
    
    # Show premium menu again
    if show_menu and 'menu_message_id' in user_data[user_id]:
        show_premium_menu(user_id, user_data[user_id]['menu_message_id'], user_data[user_id]['username'])


def set_config(username, mines_location, gems_location, custom_mines=False, custom_gems=False, show_mines=False, show_gems=False):
    """Set mines/gems configuration via API"""
    try:
        response = requests.post(
            f"{BACKEND_URL}/mines_set_config",
            json={
                "stake_username": username,
                "mines_location": mines_location,
                "gems_location": gems_location,
                "custom_mines": custom_mines,
                "custom_gems": custom_gems,
                "show_mines": show_mines,
                "show_gems": show_gems
            },
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        return response.status_code == 200 and response.json().get('status') == 'success'
    except:
        return False


def show_admin_menu(chat_id, message_id=None):
    """Show admin menu"""
    admin_text = """🔐 *Admin Panel*

Welcome to the admin control panel.

Select an option:"""

    keyboard = types.InlineKeyboardMarkup(row_width=2)
    users_btn = types.InlineKeyboardButton("👥 Users", callback_data="admin_users")
    broadcast_btn = types.InlineKeyboardButton("📢 Broadcast", callback_data="admin_broadcast")
    config_btn = types.InlineKeyboardButton("⚙️ Configure User", callback_data="admin_config")
    commands_btn = types.InlineKeyboardButton("📋 View Commands", callback_data="admin_commands")
    back_btn = types.InlineKeyboardButton("Back", callback_data="back_menu")
    
    keyboard.add(users_btn, broadcast_btn)
    keyboard.add(config_btn)
    keyboard.add(commands_btn)
    keyboard.add(back_btn)
    
    if message_id:
        try:
            bot.edit_message_text(admin_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
        except Exception as e:
            # If message is not modified, just send a new one
            if "message is not modified" in str(e).lower():
                sent = bot.send_message(chat_id, admin_text, reply_markup=keyboard, parse_mode='Markdown')
                if chat_id in user_data:
                    user_data[chat_id]['menu_message_id'] = sent.message_id
            else:
                raise
    else:
        sent = bot.send_message(chat_id, admin_text, reply_markup=keyboard, parse_mode='Markdown')
        if chat_id in user_data:
            user_data[chat_id]['menu_message_id'] = sent.message_id


def show_admin_commands(chat_id, message_id):
    """Show admin commands list"""
    commands_text = """📋 *Admin Commands*

*Key Generation:*
`/gen <plan> <duration>`

*Plan Types:*
• `s` - Silver Plan
• `d` - Diamond Plan

*Duration Formats:*
• `1min` - 1 minute
• `1h` - 1 hour
• `1d` - 1 day
• `1w` - 1 week
• `1m` - 1 month
• `1y` - 1 year

*Examples:*
• `/gen s 1min` - Silver plan for 1 minute
• `/gen d 1h` - Diamond plan for 1 hour
• `/gen s 7d` - Silver plan for 7 days
• `/gen d 1m` - Diamond plan for 1 month

*Other Commands:*
• `/admin` - Open admin panel
• `/start` - Start bot"""

    keyboard = types.InlineKeyboardMarkup()
    back_btn = types.InlineKeyboardButton("Back", callback_data="admin_back")
    keyboard.add(back_btn)
    
    try:
        bot.edit_message_text(commands_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
    except Exception as e:
        if "message is not modified" in str(e).lower():
            sent = bot.send_message(chat_id, commands_text, reply_markup=keyboard, parse_mode='Markdown')
            if chat_id in user_data:
                user_data[chat_id]['menu_message_id'] = sent.message_id
        else:
            raise


def show_admin_users(chat_id, message_id, page=0):
    """Show users count and list with pagination (30 users per page to avoid message length limit)"""
    users = load_users()
    txt_users_list = load_full_users_from_txt()
    txt_user_ids = load_users_from_txt()
    
    # Combine users from both sources
    all_user_ids = set()
    all_users_list = []
    
    # Add users from JSON file
    for user_id_str, user_info in users.items():
        try:
            user_id = int(user_id_str)
            all_user_ids.add(user_id)
            all_users_list.append({
                'user_id': user_id,
                'name': user_info.get('name', 'N/A'),
                'username': user_info.get('username', 'N/A')
            })
        except ValueError:
            continue
    
    # Add users from TXT file (only if not already in JSON)
    for txt_user in txt_users_list:
        user_id = txt_user['user_id']
        if user_id not in all_user_ids:
            all_user_ids.add(user_id)
            all_users_list.append(txt_user)
    
    total_users = len(all_user_ids)
    json_users = len(users)
    txt_users = len(txt_user_ids)
    
    # Sort by user_id (most recent first)
    all_users_list.sort(key=lambda x: x['user_id'], reverse=True)
    
    # Pagination: 30 users per page (reduced from 50 to avoid Telegram's 4096 char limit)
    users_per_page = 30
    total_pages = (len(all_users_list) + users_per_page - 1) // users_per_page if all_users_list else 1
    
    # Validate page number
    if page < 0:
        page = 0
    if total_pages > 0 and page >= total_pages:
        page = total_pages - 1
    
    # Get users for current page
    start_idx = page * users_per_page
    end_idx = start_idx + users_per_page
    page_users = all_users_list[start_idx:end_idx]
    
    users_text = f"""👥 *Users Statistics*

📊 Total Users: `{total_users}`
📁 JSON Users: `{json_users}`
📄 TXT Users: `{txt_users}`

*Page {page + 1} of {total_pages}*
*Showing {len(page_users)} users:*"""
    
    # Show users for current page (truncate long names to avoid message limit)
    for user in page_users:
        name = user['name'][:40] if len(user['name']) > 40 else user['name']  # Truncate long names
        username = user['username'][:30] if len(user['username']) > 30 else user['username']  # Truncate long usernames
        users_text += f"\n• {name} (@{username})"
    
    # Check if message is too long (Telegram limit is 4096 chars)
    if len(users_text) > 4000:
        # If still too long, reduce users per page for this specific case
        users_per_page = 25
        total_pages = (len(all_users_list) + users_per_page - 1) // users_per_page if all_users_list else 1
        if page >= total_pages and total_pages > 0:
            page = total_pages - 1
        start_idx = page * users_per_page
        end_idx = start_idx + users_per_page
        page_users = all_users_list[start_idx:end_idx]
        
        users_text = f"""👥 *Users Statistics*

📊 Total Users: `{total_users}`
📁 JSON Users: `{json_users}`
📄 TXT Users: `{txt_users}`

*Page {page + 1} of {total_pages}*
*Showing {len(page_users)} users:*"""
        
        for user in page_users:
            name = user['name'][:35] if len(user['name']) > 35 else user['name']
            username = user['username'][:25] if len(user['username']) > 25 else user['username']
            users_text += f"\n• {name} (@{username})"
    
    keyboard = types.InlineKeyboardMarkup()
    
    # Pagination buttons
    nav_buttons = []
    if page > 0:
        nav_buttons.append(types.InlineKeyboardButton("Previous", callback_data=f"admin_users_page_{page - 1}"))
    if page < total_pages - 1:
        nav_buttons.append(types.InlineKeyboardButton("Next ➡️", callback_data=f"admin_users_page_{page + 1}"))
    
    if nav_buttons:
        keyboard.add(*nav_buttons)
    
    # Refresh and Back buttons
    refresh_btn = types.InlineKeyboardButton("Refresh", callback_data="admin_users")
    back_btn = types.InlineKeyboardButton("Back", callback_data="admin_back")
    keyboard.add(refresh_btn, back_btn)
    
    try:
        bot.edit_message_text(users_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
    except Exception as e:
        if "message is not modified" in str(e).lower():
            # Message unchanged, just acknowledge
            pass
        elif "message is too long" in str(e).lower() or "bad request" in str(e).lower():
            # Message too long, show error
            error_text = f"""👥 *Users Statistics*

📊 Total Users: `{total_users}`
📁 JSON Users: `{json_users}`
📄 TXT Users: `{txt_users}`

Too many users to display in one message.
Please use pagination to view users."""
            bot.edit_message_text(error_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
        else:
            raise


def show_admin_broadcast(chat_id, message_id):
    broadcast_text = """📢 *Broadcast Message*

Send the message you want to broadcast to all users.

The message will be sent to all registered users."""
    
    keyboard = types.InlineKeyboardMarkup()
    cancel_btn = types.InlineKeyboardButton("? Abort", callback_data="admin_back")
    keyboard.add(cancel_btn)
    
    try:
        bot.edit_message_text(broadcast_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
    except Exception as e:
        if "message is not modified" in str(e).lower():
            pass
        else:
            raise
    
    if chat_id in user_data:
        user_data[chat_id]['waiting_broadcast'] = True


def run_broadcast(admin_id, text):
    users = load_users()
    txt_user_ids = load_users_from_txt()
    
    sent_count = 0
    failed_count = 0
    all_user_ids = set()
    
    for user_id_str in users:
        try:
            all_user_ids.add(int(user_id_str))
        except ValueError:
            continue
    
    for txt_user_id in txt_user_ids:
        all_user_ids.add(txt_user_id)
    
    total_users = len(all_user_ids)
    
    status_text = f"""📢 *Broadcasting...*

📊 Total Users: {total_users}
📤 Sent: 0
Failed: 0
⏳ Starting broadcast..."""
    
    keyboard = types.InlineKeyboardMarkup()
    back_btn = types.InlineKeyboardButton("Back", callback_data="admin_back")
    keyboard.add(back_btn)
    
    menu_msg_id = user_data.get(admin_id, {}).get('menu_message_id')
    if menu_msg_id:
        try:
            bot.edit_message_text(status_text, admin_id, menu_msg_id, reply_markup=keyboard, parse_mode='Markdown')
        except:
            try:
                sent = bot.send_message(admin_id, status_text, reply_markup=keyboard, parse_mode='Markdown')
                if admin_id in user_data:
                    user_data[admin_id]['menu_message_id'] = sent.message_id
                    menu_msg_id = sent.message_id
            except:
                menu_msg_id = None
    else:
        try:
            sent = bot.send_message(admin_id, status_text, reply_markup=keyboard, parse_mode='Markdown')
            if admin_id in user_data:
                user_data[admin_id]['menu_message_id'] = sent.message_id
                menu_msg_id = sent.message_id
        except:
            menu_msg_id = None
    
    batch_size = 20
    delay_between_batches = 1
    delay_between_messages = 0.05
    update_interval = 5
    
    all_user_ids_list = list(all_user_ids)
    total_batches = (len(all_user_ids_list) + batch_size - 1) // batch_size
    processed_count = 0
    
    for batch_num in range(total_batches):
        start_idx = batch_num * batch_size
        end_idx = min(start_idx + batch_size, len(all_user_ids_list))
        batch = all_user_ids_list[start_idx:end_idx]
        
        for idx, target_user_id in enumerate(batch):
            try:
                bot.send_message(target_user_id, f"📢 *Broadcast*\n\n{text}", parse_mode='Markdown')
                sent_count += 1
                processed_count += 1
                time.sleep(delay_between_messages)
            except Exception as e:
                err = str(e).lower()
                processed_count += 1
                if "too many requests" in err or "retry after" in err:
                    retry_after = 5
                    match = re.search(r"retry after (\d+)", err)
                    if match:
                        try:
                            retry_after = int(match.group(1))
                        except ValueError:
                            retry_after = 5
                    time.sleep(retry_after + 1)
                    try:
                        bot.send_message(target_user_id, f"📢 *Broadcast*\n\n{text}", parse_mode='Markdown')
                        sent_count += 1
                    except Exception as e2:
                        failed_count += 1
                        if "blocked" not in str(e2).lower() and "chat not found" not in str(e2).lower():
                            print(f"Broadcast error for {target_user_id}: {e2}")
                elif "parse entities" in err or "can't parse entities" in err:
                    try:
                        bot.send_message(target_user_id, f"📢 Broadcast\n\n{text}")
                        sent_count += 1
                    except Exception as e2:
                        failed_count += 1
                        if "blocked" not in str(e2).lower() and "chat not found" not in str(e2).lower():
                            print(f"Broadcast error for {target_user_id}: {e2}")
                else:
                    failed_count += 1
                    if "blocked" not in err and "chat not found" not in err:
                        print(f"Broadcast error for {target_user_id}: {e}")
            
            if total_users > 0 and ((idx + 1) % update_interval == 0 or idx == len(batch) - 1):
                remaining = total_users - processed_count
                progress_percent = int((processed_count / total_users) * 100)
                
                status_text = f"""📢 *Broadcasting...* (Live Stats)

📊 Total Users: {total_users}
📤 Sent: {sent_count}
Failed: {failed_count}
Progress: {progress_percent}%
⏳ Remaining: {remaining}
Batch: {batch_num + 1}/{total_batches}"""
                
                if menu_msg_id:
                    try:
                        bot.edit_message_text(status_text, admin_id, menu_msg_id, reply_markup=keyboard, parse_mode='Markdown')
                    except:
                        pass
        
        if batch_num < total_batches - 1:
            time.sleep(delay_between_batches)
    
    result_text = f"""*Broadcast Complete*

📊 Total Users: {total_users}
📤 Sent: {sent_count}
Failed: {failed_count}
📁 JSON Users: {len(users)}
📄 TXT Users: {len(txt_user_ids)}
Success Rate: {int((sent_count / total_users) * 100) if total_users > 0 else 0}%"""
    
    if menu_msg_id:
        try:
            bot.edit_message_text(result_text, admin_id, menu_msg_id, reply_markup=keyboard, parse_mode='Markdown')
        except:
            bot.send_message(admin_id, result_text, reply_markup=keyboard, parse_mode='Markdown')
    else:
        bot.send_message(admin_id, result_text, reply_markup=keyboard, parse_mode='Markdown')
    
    if admin_id in user_data:
        user_data[admin_id]['waiting_broadcast'] = False


def show_admin_config(chat_id, message_id):
    """Show configuration menu - select username"""
    config_text = """⚙️ *Configure User*

Please enter the Stake username you want to configure:"""
    
    keyboard = types.InlineKeyboardMarkup()
    cancel_btn = types.InlineKeyboardButton("? Abort", callback_data="admin_back")
    keyboard.add(cancel_btn)
    
    try:
        bot.edit_message_text(config_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
    except Exception as e:
        if "message is not modified" in str(e).lower():
            pass
        else:
            raise
    
    if chat_id in user_data:
        user_data[chat_id]['waiting_config_username'] = True


def show_admin_user_menu(chat_id, message_id, username):
    """Show admin user menu with 3 main options"""
    # Get current config status
    mines_count = 0
    gems_count = 0
    is_polling = False
    
    if 'admin_selections' in user_data[chat_id] and username in user_data[chat_id]['admin_selections']:
        selections = user_data[chat_id]['admin_selections'][username]
        mines_count = len(selections.get('mines', []))
        gems_count = len(selections.get('gems', []))
    
    if 'admin_polling' in user_data[chat_id] and username in user_data[chat_id].get('admin_polling', {}):
        is_polling = user_data[chat_id]['admin_polling'].get(username, False)
    
    menu_text = f"""⚙️ *Admin: Configure User*

Username: `{username}`
Status: Connected

📊 *Current Config:*
Mines: {mines_count}
Gems: {gems_count}
Predictions: {'🟢 Active' if is_polling else '🔴 Inactive'}

*Select an option:*"""

    keyboard = types.InlineKeyboardMarkup(row_width=2)
    set_mines_btn = types.InlineKeyboardButton("Set Mines", callback_data=f"admin_set_mines_{username}")
    set_gems_btn = types.InlineKeyboardButton("Set Gems", callback_data=f"admin_set_gems_{username}")
    auto_predictions_btn = types.InlineKeyboardButton("Mines + Gems Location", callback_data=f"admin_auto_{username}")
    disconnect_btn = types.InlineKeyboardButton(" Disconnect", callback_data=f"admin_disconnect_{username}")
    
    keyboard.add(set_mines_btn, set_gems_btn)
    keyboard.add(auto_predictions_btn)
    keyboard.add(disconnect_btn)
    
    if message_id:
        try:
            bot.edit_message_text(menu_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
        except Exception as e:
            if "message is not modified" in str(e).lower():
                pass
            else:
                raise
    else:
        sent = bot.send_message(chat_id, menu_text, reply_markup=keyboard, parse_mode='Markdown')
        if chat_id in user_data:
            user_data[chat_id]['menu_message_id'] = sent.message_id


def show_config_grid(chat_id, message_id, username):
    """Show 5x5 grid for configuration"""
    # Initialize selection for this username
    if 'admin_selections' not in user_data[chat_id]:
        user_data[chat_id]['admin_selections'] = {}
    if username not in user_data[chat_id]['admin_selections']:
        user_data[chat_id]['admin_selections'][username] = {'mines': [], 'gems': []}
    
    selections = user_data[chat_id]['admin_selections'][username]
    temp_selection = user_data[chat_id].get('temp_selection', [])
    
    mines_count = len(selections.get('mines', []))
    gems_count = len(selections.get('gems', []))
    temp_count = len(temp_selection)
    
    config_text = f"""⚙️ *Configure: {username}*

Select tiles, then click "Set as Mines" or "Set as Gems"

Mines: {mines_count}
Gems: {gems_count}
📌 Selected: {temp_count}"""

    # Create 5x5 grid buttons - arranged in 5 rows of 5 columns
    keyboard = types.InlineKeyboardMarkup()
    
    # Add grid buttons in 5 rows (0-24)
    for row in range(5):
        row_buttons = []
        for col in range(5):
            i = row * 5 + col  # Calculate tile index (0-24)
            if i in selections.get('mines', []):
                btn_text = f"💣{i+1}"
            elif i in selections.get('gems', []):
                btn_text = f"💎{i+1}"
            elif i in temp_selection:
                btn_text = f"📌{i+1}"
            else:
                btn_text = f"{i+1}"
            row_buttons.append(types.InlineKeyboardButton(btn_text, callback_data=f"grid_{i}_{username}"))
        keyboard.add(*row_buttons)  # Add entire row at once
    
    # Control buttons
    keyboard.add(
        types.InlineKeyboardButton("Set as Mines", callback_data=f"set_mines_{username}"),
        types.InlineKeyboardButton("Set as Gems", callback_data=f"set_gems_{username}")
    )
    keyboard.add(
        types.InlineKeyboardButton("Save Config", callback_data=f"save_config_{username}"),
        types.InlineKeyboardButton("Clear", callback_data=f"clear_config_{username}")
    )
    keyboard.add(types.InlineKeyboardButton(" Disconnect", callback_data=f"admin_disconnect_{username}"))
    keyboard.add(types.InlineKeyboardButton("Back", callback_data=f"admin_user_menu_{username}"))
    
    bot.edit_message_text(config_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')


def poll_and_send_admin(admin_id, username):
    """Poll API and send images for admin (like normal user)"""
    last_mines = []
    last_gems = []
    
    # Initialize message IDs storage
    if 'admin_message_ids' not in user_data[admin_id]:
        user_data[admin_id]['admin_message_ids'] = {}
    if username not in user_data[admin_id]['admin_message_ids']:
        user_data[admin_id]['admin_message_ids'][username] = []
    
    print(f"[Admin Poll] Starting polling for admin {admin_id}, username: {username}")
    
    # Poll continuously while active
    while True:
        # Check if polling should continue
        if (admin_id not in user_data or 
            not user_data[admin_id].get('admin_polling', {}).get(username, False)):
            print(f"[Admin Poll] Stopping polling for {username}")
            break
        
        try:
            mines, gems = fetch_auto_locations(username)
            
            if mines is not None and gems is not None:
                # Check if locations changed or if it's first time
                is_first = len(last_mines) == 0 and len(last_gems) == 0
                mines_changed = sorted(mines) != sorted(last_mines)
                gems_changed = sorted(gems) != sorted(last_gems)
                
                # Send if changed or if first time (even if empty, to show current state)
                if (is_first or mines_changed or gems_changed) and (len(mines) > 0 or len(gems) > 0):
                    print(f"[Admin Poll] New prediction detected: Mines={len(mines)}, Gems={len(gems)}")
                    
                    # Delete previous prediction message if exists
                    if 'admin_last_prediction' not in user_data[admin_id]:
                        user_data[admin_id]['admin_last_prediction'] = {}
                    if username in user_data[admin_id]['admin_last_prediction']:
                        try:
                            bot.delete_message(admin_id, user_data[admin_id]['admin_last_prediction'][username])
                        except:
                            pass
                    
                    # Generate and send image
                    img_bytes = generate_grid_image(mines, gems)
                    
                    try:
                        # Create keyboard with stop button
                        keyboard = types.InlineKeyboardMarkup()
                        stop_btn = types.InlineKeyboardButton("Stop AUTO Predictions", callback_data=f"admin_stop_{admin_id}_{username}")
                        keyboard.add(stop_btn)
                        
                        # Send photo with stop button (no caption)
                        sent_msg = bot.send_photo(admin_id, img_bytes, reply_markup=keyboard)
                        
                        # Store last prediction message ID for auto-deletion
                        user_data[admin_id]['admin_last_prediction'][username] = sent_msg.message_id
                        
                        # Also keep in message_ids list for manual deletion on stop
                        user_data[admin_id]['admin_message_ids'][username].append(sent_msg.message_id)
                        
                        last_mines = mines.copy()
                        last_gems = gems.copy()
                        print(f"[Admin Poll] Image sent successfully")
                    except Exception as e:
                        print(f"[Admin Poll] Error sending photo to admin: {e}")
            else:
                print(f"[Admin Poll] No data returned from API for {username}")
        except Exception as e:
            print(f"[Admin Poll] Error in polling loop: {e}")
        
        time.sleep(POLLING_INTERVAL)
    
    # Clean up
    if admin_id in user_data and 'admin_polling' in user_data[admin_id]:
        user_data[admin_id]['admin_polling'][username] = False
    print(f"[Admin Poll] Polling stopped for {username}")


def show_plans_main_menu(chat_id, message_id):
    """Show main plans menu with 4 options"""
    plans_text = """*Plans Menu*

Select a plan category:"""

    keyboard = types.InlineKeyboardMarkup(row_width=2)
    predictor_btn = types.InlineKeyboardButton("Predictor Plans", callback_data="predictor_plans")
    fbi_btn = types.InlineKeyboardButton("BalanceInjector Plans", callback_data="fbi_plans")
    custom_mines_btn = types.InlineKeyboardButton("Custom/Fake Mines", callback_data="custom_mines")
    custom_web_btn = types.InlineKeyboardButton("Custom Web/Bots", callback_data="custom_web")
    back_btn = types.InlineKeyboardButton("Back", callback_data="back_menu")
    
    keyboard.add(predictor_btn, fbi_btn)
    keyboard.add(custom_mines_btn, custom_web_btn)
    keyboard.add(back_btn)
    
    try:
        bot.edit_message_text(plans_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
    except Exception as e:
        if "message is not modified" in str(e).lower():
            pass
        else:
            raise


def show_predictor_plans_menu(chat_id, message_id):
    """Show predictor plans menu with all plan details"""
    plans_text = """*Available Subscriptions*

* ⧽ Obsidian*
 ・Limit: ∞
 ・Success Rate: 98%
 ・Duration: 35 Days
 ・Includes: Crash . Mines . Blackjack . Moles
 ・Price: [Click Here](https://www.soulpredictor.xyz/#pricing)


* ⧽ Diamond* 
 ・Limit: ∞
 ・Success Rate: 95%
 ・Duration: 25 Days
 ・Includes: Crash . Mines . Blackjack . Moles
 ・Price: [Click Here](https://www.soulpredictor.xyz/#pricing)


* ⧽ Free*
 ・Limit: 4/times per 12 hours
 ・Success Rate: 65-75%
 ・Plan Duration: ∞
 ・Includes: Crash . Mines . Blackjack . Moles
 ・To Upgrade: [Click Here](https://www.soulpredictor.xyz/#pricing)
"""

    keyboard = types.InlineKeyboardMarkup()
    back_btn = types.InlineKeyboardButton("Back", callback_data="view_plans")
    keyboard.add(back_btn)
    
    try:
        bot.edit_message_text(plans_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown', disable_web_page_preview=False)
    except Exception as e:
        if "message is not modified" in str(e).lower():
            pass
        else:
            raise


def show_fbi_plans_menu(chat_id, message_id):
    """Show BalanceInjector plans menu"""
    plans_text = """*BalanceInjector Plans*

* ⧽ Weekly Subscription*
 ・Fake Balance: INR, USDT (EURO), Etc (all currencies)
 ・Premium Support
 ・Future Updates on 0% Charge
 ・Price: [Click Here](https://www.soulpredictor.xyz/#pricing)


* ⧽ Monthly Subscription*
 ・Fake Balance: INR, USDT (EURO), Etc (all currencies)
 ・Premium Support
 ・Future Updates on 0% Charge
 ・Price: [Click Here](https://www.soulpredictor.xyz/#pricing)
"""

    keyboard = types.InlineKeyboardMarkup()
    back_btn = types.InlineKeyboardButton("Back", callback_data="view_plans")
    keyboard.add(back_btn)
    
    try:
        bot.edit_message_text(plans_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown', disable_web_page_preview=False)
    except Exception as e:
        if "message is not modified" in str(e).lower():
            pass
        else:
            raise


def show_custom_mines_menu(chat_id, message_id):
    """Show Custom/Fake Mines plans menu"""
    plans_text = """*Custom/Fake Mines Plans*

* ⧽ Weekly Subscription*
 ・No API Access
 ・With Custom Predictor (Website Based, Telegram Based etc)
 ・1-24 Mines Access
 ・Price: [Click Here](https://t.me/iorpx)


* ⧽ Monthly Subscription*
 ・API Access
 ・With Custom Predictor (Website Based, Telegram Based etc)
 ・1-24 Mines Access
 ・Price: [Click Here](https://t.me/iorpx)
"""

    keyboard = types.InlineKeyboardMarkup()
    back_btn = types.InlineKeyboardButton("Back", callback_data="view_plans")
    keyboard.add(back_btn)
    
    try:
        bot.edit_message_text(plans_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown', disable_web_page_preview=False)
    except Exception as e:
        if "message is not modified" in str(e).lower():
            pass
        else:
            raise


def show_custom_web_bots_menu(chat_id, message_id):
    """Show Custom Web/Bots menu"""
    plans_text = """*Custom Web/Bots*

We build custom websites, tools, and bots tailored to your needs.

Our services include:
 ・Custom Website Development
 ・Custom Tools & Scripts
 ・Telegram Bots
 ・And much more!

Contact us to discuss your requirements:
[Click Here](https://t.me/iorpx)
"""

    keyboard = types.InlineKeyboardMarkup()
    back_btn = types.InlineKeyboardButton("Back", callback_data="view_plans")
    keyboard.add(back_btn)
    
    try:
        bot.edit_message_text(plans_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown', disable_web_page_preview=False)
    except Exception as e:
        if "message is not modified" in str(e).lower():
            pass
        else:
            raise


def show_manual_prediction_menu(chat_id, message_id):
    """Show manual prediction menu with 6 mines buttons"""
    plan_info = get_user_plan(chat_id)
    plan_type = plan_info['plan']
    
    menu_text = """*Manual Prediction*

Select number of mines:
"""
    
    if plan_type == 'demo':
        total = plan_info.get('predictions_today_total', plan_info.get('predictions_today', 0)) or 0
        mines = plan_info.get('predictions_today_mines', 0) or 0
        crash = plan_info.get('predictions_today_crash', 0) or 0
        blackjack = plan_info.get('predictions_today_blackjack', 0) or 0
        moles = plan_info.get('predictions_today_moles', 0) or 0
        menu_text += (
            f"\nToday: {total}/{DEMO_TOTAL_LIMIT_PER_DAY} total"
            f"\nMines: {mines}/{DEMO_MINES_LIMIT_PER_DAY} | Crash: {crash}/{DEMO_CRASH_LIMIT_PER_DAY}"
            f"\nBlackjack: {blackjack}/{DEMO_BLACKJACK_LIMIT_PER_DAY} | Moles: {moles}/{DEMO_MOLES_LIMIT_PER_DAY}"
        )
    
    keyboard = types.InlineKeyboardMarkup()
    # Row 1: 1, 2, 3
    keyboard.add(
        types.InlineKeyboardButton("1", callback_data="manual_mines_1"),
        types.InlineKeyboardButton("2", callback_data="manual_mines_2"),
        types.InlineKeyboardButton("3", callback_data="manual_mines_3")
    )
    # Row 2: 4, 5
    keyboard.add(
        types.InlineKeyboardButton("4", callback_data="manual_mines_4"),
        types.InlineKeyboardButton("5", callback_data="manual_mines_5")
    )
    # Row 3: 6
    keyboard.add(types.InlineKeyboardButton("6", callback_data="manual_mines_6"))
    # Back button
    keyboard.add(types.InlineKeyboardButton("Back", callback_data="back_to_premium"))
    
    try:
        if message_id:
            bot.edit_message_text(menu_text, chat_id, message_id, reply_markup=keyboard, parse_mode='Markdown')
        else:
            sent = bot.send_message(chat_id, menu_text, reply_markup=keyboard, parse_mode='Markdown')
            if chat_id in user_data:
                user_data[chat_id]['manual_prediction_menu_id'] = sent.message_id
    except Exception as e:
        if "message is not modified" in str(e).lower():
            # Content is the same, that's fine
            pass
        elif "there is no text" in str(e).lower():
            # Message is a photo, send new text message
            sent = bot.send_message(chat_id, menu_text, reply_markup=keyboard, parse_mode='Markdown')
            if chat_id in user_data:
                user_data[chat_id]['manual_prediction_menu_id'] = sent.message_id
        else:
            raise


CONNECTOR_REGION_CONFIG = {
    "global": {
        "label": "Asia/Global",
        "domain": "stake.ac",
        "script_name": "Soul Auto Connector @Stake",
        "web_url": "ac",
        "require_url": "https://raw.githubusercontent.com/librarian1337/connectorforus/refs/heads/main/app.js"
    },
    "us": {
        "label": "Only US",
        "domain": "stake.us",
        "script_name": "Soul Auto Connector @Stake.us",
        "web_url": "us",
        "require_url": "https://raw.githubusercontent.com/librarian1337/connectorforus/refs/heads/main/app.js"
    }
}


def build_connector_script(region_key):
    config = CONNECTOR_REGION_CONFIG.get(region_key, CONNECTOR_REGION_CONFIG["global"])
    domain = config["domain"]
    script_name = config["script_name"]
    web_url = config["web_url"]
    require_url = config["require_url"]
    return f"""// ==UserScript==
// @name         {script_name}
// @require      {require_url}
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  middleware for Soul Predictor
// @author       soulteam
// @match        https://{domain}/*
// @match        https://*.{domain}/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      api.soulpredictor.xyz
// @connect      127.0.0.1
// @connect      localhost
// @run-at       document-start
// ==/UserScript==
"""


def build_connector_text(platform, region_key):
    config = CONNECTOR_REGION_CONFIG.get(region_key, CONNECTOR_REGION_CONFIG["global"])
    region_label = config["label"]
    domain = config["domain"]
    script = build_connector_script(region_key)
    platform_key = (platform or "android").lower()
    if platform_key == "pc":
        title = "PC Setup"
        body = (
            "1. Install Tampermonkey in your browser\n"
            "2. Create a new userscript\n"
            "3. Paste the script below and save\n"
            "4. Open Stake and keep script enabled"
        )
    elif platform_key == "ios":
        title = "Ios Setup"
        body = (
            "1. Install a userscript-enabled browser (Stay)\n"
            "2. Open Script Manager and add a new script\n"
            "3. Paste and save the script below\n"
            "4. Open Stake in the same browser"
        )
    else:
        title = "Android Setup"
        body = (
            "1. Install Kiwi/Mises or Firefox Nightly\n"
            "2. Add Tampermonkey or Violentmonkey\n"
            "3. Create a new userscript and paste code\n"
            "4. Save and open Stake"
        )
    return f"""*Connector Guide*

{title}
🌍 Region: *{region_label}*
Target: `https://{domain}`

{body}

```javascript
{script}
```"""


def build_connector_region_keyboard():
    keyboard = types.InlineKeyboardMarkup(row_width=2)
    keyboard.add(
        types.InlineKeyboardButton("🌍 Asia/Global", callback_data="connector_region_global"),
        types.InlineKeyboardButton("🇺🇸 Only US", callback_data="connector_region_us")
    )
    keyboard.add(types.InlineKeyboardButton("Back", callback_data="connect"))
    keyboard.add(types.InlineKeyboardButton("? Abort", callback_data="cancel_connect"))
    return keyboard


def build_connector_platform_keyboard(region_key):
    keyboard = types.InlineKeyboardMarkup(row_width=2)
    global_label = "Asia/Global" if region_key == "global" else "🌍 Asia/Global"
    us_label = "Only US" if region_key == "us" else "🇺🇸 Only US"
    keyboard.add(
        types.InlineKeyboardButton(global_label, callback_data="connector_region_global"),
        types.InlineKeyboardButton(us_label, callback_data="connector_region_us")
    )
    keyboard.add(
        types.InlineKeyboardButton("Android", callback_data="connector_android"),
        types.InlineKeyboardButton("PC", callback_data="connector_pc")
    )
    keyboard.add(types.InlineKeyboardButton("iOS", callback_data="connector_ios"))
    keyboard.add(types.InlineKeyboardButton("? Abort", callback_data="cancel_connect"))
    return keyboard


@bot.callback_query_handler(func=lambda call: True)
def handle_callback(call):
    """Handle button callbacks"""
    user_id = call.from_user.id
    data = call.data
    
    # Initialize user data if not exists
    if user_id not in user_data:
        user_data[user_id] = {
            'username': None, 
            'last_mines': [], 
            'last_gems': [], 
            'is_polling': False,
            'message_ids': [],
            'waiting_username': False,
            'menu_message_id': None
        }
    
    if data == "connect":
        # Check if user is logged in
        is_logged_in = bool(user_data[user_id].get('login_email'))
        
        if not is_logged_in:
            bot.answer_callback_query(call.id, "Please login first! Use the Login button.", show_alert=True)
            return
        
        show_connect_menu(user_id, call.message.message_id)
        user_data[user_id]['menu_message_id'] = call.message.message_id

    elif data == "profile":
        # Store the current menu type before showing profile
        if user_id in user_data:
            # Determine what menu user is coming from
            if user_data[user_id].get('username') or user_data[user_id].get('api_token'):
                user_data[user_id]['previous_menu'] = 'predictor'
            else:
                user_data[user_id]['previous_menu'] = 'welcome'
        show_profile(user_id, call.message.message_id)
        
    elif data == "add_token":
        # Ask for API token
        token_text = """*⧽ Add API Token*

Please send your *Stake API Token*.

This should be the same token you added in the Soul Predictor extension on Stake.ac.

Make sure:
1. The extension is installed and connected
2. You enter the exact same API token"""
        
        keyboard = types.InlineKeyboardMarkup()
        cancel_btn = types.InlineKeyboardButton("? Abort", callback_data="cancel_connect")
        keyboard.add(cancel_btn)
        
        try:
            # Answer callback first to give user feedback
            bot.answer_callback_query(call.id, "Please send your API token", show_alert=False)
            
            # Edit the message
            bot.edit_message_text(token_text, user_id, call.message.message_id, reply_markup=keyboard, parse_mode='Markdown')
            
            # Set waiting state
            if user_id in user_data:
                user_data[user_id]['waiting_token'] = True
                user_data[user_id]['menu_message_id'] = call.message.message_id
        except Exception as e:
            error_str = str(e).lower()
            print(f"Error editing message for add_token: {e}")
            
            # Answer callback even if edit fails
            try:
                bot.answer_callback_query(call.id, "Please send your API token", show_alert=False)
            except:
                pass
            
            # Try sending new message if edit fails
            try:
                sent = bot.send_message(user_id, token_text, reply_markup=keyboard, parse_mode='Markdown')
                if user_id in user_data:
                    user_data[user_id]['waiting_token'] = True
                    user_data[user_id]['menu_message_id'] = sent.message_id
            except Exception as e2:
                print(f"Error sending message for add_token: {e2}")
                # Last resort: just answer the callback
                try:
                    bot.answer_callback_query(call.id, "Error: Could not process request", show_alert=True)
                except:
                    pass
        
    elif data == "get_connector":
        if user_id in user_data and not user_data[user_id].get('connector_region'):
            user_data[user_id]['connector_region'] = 'global'
        keyboard = build_connector_region_keyboard()
        text = """*Connector Script*

Please select connector region first:
• 🌍 Asia/Global
• 🔥 Only US"""
        try:
            bot.edit_message_text(text, user_id, call.message.message_id, reply_markup=keyboard, parse_mode='Markdown', disable_web_page_preview=True)
        except Exception as e:
            print(f"Error editing message for get_connector: {e}")
            try:
                sent = bot.send_message(user_id, text, reply_markup=keyboard, parse_mode='Markdown', disable_web_page_preview=True)
                if user_id in user_data:
                    user_data[user_id]['menu_message_id'] = sent.message_id
            except Exception as e2:
                print(f"Error sending message for get_connector: {e2}")
    
    elif data == "connector_region_global":
        if user_id in user_data:
            user_data[user_id]['connector_region'] = 'global'
        keyboard = build_connector_platform_keyboard('global')
        text = build_connector_text("android", "global")
        try:
            bot.edit_message_text(text, user_id, call.message.message_id, reply_markup=keyboard, parse_mode='Markdown', disable_web_page_preview=True)
        except Exception as e:
            print(f"Error editing message for connector_region_global: {e}")

    elif data == "connector_region_us":
        if user_id in user_data:
            user_data[user_id]['connector_region'] = 'us'
        keyboard = build_connector_platform_keyboard('us')
        text = build_connector_text("android", "us")
        try:
            bot.edit_message_text(text, user_id, call.message.message_id, reply_markup=keyboard, parse_mode='Markdown', disable_web_page_preview=True)
        except Exception as e:
            print(f"Error editing message for connector_region_us: {e}")
    
    elif data == "connector_android":
        region_key = user_data.get(user_id, {}).get('connector_region', 'global')
        keyboard = build_connector_platform_keyboard(region_key)
        text = build_connector_text("android", region_key)
        try:
            bot.edit_message_text(text, user_id, call.message.message_id, reply_markup=keyboard, parse_mode='Markdown', disable_web_page_preview=True)
        except Exception as e:
            print(f"Error editing message for connector_android: {e}")
    
    elif data == "connector_pc":
        region_key = user_data.get(user_id, {}).get('connector_region', 'global')
        keyboard = build_connector_platform_keyboard(region_key)
        text = build_connector_text("pc", region_key)
        try:
            bot.edit_message_text(text, user_id, call.message.message_id, reply_markup=keyboard, parse_mode='Markdown', disable_web_page_preview=True)
        except Exception as e:
            print(f"Error editing message for connector_pc: {e}")
    
    elif data == "connector_ios":
        region_key = user_data.get(user_id, {}).get('connector_region', 'global')
        keyboard = build_connector_platform_keyboard(region_key)
        text = build_connector_text("ios", region_key)
        try:
            bot.edit_message_text(text, user_id, call.message.message_id, reply_markup=keyboard, parse_mode='Markdown', disable_web_page_preview=True)
        except Exception as e:
            print(f"Error editing message for connector_ios: {e}")
    
    elif data == "cancel_connect":
        show_welcome_menu(user_id, call.message.message_id)
        user_data[user_id]['waiting_username'] = False
        user_data[user_id]['waiting_token'] = False
        user_data[user_id]['connect_step'] = None
        # Clear connection data
        user_data[user_id].pop('connect_username', None)
        user_data[user_id].pop('api_token', None)
        user_data[user_id].pop('connect_api_token', None)
        user_data[user_id].pop('connect_server_seed', None)
        user_data[user_id].pop('connect_client_seed', None)
        
    elif data == "login_email":
        login_text = "🔐 *Access Panel*\n\nPlease send the email address you use (or want to use) for Soul Predictor.\nIf you don't have an account, one will be created for you."
        
        keyboard = types.InlineKeyboardMarkup()
        cancel_btn = types.InlineKeyboardButton("❌ Cancel", callback_data="cancel_activate")
        keyboard.add(cancel_btn)
        
        prompt_msg_id = call.message.message_id
        try:
            bot.edit_message_text(login_text, user_id, prompt_msg_id, reply_markup=keyboard, parse_mode='Markdown')
        except Exception:
            sent = bot.send_message(user_id, login_text, reply_markup=keyboard, parse_mode='Markdown')
            prompt_msg_id = sent.message_id
            if user_id in user_data:
                user_data[user_id]['menu_message_id'] = prompt_msg_id
        
        if user_id in user_data:
            user_data[user_id]['waiting_login_email'] = True
            user_data[user_id]['waiting_login_code'] = False
            user_data[user_id]['pending_login_email'] = None
            user_data[user_id]['login_code_prompt_msg_id'] = prompt_msg_id
        
    elif data == "activate":
        activate_text = """ ⧽ * Login to Start the System*

Please enter your email address:
A verification code will be sent to this email!."""
        
        keyboard = types.InlineKeyboardMarkup()
        cancel_btn = types.InlineKeyboardButton("? Abort", callback_data="cancel_activate")
        keyboard.add(cancel_btn)
        
        bot.edit_message_text(activate_text, user_id, call.message.message_id, reply_markup=keyboard, parse_mode='Markdown')
        user_data[user_id]['waiting_login_email'] = True
        user_data[user_id]['waiting_activation_key'] = False
        
    elif data == "cancel_activate":
        show_welcome_menu(user_id, call.message.message_id)
        user_data[user_id]['waiting_activation_key'] = False
        user_data[user_id]['waiting_login_email'] = False
        user_data[user_id]['waiting_login_code'] = False
        user_data[user_id]['pending_login_email'] = None
        user_data[user_id]['login_code_prompt_msg_id'] = None
        
    elif data == "get_predictions":
        # Backward compatibility: old button starts Mines predictor
        plan_info = get_user_plan(user_id)
        plan_type = plan_info['plan']

        # Stop any existing polling first
        if user_data[user_id].get('is_polling'):
            stop_predictions(user_id, show_menu=False)

        if plan_type == 'diamond':
            if not user_data[user_id].get('username'):
                bot.answer_callback_query(call.id, "Please connect first!", show_alert=True)
                return

            user_data[user_id]['is_polling'] = True
            user_data[user_id]['active_predictor'] = 'mines'

            if 'polling_thread' not in user_data[user_id] or not user_data[user_id]['polling_thread'].is_alive():
                thread = threading.Thread(target=poll_and_send, args=(user_id, user_data[user_id]['username'], None, 'mines'), daemon=True)
                user_data[user_id]['polling_thread'] = thread
                thread.start()

            bot.answer_callback_query(call.id, "Mines Started!", show_alert=False)
            show_premium_menu(user_id, call.message.message_id, user_data[user_id]['username'])
        else:
            if not user_data[user_id].get('api_token'):
                bot.answer_callback_query(call.id, "Please connect first!", show_alert=True)
                return

            if plan_type == 'demo':
                can_gen, counts = can_generate_prediction(user_id, game_type='mines')
                if not can_gen:
                    bot.answer_callback_query(call.id, format_demo_limit_popup(game_type='mines', counts=counts), show_alert=True)
                    return

            user_data[user_id]['is_polling'] = True
            user_data[user_id]['active_predictor'] = 'mines'

            if 'polling_thread' not in user_data[user_id] or not user_data[user_id]['polling_thread'].is_alive():
                thread = threading.Thread(target=poll_and_send, args=(user_id, None, user_data[user_id]['api_token'], 'mines'), daemon=True)
                user_data[user_id]['polling_thread'] = thread
                thread.start()

            bot.answer_callback_query(call.id, "Mines Started!", show_alert=False)
            show_premium_menu(user_id, call.message.message_id, user_data[user_id].get('username', 'Connected'))

    elif data == "start_mines":
        plan_info = get_user_plan(user_id)
        plan_type = plan_info['plan']

        # Stop any existing polling first
        if user_data[user_id].get('is_polling'):
            stop_predictions(user_id, show_menu=False)

        if plan_type == 'diamond':
            if not user_data[user_id].get('username'):
                bot.answer_callback_query(call.id, "Please connect first!", show_alert=True)
                return

            user_data[user_id]['is_polling'] = True
            user_data[user_id]['active_predictor'] = 'mines'

            if 'polling_thread' not in user_data[user_id] or not user_data[user_id]['polling_thread'].is_alive():
                thread = threading.Thread(target=poll_and_send, args=(user_id, user_data[user_id]['username'], None, 'mines'), daemon=True)
                user_data[user_id]['polling_thread'] = thread
                thread.start()

            bot.answer_callback_query(call.id, "Mines Started!", show_alert=False)
            show_premium_menu(user_id, call.message.message_id, user_data[user_id]['username'])
        else:
            if not user_data[user_id].get('api_token'):
                bot.answer_callback_query(call.id, "Please connect first!", show_alert=True)
                return

            if plan_type == 'demo':
                can_gen, counts = can_generate_prediction(user_id, game_type='mines')
                if not can_gen:
                    bot.answer_callback_query(call.id, format_demo_limit_popup(game_type='mines', counts=counts), show_alert=True)
                    return

            user_data[user_id]['is_polling'] = True
            user_data[user_id]['active_predictor'] = 'mines'

            if 'polling_thread' not in user_data[user_id] or not user_data[user_id]['polling_thread'].is_alive():
                thread = threading.Thread(target=poll_and_send, args=(user_id, None, user_data[user_id]['api_token'], 'mines'), daemon=True)
                user_data[user_id]['polling_thread'] = thread
                thread.start()

            bot.answer_callback_query(call.id, "Mines Started!", show_alert=False)
            show_premium_menu(user_id, call.message.message_id, user_data[user_id].get('username', 'Connected'))

    elif data == "start_crash":
        plan_info = get_user_plan(user_id)
        plan_type = plan_info['plan']

        # Stop any existing polling first
        if user_data[user_id].get('is_polling'):
            stop_predictions(user_id, show_menu=False)

        # Crash needs API token connection
        if not user_data[user_id].get('api_token'):
            bot.answer_callback_query(call.id, "Crash predictor requires API token connection (extension).", show_alert=True)
            return

        if plan_type == 'demo':
            can_gen, counts = can_generate_prediction(user_id, game_type='crash')
            if not can_gen:
                bot.answer_callback_query(call.id, format_demo_limit_popup(game_type='crash', counts=counts), show_alert=True)
                return

        user_data[user_id]['is_polling'] = True
        user_data[user_id]['active_predictor'] = 'crash'

        if 'polling_thread' not in user_data[user_id] or not user_data[user_id]['polling_thread'].is_alive():
            thread = threading.Thread(target=poll_and_send, args=(user_id, None, user_data[user_id]['api_token'], 'crash'), daemon=True)
            user_data[user_id]['polling_thread'] = thread
            thread.start()

        bot.answer_callback_query(call.id, "Crash Started!", show_alert=False)
        show_premium_menu(user_id, call.message.message_id, user_data[user_id].get('username', 'Connected'))

    elif data == "start_blackjack":
        plan_info = get_user_plan(user_id)
        plan_type = plan_info['plan']

        if user_data[user_id].get('is_polling'):
            stop_predictions(user_id, show_menu=False)

        if not user_data[user_id].get('api_token'):
            bot.answer_callback_query(call.id, "Blackjack coach requires API token connection (extension).", show_alert=True)
            return

        if plan_type == 'demo':
            can_gen, counts = can_generate_prediction(user_id, game_type='blackjack')
            if not can_gen:
                bot.answer_callback_query(call.id, format_demo_limit_popup(game_type='blackjack', counts=counts), show_alert=True)
                return

        user_data[user_id]['is_polling'] = True
        user_data[user_id]['active_predictor'] = 'blackjack'

        if 'polling_thread' not in user_data[user_id] or not user_data[user_id]['polling_thread'].is_alive():
            thread = threading.Thread(target=poll_and_send, args=(user_id, None, user_data[user_id]['api_token'], 'blackjack'), daemon=True)
            user_data[user_id]['polling_thread'] = thread
            thread.start()

        bot.answer_callback_query(call.id, "Blackjack auto coach started!", show_alert=False)
        show_premium_menu(user_id, call.message.message_id, user_data[user_id].get('username', 'Connected'))
    
    elif data == "start_moles":
        plan_info = get_user_plan(user_id)
        plan_type = plan_info['plan']

        if user_data[user_id].get('is_polling'):
            stop_predictions(user_id, show_menu=False)

        if not user_data[user_id].get('api_token'):
            bot.answer_callback_query(call.id, "Moles predictor requires API token connection (extension).", show_alert=True)
            return

        if plan_type == 'demo':
            can_gen, counts = can_generate_prediction(user_id, game_type='moles')
            if not can_gen:
                bot.answer_callback_query(call.id, format_demo_limit_popup(game_type='moles', counts=counts), show_alert=True)
                return

        user_data[user_id]['is_polling'] = True
        user_data[user_id]['active_predictor'] = 'moles'

        if 'polling_thread' not in user_data[user_id] or not user_data[user_id]['polling_thread'].is_alive():
            thread = threading.Thread(target=poll_and_send, args=(user_id, None, user_data[user_id]['api_token'], 'moles'), daemon=True)
            user_data[user_id]['polling_thread'] = thread
            thread.start()

        bot.answer_callback_query(call.id, "🕳️ Moles auto predictor started!", show_alert=False)
        show_premium_menu(user_id, call.message.message_id, user_data[user_id].get('username', 'Connected'))
    
    elif data.startswith("manual_mines_"):
        mines_count = int(data.split("_")[2])
        plan_info = get_user_plan(user_id)
        plan_type = plan_info['plan']
        
        # Check if can generate (for Demo plan)
        if plan_type == 'demo':
            can_gen, counts = can_generate_prediction(user_id, game_type='mines')
            if not can_gen:
                bot.answer_callback_query(call.id, format_demo_limit_popup(game_type='mines', counts=counts), show_alert=True)
                return
        
        # Generate manual prediction
        mines, gems = generate_manual_prediction(mines_count)
        # For Demo/Silver: don't show bombs, only gems
        img_bytes = generate_grid_image(mines, gems, show_bombs=False)
        
        increment_prediction_count(user_id, game_type='mines')
        if plan_type == 'demo':
            plan_info = get_user_plan(user_id)  # Refresh
            predictions_today = plan_info.get('predictions_today_total', plan_info.get('predictions_today', 0)) or 0
        
        try:
            keyboard = types.InlineKeyboardMarkup()
            
            if plan_type == 'silver':
                next_btn = types.InlineKeyboardButton("Next Prediction", callback_data="next_manual_prediction")
                keyboard.add(next_btn)
            elif plan_type == 'demo':
                total = plan_info.get('predictions_today_total', plan_info.get('predictions_today', 0)) or 0
                mines = plan_info.get('predictions_today_mines', 0) or 0
                if total < DEMO_TOTAL_LIMIT_PER_DAY and mines < DEMO_MINES_LIMIT_PER_DAY:
                    next_btn = types.InlineKeyboardButton("Next Prediction", callback_data="next_manual_prediction")
                    keyboard.add(next_btn)
            
            back_btn = types.InlineKeyboardButton("Back", callback_data="back_to_premium")
            keyboard.add(back_btn)
            
            sent_msg = bot.send_photo(user_id, img_bytes, reply_markup=keyboard)
            
            # Delete previous if exists
            if 'last_manual_prediction_msg_id' in user_data[user_id]:
                try:
                    bot.delete_message(user_id, user_data[user_id]['last_manual_prediction_msg_id'])
                except:
                    pass
            
            user_data[user_id]['last_manual_prediction_msg_id'] = sent_msg.message_id
            
            # Update manual prediction menu with new count
            if 'manual_prediction_menu_id' in user_data[user_id]:
                try:
                    show_manual_prediction_menu(user_id, user_data[user_id]['manual_prediction_menu_id'])
                except:
                    pass
            
            bot.answer_callback_query(call.id, f"Prediction generated!", show_alert=False)
        except Exception as e:
            print(f"Error sending manual prediction: {e}")
            bot.answer_callback_query(call.id, "Error generating prediction", show_alert=True)
    
    elif data == "next_manual_prediction":
        # Delete the current photo message first
        try:
            bot.delete_message(user_id, call.message.message_id)
        except:
            pass
        
        # Show manual prediction menu again
        if user_data[user_id].get('manual_prediction_menu_id'):
            try:
                show_manual_prediction_menu(user_id, user_data[user_id]['manual_prediction_menu_id'])
            except Exception as e:
                if "message is not modified" in str(e).lower():
                    # Menu already shows correct content, just acknowledge
                    bot.answer_callback_query(call.id, "", show_alert=False)
                else:
                    # If menu message doesn't exist or other error, send new one
                    sent = bot.send_message(user_id, "*Manual Prediction*\n\nSelect number of mines:", reply_markup=types.InlineKeyboardMarkup())
                    user_data[user_id]['manual_prediction_menu_id'] = sent.message_id
                    show_manual_prediction_menu(user_id, sent.message_id)
        else:
            # No menu message stored, send new one
            sent = bot.send_message(user_id, "*Manual Prediction*\n\nSelect number of mines:", reply_markup=types.InlineKeyboardMarkup())
            user_data[user_id]['manual_prediction_menu_id'] = sent.message_id
            show_manual_prediction_menu(user_id, sent.message_id)
    
    elif data == "back_to_premium":
        # Delete the current photo message first (if it's a photo)
        try:
            bot.delete_message(user_id, call.message.message_id)
        except:
            pass
        
        # Delete the manual prediction menu message (select mines menu)
        manual_menu_id = user_data[user_id].get('manual_prediction_menu_id')
        if manual_menu_id:
            try:
                bot.delete_message(user_id, manual_menu_id)
            except:
                pass
            # Clear the stored menu ID
            del user_data[user_id]['manual_prediction_menu_id']
        
        # Edit the original premium/welcome menu message (don't send new)
        # Use the backup ID if available, otherwise use menu_message_id
        if user_data[user_id].get('username'):
            # Try backup ID first (the original premium menu before it was edited to manual menu)
            menu_msg_id = user_data[user_id].get('premium_menu_backup_id')
            if not menu_msg_id:
                # Fallback to stored menu_message_id
                menu_msg_id = user_data[user_id].get('menu_message_id')
            
            if menu_msg_id:
                try:
                    show_premium_menu(user_id, menu_msg_id, user_data[user_id]['username'])
                    # Update menu_message_id to this message
                    user_data[user_id]['menu_message_id'] = menu_msg_id
                except Exception as e:
                    error_str = str(e).lower()
                    if "message is not modified" in error_str:
                        # Already showing correct menu, that's fine
                        pass
                    elif "there is no text" in error_str or "message to edit not found" in error_str or "bad request" in error_str:
                        # Message doesn't exist or is invalid, try menu_message_id if different
                        alt_msg_id = user_data[user_id].get('menu_message_id')
                        if alt_msg_id and alt_msg_id != menu_msg_id:
                            try:
                                show_premium_menu(user_id, alt_msg_id, user_data[user_id]['username'])
                                user_data[user_id]['menu_message_id'] = alt_msg_id
                            except:
                                # Last resort: send new message
                                show_premium_menu(user_id, None, user_data[user_id]['username'])
                        else:
                            # Send new message
                            show_premium_menu(user_id, None, user_data[user_id]['username'])
                    else:
                        # Other error, try menu_message_id if different
                        alt_msg_id = user_data[user_id].get('menu_message_id')
                        if alt_msg_id and alt_msg_id != menu_msg_id:
                            try:
                                show_premium_menu(user_id, alt_msg_id, user_data[user_id]['username'])
                                user_data[user_id]['menu_message_id'] = alt_msg_id
                            except:
                                show_premium_menu(user_id, None, user_data[user_id]['username'])
                        else:
                            show_premium_menu(user_id, None, user_data[user_id]['username'])
            else:
                # No stored message, send new one
                show_premium_menu(user_id, None, user_data[user_id]['username'])
        else:
            # Not connected, show welcome menu
            menu_msg_id = user_data[user_id].get('premium_menu_backup_id')
            if not menu_msg_id:
                menu_msg_id = user_data[user_id].get('menu_message_id')
            
            if menu_msg_id:
                try:
                    show_welcome_menu(user_id, menu_msg_id)
                    user_data[user_id]['menu_message_id'] = menu_msg_id
                except Exception as e:
                    error_str = str(e).lower()
                    if "message is not modified" in error_str:
                        pass
                    elif "there is no text" in error_str or "message to edit not found" in error_str or "bad request" in error_str:
                        alt_msg_id = user_data[user_id].get('menu_message_id')
                        if alt_msg_id and alt_msg_id != menu_msg_id:
                            try:
                                show_welcome_menu(user_id, alt_msg_id)
                                user_data[user_id]['menu_message_id'] = alt_msg_id
                            except:
                                show_welcome_menu(user_id, None)
                        else:
                            show_welcome_menu(user_id, None)
                    else:
                        alt_msg_id = user_data[user_id].get('menu_message_id')
                        if alt_msg_id and alt_msg_id != menu_msg_id:
                            try:
                                show_welcome_menu(user_id, alt_msg_id)
                                user_data[user_id]['menu_message_id'] = alt_msg_id
                            except:
                                show_welcome_menu(user_id, None)
                        else:
                            show_welcome_menu(user_id, None)
            else:
                show_welcome_menu(user_id, None)
    
    elif data == "view_plans":
        show_plans_main_menu(user_id, call.message.message_id)
    
    elif data == "predictor_plans":
        show_predictor_plans_menu(user_id, call.message.message_id)
    
    elif data == "fbi_plans":
        show_fbi_plans_menu(user_id, call.message.message_id)
    
    elif data == "custom_mines":
        show_custom_mines_menu(user_id, call.message.message_id)
    
    elif data == "custom_web":
        show_custom_web_bots_menu(user_id, call.message.message_id)
            
    elif data == "disconnect":
        user_data[user_id]['username'] = None
        user_data[user_id]['api_token'] = None
        user_data[user_id]['is_polling'] = False
        if 'message_ids' in user_data[user_id]:
            for msg_id in user_data[user_id]['message_ids']:
                try:
                    bot.delete_message(user_id, msg_id)
                except:
                    pass
            user_data[user_id]['message_ids'] = []
        # Clear last prediction message ID
        if 'last_prediction_msg_id' in user_data[user_id]:
            del user_data[user_id]['last_prediction_msg_id']
        show_welcome_menu(user_id, call.message.message_id)
        bot.answer_callback_query(call.id, " Disconnected", show_alert=False)
    
    elif data == "logout":
        # Clear all user data on logout
        prompt_msg_id = user_data[user_id].get('login_code_prompt_msg_id')
        if prompt_msg_id:
            try:
                bot.delete_message(user_id, prompt_msg_id)
            except Exception:
                pass
        user_data[user_id]['login_code_prompt_msg_id'] = None
        user_data[user_id]['username'] = None
        user_data[user_id]['api_token'] = None
        user_data[user_id]['login_email'] = None
        user_data[user_id]['login_success'] = False
        user_data[user_id]['waiting_login_email'] = False
        user_data[user_id]['waiting_login_code'] = False
        user_data[user_id]['pending_login_email'] = None
        user_data[user_id]['previous_menu'] = None
        user_data[user_id]['is_polling'] = False
        if 'message_ids' in user_data[user_id]:
            for msg_id in user_data[user_id]['message_ids']:
                try:
                    bot.delete_message(user_id, msg_id)
                except:
                    pass
            user_data[user_id]['message_ids'] = []
        if 'last_prediction_msg_id' in user_data[user_id]:
            del user_data[user_id]['last_prediction_msg_id']
        clear_user_email(user_id)
        show_welcome_menu(user_id, call.message.message_id)
        bot.answer_callback_query(call.id, "🚪 Logged out successfully", show_alert=False)
    
    elif data == "home_menu":
        # Show the welcome/start menu
        # Clear login_success flag when going home
        if user_id in user_data:
            user_data[user_id]['login_success'] = False
        show_welcome_menu(user_id, call.message.message_id)
        bot.answer_callback_query(call.id, "Home", show_alert=False)
        
    elif data == "continue_to_menu":
        if user_data[user_id]['username']:
            show_premium_menu(user_id, call.message.message_id, user_data[user_id]['username'])
        else:
            show_welcome_menu(user_id, call.message.message_id)
            
    elif data == "back_menu":
        if user_data[user_id]['username']:
            show_premium_menu(user_id, call.message.message_id, user_data[user_id]['username'])
        else:
            show_welcome_menu(user_id, call.message.message_id)
    
    elif data == "back_to_predictor":
        # Go back to predictor menu (connected menu)
        if user_data[user_id].get('username'):
            show_premium_menu(user_id, call.message.message_id, user_data[user_id]['username'])
        else:
            show_welcome_menu(user_id, call.message.message_id)
    
    elif data == "back_to_login_success":
        # Go back to the login success message (not premium menu)
        show_login_success_menu(user_id, call.message.message_id)
            
    elif data.startswith("stop_"):
        target_user_id = int(data.split("_")[1])
        if target_user_id == user_id:  # Security check
            stop_predictions(user_id)
            bot.answer_callback_query(call.id, "Predictions stopped", show_alert=False)
            # Delete the message with stop button
            try:
                bot.delete_message(user_id, call.message.message_id)
            except:
                pass
    
    # Admin callbacks
    elif data == "admin_back":
        if is_admin(user_id):
            try:
                show_admin_menu(user_id, call.message.message_id)
            except Exception as e:
                # Handle "message is not modified" error
                if "message is not modified" in str(e).lower():
                    bot.answer_callback_query(call.id, "", show_alert=False)
                else:
                    raise
    
    elif data == "admin_commands":
        if is_admin(user_id):
            show_admin_commands(user_id, call.message.message_id)
    
    elif data == "admin_users":
        if is_admin(user_id):
            show_admin_users(user_id, call.message.message_id, page=0)
    
    elif data.startswith("admin_users_page_"):
        if is_admin(user_id):
            try:
                page = int(data.replace("admin_users_page_", ""))
                show_admin_users(user_id, call.message.message_id, page=page)
            except ValueError:
                show_admin_users(user_id, call.message.message_id, page=0)
    
    elif data == "admin_broadcast":
        if is_admin(user_id):
            show_admin_broadcast(user_id, call.message.message_id)
    
    elif data == "admin_config":
        if is_admin(user_id):
            show_admin_config(user_id, call.message.message_id)
    
    elif data.startswith("grid_"):
        if is_admin(user_id):
            parts = data.split("_")
            tile_index = int(parts[1])
            username = "_".join(parts[2:])
            
            # Initialize if needed
            if 'admin_selections' not in user_data[user_id]:
                user_data[user_id]['admin_selections'] = {}
            if username not in user_data[user_id]['admin_selections']:
                user_data[user_id]['admin_selections'][username] = {'mines': [], 'gems': []}
            
            # Toggle selection
            selections = user_data[user_id]['admin_selections'][username]
            if tile_index in selections['mines']:
                selections['mines'].remove(tile_index)
            elif tile_index in selections['gems']:
                selections['gems'].remove(tile_index)
            else:
                # Add to temporary selection
                if 'temp_selection' not in user_data[user_id]:
                    user_data[user_id]['temp_selection'] = []
                if tile_index in user_data[user_id].get('temp_selection', []):
                    user_data[user_id]['temp_selection'].remove(tile_index)
                else:
                    if 'temp_selection' not in user_data[user_id]:
                        user_data[user_id]['temp_selection'] = []
                    user_data[user_id]['temp_selection'].append(tile_index)
            
            bot.answer_callback_query(call.id, f"Tile {tile_index+1} selected", show_alert=False)
            show_config_grid(user_id, call.message.message_id, username)
    
    elif data.startswith("set_mines_"):
        if is_admin(user_id):
            username = data.replace("set_mines_", "")
            if 'temp_selection' in user_data[user_id]:
                if 'admin_selections' not in user_data[user_id]:
                    user_data[user_id]['admin_selections'] = {}
                if username not in user_data[user_id]['admin_selections']:
                    user_data[user_id]['admin_selections'][username] = {'mines': [], 'gems': []}
                
                # Move temp selection to mines
                for tile in user_data[user_id]['temp_selection']:
                    if tile not in user_data[user_id]['admin_selections'][username]['mines']:
                        user_data[user_id]['admin_selections'][username]['mines'].append(tile)
                    # Remove from gems if exists
                    if tile in user_data[user_id]['admin_selections'][username]['gems']:
                        user_data[user_id]['admin_selections'][username]['gems'].remove(tile)
                
                user_data[user_id]['temp_selection'] = []
                bot.answer_callback_query(call.id, "Set as Mines", show_alert=False)
                show_config_grid(user_id, call.message.message_id, username)
    
    elif data.startswith("set_gems_"):
        if is_admin(user_id):
            username = data.replace("set_gems_", "")
            if 'temp_selection' in user_data[user_id]:
                if 'admin_selections' not in user_data[user_id]:
                    user_data[user_id]['admin_selections'] = {}
                if username not in user_data[user_id]['admin_selections']:
                    user_data[user_id]['admin_selections'][username] = {'mines': [], 'gems': []}
                
                # Move temp selection to gems
                for tile in user_data[user_id]['temp_selection']:
                    if tile not in user_data[user_id]['admin_selections'][username]['gems']:
                        user_data[user_id]['admin_selections'][username]['gems'].append(tile)
                    # Remove from mines if exists
                    if tile in user_data[user_id]['admin_selections'][username]['mines']:
                        user_data[user_id]['admin_selections'][username]['mines'].remove(tile)
                
                user_data[user_id]['temp_selection'] = []
                bot.answer_callback_query(call.id, "Set as Gems", show_alert=False)
                show_config_grid(user_id, call.message.message_id, username)
    
    elif data.startswith("save_config_"):
        if is_admin(user_id):
            username = data.replace("save_config_", "")
            if 'admin_selections' in user_data[user_id] and username in user_data[user_id]['admin_selections']:
                selections = user_data[user_id]['admin_selections'][username]
                mines = selections.get('mines', [])
                gems = selections.get('gems', [])
                
                # Save via API
                success = set_config(username, mines, gems, custom_mines=len(mines) > 0, custom_gems=len(gems) > 0)
                
                if success:
                    bot.answer_callback_query(call.id, "Config saved!", show_alert=True)
                    # Return to admin user menu after saving
                    show_admin_user_menu(user_id, call.message.message_id, username)
                else:
                    bot.answer_callback_query(call.id, "Failed to save", show_alert=True)
                    show_config_grid(user_id, call.message.message_id, username)
    
    elif data.startswith("clear_config_"):
        if is_admin(user_id):
            username = data.replace("clear_config_", "")
            if 'admin_selections' in user_data[user_id] and username in user_data[user_id]['admin_selections']:
                user_data[user_id]['admin_selections'][username] = {'mines': [], 'gems': []}
            if 'temp_selection' in user_data[user_id]:
                user_data[user_id]['temp_selection'] = []
            bot.answer_callback_query(call.id, "Cleared", show_alert=False)
            show_config_grid(user_id, call.message.message_id, username)
    
    elif data.startswith("admin_set_mines_"):
        if is_admin(user_id):
            username = data.replace("admin_set_mines_", "")
            show_config_grid(user_id, call.message.message_id, username)
    
    elif data.startswith("admin_set_gems_"):
        if is_admin(user_id):
            username = data.replace("admin_set_gems_", "")
            show_config_grid(user_id, call.message.message_id, username)
    
    elif data.startswith("admin_auto_"):
        if is_admin(user_id):
            username = data.replace("admin_auto_", "")
            # Initialize polling state BEFORE starting thread
            if 'admin_polling' not in user_data[user_id]:
                user_data[user_id]['admin_polling'] = {}
            user_data[user_id]['admin_polling'][username] = True
            
            # Initialize message IDs
            if 'admin_message_ids' not in user_data[user_id]:
                user_data[user_id]['admin_message_ids'] = {}
            if username not in user_data[user_id]['admin_message_ids']:
                user_data[user_id]['admin_message_ids'][username] = []
            
            # Start polling thread
            thread = threading.Thread(target=poll_and_send_admin, args=(user_id, username), daemon=True)
            user_data[user_id][f'admin_polling_thread_{username}'] = thread
            thread.start()
            
            print(f"[Admin] Started polling thread for admin {user_id}, username: {username}")
            bot.answer_callback_query(call.id, "Started!", show_alert=False)
            
            # Update menu to show active status
            show_admin_user_menu(user_id, call.message.message_id, username)
    
    elif data.startswith("admin_stop_"):
        if is_admin(user_id):
            parts = data.split("_")
            target_admin_id = int(parts[2])
            username = "_".join(parts[3:])
            
            if target_admin_id == user_id:  # Security check
                # Stop polling
                if 'admin_polling' in user_data[user_id]:
                    user_data[user_id]['admin_polling'][username] = False
                
                # Delete all prediction messages
                if 'admin_message_ids' in user_data[user_id] and username in user_data[user_id]['admin_message_ids']:
                    for msg_id in user_data[user_id]['admin_message_ids'][username]:
                        try:
                            bot.delete_message(user_id, msg_id)
                        except:
                            pass
                    user_data[user_id]['admin_message_ids'][username] = []
                
                # Clear last prediction message ID
                if 'admin_last_prediction' in user_data[user_id] and username in user_data[user_id]['admin_last_prediction']:
                    del user_data[user_id]['admin_last_prediction'][username]
                
                # Show admin user menu again
                show_admin_user_menu(user_id, call.message.message_id, username)
                bot.answer_callback_query(call.id, "Predictions stopped", show_alert=False)
                # Delete the stop message
                try:
                    bot.delete_message(user_id, call.message.message_id)
                except:
                    pass
    
    elif data.startswith("admin_disconnect_"):
        if is_admin(user_id):
            username = data.replace("admin_disconnect_", "")
            # Stop polling if active
            if 'admin_polling' in user_data[user_id] and username in user_data[user_id]['admin_polling']:
                user_data[user_id]['admin_polling'][username] = False
            
            # Delete all messages
            if 'admin_message_ids' in user_data[user_id] and username in user_data[user_id]['admin_message_ids']:
                for msg_id in user_data[user_id]['admin_message_ids'][username]:
                    try:
                        bot.delete_message(user_id, msg_id)
                    except:
                        pass
                user_data[user_id]['admin_message_ids'][username] = []
            
            # Clear last prediction message ID
            if 'admin_last_prediction' in user_data[user_id] and username in user_data[user_id]['admin_last_prediction']:
                del user_data[user_id]['admin_last_prediction'][username]
            
            # Clear admin config username
            if 'admin_config_username' in user_data[user_id]:
                user_data[user_id]['admin_config_username'] = None
            
            bot.answer_callback_query(call.id, " Disconnected", show_alert=False)
            show_admin_config(user_id, call.message.message_id)
    
    elif data.startswith("admin_user_menu_"):
        if is_admin(user_id):
            username = data.replace("admin_user_menu_", "")
            show_admin_user_menu(user_id, call.message.message_id, username)


@bot.message_handler(commands=['start', 'admin', 'gen'])
def start_command(message):
    """Handle /start, /admin, and /gen commands"""
    user_id = message.from_user.id
    text = message.text or ''
    parts = text.split()
    command = parts[0] if parts else '/start'
    
    # Save user data
    name = f"{message.from_user.first_name or ''} {message.from_user.last_name or ''}".strip()
    username = message.from_user.username or "N/A"
    save_user(user_id, name, username)
    
    # Delete user's message
    delete_user_message(message.chat.id, message.message_id)
    
    # Initialize user data
    if user_id not in user_data:
        user_data[user_id] = {
            'username': None, 
            'last_mines': [], 
            'last_gems': [], 
            'is_polling': False,
            'message_ids': [],
            'waiting_username': False,
            'menu_message_id': None
        }
    
    # Handle /gen command (admin only)
    if command == '/gen' and is_admin(user_id):
        if len(parts) < 3:
            bot.send_message(user_id, "Usage: `/gen <plan> <duration>`\n\n*Plan Types:*\n• `s` - Silver\n• `d` - Diamond\n\n*Examples:*\n• `/gen s 1min` - Silver for 1 minute\n• `/gen d 1h` - Diamond for 1 hour\n• `/gen s 7d` - Silver for 7 days\n• `/gen d 1m` - Diamond for 1 month", parse_mode='Markdown')
            return
        
        plan_code = parts[1].lower()
        duration_str = parts[2].lower()
        
        # Map plan codes: 's' = silver, 'd' = diamond
        plan_map = {
            's': 'silver',
            'd': 'diamond'
        }
        
        if plan_code not in plan_map:
            bot.send_message(user_id, "Invalid plan code. Use: `s` (Silver) or `d` (Diamond)\n\nExample: `/gen s 1min` or `/gen d 1h`", parse_mode='Markdown')
            return
        
        plan_type = plan_map[plan_code]
        key, error = generate_key(plan_type, duration_str)
        if key:
            # Format duration display
            duration_display = duration_str
            bot.send_message(user_id, f"*Key Generated!*\n\n🔑 Key: `{key}`\n📦 Plan: {plan_type.upper()}\n Duration: {duration_display}", parse_mode='Markdown')
        else:
            bot.send_message(user_id, f"Error: {error}", parse_mode='Markdown')
        return
    
    # Check if admin command
    if command == '/admin' and is_admin(user_id):
        show_admin_menu(user_id)
    else:
        show_welcome_menu(user_id)


@bot.message_handler(func=lambda message: True)
def handle_message(message):
    """Handle text messages"""
    user_id = message.from_user.id
    text = message.text.strip()
    
    # Delete user's message
    delete_user_message(message.chat.id, message.message_id)
    
    # Initialize user data if not exists
    if user_id not in user_data:
        user_data[user_id] = {
            'username': None, 
            'last_mines': [], 
            'last_gems': [], 
            'is_polling': False,
            'message_ids': [],
            'waiting_username': False,
            'menu_message_id': None
        }
    
    if is_admin(user_id):
        if user_data[user_id].get('waiting_broadcast', False):
            user_data[user_id]['waiting_broadcast'] = False
            threading.Thread(target=run_broadcast, args=(user_id, text), daemon=True).start()
            return
        
        elif user_data[user_id].get('waiting_config_username', False):
            # Config username entered
            username = text
            user_data[user_id]['waiting_config_username'] = False
            # Store admin's configured username
            if 'admin_config_username' not in user_data[user_id]:
                user_data[user_id]['admin_config_username'] = {}
            user_data[user_id]['admin_config_username'] = username
            show_admin_user_menu(user_id, user_data[user_id].get('menu_message_id', None), username)
            return
    
    # Handle dashboard email login
    if user_data[user_id].get('waiting_login_email', False):
        if not text or '@' not in text:
            bot.send_message(user_id, "❌ Please enter a valid email address.")
            return
        
        email = text.strip().lower()
        
        user_data[user_id]['waiting_login_email'] = False
        user_data[user_id]['waiting_login_code'] = True  # Wait for password
        user_data[user_id]['pending_login_email'] = email
        
        prompt_msg_id = user_data[user_id].get('login_code_prompt_msg_id')
        msg_text = f"🔐 *Access Panel*\n\nEmail: `{email}`\n\nPlease enter your password.\n_If creating a new account, this will be your new password._"
        
        keyboard = types.InlineKeyboardMarkup()
        cancel_btn = types.InlineKeyboardButton("❌ Cancel", callback_data="cancel_activate")
        keyboard.add(cancel_btn)
        
        if prompt_msg_id:
            try:
                bot.edit_message_text(msg_text, user_id, prompt_msg_id, reply_markup=keyboard, parse_mode='Markdown')
            except Exception:
                sent = bot.send_message(user_id, msg_text, reply_markup=keyboard, parse_mode='Markdown')
                user_data[user_id]['login_code_prompt_msg_id'] = sent.message_id
        else:
            sent = bot.send_message(user_id, msg_text, reply_markup=keyboard, parse_mode='Markdown')
            user_data[user_id]['login_code_prompt_msg_id'] = sent.message_id
        return

    # Handle Password code entry for dashboard email login
    if user_data[user_id].get('waiting_login_code', False):
        password = (text or '').strip()
        email = str(user_data[user_id].get('pending_login_email') or '').strip().lower()
        if not email:
            user_data[user_id]['waiting_login_code'] = False
            bot.send_message(user_id, "❌ Login session expired. Please enter your email again.")
            return
            
        if not password or len(password) < 6:
            bot.send_message(user_id, "❌ Please enter a valid password (at least 6 characters).")
            return
            
        prompt_msg_id = user_data[user_id].get('login_code_prompt_msg_id')
        
        try:
            # 1. Try to login
            resp = requests.post(
                f"{BACKEND_URL}/user-login",
                json={"email": email, "password": password},
                headers={"Content-Type": "application/json"},
                timeout=8
            )
            data = resp.json() if resp.content else {}
            
            if resp.status_code == 200 and data.get('status') == 'success':
                # Login Success
                pass
            else:
                error_msg = data.get('message', '')
                
                # 2. If user not registered or legacy account without password, register/set password seamlessly
                if "User not registered" in error_msg or "Account created via OTP" in error_msg:
                    reg_resp = requests.post(
                        f"{BACKEND_URL}/register",
                        json={"email": email, "password": password},
                        headers={"Content-Type": "application/json"},
                        timeout=8
                    )
                    reg_data = reg_resp.json() if reg_resp.content else {}
                    
                    if reg_resp.status_code == 200 and reg_data.get('status') == 'success':
                        # Registration/Set Password Success
                        pass
                    else:
                        if prompt_msg_id:
                            bot.edit_message_text(f"❌ Failed to setup account: {reg_data.get('message') or 'Unknown error'}", user_id, prompt_msg_id)
                        else:
                            bot.send_message(user_id, f"❌ Failed to setup account: {reg_data.get('message') or 'Unknown error'}")
                        return
                else:
                    if prompt_msg_id:
                        bot.edit_message_text(f"❌ Login failed: {error_msg}", user_id, prompt_msg_id)
                    else:
                        bot.send_message(user_id, f"❌ Login failed: {error_msg}")
                    return

            user_data[user_id]['waiting_login_code'] = False
            user_data[user_id]['pending_login_email'] = None
            user_data[user_id]['username'] = email
            user_data[user_id]['login_email'] = email
            user_data[user_id]['login_success'] = True
            save_user_email(user_id, email)
            sync_plan_from_dashboard(user_id, force=True)
            plan_info = get_user_plan(user_id)
            dashboard_plan = (plan_info.get('dashboard_plan') or 'free').upper()

            confirm_text = f"""✅ *Login Successful*

Email: `{email}`
Subscription: *{dashboard_plan}*

You can now use predictors according to your subscription limits."""

            keyboard = types.InlineKeyboardMarkup(row_width=1)
            home_btn = types.InlineKeyboardButton("🏠 Home", callback_data="home_menu")
            keyboard.add(home_btn)

            if prompt_msg_id:
                bot.edit_message_text(confirm_text, user_id, prompt_msg_id, reply_markup=keyboard, parse_mode='Markdown')
                user_data[user_id]['menu_message_id'] = prompt_msg_id
            else:
                sent = bot.send_message(user_id, confirm_text, reply_markup=keyboard, parse_mode='Markdown')
                user_data[user_id]['menu_message_id'] = sent.message_id
            user_data[user_id]['login_code_prompt_msg_id'] = None
            
        except Exception as e:
            print(f"Error during login: {e}")
            bot.send_message(user_id, "❌ Unable to complete login right now. Please try again later.")
        return
    
    # Legacy activation flow disabled: OTP login is now the only email login path.
    if user_data[user_id].get('waiting_activation_key', False):
        user_data[user_id]['waiting_activation_key'] = False
        user_data[user_id]['waiting_login_email'] = True
        user_data[user_id]['waiting_login_code'] = False
        user_data[user_id]['pending_login_email'] = None
        user_data[user_id]['login_code_prompt_msg_id'] = None
        bot.send_message(user_id, "Please enter your dashboard email to receive a verification code.")
        return
    
    # Handle API token input (Demo/Silver plans)
    if user_data[user_id].get('waiting_token', False):
        if not text:
            bot.send_message(user_id, "Please enter a valid API token.")
            return
        
        api_token = text.strip()
        user_data[user_id]['waiting_token'] = False
        
        # Test connection by checking if extension is connected with this token
        try:
            # Check if extension is connected with this token
            check_response = requests.post(
                f"{BACKEND_URL}/check_extension",
                json={"token": api_token},
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if check_response.status_code == 200:
                check_data = check_response.json()
                if check_data.get('connected', False):
                    # Extension is connected, save token
                    user_data[user_id]['api_token'] = api_token
                    
                    # Try to get username from extension data
                    username = check_data.get('username', 'Connected')
                    if username and username != 'Connected':
                        user_data[user_id]['username'] = username
                    else:
                        user_data[user_id]['username'] = 'Connected'
                    
                    # Connection successful - remove token prompt and show predictor menu in a fresh message
                    username = user_data[user_id]['username']
                    prompt_msg_id = user_data[user_id].get('menu_message_id')
                    if prompt_msg_id:
                        delete_user_message(user_id, prompt_msg_id)
                        user_data[user_id]['menu_message_id'] = None
                    show_premium_menu(user_id, None, username)
                else:
                    error_text = f"""
The extension is not connected with this API token.

Please make sure:
1. You have installed the Soul Predictor extension
2. You have entered this same API token in the extension
3. The extension is connected on Stake
"""
                    
                    keyboard = types.InlineKeyboardMarkup()
                    retry_btn = types.InlineKeyboardButton("Retry", callback_data="add_token")
                    cancel_btn = types.InlineKeyboardButton("? Abort", callback_data="cancel_connect")
                    keyboard.add(retry_btn, cancel_btn)
                    
                    if user_data[user_id].get('menu_message_id'):
                        bot.edit_message_text(error_text, user_id, user_data[user_id]['menu_message_id'], 
                                            reply_markup=keyboard, parse_mode='Markdown')
                    else:
                        bot.send_message(user_id, error_text, reply_markup=keyboard, parse_mode='Markdown')
            else:
                raise Exception("Backend connection failed")
        except Exception as e:
            print(f"Connection error: {e}")
            error_text = f"""*Connection Error*

Could not verify connection. Please try again.

Make sure:
1. The extension is installed and connected
2. You entered the correct API token
3. Your internet connection is stable"""
            
            keyboard = types.InlineKeyboardMarkup()
            retry_btn = types.InlineKeyboardButton("Retry", callback_data="add_token")
            cancel_btn = types.InlineKeyboardButton("? Abort", callback_data="cancel_connect")
            keyboard.add(retry_btn, cancel_btn)
            
            if user_data[user_id].get('menu_message_id'):
                bot.edit_message_text(error_text, user_id, user_data[user_id]['menu_message_id'], 
                                    reply_markup=keyboard, parse_mode='Markdown')
            else:
                bot.send_message(user_id, error_text, reply_markup=keyboard, parse_mode='Markdown')
        return
    
    # Handle username input (Diamond plan only)
    if user_data[user_id].get('waiting_username', False):
        plan_info = get_user_plan(user_id)
        plan_type = plan_info['plan']
        
        if plan_type != 'diamond':
            # Should not happen, but handle it
            user_data[user_id]['waiting_username'] = False
            return
        
        if not text:
            bot.send_message(user_id, "Please enter a valid username.")
            return
        
        username = text.strip()
        user_data[user_id]['waiting_username'] = False
        
        # Test connection
        mines, gems = fetch_auto_locations(username)
        if mines is not None:
            user_data[user_id]['username'] = username
            
            success_text = f"""*Connection Successful!*

Username: `{username}`
Status: Connected
Your Stake account has been successfully connected!"""

            keyboard = types.InlineKeyboardMarkup()
            continue_btn = types.InlineKeyboardButton("Continue", callback_data="continue_to_menu")
            keyboard.add(continue_btn)
            
            if user_data[user_id].get('menu_message_id'):
                bot.edit_message_text(success_text, user_id, user_data[user_id]['menu_message_id'], 
                                    reply_markup=keyboard, parse_mode='Markdown')
            else:
                sent = bot.send_message(user_id, success_text, reply_markup=keyboard, parse_mode='Markdown')
                user_data[user_id]['menu_message_id'] = sent.message_id
        else:
            error_text = f"""*Connection Failed*

Username: `{username}`

Please check your username and try again."""

            keyboard = types.InlineKeyboardMarkup()
            retry_btn = types.InlineKeyboardButton("Retry", callback_data="connect")
            cancel_btn = types.InlineKeyboardButton("? Abort", callback_data="cancel_connect")
            keyboard.add(retry_btn, cancel_btn)
            
            if user_data[user_id].get('menu_message_id'):
                bot.edit_message_text(error_text, user_id, user_data[user_id]['menu_message_id'], 
                                    reply_markup=keyboard, parse_mode='Markdown')
            else:
                bot.send_message(user_id, error_text, reply_markup=keyboard, parse_mode='Markdown')
    else:
        # Not waiting for input, show welcome menu
        show_welcome_menu(user_id)


if __name__ == '__main__':
    print("Telegram bot started!")
    print("Make sure to set BOT_TOKEN in the script.")
    reset_demo_limits_for_all_users(force=False)
    threading.Thread(target=run_demo_limit_maintenance, daemon=True).start()
    bot.polling(none_stop=True)
