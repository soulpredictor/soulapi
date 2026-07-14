import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mail, ShieldCheck, Lock } from "lucide-react";
import { SoulAIFooter, SoulAINavbar } from "@/components/soulai/SoulAIChrome";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { getStoredSession, setStoredSession, loginWithPassword, registerWithPassword, requestPasswordReset, resetPassword } from "@/lib/soulpredictor";

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

type Step = "login" | "register" | "forgot" | "reset";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<Step>("login");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const sess = getStoredSession();
    if (sess.email || sess.userToken) {
      navigate({ to: "/panel" });
    }
  }, [navigate]);

  const canSubmitLogin = email.trim().length >= 3 && email.includes("@") && password.length >= 6;
  const canSubmitRegister = canSubmitLogin;
  const canSubmitForgot = email.trim().length >= 3 && email.includes("@");
  const canSubmitReset = code.length >= 4 && newPassword.length >= 6;

  const handleLogin = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await loginWithPassword(email.trim(), password);
      if (res.status !== "success" || !res.user) throw new Error(res.message ?? "Login failed");
      const token = typeof res.user.user_token === "string" ? res.user.user_token : null;
      setStoredSession({ email: email.trim(), userToken: token ?? undefined });
      navigate({ to: "/panel" });
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Login failed" });
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await registerWithPassword(email.trim(), password);
      if (res.status !== "success") throw new Error(res.message ?? "Registration failed");
      setMessage({ kind: "success", text: "Account created! You can now log in." });
      setStep("login");
      setPassword("");
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Registration failed" });
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await requestPasswordReset(email.trim());
      if (res.status !== "success") throw new Error(res.message ?? "Failed to send reset code");
      setStep("reset");
      setMessage({ kind: "success", text: "Reset code sent to your email." });
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Failed to send reset code" });
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await resetPassword(email.trim(), code.trim(), newPassword);
      if (res.status !== "success") throw new Error(res.message ?? "Failed to reset password");
      setMessage({ kind: "success", text: "Password reset successful! Please log in." });
      setStep("login");
      setPassword("");
      setNewPassword("");
      setCode("");
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Failed to reset password" });
    } finally {
      setBusy(false);
    }
  };

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
              {step === "login" ? "Welcome back" : step === "register" ? "Create an account" : "Reset password"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed"
            >
              {step === "login" 
                ? "Enter your email and password to access your dashboard." 
                : step === "register" 
                ? "Enter your details to create a new account." 
                : "We will send a verification code to your email to reset your password."}
            </motion.p>

            <div className="mt-10 rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-6 sm:p-8 shadow-elegant">
              
              {(step === "login" || step === "register") && (
                <div className="mb-6 flex p-1 bg-background/50 rounded-lg relative">
                  <button 
                    onClick={() => { setStep("login"); setMessage(null); }}
                    className={cn(
                      "relative z-10 flex-1 py-2 text-sm font-semibold transition-all",
                      step === "login" ? "text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {step === "login" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-accent rounded-md -z-10 shadow-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    Login
                  </button>
                  <button 
                    onClick={() => { setStep("register"); setMessage(null); }}
                    className={cn(
                      "relative z-10 flex-1 py-2 text-sm font-semibold transition-all",
                      step === "register" ? "text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {step === "register" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-accent rounded-md -z-10 shadow-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    Register
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {(step === "login" || step === "register" || step === "forgot") ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
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
                    </div>

                    {(step === "login" || step === "register") && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <Lock className="size-4 text-accent" />
                            Password
                          </div>
                          {step === "login" && (
                            <button 
                              onClick={() => { setStep("forgot"); setMessage(null); }} 
                              className="text-xs text-accent hover:underline"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type="password"
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-base outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                        />
                      </div>
                    )}

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
                      disabled={busy || (step === "login" ? !canSubmitLogin : step === "register" ? !canSubmitRegister : !canSubmitForgot)}
                      onClick={step === "login" ? handleLogin : step === "register" ? handleRegister : handleForgot}
                      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:shadow-[0_0_30px_var(--glow)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {step === "login" ? "Login to Dashboard" : step === "register" ? "Create Account" : "Send Reset Code"} <ArrowRight className="size-4" />
                    </button>

                    {step === "forgot" && (
                      <div className="mt-4 text-center">
                        <button 
                          onClick={() => { setStep("login"); setMessage(null); }}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          Back to Login
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : step === "reset" ? (
                  <motion.div
                    key="reset"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <ShieldCheck className="size-4 text-accent" />
                        Enter reset code
                      </div>
                      <button
                        onClick={() => {
                          setStep("forgot");
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

                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Lock className="size-4 text-accent" />
                        New Password
                      </div>
                      <input
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-base outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                      />
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
                      disabled={!canSubmitReset || busy}
                      onClick={handleReset}
                      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:shadow-[0_0_30px_var(--glow)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Set New Password <ArrowRight className="size-4" />
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </main>
      <SoulAIFooter />
    </div>
  );
}
