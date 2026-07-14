import re

with open('src/lib/soulpredictor.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace auth methods
pattern = re.compile(r"export function requestAuthCode.*?export function verifyAuthCode.*?\}", re.DOTALL)

new_auth = """export function registerWithPassword(email: string, password?: string) {
  return postJson<SoulApiResult<{}>>(`${SOULPREDICTOR_API_BASE_URL}/register`, { email, password });
}

export function loginWithPassword(email: string, password?: string) {
  return postJson<SoulApiResult<{ user?: SoulUser }>>(`${SOULPREDICTOR_API_BASE_URL}/auth/login`, { email, password });
}

export function requestPasswordReset(email: string) {
  return postJson<SoulApiResult<{}>>(`${SOULPREDICTOR_API_BASE_URL}/auth/forgot-password`, { email });
}

export function resetPassword(email: string, code: string, new_password?: string) {
  return postJson<SoulApiResult<{}>>(`${SOULPREDICTOR_API_BASE_URL}/auth/reset-password`, { email, code, new_password });
}"""

if "loginWithPassword" not in code:
    code = pattern.sub(new_auth, code)

with open('src/lib/soulpredictor.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done refactoring soulpredictor.ts")
