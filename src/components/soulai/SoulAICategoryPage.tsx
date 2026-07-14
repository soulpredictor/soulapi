import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { SoulAIFooter, SoulAINavbar } from "@/components/soulai/SoulAIChrome";

function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-6 lg:px-10 ${className}`}>{children}</div>;
}

type Billing = "weekly" | "monthly";

export type CategoryPlan = {
  name: string;
  tag: string;
  badge?: string;
  highlight?: boolean;
  priceWeekly: string;
  priceMonthly: string;
  features: string[];
  featuresWeekly?: string[];
  featuresMonthly?: string[];
  ctaHref?: string;
  ctaHrefWeekly?: string;
  ctaHrefMonthly?: string;
  ctaLabel?: string;
};

export type CategoryPlanGroup = {
  id: string;
  label: string;
  plans: CategoryPlan[];
  pricingMode?: "toggle" | "both";
};

function CategoryHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
}) {
  return (
    <section id="home" className="relative overflow-hidden pt-40 pb-24 md:pt-44 md:pb-28 grain">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[900px] rounded-[50%] bg-[radial-gradient(circle,rgba(216,255,69,0.12),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-40 size-[500px] rounded-[50%] bg-[radial-gradient(circle,rgba(120,120,255,0.10),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 size-[600px] rounded-[50%] bg-[radial-gradient(circle,rgba(216,255,69,0.10),transparent_60%)] blur-3xl" />

      <Container className="relative max-w-[1560px] 2xl:max-w-[1720px] lg:px-12 2xl:px-16">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]" />
            {eyebrow}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {["Fast setup", "Clear deliverables", "Weekly support"].map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/40 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
              >
                <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function BillingToggle({
  value,
  onChange,
  className = "mt-10",
}: {
  value: Billing;
  onChange: (b: Billing) => void;
  className?: string;
}) {
  return (
    <div className={`${className} flex justify-center`}>
      <div className="relative inline-flex items-center rounded-2xl border border-border bg-surface/40 p-1 backdrop-blur">
        <AnimatePresence initial={false}>
          <motion.div
            key={value}
            layoutId="billing-pill"
            className="absolute inset-y-1 rounded-xl bg-accent"
            style={{ width: "calc(50% - 4px)", left: value === "weekly" ? 4 : "calc(50% + 0px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          />
        </AnimatePresence>
        <button
          type="button"
          onClick={() => onChange("weekly")}
          className={`relative z-10 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all active:scale-[0.98] ${
            value === "weekly" ? "text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Weekly
        </button>
        <button
          type="button"
          onClick={() => onChange("monthly")}
          className={`relative z-10 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all active:scale-[0.98] ${
            value === "monthly" ? "text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Monthly
        </button>
      </div>
    </div>
  );
}

function PlanGroupToggle({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (v: string) => void;
}) {
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.id === value),
  );
  const width = `calc(${100 / options.length}% - 8px)`;
  const left = `calc(${(100 / options.length) * selectedIndex}% + 4px)`;

  return (
    <div className="mt-10 flex justify-center">
      <div className="relative w-full max-w-xl">
        <div className="relative flex w-full items-center rounded-2xl border border-border bg-surface/40 p-1 backdrop-blur">
          <AnimatePresence initial={false}>
            <motion.div
              key={value}
              layoutId="group-pill"
              className="absolute inset-y-1 rounded-xl bg-accent"
              style={{ width, left }}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
            />
          </AnimatePresence>
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={`relative z-10 flex-1 px-2 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-sm font-semibold transition-all active:scale-[0.98] ${
                o.id === value ? "text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroPricingArrow() {
  return (
    <div className="pointer-events-none relative -mt-24 md:-mt-32 pb-10 md:pb-20">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <motion.div
          className="relative mx-auto h-56 md:h-72 max-w-6xl"
          style={{ perspective: 1000 }}
          animate={{
            rotateX: [10, 8, 10],
            rotateY: [-8, 8, -8],
            rotateZ: [0.6, -0.6, 0.6],
            y: [0, -6, 0],
          }}
          transition={{ duration: 1.1, ease: "linear", repeat: Infinity }}
        >
          <motion.svg
            aria-hidden
            className="absolute inset-0 size-full"
            viewBox="0 0 320 210"
            preserveAspectRatio="xMidYMid meet"
            style={{ transformStyle: "preserve-3d" }}
          >
            <defs>
              <marker id="hero-pricing-arrow-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(216,255,69,0.95)" />
              </marker>
              <linearGradient id="hero-pricing-arrow-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="38%" stopColor="rgba(216,255,69,0.85)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.14)" />
              </linearGradient>
            </defs>

            <motion.circle
              cx="60"
              cy="44"
              animate={{ r: [4, 6, 4], opacity: [0.65, 1, 0.65] }}
              transition={{ duration: 1.1, ease: "linear", repeat: Infinity }}
              fill="rgba(216,255,69,0.85)"
            />

            <motion.path
              d="M60 44 C 140 18, 160 84, 112 104 C 56 128, 122 184, 206 142 C 252 118, 278 136, 296 186"
              stroke="url(#hero-pricing-arrow-grad)"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#hero-pricing-arrow-head)"
              strokeDasharray="30 20"
              animate={{ strokeDashoffset: [0, -110] }}
              transition={{ duration: 1.1, ease: "linear", repeat: Infinity }}
              style={{ filter: "drop-shadow(0 0 26px rgba(216,255,69,0.22))" }}
            />
          </motion.svg>
        </motion.div>
      </div>
    </div>
  );
}

function PlansSection({
  eyebrow,
  title,
  description,
  plans = [],
  planGroups,
  tone = "default",
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  plans?: CategoryPlan[];
  planGroups?: CategoryPlanGroup[];
  tone?: "default" | "darker";
}) {
  type UIPlan = CategoryPlan & {
    uiKey: string;
    displayPrice: string;
    displaySuffix: string;
    periodLabel?: string;
    ctaHref: string;
    ctaLabel: string;
  };

  const isPriceCustom = (price: string) => price === "Custom" || price === "Contact!" || price === "Free";

  const groups = useMemo<CategoryPlanGroup[]>(
    () =>
      planGroups?.length
        ? planGroups
        : [
            {
              id: "default",
              label: "Plans",
              plans,
            },
          ],
    [planGroups, plans],
  );
  const [group, setGroup] = useState<string>(groups[0]?.id ?? "default");
  const [billing, setBilling] = useState<Billing>("monthly");

  const activeGroup = useMemo(() => groups.find((g) => g.id === group) ?? groups[0], [groups, group]);
  const activePlans = useMemo(() => activeGroup?.plans ?? [], [activeGroup]);
  const pricingMode = activeGroup?.pricingMode ?? "toggle";

  const uiPlans = useMemo<UIPlan[]>(
    () => {
      if (pricingMode === "both") {
        return activePlans.flatMap((p) => [
          {
            ...p,
            uiKey: `${p.name}-weekly`,
            periodLabel: "Weekly",
            badge: "Weekly",
            displayPrice: p.priceWeekly,
            displaySuffix: isPriceCustom(p.priceWeekly) ? "" : "/ week",
            features: p.featuresWeekly ?? p.features,
            ctaHref: p.ctaHrefWeekly ?? p.ctaHref ?? "#contact",
            ctaLabel: p.ctaLabel ?? "Get Started",
          },
          {
            ...p,
            uiKey: `${p.name}-monthly`,
            periodLabel: "Monthly",
            badge: "Monthly",
            displayPrice: p.priceMonthly,
            displaySuffix: isPriceCustom(p.priceMonthly) ? "" : "/ month",
            features: p.featuresMonthly ?? p.features,
            ctaHref: p.ctaHrefMonthly ?? p.ctaHref ?? "#contact",
            ctaLabel: p.ctaLabel ?? "Get Started",
          },
        ]);
      }
      return activePlans.map((p) => {
        const activePrice = billing === "weekly" ? p.priceWeekly : p.priceMonthly;
        return {
          ...p,
          uiKey: p.name,
          periodLabel: undefined,
          displayPrice: activePrice,
          displaySuffix: isPriceCustom(activePrice) ? "" : billing === "weekly" ? "/ week" : "/ month",
          features: billing === "weekly" ? (p.featuresWeekly ?? p.features) : (p.featuresMonthly ?? p.features),
          ctaHref:
            billing === "weekly"
              ? p.ctaHrefWeekly ?? p.ctaHref ?? "#contact"
              : p.ctaHrefMonthly ?? p.ctaHref ?? "#contact",
          ctaLabel: p.ctaLabel ?? "Get Started",
        };
      });
    },
    [activePlans, billing, pricingMode],
  );

  const gridClassName =
    uiPlans.length === 1
      ? "mt-16 grid gap-6 md:grid-cols-1 max-w-xl mx-auto"
      : uiPlans.length === 2
        ? "mt-16 grid gap-6 md:grid-cols-2"
        : "mt-16 grid gap-6 md:grid-cols-3";

  return (
    <section id="pricing" className="relative py-24 md:py-32 overflow-hidden">
      {tone === "darker" && <div className="pointer-events-none absolute inset-0 bg-black/25" />}
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]" />
            {eyebrow}
          </div>
          <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-gradient">{title}</h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {groups.length > 1 && (
          <PlanGroupToggle
            value={group}
            options={groups.map((g) => ({ id: g.id, label: g.label }))}
            onChange={setGroup}
          />
        )}
        {pricingMode === "toggle" && (
          <BillingToggle value={billing} onChange={setBilling} className={groups.length > 1 ? "mt-4" : "mt-10"} />
        )}

        <div className={gridClassName}>
          {uiPlans.map((p, i) => (
            <motion.div
              key={p.uiKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative flex h-full flex-col rounded-2xl border p-6 sm:p-8 backdrop-blur-xl transition-all hover:-translate-y-1 ${
                p.highlight
                  ? "border-accent/50 bg-gradient-to-b from-accent/[0.08] to-surface/60 shadow-[0_0_60px_-10px_var(--glow)]"
                  : "border-border bg-surface/50"
              }`}
            >
              {(p.badge || p.highlight) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-lg bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                  {p.badge ?? "Best Value"}
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.tag}</div>
                {p.periodLabel && <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.periodLabel}</div>}
              </div>
              <h3 className="mt-2 text-2xl font-semibold">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-semibold text-gradient">{p.displayPrice}</span>
                {p.displaySuffix && <span className="text-sm text-muted-foreground">{p.displaySuffix}</span>}
              </div>
              <ul className="mt-8 space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-accent shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <a
                  href={p.ctaHref}
                  target={/^https?:\/\//.test(p.ctaHref) ? "_blank" : undefined}
                  rel={/^https?:\/\//.test(p.ctaHref) ? "noreferrer" : undefined}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
                    p.highlight
                      ? "bg-accent text-accent-foreground hover:shadow-[0_0_30px_var(--glow)]"
                      : "border border-border bg-surface hover:border-white/20"
                  }`}
                >
                  {p.ctaLabel} <ArrowRight className="size-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ContactCTA() {
  return (
    <section id="contact" className="relative py-24 md:py-32">
      <Container className="max-w-[1560px] 2xl:max-w-[1720px] lg:px-12 2xl:px-16">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-surface/50 backdrop-blur-xl p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Contact</div>
              <h3 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">Tell us what you want to build.</h3>
              <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
                Share your goal and timeline — we’ll reply with a clear plan, pricing, and next steps.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <a
                href="mailto:hello@soulai.dev"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:shadow-[0_0_30px_var(--glow)] transition-all active:scale-[0.98]"
              >
                Email Us
              </a>
              <a
                href="/#contact"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background/40 px-6 py-3 text-sm font-semibold text-foreground hover:border-white/20 transition-all active:scale-[0.98]"
              >
                Full Inquiry Form
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function SoulAICategoryPage({
  heroEyebrow,
  heroTitle,
  heroDescription,
  pricingEyebrow,
  pricingTitle,
  pricingDescription,
  plans,
  planGroups,
  showHeroPricingArrow,
  pricingTone = "default",
  abovePricing,
}: {
  heroEyebrow: string;
  heroTitle: ReactNode;
  heroDescription: string;
  pricingEyebrow: string;
  pricingTitle: ReactNode;
  pricingDescription: string;
  plans?: CategoryPlan[];
  planGroups?: CategoryPlanGroup[];
  showHeroPricingArrow?: boolean;
  pricingTone?: "default" | "darker";
  abovePricing?: ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <SoulAINavbar mode="page" />
      <CategoryHero eyebrow={heroEyebrow} title={heroTitle} description={heroDescription} />
      {showHeroPricingArrow && <HeroPricingArrow />}
      {abovePricing}
      <PlansSection
        eyebrow={pricingEyebrow}
        title={pricingTitle}
        description={pricingDescription}
        plans={plans}
        planGroups={planGroups}
        tone={pricingTone}
      />
      <ContactCTA />
      <SoulAIFooter />
    </main>
  );
}
