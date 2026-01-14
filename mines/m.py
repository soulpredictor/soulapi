from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import random
import hashlib
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import random
import string
import time
from threading import Lock
import requests
import telebot
from datetime import datetime, timezone
import json
from threading import Lock
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import random
import string
import time
from threading import Lock
import requests
from datetime import datetime
import json
import os
import threading
import sys
import logging
from time import sleep
from datetime import datetime, timedelta
import supabase
import cloudscraper

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Initialize Supabase client
SUPABASE_URL = "https://zivchqddkiysjvjifrnv.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdmNocWRka2l5c2p2amlmcm52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDgwNjQyMywiZXhwIjoyMDYwMzgyNDIzfQ.wm2ffRacJsWcPJc2mDWKiziODWO6QWuor-LDizLIRoU"

# Create a Supabase client
supabase_client = supabase.create_client(SUPABASE_URL, SUPABASE_KEY)

# Function to retry database operations
def retry_operation(operation, max_retries=3, delay=1):
    """Retry an operation with exponential backoff"""
    retries = 0
    while retries < max_retries:
        try:
            result = operation()
            return result
        except Exception as e:
            retries += 1
            if retries == max_retries:
                raise e
            logger.error(f"Operation failed (attempt {retries}/{max_retries}): {e}")
            sleep(delay * (2 ** (retries - 1)))  # Exponential backoff

def is_key_invalid(key):
    """Check if a key is in the invalid_keys table."""
    try:
        response = retry_operation(lambda: supabase_client
            .table('invalid_keys')
            .select('*')
            .eq('id', key)
            .execute())
        
        return len(response.data) > 0
    except Exception as e:
        logger.error(f"Error checking if key is invalid: {e}")
        return False

def invalidate_key(key):
    """Move a key from active keys to invalid keys table."""
    try:
        # Get the key data from active keys
        key_response = retry_operation(lambda: supabase_client
            .table('keys')
            .select('*')
            .eq('id', key)
            .execute())
        
        if not key_response.data or len(key_response.data) == 0:
            return False
            
        key_data = key_response.data[0]
        
        # Add to invalid keys
        retry_operation(lambda: supabase_client
            .table('invalid_keys')
            .insert({
                'id': key,
                **key_data
            })
            .execute())
        
        # Remove from active keys
        retry_operation(lambda: supabase_client
            .table('keys')
            .delete()
            .eq('id', key)
            .execute())
            
        return True
    except Exception as e:
        logger.error(f"Error invalidating key: {e}")
        return False

def get_all_keys():
    """Get all active keys from Supabase."""
    try:
        response = retry_operation(lambda: supabase_client
            .table('keys')
            .select('id')
            .is_('device_id', 'null')
            .execute())
        
        return [item['id'] for item in response.data]
    except Exception as e:
        logger.error(f"Error getting all keys: {e}")
        return []

def add_key(key):
    """Add a new key to the active keys table."""
    try:
        # Check if key exists
        check_response = retry_operation(lambda: supabase_client
            .table('keys')
            .select('id')
            .eq('id', key)
            .execute())
        
        if check_response.data and len(check_response.data) > 0:
            return False
            
        # Add key
        retry_operation(lambda: supabase_client
            .table('keys')
            .insert({
                'id': key,
                'device_id': None,
                'created_at': datetime.now().isoformat()
            })
            .execute())
            
        return True
    except Exception as e:
        logger.error(f"Error adding key: {e}")
        return False

def bind_key_to_device(key, device_id):
    """Bind a key to a specific device ID."""
    try:
        # Check if key exists
        check_response = retry_operation(lambda: supabase_client
            .table('keys')
            .select('id')
            .eq('id', key)
            .execute())
        
        if not check_response.data or len(check_response.data) == 0:
            return False
            
        # Update key
        retry_operation(lambda: supabase_client
            .table('keys')
            .update({
                'device_id': device_id,
                'bound_at': datetime.now().isoformat()
            })
            .eq('id', key)
            .execute())
            
        return True
    except Exception as e:
        logger.error(f"Error binding key to device: {e}")
        return False

def get_key_info(key):
    """Get information about a specific key."""
    try:
        response = retry_operation(lambda: supabase_client
            .table('keys')
            .select('*')
            .eq('id', key)
            .execute())
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"Error getting key info: {e}")
        return None

app = Flask(__name__)
CORS(app)

# Add these variables for LTC price tracking
price_lock = threading.Lock()
ltc_price = None
last_update = 0
cache_duration = 300  # 5 minutes cache

DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1328323767973449831/TmWiHsnkgEXoQwDIQiIqzP-G_RPqpcFKoi-g6P0u-jV3UQdxPgsSNs4JueErceYV5jRA"
KEYS_FILE = "keys.txt"

# Key management Available keys
USED_KEYS = {}  # Format: {key: {"device_id": device_id, "timestamp": timestamp}}
INVALID_KEYS = set()  # For storing invalidated keys

def get_system_info():
    """Get detailed system information"""
    try:
        info = {
            "os": platform.system(),
            "os_version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
            "hostname": platform.node()
        }
        return info
    except:
        return {"error": "Could not fetch system info"}

def get_browser_info(request):
    """Get browser and request information"""
    return {
        "user_agent": request.headers.get("User-Agent", "Unknown"),
        "accept_language": request.headers.get("Accept-Language", "Unknown"),
        "accept_encoding": request.headers.get("Accept-Encoding", "Unknown")
    }

