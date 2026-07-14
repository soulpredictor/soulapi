import re

with open('backend/tg.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Enhance connect button
code = code.replace('InlineKeyboardButton("Connect Stake",', 'InlineKeyboardButton("?? Connect Stake",')
code = code.replace('InlineKeyboardButton("Login",', 'InlineKeyboardButton("?? Login",')
code = code.replace('InlineKeyboardButton("Account",', 'InlineKeyboardButton("?? Account",')
code = code.replace('InlineKeyboardButton("Logout",', 'InlineKeyboardButton("?? Logout",')
code = code.replace('InlineKeyboardButton("Plans",', 'InlineKeyboardButton("?? Plans",')
code = code.replace('InlineKeyboardButton("Help",', 'InlineKeyboardButton("?? Help",')
code = code.replace('InlineKeyboardButton("Abort",', 'InlineKeyboardButton("? Abort",')

# Write back
with open('backend/tg.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done enhancing buttons in tg.py")
