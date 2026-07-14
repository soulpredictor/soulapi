import { type ReactNode } from "react";
import { ArrowLeft, Shield, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SoulAIFooter, SoulAINavbar } from "@/components/soulai/SoulAIChrome";
import { Skeleton } from "boneyard-js/react";
import { cn } from "@/lib/utils";

function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>;
}

type PredictorLayoutProps = {
  title: string;
  subtitle: string;
  accentColor?: string;
  children: ReactNode;
  statusBadge?: {
    label: string;
    active: boolean;
  };
  infoCards?: Array<{
    label: string;
    value: string | number;
    icon?: ReactNode;
  }>;
  loading?: boolean;
};

export default function PredictorLayout({
  title,
  subtitle,
  accentColor = "accent",
  children,
  statusBadge,
  infoCards,
  loading = false,
}: PredictorLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SoulAINavbar mode="page" />
      <main className="relative overflow-hidden pt-36 pb-20 md:pt-40 md:pb-24 grain">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
        <div className="pointer-events-none absolute -top-44 left-1/2 -translate-x-1/2 size-[900px] rounded-[50%] bg-[radial-gradient(circle,rgba(216,255,69,0.12),transparent_60%)] blur-3xl" />
        <div className="pointer-events-none absolute top-44 -left-44 size-[520px] rounded-[50%] bg-[radial-gradient(circle,rgba(120,120,255,0.10),transparent_60%)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-44 -right-36 size-[640px] rounded-[50%] bg-[radial-gradient(circle,rgba(216,255,69,0.10),transparent_60%)] blur-3xl" />

        <Skeleton name={`${title.toLowerCase()}-predictor`} loading={loading}>
        <Container className="relative max-w-[1100px] 2xl:max-w-[1260px] lg:px-10 2xl:px-12">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]" />
                {subtitle}
              </div>
              <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight">
                {title} <span className="text-gradient">predictor</span>
              </h1>
            </div>
            <Link
              to="/panel"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm font-semibold hover:border-white/20 transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="size-4" />
              Back to panel
            </Link>
          </div>

          {/* Status badge */}
          {statusBadge && (
            <div className="mt-6">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
                  statusBadge.active
                    ? "bg-accent/10 border-accent/20 text-accent"
                    : "bg-red-500/10 border-red-500/30 text-red-200"
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    statusBadge.active ? "bg-accent shadow-[0_0_12px_var(--glow)]" : "bg-red-200/60"
                  )}
                />
                {statusBadge.label}
              </div>
            </div>
          )}

          {/* Info cards */}
          {infoCards && infoCards.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {infoCards.map((card, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-surface/40 backdrop-blur-xl p-4 shadow-elegant"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {card.icon || <Shield className="size-3" />}
                    {card.label}
                  </div>
                  <div className="mt-2 text-lg font-semibold">{card.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Main content */}
          <div className="mt-8">{children}</div>
        </Container>
        </Skeleton>
      </main>
      <SoulAIFooter />
    </div>
  );
}