def get_detailed_ip_info():
    """
    Get detailed IP information using multiple free APIs for accuracy
    Returns merged data from multiple sources
    """
    headers_to_check = [
        'CF-Connecting-IP',
        'X-Forwarded-For',
        'X-Real-IP',
        'X-Client-IP',
        'X-Forwarded',
        'Forwarded-For',
        'Forwarded',
        'X-Cluster-Client-IP',
        'True-Client-IP'
    ]

    def get_real_ip():
        """Get real IP by checking multiple headers"""
        for header in headers_to_check:
            if header in request.headers:
                # Split for X-Forwarded-For like headers that may contain multiple IPs
                ips = request.headers[header].split(',')
                # Return the first IP (original client IP) after stripping whitespace
                return ips[0].strip()

        return request.remote_addr

    def get_ip_info_ipapi(ip):
        """Get IP info from ip-api.com"""
        try:
            url = f"http://ip-api.com/json/{ip}?fields=status,message,continent,country,regionName,city,district,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.json()
            return None
        except:
            return None

    def get_ip_info_ipwhois(ip):
        """Get IP info from ipwhois.app"""
        try:
            url = f"https://ipwho.is/{ip}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.json()
            return None
        except:
            return None

    def get_ip_info_abstractapi(ip):
        """Get IP info from abstractapi.com"""
        try:
            url = f"https://ipgeolocation.abstractapi.com/v1/?ip_address={ip}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.json()
            return None
        except:
            return None

    # Get the real IP address
    ip = get_real_ip()

    # Collect data from multiple sources
    ip_api_data = get_ip_info_ipapi(ip) or {}
    ipwhois_data = get_ip_info_ipwhois(ip) or {}
    abstractapi_data = get_ip_info_abstractapi(ip) or {}

    # Merge and validate data
    merged_data = {
        "ip": ip,
        "country": ip_api_data.get("country") or ipwhois_data.get("country") or abstractapi_data.get("country") or "Unknown",
        "country_code": ip_api_data.get("countryCode") or ipwhois_data.get("country_code") or abstractapi_data.get("country_code") or "Unknown",
        "region": ip_api_data.get("regionName") or ipwhois_data.get("region") or abstractapi_data.get("region") or "Unknown",
        "city": ip_api_data.get("city") or ipwhois_data.get("city") or abstractapi_data.get("city") or "Unknown",
        "zip": ip_api_data.get("zip") or ipwhois_data.get("postal") or abstractapi_data.get("postal_code") or "Unknown",
        "latitude": ip_api_data.get("lat") or ipwhois_data.get("latitude") or abstractapi_data.get("latitude") or 0,
        "longitude": ip_api_data.get("lon") or ipwhois_data.get("longitude") or abstractapi_data.get("longitude") or 0,
        "timezone": ip_api_data.get("timezone") or ipwhois_data.get("timezone") or abstractapi_data.get("timezone") or "Unknown",
        "isp": ip_api_data.get("isp") or ipwhois_data.get("connection", {}).get("isp") or abstractapi_data.get("connection", {}).get("isp_name") or "Unknown",
        "org": ip_api_data.get("org") or ipwhois_data.get("connection", {}).get("org") or abstractapi_data.get("connection", {}).get("organization_name") or "Unknown",
        "as": ip_api_data.get("as") or ipwhois_data.get("connection", {}).get("asn") or abstractapi_data.get("connection", {}).get("autonomous_system_number") or "Unknown",
        "proxy": any([
            ip_api_data.get("proxy", False),
            ipwhois_data.get("security", {}).get("proxy", False),
            abstractapi_data.get("security", {}).get("is_proxy", False)
        ]),
        "vpn": any([
            ip_api_data.get("hosting", False),
            ipwhois_data.get("security", {}).get("vpn", False),
            abstractapi_data.get("security", {}).get("is_vpn", False)
        ]),
        "tor": any([
            ipwhois_data.get("security", {}).get("tor", False),
            abstractapi_data.get("security", {}).get("is_tor", False)
        ]),
        "mobile": any([
            ip_api_data.get("mobile", False),
            ipwhois_data.get("connection", {}).get("is_mobile", False),
            abstractapi_data.get("connection", {}).get("is_mobile", False)
        ]),
        "hosting": any([
            ip_api_data.get("hosting", False),
            ipwhois_data.get("security", {}).get("hosting", False),
            abstractapi_data.get("security", {}).get("is_datacenter", False)
        ])
    }

    return merged_data

def send_to_discord(key_data):
    """Send enhanced monitoring data with detailed IP info to Discord webhook"""
    try:
        ip_info = get_detailed_ip_info()

        fields = [
            {"name": "Key Information", "value": f"Key: {key_data['key']}\nStatus: {key_data.get('status', 'Unknown')}", "inline": False},
            {"name": "Device ID", "value": key_data['device_id'], "inline": True},
            {"name": "IP Information", "value": (
                f"IP: {ip_info['ip']}\n"
                f"Country: {ip_info['country']} ({ip_info['country_code']})\n"
                f"Region: {ip_info['region']}\n"
                f"City: {ip_info['city']}\n"
                f"ZIP: {ip_info['zip']}"
            ), "inline": False},
            {"name": "Connection Details", "value": (
                f"ISP: {ip_info['isp']}\n"
                f"Organization: {ip_info['org']}\n"
                f"AS: {ip_info['as']}"
            ), "inline": False},
            {"name": "Security Checks", "value": (
                f"Proxy: {ip_info['proxy']}\n"
                f"VPN: {ip_info['vpn']}\n"
                f"TOR: {ip_info['tor']}\n"
                f"Hosting/Datacenter: {ip_info['hosting']}\n"
                f"Mobile Connection: {ip_info['mobile']}"
            ), "inline": False},
            {"name": "Location", "value": (
                f"Latitude: {ip_info['latitude']}\n"
                f"Longitude: {ip_info['longitude']}\n"
                f"Timezone: {ip_info['timezone']}"
            ), "inline": False},
            {"name": "System Info", "value": f"OS: {key_data.get('system', {}).get('os', 'Unknown')}\nVersion: {key_data.get('system', {}).get('os_version', 'Unknown')}", "inline": False},
            {"name": "Browser", "value": key_data.get('browser', {}).get('user_agent', 'Unknown'), "inline": False},
            {"name": "Time", "value": key_data["timestamp"], "inline": True}
        ]

        embed = {
            "title": "🔑 Key Usage Alert",
            "color": 5814783,
            "fields": fields,
            "footer": {"text": "Enhanced IP Tracking System"}
        }

        payload = {
            "embeds": [embed]
        }

        requests.post(DISCORD_WEBHOOK_URL, json=payload)
    except Exception as e:
        print(f"Error sending to Discord: {e}")

def get_location_info(ip):
    """Get country information from IP address"""
    try:
        response = requests.get(f"http://ip-api.com/json/{ip}")
        data = response.json()
        return data.get("country", "Unknown")
    except:
        return "Unknown"

@app.route("/code")
def serve_text():
    # Serve the raw text with the correct content type
    return Response(TEXT_CONTENT, mimetype="text/plain")

ltc_price = None
usd_price = None
usd_inr_price = None
last_update_ltc = 0
last_update_usd = 0
last_update_usd_inr = 0
last_update = 0
cache_duration = 60  # seconds
price_lock = threading.Lock()



def fetch_usd_price():
    try:
        response = requests.get('https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=usd')
        data = response.json()
        return data['usd']['usd']
    except Exception as e:
        print(f"Error fetching USD price: {e}")
        return None


def fetch_usd_inr_price():
    try:
        response = requests.get('https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=inr')
        data = response.json()
        return data['usd']['inr']
    except Exception as e:
        print(f"Error fetching USD to INR price: {e}")
        return None


def fetch_ltc_price():
    try:
        apis = [
            {
                'url': 'https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd',
                'handler': lambda r: r.json()['litecoin']['usd'] if r.status_code == 200 else None
            },
            {
                'url': 'https://api.binance.com/api/v3/ticker/price?symbol=LTCUSDT',
                'handler': lambda r: float(r.json()['price']) if r.status_code == 200 else None
            },
            {
                'url': 'https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=LTC-USDT',
                'handler': lambda r: float(r.json()['data']['price']) if r.status_code == 200 else None
            }
        ]

        headers = {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json'
        }

        for api in apis:
            try:
                response = requests.get(api['url'], headers=headers, timeout=10)
                price = api['handler'](response)
                if price is not None:
                    print(f"Successfully fetched price from {api['url']}: {price}")
                    return price
            except Exception as e:
                print(f"Error with {api['url']}: {str(e)}")
                continue

        return None
    except Exception as e:
        print(f"Error in fetch_ltc_price: {str(e)}")
        return None


