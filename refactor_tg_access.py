import re

with open('backend/tg.py', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Fix emojis and rename "Login" to "Access Panel" in show_welcome_menu
code = code.replace('InlineKeyboardButton("?? Connect Stake",', 'InlineKeyboardButton("🔌 Connect Stake",')
code = code.replace('InlineKeyboardButton("?? Login",', 'InlineKeyboardButton("🔐 Access Panel",')
code = code.replace('InlineKeyboardButton("?? Account",', 'InlineKeyboardButton("👤 Account",')
code = code.replace('InlineKeyboardButton("?? Logout",', 'InlineKeyboardButton("❌ Logout",')
code = code.replace('InlineKeyboardButton("?? Plans",', 'InlineKeyboardButton("💳 Plans",')
code = code.replace('InlineKeyboardButton("?? Help",', 'InlineKeyboardButton("❔ Help",')

# Fix Abort button globally
code = code.replace('InlineKeyboardButton("? Abort",', 'InlineKeyboardButton("❌ Cancel",')

# 2. Update login_email callback handler
login_email_pattern = re.compile(
    r"    elif data == \"login_email\":\n        login_text = \"\"\" \? \* Login to Start the System\*\n\nPlease send the email address you use on the Soul Predictor dashboard\.\n\nWe will send a verification code to this email\.\nEnter the code here to login\.\"\"\"\n        \n        keyboard = types\.InlineKeyboardMarkup\(\)\n        cancel_btn = types\.InlineKeyboardButton\(\"❌ Cancel\", callback_data=\"cancel_activate\"\)\n        keyboard\.add\(cancel_btn\)\n        \n        try:\n            bot\.edit_message_text\(login_text, user_id, call\.message\.message_id, reply_markup=keyboard, parse_mode='Markdown'\)\n        except Exception:\n            sent = bot\.send_message\(user_id, login_text, reply_markup=keyboard, parse_mode='Markdown'\)\n            if user_id in user_data:\n                user_data\[user_id\]\['menu_message_id'\] = sent\.message_id\n        \n        if user_id in user_data:\n            user_data\[user_id\]\['waiting_login_email'\] = True\n            user_data\[user_id\]\['waiting_login_code'\] = False\n            user_data\[user_id\]\['pending_login_email'\] = None\n            user_data\[user_id\]\['login_code_prompt_msg_id'\] = call\.message\.message_id",
    re.DOTALL
)

# If the exact pattern doesn't match because login_code_prompt_msg_id was None, we use a simpler regex.
login_email_pattern_simplified = re.compile(r"    elif data == \"login_email\":.*?user_data\[user_id\]\['login_code_prompt_msg_id'\].*?\n", re.DOTALL)

new_login_email_handler = """    elif data == "login_email":
        login_text = "🔐 *Access Panel*\\n\\nPlease send the email address you use (or want to use) for Soul Predictor.\\nIf you don't have an account, one will be created for you."
        
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
"""

if "🔐 *Access Panel*" not in code:
    code = login_email_pattern_simplified.sub(new_login_email_handler, code)


# 3. Update text message handler for waiting_login_email and waiting_login_code
text_handler_pattern = re.compile(
    r"    # Handle dashboard email login\n    if user_data\[user_id\]\.get\('waiting_login_email', False\):.*?# Legacy activation flow disabled",
    re.DOTALL
)

new_text_handler = """    # Handle dashboard email login
    if user_data[user_id].get('waiting_login_email', False):
        if not text or '@' not in text:
            bot.send_message(user_id, "Please enter a valid email address.")
            return
        
        email = text.strip().lower()
        
        user_data[user_id]['waiting_login_email'] = False
        user_data[user_id]['waiting_login_code'] = True  # Wait for password
        user_data[user_id]['pending_login_email'] = email
        
        prompt_msg_id = user_data[user_id].get('login_code_prompt_msg_id')
        msg_text = f"🔐 *Access Panel*\\n\\nEmail: `{email}`\\n\\nPlease enter your password.\\n_If creating a new account, this will be your new password._"
        
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
            bot.send_message(user_id, "Login session expired. Please enter your email again.")
            return
            
        if not password or len(password) < 6:
            bot.send_message(user_id, "Please enter a valid password (at least 6 characters).")
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
                user_data[user_id]['login_email'] = email
                user_data[user_id]['login_success'] = True
                user_data[user_id]['waiting_login_code'] = False
                user_data[user_id]['pending_login_email'] = None
                if prompt_msg_id:
                    bot.edit_message_text("✅ *Successfully Logged In!*", user_id, prompt_msg_id, parse_mode='Markdown')
                show_welcome_menu(user_id)
                return
                
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
                    user_data[user_id]['login_email'] = email
                    user_data[user_id]['login_success'] = True
                    user_data[user_id]['waiting_login_code'] = False
                    user_data[user_id]['pending_login_email'] = None
                    if prompt_msg_id:
                        bot.edit_message_text("✅ *Account configured and Logged In!*", user_id, prompt_msg_id, parse_mode='Markdown')
                    show_welcome_menu(user_id)
                    return
                else:
                    bot.send_message(user_id, f"❌ Failed to setup account: {reg_data.get('message') or 'Unknown error'}")
                    return
                    
            # 3. Otherwise, it's an invalid password or other error
            bot.send_message(user_id, f"❌ Login failed: {error_msg}")
            
        except Exception as e:
            print(f"Error during login: {e}")
            bot.send_message(user_id, "❌ Unable to complete login right now. Please try again later.")
        return
    
    # Legacy activation flow disabled"""

if "Handle Password code entry for dashboard email login" not in new_text_handler:
    pass

code = text_handler_pattern.sub(new_text_handler, code)

with open('backend/tg.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done refactoring tg_access")
