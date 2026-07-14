import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Brain, RefreshCcw, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  blackjackPredict,
  checkExtension,
  getExtensionToken,
  getStoredSession,
  trackPredictionUsage,
  userLogin,
  type SoulSession,
  type SoulUser,
} from "@/lib/soulpredictor";
import PredictorLayout from "./PredictorLayout";

const STAKE_TOKEN_STORAGE_KEY = "soulai_stake_api_token";

type ConnectionState = "disconnected" | "connecting" | "connected";

type Action = "hit" | "stand" | "double" | "split" | "insurance" | null;

const ACTION_CONFIG: Record<
  Exclude<Action, null>,
  { label: string; color: string; bg: string; border: string; desc: string }
> = {
  hit: {
    label: "HIT",
    color: "text-red-300",
    bg: "bg-red-500/15",
    border: "border-red-500/40",
    desc: "Draw another card to improve your hand.",
  },
  stand: {
    label: "STAND",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/30",
    desc: "Keep your current hand and end your turn.",
  },
  double: {
    label: "DOUBLE DOWN",
    color: "text-amber-300",
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
    desc: "Double your bet and receive exactly one more card.",
  },
  split: {
    label: "SPLIT",
    color: "text-blue-300",
    bg: "bg-blue-500/15",
    border: "border-blue-500/40",
    desc: "Split matching cards into two separate hands.",
  },
  insurance: {
    label: "TAKE INSURANCE",
    color: "text-purple-300",
    bg: "bg-purple-500/15",
    border: "border-purple-500/40",
    desc: "Optional side bet when dealer shows an Ace.",
  },
};

function normalizeAction(raw: string | undefined): Action {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();
  if (s === "hit") return "hit";
  if (s === "stand" || s === "stay") return "stand";
  if (s === "double" || s.includes("double")) return "double";
  if (s === "split") return "split";
  if (s === "insurance") return "insurance";
  return null;
}

type CardData = { rank: string; suit: string };
type PlayerHand = {
  cards: CardData[];
  computed_total?: number;
  computed_soft?: boolean;
  value?: number;
  recommendation?: {
    action: string;
    player_total?: number;
    player_soft?: boolean;
    reason?: string;
    ev_hint?: string;
  };
};

type BlackjackPayload = {
  game_type?: string;
  timestamp?: number;
  ai_pending?: boolean;
  strategy?: string;
  bet_amount?: number | string;
  currency?: string;
  bet_id?: string;
  dealer_cards?: CardData[];
  dealer_up_index?: number;
  dealer_up_rank?: string;
  dealer_up_value?: number;
  player_hands?: PlayerHand[];
  playable?: boolean;
};

function PlayingCard({ card, upCard, hidden }: { card?: CardData; upCard?: boolean; hidden?: boolean }) {
  if (hidden) {
    return (
      <div className="bj-card bj-card-back">
        <span className="bj-back-pattern" />
      </div>
    );
  }
  if (!card) return null;
  const suit = (card.suit || "").toLowerCase();
  const isRed = suit === "h" || suit === "d";
  const suitMap: Record<string, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };
  const symbol = suitMap[suit] || suit;
  const rankStr = String(card.rank).toUpperCase();
  const rank = rankStr === "10" ? "10" : rankStr || "?";

  return (
    <div className={cn("bj-card", isRed && "bj-red", upCard && "bj-card-up")}>
      <span className="bj-card-rank">{rank}</span>
      <span className="bj-card-suit">{symbol}</span>
    </div>
  );
}

