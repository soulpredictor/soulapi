import re

with open('backend/app.py', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add werkzeug.security import if not exists
if 'werkzeug.security' not in code:
    code = code.replace('import hashlib', 'import hashlib\nfrom werkzeug.security import generate_password_hash, check_password_hash')

# 2. Modify /register
register_pattern = re.compile(
    r"@app\.route\('/register', methods=\['POST'\]\)\s+def register_user\(\):.*?user_id = generate_session_id\(\)",
    re.DOTALL
)

new_register = """@app.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password')
        
        if not email or '@' not in str(email):
            return jsonify({
                "status": "error",
                "message": "Valid email required"
            }), 400
            
        if not password or len(password) < 6:
            return jsonify({
                "status": "error",
                "message": "Password must be at least 6 characters"
            }), 400
        
        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []
        
        # Check if user already exists
        user, _, _ = get_user_by_email(email, users_data)
        if user:
            return jsonify({
                "status": "error",
                "message": "User with this email already exists"
            }), 400
        
        # Create new user
        user_id = generate_session_id()"""

code = register_pattern.sub(new_register, code)

# Fix password generation in register
code = code.replace('"password": None,', '"password": generate_password_hash(password),')


# 3. Modify /user-login
user_login_pattern = re.compile(
    r"@app\.route\('/user-login', methods=\['POST'\]\)\s+def user_login\(\):.*?users_data = \[\]\n        user_row, _, _ = get_user_by_email\(email, users_data\)",
    re.DOTALL
)

new_user_login = """@app.route('/user-login', methods=['POST'])
def user_login():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or data.get('username') or '').strip().lower()
        password = data.get('password')
        
        if not email:
            return jsonify({
                "status": "error",
                "message": "Email required"
            }), 400
            
        if not password:
            return jsonify({
                "status": "error",
                "message": "Password required"
            }), 400
            
        # Require user to be registered - no login for unregistered users
        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []
        user_row, _, _ = get_user_by_email(email, users_data)"""

code = user_login_pattern.sub(new_user_login, code)

# Check password in /user-login (replacing verification check)
verify_check = """        if not user_row.get('verified'):
            return jsonify({
                "status": "error",
                "message": "Email not verified. Please verify with code first."
            }), 403"""

password_check = """        if not user_row.get('password'):
            return jsonify({
                "status": "error",
                "message": "Account created via OTP. Please use Forgot Password to set a password."
            }), 403
            
        if not check_password_hash(user_row.get('password'), password):
            return jsonify({
                "status": "error",
                "message": "Invalid password."
            }), 403"""

code = code.replace(verify_check, password_check)


# 4. Modify /auth/request-code -> /auth/forgot-password
request_code_pattern = re.compile(r"@app\.route\('/auth/request-code', methods=\['POST'\]\)\s+def auth_request_code\(\):", re.DOTALL)
code = request_code_pattern.sub("@app.route('/auth/forgot-password', methods=['POST'])\ndef auth_forgot_password():", code)

# Change subject of email
code = code.replace("Your SoulAI Verification Code", "Your SoulAI Password Reset Code")
code = code.replace("verification code is", "password reset code is")


# 5. Modify /auth/verify-code to /auth/login for frontend
verify_code_pattern = re.compile(
    r"@app\.route\('/auth/verify-code', methods=\['POST'\]\)\s+def auth_verify_code\(\):.*?except Exception as e:",
    re.DOTALL
)

new_auth_login = """@app.route('/auth/login', methods=['POST'])
def auth_login():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password')
        if not email or not password:
            return jsonify({
                "status": "error",
                "message": "Email and password required"
            }), 400
            
        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []
        user, index, _ = get_user_by_email(email, users_data)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Invalid email or password."
            }), 400
            
        if not user.get('password'):
            return jsonify({
                "status": "error",
                "message": "Account created via OTP. Please use Forgot Password to set a password."
            }), 400
            
        if not check_password_hash(user.get('password'), password):
            return jsonify({
                "status": "error",
                "message": "Invalid email or password."
            }), 400
            
        if not user.get('user_token'):
            user['user_token'] = generate_session_id()
            user['updated_at'] = datetime.now(timezone.utc).isoformat()
            users_data[index] = user
            write_json_file(USERS_JSON_FILE, users_data)
            
        payload = {
            "email": user.get('email'),
            "verified": user.get('verified'),
            "user_token": user.get('user_token'),
            "subscription_plan": user.get('subscription_plan'),
            "subscription_plan_name": get_plan_display_name(user.get('subscription_plan') or "free"),
            "plan_expires_at": user.get('plan_expires_at'),
            "total_paid_usd": user.get('total_paid_usd') or 0,
            "assets": user.get('assets') or []
        }
        return jsonify({
            "status": "success",
            "user": payload
        })
    except Exception as e:"""

code = verify_code_pattern.sub(new_auth_login, code)


# 6. Add /auth/reset-password endpoint before /auth/profile
profile_pattern = re.compile(r"@app\.route\('/auth/profile', methods=\['POST'\]\)")

reset_password_code = """@app.route('/auth/reset-password', methods=['POST'])
def auth_reset_password():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        code = data.get('code')
        new_password = data.get('new_password')
        
        if not email or not code or not new_password:
            return jsonify({
                "status": "error",
                "message": "Email, code, and new password required"
            }), 400
            
        if len(new_password) < 6:
            return jsonify({
                "status": "error",
                "message": "Password must be at least 6 characters"
            }), 400
            
        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []
        user, index, _ = get_user_by_email(email, users_data)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Invalid request"
            }), 400
            
        stored_hash = user.get('verification_code_hash')
        expires_at = user.get('verification_expires_at')
        if not stored_hash or not expires_at:
            return jsonify({
                "status": "error",
                "message": "No active password reset request"
            }), 400
            
        try:
            expiry_dt = convert_to_utc(expires_at)
            if expiry_dt < datetime.now(timezone.utc):
                return jsonify({
                    "status": "error",
                    "message": "Verification code expired"
                }), 400
        except Exception:
            return jsonify({
                "status": "error",
                "message": "Invalid expiry date"
            }), 400
            
        code_hash = hashlib.sha256((email + code).encode('utf-8')).hexdigest()
        if code_hash != stored_hash:
            return jsonify({
                "status": "error",
                "message": "Invalid code"
            }), 400
            
        user['password'] = generate_password_hash(new_password)
        user['verification_code_hash'] = None
        user['verification_expires_at'] = None
        user['verified'] = True
        user['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        if not user.get('user_token'):
            user['user_token'] = generate_session_id()
            
        users_data[index] = user
        write_json_file(USERS_JSON_FILE, users_data)
        
        return jsonify({
            "status": "success",
            "message": "Password reset successfully"
        })
    except Exception as e:
        logger.error(f"Error resetting password: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/auth/profile', methods=['POST'])"""

code = profile_pattern.sub(reset_password_code, code)

with open('backend/app.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done refactoring backend/app.py")