@app.route('/get_ltc_price', methods=['GET'])
def get_ltc_price():
    global ltc_price, last_update_ltc
    current_time = time.time()

    try:
        with price_lock:
            if ltc_price is None or (current_time - last_update_ltc) > cache_duration:
                new_price = fetch_ltc_price()
                if new_price is not None:
                    ltc_price = new_price
                    last_update_ltc = current_time
                elif ltc_price is not None:
                    return jsonify({'success': True, 'price': ltc_price, 'cached': True})
                else:
                    return jsonify({'success': False, 'error': 'Failed to fetch LTC price'}), 500

            return jsonify({'success': True, 'price': ltc_price, 'cached': True})

    except Exception as e:
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500


@app.route('/get_usd_price', methods=['GET'])
def get_usd_price():
    global usd_price, last_update_usd
    current_time = time.time()

    try:
        with price_lock:
            if usd_price is None or (current_time - last_update_usd) > cache_duration:
                new_price = fetch_usd_price()
                if new_price is not None:
                    usd_price = new_price
                    last_update_usd = current_time
                elif usd_price is not None:
                    return jsonify({'success': True, 'price': usd_price, 'cached': True})
                else:
                    return jsonify({'success': False, 'error': 'Failed to fetch USD price'}), 500

            return jsonify({'success': True, 'price': usd_price, 'cached': True})

    except Exception as e:
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500


