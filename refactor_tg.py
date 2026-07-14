import re

with open('backend/tg.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace plan names globally
code = code.replace('S-Free', 'Free')
code = code.replace('S-Enterprise', 'Diamond')
code = code.replace('S-Max', 'Obsidian')
code = code.replace('S-OG', 'Obsidian')

# Replace the email waiting handler
email_handler_pattern = re.compile(
    r"    # Handle dashboard email login.*?return\n\n    # Handle OTP code entry for dashboard email login",
    re.DOTALL
)

new_email_handler = """    # Handle dashboard email login
    if user_data[user_id].get('waiting_login_email', False):
        if not text or '@' not in text:
            bot.send_message(user_id, "Please enter a valid email address.")
            return
        
        email = text.strip().lower()
        
        user_data[user_id]['waiting_login_email'] = False
        user_data[user_id]['waiting_login_code'] = True  # We'll re-use this state for password
        user_data[user_id]['pending_login_email'] = email
        sent = bot.send_message(
            user_id,
            f"Please enter the password for `{email}` to continue.",
            parse_mode='Markdown'
        )
        user_data[user_id]['login_code_prompt_msg_id'] = sent.message_id
        return

    # Handle Password code entry for dashboard email login"""

code = email_handler_pattern.sub(new_email_handler, code)

# Replace the password verification call
verify_pattern = re.compile(
    r"        if not code or len\(code\) != 6 or not code\.isdigit\(\):.*?bot\.send_message\(user_id, \"Please enter a valid 6-digit verification code\.\"\).*?return.*?try:\n            verify_resp = requests\.post\(\n                f\"\{BACKEND_URL\}/auth/verify-code\",\n                json={\"email\": email, \"code\": code},\n                headers={\"Content-Type\": \"application/json\"},\n                timeout=8\n            \)",
    re.DOTALL
)

new_verify = """        password = (text or '').strip()
        if not password or len(password) < 6:
            bot.send_message(user_id, "Please enter a valid password (at least 6 characters).")
            return
        try:
            verify_resp = requests.post(
                f"{BACKEND_URL}/user-login",
                json={"email": email, "password": password},
                headers={"Content-Type": "application/json"},
                timeout=8
            )"""

code = verify_pattern.sub(new_verify, code)

with open('backend/tg.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done refactoring tg.py logic")
