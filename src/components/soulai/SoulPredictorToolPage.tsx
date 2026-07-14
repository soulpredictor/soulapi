import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Shield, Sparkles } from "lucide-react";
import { SoulAIFooter, SoulAINavbar } from "@/components/soulai/SoulAIChrome";
import { cn } from "@/lib/utils";
import {
  clearStoredSession,
  getClientInfo,
  getStoredSession,
  requestPredictorAccess,
  userAssets,
  userLogin,
  type SoulSession,
  type SoulUser,
} from "@/lib/soulpredictor";

function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-6 lg:px-10 ${className}`}>{children}</div>;
}

function toBooleanish(v: unknown) {
  if (v === true) return true;
  if (v === false) return false;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "yes") return true;
    if (s === "false" || s === "0" || s === "no") return false;
  }
  if (typeof v === "number") return v !== 0;
  return false;
}

function toUsername(user: SoulUser | undefined, session: SoulSession) {
  const u = user?.username;
  if (typeof u === "string" && u.trim()) return u;
  if (typeof user?.email === "string" && user.email.trim()) return user.email;
  if (typeof session.email === "string" && session.email.trim()) return session.email;
  return null;
}

function formatMaybeTime(v: unknown) {
  if (typeof v !== "string" || !v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function normalizeScripts(assets: Record<string, unknown> | undefined) {
  const scripts = (assets as any)?.scripts;
  if (!Array.isArray(scripts)) return [];
  return scripts.filter(Boolean) as Array<Record<string, unknown>>;
}

function asText(v: unknown) {
  if (typeof v === "string") return v;
  if (v == null) return "";
  return String(v);
}

export type PredictorId = "mines" | "crash" | "blackjack" | "moles";

export default function SoulPredictorToolPage({ predictorId }: { predictorId: PredictorId }) {
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<SoulSession>(() => getStoredSession());
  const [requestMessage, setRequestMessage] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
    setSession(getStoredSession());
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!session.email && !session.userToken) navigate({ to: "/login" });
  }, [hydrated, session.email, session.userToken, navigate]);

  const loginQuery = useQuery({
    queryKey: ["soulpredictor-user-login", session.email, session.userToken],
    queryFn: () => userLogin(session),
    enabled: hydrated && (!!session.email || !!session.userToken),
    retry: false,
    staleTime: 20_000,
  });

  useEffect(() => {
    if (!hydrated) return;
    if (loginQuery.isError) {
      clearStoredSession();
      navigate({ to: "/login" });
      return;
    }
    const res = loginQuery.data;
    if (!res) return;
    if (res.status !== "success" || !res.user) {
      clearStoredSession();
      navigate({ to: "/login" });
    }
  }, [hydrated, loginQuery.data, loginQuery.isError, navigate]);

  const assetsQuery = useQuery({
    queryKey: ["soulpredictor-user-assets", session.email],
    queryFn: () => userAssets(session.email as string),
    enabled: hydrated && !!session.email,
    retry: false,
    staleTime: 30_000,
  });

  const user = (loginQuery.data?.user ?? undefined) as SoulUser | undefined;
  const username = useMemo(() => toUsername(user, session), [user, session]);

  const accessEnabled = (user as any)?.[`${predictorId}_access_enabled`] === true;
  const userPlanActive = toBooleanish((user as any)?.plan_active);
  const isApprovedActive = (user as any)?.status === "approved" && !!(user as any)?.active;
  const requiresPlan = predictorId === "mines" || predictorId === "blackjack";
  const canOpen = accessEnabled && (requiresPlan ? userPlanActive : userPlanActive || isApprovedActive);
  const lastUsedAt = (user as any)?.[`${predictorId}_last_used_at`];

  const assets = assetsQuery.data?.assets as Record<string, unknown> | undefined;
  const plan = String((assets as any)?.plan ?? "free").toLowerCase();
  const planActive = toBooleanish((assets as any)?.plan_active);
  const planName = (assets as any)?.plan_name ?? (assets as any)?.plan_display_name ?? (assets as any)?.subscription_plan_name ?? null;
  const PLAN_DISPLAY_NAMES: Record<string, string> = {
    free: "S-Free",
    demo: "S-Free",
    trial: "S-Free",
    silver: "S-Enterprise",
    gold: "S-Max",
    turbo: "S-OG",
  };
  const planDisplay = String(planName ?? PLAN_DISPLAY_NAMES[plan] ?? "S-Free");
  const timeRemaining = (assets as any)?.time_remaining ?? "--";

  const scripts = useMemo(() => {
    const all = normalizeScripts(assets);
    return all.filter((s) => {
      const t = String((s as any)?.type ?? (s as any)?.predictor_type ?? "").toLowerCase();
      return t === predictorId;
    });
  }, [assets, predictorId]);

  const accessMutation = useMutation({
    mutationFn: (args: { predictor_type: PredictorId; request_message: string }) =>
      requestPredictorAccess({
        username: username as string,
        predictor_type: args.predictor_type,
        request_message: args.request_message,
      }),
  });

  const title = predictorId.charAt(0).toUpperCase() + predictorId.slice(1);

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied((v) => (v === id ? null : v)), 1200);
    } catch {
      setCopied(null);
    }
  };

  const isLocked = !planActive && plan !== "free";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SoulAINavbar mode="page" />
      <main className="relative overflow-hidden pt-40 pb-24 md:pt-44 md:pb-28 grain">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
        <div className="pointer-events-none absolute -top-44 left-1/2 -translate-x-1/2 size-[900px] rounded-[50%] bg-[radial-gradient(circle,rgba(216,255,69,0.12),transparent_60%)] blur-3xl" />
        <div className="pointer-events-none absolute top-44 -left-44 size-[520px] rounded-[50%] bg-[radial-gradient(circle,rgba(120,120,255,0.10),transparent_60%)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-44 -right-36 size-[640px] rounded-[50%] bg-[radial-gradient(circle,rgba(216,255,69,0.10),transparent_60%)] blur-3xl" />

        <Container className="relative max-w-[1560px] 2xl:max-w-[1720px] lg:px-12 2xl:px-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]" />
                Predictor
              </div>
              <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight">
                {title} <span className="text-gradient">tool</span>
              </h1>
              <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
                Live access + scripts are loaded from your account. If you don’t have access, request it here.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <Link
                to="/panel"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm font-semibold hover:border-white/20 transition-all active:scale-[0.98]"
              >
                <ArrowLeft className="size-4" />
                Back to panel
              </Link>
              <a
                href="https://stake.com"
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98]",
                  canOpen
                    ? "bg-accent text-accent-foreground hover:shadow-[0_0_30px_var(--glow)]"
                    : "bg-zinc-900/40 border border-border text-muted-foreground cursor-not-allowed pointer-events-none",
                )}
                title={canOpen ? "" : "Open is locked until plan is active and module access is enabled."}
              >
                Open Stake <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-6 sm:p-8 shadow-elegant">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Shield className="size-4 text-accent" />
                  Status
                </div>
                <div
                  className={cn(
                    "text-[10px] font-medium tracking-widest uppercase px-3 py-1 rounded-full border backdrop-blur-md",
                    planActive ? "text-accent bg-accent/10 border-accent/20" : "text-red-200 bg-red-500/10 border-red-500/30",
                  )}
                >
                  {planDisplay} {planActive ? "Active" : "Inactive"}
                </div>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-4 py-3">
                  <div className="text-xs">Module access</div>
                  <div
                    className={cn(
                      "text-[10px] font-medium tracking-widest uppercase rounded-md px-2 py-0.5 border",
                      accessEnabled ? "bg-accent/10 border-accent/20 text-accent" : "bg-white/5 border-white/10 text-muted-foreground",
                    )}
                  >
                    {accessEnabled ? "Enabled" : "Disabled"}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-4 py-3">
                  <div className="text-xs">Launch status</div>
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                      canOpen ? "bg-accent/10 border-accent/20 text-accent" : "bg-red-500/10 border-red-500/30 text-red-200",
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", canOpen ? "bg-accent shadow-[0_0_12px_var(--glow)]" : "bg-red-200/60")} />
                    {canOpen ? "Ready" : "Locked"}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-4 py-3">
                  <div className="text-xs">Time left</div>
                  <div className="text-xs font-mono text-foreground">{asText(timeRemaining)}</div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-4 py-3">
                  <div className="text-xs">Last used</div>
                  <div className="text-xs font-mono text-foreground">{formatMaybeTime(lastUsedAt) || "--"}</div>
                </div>
              </div>

              {!accessEnabled && (
                <div className="mt-6 rounded-2xl border border-border bg-background/30 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="size-4 text-accent" />
                    Request access
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Provide a short message. Access is enabled manually once approved.
                  </p>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder={`Request ${title} access…`}
                    rows={4}
                    className="mt-4 w-full resize-none rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                  />
                  <button
                    disabled={!username || accessMutation.isPending || requestMessage.trim().length < 2}
                    onClick={() =>
                      accessMutation.mutate({
                        predictor_type: predictorId,
                        request_message: `${requestMessage.trim()} (client: ${getClientInfo()})`,
                      })
                    }
                    className={cn(
                      "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:shadow-[0_0_30px_var(--glow)] transition-all active:scale-[0.98]",
                      (!username || accessMutation.isPending || requestMessage.trim().length < 2) && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    Send request <ArrowRight className="size-4" />
                  </button>
                  {accessMutation.data?.status === "success" && (
                    <div className="mt-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
                      Request sent.
                    </div>
                  )}
                  {accessMutation.isError && (
                    <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {(accessMutation.error as any)?.message ?? "Request failed"}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-6 sm:p-8 shadow-elegant">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">Scripts</div>
                <div className="text-xs text-muted-foreground">{assetsQuery.isFetching ? "Refreshing" : "Loaded"}</div>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-background/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">Availability</div>
                  <div
                    className={cn(
                      "text-[10px] font-medium tracking-widest uppercase rounded-md px-2 py-0.5 border",
                      isLocked ? "bg-red-500/10 border-red-500/30 text-red-200" : "bg-white/5 border-white/10 text-muted-foreground",
                    )}
                  >
                    {isLocked ? "Plan expired" : plan === "free" && !planActive ? "Free plan" : "Available"}
                  </div>
                </div>
              </div>

              {isLocked ? (
                <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
                  Assets are locked because your plan is inactive. Renew your subscription to access scripts.
                </div>
              ) : scripts.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-border bg-background/30 p-6 text-sm text-muted-foreground">
                  No scripts available for {title}.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {scripts.map((s, idx) => {
                    const name = asText((s as any)?.name || `${title} Script ${idx + 1}`);
                    const code = asText((s as any)?.code);
                    const id = `${predictorId}-${idx}`;
                    return (
                      <div key={id} className="rounded-2xl border border-border bg-background/30 overflow-hidden">
                        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 bg-black/20">
                          <div className="text-xs font-mono text-muted-foreground">{name}</div>
                          <button
                            onClick={() => copy(code, id)}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-3 py-2 text-xs font-semibold hover:border-white/20 transition-all active:scale-[0.98]",
                              !code && "opacity-50 cursor-not-allowed",
                            )}
                            disabled={!code}
                          >
                            {copied === id ? "Copied" : "Copy"} <ArrowRight className="size-3.5" />
                          </button>
                        </div>
                        <pre className="max-h-[360px] overflow-auto p-4 text-xs text-muted-foreground leading-relaxed">
                          <code>{code}</code>
                        </pre>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>
      <SoulAIFooter />
    </div>
  );
}

