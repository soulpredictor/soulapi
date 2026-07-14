import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { SoulAIFooter, SoulAINavbar } from "@/components/soulai/SoulAIChrome";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { getStoredSession, requestAuthCode, setStoredSession, verifyAuthCode } from "@/lib/soulpredictor";

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-6 lg:px-10 ${className}`}>{children}</div>;
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ property: "og:url", content: "/login" }],
    links: [{ rel: "canonical", href: "/login" }],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const sess = getStoredSession();
    if (sess.email || sess.userToken) {
      navigate({ to: "/panel" });
    }
  }, [navigate]);

  const canSend = email.trim().length >= 3 && email.includes("@");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SoulAINavbar mode="page" />
      <main className="relative overflow-hidden pt-40 pb-24 md:pt-44 md:pb-28 grain">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[900px] rounded-[50%] bg-[radial-gradient(circle,rgba(216,255,69,0.12),transparent_60%)] blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-40 size-[520px] rounded-[50%] bg-[radial-gradient(circle,rgba(120,120,255,0.10),transparent_60%)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-44 -right-36 size-[640px] rounded-[50%] bg-[radial-gradient(circle,rgba(216,255,69,0.10),transparent_60%)] blur-3xl" />

        <Container className="relative max-w-[1560px] 2xl:max-w-[1720px] lg:px-12 2xl:px-16">
          <div className="mx-auto max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
            >
              <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]" />
              User Panel
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-4xl md:text-5xl font-semibold leading-tight tracking-tight"
            >
              Login with email code
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed"
            >
              Enter your email to receive a login code. If you’re new, this also registers your account automatically.
            </motion.p>

            <div className="mt-10 rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-6 sm:p-8 shadow-elegant">
              <AnimatePresence mode="wait">
                {step === "email" ? (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Mail className="size-4 text-accent" />
                      Email
                    </div>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      placeholder="you@email.com"
                      className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-base outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                    />

                    {message && (
                      <div
                        className={cn(
                          "rounded-xl border px-4 py-3 text-sm",
                          message.kind === "error"
                            ? "border-red-500/30 bg-red-500/10 text-red-200"
                            : "border-accent/30 bg-accent/10 text-foreground",
                        )}
                      >
                        {message.text}
                      </div>
                    )}

                    <button
                      disabled={!canSend || busy}
                      onClick={async () => {
                        setBusy(true);
                        setMessage(null);
                        try {
                          const res = await requestAuthCode(email.trim());
                          if (res.status !== "success") throw new Error(res.message ?? "Failed to send code");
                          setStoredSession({ email: email.trim() });
                          setStep("code");
                          setMessage({ kind: "success", text: "Code sent. Check your inbox." });
                        } catch (e) {
                          setMessage({ kind: "error", text: e instanceof Error ? e.message : "Failed to send code" });
                        } finally {
                          setBusy(false);
                        }
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:shadow-[0_0_30px_var(--glow)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Code <ArrowRight className="size-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <ShieldCheck className="size-4 text-accent" />
                        Enter code
                      </div>
                      <button
                        onClick={() => {
                          setStep("email");
                          setCode("");
                          setMessage(null);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Change email
                      </button>
                    </div>

                    <div className="rounded-xl border border-border bg-background/40 px-4 py-4">
                      <div className="text-xs text-muted-foreground">Sent to</div>
                      <div className="mt-1 text-sm font-semibold">{email}</div>
                      <div className="mt-5 flex justify-center">
                        <InputOTP
                          value={code}
                          onChange={setCode}
                          maxLength={6}
                          inputMode="numeric"
                          autoFocus
                        >
                          <InputOTPGroup className="gap-1 sm:gap-2">
                            {Array.from({ length: 6 }).map((_, idx) => (
                              <InputOTPSlot
                                key={idx}
                                index={idx}
                                className="h-10 w-9 sm:h-11 sm:w-11 rounded-xl border border-border bg-surface/40 text-base"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>

                    {message && (
                      <div
                        className={cn(
                          "rounded-xl border px-4 py-3 text-sm",
                          message.kind === "error"
                            ? "border-red-500/30 bg-red-500/10 text-red-200"
                            : "border-accent/30 bg-accent/10 text-foreground",
                        )}
                      >
                        {message.text}
                      </div>
                    )}

                    <button
                      disabled={code.trim().length < 4 || busy}
                      onClick={async () => {
                        setBusy(true);
                        setMessage(null);
                        try {
                          const res = await verifyAuthCode(email.trim(), code.trim());
                          if (res.status !== "success" || !res.user) throw new Error(res.message ?? "Invalid code");
                          const token = typeof res.user.user_token === "string" ? res.user.user_token : null;
                          setStoredSession({ email: email.trim(), userToken: token ?? undefined });
                          navigate({ to: "/panel" });
                        } catch (e) {
                          setMessage({ kind: "error", text: e instanceof Error ? e.message : "Invalid code" });
                        } finally {
                          setBusy(false);
                        }
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:shadow-[0_0_30px_var(--glow)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify & Continue <ArrowRight className="size-4" />
                    </button>

                    <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                      <button
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          setMessage(null);
                          try {
                            const res = await requestAuthCode(email.trim());
                            if (res.status !== "success") throw new Error(res.message ?? "Failed to resend");
                            setMessage({ kind: "success", text: "Code resent." });
                          } catch (e) {
                            setMessage({ kind: "error", text: e instanceof Error ? e.message : "Failed to resend" });
                          } finally {
                            setBusy(false);
                          }
                        }}
                        className="hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Resend code
                      </button>
                      <a href="/stake-tools" className="hover:text-foreground transition-colors">
                        View plans
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </main>
      <SoulAIFooter />
    </div>
  );
}

