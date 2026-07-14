import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Brain, RefreshCcw, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  crashPredict,
  getExtensionToken,
  getPrediction,
  getStoredSession,
  stakeGameData,
  trackPredictionUsage,
  userLogin,
  type CrashPredictResult,
  type SoulSession,
  type SoulUser,
} from "@/lib/soulpredictor";
import PredictorLayout from "./PredictorLayout";

const STAKE_TOKEN_STORAGE_KEY = "soulai_stake_api_token";

type ConnectionState = "disconnected" | "connecting" | "connected";

type CrashPredictionFromExtension = {
  game_type?: "crash";
  predictions?: CrashPredictResult["predictions"];
  historical_data?: CrashPredictResult["historical_data"];
};

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export default function CrashPredictor() {
  const [session] = useState<SoulSession>(() => getStoredSession());
  const [stakeToken, setStakeToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(STAKE_TOKEN_STORAGE_KEY) ?? "";
  });

  const [connection, setConnection] = useState<ConnectionState>("disconnected");
  const [statusText, setStatusText] = useState("Not connected");
  const [connectedUsername, setConnectedUsername] = useState<string>("");

  const [safePrediction, setSafePrediction] = useState<number | null>(null);
  const [mediumPrediction, setMediumPrediction] = useState<number | null>(null);
  const [crashPoints, setCrashPoints] = useState<number[]>([]);
  const [displayPrediction, setDisplayPrediction] = useState(0);

  const [isAutoFetchActive, setIsAutoFetchActive] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const autoFetchRef = useRef<number | null>(null);
  const tokenPollRef = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);

  const lastLatestCrashPointRef = useRef<number | null>(null);
  const lastCrashPointsCountRef = useRef<number | null>(null);
  const lastPredictionValueRef = useRef<number | null>(null);

  const loginQuery = useQuery({
    queryKey: ["soulpredictor-user-login", session.email, session.userToken],
    queryFn: () => userLogin(session),
    enabled: !!session.email || !!session.userToken,
    retry: false,
    staleTime: 30_000,
  });

  const user = (loginQuery.data?.user ?? undefined) as SoulUser | undefined;
  const planActive = user?.plan_active === true || user?.plan_active === "true";
  const accessEnabled = (user as any)?.crash_access_enabled === true;
  const canUse = planActive && accessEnabled;

  const username = useMemo(() => user?.username || user?.email || session.email || "", [session.email, user?.email, user?.username]);

  const clearTimers = useCallback(() => {
    if (autoFetchRef.current) window.clearInterval(autoFetchRef.current);
    if (tokenPollRef.current) window.clearInterval(tokenPollRef.current);
    if (animRef.current) window.clearTimeout(animRef.current);
    autoFetchRef.current = null;
    tokenPollRef.current = null;
    animRef.current = null;
  }, []);

  const stopAutoFetch = useCallback(() => {
    if (autoFetchRef.current) window.clearInterval(autoFetchRef.current);
    autoFetchRef.current = null;
    setIsAutoFetchActive(false);
  }, []);

  const animateTo = useCallback((target: number) => {
    if (animRef.current) window.clearTimeout(animRef.current);
    const start = performance.now();
    const durationMs = 900;
    const from = 0;
    const to = clamp(target, 0, 1000);

    const tick = () => {
      const t = clamp((performance.now() - start) / durationMs, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (to - from) * eased;
      setDisplayPrediction(Number(v.toFixed(2)));
      if (t < 1) {
        animRef.current = window.setTimeout(tick, 16);
      }
    };

    tick();
  }, []);

  const handleCrashPredictionResponse = useCallback(
    async (data: CrashPredictResult, forceUpdate: boolean) => {
      if (data?.status !== "success" || !data?.predictions) return;
      const points = data.historical_data?.crash_points ?? [];
      const latest = typeof points[0] === "number" ? points[0] : null;
      const count = points.length;
      const changed = latest !== lastLatestCrashPointRef.current || count !== lastCrashPointsCountRef.current;

      lastLatestCrashPointRef.current = latest;
      lastCrashPointsCountRef.current = count;

      const newSafe = data.predictions.safe_prediction;
      const newMedium = data.predictions.medium_prediction;
      if (typeof newSafe !== "number" || typeof newMedium !== "number") return;

      if (!forceUpdate && !changed && lastPredictionValueRef.current !== null) return;

      lastPredictionValueRef.current = newSafe;
      setSafePrediction(newSafe);
      setMediumPrediction(newMedium);
      setCrashPoints(points.slice(0, 20));
      animateTo(newSafe);
      setStatusText("Prediction updated");

      if (username) {
        trackPredictionUsage({ username, email: user?.email, type: "crash" }).catch(() => {});
      }
    },
    [animateTo, user?.email, username]
  );

  const generateCrashPrediction = useCallback(
    async (forceUpdate: boolean) => {
      const token = stakeToken.trim();
      if (!token || connection !== "connected") return;

      try {
        const cached = await getPrediction(token);
        if (cached?.status === "success") {
          const p = (cached.prediction ?? undefined) as CrashPredictionFromExtension | undefined;
          if (p?.game_type === "crash" && p?.predictions) {
            await handleCrashPredictionResponse(
              {
                status: "success",
                predictions: p.predictions,
                historical_data: p.historical_data,
              },
              forceUpdate
            );
            return;
          }
        }
      } catch {
        return;
      }

      try {
        const direct = await crashPredict(token);
        await handleCrashPredictionResponse(direct, forceUpdate);
      } catch {
        setStatusText("Prediction failed");
      }
    },
    [connection, crashPredict, getPrediction, handleCrashPredictionResponse, stakeToken]
  );

  const connect = useCallback(async () => {
    const token = stakeToken.trim();
    if (!token || !canUse) return;

    setConnection("connecting");
    setStatusText("Connecting…");

    try {
      const data = await stakeGameData(token);
      const userData = data?.game_data?.user ?? undefined;
      const extractedUsername = (userData?.name || userData?.username || "") as string;
      setConnectedUsername(extractedUsername);
      setConnection("connected");
      setStatusText("Connected");

      if (username) {
        trackPredictionUsage({ username, email: user?.email, type: "crash" }).catch(() => {});
      }

      setIsAutoFetchActive(true);
    } catch {
      setConnection("disconnected");
      setStatusText("Connection failed");
    }
  }, [canUse, stakeToken, user?.email, username]);

  const disconnect = useCallback(() => {
    stopAutoFetch();
    clearTimers();
    setConnection("disconnected");
    setStatusText("Not connected");
    setConnectedUsername("");
    setSafePrediction(null);
    setMediumPrediction(null);
    setCrashPoints([]);
    setDisplayPrediction(0);
    setIsFetching(false);

    lastLatestCrashPointRef.current = null;
    lastCrashPointsCountRef.current = null;
    lastPredictionValueRef.current = null;
  }, [clearTimers, stopAutoFetch]);

  const toggleAutoFetch = useCallback(() => {
    if (connection !== "connected") return;
    if (isAutoFetchActive) {
      stopAutoFetch();
      return;
    }
    setIsAutoFetchActive(true);
  }, [connection, isAutoFetchActive, stopAutoFetch]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STAKE_TOKEN_STORAGE_KEY, stakeToken);
  }, [stakeToken]);

  useEffect(() => {
    if (connection !== "connected") return;
    if (!isAutoFetchActive) return;

    if (autoFetchRef.current) window.clearInterval(autoFetchRef.current);
    generateCrashPrediction(false).catch(() => {});
    autoFetchRef.current = window.setInterval(() => {
      generateCrashPrediction(false).catch(() => {});
    }, 3000);

    return () => {
      if (autoFetchRef.current) window.clearInterval(autoFetchRef.current);
      autoFetchRef.current = null;
    };
  }, [connection, generateCrashPrediction, isAutoFetchActive]);

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
    if (!isAutoFetchActive) stopAutoFetch();
  }, [isAutoFetchActive, stopAutoFetch]);

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
      title="Crash"
      subtitle="Automated Prediction"
      statusBadge={statusBadge}
      loading={loginQuery.isLoading || loginQuery.isFetching}
      infoCards={[
        { label: "Status", value: statusText, icon: <Zap className="size-3" /> },
        { label: "Safe", value: safePrediction !== null ? `${safePrediction.toFixed(2)}x` : "—", icon: <Shield className="size-3" /> },
        { label: "Medium", value: mediumPrediction !== null ? `${mediumPrediction.toFixed(2)}x` : "—", icon: <Shield className="size-3" /> },
        { label: "Auto", value: isAutoFetchActive ? "On" : "Off", icon: <RefreshCcw className="size-3" /> },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-4 shadow-elegant order-2 lg:order-1">
          <h2 className="text-base font-semibold mb-3">Connection</h2>

          {!canUse && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              You need an active subscription and crash access enabled to use this predictor.
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
                <div className="text-sm font-semibold">{connection === "connected" ? "Connected" : connection === "connecting" ? "Connecting" : "Not connected"}</div>
              </div>
              <div className="text-xs text-muted-foreground">{connectedUsername ? `@${connectedUsername}` : ""}</div>
            </div>

            <button
              onClick={connection === "connected" ? disconnect : connect}
              disabled={!canUse || !stakeToken.trim() || connection === "connecting"}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all",
                connection === "connected"
                  ? "bg-red-500/10 border border-red-500/30 text-red-200 hover:border-red-500/50 active:scale-[0.98]"
                  : "bg-accent text-accent-foreground hover:shadow-[0_0_30px_var(--glow)] active:scale-[0.98]",
                (!canUse || !stakeToken.trim() || connection === "connecting") && "opacity-60 cursor-not-allowed"
              )}
            >
              {connection === "connected" ? "Disconnect" : connection === "connecting" ? "Connecting…" : "Connect"}
            </button>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={toggleAutoFetch}
                disabled={connection !== "connected"}
                className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold border border-border bg-surface/50 hover:border-white/20 transition-all active:scale-[0.98]",
                  connection !== "connected" && "opacity-60 cursor-not-allowed",
                  isAutoFetchActive && "border-accent/30 bg-accent/10 text-accent"
                )}
              >
                {isAutoFetchActive ? "Stop Auto" : "Auto Fetch"}
              </button>

              <button
                onClick={async () => {
                  if (connection !== "connected") return;
                  setIsFetching(true);
                  lastPredictionValueRef.current = null;
                  await generateCrashPrediction(true);
                  setIsFetching(false);
                }}
                disabled={connection !== "connected" || isFetching}
                className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold border border-border bg-surface/50 hover:border-white/20 transition-all active:scale-[0.98]",
                  (connection !== "connected" || isFetching) && "opacity-60 cursor-not-allowed"
                )}
              >
                {isFetching ? (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCcw className="size-4 animate-spin" />
                    Predicting…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Brain className="size-4" />
                    Predict Now
                  </span>
                )}
              </button>
            </div>

            <div className="rounded-xl border border-border bg-background/20 p-4 text-sm text-muted-foreground">
              Uses extension cache when available, otherwise falls back to direct crash prediction. Auto fetch updates every 3 seconds.
            </div>
          </div>

          {/* How it works */}
          <div className="mt-3 rounded-xl border border-border bg-background/20 p-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">How it works</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                { step: "1", text: "Paste your Stake API token and click Connect." },
                { step: "2", text: "Enable Auto Fetch — predictions refresh every 3 s." },
                { step: "3", text: "Use Safe Play for low-risk, Medium Play for higher reward." },
                { step: "4", text: "Cash out before the multiplier reaches the prediction." },
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

          {/* Live prediction strip */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border bg-background/20 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Safe</p>
              <p className="text-base font-bold text-accent">
                {safePrediction !== null ? `${safePrediction.toFixed(2)}x` : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background/20 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Medium</p>
              <p className="text-base font-bold text-accent">
                {mediumPrediction !== null ? `${mediumPrediction.toFixed(2)}x` : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background/20 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Auto</p>
              <p className={cn("text-base font-bold", isAutoFetchActive ? "text-accent" : "text-muted-foreground")}>
                {isAutoFetchActive ? "On" : "Off"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-4 shadow-elegant order-1 lg:order-2 flex flex-col h-full">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-background/30 p-4 flex flex-col flex-1">
            {/* Ambient gradient */}
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(216,255,69,0.10), transparent 60%), radial-gradient(circle at 80% 80%, rgba(120,120,255,0.12), transparent 50%)",
              }}
            />

            <div className="relative flex flex-col flex-1">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 shrink-0">
                <div className="text-sm font-semibold">Prediction</div>
                <div className="text-xs text-muted-foreground">Latest 20 rounds</div>
              </div>

              {/* ── Hero prediction number ── */}
              <div className="mt-3 shrink-0 relative flex flex-col items-center justify-center rounded-2xl border border-accent/20 bg-background/40 px-4 py-6 overflow-hidden">
                {/* Subtle glow ring behind number */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="size-40 rounded-full bg-[radial-gradient(circle,rgba(216,255,69,0.18),transparent_70%)] blur-2xl" />
                </div>
                <div className="relative text-center">
                  <div className="text-[4rem] md:text-[5rem] font-bold font-mono leading-none text-accent drop-shadow-[0_0_24px_rgba(216,255,69,0.50)]">
                    {displayPrediction.toFixed(2)}x
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-semibold text-accent uppercase tracking-wider">
                      ⚡ Safe suggestion
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Safe / Medium Play cards ── */}
              <div className="mt-3 shrink-0 grid gap-2 grid-cols-2">
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-green-400/70 mb-1">Safe Play</div>
                  <div className="text-xs text-muted-foreground mb-1">1.00x – 1.60x</div>
                  <div className="text-xl font-bold text-green-300">
                    {safePrediction !== null ? `${safePrediction.toFixed(2)}x` : "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-amber-400/70 mb-1">Medium Play</div>
                  <div className="text-xs text-muted-foreground mb-1">1.60x – 2.10x</div>
                  <div className="text-xl font-bold text-amber-300">
                    {mediumPrediction !== null ? `${mediumPrediction.toFixed(2)}x` : "—"}
                  </div>
                </div>
              </div>

              {/* ── Round History (compact) ── */}
              <div className="mt-3 shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Round History</p>
                <div className="rounded-xl border border-border bg-background/20 p-2.5 flex flex-wrap gap-1.5 max-h-[72px] overflow-y-auto">
                  {crashPoints.length === 0 ? (
                    <div className="w-full flex items-center justify-center py-1 text-xs text-muted-foreground">
                      {connection !== "connected" ? "Connect to see history" : "Waiting for round data…"}
                    </div>
                  ) : (
                    crashPoints.map((p, idx) => {
                      const v = Number(p);
                      const tier = v >= 2.0 ? "high" : v >= 1.5 ? "medium" : "low";
                      return (
                        <span
                          key={`${idx}-${v}`}
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[11px] font-semibold border",
                            tier === "high" && "bg-green-500/10 border-green-500/30 text-green-300",
                            tier === "medium" && "bg-amber-500/10 border-amber-500/30 text-amber-200",
                            tier === "low" && "bg-red-500/10 border-red-500/30 text-red-200"
                          )}
                        >
                          {v.toFixed(2)}x
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ── AI Strategy Notes (fills bottom space) ── */}
              <div className="mt-3 flex-1 flex flex-col min-h-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 shrink-0">AI Strategy Notes</p>
                <div className="flex-1 rounded-xl border border-border bg-background/20 p-3 flex flex-col gap-2.5 overflow-y-auto">

                  {/* Cashout tip */}
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">1</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="text-foreground font-medium">Cash out early.</span>{" "}
                      Always cash out <span className="text-accent font-semibold">before</span> the multiplier reaches the Safe Play prediction to guarantee profit.
                    </p>
                  </div>

                  {/* Safe zone note */}
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-[10px] font-bold text-green-400">2</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="text-foreground font-medium">Safe zone:</span>{" "}
                      Predictions between <span className="text-green-300 font-semibold">1.00x–1.60x</span> are lower risk. Use Safe Play when the last 3 rounds crashed below 1.5x.
                    </p>
                  </div>

                  {/* Medium play note */}
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-400">3</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="text-foreground font-medium">Medium play:</span>{" "}
                      Higher reward but higher risk. Only use <span className="text-amber-300 font-semibold">Medium Play</span> after 2+ consecutive high multiplier rounds.
                    </p>
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-auto pt-2 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                      ⚠ AI predictions are probability-based and not guaranteed. Always gamble responsibly and within your limits.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PredictorLayout>
  );
}
