import os
from supabase import create_client, Client
import json
import time
import base64
import bcrypt
import uuid
import random
import re
from datetime import datetime, timedelta, timezone
import threading

# Helper function to normalize datetime strings
def normalize_datetime_string(dt_str):
    """Normalize datetime string to handle microseconds correctly"""
    if not dt_str:
        return dt_str
    
    # Handle Z suffix
    if dt_str.endswith('Z'):
        dt_str = dt_str.replace('Z', '+00:00')
    
    # Handle microseconds normalization
    if '+' in dt_str:
        parts = dt_str.split('+')
        if '.' in parts[0]:
            datetime_part, ms_part = parts[0].split('.')
            # Pad or truncate microseconds to exactly 6 digits
            if len(ms_part) < 6:
                ms_part = ms_part.ljust(6, '0')
            else:
                ms_part = ms_part[:6]
            dt_str = f"{datetime_part}.{ms_part}+{parts[1]}"
    
    return dt_str
from telethon.sync import TelegramClient
from telethon.sessions import StringSession, SQLiteSession
from telethon.errors import (
    UserDeactivatedBanError,
    AuthKeyUnregisteredError,
    UserDeactivatedError,
    SessionRevokedError,
    UserBannedInChannelError,
    PhoneNumberBannedError,
    FloodWaitError,
    InviteHashExpiredError,
    InviteRequestSentError,
    UserAlreadyParticipantError,
    ChatWriteForbiddenError
)
from telethon.tl.functions.channels import JoinChannelRequest
import asyncio
from telethon import TelegramClient as AsyncTelegramClient
import concurrent.futures

