import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCcw, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  checkExtension,
  getExtensionToken,
  getPrediction,
  getStoredSession,
  stakeGameData,
  trackPredictionUsage,
  userLogin,
  type SoulSession,
  type SoulUser,
} from "@/lib/soulpredictor";
import PredictorLayout from "./PredictorLayout";

const GRID_SIZE = 25;
const STAKE_TOKEN_STORAGE_KEY = "soulai_stake_api_token";

type ConnectionState = "disconnected" | "connecting" | "connected";

type MinesPrediction = {
  game_type?: "mines";
  bet_id?: string | number | null;
  gems?: number[];
  bombs?: number[];
  mines_count?: number;
  is_fake_bet?: boolean;
};

function asNumberArray(v: unknown): number[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => Number(x)).filter((x) => Number.isFinite(x));
}

export default function MinesPredictor() {
  const [session] = useState<SoulSession>(() => getStoredSession());
  const [stakeToken, setStakeToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(STAKE_TOKEN_STORAGE_KEY) ?? "";
  });

  const [connection, setConnection] = useState<ConnectionState>("disconnected");
  const [statusText, setStatusText] = useState("Not connected");
  const [minesCount, setMinesCount] = useState<number | null>(null);
  const [betsCounter, setBetsCounter] = useState(0);
  const [revealedGems, setRevealedGems] = useState<Set<number>>(() => new Set());

  const lastPredictionBetIdRef = useRef<string | number | null>(null);
  const gamePollRef = useRef<number | null>(null);
  const predictionPollRef = useRef<number | null>(null);
  const analyzingTimeoutRef = useRef<number | null>(null);
  const revealIntervalRef = useRef<number | null>(null);
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
  const accessEnabled = (user as any)?.mines_access_enabled === true;
  const canUse = planActive && accessEnabled;
  const username = useMemo(() => user?.username || user?.email || session.email || "", [session.email, user?.email, user?.username]);

  const clearTimers = useCallback(() => {
    if (gamePollRef.current) window.clearInterval(gamePollRef.current);
    if (predictionPollRef.current) window.clearInterval(predictionPollRef.current);
    if (analyzingTimeoutRef.current) window.clearTimeout(analyzingTimeoutRef.current);
    if (revealIntervalRef.current) window.clearInterval(revealIntervalRef.current);
    if (tokenPollRef.current) window.clearInterval(tokenPollRef.current);

    gamePollRef.current = null;
    predictionPollRef.current = null;
    analyzingTimeoutRef.current = null;
    revealIntervalRef.current = null;
    tokenPollRef.current = null;
  }, []);

  const disconnect = useCallback(() => {
    clearTimers();
    setConnection("disconnected");
    setStatusText("Not connected");
    setMinesCount(null);
    setRevealedGems(new Set());
    lastPredictionBetIdRef.current = null;
  }, [clearTimers]);

  const pollGameDataOnce = useCallback(
    async (token: string) => {
      try {
        const data = await stakeGameData(token);
        const gameData = data?.game_data;
        const mines = typeof gameData?.mines === "number" ? gameData.mines : null;
        if (mines !== null) setMinesCount(mines);

        if (gameData?.is_active && gameData?.id) {
          setStatusText("Prediction ready");
        } else {
          setStatusText("Connected");
        }
      } catch {
        setStatusText("Connected");
      }
    },
    []
  );

  const handleNewPrediction = useCallback(
    async (prediction: MinesPrediction) => {
      const betId = prediction.bet_id ?? null;
      if (!betId) return;
      if (lastPredictionBetIdRef.current === betId) return;
      lastPredictionBetIdRef.current = betId;

      const gems = asNumberArray(prediction.gems).filter((n) => n >= 0 && n < GRID_SIZE);
      const predictedMinesCount = typeof prediction.mines_count === "number" ? prediction.mines_count : null;
      if (predictedMinesCount !== null) setMinesCount(predictedMinesCount);

      if (revealIntervalRef.current) window.clearInterval(revealIntervalRef.current);
      if (analyzingTimeoutRef.current) window.clearTimeout(analyzingTimeoutRef.current);

      setStatusText("Bet detected - Analyzing…");
      setRevealedGems(new Set());

      analyzingTimeoutRef.current = window.setTimeout(() => {
        setStatusText("Prediction received");
        setBetsCounter((v) => v + 1);

        let i = 0;
        revealIntervalRef.current = window.setInterval(() => {
          const next = gems[i];
          i += 1;
          if (typeof next === "number") {
            setRevealedGems((prev) => {
              const n = new Set(prev);
              n.add(next);
              return n;
            });
          }
          if (i >= gems.length && revealIntervalRef.current) {
            window.clearInterval(revealIntervalRef.current);
            revealIntervalRef.current = null;
          }
        }, 45);
      }, 1500);
    },
    []
  );

  const pollPredictionOnce = useCallback(
    async (token: string) => {
      try {
        const data = await getPrediction(token);
        if (data?.status !== "success") return;
        const prediction = (data.prediction ?? undefined) as MinesPrediction | undefined;
        if (!prediction || prediction.game_type !== "mines") return;
        await handleNewPrediction(prediction);
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
      setStatusText("Connected");

      await pollGameDataOnce(token);

      if (!gamePollRef.current) {
        gamePollRef.current = window.setInterval(() => pollGameDataOnce(token), 1000);
      }
      if (!predictionPollRef.current) {
        predictionPollRef.current = window.setInterval(() => pollPredictionOnce(token), 1000);
      }

      if (username) {
        trackPredictionUsage({ username, email: user?.email, type: "mines" }).catch(() => {});
      }
    } catch {
      setConnection("disconnected");
      setStatusText("Connection failed");
    }
  }, [canUse, pollGameDataOnce, pollPredictionOnce, stakeToken, user?.email, username]);

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

  return (
    <PredictorLayout
      title="Mines"
      subtitle="Automated Prediction"
      statusBadge={statusBadge}
      loading={loginQuery.isLoading || loginQuery.isFetching}
      infoCards={[
        { label: "Status", value: statusText, icon: <Zap className="size-3" /> },
        { label: "Bets scanned", value: betsCounter, icon: <RefreshCcw className="size-3" /> },
        { label: "Mines", value: minesCount ?? "—", icon: <Shield className="size-3" /> },
        { label: "Model", value: "Codex 5.3", icon: <Shield className="size-3" /> },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-4 shadow-elegant order-2 lg:order-1">
          <h2 className="text-base font-semibold mb-3">Connection</h2>

          {!canUse && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              You need an active subscription and mines access enabled to use this predictor.
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
                (!canUse || !stakeToken.trim() || connection === "connecting") && "opacity-60 cursor-not-allowed"
              )}
            >
              {connection === "connected" ? "Disconnect" : connection === "connecting" ? "Connecting…" : "Connect"}
            </button>

            <div className="rounded-xl border border-border bg-background/20 p-4 text-sm text-muted-foreground">
              Mines predictions are extension-only. Place a bet on Stake Mines and the predictor will auto-reveal the suggested safe tiles.
            </div>
          </div>

          {/* How it works */}
          <div className="mt-3 rounded-xl border border-border bg-background/20 p-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">How it works</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                { step: "1", text: "Paste your Stake API token and click Connect." },
                { step: "2", text: "Place a bet on Stake Mines as usual." },
                { step: "3", text: "Safe tiles are highlighted on the grid automatically." },
                { step: "4", text: "Click only the highlighted green tiles to stay safe." },
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

          {/* Live stats strip */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-background/20 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Bets Scanned</p>
              <p className="text-lg font-bold text-accent">{betsCounter}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/20 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Active Mines</p>
              <p className="text-lg font-bold text-accent">{minesCount ?? "—"}</p>
            </div>
          </div>

          {/* Quick tip */}
          <div className="mt-3 rounded-xl border border-accent/20 bg-accent/5 p-3 flex items-start gap-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">⚡</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tiles reveal automatically once a bet is detected. Only click the <span className="text-accent font-semibold">highlighted green tiles</span> to stay safe.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-4 shadow-elegant order-1 lg:order-2">
          <style>{`
            @keyframes tile-reveal {
              0% { opacity: 0; transform: scale(0.55) rotate(-6deg); box-shadow: none; }
              60% { opacity: 1; transform: scale(1.12) rotate(2deg); }
              100% { opacity: 1; transform: scale(1) rotate(0deg); }
            }
            .tile-gem {
              animation: tile-reveal 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
          `}</style>
          <div className="mx-auto w-full">
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {Array.from({ length: GRID_SIZE }).map((_, idx) => {
                const isGem = revealedGems.has(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled
                    className={cn(
                      "aspect-square border transition-colors duration-200",
                      "bg-background/35 border-border shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]",
                      isGem && "tile-gem border-accent/60 shadow-[0_0_22px_rgba(216,255,69,0.35)]"
                    )}
                    style={
                      isGem
                        ? {
                            borderRadius: "12px",
                            background:
                              "linear-gradient(180deg, rgba(216,255,69,0.97) 0%, rgba(180,230,30,0.75) 100%)",
                          }
                        : { borderRadius: "12px" }
                    }
                  />
                );
              })}
            </div>
          </div>

          {connection !== "connected" && (
            <div className="mt-4 rounded-xl border border-border bg-background/30 p-3 text-sm text-muted-foreground text-center">
              Connect your Stake API token to start receiving predictions.
            </div>
          )}
        </div>
      </div>
    </PredictorLayout>
  );
}
