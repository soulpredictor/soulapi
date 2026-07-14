import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, RefreshCcw, Shield, Ticket, UserCircle, Crown, Activity, CalendarDays, Zap } from "lucide-react";
import { SoulAIFooter, SoulAINavbar } from "@/components/soulai/SoulAIChrome";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "boneyard-js/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  clearStoredSession,
  createUserTicket,
  getClientInfo,
  getStoredSession,
  requestPredictorAccess,
  replyUserTicket,
  userAssets,
  userLogin,
  userStats,
  userTickets,
  type SoulSession,
  type SoulTicket,
  type SoulUser,
} from "@/lib/soulpredictor";

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-6 lg:px-10 ${className}`}>{children}</div>;
}

export const Route = createFileRoute("/panel")({
  component: PanelPage,
  head: () => ({
    meta: [{ property: "og:url", content: "/panel" }],
    links: [{ rel: "canonical", href: "/panel" }],
  }),
});

function formatMaybeDate(v: unknown) {
  if (typeof v !== "string" || !v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
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

function formatTicketTime(v: unknown) {
  if (typeof v !== "string" || !v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function toUsername(user: SoulUser | undefined, session: SoulSession) {
  const u = user?.username;
  if (typeof u === "string" && u.trim()) return u;
  if (typeof user?.email === "string" && user.email.trim()) return user.email;
  if (typeof session.email === "string" && session.email.trim()) return session.email;
  return null;
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gradient">{value}</div>
    </div>
  );
}

function PanelPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<SoulSession>(() => getStoredSession());

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

  const user = (loginQuery.data?.user ?? undefined) as SoulUser | undefined;
  const username = useMemo(() => toUsername(user, session), [user, session]);

  const statsQuery = useQuery({
    queryKey: ["soulpredictor-user-stats", username],
    queryFn: () => userStats(username as string),
    enabled: hydrated && !!username,
    retry: false,
    staleTime: 15_000,
  });

  const assetsQuery = useQuery({
    queryKey: ["soulpredictor-user-assets", session.email],
    queryFn: () => userAssets(session.email as string),
    enabled: hydrated && !!session.email,
    retry: false,
    staleTime: 30_000,
  });

  const ticketsQuery = useQuery({
    queryKey: ["soulpredictor-user-tickets", username],
    queryFn: () => userTickets(username as string),
    enabled: hydrated && !!username,
    retry: false,
    staleTime: 10_000,
  });

  const createTicketMutation = useMutation({
    mutationFn: (args: { subject: string; message: string }) =>
      createUserTicket({
        username: username as string,
        subject: args.subject,
        message: args.message,
        client_info: getClientInfo(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["soulpredictor-user-tickets", username] });
    },
  });

  const replyTicketMutation = useMutation({
    mutationFn: (args: { ticketId: string | number; message: string }) =>
      replyUserTicket({
        ticket_id: args.ticketId,
        sender: "user",
        message: args.message,
        username: username as string,
        client_info: getClientInfo(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["soulpredictor-user-tickets", username] });
    },
  });

  const predictorAccessMutation = useMutation({
    mutationFn: (args: { predictor_type: string; request_message: string }) =>
      requestPredictorAccess({
        username: username as string,
        predictor_type: args.predictor_type,
        request_message: args.request_message,
      }),
  });

  const stats = statsQuery.data?.stats ?? {};
  const tickets = ticketsQuery.data?.tickets ?? [];

  const logout = () => {
    clearStoredSession();
    navigate({ to: "/login" });
  };

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["soulpredictor-user-login"] }),
      queryClient.invalidateQueries({ queryKey: ["soulpredictor-user-stats"] }),
      queryClient.invalidateQueries({ queryKey: ["soulpredictor-user-assets"] }),
      queryClient.invalidateQueries({ queryKey: ["soulpredictor-user-tickets"] }),
    ]);
    setSession(getStoredSession());
  };



  return (
    <div className="min-h-screen bg-background text-foreground">
      <SoulAINavbar mode="page" />
      <main className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28 grain">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
        <div className="pointer-events-none absolute -top-44 left-1/2 -translate-x-1/2 size-[900px] rounded-[50%] bg-[radial-gradient(circle,rgba(216,255,69,0.12),transparent_60%)] blur-3xl" />
        <div className="pointer-events-none absolute top-44 -left-44 size-[520px] rounded-[50%] bg-[radial-gradient(circle,rgba(120,120,255,0.10),transparent_60%)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-44 -right-36 size-[640px] rounded-[50%] bg-[radial-gradient(circle,rgba(216,255,69,0.10),transparent_60%)] blur-3xl" />

        <Skeleton name="panel-dashboard" loading={!hydrated || loginQuery.isLoading || loginQuery.isFetching}>
        <Container className="relative max-w-[1560px] 2xl:max-w-[1720px] lg:px-12 2xl:px-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]" />
                User Panel
              </div>
              <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
                Dashboard <span className="text-gradient">overview</span>
              </h1>
              <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
                Session, plan info, usage stats, and support tickets.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <a
                href="https://t.me/oglibe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm font-semibold hover:border-white/20 transition-all active:scale-[0.98]"
              >
                Support <ArrowUpRight className="size-4" />
              </a>
              <button
                onClick={refresh}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm font-semibold hover:border-white/20 transition-all active:scale-[0.98]"
              >
                <RefreshCcw className="size-4" />
                Refresh
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:shadow-[0_0_30px_var(--glow)] transition-all active:scale-[0.98]"
              >
                Logout <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-surface/40 to-background/40 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row gap-8 items-center sm:items-start group"
            >
              {/* Subtle background glow effect */}
              <div className="absolute -top-24 -right-24 size-48 rounded-full bg-accent/10 blur-[80px] pointer-events-none group-hover:bg-accent/20 transition-colors duration-700" />
              <div className="absolute -bottom-24 -left-24 size-48 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-700" />

              <div style={{ borderRadius: "50%", overflow: "hidden", clipPath: "circle(50%)" }} className="relative shrink-0 size-24 sm:size-28 border border-white/10 shadow-[0_0_20px_var(--glow)] shadow-accent/10 flex items-center justify-center">
                <img src="/favicon.ico" alt="Avatar" style={{ borderRadius: "50%", display: "block" }} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left w-full z-10">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 mb-4 shadow-sm backdrop-blur-md">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2 bg-accent"></span>
                  </span>
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Account</span>
                </div>
                
                <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">{username ?? "User"}</h2>
                <p className="text-sm text-muted-foreground/80 mt-1.5 font-medium">{session.email ?? "No email provided"}</p>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
                  {(() => {
                    const planActive = toBooleanish((user as any)?.plan_active);
                    const planName = (user as any)?.subscription_plan_name ?? (user as any)?.subscription_plan ?? "None";
                    const expires = formatMaybeDate((user as any)?.plan_expires_at) ?? "Never";

                    return (
                      <>
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] px-4 py-3 flex flex-col justify-center relative overflow-hidden group/card transition-all duration-300 hover:border-white/10 hover:-translate-y-0.5">
                          <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                          <div className="flex items-center gap-1.5 mb-1.5 relative z-10">
                            <Crown className="size-3.5 text-accent" />
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Plan</span>
                          </div>
                          <span className="text-sm sm:text-base font-bold text-white capitalize break-words relative z-10 drop-shadow-sm">{planName}</span>
                        </div>
                        
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] px-4 py-3 flex flex-col justify-center relative overflow-hidden group/card transition-all duration-300 hover:border-white/10 hover:-translate-y-0.5">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                          <div className="flex items-center gap-1.5 mb-1.5 relative z-10">
                            <Activity className="size-3.5 text-purple-400" />
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Status</span>
                          </div>
                          <div className="relative z-10">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase border transition-colors",
                                planActive ? "bg-accent/10 border-accent/30 text-accent shadow-[0_0_10px_rgba(216,255,69,0.15)]" : "bg-red-500/10 border-red-500/30 text-red-300"
                              )}
                            >
                              {planActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2 md:col-span-1 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] px-4 py-3 flex flex-col justify-center relative overflow-hidden group/card transition-all duration-300 hover:border-white/10 hover:-translate-y-0.5">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                          <div className="flex items-center gap-1.5 mb-1.5 relative z-10">
                            <CalendarDays className="size-3.5 text-blue-400" />
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Expires</span>
                          </div>
                          <span className="text-sm font-semibold text-white break-words relative z-10">{expires}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

              {(loginQuery.isLoading || loginQuery.isFetching) && (
                <div className="mt-5 text-xs text-muted-foreground">Validating session…</div>
              )}
              {loginQuery.data?.status !== "success" && (
                <div className="mt-5 text-xs text-red-200">Session error: {loginQuery.data?.message ?? "Invalid session"}</div>
              )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-6 sm:p-8 shadow-elegant"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Shield className="size-4 text-accent" />
                Quick status
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-4 py-3">
                  <div className="text-sm font-semibold">Stats</div>
                  <div className="text-xs text-muted-foreground">
                    {statsQuery.isFetching ? "Refreshing" : statsQuery.data?.status === "success" ? "Ready" : "Unavailable"}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-4 py-3">
                  <div className="text-sm font-semibold">Assets</div>
                  <div className="text-xs text-muted-foreground">
                    {assetsQuery.isFetching ? "Refreshing" : assetsQuery.data?.status === "success" ? "Ready" : "Unavailable"}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-4 py-3">
                  <div className="text-sm font-semibold">Tickets</div>
                  <div className="text-xs text-muted-foreground">
                    {ticketsQuery.isFetching ? "Refreshing" : ticketsQuery.data?.status === "success" ? "Ready" : "Unavailable"}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-surface/30 backdrop-blur-xl p-4 sm:p-6">
            <Tabs defaultValue="overview">
              <TabsList className="bg-background/40">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
                <TabsTrigger value="access">Access</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard label="Mines predictions" value={(stats as any)?.mines_predictions_count ?? 0} />
                  <StatCard label="Crash predictions" value={(stats as any)?.crash_predictions_count ?? 0} />
                  <StatCard label="Blackjack predictions" value={(stats as any)?.blackjack_predictions_count ?? 0} />
                  <StatCard label="Script usage" value={(stats as any)?.script_usage_count ?? 0} />
                  <StatCard label="Telegram premium" value={(stats as any)?.telegram_premium_count ?? 0} />
                  <StatCard label="Login Count" value={(stats as any)?.fake_mines_login_count ?? 0} />
                </div>
              </TabsContent>

              <TabsContent value="tickets" className="mt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Ticket className="size-4 text-accent" />
                    Support tickets
                  </div>
                  <TicketComposer
                    busy={createTicketMutation.isPending}
                    onSubmit={(subject, message) => createTicketMutation.mutate({ subject, message })}
                  />
                </div>

                <div className="mt-6 grid gap-4">
                  {tickets.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-background/30 p-6 text-sm text-muted-foreground">
                      No tickets yet.
                    </div>
                  ) : (
                    tickets.map((t: SoulTicket, idx: number) => (
                      <TicketRow
                        key={(t.ticket_id ?? t.id ?? idx) as any}
                        ticket={t}
                        busy={replyTicketMutation.isPending}
                        onReply={(ticketId, msg) => replyTicketMutation.mutate({ ticketId, message: msg })}
                      />
                    ))
                  )}
                </div>

                {(createTicketMutation.isError || replyTicketMutation.isError) && (
                  <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {(createTicketMutation.error as any)?.message ?? (replyTicketMutation.error as any)?.message ?? "Request failed"}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="access" className="mt-6">
                <div className="rounded-2xl border border-border bg-background/30 p-6">
                  <div className="text-sm font-semibold">Request predictor access</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Send a request to enable a predictor on your account.
                  </p>
                  <PredictorAccessForm
                    busy={predictorAccessMutation.isPending}
                    onSubmit={(predictor_type, request_message) =>
                      predictorAccessMutation.mutate({ predictor_type, request_message })
                    }
                  />
                  {predictorAccessMutation.data?.status === "success" && (
                    <div className="mt-5 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
                      Request sent.
                    </div>
                  )}
                  {predictorAccessMutation.isError && (
                    <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {(predictorAccessMutation.error as any)?.message ?? "Request failed"}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="assets" className="mt-6">
                <PredictorAssets
                  user={user}
                  assets={assetsQuery.data?.assets ?? undefined}
                  requestAccess={(type) =>
                    predictorAccessMutation.mutate({
                      predictor_type: type,
                      request_message: `Requested ${type} module access via user panel.`,
                    })
                  }
                />
              </TabsContent>
            </Tabs>
          </div>
        </Container>
        </Skeleton>
      </main>
      <SoulAIFooter />
    </div>
  );
}

function TicketComposer({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (subject: string, message: string) => void;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const canSend = subject.trim().length >= 2 && message.trim().length >= 2;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:shadow-[0_0_30px_var(--glow)] transition-all active:scale-[0.98]">
          New ticket <ArrowRight className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="border-border bg-background/95">
        <DialogHeader>
          <DialogTitle>New support ticket</DialogTitle>
          <DialogDescription>Send a message to support.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <DialogFooter className="gap-2">
          <button
            disabled={!canSend || busy}
            onClick={() => {
              onSubmit(subject, message);
              setSubject("");
              setMessage("");
            }}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-all active:scale-[0.98]",
              (!canSend || busy) && "opacity-50 cursor-not-allowed",
            )}
          >
            Send <ArrowRight className="size-4" />
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TicketRow({
  ticket,
  busy,
  onReply,
}: {
  ticket: SoulTicket;
  busy: boolean;
  onReply: (ticketId: string | number, message: string) => void;
}) {
  const ticketId = (ticket.ticket_id ?? ticket.id) as string | number | undefined;
  const messages = (Array.isArray((ticket as any)?.messages) ? ((ticket as any).messages as any[]) : []) ?? [];
  const lastMsg = messages.length ? (messages[messages.length - 1]?.text ?? "") : "";
  const updatedAt = (ticket as any)?.updated_at ?? ticket.created_at;
  const status = (ticket as any)?.status ?? "open";

  return (
    <div className="rounded-2xl border border-border bg-background/30 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-semibold">{ticket.subject ?? "Ticket"}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Status: {status} {updatedAt ? `• ${formatTicketTime(updatedAt)}` : ""}
          </div>
          {lastMsg ? <div className="mt-2 text-xs text-muted-foreground line-clamp-1">{String(lastMsg)}</div> : null}
        </div>
        <TicketThreadDialog ticket={ticket} busy={busy} onReply={onReply} ticketId={ticketId} />
      </div>
    </div>
  );
}

function TicketThreadDialog({
  ticket,
  ticketId,
  busy,
  onReply,
}: {
  ticket: SoulTicket;
  ticketId: string | number | undefined;
  busy: boolean;
  onReply: (ticketId: string | number, message: string) => void;
}) {
  const [message, setMessage] = useState("");
  const status = String((ticket as any)?.status ?? "open").toLowerCase();
  const isClosed = status === "closed";
  const messages = (Array.isArray((ticket as any)?.messages) ? ((ticket as any).messages as any[]) : []) ?? [];
  const canReply = !!ticketId && message.trim().length >= 2 && !isClosed;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm font-semibold hover:border-white/20 transition-all active:scale-[0.98]">
          View <ArrowRight className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="border-border bg-background/95 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-base sm:text-lg">{ticket.subject ?? "Ticket"}</span>
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium tracking-widest uppercase border",
                status === "open"
                  ? "bg-accent/10 border-accent/20 text-accent"
                  : status === "paused"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-white/5 border-white/10 text-muted-foreground",
              )}
            >
              {status}
            </span>
          </DialogTitle>
          <DialogDescription>
            {messages.length ? "Conversation log (admin + user replies)" : "No messages yet."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 max-h-[420px] overflow-auto rounded-2xl border border-border bg-black/30 p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-10">Empty log.</div>
          ) : (
            messages.map((m, idx) => {
              const isUser = m?.sender === "user";
              const text = String(m?.text ?? "");
              const createdAt = m?.created_at;
              return (
                <div key={idx} className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-5 py-3.5 text-sm shadow-sm",
                      isUser
                        ? "bg-accent text-accent-foreground rounded-br-sm"
                        : "bg-black/40 border border-white/10 text-foreground rounded-bl-sm backdrop-blur-md",
                    )}
                  >
                    <div className={cn("whitespace-pre-wrap break-words leading-relaxed", isUser && "font-medium")}>
                      {text}
                    </div>
                    <div className={cn("mt-2 text-[10px] font-mono text-right", isUser ? "text-black/60" : "text-muted-foreground")}>
                      {formatTicketTime(createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 grid gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isClosed ? "Channel closed." : "Write a reply…"}
            rows={4}
            disabled={isClosed}
            className={cn(
              "w-full resize-none rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20",
              isClosed && "opacity-60 cursor-not-allowed",
            )}
          />
        </div>
        <DialogFooter className="gap-2">
          <button
            disabled={!canReply || busy}
            onClick={() => {
              if (!ticketId) return;
              onReply(ticketId, message);
              setMessage("");
            }}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-all active:scale-[0.98]",
              (!canReply || busy) && "opacity-50 cursor-not-allowed",
            )}
          >
            Send <ArrowRight className="size-4" />
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PredictorAssets({
  user,
  assets,
  requestAccess,
}: {
  user: SoulUser | undefined;
  assets: Record<string, unknown> | undefined;
  requestAccess: (type: "mines" | "crash" | "blackjack" | "moles" | "chicken") => void;
}) {
  const plan = String((assets as any)?.plan ?? "free").toLowerCase();
  const planActive = toBooleanish((assets as any)?.plan_active);
  const planName = (assets as any)?.plan_name ?? (assets as any)?.plan_display_name ?? (assets as any)?.subscription_plan_name ?? null;
  const PLAN_DISPLAY_NAMES: Record<string, string> = {
    free: "Free",
    demo: "Free",
    trial: "Free",
    silver: "Diamond",
    gold: "Obsidian",
    turbo: "Gold",
  };
  const planDisplay = String(planName ?? PLAN_DISPLAY_NAMES[plan] ?? "Free");

  const userPlanActive = toBooleanish((user as any)?.plan_active);
  const isApprovedActive = (user as any)?.status === "approved" && !!(user as any)?.active;

  const items: Array<{
    id: "mines" | "crash" | "blackjack" | "moles" | "chicken";
    title: string;
    subtitle: string;
    accessEnabled: boolean;
    isActive: boolean;
    canOpen: boolean;
    lastUsedAt?: unknown;
  }> = [
    {
      id: "mines",
      title: "Mines",
      subtitle: "Predictor module",
      accessEnabled: (user as any)?.mines_access_enabled === true,
      isActive: (user as any)?.mines_access_enabled === true && (userPlanActive || isApprovedActive),
      canOpen: !!(user && userPlanActive && (user as any)?.mines_access_enabled === true),
      lastUsedAt: (user as any)?.mines_last_used_at,
    },
    {
      id: "crash",
      title: "Crash",
      subtitle: "Predictor module",
      accessEnabled: (user as any)?.crash_access_enabled === true,
      isActive: (user as any)?.crash_access_enabled === true && (userPlanActive || isApprovedActive),
      canOpen: !!(user && (user as any)?.crash_access_enabled === true && (userPlanActive || isApprovedActive)),
      lastUsedAt: (user as any)?.crash_last_used_at,
    },
    {
      id: "blackjack",
      title: "Blackjack",
      subtitle: "Predictor module",
      accessEnabled: (user as any)?.blackjack_access_enabled === true,
      isActive: (user as any)?.blackjack_access_enabled === true && (userPlanActive || isApprovedActive),
      canOpen: !!(user && userPlanActive && (user as any)?.blackjack_access_enabled === true),
      lastUsedAt: (user as any)?.blackjack_last_used_at,
    },
    {
      id: "moles",
      title: "Moles",
      subtitle: "Predictor module",
      accessEnabled: (user as any)?.moles_access_enabled === true,
      isActive: (user as any)?.moles_access_enabled === true && (userPlanActive || isApprovedActive),
      canOpen: !!(user && (user as any)?.moles_access_enabled === true && (userPlanActive || isApprovedActive)),
      lastUsedAt: (user as any)?.moles_last_used_at,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-background/30 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold">Assets</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Select a predictor module. Open is disabled until access is enabled (matches the original user panel behavior).
          </p>
        </div>
        <div
          className={cn(
            "text-xs font-mono font-medium tracking-widest uppercase px-4 py-2 rounded-full border backdrop-blur-md",
            planActive ? "text-accent bg-accent/10 border-accent/20" : "text-red-200 bg-red-500/10 border-red-500/30",
          )}
        >
          {planDisplay} {planActive ? "Active" : "Inactive"}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((it) => (
          <div key={it.id} className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-6 flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{it.subtitle}</div>
                <div className="mt-1 text-2xl font-semibold">{it.title}</div>
              </div>
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                  it.isActive ? "bg-accent/10 border-accent/20 text-accent" : "bg-red-500/10 border-red-500/30 text-red-200",
                )}
              >
                <span className={cn("size-1.5 rounded-full", it.isActive ? "bg-accent shadow-[0_0_12px_var(--glow)]" : "bg-red-200/60")} />
                {it.isActive ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-4 py-3">
                <div className="text-xs">Access enabled</div>
                <div
                  className={cn(
                    "text-[10px] font-medium tracking-widest uppercase rounded-md px-2 py-0.5 border",
                    it.accessEnabled ? "bg-accent/10 border-accent/20 text-accent" : "bg-white/5 border-white/10 text-muted-foreground",
                  )}
                >
                  {it.accessEnabled ? "Enabled" : "Disabled"}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-4 py-3">
                <div className="text-xs">Last used</div>
                <div className="text-xs font-mono text-foreground">{formatTicketTime(it.lastUsedAt) || "--"}</div>
              </div>
            </div>

            <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-2">
              <button
                disabled={!it.canOpen}
                title={it.canOpen ? "" : `${it.title} requires an active plan and enabled access.`}
                onClick={() => {
                  if (!it.canOpen) return;
                  window.location.href = `/${it.id}`;
                }}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98]",
                  it.canOpen
                    ? "bg-accent text-accent-foreground hover:shadow-[0_0_30px_var(--glow)]"
                    : "bg-zinc-900/40 border border-border text-muted-foreground cursor-not-allowed",
                )}
              >
                Open <ArrowRight className="size-4" />
              </button>
              <button
                disabled={it.accessEnabled}
                onClick={() => {
                  if (it.accessEnabled) return;
                  requestAccess(it.id);
                }}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98]",
                  it.accessEnabled ? "opacity-50 cursor-not-allowed" : "hover:border-white/20",
                )}
              >
                {it.accessEnabled ? "Access granted" : "Request access"} <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PredictorAccessForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (predictor_type: string, request_message: string) => void;
}) {
  const [predictorType, setPredictorType] = useState("mines");
  const [message, setMessage] = useState("");

  return (
    <div className="mt-5 grid gap-3">
      <div className="grid gap-2">
        <div className="text-xs text-muted-foreground">Predictor</div>
        <select
          value={predictorType}
          onChange={(e) => setPredictorType(e.target.value)}
          className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
        >
          <option value="crash">Crash</option>
          <option value="mines">Mines</option>
          <option value="blackjack">Blackjack</option>
          <option value="moles">Moles</option>
        </select>
      </div>
      <div className="grid gap-2">
        <div className="text-xs text-muted-foreground">Message</div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Explain what you need enabled…"
          rows={4}
          className="w-full resize-none rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
        />
      </div>
      <button
        disabled={busy || message.trim().length < 2}
        onClick={() => {
          onSubmit(predictorType, message);
          setMessage("");
        }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:shadow-[0_0_30px_var(--glow)] transition-all active:scale-[0.98]",
          (busy || message.trim().length < 2) && "opacity-50 cursor-not-allowed",
        )}
      >
        Send request <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
