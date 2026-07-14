export const SOULPREDICTOR_API_BASE_URL = "https://api.soulpredictor.xyz";

export const SOUL_SESSION_KEYS = {
  email: "soulai_email",
  userToken: "soulai_user_token",
} as const;

export type SoulSession = {
  email: string | null;
  userToken: string | null;
};

export type SoulApiResult<T> = {
  status: string;
  message?: string;
} & T;

export type SoulUser = Record<string, unknown> & {
  username?: string;
  email?: string;
  user_token?: string;
  subscription_plan?: string;
  plan_active?: boolean | string;
  plan_expires_at?: string;
};

export type SoulUserStats = Record<string, number>;

export type SoulTicket = Record<string, unknown> & {
  id?: string | number;
  ticket_id?: string | number;
  subject?: string;
  status?: string;
  created_at?: string;
  messages?: Array<Record<string, unknown>>;
};

export type ExtensionTokenResult = {
  connected?: boolean;
  token?: string;
};

export type CheckExtensionResult = {
  connected?: boolean;
};

export type StakeGameDataResult = {
  status?: string;
  game_data?: Record<string, unknown> & {
    is_active?: boolean;
    id?: string;
    mines?: number;
    user?: Record<string, unknown> & { name?: string; username?: string };
  };
};

export type GetPredictionResult = {
  status?: string;
  prediction?: Record<string, unknown> & {
    game_type?: string;
    bet_id?: string | number | null;
  };
};

export type CrashPredictResult = {
  status?: string;
  predictions?: {
    safe_prediction: number;
    medium_prediction: number;
  };
  historical_data?: {
    crash_points?: number[];
  };
};

export function getStoredSession(): SoulSession {
  if (typeof window === "undefined") return { email: null, userToken: null };
  return {
    email: window.localStorage.getItem(SOUL_SESSION_KEYS.email),
    userToken: window.localStorage.getItem(SOUL_SESSION_KEYS.userToken),
  };
}

export function setStoredSession(session: { email: string; userToken?: string | null }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOUL_SESSION_KEYS.email, session.email);
  if (session.userToken) window.localStorage.setItem(SOUL_SESSION_KEYS.userToken, session.userToken);
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SOUL_SESSION_KEYS.email);
  window.localStorage.removeItem(SOUL_SESSION_KEYS.userToken);
}

export function getClientInfo() {
  if (typeof window === "undefined") return "server";
  return navigator.userAgent;
}

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text || `Request failed (${res.status})`);
  }
}

async function postJson<T>(url: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    body: JSON.stringify(body),
    ...init,
  });
  const data = await readJson<T>(res);
  if (!res.ok) throw new Error((data as any)?.message ?? `Request failed (${res.status})`);
  return data;
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { method: "GET", ...init });
  const data = await readJson<T>(res);
  if (!res.ok) throw new Error((data as any)?.message ?? `Request failed (${res.status})`);
  return data;
}

export function registerWithPassword(email: string, password?: string) {
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
}

export function authProfile(session: SoulSession) {
  return postJson<SoulApiResult<{ user?: SoulUser }>>(`${SOULPREDICTOR_API_BASE_URL}/auth/profile`, {
    email: session.email ?? null,
    user_token: session.userToken ?? null,
  });
}

export function userLogin(session: SoulSession) {
  return postJson<SoulApiResult<{ user?: SoulUser }>>(`${SOULPREDICTOR_API_BASE_URL}/user-login`, {
    email: session.email ?? null,
    user_token: session.userToken ?? null,
  });
}

export function userStats(username: string) {
  return postJson<SoulApiResult<{ stats?: SoulUserStats }>>(`${SOULPREDICTOR_API_BASE_URL}/user-stats`, { username });
}

export function userAssets(email: string) {
  return postJson<SoulApiResult<{ assets?: Record<string, unknown> }>>(`${SOULPREDICTOR_API_BASE_URL}/user-assets`, { email });
}

export function userTickets(username: string) {
  return getJson<SoulApiResult<{ tickets?: SoulTicket[] }>>(`${SOULPREDICTOR_API_BASE_URL}/user-tickets/${encodeURIComponent(username)}`);
}

export function createUserTicket(args: { username: string; subject: string; message: string; client_info: string }) {
  return postJson<SoulApiResult<{ ticket?: SoulTicket }>>(`${SOULPREDICTOR_API_BASE_URL}/user-ticket`, args);
}

export function replyUserTicket(args: {
  ticket_id: string | number;
  sender: "user";
  message: string;
  username: string;
  client_info: string;
}) {
  return postJson<SoulApiResult<{ ticket?: SoulTicket }>>(`${SOULPREDICTOR_API_BASE_URL}/user-ticket-reply`, args);
}

export function requestPredictorAccess(args: { username: string; predictor_type: string; request_message: string }) {
  return postJson<SoulApiResult<{}>>(`${SOULPREDICTOR_API_BASE_URL}/request-predictor-access`, args);
}

export function trackPredictionUsage(args: {
  username: string;
  email?: string;
  type: string;
  source?: string;
  plan?: string;
}) {
  return postJson<SoulApiResult<{}>>(`${SOULPREDICTOR_API_BASE_URL}/track-prediction`, {
    ...args,
    source: args.source ?? "web",
    plan: args.plan ?? "demo",
  });
}

export function getExtensionToken() {
  return getJson<ExtensionTokenResult>(`${SOULPREDICTOR_API_BASE_URL}/get_extension_token`);
}

export function checkExtension(token: string) {
  return postJson<CheckExtensionResult>(`${SOULPREDICTOR_API_BASE_URL}/check_extension`, { token });
}

export function stakeGameData(accessToken: string) {
  return postJson<StakeGameDataResult>(`${SOULPREDICTOR_API_BASE_URL}/stake_game_data`, { access_token: accessToken });
}

export function getPrediction(token: string) {
  return postJson<GetPredictionResult>(`${SOULPREDICTOR_API_BASE_URL}/get_prediction`, { token });
}

export function crashPredict(accessToken: string) {
  return postJson<CrashPredictResult>(`${SOULPREDICTOR_API_BASE_URL}/crash_predict`, { access_token: accessToken });
}

export type BlackjackPredictResult = {
  status?: string;
  recommendation?: string; // "hit" | "stand" | "double" | "split" | "insurance"
  confidence?: number;
  player_value?: number;
  dealer_value?: number;
  hand_type?: string;
  prediction?: {
    action?: string;
    reason?: string;
    player_total?: number;
    dealer_card?: number;
    confidence?: number;
  };
};

export function blackjackPredict(accessToken: string) {
  return postJson<BlackjackPredictResult>(`${SOULPREDICTOR_API_BASE_URL}/get_prediction`, { token: accessToken });
}

export type MolesPredictResult = {
  status?: string;
  prediction?: Record<string, unknown> & {
    game_type?: string;
    bet_id?: string | number | null;
    safe_holes?: number[];
    mole_holes?: number[];
    total_holes?: number;
  };
};

export function molesPredict(accessToken: string) {
  return postJson<MolesPredictResult>(`${SOULPREDICTOR_API_BASE_URL}/get_prediction`, { token: accessToken });
}