class SupabaseHelper:
    def __init__(self):
        self.url = "https://zbfncnpfruwavuaqntye.supabase.co"
        self.key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZm5jbnBmcnV3YXZ1YXFudHllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjEzMTYyMywiZXhwIjoyMDY3NzA3NjIzfQ.OH4BiH9nX_1-RHKTg_X7qaDptCZoKbscNEOiAWiz-y4"
        self.supabase: Client = create_client(self.url, self.key)
        self.buckets = {
            'session': 'sessions',
            'api': 'api-files',
            'group': 'group-files'
        }
        
        # Start cleanup thread for expired users
        cleanup_thread = threading.Thread(target=self._cleanup_expired_users, daemon=True)
        cleanup_thread.start()



    def verify_user_by_password(self, password, device_id=None):
        """Verify user by password and device ID, and check status"""
        try:
            # Get user by plain password
            response = self.supabase.table('users').select('*').eq('password', password).execute()
            
            if response.data and len(response.data) > 0:
                user = response.data[0]
                # Do NOT check ban/suspend here; let backend handle it for proper error message
                # Check if user is expired
                if user.get('expires_at'):
                    try:
                        expires_at_str = normalize_datetime_string(user['expires_at'])
                        expires_at = datetime.fromisoformat(expires_at_str)
                        if datetime.now(expires_at.tzinfo) >= expires_at:
                            # Mark user as expired
                            self.supabase.table('users').update({
                                'is_expired': True
                            }).eq('id', user['id']).execute()
                            return None
                    except ValueError as e:
                        print(f"Warning: Invalid datetime format for user {user.get('id', 'unknown')}: {e}")
                        # Skip expiration check if datetime is invalid

                # If device_id provided, update it but don't block authentication
                if device_id:
                    # Handle both old device_id and new device_ids
                    stored_device_id = user.get('device_id')
                    stored_device_ids = user.get('device_ids', [])
                    
                    # If device_ids column doesn't exist yet, fall back to old device_id logic
                    if stored_device_ids is None:
                        # Use old single device ID logic - just update it
                        self.supabase.table('users').update({
                            'device_id': device_id,
                            'last_login': datetime.now(timezone.utc).isoformat()
                        }).eq('id', user['id']).execute()
                    else:
                        # New multi-device logic - just add/update device ID
                        if not stored_device_ids:
                            stored_device_ids = []
                        
                        # Add device ID if not already present (limit to 8 devices)
                        if device_id not in stored_device_ids:
                            if len(stored_device_ids) >= 8:
                                # Remove oldest device ID if at limit
                                stored_device_ids.pop(0)
                            stored_device_ids.append(device_id)
                        
                        self.supabase.table('users').update({
                            'device_ids': stored_device_ids,
                            'last_login': datetime.now(timezone.utc).isoformat()
                        }).eq('id', user['id']).execute()
                else:
                    # Update last login time even without device ID
                    self.supabase.table('users').update({
                        'last_login': datetime.now(timezone.utc).isoformat()
                    }).eq('id', user['id']).execute()
                
                return user
            return None
        except Exception as e:
            print(f"Error verifying user: {str(e)}")
            # Add delay on resource errors to prevent overwhelming the system
            if "Resource temporarily unavailable" in str(e) or "Errno 11" in str(e):
                time.sleep(1)  # Wait 1 second before retrying
            return None

    def cleanup_old_device_auths(self, user_id):
        """Clean up expired device auths for a user"""
        try:
            # Delete expired device auths
            self.supabase.table('device_auth').delete().eq('user_id', user_id).lt(
                'last_active', 
                (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
            ).execute()
        except Exception as e:
            print(f"Error cleaning up device auths: {str(e)}")
            # Add delay on resource errors
            if "Resource temporarily unavailable" in str(e) or "Errno 11" in str(e):
                time.sleep(1)

    def verify_device_auth(self, device_id, password):
        """Verify device authentication"""
        try:
            response = self.supabase.table('device_auth').select('*').eq('device_id', device_id).eq('password', password).execute()
            
            if not response.data:
                return None
                
            auth = response.data[0]
            
            # Check expiry
            if auth.get('expires_at'):
                try:
                    expires_at_str = normalize_datetime_string(auth['expires_at'])
                    expires_at = datetime.fromisoformat(expires_at_str)
                    if datetime.now(expires_at.tzinfo) >= expires_at:
                        # Delete expired auth
                        self.supabase.table('device_auth').delete().eq('id', auth['id']).execute()
                        return None
                except ValueError as e:
                    print(f"Warning: Invalid datetime format for device auth {auth.get('id', 'unknown')}: {e}")
                    # Skip expiry check if datetime is invalid
            
            # Update last active
            self.supabase.table('device_auth').update({
                'last_active': datetime.now(timezone.utc).isoformat()
            }).eq('id', auth['id']).execute()
            
            return auth['user_id']
        except Exception as e:
            print(f"Error verifying device auth: {str(e)}")
            # Add delay on resource errors
            if "Resource temporarily unavailable" in str(e) or "Errno 11" in str(e):
                time.sleep(1)
            return None

    def get_available_sessions(self):
        """Get list of all session files from container's sessions directory"""
        try:
            sessions_dir = "/home/container/sessions"
            if not os.path.exists(sessions_dir):
                os.makedirs(sessions_dir)
            
            # List all .session files in the directory
            session_files = [f for f in os.listdir(sessions_dir) if f.endswith('.session')]
            print(f"[DEBUG] Session files found in container: {session_files}")
            return session_files
        except Exception as e:
            print(f"Error getting sessions: {str(e)}")
            return []

    def validate_session_count(self, requested_count):
        """Validate if requested number of sessions is available
        Args:
            requested_count (int): Number of sessions requested
        Returns:
            tuple: (bool, str) - (is_valid, error_message)
        """
        try:
            print(f"[DEBUG] validate_session_count called with: {requested_count} (type: {type(requested_count)})")
            
            # Handle None or invalid input
            if requested_count is None:
                requested_count = 0
                print(f"[DEBUG] Converted None to 0")
            else:
                try:
                    requested_count = int(requested_count)
                    print(f"[DEBUG] Converted to int: {requested_count}")
                except (ValueError, TypeError) as e:
                    requested_count = 0
                    print(f"[DEBUG] Conversion failed: {e}, set to 0")
            
            available_sessions = self.get_available_sessions()
            available_count = len(available_sessions)
            print(f"[DEBUG] Available sessions: {available_count}")
            
            print(f"[DEBUG] Comparing {requested_count} > {available_count}")
            if requested_count > available_count:
                return False, f"Error: Requested {requested_count} sessions but only {available_count} available"
                
            return True, None
        except Exception as e:
            print(f"Error validating session count: {str(e)}")
            return False, "Error validating session count"

    def get_api_credentials(self):
        """Get list of all API credentials from local directory (multi-line, multi-file, flexible format)"""
        try:
            api_creds = []
            api_dir = "/home/container/apicreds"
            
            if not os.path.exists(api_dir):
                print(f"[DEBUG] API credentials directory {api_dir} does not exist")
                return []
            
            files = [f for f in os.listdir(api_dir) if f.endswith('.txt')]
            
            for filename in files:
                try:
                    file_path = os.path.join(api_dir, filename)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    lines = content.splitlines()
                    for line in lines:
                        line = line.strip()
                        if not line or '|' not in line:
                            continue
                        # Support spaces around |
                        match = re.match(r'^(\d+)\s*\|\s*([a-zA-Z0-9]+)$', line)
                        if match:
                            api_id, api_hash = match.groups()
                            api_creds.append({
                                'api_id': api_id,
                                'api_hash': api_hash,
                                'file_name': filename
                            })
                        else:
                            # fallback: split by | and strip
                            parts = line.split('|')
                            if len(parts) == 2:
                                api_creds.append({
                                    'api_id': parts[0].strip(),
                                    'api_hash': parts[1].strip(),
                                    'file_name': filename
                                })
                except Exception as e:
                    print(f"[DEBUG] Failed to parse API file {filename}: {e}")
                    continue
            
            print(f"[DEBUG] API creds found: {api_creds}")
            return api_creds
        except Exception as e:
            print(f"Error getting API credentials: {str(e)}")
            return []

    def assign_random_sessions(self, user_id, max_sessions, is_custom_user=False):
        """Assign random sessions to a user from container directory, and extract Telegram user info for each session (sync, thread-safe, event-loop safe)."""
        def extract_telegram_user_info(session_path, api_id, api_hash):
            async def get_info():
                try:
                    # Try SQLite session
                    try:
                        client = TelegramClient(session_path, api_id, api_hash)
                        await client.start()
                    except Exception:
                        # Try string session
                        with open(session_path, 'r') as f:
                            session_str = f.read().strip()
                        client = TelegramClient(StringSession(session_str), api_id, api_hash)
                        await client.start()
                    me = await client.get_me()
                    await client.disconnect()
                    return {
                        'user_id': me.id,
                        'first_name': me.first_name,
                        'last_name': me.last_name,
                        'username': me.username,
                        'phone': me.phone,
                    }
                except Exception as e:
                    return {}
            # Always run in a separate thread to avoid event loop conflicts
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(lambda: asyncio.run(get_info()))
                return future.result()
        
        def validate_session_sync(session_name, api_id, api_hash):
            """Validate session by testing if it can join group and send messages"""
            async def validate():
                test_chat_id = "5758343460"
                target_group = "NIGGATESETGRPS"  # The target group to join and send messages
                client = None
                
                # Random messages for testing
                random_messages = ["hi", "hello", "testing", "bot test", "session validation", "check", "ok", "working"]
                
                try:
                    # Use session name without .session extension
                    session_path = f"/home/container/sessions/{session_name.replace('.session', '')}"
                    client = TelegramClient(session_path, api_id, api_hash)
                    await client.connect()
                    if not await client.is_user_authorized():
                        print(f"[ERROR] Session {session_name} is not authorized")
                        return False, "Session not authorized"
                    
                    # Get session info to verify it's working
                    try:
                        me = await client.get_me()
                        if not me:
                            print(f"[ERROR] Session {session_name} could not get user info")
                            return False, "Could not get session user info"
                        print(f"[INFO] Session {session_name} connected as: {me.first_name} {me.last_name or ''} (@{me.username or 'no_username'})")
                    except Exception as e:
                        print(f"[ERROR] Session {session_name} failed to get user info: {str(e)}")
                        return False, f"Failed to get session info: {str(e)}"
                    
                    # Step 1: Try to join the target group
                    try:
                        print(f"[INFO] Session {session_name} attempting to join group @{target_group}")
                        await client(JoinChannelRequest(target_group))
                        print(f"[INFO] Session {session_name} successfully joined group @{target_group}")
                    except UserAlreadyParticipantError:
                        print(f"[INFO] Session {session_name} already a member of group @{target_group}")
                    except InviteHashExpiredError:
                        print(f"[ERROR] Session {session_name} failed to join group - invite expired")
                        return False, "Group invite expired"
                    except InviteRequestSentError:
                        print(f"[INFO] Session {session_name} join request sent to group @{target_group}")
                    except Exception as e:
                        print(f"[ERROR] Session {session_name} failed to join group: {str(e)}")
                        # Continue with validation even if join fails
                    
                    # Step 2: Try to send a personal test message to the original chat ID
                    try:
                        print(f"[INFO] Session {session_name} attempting to send personal message to {test_chat_id}")
                        personal_message = await client.send_message(test_chat_id, "Session validation test - Personal message")
                        
                        if not (personal_message and personal_message.id):
                            print(f"[ERROR] Session {session_name} personal message sent but no confirmation received")
                            return False, "Personal message sent but no confirmation received"
                            
                    except FloodWaitError as e:
                        await client.disconnect()
                        print(f"[ERROR] Session {session_name} FloodWait for {e.seconds} seconds")
                        return False, f"Rate limited (flood wait {e.seconds}s)"
                        
                    except (UserBannedInChannelError, UserDeactivatedBanError, PhoneNumberBannedError) as e:
                        await client.disconnect()
                        print(f"[ERROR] Session {session_name} banned: {type(e).__name__}")
                        return False, f"Banned session: {type(e).__name__}"
                        
                    except Exception as e:
                        print(f"[WARNING] Session {session_name} failed to send personal message: {str(e)}")
                        # Continue with group message test
                    
                    # Step 3: Try to send a random message to the group
                    try:
                        # Get the group entity
                        group_entity = await client.get_entity(f"@{target_group}")
                        
                        # Select a random message
                        random_message = random.choice(random_messages)
                        print(f"[INFO] Session {session_name} attempting to send message '{random_message}' to group @{target_group}")
                        
                        group_message = await client.send_message(group_entity, random_message)
                        
                        if group_message and group_message.id:
                            await client.disconnect()
                            print(f"[SUCCESS] Session {session_name} validation successful - joined group and sent message '{random_message}'")
                            return True, None
                        else:
                            await client.disconnect()
                            print(f"[ERROR] Session {session_name} group message sent but no confirmation received")
                            return False, "Group message sent but no confirmation received"
                            
                    except FloodWaitError as e:
                        await client.disconnect()
                        print(f"[ERROR] Session {session_name} FloodWait for {e.seconds} seconds")
                        return False, f"Rate limited (flood wait {e.seconds}s)"
                        
                    except (UserBannedInChannelError, UserDeactivatedBanError, PhoneNumberBannedError) as e:
                        await client.disconnect()
                        print(f"[ERROR] Session {session_name} banned: {type(e).__name__}")
                        return False, f"Banned session: {type(e).__name__}"
                        
                    except ChatWriteForbiddenError:
                        await client.disconnect()
                        print(f"[ERROR] Session {session_name} cannot write to group")
                        return False, "Cannot write to group (write forbidden)"
                        
                    except Exception as e:
                        await client.disconnect()
                        error_msg = str(e)
                        print(f"[ERROR] Session {session_name} failed to send group message: {error_msg}")
                        
                        # Handle specific Telegram errors
                        if "CHAT_WRITE_FORBIDDEN" in error_msg:
                            return False, "Cannot send message to group (write forbidden)"
                        elif "USER_DEACTIVATED" in error_msg:
                            return False, "User account deactivated"
                        elif "SESSION_REVOKED" in error_msg:
                            return False, "Session revoked"
                        elif "AUTH_KEY_UNREGISTERED" in error_msg:
                            return False, "Auth key unregistered"
                        elif "FLOOD_WAIT" in error_msg:
                            return False, "Rate limited (flood wait)"
                        elif "USER_BANNED_IN_CHANNEL" in error_msg:
                            return False, "User banned in channel"
                        elif "PHONE_NUMBER_BANNED" in error_msg:
                            return False, "Phone number banned"
                        else:
                            return False, f"Failed to send group message: {error_msg}"
                        
                except Exception as e:
                    if client:
                        try:
                            await client.disconnect()
                        except:
                            pass
                    error_msg = str(e)
                    print(f"[ERROR] Session {session_name} connection failed: {error_msg}")
                    
                    # Handle connection errors
                    if "AUTH_KEY_UNREGISTERED" in error_msg:
                        return False, "Auth key unregistered - session invalid"
                    elif "SESSION_REVOKED" in error_msg:
                        return False, "Session revoked - needs re-authentication"
                    elif "USER_DEACTIVATED" in error_msg:
                        return False, "User account deactivated"
                    else:
                        return False, f"Connection failed: {error_msg}"
            
            # Run in thread to avoid event loop conflicts
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(lambda: asyncio.run(validate()))
                return future.result()
        
        if max_sessions is None or not isinstance(max_sessions, int):
            max_sessions = 0
        available_sessions = self.get_available_sessions()
        if not available_sessions:
            print("No available sessions found in container")
            return False
        all_users = self.get_users()
        assigned_sessions = set()
        for user in all_users:
            if user.get('assigned_sessions'):
                for session in user['assigned_sessions']:
                    # Handle both object and string session formats
                    if isinstance(session, dict):
                        session_name = session.get('session_name', '')
                    else:
                        session_name = str(session)
                    if session_name:
                        assigned_sessions.add(session_name)
        unassigned_sessions = [s for s in available_sessions if s not in assigned_sessions]
        if not unassigned_sessions:
            print("No unassigned sessions available")
            return False
        api_creds = self.get_api_credentials()
        if not api_creds:
            print("No API credentials found")
            return False
        print(f"[DEBUG] Assigning {max_sessions} sessions from {len(unassigned_sessions)} unassigned")
        selected_sessions = random.sample(unassigned_sessions, min(max_sessions, len(unassigned_sessions)))
        session_configs = []
        bad_sessions = []
        
        for i, session_name in enumerate(selected_sessions):
            api_cred = api_creds[i % len(api_creds)]
            session_path = f"/home/container/sessions/{session_name}"
            
            # Validate session first
            is_valid, error_msg = validate_session_sync(session_name, api_cred['api_id'], api_cred['api_hash'])
            if not is_valid:
                print(f"[WARN] Session {session_name} failed validation: {error_msg}")
                bad_sessions.append(session_name)
                # Move to errors directory
                try:
                    import shutil
                    # Handle session file paths correctly
                    if session_name.endswith('.session'):
                        # If session_name already has .session extension
                        source_path = f"/home/container/sessions/{session_name}"
                        error_path = f"/home/container/errorsessions/{session_name}"
                    else:
                        # If session_name doesn't have .session extension
                        source_path = f"/home/container/sessions/{session_name}.session"
                        error_path = f"/home/container/errorsessions/{session_name}.session"
                    
                    if os.path.exists(source_path):
                        shutil.move(source_path, error_path)
                        print(f"[INFO] Moved bad session {session_name} to errors directory")
                    else:
                        print(f"[ERROR] Session file not found: {source_path}")
                except Exception as e:
                    print(f"[ERROR] Failed to move bad session {session_name}: {e}")
                continue
            
            user_info = {}
            try:
                # Call the async helper in a thread-safe way
                user_info = extract_telegram_user_info(session_path, api_cred['api_id'], api_cred['api_hash'])
                
                # Create session config
                session_config = {
                    'session_name': session_name,
                    'api_id': api_cred['api_id'],
                    'api_hash': api_cred['api_hash'],
                    'session_path': session_path,
                    'telegram_user': user_info
                }
                
                # For custom users, just use file paths like normal sessions
                # No need to store session_content - let the bot read from file directly
                session_configs.append(session_config)
            except Exception as e:
                print(f"[WARN] Could not extract Telegram user info for session {session_name}: {e}")
        
        print(f"[DEBUG] Assigned sessions: {session_configs}")
        print(f"[DEBUG] Bad sessions moved to errors: {bad_sessions}")
        
        # Update user with valid sessions only
        self.supabase.table('users').update({
            'assigned_sessions': session_configs
        }).eq('id', user_id).execute()
        
        # Log if bad sessions were found
        if bad_sessions:
            self.supabase.table('user_logs').insert({
                'user_id': user_id,
                'status': 'warning',
                'message': f'Session assignment completed. {len(bad_sessions)} sessions failed validation and were moved to errors.',
                'timestamp': datetime.now(timezone.utc).isoformat()
            }).execute()
        
        return True

    def assign_custom_sessions(self, user_id, custom_session_files):
        """Assign custom session files to a user from custom user directory"""
        def extract_telegram_user_info(session_path, api_id, api_hash):
            async def get_info():
                try:
                    # Try SQLite session
                    try:
                        client = TelegramClient(session_path, api_id, api_hash)
                        await client.start()
                    except Exception:
                        # Try string session
                        with open(session_path, 'r') as f:
                            session_str = f.read().strip()
                        client = TelegramClient(StringSession(session_str), api_id, api_hash)
                        await client.start()
                    me = await client.get_me()
                    await client.disconnect()
                    return {
                        'user_id': me.id,
                        'first_name': me.first_name,
                        'last_name': me.last_name,
                        'username': me.username,
                        'phone': me.phone,
                    }
                except Exception as e:
                    return {}
            # Always run in a separate thread to avoid event loop conflicts
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(lambda: asyncio.run(get_info()))
                return future.result()
        
        def validate_custom_session_sync(session_name, api_id, api_hash):
            """Validate custom session by testing if it can join group and send messages"""
            async def validate():
                target_group = "NIGGATESETGRPS"  # The target group to join and send messages
                client = None
                
                # Random messages for testing
                random_messages = ["hi", "hello", "testing", "bot test", "session validation", "check", "ok", "working"]
                
                try:
                    # Use custom session path
                    session_path = f"/home/container/customuser/{session_name}"
                    client = TelegramClient(session_path, api_id, api_hash)
                    await client.connect()
                    if not await client.is_user_authorized():
                        print(f"[ERROR] Custom session {session_name} is not authorized")
                        return False, "Session not authorized"
                    
                    # Get session info to verify it's working
                    try:
                        me = await client.get_me()
                        if not me:
                            print(f"[ERROR] Custom session {session_name} could not get user info")
                            return False, "Could not get session user info"
                        print(f"[INFO] Custom session {session_name} connected as: {me.first_name} {me.last_name or ''} (@{me.username or 'no_username'})")
                    except Exception as e:
                        print(f"[ERROR] Custom session {session_name} failed to get user info: {str(e)}")
                        return False, f"Failed to get session info: {str(e)}"
                    
                    # Step 1: Try to join the target group
                    try:
                        print(f"[INFO] Custom session {session_name} attempting to join group @{target_group}")
                        await client(JoinChannelRequest(target_group))
                        print(f"[INFO] Custom session {session_name} successfully joined group @{target_group}")
                    except UserAlreadyParticipantError:
                        print(f"[INFO] Custom session {session_name} already a member of group @{target_group}")
                    except InviteHashExpiredError:
                        print(f"[ERROR] Custom session {session_name} failed to join group - invite expired")
                        return False, "Group invite expired"
                    except InviteRequestSentError:
                        print(f"[INFO] Custom session {session_name} join request sent to group @{target_group}")
                    except Exception as e:
                        print(f"[ERROR] Custom session {session_name} failed to join group: {str(e)}")
                        # Continue with validation even if join fails
                    
                    # Step 2: Try to send a random message to the group
                    try:
                        # Get the group entity
                        group_entity = await client.get_entity(f"@{target_group}")
                        
                        # Select a random message
                        random_message = random.choice(random_messages)
                        print(f"[INFO] Custom session {session_name} attempting to send message '{random_message}' to group @{target_group}")
                        
                        group_message = await client.send_message(group_entity, random_message)
                        
                        if group_message and group_message.id:
                            await client.disconnect()
                            print(f"[SUCCESS] Custom session {session_name} validation successful - joined group and sent message '{random_message}'")
                            return True, None
                        else:
                            await client.disconnect()
                            print(f"[ERROR] Custom session {session_name} group message sent but no confirmation received")
                            return False, "Group message sent but no confirmation received"
                            
                    except FloodWaitError as e:
                        await client.disconnect()
                        print(f"[ERROR] Custom session {session_name} FloodWait for {e.seconds} seconds")
                        return False, f"Rate limited (flood wait {e.seconds}s)"
                        
                    except (UserBannedInChannelError, UserDeactivatedBanError, PhoneNumberBannedError) as e:
                        await client.disconnect()
                        print(f"[ERROR] Custom session {session_name} banned: {type(e).__name__}")
                        return False, f"Banned session: {type(e).__name__}"
                        
                    except ChatWriteForbiddenError:
                        await client.disconnect()
                        print(f"[ERROR] Custom session {session_name} cannot write to group")
                        return False, "Cannot write to group (write forbidden)"
                        
                    except Exception as e:
                        await client.disconnect()
                        error_msg = str(e)
                        print(f"[ERROR] Custom session {session_name} failed to send group message: {error_msg}")
                        
                        # Handle specific Telegram errors
                        if "CHAT_WRITE_FORBIDDEN" in error_msg:
                            return False, "Cannot send message to group (write forbidden)"
                        elif "USER_DEACTIVATED" in error_msg:
                            return False, "User account deactivated"
                        elif "SESSION_REVOKED" in error_msg:
                            return False, "Session revoked"
                        elif "AUTH_KEY_UNREGISTERED" in error_msg:
                            return False, "Auth key unregistered"
                        elif "FLOOD_WAIT" in error_msg:
                            return False, "Rate limited (flood wait)"
                        elif "USER_BANNED_IN_CHANNEL" in error_msg:
                            return False, "User banned in channel"
                        elif "PHONE_NUMBER_BANNED" in error_msg:
                            return False, "Phone number banned"
                        else:
                            return False, f"Failed to send group message: {error_msg}"
                        
                except Exception as e:
                    if client:
                        try:
                            await client.disconnect()
                        except:
                            pass
                    error_msg = str(e)
                    print(f"[ERROR] Custom session {session_name} connection failed: {error_msg}")
                    
                    # Handle connection errors
                    if "AUTH_KEY_UNREGISTERED" in error_msg:
                        return False, "Auth key unregistered - session invalid"
                    elif "SESSION_REVOKED" in error_msg:
                        return False, "Session revoked - needs re-authentication"
                    elif "USER_DEACTIVATED" in error_msg:
                        return False, "User account deactivated"
                    else:
                        return False, f"Connection failed: {error_msg}"
            
            # Run in thread to avoid event loop conflicts
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(lambda: asyncio.run(validate()))
                return future.result()
        
        print(f"[DEBUG] Assigning {len(custom_session_files)} custom sessions to user {user_id}")
        
        # Get API credentials
        api_creds = self.get_api_credentials()
        if not api_creds:
            print("No API credentials found")
            return False
        
        session_configs = []
        bad_sessions = []
        
        for i, session_name in enumerate(custom_session_files):
            api_cred = api_creds[i % len(api_creds)]
            session_path = f"/home/container/customuser/{session_name}"
            
            # Validate session first
            is_valid, error_msg = validate_custom_session_sync(session_name, api_cred['api_id'], api_cred['api_hash'])
            if not is_valid:
                print(f"[WARN] Custom session {session_name} failed validation: {error_msg}")
                bad_sessions.append(session_name)
                # Move to custom errors directory
                try:
                    import shutil
                    # Handle session file paths correctly
                    if session_name.endswith('.session'):
                        # If session_name already has .session extension
                        source_path = f"/home/container/customuser/{session_name}"
                        error_path = f"/home/container/customusererror/{session_name}"
                    else:
                        # If session_name doesn't have .session extension
                        source_path = f"/home/container/customuser/{session_name}.session"
                        error_path = f"/home/container/customusererror/{session_name}.session"
                    
                    if os.path.exists(source_path):
                        # Create custom error directory if it doesn't exist
                        custom_error_dir = "/home/container/customusererror"
                        if not os.path.exists(custom_error_dir):
                            os.makedirs(custom_error_dir)
                        
                        shutil.move(source_path, error_path)
                        print(f"[INFO] Moved bad custom session {session_name} to custom errors directory")
                    else:
                        print(f"[ERROR] Custom session file not found: {source_path}")
                except Exception as e:
                    print(f"[ERROR] Failed to move bad custom session {session_name}: {e}")
                continue
            
            user_info = {}
            try:
                # Call the async helper in a thread-safe way
                user_info = extract_telegram_user_info(session_path, api_cred['api_id'], api_cred['api_hash'])
                
                # Create session config
                session_config = {
                    'session_name': session_name,
                    'api_id': api_cred['api_id'],
                    'api_hash': api_cred['api_hash'],
                    'session_path': session_path,
                    'telegram_user': user_info,
                    'is_custom_session': True  # Mark as custom session
                }
                
                session_configs.append(session_config)
            except Exception as e:
                print(f"[WARN] Could not extract Telegram user info for custom session {session_name}: {e}")
        
        print(f"[DEBUG] Assigned custom sessions: {session_configs}")
        print(f"[DEBUG] Bad custom sessions moved to errors: {bad_sessions}")
        
        # Update user with valid custom sessions only
        self.supabase.table('users').update({
            'assigned_sessions': session_configs
        }).eq('id', user_id).execute()
        
        # Log if bad sessions were found
        if bad_sessions:
            self.supabase.table('user_logs').insert({
                'user_id': user_id,
                'status': 'warning',
                'message': f'Custom session assignment completed. {len(bad_sessions)} sessions failed validation and were moved to custom errors.',
                'timestamp': datetime.now(timezone.utc).isoformat()
            }).execute()
        
        return True

    def create_user(self, data):
        """Create a new user with expiry time and auto-create bot (sync)"""
        try:
            # Validate required data
            if not data.get('password'):
                print("Password is required")
                return None

            # Validate plan
            plan = data.get('plan', 'bronze')
            valid_plans = [
                'bronze', 'silver', 'gold', 'diamond',
                'enterprise_basic', 'enterprise_pro', 'enterprise_elite', 'custom'
            ]
            if plan not in valid_plans:
                print(f"Invalid plan: {plan}")
                return None

            # Calculate expiry time if duration provided
            expires_at = None
            duration_hours = 0
            if 'duration_hours' in data and data['duration_hours'] is not None and data['duration_hours'] > 0:
                duration_hours = data['duration_hours']
                expires_at = datetime.now(timezone.utc) + timedelta(hours=duration_hours)

            # Get plan configuration
            plan_config = self.supabase.table('plan_configs').select('*').eq('plan', str(plan)).execute()
            if not plan_config.data:
                print("Failed to get plan configuration")
                return None
            max_sessions = plan_config.data[0]['max_sessions']

            # Check if enough unassigned sessions are available BEFORE creating user
            # BUT skip this check if using custom sessions
            if not data.get('use_custom_sessions'):
                available_sessions = self.get_available_sessions()
                all_users = self.get_users()
                assigned_sessions = set()
                for user in all_users:
                    if user.get('assigned_sessions'):
                        for session in user['assigned_sessions']:
                            # Handle both object and string session formats
                            if isinstance(session, dict):
                                session_name = session.get('session_name', '')
                            else:
                                session_name = str(session)
                            if session_name:
                                assigned_sessions.add(session_name)
                unassigned_sessions = [s for s in available_sessions if s not in assigned_sessions]
                if len(unassigned_sessions) < max_sessions:
                    print("User can't be created: no sessions available")
                    return {"error": "User can't be created: no sessions available"}
            else:
                print(f"[DEBUG] Using custom sessions, skipping session availability check")
                # For custom sessions, use the actual uploaded count instead of plan's default
                custom_session_count = len(data.get('custom_session_files', []))
                max_sessions = custom_session_count
                print(f"[DEBUG] Custom session count: {custom_session_count}, overriding plan default: {plan_config.data[0]['max_sessions']}")

            # Calculate credits based on plan and duration
            credit_amount = self._calculate_credits(plan, duration_hours)

            # Create user data
            user_data = {
                'password': data.get('password'),
                'plan': plan,
                'is_admin': data.get('is_admin', False),
                'assigned_sessions': [],
                'duration_hours': duration_hours,
                'expires_at': expires_at.isoformat() if expires_at else None,
                'is_expired': False,
                'credits': credit_amount,
                'credits_updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            # For custom sessions, override the max_sessions with actual uploaded count
            if data.get('use_custom_sessions'):
                user_data['max_sessions'] = max_sessions  # This is now the custom count
                print(f"[DEBUG] User created with custom session count: {max_sessions}")
            
            # Handle custom plan name if provided
            if data.get('custom_plan_name'):
                user_data['custom_plan_name'] = data['custom_plan_name']
            
            # Handle custom interval if provided - override the plan's default interval
            if data.get('custom_message_interval'):
                # This will override the plan's min_interval immediately
                user_data['min_interval'] = data['custom_message_interval']
                print(f"[DEBUG] Custom interval set to {data['custom_message_interval']} minutes, overriding plan default")

            # Create user
            # Handle enum type casting for plan field to avoid "operator does not exist: text = user_plan" error
            if 'plan' in user_data and user_data['plan']:
                # Validate plan is in the enum values
                valid_plans = ['bronze', 'silver', 'gold', 'diamond', 'enterprise_basic', 'enterprise_pro', 'enterprise_elite', 'custom']
                if user_data['plan'] not in valid_plans:
                    print(f"Invalid plan '{user_data['plan']}' provided, defaulting to 'bronze'")
                    user_data['plan'] = 'bronze'
                else:
                    # Ensure the plan value is a string (not some other type)
                    user_data['plan'] = str(user_data['plan'])
            
            # Ensure plan is always a string before database insert
            if 'plan' in user_data:
                user_data['plan'] = str(user_data['plan'])
            
            # Ensure all datetime values are properly formatted
            if user_data.get('expires_at') and hasattr(user_data['expires_at'], 'isoformat'):
                user_data['expires_at'] = user_data['expires_at'].isoformat()
            
            if user_data.get('credits_updated_at') and hasattr(user_data['credits_updated_at'], 'isoformat'):
                user_data['credits_updated_at'] = user_data['credits_updated_at'].isoformat()
            
            response = self.supabase.table('users').insert(user_data).execute()
            
            if not response.data:
                print("No data returned from insert")
                return None

            user = response.data[0]

            # Handle custom sessions if provided
            if data.get('use_custom_sessions') and data.get('custom_session_files'):
                print(f"[DEBUG] Assigning custom sessions: {data['custom_session_files']}")
                assigned = self.assign_custom_sessions(user['id'], data['custom_session_files'])
                if not assigned:
                    print("Warning: Failed to assign custom sessions")
                    # Rollback: delete the user we just created
                    self.supabase.table('users').delete().eq('id', user['id']).execute()
                    return {"error": "User can't be created: failed to assign custom sessions"}
            else:
                # Assign random sessions from available pool
                assigned = self.assign_random_sessions(user['id'], max_sessions)
                if not assigned:
                    print("Warning: Failed to assign sessions")
                    # Rollback: delete the user we just created
                    self.supabase.table('users').delete().eq('id', user['id']).execute()
                    return {"error": "User can't be created: no sessions available"}

            # Get updated user data with assigned sessions
            response = self.supabase.table('users').select('*').eq('id', user['id']).execute()
            if not response.data:
                print("Failed to get updated user data")
                return None

            user = response.data[0]
            
            # Auto-create bot with all assigned sessions
            if user.get('assigned_sessions'):
                # Use custom interval if set, otherwise use plan default
                interval_minutes = user.get('min_interval') or user.get('min_interval', 60)
                actual_session_count = len(user['assigned_sessions'])
                bot_data = {
                    'name': 'Auto Bot',
                    'message': 'Your message here',  # Default message
                    'interval': interval_minutes * 60,  # Convert minutes to seconds
                    'session_count': actual_session_count
                }
                print(f"[DEBUG] Creating bot with interval: {interval_minutes} minutes ({interval_minutes * 60} seconds)")
                print(f"[DEBUG] Bot session count: {actual_session_count} (custom: {data.get('use_custom_sessions', False)})")
                
                bot = self.create_bot(user['id'], bot_data)
                if not bot:
                    print("Warning: Failed to create auto bot")
                    # Don't return None here as user is already created
            
            return user

        except Exception as e:
            print(f"Error creating user: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            return None

    def _calculate_credits(self, plan, duration_hours):
        """Calculate credits based on plan price and duration"""
        try:
            # Get plan price from plan_prices table
            plan_price_response = self.supabase.table('plan_prices').select('price_usd').eq('plan', str(plan)).execute()
            
            if plan_price_response.data and len(plan_price_response.data) > 0:
                plan_price = plan_price_response.data[0].get('price_usd', 30.00)
            else:
                # Default prices if not found in database
                default_prices = {
                    'bronze': 30.00,
                    'silver': 40.00,
                    'gold': 50.00,
                    'diamond': 75.00,
                    'enterprise_basic': 100.00,
                    'enterprise_pro': 150.00,
                    'enterprise_elite': 200.00,
                    'custom': 60.00
                }
                plan_price = default_prices.get(plan, 30.00)
            
            # Credits = plan price (this is the user's tokens/balance)
            # Following the examples:
            # $30 plan = 30 credits
            # $120 plan = 120 credits
            # etc.
            credits = int(plan_price)
            
            return credits
        except Exception as e:
            print(f"Error calculating credits: {str(e)}")
            # Fallback to simple calculation
            base_credits = duration_hours if duration_hours else 30
            multipliers = {
                'bronze': 1,
                'silver': 2,
                'gold': 3,
                'diamond': 4,
                'enterprise_basic': 5,
                'enterprise_pro': 6,
                'enterprise_elite': 7,
                'custom': 4
            }
            multiplier = multipliers.get(plan, 1)
            return int(base_credits * multiplier)

    def update_user(self, user_id, data):
        """Update user data and handle plan changes"""
        try:
            # Validate user exists
            user = self.get_user(user_id)
            if not user:
                print(f"User {user_id} not found")
                return None

            # Build update data
            update_data = {}
            if 'password' in data:
                update_data['password'] = data['password']
            if 'is_admin' in data:
                update_data['is_admin'] = data['is_admin']
            
            # Handle custom user fields
            if 'custom_username' in data:
                update_data['custom_username'] = data['custom_username']
            if 'custom_plan_name' in data:
                update_data['custom_plan_name'] = data['custom_plan_name']
            if 'custom_message_interval' in data:
                # Override the plan's min_interval with custom value
                update_data['min_interval'] = data['custom_message_interval']
                # Also update bot intervals to use the new custom interval
                user_bots = self.get_user_bots(user_id)
                for bot in user_bots:
                    bot_config = dict(bot['config'])
                    bot_config['interval'] = data['custom_message_interval'] * 60  # Convert minutes to seconds
                    self.update_bot(bot['bot_id'], {'config': bot_config})
            if 'custom_features' in data:
                update_data['custom_features'] = data['custom_features']
            
            # Handle plan changes
            if 'plan' in data:
                new_plan = data['plan']
                valid_plans = [
                    'bronze', 'silver', 'gold', 'diamond',
                    'enterprise_basic', 'enterprise_pro', 'enterprise_elite', 'custom'
                ]
                if new_plan not in valid_plans:
                    print(f"Invalid plan: {new_plan}")
                    return None
                
                # Ensure plan is always a string
                update_data['plan'] = str(new_plan)
                
                # Only update plan-based fields if not a custom user
                if new_plan != 'custom':
                    # Get plan configurations
                    old_plan = self.supabase.table('plan_configs').select('*').eq('plan', str(user['plan'])).execute()
                    new_plan_config = self.supabase.table('plan_configs').select('*').eq('plan', str(new_plan)).execute()
                    
                    if not old_plan.data or not new_plan_config.data:
                        print("Failed to get plan configurations")
                        return None
                        
                    old_config = old_plan.data[0]
                    new_config = new_plan_config.data[0]
                    
                    print(f"Plan change: {user['plan']} -> {new_plan}")
                    print(f"Session limit change: {old_config['max_sessions']} -> {new_config['max_sessions']}")
                    
                    # Handle session reallocation
                    current_sessions = user.get('assigned_sessions', [])
                    current_count = len(current_sessions)
                    
                    if new_config['max_sessions'] > current_count:
                        # Upgrade: Add more sessions
                        additional_sessions_needed = new_config['max_sessions'] - current_count
                        print(f"Upgrading: Adding {additional_sessions_needed} sessions")
                        
                        additional_sessions = self._get_additional_sessions(additional_sessions_needed, current_sessions)
                        if additional_sessions:
                            current_sessions.extend(additional_sessions)
                            update_data['assigned_sessions'] = current_sessions
                            print(f"Successfully added {len(additional_sessions)} sessions")
                        else:
                            print("Warning: Could not add additional sessions")
                            
                    elif new_config['max_sessions'] < current_count:
                        # Downgrade: Remove excess sessions
                        sessions_to_remove = current_count - new_config['max_sessions']
                        print(f"Downgrading: Removing {sessions_to_remove} sessions")
                        
                        current_sessions = current_sessions[:new_config['max_sessions']]
                        update_data['assigned_sessions'] = current_sessions
                        print(f"Successfully removed {sessions_to_remove} sessions")
                    
                    # Update bot configurations
                    if 'assigned_sessions' in update_data:
                        self._update_user_bot_sessions(user_id, update_data['assigned_sessions'])
                        
                        # Update bot intervals to the new plan's min_interval * 60
                        user_bots = self.get_user_bots(user_id)
                        for bot in user_bots:
                            bot_config = dict(bot['config'])
                            bot_config['interval'] = new_config['min_interval'] * 60
                            self.update_bot(bot['bot_id'], {'config': bot_config})
        
            # Handle duration hours
            if 'duration_hours' in data:
                duration_hours = data['duration_hours']
                if duration_hours is not None and duration_hours > 0:
                    update_data['duration_hours'] = duration_hours
                    # Convert datetime to ISO format string for JSON serialization
                    expires_at = datetime.now(timezone.utc) + timedelta(hours=duration_hours)
                    update_data['expires_at'] = expires_at.isoformat()
                else:
                    update_data['duration_hours'] = None
                    update_data['expires_at'] = None
            
            # Handle assigned_sessions updates
            if 'assigned_sessions' in data:
                update_data['assigned_sessions'] = data['assigned_sessions']
                print(f"Updating assigned_sessions: {data['assigned_sessions']}")
            
            # Update user
            print(f"Updating user {user_id} with data: {update_data}")
            response = self.supabase.table('users').update(update_data).eq('id', user_id).execute()
            
            print(f"Update response: {response}")
            print(f"Response data: {response.data}")
            
            if not response.data:
                print("No data returned from update")
                return None
                
            return response.data[0]
            
        except Exception as e:
            print(f"Error updating user: {str(e)}")
            return None

    def _get_additional_sessions(self, count_needed, existing_sessions):
        """Get additional sessions that are not already assigned to this user"""
        try:
            # Get all available sessions
            available_sessions = self.get_available_sessions()
            if not available_sessions:
                return []
            
            # Get all currently assigned sessions across all users
            all_users = self.get_users()
            all_assigned_sessions = set()
            for user in all_users:
                if user.get('assigned_sessions'):
                    for session in user['assigned_sessions']:
                        # Handle both object and string session formats
                        if isinstance(session, dict):
                            session_name = session.get('session_name', '')
                        else:
                            session_name = str(session)
                        if session_name:
                            all_assigned_sessions.add(session_name)
            
            # Add current user's sessions to avoid conflicts
            for session in existing_sessions:
                # Handle both object and string session formats
                if isinstance(session, dict):
                    session_name = session.get('session_name', '')
                else:
                    session_name = str(session)
                if session_name:
                    all_assigned_sessions.add(session_name)
            
            # Filter out already assigned sessions
            unassigned_sessions = [s for s in available_sessions if s not in all_assigned_sessions]
            
            if len(unassigned_sessions) < count_needed:
                print(f"Warning: Only {len(unassigned_sessions)} unassigned sessions available, need {count_needed}")
                count_needed = len(unassigned_sessions)
            
            if count_needed == 0:
                return []
            
            # Get API credentials
            api_creds = self.get_api_credentials()
            if not api_creds:
                return []
            
            # Select random sessions
            selected_sessions = random.sample(unassigned_sessions, count_needed)
            session_configs = []
            
            for i, session_name in enumerate(selected_sessions):
                api_cred = api_creds[i % len(api_creds)]
                session_configs.append({
                    'session_name': session_name,
                    'api_id': api_cred['api_id'],
                    'api_hash': api_cred['api_hash']
                })
            
            return session_configs
            
        except Exception as e:
            print(f"Error getting additional sessions: {str(e)}")
            return []

    def _update_user_bot_sessions(self, user_id, new_sessions):
        """Update the user's bot with new session configuration"""
        try:
            # Get user's bots
            user_bots = self.get_user_bots(user_id)
            if not user_bots:
                print("No bots found for user")
                return False
            
            # Update the first bot (should be the auto-created one)
            bot = user_bots[0]
            bot_id = bot['bot_id']
            
            # Get session content from storage
            session_configs = []
            for session in new_sessions:
                # Handle both object and string session formats
                if isinstance(session, dict):
                    session_name = session.get('session_name', '')
                    api_id = session.get('api_id', '')
                    api_hash = session.get('api_hash', '')
                else:
                    session_name = str(session)
                    api_id = ''
                    api_hash = ''
                
                if not session_name:
                    continue
                
                session_content = self.get_file_content(session_name)
                if not session_content:
                    print(f"Failed to get content for session {session_name}")
                    continue
                    
                # Base64 encode session string for JSON storage
                session_content_b64 = base64.b64encode(session_content.encode('utf-8')).decode('utf-8')
                session_configs.append({
                    'session_name': session_name,
                    'session_content': session_content_b64,
                    'api_id': api_id,
                    'api_hash': api_hash
                })
            
            if not session_configs:
                print("No valid session configurations")
                return False
            
            # Update bot config
            updated_config = dict(bot['config'])
            updated_config['sessions'] = session_configs
            updated_config['session_count'] = len(session_configs)
            
            # Update bot
            self.update_bot(bot_id, {'config': updated_config})
            print(f"Successfully updated bot {bot_id} with {len(session_configs)} sessions")
            return True
            
        except Exception as e:
            print(f"Error updating user bot sessions: {str(e)}")
            return False

    def authenticate_user(self, username, password):
        """Authenticate a user and return their details"""
        try:
            response = self.supabase.table('users').select('*').eq('username', username).execute()
            if not response.data:
                return None, "User not found"

            user = response.data[0]
            if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                return None, "Invalid password"

            return user, None
        except Exception as e:
            print(f"Error authenticating user: {str(e)}")
            return None, str(e)

    def get_users(self):
        """Get all users"""
        try:
            response = self.supabase.table('users').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Error getting users: {str(e)}")
            return []

    def get_user(self, user_id):
        """Get user by ID"""
        try:
            response = self.supabase.table('users').select('*').eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error getting user: {str(e)}")
            return None

    def update_user_credits(self, user_id, credits):
        """Update user credits"""
        try:
            response = self.supabase.table('users').update({
                'credits': credits,
                'credits_updated_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating user credits: {str(e)}")
            return None

    def decrement_user_credits(self, user_id):
        """Decrement user credits by 1"""
        try:
            user = self.get_user(user_id)
            if user and user.get('credits', 0) > 0:
                new_credits = max(user['credits'] - 1, 0)
                response = self.supabase.table('users').update({
                    'credits': new_credits,
                    'credits_updated_at': datetime.now(timezone.utc).isoformat()
                }).eq('id', user_id).execute()
                
                # If credits reached 0, mark user as expired
                if new_credits == 0:
                    self.supabase.table('users').update({
                        'is_expired': True
                    }).eq('id', user_id).execute()
                
                return response.data[0] if response.data else None
            return user
        except Exception as e:
            print(f"Error decrementing user credits: {str(e)}")
            return None

    def delete_user(self, user_id):
        """Delete user and free up assigned resources"""
        try:
            # Get all sessions assigned to user
            assigned_sessions = self.supabase.table('files') \
                .select('*') \
                .eq('assigned_to', user_id) \
                .execute().data
            for session in assigned_sessions:
                if session['api_cred_id']:
                    api_cred = self.supabase.table('files') \
                        .select('*') \
                        .eq('id', session['api_cred_id']) \
                        .execute().data[0]
                    self.supabase.table('files').update({
                        'sessions_using': max(0, api_cred['sessions_using'] - 1)
                    }).eq('id', session['api_cred_id']).execute()
                self.supabase.table('files').update({
                    'is_assigned': False,
                    'assigned_to': None,
                    'api_cred_id': None
                }).eq('id', session['id']).execute()
            self.supabase.table('users').delete().eq('id', user_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting user: {str(e)}")
            return False

    def get_user_bots(self, user_id):
        """Get all bots for a user"""
        try:
            print(f"Getting bots for user: {user_id}")
            response = self.supabase.table('bot_configs').select('*').eq('user_id', user_id).execute()
            bots = response.data if response.data else []
            print(f"Found {len(bots)} bots for user {user_id}: {bots}")
            return bots
        except Exception as e:
            print(f"Error getting user bots: {str(e)}")
            return []

    def get_user_files(self, user_id):
        """Get all files for a user (both uploaded and assigned)"""
        try:
            # Get files uploaded by user
            uploaded = self.supabase.table('files').select('*').eq('user_id', user_id).execute()
            
            # Get files assigned to user
            assigned = self.supabase.table('files').select('*').eq('assigned_to', user_id).execute()
            
            # Combine and deduplicate results
            all_files = []
            seen_ids = set()
            
            if uploaded.data:
                for file in uploaded.data:
                    if file['id'] not in seen_ids:
                        seen_ids.add(file['id'])
                        all_files.append(file)
                        
            if assigned.data:
                for file in assigned.data:
                    if file['id'] not in seen_ids:
                        seen_ids.add(file['id'])
                        all_files.append(file)
                        
            return all_files
        except Exception as e:
            print(f"Error getting user files: {str(e)}")
            return []

    def get_all_files(self):
        """Get all files"""
        try:
            response = self.supabase.table('files').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Error getting files: {str(e)}")
            return []

    def save_file(self, filename, content, file_type, user_id=None):
        """Save a file to appropriate location
        Args:
            filename (str): Name of the file
            content (bytes or str): Content of the file
            file_type (str): Type of file (api, session, group)
            user_id (UUID): User ID who uploaded the file
        Returns:
            dict: File data if successful, None if failed
        """
        try:
            # For session files, save directly to container
            if file_type == 'session':
                sessions_dir = "/home/container/sessions"
                if not os.path.exists(sessions_dir):
                    os.makedirs(sessions_dir)
                
                file_path = os.path.join(sessions_dir, filename)
                
                # For binary .session files (SQLite)
                if isinstance(content, bytes):
                    with open(file_path, 'wb') as f:
                        f.write(content)
                else:
                    # For string sessions
                    try:
                        # Try to decode if it's base64 encoded
                        import base64
                        decoded = base64.b64decode(content.encode()).decode()
                        with open(file_path, 'w') as f:
                            f.write(decoded)
                    except:
                        # If not base64, write directly
                        with open(file_path, 'w') as f:
                            f.write(content)
                
                # Save reference in database
                file_data = {
                    'filename': filename,
                    'storage_path': file_path,
                    'file_type': 'session',
                    'user_id': user_id,
                    'is_assigned': False,
                    'assigned_to': None,
                    'is_sqlite': isinstance(content, bytes)
                }
                
                response = self.supabase.table('files').insert(file_data).execute()
                if not response.data:
                    raise ValueError("Failed to save session reference to database")
                return response.data[0]

            # For other files (API, groups), use Supabase storage
            bucket_name = self._get_bucket_name(file_type)
            if not bucket_name:
                raise ValueError(f"Invalid file type: {file_type}")

            # Convert content to string if it's bytes
            if isinstance(content, bytes):
                content_str = content.decode('utf-8')
            else:
                content_str = content
                
            # Clean up content
            content_str = content_str.strip()
                
            # Validate content based on file type
            if file_type == 'session' and not isinstance(content, bytes): # Only validate string sessions if not binary
                # Validate string session format
                if not re.match(r'^[A-Za-z0-9+/=]+$', content_str):
                    raise ValueError("Invalid string session format")
                    
            elif file_type == 'api':
                # Validate API file format (id|hash)
                if '|' not in content_str:
                    raise ValueError("Invalid API file format. Must contain ID|HASH")
                # Validate each line
                valid_lines = []
                for line in content_str.split('\n'):
                    line = line.strip()
                    if not line:
                        continue
                    # Support spaces around |
                    match = re.match(r'^(\d+)\s*\|\s*([a-zA-Z0-9]+)$', line)
                    if not match:
                        raise ValueError(f"Invalid API format in line: {line}")
                    valid_lines.append(line)
                if not valid_lines:
                    raise ValueError("No valid API credentials found in file")
                content_str = '\n'.join(valid_lines)
                    
            elif file_type == 'group':
                # Validate and clean group IDs
                valid_lines = []
                for line in content_str.split('\n'):
                    line = line.strip()
                    if not line:
                        continue
                    # Handle format: "ID | name" or just "ID"
                    if '|' in line:
                        group_id = line.split('|')[0].strip()
                    else:
                        group_id = line
                    # Clean and normalize group ID
                    group_id = group_id.replace(' ', '').replace(',', '').replace(';', '')
                    
                    # Handle different group ID formats
                    if group_id.startswith('-100'):
                        # Already in correct format
                        normalized_id = group_id
                    elif group_id.startswith('-'):
                        # Negative number, check if it's a valid group ID
                        if group_id.lstrip('-').isdigit():
                            normalized_id = group_id
                        else:
                            continue
                    elif group_id.isdigit():
                        # Positive number, automatically add -100 prefix
                        normalized_id = f"-100{group_id}"
                    elif group_id.startswith('100'):
                        # Starts with 100, add - prefix
                        normalized_id = f"-{group_id}"
                    else:
                        # Invalid format, skip
                        continue
                    
                    if normalized_id and normalized_id not in valid_lines:
                        valid_lines.append(normalized_id)
                if not valid_lines:
                    raise ValueError("No valid group IDs found in file")
                content_str = '\n'.join(valid_lines)
            
            # Generate a unique storage path to avoid conflicts
            storage_path = f"{uuid.uuid4()}/{filename}"
            
            # Upload file to storage
            try:
                self.supabase.storage.from_(bucket_name).upload(
                    path=storage_path,
                    file=content_str.encode('utf-8'),
                    file_options={"content-type": "text/plain"}
                )
            except Exception as e:
                print(f"Error uploading to storage: {str(e)}")
                # Try to delete if upload failed
                try:
                    self.supabase.storage.from_(bucket_name).remove(storage_path)
                except:
                    pass
                raise e

            # Get public URL
            file_url = self.supabase.storage.from_(bucket_name).get_public_url(storage_path)

            # Track in database
            file_data = {
                'filename': filename,
                'storage_path': storage_path,
                'file_type': file_type,
                'user_id': user_id,
                'is_assigned': False,
                'assigned_to': None,
                'file_url': file_url,
                'content': content_str if file_type in ['api', 'session'] else None,
                'is_sqlite': False
            }
            
            try:
                response = self.supabase.table('files').insert(file_data).execute()
                if not response.data:
                    # If database insert fails, try to clean up storage
                    try:
                        self.supabase.storage.from_(bucket_name).remove(storage_path)
                    except:
                        pass
                    raise ValueError("Failed to save file data to database")
                return response.data[0]
            except Exception as e:
                # Clean up storage if database insert fails
                try:
                    self.supabase.storage.from_(bucket_name).remove(storage_path)
                except:
                    pass
                raise e
            
        except Exception as e:
            print(f"Error saving file to Supabase: {str(e)}")
            return None

    def update_file(self, file_id, content):
        """Update a file in Supabase Storage and database
        Args:
            file_id (str): ID of the file to update
            content (bytes or str): New content for the file
        Returns:
            dict: Updated file data if successful, None if failed
        """
        try:
            # Get existing file data
            file = self.supabase.table('files').select('*').eq('id', file_id).single().execute()
            if not file.data:
                return None
                
            file_data = file.data
            bucket_name = self._get_bucket_name(file_data['file_type'])
            if not bucket_name:
                return None

            # Upload new content to storage
            bucket = self.supabase.storage.from_(bucket_name)
            
            # Convert content to bytes if it's a string
            if isinstance(content, str):
                content_bytes = content.encode('utf-8')
            else:
                content_bytes = content

            # Upload to existing path
            bucket.update(
                path=file_data['storage_path'],
                file=content_bytes,
                file_options={"content-type": "application/octet-stream"}
            )

            # Update database record
            update_data = {}
            if file_data['file_type'] == 'api' and isinstance(content, str):
                update_data['content'] = content
                
            if update_data:
                response = self.supabase.table('files').update(update_data).eq('id', file_id).execute()
                return response.data[0] if response.data else None
            return file_data
            
        except Exception as e:
            print(f"Error updating file in Supabase: {str(e)}")
            return None

    def delete_file(self, filename):
        """Delete a file"""
        try:
            # For session files, delete from container
            if filename.endswith('.session'):
                file_path = f"/home/container/sessions/{filename}"
                if os.path.exists(file_path):
                    os.remove(file_path)
                    print(f"Deleted session file: {file_path}")
                
                # Remove from database
                self.supabase.table('files').delete().eq('filename', filename).execute()
                return True
                
            # For other files, delete from Supabase
            file = self.supabase.table('files').select('*').eq('filename', filename).single().execute()
            if not file.data:
                return False
                
            file_data = file.data
            bucket_name = self._get_bucket_name(file_data['file_type'])
            if not bucket_name:
                return False

            # Delete from storage
            bucket = self.supabase.storage.from_(bucket_name)
            bucket.remove(file_data['storage_path'])

            # Delete from database
            self.supabase.table('files').delete().eq('id', file_data['id']).execute()
            return True
            
        except Exception as e:
            print(f"Error deleting file from Supabase: {str(e)}")
            return False

    def get_file_content(self, session_name):
        """Get session file content from container"""
        try:
            # All sessions are now in container
            file_path = f"/home/container/sessions/{session_name}"
            if not os.path.exists(file_path):
                print(f"Session file not found: {file_path}")
                return None
            
            # For SQLite session files, we need to read the actual file content
            # Since these are binary files, we'll read them as bytes
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Convert to base64 for storage
            import base64
            content_b64 = base64.b64encode(content).decode('utf-8')
            return content_b64
        except Exception as e:
            print(f"Error getting session content: {str(e)}")
            return None

    def get_admin_stats(self):
        """Get admin dashboard stats (from storage, not files table)"""
        try:
            users = self.get_users()
            bots = self.get_all_bots()

            # Count files from storage
            api_bucket = self.supabase.storage.from_(self.buckets['api'])
            session_bucket = self.supabase.storage.from_(self.buckets['session'])
            group_bucket = self.supabase.storage.from_(self.buckets['group'])
            api_files = api_bucket.list()
            session_files = session_bucket.list()
            group_files = group_bucket.list()
            total_files = len(api_files) + len(session_files) + len(group_files)

            # Sessions = number of session files
            total_sessions = len(session_files)

            active_bots = len([b for b in bots if b.get('is_active', False)])

            print(f"[DEBUG] Stats: users={len(users)}, bots={len(bots)}, api_files={len(api_files)}, session_files={len(session_files)}, group_files={len(group_files)}")

            return {
                'total_users': len(users),
                'active_bots': active_bots,
                'total_sessions': total_sessions,
                'total_files': total_files
            }
        except Exception as e:
            print(f"Error getting admin stats: {str(e)}")
            return {
                'total_users': 0,
                'active_bots': 0,
                'total_sessions': 0,
                'total_files': 0
            }

    def get_all_bots(self):
        """Get all bots"""
        try:
            response = self.supabase.table('bot_configs').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Error getting bots: {str(e)}")
            return []

    def get_user_bot_count(self, user_id):
        """Get number of bots for a user"""
        try:
            bots = self.get_user_bots(user_id)
            return len(bots)
        except Exception as e:
            print(f"Error getting bot count: {str(e)}")
            return 0

    def get_group_ids(self):
        """Get group IDs from storage"""
        try:
            bucket = self.supabase.storage.from_(self.buckets['group'])
            files = bucket.list()
            if not files:
                print("[DEBUG] No group files found in storage")
                return []
            
            # Get all group files
            print(f"[DEBUG] Found group files: {[f['name'] for f in files]}")
            group_ids = []
            
            # Process each group file
            for file in files:
                if file['name'] == '.emptyFolderPlaceholder':
                    continue
                
                content = bucket.download(file['name'])
                if not content:
                    print(f"[DEBUG] Group file {file['name']} is empty")
                    continue
                
                try:
                    content_str = content.decode('utf-8')
                    print(f"[DEBUG] Processing group file {file['name']}: {content_str}")
                    
                    for line in content_str.split('\n'):
                        line = line.strip()
                        if not line:
                            continue
                            
                        # Handle format: "ID | name" or just "ID"
                        if '|' in line:
                            group_id = line.split('|')[0].strip()
                        else:
                            group_id = line
                            
                        # Clean and normalize group ID
                        group_id = group_id.replace(' ', '').replace(',', '').replace(';', '')
                        
                        # Handle different group ID formats
                        if group_id.startswith('-100'):
                            # Already in correct format
                            normalized_id = group_id
                        elif group_id.startswith('-'):
                            # Negative number, check if it's a valid group ID
                            if group_id.lstrip('-').isdigit():
                                normalized_id = group_id
                            else:
                                continue
                        elif group_id.isdigit():
                            # Positive number, automatically add -100 prefix
                            normalized_id = f"-100{group_id}"
                        elif group_id.startswith('100'):
                            # Starts with 100, add - prefix
                            normalized_id = f"-{group_id}"
                        else:
                            # Invalid format, skip
                            continue
                        
                        if normalized_id and normalized_id not in group_ids:  # Avoid duplicates
                            group_ids.append(normalized_id)
                except Exception as e:
                    print(f"[DEBUG] Error processing group file {file['name']}: {str(e)}")
                    continue
            
            print(f"[DEBUG] Total unique group IDs found: {len(group_ids)}")
            print(f"[DEBUG] Group IDs: {group_ids}")
            return group_ids
        except Exception as e:
            print(f"[DEBUG] Error getting group IDs: {str(e)}")
            return []

    def _get_bucket_name(self, file_type):
        """Get the appropriate bucket name for the file type"""
        return self.buckets.get(file_type)

    def get_file(self, filename, file_type):
        """Get a file from Supabase Storage"""
        try:
            bucket_name = self._get_bucket_name(file_type)
            if not bucket_name:
                raise ValueError(f"Invalid file type: {file_type}")

            # Get bucket
            bucket = self.supabase.storage.from_(bucket_name)

            # Download file
            result = bucket.download(filename)
            return result
        except Exception as e:
            print(f"Error getting file from Supabase: {str(e)}")
            return None

    def get_files_by_type(self, file_type):
        """Get files by type from database"""
        try:
            response = self.supabase.table('files') \
                .select('*') \
                .eq('file_type', file_type) \
                .eq('is_assigned', False) \
                .execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting files: {str(e)}")
            return []

    def get_config(self, user_id=None):
        """Get bot configurations for a user or all if admin"""
        try:
            query = self.supabase.table('bot_configs').select('config')
            if user_id:
                query = query.eq('user_id', user_id)
            response = query.execute()
            
            configs = []
            for record in response.data:
                if isinstance(record['config'], dict) and 'configs' in record['config']:
                    configs.extend(record['config']['configs'])
            return {"configs": configs}
        except Exception as e:
            print(f"Error getting config from Supabase: {str(e)}")
            return {"configs": []}

    def save_config(self, config, user_id):
        """Save bot configuration for a user"""
        try:
            # Check user's bot limit
            user = self.supabase.table('users').select('*').eq('id', user_id).single().execute().data
            if not user:
                return False, "User not found"

            current_bots = len(self.get_user_bots(user_id))
            if current_bots >= user['max_bots'] and not user['is_admin']:
                return False, "Maximum number of bots reached"

            response = self.supabase.table('bot_configs').insert({
                'user_id': user_id,
                'bot_id': config['bot_id'],
                'config': config
            }).execute()

            return True, None
        except Exception as e:
            print(f"Error saving config to Supabase: {str(e)}")
            return False, str(e)

    def get_api_usage(self):
        """Get API usage data"""
        try:
            # Get usage from database
            response = self.supabase.table('api_usage').select('*').execute()
            usage = {
                "api_usage": {},
                "session_api_map": {},
                "multi_session_bots": {}
            }
            
            # Convert database records to usage format
            for record in response.data:
                api_id = record['api_id']
                session_name = record['session_name']
                
                # Update api_usage
                if api_id not in usage["api_usage"]:
                    usage["api_usage"][api_id] = {
                        "count": 0,
                        "sessions": []
                    }
                usage["api_usage"][api_id]["sessions"].append(session_name)
                usage["api_usage"][api_id]["count"] += 1
                
                # Update session_api_map
                usage["session_api_map"][session_name] = api_id
            
            return usage
        except Exception as e:
            print(f"Error getting API usage from Supabase: {str(e)}")
            return {
                "api_usage": {},
                "session_api_map": {},
                "multi_session_bots": {}
            }

    def update_api_usage(self, api_id, session_name, user_id):
        """Update API usage count and mapping"""
        try:
            # Check user's session limit
            user = self.supabase.table('users').select('*').eq('id', user_id).single().execute().data
            if not user:
                return False, "User not found"

            current_sessions = len(self.supabase.table('api_usage')
                                 .select('*')
                                 .eq('user_id', user_id)
                                 .execute().data)
            
            if current_sessions >= user['max_sessions'] and not user['is_admin']:
                return False, "Maximum number of sessions reached"

            response = self.supabase.table('api_usage').upsert({
                'api_id': str(api_id),
                'session_name': session_name,
                'user_id': user_id,
                'created_at': time.time()
            }).execute()

            return True, None
        except Exception as e:
            print(f"Error updating API usage in Supabase: {str(e)}")
            return False, str(e)

    def update_multi_session_bot(self, bot_id, session_configs):
        """Update API usage for a multi-session bot"""
        try:
            # Add bot record
            response = self.supabase.table('bot_configs').insert({
                'bot_id': bot_id,
                'session_count': len(session_configs),
                'sessions': [sc['session_name'] for sc in session_configs],
                'created_at': time.time()
            }).execute()
            
            # Update API usage for each session
            for session_config in session_configs:
                self.update_api_usage(session_config['api_id'], session_config['session_name'], session_config['user_id'])
            
            return True
        except Exception as e:
            print(f"Error updating multi-session bot in Supabase: {str(e)}")
            return False 

    def get_user_session_count(self, user_id):
        """Get number of active sessions for a user"""
        try:
            response = self.supabase.table('api_usage').select('*').eq('user_id', user_id).execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            print(f"Error getting session count: {str(e)}")
            return 0

    def get_bot(self, bot_id):
        """Get a specific bot configuration"""
        try:
            response = self.supabase.table('bot_configs').select('*').eq('bot_id', bot_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error getting bot: {str(e)}")
            return None

    def create_bot(self, user_id, data):
        """Create a new bot configuration
        Args:
            user_id (UUID): User ID
            data (dict): Bot configuration data containing name, message, interval, session_count
        Returns:
            dict: Bot data if successful, None if failed
        """
        try:
            print(f"Creating bot for user {user_id} with data: {data}")
            
            # Get user's assigned sessions
            user = self.supabase.table('users').select('*').eq('id', user_id).single().execute()
            if not user.data:
                print("No user data found")
                return None
                
            user_data = user.data
            print(f"User data: {user_data}")
            
            if not user_data.get('assigned_sessions'):
                print("No assigned sessions found for user")
                return None
                
            assigned_sessions = user_data['assigned_sessions']
            session_count = int(data.get('session_count', 1))
            
            print(f"Assigned sessions: {assigned_sessions}")
            print(f"Requested session count: {session_count}")
            
            if len(assigned_sessions) < session_count:
                print(f"Not enough assigned sessions. Need {session_count}, found {len(assigned_sessions)}")
                return None
            
            # Get group IDs
            group_ids = self.get_group_ids()
            if not group_ids:
                print("No group IDs found")
                return None
            
            # Create bot config with selected sessions
            selected_sessions = assigned_sessions[:session_count]
            
            # Use sessions directly - they already have the right format
            session_configs = selected_sessions
            
            if not session_configs:
                print("No valid session configurations created")
                return None
            
            bot_id = str(uuid.uuid4())
            bot_data = {
                'user_id': user_id,
                'bot_id': bot_id,
                'config': {
                    'name': data.get('name', 'My Bot'),
                    # Support multiple messages: accept messages array or single message
                    'messages': (data.get('messages') if isinstance(data.get('messages'), list) and data.get('messages') else ([data.get('message')] if data.get('message') else [])),
                    'message': data.get('message', ''),
                    'interval': int(data.get('interval', 60)),
                    'session_count': len(session_configs),
                    'sessions': session_configs,
                    'group_ids': group_ids,
                    'is_active': False
                }
            }
            
            print(f"Creating bot with config: {bot_data}")
            
            # Save bot config
            response = self.supabase.table('bot_configs').insert(bot_data).execute()
            
            if not response.data:
                print("No data returned from bot creation")
                return None
            
            print(f"Bot created successfully: {response.data[0]}")
            return response.data[0]
            
        except Exception as e:
            print(f"Error creating bot: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            return None

    def update_bot(self, bot_id, data):
        """Update a bot configuration"""
        try:
            current_bot = self.get_bot(bot_id)
            if not current_bot:
                return None
                
            # Update only the fields that are provided
            updated_config = dict(current_bot['config'])
            if 'messages' in data and isinstance(data['messages'], list):
                # Sanitize to strings and strip empties
                updated_config['messages'] = [str(m).strip() for m in data['messages'] if str(m).strip()]
            if 'message' in data:
                updated_config['message'] = data['message']
            if 'interval' in data:
                updated_config['interval'] = data['interval']
            if 'name' in data:
                updated_config['name'] = data['name']
            if 'config' in data:
                # For direct config updates (like is_active)
                updated_config.update(data['config'])
            
            update_data = {'config': updated_config}
            # Perform update
            self.supabase.table('bot_configs').update(update_data).eq('bot_id', bot_id).execute()
            # Fetch fresh row
            fetched = self.supabase.table('bot_configs').select('*').eq('bot_id', bot_id).execute()
            return fetched.data[0] if fetched.data else None
        except Exception as e:
            print(f"Error updating bot: {str(e)}")
            return None

    def delete_bot(self, bot_id):
        """Delete a bot configuration"""
        try:
            self.supabase.table('bot_configs').delete().eq('bot_id', bot_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting bot: {str(e)}")
            return False 

    def create_user_session(self, user_id, session_id, ip_address=None, user_agent=None):
        """Create a new user session in the database"""
        try:
            # First cleanup old sessions
            self.cleanup_old_sessions()
            
            # Create new session
            session_data = {
                'user_id': user_id,
                'session_id': session_id,
                'ip_address': ip_address,
                'user_agent': user_agent
            }
            
            response = self.supabase.table('user_sessions').insert(session_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating user session: {str(e)}")
            return None

    def get_user_session(self, user_id, session_id):
        """Get user session from database"""
        try:
            response = self.supabase.table('user_sessions') \
                .select('*') \
                .eq('user_id', user_id) \
                .eq('session_id', session_id) \
                .execute()
                
            if not response.data:
                return None
                
            session = response.data[0]
            
            # Check if session is expired (30 minutes)
            try:
                last_active_str = normalize_datetime_string(session['last_active'])
                last_active = datetime.fromisoformat(last_active_str)
                if datetime.utcnow() - last_active > timedelta(minutes=30):
                    self.delete_user_session(user_id, session_id)
                    return None
            except ValueError as e:
                print(f"Warning: Invalid datetime format for session {session_id}: {e}")
                # Skip expiry check if datetime is invalid
                
            return session
        except Exception as e:
            print(f"Error getting user session: {str(e)}")
            return None

    def update_user_session(self, user_id, session_id):
        """Update last_active timestamp for user session"""
        try:
            self.supabase.table('user_sessions') \
                .update({'last_active': datetime.utcnow().isoformat()}) \
                .eq('user_id', user_id) \
                .eq('session_id', session_id) \
                .execute()
            return True
        except Exception as e:
            print(f"Error updating user session: {str(e)}")
            return False

    def delete_user_session(self, user_id, session_id):
        """Delete user session from database"""
        try:
            self.supabase.table('user_sessions') \
                .delete() \
                .eq('user_id', user_id) \
                .eq('session_id', session_id) \
                .execute()
            return True
        except Exception as e:
            print(f"Error deleting user session: {str(e)}")
            return False

    def cleanup_old_sessions(self):
        """Remove expired sessions (older than 30 minutes)"""
        try:
            expiry_time = (datetime.utcnow() - timedelta(minutes=30)).isoformat()
            self.supabase.table('user_sessions') \
                .delete() \
                .lt('last_active', expiry_time) \
                .execute()
        except Exception as e:
            print(f"Error cleaning up old sessions: {str(e)}")

    def track_bot_status(self, user_id, bot_id, status='running', error=None):
        """Track bot status in database"""
        try:
            data = {
                'user_id': user_id,
                'bot_id': bot_id,
                'status': status,
                'last_heartbeat': datetime.utcnow().isoformat()
            }
            
            if error:
                data['error_count'] = self.supabase.raw('error_count + 1')
                
            self.supabase.table('active_bots') \
                .upsert(data) \
                .execute()
            return True
        except Exception as e:
            print(f"Error tracking bot status: {str(e)}")
            return False

    def cleanup_stale_bots(self):
        """Remove stale bot entries (no heartbeat for 5 minutes)"""
        try:
            stale_time = (datetime.utcnow() - timedelta(minutes=5)).isoformat()
            self.supabase.table('active_bots') \
                .delete() \
                .lt('last_heartbeat', stale_time) \
                .execute()
        except Exception as e:
            print(f"Error cleaning up stale bots: {str(e)}") 

    def _cleanup_expired_users(self):
        """Background task to cleanup expired users"""
        while True:
            try:
                # Get expired users
                response = self.supabase.table('users').select('*').eq('is_expired', False).execute()
                if response.data:
                    now = datetime.now(timezone.utc)
                    for user in response.data:
                        if user.get('expires_at'):
                            try:
                                expires_at_str = normalize_datetime_string(user['expires_at'])
                                expires_at = datetime.fromisoformat(expires_at_str)
                                
                                if now >= expires_at:
                                    # Stop all bots
                                    user_bots = self.get_user_bots(user['id'])
                                    for bot in user_bots:
                                        self.delete_bot(bot['bot_id'])
                                    
                                    # Delete all sessions
                                    self.supabase.table('user_sessions').delete().eq('user_id', user['id']).execute()
                                    
                                    # Mark user as expired
                                    self.supabase.table('users').update({
                                        'is_expired': True
                                    }).eq('id', user['id']).execute()
                                    
                                    print(f"Cleaned up expired user: {user['id']}")
                            except ValueError as e:
                                print(f"Warning: Invalid datetime format for user {user['id']}: {e}")
                                # Skip expiry check if datetime is invalid
                                continue
                
            except Exception as e:
                print(f"Error in cleanup task: {str(e)}")
                # Add longer sleep on error to prevent resource exhaustion
                time.sleep(300)  # 5 minutes on error
                continue
            
            # Check every 5 minutes instead of every minute to reduce resource usage
            time.sleep(300)

    def ban_user(self, user_id, admin_id, reason):
        """Ban a user and archive their data"""
        try:
            # Get user data first
            user = self.get_user(user_id)
            if not user:
                return False
                
            # Create banned user record
            banned_data = {
                'user_id': user_id,
                'banned_by': admin_id,
                'reason': reason,
                'user_data': user
            }
            
            # Start transaction
            self.supabase.table('banned_users').insert(banned_data).execute()
            
            # Update user status
            self.supabase.table('users').update({
                'account_status': 'banned',
                'status_changed_at': datetime.now(timezone.utc).isoformat(),
                'status_reason': reason
            }).eq('id', user_id).execute()
            
            return True
        except Exception as e:
            print(f"Error banning user: {str(e)}")
            return False

    def unban_user(self, user_id):
        """Unban a user"""
        try:
            # Remove from banned_users
            self.supabase.table('banned_users').delete().eq('user_id', user_id).execute()
            
            # Update user status
            self.supabase.table('users').update({
                'account_status': 'active',
                'status_changed_at': datetime.now(timezone.utc).isoformat(),
                'status_reason': None
            }).eq('id', user_id).execute()
            
            return True
        except Exception as e:
            print(f"Error unbanning user: {str(e)}")
            return False

    def suspend_user(self, user_id, suspended_by=None, reason=None, duration_hours=24):
        """Suspend a user temporarily"""
        try:
            # Get user data first
            user = self.get_user(user_id)
            if not user:
                return False
                
            suspension_end = datetime.now(timezone.utc) + timedelta(hours=duration_hours)
            
            # Create suspended user record
            suspended_data = {
                'user_id': user_id,
                'suspended_by': suspended_by,
                'reason': reason,

                'suspension_end_time': suspension_end.isoformat(),
                'user_data': user
            }
            
            # Start transaction
            self.supabase.table('suspended_users').insert(suspended_data).execute()
            
            # Update user status
            self.supabase.table('users').update({
                'account_status': 'suspended',
                'status_changed_at': datetime.now(timezone.utc).isoformat(),
                'status_reason': reason
            }).eq('id', user_id).execute()
            
            return True
        except Exception as e:
            print(f"Error suspending user: {str(e)}")
            return False

    def unsuspend_user(self, user_id):
        """Remove user suspension"""
        try:
            # Remove from suspended_users
            self.supabase.table('suspended_users').delete().eq('user_id', user_id).execute()
            
            # Update user status
            self.supabase.table('users').update({
                'account_status': 'active',
                'status_changed_at': datetime.now(timezone.utc).isoformat(),
                'status_reason': None
            }).eq('id', user_id).execute()
            
            return True
        except Exception as e:
            print(f"Error unsuspending user: {str(e)}")
            return False

    def get_session_status(self, session_name):
        """Get current status of a session"""
        try:
            response = self.supabase.table('session_status') \
                .select('*') \
                .eq('session_name', session_name) \
                .order('created_at', desc=True) \
                .limit(1) \
                .execute()
                
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error getting session status: {str(e)}")
            return None

    def update_session_status(self, session_name, user_id, status, error_count=0, last_error=None):
        """Update or create session status"""
        try:
            now = datetime.now(timezone.utc).isoformat()
            status_data = {
                'session_name': session_name,
                'user_id': user_id,
                'status': status,
                'error_count': error_count,
                'last_error': last_error,
                'last_error_time': now if last_error else None,
                'updated_at': now
            }
            
            # Try to update existing record
            response = self.supabase.table('session_status') \
                .update(status_data) \
                .eq('session_name', session_name) \
                .execute()
                
            # If no record exists, create new one
            if not response.data:
                status_data['created_at'] = now
                self.supabase.table('session_status').insert(status_data).execute()
                
            return True
        except Exception as e:
            print(f"Error updating session status: {str(e)}")
            return False

    def check_user_status(self, user_id):
        """Check if user is banned or suspended"""
        try:
            user = self.get_user(user_id)
            if not user:
                return None

            status = user.get('account_status', 'active')

            if status == 'banned':
                return {
                    'status': 'banned',
                    'reason': user.get('status_reason'),
                    'changed_at': user.get('status_changed_at')
                }

            elif status == 'suspended':
                # Check if suspension has expired
                suspension = self.supabase.table('suspended_users') \
                    .select('*') \
                    .eq('user_id', user_id) \
                    .order('suspended_at', desc=True) \
                    .limit(1) \
                    .execute()

                if suspension.data:
                    suspension_data = suspension.data[0]
                    # Fix isoformat string for Python
                    susp_end = suspension_data['suspension_end_time']
                    if '+' in susp_end:
                        dt_part, tz_part = susp_end.split('+', 1)
                        if '.' in dt_part:
                            dt_base, ms_part = dt_part.split('.')
                            ms_part = (ms_part + '000000')[:6]  # pad/truncate to 6 digits
                            dt_part = f"{dt_base}.{ms_part}"
                        susp_end = f"{dt_part}+{tz_part}"
                    try:
                        susp_end_str = normalize_datetime_string(susp_end)
                        suspension_end = datetime.fromisoformat(susp_end_str)
                    except ValueError as e:
                        print(f"Warning: Invalid datetime format for suspension end {susp_end}: {e}")
                        # Skip suspension check if datetime is invalid
                        suspension_end = None
                        return {
                            'status': 'suspended',
                            'reason': user.get('status_reason'),
                            'changed_at': user.get('status_changed_at'),
                            'end_time': suspension_data['suspension_end_time'],

                            'error': 'Invalid suspension_end_time format'
                        }

                    if suspension_end and datetime.now(timezone.utc) >= suspension_end:
                        # Auto-remove expired suspension
                        self.unsuspend_user(user_id)
                        return {
                            'status': 'active',
                            'was_suspended': True
                        }

                    return {
                        'status': 'suspended',
                        'reason': user.get('status_reason'),
                        'changed_at': user.get('status_changed_at'),
                        'end_time': suspension_data['suspension_end_time'],

                    }

            return {
                'status': 'active'
            }
        except Exception as e:
            print(f"Error checking user status: {str(e)}")
            return {'status': 'error', 'error': str(e)} 

    def unassign_all_sessions(self, user_id):
        """Unassign all sessions from a user (set assigned_sessions to empty list)"""
        try:
            self.supabase.table('users').update({
                'assigned_sessions': []
            }).eq('id', user_id).execute()
            # Also update all bots for this user to have no sessions
            user_bots = self.get_user_bots(user_id)
            for bot in user_bots:
                config = dict(bot['config'])
                config['sessions'] = []
                config['session_count'] = 0
                self.update_bot(bot['bot_id'], {'config': config})
            return True
        except Exception as e:
            print(f"Error unassigning all sessions: {str(e)}")
            return False

    def reassign_sessions(self, user_id):
        """Assign new available sessions to a user based on their plan"""
        try:
            user = self.get_user(user_id)
            if not user:
                return False
            max_sessions = user.get('max_sessions', 1)
            return self.assign_random_sessions(user_id, max_sessions)
        except Exception as e:
            print(f"Error reassigning sessions: {str(e)}")
            return False

    # Ticket System Methods
    def create_ticket(self, subject, message, user_id=None, creator_email=None):
        """Create a new support ticket"""
        try:
            # Create the ticket entry
            ticket_data = {
                'subject': subject,
                'user_id': user_id,
                'creator_email': creator_email
            }
            ticket_response = self.supabase.table('tickets').insert(ticket_data).execute()
            if not ticket_response.data:
                raise Exception("Failed to create ticket entry.")
            
            ticket = ticket_response.data[0]
            
            # Create the initial message for the ticket
            message_data = {
                'ticket_id': ticket['id'],
                'sender_id': user_id,
                'message': message,
                'sender_is_admin': False
            }
            message_response = self.supabase.table('ticket_messages').insert(message_data).execute()
            if not message_response.data:
                # Rollback ticket creation if message fails
                self.supabase.table('tickets').delete().eq('id', ticket['id']).execute()
                raise Exception("Failed to create initial ticket message.")
            
            return ticket
        except Exception as e:
            print(f"Error creating ticket: {e}")
            return None

    def get_tickets(self):
        """Get all tickets for the admin panel"""
        try:
            # Disambiguate the two foreign keys to the users table
            response = self.supabase.table('tickets').select(
                '*, user:users!tickets_user_id_fkey(id, password, is_admin), '
                'assigned_admin:users!tickets_assigned_to_fkey(id, password, is_admin)'
            ).order('created_at', desc=True).execute()
            return response.data
        except Exception as e:
            print(f"Error getting tickets: {e}")
            return []

    def get_ticket_details(self, ticket_id):
        """Get a single ticket and all its messages"""
        try:
            # Disambiguate user and assigned_admin
            ticket_response = self.supabase.table('tickets').select(
                '*, user:users!tickets_user_id_fkey(id, password, is_admin), '
                'assigned_admin:users!tickets_assigned_to_fkey(id, password, is_admin)'
            ).eq('id', ticket_id).single().execute()
            if not ticket_response.data:
                return None, None
            
            # For messages, there is only one FK to users, so it's not ambiguous
            messages_response = self.supabase.table('ticket_messages').select(
                '*, sender:users(id, password, is_admin)'
            ).eq('ticket_id', ticket_id).order('created_at').execute()
            
            return ticket_response.data, messages_response.data
        except Exception as e:
            print(f"Error getting ticket details: {e}")
            return None, None

    def add_ticket_reply(self, ticket_id, sender_id, message, sender_is_admin=False):
        """Add a reply to a ticket"""
        try:
            reply_data = {
                'ticket_id': ticket_id,
                'sender_id': sender_id,
                'message': message,
                'sender_is_admin': sender_is_admin
            }
            response = self.supabase.table('ticket_messages').insert(reply_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error adding ticket reply: {e}")
            return None

    def update_ticket(self, ticket_id, status=None, assigned_to=None):
        """Update ticket status or assignment"""
        try:
            update_data = {}
            if status:
                update_data['status'] = status
            if assigned_to:
                update_data['assigned_to'] = assigned_to
            
            if not update_data:
                return None

            response = self.supabase.table('tickets').update(update_data).eq('id', ticket_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating ticket: {e}")
            return None

    def get_tickets_by_email(self, email):
        """Get all tickets for a specific email address"""
        try:
            response = self.supabase.table('tickets').select('*').eq('creator_email', email).order('created_at', desc=True).execute()
            return response.data
        except Exception as e:
            print(f"Error getting tickets by email: {e}")
            return []

    def get_ticket_details_for_user(self, ticket_id, email):
        """Get ticket details, verifying the user's email"""
        try:
            ticket_response = self.supabase.table('tickets').select('*').eq('id', ticket_id).eq('creator_email', email).single().execute()
            if not ticket_response.data:
                return None, None
            
            messages_response = self.supabase.table('ticket_messages').select('*, sender:users(password, is_admin)').eq('ticket_id', ticket_id).order('created_at').execute()
            
            return ticket_response.data, messages_response.data
        except Exception as e:
            print(f"Error getting ticket details for user: {e}")
            return None, None

    def get_user_custom_groups(self, user_id):
        """Get all custom groups for a user"""
        try:
            response = self.supabase.table('user_custom_groups').select('*').eq('user_id', user_id).order('created_at').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting user custom groups: {str(e)}")
            return []

    def add_user_custom_group(self, user_id, group_id, group_link=None):
        """Add a custom group for a user (max 10 per user)"""
        try:
            # Enforce max 10 custom groups per user
            count = self.count_user_custom_groups(user_id)
            if count >= 10:
                return False, "Maximum of 10 custom groups allowed."
            # Check if already exists
            existing = self.supabase.table('user_custom_groups').select('*').eq('user_id', user_id).eq('group_id', group_id).execute()
            if existing.data:
                return False, "Group already exists."
            data = {
                'user_id': user_id,
                'group_id': group_id,
                'group_link': group_link
            }
            resp = self.supabase.table('user_custom_groups').insert(data).execute()
            return True, resp.data[0] if resp.data else None
        except Exception as e:
            print(f"Error adding user custom group: {str(e)}")
            return False, str(e)

    def remove_user_custom_group(self, user_id, group_id):
        """Remove a custom group for a user"""
        try:
            self.supabase.table('user_custom_groups').delete().eq('user_id', user_id).eq('group_id', group_id).execute()
            return True
        except Exception as e:
            print(f"Error removing user custom group: {str(e)}")
            return False

    def count_user_custom_groups(self, user_id):
        """Count the number of custom groups for a user"""
        try:
            response = self.supabase.table('user_custom_groups').select('id', count='exact').eq('user_id', user_id).execute()
            return response.count if response and hasattr(response, 'count') else 0
        except Exception as e:
            print(f"Error counting user custom groups: {str(e)}")
            return 0

    def calculate_plan_upgrade_options(self, user_id):
        """Calculate available plan upgrade options for a user"""
        try:
            user = self.get_user(user_id)
            if not user:
                return None
            
            current_plan = user.get('plan', 'bronze')
            credits = user.get('credits', 0)
            created_at = user.get('created_at')
            duration_hours = user.get('duration_hours', 0)
            
            # Calculate remaining balance
            remaining_balance = credits
            
            # Get all available plans
            plans_response = self.supabase.table('plan_prices').select('*').execute()
            available_plans = plans_response.data if plans_response.data else []
            
            # Calculate upgrade options
            upgrade_options = []
            for plan in available_plans:
                plan_name = plan['plan']
                if plan_name == current_plan:
                    continue
                    
                plan_price = plan['price_usd']
                daily_cost = plan_price / 30  # Assuming 30-day cycles
                days_affordable = remaining_balance / daily_cost if daily_cost > 0 else 0
                
                upgrade_options.append({
                    'plan': plan_name,
                    'price_usd': plan_price,
                    'daily_cost': daily_cost,
                    'days_affordable': days_affordable,
                    'is_upgrade': plan_price > (self.supabase.table('plan_prices').select('price_usd').eq('plan', current_plan).execute().data[0]['price_usd'] if self.supabase.table('plan_prices').select('price_usd').eq('plan', current_plan).execute().data else 0),
                    'requires_payment': days_affordable < 1
                })
            
            return {
                'current_plan': current_plan,
                'remaining_balance': remaining_balance,
                'upgrade_options': upgrade_options
            }
            
        except Exception as e:
            print(f"Error calculating plan upgrade options: {str(e)}")
            return None

    def process_plan_upgrade(self, user_id, new_plan):
        """Process a plan upgrade/downgrade for a user"""
        try:
            user = self.get_user(user_id)
            if not user:
                return {"error": "User not found"}
            
            current_plan = user.get('plan', 'bronze')
            if new_plan == current_plan:
                return {"error": "Already on this plan"}
            
            # Get plan prices
            current_plan_price = self.supabase.table('plan_prices').select('price_usd').eq('plan', current_plan).execute()
            new_plan_price = self.supabase.table('plan_prices').select('price_usd').eq('plan', new_plan).execute()
            
            if not current_plan_price.data or not new_plan_price.data:
                return {"error": "Plan prices not found"}
            
            current_price = current_plan_price.data[0]['price_usd']
            new_price = new_plan_price.data[0]['price_usd']
            
            # Calculate remaining balance and new plan duration
            credits = int(user.get('credits', 0))  # Ensure integer
            remaining_balance = credits
            
            # Calculate daily costs
            new_daily_cost = new_price / 30  # Assuming 30-day cycles for new plan
            new_plan_days = remaining_balance / new_daily_cost if new_daily_cost > 0 else 0
            
            # If less than 1 day affordable, require payment
            if new_plan_days < 1:
                required_payment = new_price - remaining_balance
                return {
                    'requires_payment': True,
                    'amount': required_payment,
                    'message': f'Payment required: ${required_payment:.2f} for {new_plan} plan'
                }
            
            # If we have enough balance, proceed with upgrade
            new_duration_hours = int(new_plan_days * 24)  # Convert to integer
            new_expires_at = datetime.now(timezone.utc) + timedelta(hours=new_duration_hours)
            
            # Get new plan configuration
            new_plan_config = self.supabase.table('plan_configs').select('*').eq('plan', new_plan).execute()
            if not new_plan_config.data:
                return {"error": "New plan configuration not found"}
            
            config = new_plan_config.data[0]
            new_max_sessions = config['max_sessions']
            new_min_interval = config['min_interval']
            new_is_enterprise = config['is_enterprise']
            
            # Update user plan with credits kept (not reset to 0)
            update_data = {
                'plan': new_plan,
                'credits': int(credits),  # Keep credits as balance, ensure integer
                'duration_hours': int(new_duration_hours),  # Ensure integer
                'expires_at': new_expires_at.isoformat(),
                'is_expired': False,
                'max_sessions': int(new_max_sessions),  # Ensure integer
                'min_interval': int(new_min_interval),  # Ensure integer
                'is_enterprise': bool(new_is_enterprise)  # Ensure boolean
            }
            
            # Update user in database
            response = self.supabase.table('users').update(update_data).eq('id', user_id).execute()
            if not response.data:
                return {"error": "Failed to update user plan"}
            
            updated_user = response.data[0]
            
            # Handle session reallocation
            current_sessions = user.get('assigned_sessions', [])
            current_count = len(current_sessions)
            
            if new_max_sessions > current_count:
                # Upgrade: Add more sessions
                additional_sessions_needed = new_max_sessions - current_count
                print(f"Upgrading: Adding {additional_sessions_needed} sessions")
                
                additional_sessions = self._get_additional_sessions(additional_sessions_needed, current_sessions)
                if additional_sessions:
                    current_sessions.extend(additional_sessions)
                    # Update user with new sessions
                    self.supabase.table('users').update({
                        'assigned_sessions': current_sessions
                    }).eq('id', user_id).execute()
                    print(f"Successfully added {len(additional_sessions)} sessions")
                    
            elif new_max_sessions < current_count:
                # Downgrade: Remove excess sessions
                sessions_to_remove = current_count - new_max_sessions
                print(f"Downgrading: Removing {sessions_to_remove} sessions")
                
                current_sessions = current_sessions[:new_max_sessions]
                # Update user with reduced sessions
                self.supabase.table('users').update({
                    'assigned_sessions': current_sessions
                }).eq('id', user_id).execute()
                print(f"Successfully removed {sessions_to_remove} sessions")
            
            # Update bot configurations with new sessions and interval
            user_bots = self.get_user_bots(user_id)
            for bot in user_bots:
                bot_config = dict(bot['config'])
                bot_config['interval'] = new_min_interval * 60  # Convert minutes to seconds
                bot_config['sessions'] = current_sessions[:new_max_sessions]  # Update sessions
                bot_config['session_count'] = len(bot_config['sessions'])
                self.update_bot(bot['bot_id'], {'config': bot_config})
            
            return {
                'success': True,
                'new_plan': new_plan,
                'days_affordable': new_plan_days,
                'sessions_added': new_max_sessions - current_count if new_max_sessions > current_count else 0,
                'sessions_removed': current_count - new_max_sessions if new_max_sessions < current_count else 0,
                'message': f'Successfully switched to {new_plan} plan for {new_plan_days:.1f} days'
            }
                
        except Exception as e:
            print(f"Error processing plan upgrade: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            return {"error": "Failed to process plan upgrade"}

    def create_custom_user(self, data):
        """Create a custom user with full configuration (sync)"""
        try:
            print(f"[DEBUG] Creating custom user with data: {data}")
            # Validate required data
            if not data.get('username') or not data.get('password'):
                print("Username and password are required")
                return None

            # Calculate expiry time if duration provided
            expires_at = None
            duration_days = 0
            if 'duration_days' in data and data['duration_days'] is not None and data['duration_days'] > 0:
                duration_days = data['duration_days']
                expires_at = datetime.now(timezone.utc) + timedelta(days=duration_days)

            # Get the actual session count from the form
            requested_session_count = data.get('session_count', 1)
            print(f"Requested session count: {requested_session_count}")

            # Calculate credits based on custom plan (4 credits per hour)
            duration_hours = duration_days * 24
            credit_amount = self._calculate_credits('custom', duration_hours)

            # Create custom user data with dynamic session limits
            user_data = {
                'password': data.get('password'),
                'plan': str('custom'),  # Custom plan type - ensure it's a string
                'max_sessions': requested_session_count,  # Use actual requested count
                'min_interval': data.get('message_interval', 5),  # Use custom interval
                'is_enterprise': True,
                'is_admin': data.get('admin_access', False),
                'assigned_sessions': [],
                'duration_hours': duration_hours,  # Convert days to hours
                'expires_at': expires_at.isoformat() if expires_at else None,
                'is_expired': False,
                'custom_username': data.get('username'),
                'custom_plan_name': data.get('plan_name'),
                'custom_message_interval': data.get('message_interval'),
                'custom_features': data.get('custom_features', True),
                'is_custom_user': True,
                'credits': credit_amount,
                'credits_updated_at': datetime.now(timezone.utc).isoformat()
            }

            # Create user
            response = self.supabase.table('users').insert(user_data).execute()
            if not response.data:
                print("No data returned from insert")
                return None

            user = response.data[0]
            print(f"User created: {user['id']}")

            # Use the same automatic session assignment logic as normal users
            print(f"[DEBUG] Assigning {requested_session_count} sessions automatically...")
            print(f"[DEBUG] User ID: {user['id']}")
            assigned = self.assign_random_sessions(user['id'], requested_session_count, is_custom_user=True)
            print(f"[DEBUG] Session assignment result: {assigned}")
            
            if not assigned:
                print("Warning: Failed to assign sessions automatically")
                # Try to get at least one session
                available_sessions = self.get_available_sessions()
                if available_sessions:
                    print(f"Available sessions: {available_sessions}")
                    # Try to assign at least one session manually
                    api_creds = self.get_api_credentials()
                    if api_creds:
                        session_configs = []
                        for i, session_name in enumerate(available_sessions[:requested_session_count]):
                            api_cred = api_creds[i % len(api_creds)]
                            
                            # Get session content for custom users
                            session_configs.append({
                                'session_name': session_name,
                                'api_id': api_cred['api_id'],
                                'api_hash': api_cred['api_hash']
                            })
                        
                        if session_configs:
                            print(f"Manually assigning sessions: {session_configs}")
                            self.supabase.table('users').update({
                                'assigned_sessions': session_configs
                            }).eq('id', user['id']).execute()
                            print("Sessions assigned manually")
                        else:
                            print("No sessions could be assigned")
                else:
                    print("No sessions available in container")

            # Create custom bot if auto-start is enabled
            if data.get('auto_start_bot', True):
                print("[DEBUG] Creating custom bot...")
                
                # Get the user's assigned sessions to determine session count
                updated_user = self.get_user(user['id'])
                print(f"[DEBUG] Updated user data: {updated_user}")
                session_count = len(updated_user.get('assigned_sessions', [])) if updated_user else 1
                print(f"[DEBUG] User has {session_count} assigned sessions")
                
                bot_data = {
                    'name': data.get('bot_name', 'Custom Bot'),
                    'message': data.get('bot_message', ''),
                    'interval': data.get('message_interval', 5) * 60,  # Convert minutes to seconds
                    'session_count': session_count
                }
                
                print(f"[DEBUG] Bot data: {bot_data}")
                bot = self.create_bot(user['id'], bot_data)
                print(f"[DEBUG] Bot creation result: {bot}")
                if not bot:
                    print("[DEBUG] Warning: Failed to create custom bot")
                else:
                    print(f"[DEBUG] Custom bot created successfully: {bot}")
                    
                    # Verify bot was created by checking user's bots
                    user_bots = self.get_user_bots(user['id'])
                    print(f"[DEBUG] User now has {len(user_bots)} bots: {user_bots}")
            else:
                print("Auto-start bot disabled")

            # Handle assignment to existing user if specified
            if data.get('assign_to_user'):
                existing_user_id = data['assign_to_user']
                # Add this custom user's sessions to existing user
                existing_user = self.get_user(existing_user_id)
                if existing_user:
                    existing_sessions = existing_user.get('assigned_sessions', [])
                    custom_user_sessions = updated_user.get('assigned_sessions', []) if updated_user else []
                    existing_sessions.extend(custom_user_sessions)
                    
                    # Update existing user
                    self.supabase.table('users').update({
                        'assigned_sessions': existing_sessions
                    }).eq('id', existing_user_id).execute()
                    
                    # Update bot configuration
                    user_bots = self.get_user_bots(existing_user_id)
                    for bot in user_bots:
                        bot_config = dict(bot['config'])
                        bot_config['sessions'].extend(custom_user_sessions)
                        bot_config['session_count'] = len(bot_config['sessions'])
                        self.update_bot(bot['bot_id'], {'config': bot_config})

            print(f"[DEBUG] Custom user creation completed successfully: {user}")
            return user

        except Exception as e:
            print(f"[DEBUG] Error creating custom user: {str(e)}")
            import traceback
            print(f"[DEBUG] Full traceback: {traceback.format_exc()}")
            return None

            print(f"[DEBUG] Error creating custom user: {str(e)}")
            import traceback
            print(f"[DEBUG] Full traceback: {traceback.format_exc()}")
            return None