import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCcw, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  checkExtension,
  getExtensionToken,
  getPrediction,
  getStoredSession,
  trackPredictionUsage,
  userLogin,
  type SoulSession,
  type SoulUser,
} from "@/lib/soulpredictor";
import PredictorLayout from "./PredictorLayout";

const STAKE_TOKEN_STORAGE_KEY = "soulai_stake_api_token";
const TOTAL_HOLES = 7;

type ConnectionState = "disconnected" | "connecting" | "connected";

/* Matches the shape the API actually sends for game_type: "moles" */
type MolesPredictionPayload = {
  game_type?: string;
  bet_id?: string | number | null;
  is_active?: boolean;
  predicted_hole?: number; // 0-indexed
  confidence?: number;     // already a %, e.g. 50 = 50%
  timestamp?: number;
  bet_amount?: number | string | null;
  currency?: string;
  current_round?: number | string | null;
  strategy?: string;
  last_result?: { hit?: boolean; pick?: number } | null;
  round_count?: number;
  probabilities?: Array<{ hole: number; probability: number }>;
};

export default function MolesPredictor() {
  const [session] = useState<SoulSession>(() => getStoredSession());
  const [stakeToken, setStakeToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(STAKE_TOKEN_STORAGE_KEY) ?? "";
  });

  const [connection, setConnection] = useState<ConnectionState>("disconnected");
  const [statusText, setStatusText] = useState("Not connected");
  const [betsCounter, setBetsCounter] = useState(0);

  // Prediction state
  const [predictedHole, setPredictedHole] = useState<number | null>(null); // 0-indexed
  const [confidence, setConfidence] = useState<number | null>(null);       // already %
  const [probabilities, setProbabilities] = useState<Array<{ hole: number; probability: number }>>([]);
  const [roundInfo, setRoundInfo] = useState<string>("");
  const [detailLine, setDetailLine] = useState<string>("");
  const [strategyChip, setStrategyChip] = useState<string>("Adaptive history model");

  // Timestamp-based dedup (matches original code)
  const lastPredictionTsRef = useRef(0);
  const predictionPollRef = useRef<number | null>(null);
  const tokenPollRef = useRef<number | null>(null);

  const loginQuery = useQuery({
    queryKey: ["soulpredictor-user-login", session.email, session.userToken],
    queryFn: () => userLogin(session),
    enabled: !!session.email || !!session.userToken,
    retry: false,
    staleTime: 30_000,
  });

  const user = (loginQuery.data?.user ?? undefined) as SoulUser | undefined;
  const planActive = user?.plan_active === true || user?.plan_active === "true";
  const accessEnabled = (user as any)?.moles_access_enabled === true;
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

  const clearPredictionUI = useCallback(() => {
    lastPredictionTsRef.current = 0;
    setPredictedHole(null);
    setConfidence(null);
    setProbabilities([]);
    setRoundInfo("");
    setDetailLine("");
    setStrategyChip("Adaptive history model");
  }, []);

  const disconnect = useCallback(() => {
    clearTimers();
    setConnection("disconnected");
    setStatusText("Not connected");
    clearPredictionUI();
  }, [clearTimers, clearPredictionUI]);

  /* Mirrors window.applyMolesPrediction from the original code exactly */
  const applyMolesPrediction = useCallback((pred: MolesPredictionPayload) => {
    if (!pred || pred.game_type !== "moles") return;

    // If not active or no bet_id → clear UI (unless we want it to persist when user clicks a hole)
    // Actually, sometimes clicking a hole briefly sets is_active false. We'll be less strict on clearing UI.
    if (pred.is_active === false && !pred.bet_id) {
      clearPredictionUI();
      return;
    }

    // Timestamp-based dedup: ignore out-of-order payloads
    const ts = Number(pred.timestamp || 0);
    if (ts > 0 && lastPredictionTsRef.current > 0 && ts < lastPredictionTsRef.current) return;
    if (ts > 0) lastPredictionTsRef.current = ts;

    // Set predicted hole (0-indexed)
    const hole = typeof pred.predicted_hole === "number" ? pred.predicted_hole : null;
    setPredictedHole(Number.isInteger(hole) ? hole : null);

    // Confidence (already a %, e.g. 50)
    const conf = Number(pred.confidence || 0);
    setConfidence(conf);

    // Detail line: "Confidence 50% | Source rounds 0 | Last result Pending"
    const rounds = Number(pred.round_count || 0);
    const lastResultObj = pred.last_result ?? null;
    let lastResultText = "Pending";
    if (lastResultObj && typeof lastResultObj === "object" && typeof lastResultObj.hit === "boolean") {
      const label = lastResultObj.hit ? "Win" : "Lose";
      const pick = Number(lastResultObj.pick);
      const pickText =
        Number.isInteger(pick) && pick >= 0 && pick <= 6 ? ` (Pick H${pick + 1})` : "";
      lastResultText = `${label}${pickText}`;
    }
    setDetailLine(`Confidence ${conf}% | Source rounds ${rounds} | Last result ${lastResultText}`);

    // Bet / round info line
    const amount = pred.bet_amount;
    const c = (pred.currency || "").toUpperCase();
    const round = pred.current_round;
    const betTxt =
      amount !== null && amount !== undefined ? `${amount} ${c}`.trim() : "Bet --";
    setRoundInfo(
      `${betTxt} | Round ${round !== null && round !== undefined ? round : "--"}`
    );

    // Strategy chip
    if (pred.strategy) setStrategyChip(String(pred.strategy));

    // Probabilities chips (top 4)
    const list = Array.isArray(pred.probabilities) ? pred.probabilities.slice(0, 4) : [];
    setProbabilities(list);

    setBetsCounter((v) => v + 1);
    setStatusText("Prediction received");
  }, [clearPredictionUI]);

  /* Poll exactly like the original: POST /get_prediction */
  const pollPredictionOnce = useCallback(
    async (token: string) => {
      try {
        const data = await getPrediction(token);

        if (data?.status === "success" && data.prediction) {
          const pred = data.prediction as MolesPredictionPayload;
          if (pred.game_type === "moles") {
            applyMolesPrediction(pred);
          }
        }
        // When status === "waiting" → keep current prediction displayed (don't clear)
      } catch {
        return;
      }
    },
    [applyMolesPrediction]
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
      setStatusText("Connected — waiting for bet…");

      if (!predictionPollRef.current) {
        predictionPollRef.current = window.setInterval(() => pollPredictionOnce(token), 1000);
      }

      if (username) {
        trackPredictionUsage({ username, email: user?.email, type: "moles" }).catch(() => {});
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
        if (data?.connected && data?.token) setStakeToken(data.token);
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

  return (
    <PredictorLayout
      title="Moles"
      subtitle="Automated Prediction"
      statusBadge={statusBadge}
      loading={loginQuery.isLoading || loginQuery.isFetching}
      infoCards={[
        { label: "Status", value: statusText, icon: <Zap className="size-3" /> },
        { label: "Bets scanned", value: betsCounter, icon: <RefreshCcw className="size-3" /> },
        {
          label: "Optimal Hole",
          value: predictedHole !== null ? `Hole ${predictedHole + 1}` : "—",
          icon: <Shield className="size-3" />,
        },
        { label: "Model", value: "Codex 5.3", icon: <Shield className="size-3" /> },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr] xl:grid-cols-[1fr_1.6fr]">
        {/* ── Connection card ── */}
        <div className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-4 shadow-elegant order-2 lg:order-1 flex flex-col">
          <h2 className="text-base font-semibold mb-3">Connection</h2>

          {!canUse && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              You need an active subscription and moles access enabled to use this predictor.
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

            <div className="rounded-xl border border-border bg-background/20 p-4 text-sm text-muted-foreground">
              Extension-only predictor. Place a bet on Stake Moles and the AI highlights the
              optimal hole automatically.
            </div>
          </div>

          {/* How it works */}
          <div className="mt-3 rounded-xl border border-border bg-background/20 p-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              How it works
            </p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                { step: "1", text: "Paste your Stake API token and click Connect." },
                { step: "2", text: "Place a bet on Stake Moles as usual." },
                { step: "3", text: "The optimal hole is highlighted in yellow automatically." },
                { step: "4", text: "Click the glowing hole for the highest safe probability." },
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

          {/* Stats */}
          <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
            <div className="rounded-xl border border-border bg-background/20 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                Bets Scanned
              </p>
              <p className="text-lg font-bold text-accent">{betsCounter}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/20 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                Optimal Hole
              </p>
              <p className="text-lg font-bold text-accent">
                {predictedHole !== null ? `#${predictedHole + 1}` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Hole grid + prediction card ── */}
        <div className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-4 shadow-elegant order-1 lg:order-2">
          {/* Meta bar */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="text-xs text-muted-foreground font-mono">{roundInfo || "Waiting for extension…"}</div>
            <div className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-[10px] font-medium text-accent">
              {strategyChip}
            </div>
          </div>

          {/* 2-3-2 absolute hole board — fixed px positions for consistent spacing */}
          {/* Container height = 3 rows of 100px holes + 2 gaps of 20px = 340px */}
          <div className="relative w-full my-4 mx-auto" style={{ height: "340px", maxWidth: "540px" }}>
            {[0, 1, 2, 3, 4, 5, 6].map((holeIdx) => {
              const isOptimal = predictedHole === holeIdx;
              const holeNum = holeIdx + 1;

              // Fixed pixel positions: hole size 100px, horizontal gap 80px between holes
              // Row y-centers: 50px, 170px, 290px (vertical gap 120px between rows)
              // Row 1: holes 0,1 — centered in 540px → x centers at 180, 360
              // Row 2: holes 2,3,4 — x centers at 90, 270, 450
              // Row 3: holes 5,6 — same as row 1 → x centers at 180, 360
              const holeSize = 100;
              const positions = [
                { top: 0,    left: 130  }, // hole 0
                { top: 0,    left: 310  }, // hole 1
                { top: 120,  left: 40   }, // hole 2
                { top: 120,  left: 220  }, // hole 3
                { top: 120,  left: 400  }, // hole 4
                { top: 240,  left: 130  }, // hole 5
                { top: 240,  left: 310  }, // hole 6
              ];
              const pos = positions[holeIdx];

              return (
                <div
                  key={holeIdx}
                  className={cn(
                    "absolute rounded-full flex items-center justify-center font-extrabold select-none cursor-default transition-all duration-300",
                    isOptimal ? "is-predicted" : ""
                  )}
                  style={{
                    top: pos.top,
                    left: pos.left,
                    width: holeSize,
                    height: holeSize,
                    border: isOptimal ? "12px solid rgba(250, 204, 21, 0.92)" : "12px solid rgba(102, 136, 168, 0.33)",
                    background: isOptimal
                      ? "radial-gradient(circle, rgba(48, 71, 98, 0.55) 0%, rgba(24, 38, 58, 0.44) 72%)"
                      : "radial-gradient(circle, rgba(32, 58, 80, 0.34) 0%, rgba(24, 44, 65, 0.22) 72%)",
                    boxShadow: isOptimal
                      ? "inset 0 0 0 10px rgba(46, 66, 96, 0.84), 0 0 0 2px rgba(250, 204, 21, 0.28), 0 0 34px rgba(250, 204, 21, 0.4)"
                      : "inset 0 0 0 10px rgba(28, 50, 72, 0.7)",
                    color: isOptimal ? "#fde68a" : "#eff6ff",
                    textShadow: "0 1px 6px rgba(0, 0, 0, 0.45)",
                    fontSize: "1.1rem",
                  }}
                >
                  <span className="relative z-10">{holeNum}</span>
                </div>
              );
            })}
          </div>

          {/* Primary advice banner */}
          <div className="mt-4 rounded-xl border border-border bg-background/30 p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
                  Optimal hole
                </p>
                <p className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {predictedHole !== null ? (
                    <span className="text-amber-300">HOLE {predictedHole + 1}</span>
                  ) : (
                    <span className="text-muted-foreground/40">-</span>
                  )}
                </p>
              </div>
              {confidence !== null && confidence > 0 && (
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">
                    Confidence{" "}
                    <span className="text-amber-300 font-semibold">{confidence}%</span>
                  </span>
                  <div className="mt-1 w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${Math.min(confidence, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {detailLine && (
              <p className="mt-2 text-xs text-muted-foreground">{detailLine}</p>
            )}
          </div>

          {/* Probability chips */}
          {probabilities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {probabilities.map((item) => (
                <span
                  key={item.hole}
                  className="rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-bold text-accent"
                >
                  H{item.hole + 1} {Math.round(item.probability * 100)}%
                </span>
              ))}
            </div>
          )}

          {/* Important note moved to bottom right */}
          <div className="mt-auto pt-4">
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
                ⚡
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Moles prediction uses latest resolved rounds and transition learning from API snapshots. It adapts to fresh table state and highlights the highest-probability hole.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PredictorLayout>
  );
}