export default function BlackjackPredictor() {
  const [session] = useState<SoulSession>(() => getStoredSession());
  const [stakeToken, setStakeToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(STAKE_TOKEN_STORAGE_KEY) ?? "";
  });

  const [connection, setConnection] = useState<ConnectionState>("disconnected");
  const [statusText, setStatusText] = useState("Not connected");
  const [betsCounter, setBetsCounter] = useState(0);

  // Full prediction payload
  const [prediction, setPrediction] = useState<BlackjackPayload | null>(null);
  const [actionHistory, setActionHistory] = useState<Array<{ action: Action; ts: number }>>([]);

  const predictionPollRef = useRef<number | null>(null);
  const tokenPollRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);

  const loginQuery = useQuery({
    queryKey: ["soulpredictor-user-login", session.email, session.userToken],
    queryFn: () => userLogin(session),
    enabled: !!session.email || !!session.userToken,
    retry: false,
    staleTime: 30_000,
  });

  const user = (loginQuery.data?.user ?? undefined) as SoulUser | undefined;
  const planActive = user?.plan_active === true || user?.plan_active === "true";
  const accessEnabled = (user as any)?.blackjack_access_enabled === true;
  const canUse = planActive && accessEnabled;
  const username = useMemo(
    () => user?.username || user?.email || session.email || "",
    [session.email, user?.email, user?.username]
  );

  const clearTimers = useCallback(() => {
    if (predictionPollRef.current) window.clearInterval(predictionPollRef.current);
    if (tokenPollRef.current) window.clearInterval(tokenPollRef.current);
    predictionPollRef.current = null;
    tokenPollRef.current = null;
  }, []);

  const disconnect = useCallback(() => {
    clearTimers();
    setConnection("disconnected");
    setStatusText("Not connected");
    setPrediction(null);
    setActionHistory([]);
    lastTsRef.current = 0;
  }, [clearTimers]);

  const handleNewPrediction = useCallback((pred: any) => {
    if (!pred || pred.game_type !== "blackjack") return;

    // We can receive prediction nested inside .prediction or directly
    const payload = (pred.prediction || pred) as BlackjackPayload;

    const ts = Number(payload.timestamp || 0);
    // Dedup by timestamp
    if (ts > 0 && lastTsRef.current > 0 && ts < lastTsRef.current) return;
    if (ts > 0) lastTsRef.current = ts;

    setPrediction(payload);
    
    // Track action history
    const primaryHand = payload.player_hands?.find((h) => h.recommendation);
    const recAction = normalizeAction(primaryHand?.recommendation?.action);
    if (recAction) {
      setActionHistory((prev) => {
        if (prev.length > 0 && prev[0].ts === ts) return prev;
        return [{ action: recAction, ts }, ...prev].slice(0, 10);
      });
    }

    if (!payload.ai_pending && payload.playable) {
      setBetsCounter((v) => v + 1);
    }
    setStatusText(payload.ai_pending ? "Getting prediction..." : "Prediction ready");
  }, []);

  const pollPredictionOnce = useCallback(
    async (token: string) => {
      try {
        const data = await blackjackPredict(token);
        if (data?.status === "success" && data.prediction) {
          handleNewPrediction(data.prediction);
        }
      } catch {
        return;
      }
    },
    [handleNewPrediction]
  );

  const connect = useCallback(async () => {
    const token = stakeToken.trim();
    if (!token || !canUse) return;

    setConnection("connecting");
    setStatusText("Connecting…");

    try {
      const ext = await checkExtension(token);
      if (!ext?.connected) {
        setConnection("disconnected");
        setStatusText("Connection failed");
        return;
      }

      setConnection("connected");
      setStatusText("Connected — waiting for hand…");

      if (!predictionPollRef.current) {
        predictionPollRef.current = window.setInterval(() => pollPredictionOnce(token), 1000);
      }

      if (username) {
        trackPredictionUsage({ username, email: user?.email, type: "blackjack" }).catch(() => {});
      }
    } catch {
      setConnection("disconnected");
      setStatusText("Connection failed");
    }
  }, [canUse, pollPredictionOnce, stakeToken, user?.email, username]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STAKE_TOKEN_STORAGE_KEY, stakeToken);
  }, [stakeToken]);

  useEffect(() => {
    if (!canUse) return;
    if (stakeToken.trim()) return;
    if (tokenPollRef.current) return;

    tokenPollRef.current = window.setInterval(async () => {
      try {
        const data = await getExtensionToken();
        if (data?.connected && data?.token) {
          setStakeToken(data.token);
        }
      } catch {
        return;
      }
    }, 2000);

    return () => {
      if (tokenPollRef.current) window.clearInterval(tokenPollRef.current);
      tokenPollRef.current = null;
    };
  }, [canUse, stakeToken]);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  const statusBadge = useMemo(() => {
    if (!canUse) return { label: "Access Required", active: false };
    if (connection === "connected") return { label: "Connected", active: true };
    if (connection === "connecting") return { label: "Connecting", active: true };
    return { label: "Disconnected", active: false };
  }, [canUse, connection]);

  const statusLightClass = useMemo(() => {
    if (connection === "connected") return "bg-accent shadow-[0_0_12px_var(--glow)]";
    if (connection === "connecting") return "bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]";
    return "bg-red-200/60";
  }, [connection]);

  // Derived state from prediction
  const hands = prediction?.player_hands || [];
  const primaryHand = hands.find((h) => h.recommendation);
  const primaryRec = primaryHand?.recommendation;
  const currentAction = normalizeAction(primaryRec?.action);
  const actionCfg = currentAction ? ACTION_CONFIG[currentAction] : null;

  return (
    <PredictorLayout
      title="Blackjack"
      subtitle="AI Strategy Advisor"
      statusBadge={statusBadge}
      loading={loginQuery.isLoading || loginQuery.isFetching}
      infoCards={[
        { label: "Status", value: statusText, icon: <Zap className="size-3" /> },
        { label: "Hands analyzed", value: betsCounter, icon: <RefreshCcw className="size-3" /> },
        { label: "Model", value: "Codex 5.3", icon: <Shield className="size-3" /> },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr] xl:grid-cols-[1fr_1.6fr]">
        {/* Connection card */}
        <div className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-4 shadow-elegant order-2 lg:order-1 flex flex-col">
          <h2 className="text-base font-semibold mb-3">Connection</h2>

          {!canUse && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              You need an active subscription and blackjack access enabled to use this predictor.
              <a href="/panel" className="ml-2 underline hover:text-amber-100">
                Go to panel
              </a>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Stake API Token</label>
              <input
                value={stakeToken}
                onChange={(e) => setStakeToken(e.target.value)}
                placeholder="Paste your Stake API token"
                autoComplete="off"
                spellCheck={false}
                disabled={!canUse || connection === "connecting"}
                className={cn(
                  "w-full h-11 rounded-xl px-4 text-sm",
                  "bg-background/40 border border-border outline-none",
                  "focus:border-white/20 focus:ring-2 focus:ring-accent/20",
                  (!canUse || connection === "connecting") && "opacity-60"
                )}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-background/20 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={cn("size-2.5 rounded-full", statusLightClass)} />
                <div className="text-sm font-semibold">
                  {connection === "connected"
                    ? "Connected"
                    : connection === "connecting"
                    ? "Connecting"
                    : "Not connected"}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{statusText}</div>
            </div>

            <button
              onClick={connection === "connected" ? disconnect : connect}
              disabled={!canUse || !stakeToken.trim() || connection === "connecting"}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all",
                connection === "connected"
                  ? "bg-red-500/10 border border-red-500/30 text-red-200 hover:border-red-500/50 active:scale-[0.98]"
                  : "bg-accent text-accent-foreground hover:shadow-[0_0_30px_var(--glow)] active:scale-[0.98]",
                (!canUse || !stakeToken.trim() || connection === "connecting") &&
                  "opacity-60 cursor-not-allowed"
              )}
            >
              {connection === "connected"
                ? "Disconnect"
                : connection === "connecting"
                ? "Connecting…"
                : "Connect"}
            </button>
          </div>

          {/* How it works */}
          <div className="mt-3 rounded-xl border border-border bg-background/20 p-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              How it works
            </p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                { step: "1", text: "Paste your Stake API token and click Connect." },
                { step: "2", text: "Start a Blackjack game on Stake." },
                { step: "3", text: "The AI reads your hand and dealer card automatically." },
                { step: "4", text: "Follow the action — Hit, Stand, Double, or Split." },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                    {step}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 rounded-xl border border-accent/20 bg-accent/5 p-3 flex items-start gap-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
              ℹ
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-accent font-semibold">Live Tracking:</span> The predictor automatically detects splits, soft totals, and dealer up-cards via the extension to provide real-time optimal strategy.
            </p>
          </div>

          {/* Recent history */}
          <div className="mt-3 rounded-xl border border-border bg-background/20 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Recent Actions
            </p>
            {actionHistory.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {actionHistory.map(({ action, ts }, i) => {
                  const cfg = action ? ACTION_CONFIG[action] : null;
                  if (!cfg) return null;
                  return (
                    <span
                      key={ts}
                      className={cn(
                        "rounded-lg border px-2 py-0.5 text-[10px] font-bold",
                        i === 0
                          ? cn(cfg.bg, cfg.border, cfg.color)
                          : "border-border text-muted-foreground bg-background/30"
                      )}
                    >
                      {cfg.label}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground/50 italic py-1">
                Waiting for first hand...
              </div>
            )}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
            <div className="rounded-xl border border-border bg-background/20 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                Hands Analyzed
              </p>
              <p className="text-lg font-bold text-accent">{betsCounter}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/20 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                Last Action
              </p>
              <p className="text-lg font-bold text-accent">
                {currentAction ? ACTION_CONFIG[currentAction].label : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Prediction display card */}
        <div className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-4 shadow-elegant order-1 lg:order-2 flex flex-col">
          <style>{`
            .bj-card-row {
              display: flex;
              flex-wrap: nowrap;
              align-items: flex-end;
              justify-content: center;
              width: 100%;
              min-height: clamp(88px, 22vw, 130px);
              padding: 0.25rem 0;
            }
            .bj-card-row--fan .bj-card {
              margin-left: clamp(-1.75rem, -7vw, -0.85rem);
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .bj-card-row--fan .bj-card:first-child {
              margin-left: 0;
            }
            .bj-card-row--fan .bj-card:hover {
              transform: translateY(-4px);
              z-index: 10;
            }
            .bj-card {
              width: clamp(48px, 14vw, 76px);
              height: clamp(70px, 20.5vw, 112px);
              border-radius: clamp(8px, 2vw, 12px);
              background: linear-gradient(180deg, #ffffff 0%, #e2e6ee 100%);
              color: #0f172a;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: clamp(0.85rem, 3.5vw, 1.2rem);
              line-height: 1.05;
              box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.95) inset;
              position: relative;
              flex-shrink: 0;
              z-index: 1;
            }
            .bj-card.bj-red { color: #b91c1c; }
            .bj-card.bj-card-up {
              z-index: 5;
              box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.95), 0 0 24px rgba(251, 191, 36, 0.35), 0 8px 20px rgba(0, 0, 0, 0.45);
              transform: translateY(-2px);
            }
            .bj-card-rank { font-size: clamp(0.95rem, 4vw, 1.35rem); }
            .bj-card-suit { font-size: clamp(1rem, 4.2vw, 1.45rem); margin-top: 2px; }
            
            .bj-card-back {
              background: #004ecc; /* Stake Blue */
              border: 1px solid rgba(255, 255, 255, 0.15);
            }
            .bj-back-pattern {
              width: 70%;
              height: 70%;
              border-radius: 4px;
              border: 1px solid rgba(255, 255, 255, 0.3);
              background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 4px,
                rgba(255, 255, 255, 0.15) 4px,
                rgba(255, 255, 255, 0.15) 8px
              );
            }

            @keyframes action-pop {
              0%   { opacity: 0; transform: scale(0.7) translateY(8px); }
              65%  { opacity: 1; transform: scale(1.05) translateY(-2px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .action-pop { animation: action-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
          `}</style>

          {/* Top Meta Bar */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-xs text-muted-foreground font-mono">
              {prediction?.bet_amount != null
                ? `Bet ${prediction.bet_amount} ${prediction.currency?.toUpperCase() || ""}`
                : "Waiting for extension…"}
            </div>
            {prediction?.strategy && (
              <div className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-[10px] font-medium text-accent">
                {prediction.strategy}
              </div>
            )}
          </div>

          {/* Visual Felt Area */}
          <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center py-6 px-4 relative">
            {prediction?.playable && prediction.dealer_cards ? (
              <>
                {/* Dealer Area */}
                <div className="w-full flex flex-col items-center mb-6">
                  <div className="bj-card-row bj-card-row--fan">
                    {prediction.dealer_cards.map((c, i) => (
                      <PlayingCard
                        key={i}
                        card={c}
                        upCard={i === prediction.dealer_up_index}
                      />
                    ))}
                    {prediction.dealer_cards.length === 1 && (
                      <PlayingCard hidden />
                    )}
                  </div>
                  {prediction.dealer_up_rank && (
                    <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground/60 bg-background/50 px-3 py-1 rounded-full border border-white/5">
                      Dealer shows {prediction.dealer_up_rank}
                    </div>
                  )}
                </div>

                {/* Felt Divider */}
                <div className="w-full max-w-[200px] border-t border-white/5 my-4 relative flex justify-center">
                  <span className="absolute -top-2.5 bg-surface/40 px-2 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                    Blackjack Pays 3 to 2
                  </span>
                </div>

                {/* Player Hands Area */}
                <div className="w-full flex flex-row flex-wrap justify-center gap-6 mt-6">
                  {hands.map((hand, i) => {
                    const hTotal = hand.computed_total ?? hand.recommendation?.player_total ?? hand.value;
                    const bust = (hTotal || 0) > 21;
                    const isSoft = hand.computed_soft || hand.recommendation?.player_soft;
                    const recAction = normalizeAction(hand.recommendation?.action);

                    return (
                      <div key={i} className="flex flex-col items-center">
                        <div className="bj-card-row bj-card-row--fan bj-card-row--player">
                          {hand.cards?.map((c, idx) => (
                            <PlayingCard key={idx} card={c} />
                          ))}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full text-white">
                            {hTotal}
                            {isSoft && !bust && <span className="ml-1 text-[10px] text-accent">Soft</span>}
                            {bust && <span className="ml-1 text-[10px] text-red-400">BUST</span>}
                          </div>
                          {recAction && ACTION_CONFIG[recAction] && (
                            <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase", ACTION_CONFIG[recAction].bg, ACTION_CONFIG[recAction].color)}>
                              {ACTION_CONFIG[recAction].label}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center opacity-50">
                <div className="text-5xl font-bold mb-3">?</div>
                <p className="text-sm">
                  {connection === "connected"
                    ? prediction?.ai_pending
                      ? "Getting prediction from AI using live cards..."
                      : "Waiting for a Blackjack hand to begin..."
                    : "Connect to start receiving AI recommendations."}
                </p>
              </div>
            )}
          </div>

          {/* Action Pop (Primary Recommendation) */}
          {actionCfg && (
            <div className="mt-4 flex flex-col items-center justify-center">
              <div
                key={betsCounter}
                className={cn(
                  "action-pop w-full max-w-[320px] rounded-2xl border p-4 text-center shadow-lg",
                  actionCfg.bg,
                  actionCfg.border
                )}
              >
                <div className="text-2xl font-bold tracking-tight mb-1">
                  <span className={actionCfg.color}>{actionCfg.label}</span>
                </div>
                <p className="text-xs text-muted-foreground/80">{primaryRec?.reason || actionCfg.desc}</p>
              </div>
            </div>
          )}

          <div className="mt-auto pt-4">
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
                ⚡
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The AI uses <span className="text-accent font-semibold">basic strategy</span> combined with
                real-time hand analysis. Always follow the recommendation for best expected value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PredictorLayout>
  );
}