@app.route('/get_usd_inr_price', methods=['GET'])
def get_usd_inr_price():
    global usd_inr_price, last_update_usd_inr
    current_time = time.time()

    try:
        with price_lock:
            if usd_inr_price is None or (current_time - last_update_usd_inr) > cache_duration:
                new_price = fetch_usd_inr_price()
                if new_price is not None:
                    usd_inr_price = new_price
                    last_update_usd_inr = current_time
                elif usd_inr_price is not None:
                    return jsonify({'success': True, 'price': usd_inr_price, 'cached': True})
                else:
                    return jsonify({'success': False, 'error': 'Failed to fetch USD-INR price'}), 500

            return jsonify({'success': True, 'price': usd_inr_price, 'cached': True})

    except Exception as e:
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,X-Device-ID')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400
            
        key = data.get('activation_key')
        if not key:
            return jsonify({
                "status": "error",
                "message": "Key required"
            }), 400
            
        device_id = request.headers.get('X-Device-ID')
        if not device_id:
            return jsonify({
                "status": "error",
                "message": "Device identifier required"
            }), 400

        # Check if key exists in any table
        key_response = retry_operation(lambda: supabase_client
            .table('keys')
            .select('*')
            .eq('id', key)
            .execute())
            
        timed_key_response = retry_operation(lambda: supabase_client
            .table('timedKeys')
            .select('*')
            .eq('id', key)
            .execute())
            
        invalid_key_response = retry_operation(lambda: supabase_client
            .table('invalid_keys')
            .select('*')
            .eq('id', key)
            .execute())

        # Check if key is invalidated
        if invalid_key_response.data and len(invalid_key_response.data) > 0:
            return jsonify({
                "status": "error",
                "message": "This key has been invalidated"
            }), 401

        # Check regular keys first
        if key_response.data and len(key_response.data) > 0:
            key_data = key_response.data[0]
            
            # Check device binding
            if key_data.get('device_id'):
                if device_id != key_data['device_id']:
                    return jsonify({
                        "status": "error",
                        "message": "This key is registered to another device"
                    }), 401
                    
                # Create session for existing device
                session_id = create_session(key, device_id)
                if not session_id:
                    return jsonify({
                        "status": "error",
                        "message": "Failed to create session"
                    }), 500
                
                return jsonify({
                    "status": "success",
                    "message": "Login successful"
                })
            else:
                # First time verification - bind the key to this device
                retry_operation(lambda: supabase_client
                    .table('keys')
                    .update({
                        'device_id': device_id,
                        'activated_at': datetime.now(timezone.utc).isoformat()
                    })
                    .eq('id', key)
                    .execute())
                    
                # Create session for new device
                session_id = create_session(key, device_id)
                if not session_id:
                    return jsonify({
                        "status": "error",
                        "message": "Failed to create session"
                    }), 500
                
                return jsonify({
                    "status": "success",
                    "message": "Key activated successfully"
                })
                
        # Check timed keys
        elif timed_key_response.data and len(timed_key_response.data) > 0:
            key_data = timed_key_response.data[0]
            expiry = convert_to_utc(key_data.get('expiry'))
            
            if expiry is None:
                return jsonify({
                    "status": "error",
                    "message": "Invalid expiry date format"
                }), 500
            
            # Check if key has expired
            if expiry < datetime.now(timezone.utc):
                return jsonify({
                    "status": "error",
                    "message": "This timed key has expired"
                }), 401
            
            # Check device binding
            if key_data.get('device_id'):
                if device_id != key_data['device_id']:
                    return jsonify({
                        "status": "error",
                        "message": "This key is registered to another device"
                    }), 401
                    
                # Create session for existing device
                session_id = create_session(key, device_id)
                if not session_id:
                    return jsonify({
                        "status": "error",
                        "message": "Failed to create session"
                    }), 500
                
                return jsonify({
                    "status": "success",
                    "message": "Login successful"
                })
            else:
                # First time verification - bind the key to this device
                retry_operation(lambda: supabase_client
                    .table('timedKeys')
                    .update({
                        'device_id': device_id,
                        'activated_at': datetime.now(timezone.utc).isoformat()
                    })
                    .eq('id', key)
                    .execute())
                    
                # Create session for new device
                session_id = create_session(key, device_id)
                if not session_id:
                    return jsonify({
                        "status": "error",
                        "message": "Failed to create session"
                    }), 500
                
                return jsonify({
                    "status": "success",
                    "message": "Key activated successfully"
                })
        else:
            return jsonify({
                "status": "error",
                "message": "Invalid key"
            }), 401
        
    except Exception as e:
        logger.error(f"Error in login: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/invalidate-key', methods=['POST'])
def invalidate_key_route():
    try:
        data = request.get_json()
        if not data or 'key' not in data:
            return jsonify({
                "status": "error",
                "message": "No key provided"
            }), 400
        
        key = data['key']
        
        # Check all tables for the key
        key_response = retry_operation(lambda: supabase_client
            .table('keys')
            .select('*')
            .eq('id', key)
            .execute())
            
        timed_key_response = retry_operation(lambda: supabase_client
            .table('timedKeys')
            .select('*')
            .eq('id', key)
            .execute())
            
        invalid_key_response = retry_operation(lambda: supabase_client
            .table('invalid_keys')
            .select('*')
            .eq('id', key)
            .execute())
            
        # Check if already invalidated
        if invalid_key_response.data and len(invalid_key_response.data) > 0:
            return jsonify({
                "status": "error",
                "message": "Key is already invalid"
            }), 400
            
        # Handle regular key
        if key_response.data and len(key_response.data) > 0:
            key_data = key_response.data[0]
            
            # Add to invalid keys
            retry_operation(lambda: supabase_client
                .table('invalid_keys')
                .insert({
                    'id': key,
                    'invalidated_at': datetime.now(timezone.utc).isoformat(),
                    'previous_data': key_data
                })
                .execute())
            
            # Remove from active keys
            retry_operation(lambda: supabase_client
                .table('keys')
                .delete()
                .eq('id', key)
                .execute())
                
            return jsonify({
                "status": "success",
                "message": "Key invalidated successfully"
            })
            
        # Handle timed key
        elif timed_key_response.data and len(timed_key_response.data) > 0:
            key_data = timed_key_response.data[0]
            
            # Add to invalid keys
            retry_operation(lambda: supabase_client
                .table('invalid_keys')
                .insert({
                    'id': key,
                    'invalidated_at': datetime.now(timezone.utc).isoformat(),
                    'previous_data': key_data
                })
                .execute())
            
            # Remove from timed keys
            retry_operation(lambda: supabase_client
                .table('timedKeys')
                .delete()
                .eq('id', key)
                .execute())
                
            return jsonify({
                "status": "success",
                "message": "Timed key invalidated successfully"
            })
            
        return jsonify({
            "status": "error",
            "message": "Key not found"
        }), 404
        
    except Exception as e:
        logger.error(f"Error in invalidate_key: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

def convert_to_utc(dt_str):
    """Convert datetime string to UTC datetime object"""
    try:
        # Remove Z and add UTC timezone
        dt = datetime.fromisoformat(dt_str.replace('Z', ''))
        if dt.tzinfo is None:
            # If datetime is naive, assume it's in UTC
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception as e:
        logger.error(f"Error converting datetime: {e}")
        return None

@app.route('/get-analytics', methods=['GET'])
def get_analytics():
    try:
        # Get all keys from different collections
        active_keys = retry_operation(lambda: supabase_client
            .table('keys')
            .select('*')
            .execute())
            
        timed_keys = retry_operation(lambda: supabase_client
            .table('timedKeys')
            .select('*')
            .execute())
            
        invalid_keys = retry_operation(lambda: supabase_client
            .table('invalid_keys')
            .select('*')
            .execute())
            
        # Process keys
        active_keys_data = active_keys.data if active_keys.data else []
        timed_keys_data = timed_keys.data if timed_keys.data else []
        invalid_keys_data = invalid_keys.data if invalid_keys.data else []
        
        # Calculate statistics
        total_keys = len(active_keys_data) + len(timed_keys_data) + len(invalid_keys_data)
        
        # Count bound and unused keys
        bound_keys = 0
        unused_keys = 0
        
        # Count from regular keys
        for key in active_keys_data:
            if key.get('device_id'):
                bound_keys += 1
            else:
                unused_keys += 1
                
        # Count from timed keys
        now = datetime.now(timezone.utc)
        for key in timed_keys_data:
            expiry = convert_to_utc(key.get('expiry'))
            if expiry and expiry > now:  # Only count non-expired keys
                if key.get('device_id'):
                    bound_keys += 1
                else:
                    unused_keys += 1
                
        return jsonify({
            'status': 'success',
            'data': {
                'total_keys': total_keys,
                'bound_keys': bound_keys,
                'unused_keys': unused_keys,
                'invalidated_keys': len(invalid_keys_data)
            }
        })
    except Exception as e:
        logger.error(f"Error in get_analytics: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/get-invalid-keys', methods=['GET'])
def get_invalid_keys():
    try:
        invalid_keys = []
        docs = supabase_client.table('invalid_keys').select('*').execute()
        for doc in docs.data:
            invalid_keys.append(doc['id'])
            
        return jsonify({
            'status': 'success',
            'keys': invalid_keys
        })
    except Exception as e:
        logger.error(f"Error in get_invalid_keys: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/get-bound-keys', methods=['GET'])
def get_bound_keys():
    try:
        bound_keys = []
        docs = supabase_client.table('keys').select('*').is_('device_id', '!=', 'null').execute()
        for doc in docs.data:
            bound_keys.append(doc['id'])
            
        return jsonify({
            'status': 'success',
            'keys': bound_keys
        })
    except Exception as e:
        logger.error(f"Error in get_bound_keys: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/get-timed-keys', methods=['GET'])
def get_timed_keys():
    try:
        # Get all timed keys
        response = retry_operation(lambda: supabase_client
            .table('timedKeys')
            .select('*')
            .execute())
        
        keys = []
        expired_keys = []
        now = datetime.now(timezone.utc)
        
        for item in response.data:
            key_id = item['id']
            expiry = convert_to_utc(item['expiry'])
            
            if expiry is None:
                continue
                
            # Check if key is expired
            if expiry < now:
                expired_keys.append(key_id)
            else:
                keys.append({
                    'id': key_id,
                    'expiry': item['expiry'],
                    'device_id': item['device_id']
                })
        
        # Remove expired keys
        if expired_keys:
            for key in expired_keys:
                retry_operation(lambda: supabase_client
                    .table('timedKeys')
                    .delete()
                    .eq('id', key)
                    .execute())
        
        return jsonify({
            'status': 'success',
            'keys': keys
        })
        
    except Exception as e:
        logger.error(f"Error in get_timed_keys: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def get_time_remaining(expiry_date):
    """Calculate remaining time in human readable format"""
    try:
        now = datetime.now(timezone.utc)
        expiry = convert_to_utc(expiry_date)
        if expiry is None:
            return None
            
        time_left = expiry - now
        
        # If expired
        if time_left.total_seconds() <= 0:
            return "Expired"
            
        days = time_left.days
        hours = time_left.seconds // 3600
        minutes = (time_left.seconds % 3600) // 60
        
        if days > 0:
            return f"{days} days {hours} hours remaining"
        elif hours > 0:
            return f"{hours} hours {minutes} minutes remaining"
        else:
            return f"{minutes} minutes remaining"
    except Exception as e:
        logger.error(f"Error calculating time remaining: {e}")
        return None

@app.route('/check-key-status', methods=['POST'])
def check_key_status():
    try:
        data = request.get_json()
        if not data or 'key' not in data:
            return jsonify({
                'status': 'error',
                'message': 'No key provided'
            }), 400

        key = data['key']
        
        # First check if key exists in timedKeys
        timed_key_response = retry_operation(lambda: supabase_client
            .table('timedKeys')
            .select('*')
            .eq('id', key)
            .execute())
            
        if timed_key_response.data and len(timed_key_response.data) > 0:
            key_data = timed_key_response.data[0]
            expiry = convert_to_utc(key_data.get('expiry'))
            time_remaining = get_time_remaining(key_data.get('expiry'))
            
            if expiry is None:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid expiry date format'
                }), 500
            
            # Check if expired
            if expiry < datetime.now(timezone.utc):
                return jsonify({
                    'status': 'success',
                    'key_status': 'expired',
                    'message': 'This timed key has expired',
                    'expiry': key_data['expiry'],
                    'time_remaining': 'Expired',
                    'is_timed': True
                })
                
            if key_data.get('device_id'):
                return jsonify({
                    'status': 'success',
                    'key_status': 'bound',
                    'message': f'This timed key is bound to a device ({time_remaining})',
                    'expiry': key_data['expiry'],
                    'time_remaining': time_remaining,
                    'device_id': key_data['device_id'],
                    'is_timed': True
                })
            
            return jsonify({
                'status': 'success',
                'key_status': 'unused',
                'message': f'This is an unused timed key ({time_remaining})',
                'expiry': key_data['expiry'],
                'time_remaining': time_remaining,
                'is_timed': True
            })

        # Check if key is invalidated
        invalid_key_response = retry_operation(lambda: supabase_client
            .table('invalid_keys')
            .select('*')
            .eq('id', key)
            .execute())
            
        if invalid_key_response.data and len(invalid_key_response.data) > 0:
            return jsonify({
                'status': 'success',
                'key_status': 'invalid',
                'message': 'This key has been invalidated',
                'is_timed': False
            })

        # Finally check regular keys
        key_response = retry_operation(lambda: supabase_client
            .table('keys')
            .select('*')
            .eq('id', key)
            .execute())
            
        if key_response.data and len(key_response.data) > 0:
            key_data = key_response.data[0]
            if key_data.get('device_id'):
                return jsonify({
                    'status': 'success',
                    'key_status': 'bound',
                    'message': 'This key is bound to a device',
                    'is_timed': False
                })
            else:
                return jsonify({
                    'status': 'success',
                    'key_status': 'unused',
                    'message': 'This key is unused and valid',
                    'is_timed': False
                })
                
        return jsonify({
            'status': 'success',
            'key_status': 'not_found',
            'message': 'This key does not exist',
            'is_timed': False
        })

    except Exception as e:
        logger.error(f"Error in check_key_status: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/boost-validity', methods=['POST'])
def boost_validity():
    try:
        data = request.get_json()
        if not data or 'key' not in data or 'duration' not in data or 'unit' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required parameters'
            }), 400

        key = data['key']
        duration = int(data['duration'])
        unit = data['unit']

        # Get the key from timedKeys table
        key_response = retry_operation(lambda: supabase_client
            .table('timedKeys')
            .select('*')
            .eq('id', key)
            .execute())
        
        if not key_response.data or len(key_response.data) == 0:
            return jsonify({
                'status': 'error',
                'message': 'This key is not a timed key'
            }), 404

        key_data = key_response.data[0]
        
        # Calculate additional time
        additional_seconds = 0
        if unit == 'm':
            additional_seconds = duration * 60
        elif unit == 'h':
            additional_seconds = duration * 3600
        elif unit == 'd':
            additional_seconds = duration * 86400

        # For expired keys, start from current time
        current_expiry = convert_to_utc(key_data['expiry'])
        now = datetime.now(timezone.utc)
        
        # If key is expired, use current time as base
        if current_expiry < now:
            new_expiry = now + timedelta(seconds=additional_seconds)
        else:
            new_expiry = current_expiry + timedelta(seconds=additional_seconds)

        # Update the key with new expiry
        retry_operation(lambda: supabase_client
            .table('timedKeys')
            .update({
                'expiry': new_expiry.isoformat()
            })
            .eq('id', key)
            .execute())

        return jsonify({
            'status': 'success',
            'message': 'Validity extended successfully',
            'new_expiry': new_expiry.isoformat(),
            'was_expired': current_expiry < now
        })

    except Exception as e:
        logger.error(f"Error in boost_validity: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/generate_timed_keys', methods=['POST'])
def generate_timed_keys():
    try:
        data = request.get_json()
        if not data or 'duration' not in data or 'unit' not in data or 'count' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required parameters'
            }), 400

        duration = int(data['duration'])
        unit = data['unit']
        count = int(data['count'])

        if count <= 0 or count > 10:
            return jsonify({
                'status': 'error',
                'message': 'Count must be between 1 and 10'
            }), 400

        # Calculate expiry time
        expiry = datetime.now(timezone.utc)
        if unit == 'm':
            expiry += timedelta(minutes=duration)
        elif unit == 'h':
            expiry += timedelta(hours=duration)
        elif unit == 'd':
            expiry += timedelta(days=duration)
        else:
            return jsonify({
                'status': 'error',
                'message': 'Invalid time unit. Use m, h, or d.'
            }), 400

        # Get all existing timed keys
        existing_timed = retry_operation(lambda: supabase_client
            .table('timedKeys')
            .select('id')
            .execute())
        existing_timed_ids = set(key['id'] for key in existing_timed.data)

        # Get available keys from the keys table that aren't already timed keys
        response = retry_operation(lambda: supabase_client
            .table('keys')
            .select('id')
            .is_('device_id', 'null')
            .execute())
        
        available_keys = [key['id'] for key in response.data if key['id'] not in existing_timed_ids]

        if len(available_keys) < count:
            return jsonify({
                'status': 'error',
                'message': f'Not enough available keys. Only {len(available_keys)} keys available.'
            }), 400

        # Convert to timed keys
        keys = []
        for key in available_keys[:count]:
            try:
                # Move key to timedKeys table
                retry_operation(lambda: supabase_client
                    .table('timedKeys')
                    .insert({
                        'id': key,
                        'created_at': datetime.now(timezone.utc).isoformat(),
                        'expiry': expiry.isoformat(),
                        'device_id': None
                    })
                    .execute())
                
                # Remove from regular keys table
                retry_operation(lambda: supabase_client
                    .table('keys')
                    .delete()
                    .eq('id', key)
                    .execute())
                    
                keys.append(key)
                    
            except Exception as e:
                logger.error(f"Error converting key {key} to timed key: {e}")
                continue

        return jsonify({
            'status': 'success',
            'message': f'{len(keys)} timed keys generated successfully',
            'keys': keys,
            'expiry': expiry.isoformat()
        })

    except Exception as e:
        logger.error(f"Error in generate_timed_keys: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/get-all-keys', methods=['GET'])
def get_all_keys():
    """Get all keys from all tables with their status"""
    try:
        # Get keys from all tables
        active_keys = retry_operation(lambda: supabase_client
            .table('keys')
            .select('*')
            .execute())
            
        timed_keys = retry_operation(lambda: supabase_client
            .table('timedKeys')
            .select('*')
            .execute())
            
        invalid_keys = retry_operation(lambda: supabase_client
            .table('invalid_keys')
            .select('*')
            .execute())
            
        # Process keys
        all_keys = []
        
        # Add regular keys
        for key in active_keys.data:
            all_keys.append({
                'id': key['id'],
                'type': 'regular',
                'status': 'bound' if key.get('device_id') else 'unused',
                'device_id': key.get('device_id'),
                'created_at': key.get('created_at'),
                'activated_at': key.get('activated_at')
            })
            
        # Add timed keys
        now = datetime.now(timezone.utc)
        for key in timed_keys.data:
            expiry = convert_to_utc(key.get('expiry'))
            # Check if key is expired
            is_expired = expiry and expiry < now
            
            status = 'expired' if is_expired else ('bound' if key.get('device_id') else 'unused')
            
            all_keys.append({
                'id': key['id'],
                'type': 'timed',
                'status': status,
                'device_id': key.get('device_id'),
                'created_at': key.get('created_at'),
                'expiry': key.get('expiry'),
                'activated_at': key.get('activated_at'),
                'is_expired': is_expired
            })
            
        # Add invalid keys
        for key in invalid_keys.data:
            all_keys.append({
                'id': key['id'],
                'type': 'invalid',
                'status': 'invalidated',
                'invalidated_at': key.get('invalidated_at'),
                'previous_data': key.get('previous_data')
            })
            
        return jsonify({
            'status': 'success',
            'keys': all_keys
        })
        
    except Exception as e:
        logger.error(f"Error in get_all_keys: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/get-positions', methods=['GET'])
def get_positions():
    # Create a list of all possible positions (0-24)
    positions = list(range(25))

    # Randomly shuffle the positions
    random.shuffle(positions)

    # Take first 3 positions for diamonds
    diamond_positions = positions[:3]

    # All remaining positions will be bombs
    bomb_positions = positions[3:]

    return jsonify({
        "status": "success",
        "diamonds": diamond_positions,
        "bombs": bomb_positions
    })

@app.route('/generate_tiles', methods=['POST'])
def generate_tiles():
    data = request.json
    tile_count = data.get('tileCount', 0)

    if tile_count < 1 or tile_count > 12:
        return jsonify({"error": "Invalid tile count"}), 400

    positions = list(range(25))  # Change to 25 tiles
    random.shuffle(positions)
    selected_tiles = positions[:tile_count]

    return jsonify({
        "status": "success",
        "tiles": selected_tiles
    })


@app.route('/validate_seed', methods=['POST'])
def validate_seed():
    data = request.json
    seed = data.get('server_seed')
    original_seed = data.get('original_seed', '')  # Optional field to check for tampering

    # Basic validation
    if not seed or len(seed) != 64:
        return jsonify({"valid": False, "error": "Server seed must be exactly 64 characters long"}), 400

    # Check for hexadecimal format (only 0-9, a-f characters allowed)
    if not all(c in "0123456789abcdef" for c in seed.lower()):
        return jsonify({"valid": False, "error": "Server seed must contain only hexadecimal characters (0-9, a-f)"}), 400

    # Check for minimum number of letters and digits
    letters = sum(c.isalpha() for c in seed)
    digits = sum(c.isdigit() for c in seed)

    if letters < 12:
        return jsonify({"valid": False, "error": "Server seed must contain at least 12 letters"}), 400

    if digits < 12:
        return jsonify({"valid": False, "error": "Server seed must contain at least 12 digits"}), 400

    # Check distribution - ensure seed has a good mix throughout
    # Divide the seed into 4 parts and verify each part has both letters and digits
    chunk_size = len(seed) // 4
    for i in range(4):
        chunk = seed[i * chunk_size:(i + 1) * chunk_size]
        chunk_letters = sum(c.isalpha() for c in chunk)
        chunk_digits = sum(c.isdigit() for c in chunk)

        if chunk_letters < 3 or chunk_digits < 3:
            return jsonify({"valid": False, "error": "Server seed must have a good distribution of letters and digits throughout"}), 400

    # Check if first 10-12 characters have been modified (if original seed is provided)
    if original_seed and len(original_seed) == 64:
        if not original_seed.startswith(seed[:12]) and not seed.startswith(original_seed[:12]):
            return jsonify({"valid": False, "error": "Beginning of server seed appears to be tampered with"}), 400

    # Check for patterns that might indicate manipulation
    # Prevent simple substitutions like replacing start with common words/numbers
    common_substitutions = ["hello", "1234567890", "abcdefghij", "test", "admin"]
    for sub in common_substitutions:
        # Check if any common substitution exists at the beginning of the seed
        if any(seed.lower().startswith(sub[0:min(len(sub), j)] + seed[j:j+min(12-len(sub), len(sub))])
               for j in range(1, 12)):
            return jsonify({"valid": False, "error": "Server seed contains suspicious patterns"}), 400

    # Check for entropy - no long sequences of the same character
    for i in range(len(seed) - 4):
        if len(set(seed[i:i+5])) <= 2:  # If 5 consecutive chars have 2 or fewer unique chars
            return jsonify({"valid": False, "error": "Server seed must have sufficient randomness"}), 400

    # Analyze the sample seeds to extract more validation rules
    # Looking at the samples, they all have good distribution of hex characters

    # Successful validation
    return jsonify({
        "valid": True,
        "message": "Server seed is valid",
        "analysis": {
            "length": len(seed),
            "letters": letters,
            "digits": digits,
            "hex_format": "valid"
        }
    }), 200


@app.route('/generate_pattern', methods=['POST'])
def generate_pattern():
    data = request.json
    accuracy = data.get('accuracy', 'stable')
    # Generate pattern based on accuracy
    positions = list(range(25))
    random.shuffle(positions)

    if accuracy == "60":
        diamond_count = random.randint(8, 10)
    elif accuracy == "95":
        diamond_count = random.randint(3, 4)
    elif accuracy == "stable":
        diamond_count = random.randint(1, 2)
    else:
        diamond_count = 1

    diamonds = positions[:diamond_count]
    bombs = positions[diamond_count:]

    return jsonify({
        "status": "success",
        "diamonds": diamonds,
        "bombs": bombs
    })


@app.route('/getpat', methods=['POST'])
def getpat():
    try:
        data = request.json
        server_seed = data.get('server_seed')
        mines_count = int(data.get('mines', 1))

        if not server_seed:
            return jsonify({'error': 'Server seed is required'}), 400

        # Set random seed using server seed and current time
        random.seed(server_seed + str(time.time()))

        # Generate all possible positions and shuffle them
        positions = list(range(25))
        random.shuffle(positions)

        # Determine gem count based on mines count
        if mines_count == 1:
            gem_count = random.randint(8, 10)
        elif mines_count == 2:
            gem_count = random.randint(3, 5)
        elif mines_count == 3:
            gem_count = random.randint(2, 5)
        elif mines_count == 4:
            gem_count = random.randint(2, 3)
        elif mines_count == 5:
            gem_count = random.randint(1, 3)
        else:
            gem_count = random.randint(1, 3)

        # Split positions into gems and bombs
        gems = positions[:gem_count]
        bombs = positions[gem_count:gem_count + mines_count]

        return jsonify({
            'status': 'success',
            'gems': gems,
            'bombs': bombs,
            'timestamp': str(time.time())
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Create a cloudscraper instance with mobile browser settings
def create_stake_scraper():
    return cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'android',
            'desktop': False,
            'mobile': True
        },
        delay=5,  # Delay between retries
        interpreter='js2py'  # Use js2py for JavaScript challenge solving
    )

# Function to fetch game data from Stake.ac API via proxy
def fetch_stake_game_data(access_token):
    # Use the proxy server instead of direct Stake.ac API call
    # This should be updated to your actual proxy server URL when deployed
    proxy_url = "http://dono-01.danbot.host:9388/stake_proxy"  # Update this with your actual proxy URL
    
    max_retries = 5
    retry_delay = 3
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Sending POST request to Stake.ac proxy... (Attempt {attempt+1}/{max_retries})")
            
            # Make request to our proxy server
            response = requests.post(
                proxy_url,
                json={'access_token': access_token},
                timeout=30  # Increased timeout
            )
            
            logger.info(f"Response Status Code: {response.status_code}")
            
            # Check if request was successful
            response.raise_for_status()
            
            # Parse JSON response
            data = response.json()
            
            # Check if the proxy returned a success status
            if data.get('status') == 'success' and 'game_data' in data:
                logger.info("Successfully fetched Mines game data via proxy")
                return data['game_data']
            else:
                error_msg = data.get('error', 'Unknown proxy error')
                logger.error(f"Proxy error: {error_msg}")
                if attempt < max_retries - 1:
                    sleep_time = retry_delay * (2 ** attempt)
                    logger.info(f"Retrying in {sleep_time} seconds...")
                    sleep(sleep_time)
                else:
                    logger.error("Max retries reached. Giving up.")
                    return None
            
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP Error: {e}")
            
            if attempt < max_retries - 1:
                sleep_time = retry_delay * (2 ** attempt)  # Exponential backoff
                logger.info(f"Retrying in {sleep_time} seconds...")
                sleep(sleep_time)
            else:
                logger.error("Max retries reached. Giving up.")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request Error: {e}")
            if attempt < max_retries - 1:
                sleep_time = retry_delay * (2 ** attempt)
                logger.info(f"Retrying in {sleep_time} seconds...")
                sleep(sleep_time)
            else:
                logger.error("Max retries reached. Giving up.")
                return None
                
        except json.JSONDecodeError as e:
            logger.error(f"JSON Decode Error: {e}")
            if attempt < max_retries - 1:
                sleep_time = retry_delay * (2 ** attempt)
                logger.info(f"Retrying in {sleep_time} seconds...")
                sleep(sleep_time)
            else:
                logger.error("Max retries reached. Giving up.")
                return None
    
    return None

@app.route('/stake_predict', methods=['POST'])
def stake_predict():
    try:
        data = request.json
        access_token = data.get('access_token')
        game_data = data.get('game_data')
        mines_count = int(data.get('mines', 1))

        if not access_token:
            return jsonify({'error': 'Stake API token is required'}), 400
            
        if not game_data:
            return jsonify({'error': 'Game data is required'}), 400

        # Use game data from Stake API to generate a seed
        game_id = game_data.get('id', '')
        bet_amount = game_data.get('betAmount', '')
        currency = game_data.get('currency', '')
        
        # Create a unique seed from the game data
        seed_data = f"{game_id}_{bet_amount}_{currency}_{access_token}"
        
        # Set random seed using game data
        random.seed(seed_data + str(time.time()))

        # Generate all possible positions and shuffle them
        positions = list(range(25))
        random.shuffle(positions)

        # Determine gem count based on mines count
        if mines_count == 1:
            gem_count = random.randint(8, 10)
        elif mines_count == 2:
            gem_count = random.randint(3, 5)
        elif mines_count == 3:
            gem_count = random.randint(2, 5)
        elif mines_count == 4:
            gem_count = random.randint(2, 3)
        elif mines_count == 5:
            gem_count = random.randint(1, 3)
        else:
            gem_count = random.randint(1, 3)

        # Split positions into gems and bombs
        gems = positions[:gem_count]
        bombs = positions[gem_count:gem_count + mines_count]

        return jsonify({
            'status': 'success',
            'gems': gems,
            'bombs': bombs,
            'timestamp': str(time.time()),
            'game_id': game_id,
            'bet_amount': bet_amount,
            'currency': currency
        })

    except Exception as e:
        logger.error(f"Error in stake_predict: {str(e)}")
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/stake_game_data', methods=['POST'])
def stake_game_data():
    try:
        data = request.json
        access_token = data.get('access_token')
        
        if not access_token:
            return jsonify({'error': 'Stake API token is required', 'status': 'error'}), 400
        
        # Fetch game data from Stake.ac API
        game_data = fetch_stake_game_data(access_token)
        
        if not game_data:
            return jsonify({
                'status': 'error',
                'error': 'Failed to fetch game data from Stake.ac',
                'is_active': False
            }), 500
        
        # Check if there's an active game
        is_active = game_data is not None
        
        return jsonify({
            'status': 'success',
            'game_data': game_data,
            'is_active': is_active
        })
        
    except Exception as e:
        logger.error(f"Error in stake_game_data: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'is_active': False
        }), 500

@app.route('/verify', methods=['POST'])
def verify_key():
    try:
        data = request.get_json()
        if not data or 'key' not in data:
            return jsonify({
                "status": "error",
                "message": "No key provided"
            }), 400
        
        key = data['key']
        device_id = request.headers.get('X-Device-ID')

        if not device_id:
            return jsonify({
                "status": "error",
                "message": "Device ID required"
            }), 400
            
        # Check if key exists in any table
        key_response = retry_operation(lambda: supabase_client
            .table('keys')
            .select('*')
            .eq('id', key)
            .execute())
            
        timed_key_response = retry_operation(lambda: supabase_client
            .table('timedKeys')
            .select('*')
            .eq('id', key)
            .execute())
            
        invalid_key_response = retry_operation(lambda: supabase_client
            .table('invalid_keys')
            .select('*')
            .eq('id', key)
            .execute())

        # Check if key is invalidated
        if invalid_key_response.data and len(invalid_key_response.data) > 0:
            return jsonify({
                "status": "error",
                "message": "This key has been invalidated",
                "valid": False
            }), 401

        # Check regular keys first
        if key_response.data and len(key_response.data) > 0:
            key_data = key_response.data[0]
            
            # Check device binding
            if key_data.get('device_id'):
                if device_id != key_data['device_id']:
                    return jsonify({
                        "status": "error",
                        "message": "This key is registered to another device",
                        "valid": False
                    }), 401
                
                return jsonify({
                    "status": "success",
                    "message": "Key verified successfully",
                    "valid": True,
                    "key": key
                })
            else:
                # First time verification - bind the key to this device
                retry_operation(lambda: supabase_client
                    .table('keys')
                    .update({
                        'device_id': device_id,
                        'activated_at': datetime.now(timezone.utc).isoformat()
                    })
                    .eq('id', key)
                    .execute())
                
                return jsonify({
                    "status": "success",
                    "message": "Key activated successfully",
                    "valid": True,
                    "key": key
                })
                
        # Check timed keys
        elif timed_key_response.data and len(timed_key_response.data) > 0:
            key_data = timed_key_response.data[0]
            expiry = convert_to_utc(key_data.get('expiry'))
            
            if expiry is None:
                return jsonify({
                    "status": "error",
                    "message": "Invalid expiry date format",
                    "valid": False
                }), 500
            
            # Check if key has expired
            if expiry < datetime.now(timezone.utc):
                return jsonify({
                    "status": "error",
                    "message": "This timed key has expired",
                    "valid": False
                }), 401
            
            # Check device binding
            if key_data.get('device_id'):
                if device_id != key_data['device_id']:
                    return jsonify({
                        "status": "error",
                        "message": "This key is registered to another device",
                        "valid": False
                    }), 401
                
                return jsonify({
                    "status": "success",
                    "message": "Key verified successfully",
                    "valid": True,
                    "key": key
                })
            else:
                # First time verification - bind the key to this device
                retry_operation(lambda: supabase_client
                    .table('timedKeys')
                    .update({
                        'device_id': device_id,
                        'activated_at': datetime.now(timezone.utc).isoformat()
                    })
                    .eq('id', key)
                    .execute())
                
                return jsonify({
                    "status": "success",
                    "message": "Key activated successfully",
                    "valid": True,
                    "key": key
                })
        else:
            return jsonify({
                "status": "error",
                "message": "Invalid key",
                "valid": False
            }), 401
        
    except Exception as e:
        logger.error(f"Error in verify_key: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "valid": False
        }), 500

@app.route('/get-key-details/<key_type>', methods=['GET'])
def get_key_details(key_type):
    """Get detailed information about keys of a specific type"""
    try:
        if key_type == 'total':
            return get_all_keys()
            
        elif key_type == 'bound':
            # Get bound keys from both regular and timed tables
            regular_bound = retry_operation(lambda: supabase_client
                .table('keys')
                .select('*')
                .execute())
            
            regular_bound_data = [key for key in regular_bound.data if key.get('device_id')]
                
            timed_bound = retry_operation(lambda: supabase_client
                .table('timedKeys')
                .select('*')
                .execute())
            
            timed_bound_data = [key for key in timed_bound.data if key.get('device_id')]
                
            bound_keys = []
            
            # Add regular bound keys
            for key in regular_bound_data:
                bound_keys.append({
                    'id': key['id'],
                    'type': 'regular',
                    'device_id': key.get('device_id'),
                    'activated_at': key.get('activated_at'),
                    'created_at': key.get('created_at')
                })
                
            # Add timed bound keys
            now = datetime.now(timezone.utc)
            for key in timed_bound_data:
                expiry = convert_to_utc(key.get('expiry'))
                if expiry and expiry > now:
                    bound_keys.append({
                        'id': key['id'],
                        'type': 'timed',
                        'device_id': key.get('device_id'),
                        'activated_at': key.get('activated_at'),
                        'created_at': key.get('created_at'),
                        'expiry': key.get('expiry')
                    })
                    
            return jsonify({
                'status': 'success',
                'keys': bound_keys
            })
            
        elif key_type == 'unused':
            # Get unused keys from both regular and timed tables
            regular_unused = retry_operation(lambda: supabase_client
                .table('keys')
                .select('*')
                .is_('device_id', 'null')
                .execute())
                
            timed_unused = retry_operation(lambda: supabase_client
                .table('timedKeys')
                .select('*')
                .is_('device_id', 'null')
                .execute())
                
            unused_keys = []
            
            # Add regular unused keys
            for key in regular_unused.data:
                unused_keys.append({
                    'id': key['id'],
                    'type': 'regular',
                    'created_at': key.get('created_at')
                })
                
            # Add timed unused keys
            now = datetime.now(timezone.utc)
            for key in timed_unused.data:
                expiry = convert_to_utc(key.get('expiry'))
                if expiry and expiry > now:
                    unused_keys.append({
                        'id': key['id'],
                        'type': 'timed',
                        'created_at': key.get('created_at'),
                        'expiry': key.get('expiry')
                    })
                    
            return jsonify({
                'status': 'success',
                'keys': unused_keys
            })
            
        elif key_type == 'invalidated':
            # Get all invalidated keys
            invalid_keys = retry_operation(lambda: supabase_client
                .table('invalid_keys')
                .select('*')
                .execute())
                
            return jsonify({
                'status': 'success',
                'keys': [{
                    'id': key['id'],
                    'type': 'invalid',
                    'invalidated_at': key.get('invalidated_at'),
                    'previous_data': key.get('previous_data')
                } for key in invalid_keys.data]
            })
            
        else:
            return jsonify({
                'status': 'error',
                'message': 'Invalid key type'
            }), 400
            
    except Exception as e:
        logger.error(f"Error in get_key_details: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def generate_session_id():
    """Generate a UUID v4 format string without using uuid module"""
    # Generate 16 random bytes (128 bits)
    random_bytes = ''.join(random.choices('0123456789abcdef', k=32))
    
    # Insert UUID version (4)
    random_bytes = f"{random_bytes[:12]}4{random_bytes[13:]}"
    
    # Insert UUID variant (8, 9, a, or b)
    random_bytes = f"{random_bytes[:16]}{random.choice('89ab')}{random_bytes[17:]}"
    
    # Format as UUID
    return f"{random_bytes[:8]}-{random_bytes[8:12]}-{random_bytes[12:16]}-{random_bytes[16:20]}-{random_bytes[20:]}"

def validate_session(device_id):
    """Validate if a device has an active session and valid key"""
    try:
        now = datetime.now(timezone.utc)
        
        # Get active session for device
        response = retry_operation(lambda: supabase_client
            .table('sessions')
            .select('*')
            .eq('device_id', device_id)
            .execute())
            
        if not response.data:
            return False
            
        session = response.data[0]
        key = session['key']
        
        # Check if key exists in invalid_keys
        invalid_key_response = retry_operation(lambda: supabase_client
            .table('invalid_keys')
            .select('*')
            .eq('id', key)
            .execute())
            
        if invalid_key_response.data and len(invalid_key_response.data) > 0:
            # Delete session if key is invalid
            retry_operation(lambda: supabase_client
                .table('sessions')
                .delete()
                .eq('id', session['id'])
                .execute())
            return False
            
        # Check if key exists in timed_keys and is not expired
        timed_key_response = retry_operation(lambda: supabase_client
            .table('timedKeys')
            .select('*')
            .eq('id', key)
            .execute())
            
        if timed_key_response.data and len(timed_key_response.data) > 0:
            key_data = timed_key_response.data[0]
            key_expiry = convert_to_utc(key_data.get('expiry'))
            
            if key_expiry and key_expiry < now:
                # Delete session if timed key is expired
                retry_operation(lambda: supabase_client
                    .table('sessions')
                    .delete()
                    .eq('id', session['id'])
                    .execute())
                return False
                
        # Check if key exists in regular keys
        key_response = retry_operation(lambda: supabase_client
            .table('keys')
            .select('*')
            .eq('id', key)
            .execute())
            
        if not key_response.data and not timed_key_response.data:
            # Delete session if key doesn't exist in either table
            retry_operation(lambda: supabase_client
                .table('sessions')
                .delete()
                .eq('id', session['id'])
                .execute())
            return False
            
        return True
    except Exception as e:
        logger.error(f"Error validating session: {e}")
        return False

def create_session(key, device_id):
    """Create a new session in the sessions table"""
    try:
        # Check for existing session
        existing_session = retry_operation(lambda: supabase_client
            .table('sessions')
            .select('*')
            .eq('device_id', device_id)
            .execute())
            
        if existing_session.data:
            # Update existing session with new key
            retry_operation(lambda: supabase_client
                .table('sessions')
                .update({
                    'key': key,
                    'updated_at': datetime.now(timezone.utc).isoformat()
                })
                .eq('device_id', device_id)
                .execute())
            return existing_session.data[0]['id']
            
        # Create new session
        session_id = generate_session_id()
        retry_operation(lambda: supabase_client
            .table('sessions')
            .insert({
                'id': session_id,
                'key': key,
                'device_id': device_id,
                'created_at': datetime.now(timezone.utc).isoformat(),
                'updated_at': datetime.now(timezone.utc).isoformat()
            })
            .execute())
            
        return session_id
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        return None

@app.route('/check-session', methods=['POST'])
def check_session():
    """Check if a device has a valid session and key"""
    try:
        device_id = request.headers.get('X-Device-ID')
        if not device_id:
            return jsonify({
                'status': 'error',
                'message': 'Device ID required',
                'valid': False
            }), 401
            
        is_valid = validate_session(device_id)
        
        return jsonify({
            'status': 'success',
            'valid': is_valid
        })
    except Exception as e:
        logger.error(f"Error checking session: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'valid': False
        }), 500

if __name__ == '__main__':
    # Start the Telegram bot in a separate thread
    import threading
    threading.Thread(target=bot.polling, daemon=True).start()

    # Run the Flask app
    app.run(debug=True)