import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Globe,
  Bot,
  Gamepad2,
  Code2,
  MessageSquare,
  Instagram,
  Briefcase,
  Palette,
  Zap,
  Shield,
  Rocket,
  Search,
  Wallet,
  Headphones,
  Smartphone,
  Layers,
  Github,
  Linkedin,
  Youtube,
  Check,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Star,
  Play,
  Send,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SoulAIFooter, SoulAINavbar } from "@/components/soulai/SoulAIChrome";

/* ------------------------------------------------------------------ */
/*  Primitives                                                         */
/* ------------------------------------------------------------------ */

function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>;
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`flex flex-col ${align === "center" ? "items-center text-center" : "items-start text-left"} gap-5 max-w-3xl ${align === "center" ? "mx-auto" : ""}`}>
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]" />
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-gradient"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-base md:text-lg text-muted-foreground leading-relaxed"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

function GlowButton({
  children,
  variant = "primary",
  href,
  className = "",
  onClick,
  type,
  target,
  rel,
}: {
  children: ReactNode;
  variant?: "primary" | "ghost";
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  target?: string;
  rel?: string;
}) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 will-change-transform active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? "bg-accent text-accent-foreground hover:shadow-[0_0_40px_var(--glow)] hover:-translate-y-0.5"
      : "border border-border bg-surface/40 text-foreground backdrop-blur hover:bg-surface hover:border-white/20";
  const cls = `${base} ${styles} ${className}`;
  const inner = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <ArrowRight className="relative z-10 size-4 transition-transform group-hover:translate-x-0.5" />
    </>
  );
  if (href) {
    return (
      <a href={href} className={cls} target={target} rel={rel}>
        {inner}
      </a>
    );
  }
  return (
    <button type={type ?? "button"} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-xl border border-border bg-surface/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:-translate-y-1 hover:shadow-elegant ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cursor / scroll globals                                            */
/* ------------------------------------------------------------------ */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left bg-accent shadow-[0_0_10px_var(--glow)]"
    />
  );
}

function CursorGlow() {
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);
  const tx = useSpring(x, { stiffness: 200, damping: 25 });
  const ty = useSpring(y, { stiffness: 200, damping: 25 });
  return (
    <motion.div
      aria-hidden
      style={{ left: tx, top: ty }}
      className="pointer-events-none fixed z-[55] hidden lg:block -translate-x-1/2 -translate-y-1/2 size-[380px] rounded-[50%] opacity-40"
    >
      <div className="size-full rounded-full bg-[radial-gradient(circle,rgba(216,255,69,0.18),transparent_60%)]" />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useTransform(my, [-1, 1], [8, -8]);
  const ry = useTransform(mx, [-1, 1], [-8, 8]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      mx.set(x * 2);
      my.set(y * 2);
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, [mx, my]);

  return (
    <section id="home" ref={ref} className="relative overflow-hidden pt-28 pb-16 md:pt-48 md:pb-32 grain">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[900px] rounded-[50%] bg-[radial-gradient(circle,rgba(216,255,69,0.15),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-40 size-[500px] rounded-[50%] bg-[radial-gradient(circle,rgba(120,120,255,0.10),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 size-[600px] rounded-[50%] bg-[radial-gradient(circle,rgba(216,255,69,0.10),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[45vw] bg-[radial-gradient(circle_at_20%_40%,rgba(216,255,69,0.10),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[45vw] bg-[radial-gradient(circle_at_80%_45%,rgba(216,255,69,0.08),transparent_60%)]" />

      <Container className="relative max-w-[1560px] 2xl:max-w-[1720px] px-4 sm:px-6 lg:px-12 2xl:px-16">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-16 items-center">
          {/* Left */}
          <div className="flex flex-col gap-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
            >
              <span className="relative flex size-2">
                <span className="absolute inset-0 rounded-full bg-accent opacity-60 animate-ping" />
                <span className="relative size-2 rounded-full bg-accent" />
              </span>
              New — AI Automation Systems for 2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight"
            >
              <span className="text-gradient">AI-Powered Digital</span>
              <br />
              <span className="text-gradient">Solutions Built To</span>{" "}
              <span className="text-accent-gradient">Scale.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              We design and engineer premium websites, AI automation, Stake tools, Discord bots, custom
              software, and digital growth systems for ambitious brands.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              {["Senior team", "Fast delivery", "Clear process"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/40 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
                >
                  <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]" />
                  {t}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <GlowButton href="https://t.me/oglibe" target="_blank" rel="noopener noreferrer">
                <Send className="size-4" />
                Telegram
              </GlowButton>
              <GlowButton href="/stake-tools" variant="ghost">
                Stake Tools
              </GlowButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-6 pt-6 max-w-md"
            >
              {[
                { k: "500+", v: "Clients" },
                { k: "9.8/10", v: "Trust Score" },
                { k: "Earliest", v: "Delivery Time" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="text-2xl font-semibold text-foreground">{s.k}</div>
                  <div className="text-xs text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — floating dashboard */}
          <motion.div
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
            className="relative h-[560px] hidden md:block"
          >
            {/* Ring */}
            <div className="absolute inset-4 rounded-2xl border border-white/5" />
            <div className="absolute inset-14 rounded-2xl border border-white/5" />

            {/* Main card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 top-10 w-[86%] rounded-2xl border border-border bg-surface/80 backdrop-blur-xl p-5 shadow-elegant"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <Bot className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">SoulAI Agent</div>
                    <div className="text-[10px] text-muted-foreground">Live • Processing</div>
                  </div>
                </div>
                <div className="text-[10px] text-accent">● Online</div>
              </div>
              <div className="mt-4 space-y-2">
                {[70, 45, 90, 62].map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${w}%` }}
                        transition={{ delay: 0.6 + i * 0.15, duration: 1 }}
                        className="h-full rounded-full bg-gradient-to-r from-accent to-accent/60"
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">{w}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { k: "Trust Score", v: "9.8/10" },
                  { k: "500+ Clients", v: "Delivered" },
                  { k: "Delivery", v: "48h avg" },
                ].map((item) => (
                  <div key={item.k} className="rounded-xl border border-border bg-background/40 p-2">
                    <div className="text-[10px] text-muted-foreground">{item.k}</div>
                    <div className="text-sm font-semibold text-accent">{item.v}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Secondary card */}
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-0 bottom-14 w-[72%] rounded-2xl border border-border bg-background/70 backdrop-blur-xl p-5 shadow-elegant"
            >
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-accent" />
                <span className="text-xs font-semibold">SoulAI Services</span>
              </div>
              <div className="mt-3 space-y-2 text-[11px]">
                {["Custom Websites & Apps", "Stake Predictor Tools", "Discord & TG Bots", "Digital Growth Systems"].map((t, i) => (
                  <div key={t} className="flex items-center gap-2">
                    <div className="grid size-5 place-items-center rounded-full bg-accent text-accent-foreground">
                      <Check className="size-3" />
                    </div>
                    <span className="text-muted-foreground">{t}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating pill */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-0 top-4 rounded-xl border border-border bg-surface/80 backdrop-blur px-4 py-2 shadow-elegant flex items-center gap-2"
            >
              <Sparkles className="size-3.5 text-accent" />
              <span className="text-xs font-medium">GPT-5 Ready</span>
            </motion.div>

            {/* Glow */}
            <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_50%_50%,rgba(216,255,69,0.12),transparent_60%)] blur-2xl -z-10" />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trusted by                                                         */
/* ------------------------------------------------------------------ */

const LOGOS = ["Trusted By Rajasthan Police", "Trusted By Nagpur Police", "Trusted By Vigilant Forensics", "3 Years Experience", "10+ Highly Skilled Members", "48h Delivery", "Affordable Plans"];

function TrustedBy() {
  return (
    <section className="relative py-16 border-y border-border/60 overflow-hidden">
      <Container>
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-10">
          Recognised and trusted
        </p>
      </Container>
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee gap-16 w-max">
          {[...LOGOS, ...LOGOS, ...LOGOS].map((l, i) => (
            <span
              key={i}
              className="font-display text-2xl md:text-3xl font-semibold text-muted-foreground/70 hover:text-foreground transition-colors whitespace-nowrap"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Services                                                           */
/* ------------------------------------------------------------------ */

const SERVICES = [
  {
    icon: Globe,
    title: "Custom Websites",
    desc: "Blazing-fast landing pages, business sites, and ecommerce experiences.",
    features: ["Landing Pages", "Business Sites", "Ecommerce", "Next.js", "Custom CMS"],
  },
  {
    icon: Gamepad2,
    title: "Stake Tools",
    desc: "Mines, Crash, analytics and Discord-integrated automation suites.",
    features: ["Mines Tools", "Crash Tools", "Discord Integration", "Analytics", "API"],
  },
  {
    icon: Bot,
    title: "AI Automation",
    desc: "Custom chatbots, agents, CRM and lead-gen workflows that scale.",
    features: ["AI Chatbots", "AI Agents", "CRM Automation", "Lead Gen", "Workflows"],
  },
  {
    icon: Code2,
    title: "Custom Software",
    desc: "Web apps, desktop tools, ERP, POS, and internal dashboards.",
    features: ["Web Apps", "Desktop Apps", "ERP · POS", "Dashboards", "Internal Tools"],
  },
  {
    icon: MessageSquare,
    title: "Discord Development",
    desc: "Bots, verification, tickets, moderation, economy, custom APIs.",
    features: ["Bots", "Tickets", "Moderation", "Economy", "Custom APIs"],
  },
  {
    icon: Instagram,
    title: "Social Media",
    desc: "Content strategy, branding and growth systems across platforms.",
    features: ["Strategy", "Branding", "Instagram", "YouTube", "Analytics"],
  },
  {
    icon: Briefcase,
    title: "Upwork Services",
    desc: "Profile optimization, proposals, agency setup and lead systems.",
    features: ["Profiles", "Proposals", "Lead Gen", "Automation", "Agency Setup"],
  },
  {
    icon: Palette,
    title: "UI / UX Design",
    desc: "Mobile & web apps, dashboards, wireframes and prototypes.",
    features: ["Mobile Apps", "Web Apps", "Dashboards", "Wireframes", "Prototypes"],
  },
];

function Services() {
  return (
    <section id="services" className="relative py-24 md:py-32">
      <Container className="max-w-[1560px] 2xl:max-w-[1720px] lg:px-12 2xl:px-16">
        <SectionHeading
          eyebrow="What we do"
          title={<>Services engineered for scale.</>}
          description="Full-stack capabilities across product, AI, and growth — delivered by a senior team."
        />
        <div className="mt-16 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:gap-8">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
            >
              <GlassCard className="h-full min-h-[380px] flex flex-col group p-7">
                <div className="mb-5 grid size-12 place-items-center rounded-lg bg-accent/10 border border-accent/20 text-accent transition-all group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-[0_0_20px_var(--glow)]">
                  <s.icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                <ul className="mt-5 space-y-2">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="size-3.5 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="mt-auto pt-6 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:gap-2 transition-all"
                >
                  Learn more <ArrowRight className="size-3.5" />
                </a>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Why SoulAI                                                         */
/* ------------------------------------------------------------------ */

const WHY = [
  { icon: Rocket, title: "Fast Delivery", desc: "Ship in weeks, not quarters." },
  { icon: Palette, title: "Modern Design", desc: "Premium, tasteful, on-brand." },
  { icon: Search, title: "SEO Optimized", desc: "Rank higher out of the box." },
  { icon: Bot, title: "AI Powered", desc: "Automation baked into every workflow." },
  { icon: Wallet, title: "Affordable", desc: "Startup-friendly pricing." },
  { icon: Headphones, title: "Lifetime Support", desc: "Real humans, real fast." },
  { icon: Smartphone, title: "Responsive", desc: "Pixel-perfect on every device." },
  { icon: Layers, title: "Scalable", desc: "Built on modern architecture." },
  { icon: Shield, title: "Secure", desc: "Enterprise-grade by default." },
];

function WhySoulAI() {
  return (
    <section id="about" className="relative py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Why SoulAI"
          title={<>Everything you need. Nothing you don't.</>}
          description="We combine product engineering, AI, and design under one roof — so you ship faster with less overhead."
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
            >
              <GlassCard className="h-full">
                <div className="flex items-start gap-4">
                  <div className="grid size-11 place-items-center rounded-xl bg-surface-2 border border-border text-accent shrink-0">
                    <w.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{w.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Projects                                                           */
/* ------------------------------------------------------------------ */

const PROJECTS = [
  { title: "Soul Predictor", cat: "AI Tool", stack: ["Next.js", "Python", "OpenAI"], color: "from-accent/30 to-transparent", image: "/image.png" },
  { title: "Stake Dashboard", cat: "Analytics", stack: ["React", "Node.js", "Redis"], color: "from-blue-500/25 to-transparent", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" },
  { title: "Restaurant Website", cat: "Website", stack: ["Next.js", "Sanity"], color: "from-orange-500/25 to-transparent", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800" },
  { title: "AI Chatbot", cat: "AI", stack: ["Anthropic", "Node.js"], color: "from-purple-500/25 to-transparent", image: "/chatbot.png" },
  { title: "Crypto Landing", cat: "Website", stack: ["Framer", "Tailwind"], color: "from-emerald-500/25 to-transparent", image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=800" },
  { title: "Portfolio Website", cat: "Design", stack: ["Next.js", "GSAP"], color: "from-pink-500/25 to-transparent", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" },
];

const CATS = ["All", "Website", "AI", "AI Tool", "Analytics", "Design"];

function Projects() {
  const [filter, setFilter] = useState("All");
  const list = PROJECTS.filter((p) => filter === "All" || p.cat === filter);
  return (
    <section id="projects" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 size-[900px] rounded-[50%] bg-[radial-gradient(circle,rgba(216,255,69,0.10),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 size-[700px] rounded-[50%] bg-[radial-gradient(circle,rgba(120,120,255,0.10),transparent_60%)] blur-3xl" />
      <Container className="max-w-[1560px] 2xl:max-w-[1720px] lg:px-12 2xl:px-16">
        <SectionHeading
          eyebrow="Featured work"
          title={<>Projects we're proud of.</>}
          description="A snapshot of recent builds across AI, product, and growth."
        />
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                filter === c
                  ? "bg-accent text-accent-foreground border-accent shadow-[0_0_20px_var(--glow)]"
                  : "border-border bg-surface/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-12 grid gap-5 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <motion.div
                key={p.title}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <GlassCard className="overflow-hidden p-0 group">
                  <div className={`relative h-56 bg-gradient-to-br ${p.color} border-b border-border overflow-hidden`}>
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <span className="absolute top-3 left-3 rounded-lg bg-background/70 backdrop-blur px-2.5 py-1 text-[10px] font-medium text-foreground border border-border z-10">
                      {p.cat}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold">{p.title}</h3>
                      <ArrowUpRight className="size-4 text-muted-foreground transition-all group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Premium build shipped end-to-end by SoulAI.</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.stack.map((t) => (
                        <span key={t} className="rounded-lg border border-border bg-surface-2 px-2.5 py-0.5 text-[10px] text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Process timeline                                                   */
/* ------------------------------------------------------------------ */

const PROCESS = [
  "Discovery",
  "Planning",
  "Wireframing",
  "UI Design",
  "Development",
  "Testing",
  "Deployment",
  "Support",
];

function Process() {
  return (
    <section className="relative py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="How we work"
          title={<>A process built for speed & precision.</>}
          description="Every project follows a proven 8-step system — no guesswork, no wasted cycles."
        />
        <div className="mt-14">
          <div className="relative max-w-6xl 2xl:max-w-7xl mx-auto">
            <div className="pointer-events-none absolute -inset-20 bg-[radial-gradient(circle_at_50%_0%,rgba(216,255,69,0.08),transparent_60%)] blur-3xl -z-10" />

            <div className="relative hidden md:block">
              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full text-accent/55"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <marker id="process-flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                  </marker>
                  <linearGradient id="process-flow-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.18" />
                  </linearGradient>
                </defs>
                {[
                  "M30 18 C 38 18, 44 24, 50 32",
                  "M70 18 C 62 18, 56 24, 50 32",
                  "M50 34 C 44 40, 38 46, 30 54",
                  "M50 34 C 56 40, 62 46, 70 54",
                  "M30 54 C 38 54, 44 62, 50 72",
                  "M70 54 C 62 54, 56 62, 50 72",
                  "M50 74 C 44 80, 38 86, 30 88",
                  "M50 74 C 56 80, 62 86, 70 88",
                ].map((d) => (
                  <path
                    key={d}
                    d={d}
                    stroke="url(#process-flow-gradient)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                    markerEnd="url(#process-flow-arrow)"
                  />
                ))}
              </svg>

              <div className="grid grid-cols-3 grid-rows-5 gap-x-14 gap-y-10 items-stretch">
                {PROCESS.map((step, i) => {
                  const pos =
                    i === 0
                      ? "col-start-1 row-start-1"
                      : i === 1
                        ? "col-start-3 row-start-1"
                        : i === 2
                          ? "col-start-2 row-start-2"
                          : i === 3
                            ? "col-start-1 row-start-3"
                            : i === 4
                              ? "col-start-3 row-start-3"
                              : i === 5
                                ? "col-start-2 row-start-4"
                                : i === 6
                                  ? "col-start-1 row-start-5"
                                  : "col-start-3 row-start-5";
                  return (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.45, delay: i * 0.02 }}
                      className={`${pos} relative`}
                    >
                      <GlassCard className="h-full min-h-[160px] p-7">
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <div className="text-xs text-accent font-semibold tracking-wider">
                              STEP {String(i + 1).padStart(2, "0")}
                            </div>
                            <h3 className="mt-2 text-2xl font-semibold">{step}</h3>
                          </div>
                          <div className="text-4xl font-semibold tracking-tight text-accent/15">
                            {String(i + 1).padStart(2, "0")}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          We collaborate closely to keep momentum high and quality higher.
                        </p>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="md:hidden space-y-6">
              {PROCESS.map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: i * 0.02 }}
                >
                  <GlassCard className="min-h-[150px] p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="text-xs text-accent font-semibold tracking-wider">
                          STEP {String(i + 1).padStart(2, "0")}
                        </div>
                        <h3 className="mt-2 text-2xl font-semibold">{step}</h3>
                      </div>
                      <div className="text-4xl font-semibold tracking-tight text-accent/15">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      We collaborate closely to keep momentum high and quality higher.
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Tech stack                                                         */
/* ------------------------------------------------------------------ */

const TECH = [
  "Next.js", "React", "TypeScript", "Python", "Flask", "Node.js", "Express",
  "MongoDB", "PostgreSQL", "Supabase", "Firebase", "Docker", "Redis",
  "Cloudflare", "AWS", "OpenAI", "Anthropic", "Tailwind", "Framer Motion", "GSAP",
];

function TechStack() {
  return (
    <section className="relative py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Our stack"
          title={<>Modern tools. Battle-tested.</>}
          description="We use the same tools trusted by top engineering teams worldwide."
        />
        <div className="mt-14 flex flex-wrap justify-center gap-3">
          {TECH.map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.02 }}
              className="rounded-xl border border-border bg-surface/50 backdrop-blur px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-accent/40 hover:shadow-[0_0_20px_var(--glow)] transition-all cursor-default"
            >
              {t}
            </motion.span>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min((t - start) / 1600, 1);
          setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    if (ref.current) io.observe(ref.current);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [to]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

function Stats() {
  const items = [
    { n: 100, suffix: "+", label: "Projects Completed" },
    { n: 50, suffix: "+", label: "Happy Clients" },
    { n: 95, suffix: "%", label: "Client Satisfaction" },
    { n: 24, suffix: "/7", label: "Support" },
    { n: 3, suffix: "+", label: "Years Experience" },
  ];
  return (
    <section className="relative py-20">
      <Container>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-surface/70 to-background/40 backdrop-blur-xl p-8 md:p-14 grain">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {items.map((s) => (
              <div key={s.label}>
                <div className="text-4xl md:text-5xl font-semibold text-accent-gradient">
                  <Counter to={s.n} suffix={s.suffix} />
                </div>
                <div className="mt-2 text-xs md:text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials                                                       */
/* ------------------------------------------------------------------ */

const TESTIMONIALS = [
  { name: "Alex Rivera", role: "CEO, Northwind", quote: "SoulAI shipped our platform in 3 weeks. Design and engineering both top-tier." },
  { name: "Priya Shah", role: "Founder, Cinder", quote: "The AI automation alone saved us 40 hours per week. Wildly professional team." },
  { name: "Marcus Lee", role: "CTO, Draftly", quote: "Best agency I've worked with in 10 years. They own the outcome, not the ticket." },
  { name: "Elena Popov", role: "Head of Growth, Loop", quote: "Traffic doubled in two months after our SoulAI rebuild. Numbers don't lie." },
  { name: "Jamal Carter", role: "Product Lead, Vella", quote: "Design felt like Linear, but tailored to our brand. Team was a joy to work with." },
  { name: "Sofia Ramirez", role: "COO, Beacon", quote: "Our Discord bot went from an idea to production in under a week. Insane pace." },
];

function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <Container>
        <SectionHeading
          eyebrow="Client love"
          title={<>Trusted by teams worldwide.</>}
          description="We measure success in outcomes, not deliverables. Here's what our partners say."
        />
      </Container>
      <div className="mt-14 relative">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex gap-5 animate-marquee w-max px-5" style={{ animationDuration: "60s" }}>
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <div key={i} className="w-[360px] shrink-0">
              <GlassCard>
                <div className="flex items-center gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-4 fill-accent" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-accent/15 text-accent font-semibold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

const FAQ = [
  { q: "How long does a project take?", a: "Most websites launch in 2–4 weeks. Custom software and AI systems typically run 4–10 weeks depending on scope." },
  { q: "Do you provide hosting?", a: "Yes — we deploy to Vercel, Cloudflare, or your preferred infrastructure, and can manage hosting for you." },
  { q: "Will my website be SEO optimized?", a: "Every project ships with technical SEO, structured data, sitemaps, and Core Web Vitals tuning by default." },
  { q: "Can I request custom software?", a: "Absolutely. Web apps, desktop tools, ERPs, POS systems and internal dashboards are our specialty." },
  { q: "Do you offer ongoing support?", a: "Yes. All clients get post-launch support, and monthly retainers are available for continuous improvement." },
  { q: "Can I hire you monthly?", a: "We offer flexible monthly retainers for teams that need continuous design, engineering, or AI work." },
];

const STAKE_FAQ = [
  { q: "What are the prices?", a: "Check out our Stake tools section for detailed pricing on all plans." },
  { q: "How much accuracy?", a: "Our AI predictor achieves up to 98.7% accuracy on tested game modes." },
  { q: "Where to do payment?", a: "Payments are processed securely via Crypto and other supported methods through our automated bot." },
  { q: "Is it legit / safe?", a: "Yes, our systems are built with security first. We have over 500+ satisfied clients and a 9.8/10 Trust Score." },
  { q: "How do I contact admin?", a: "You can reach out to our admin directly on Telegram via @iorpx." },
  { q: "Free trials?", a: "Yes! Get your free trial by messaging our bot on Telegram at @soulpredictor_bot." },
];

/* ------------------------------------------------------------------ */
/*  Contact                                                            */
/* ------------------------------------------------------------------ */

function Contact() {
  const [faqTab, setFaqTab] = useState<"services" | "stake">("services");
  return (
    <section id="contact" className="relative py-24 md:py-32">
      <Container>
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent" />
              Let's build
            </span>
            <h2 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight text-gradient">
              Start your next
              <br />
              <span className="text-accent-gradient">breakthrough project.</span>
            </h2>
            <p className="mt-5 text-muted-foreground text-lg max-w-md leading-relaxed">
              Tell us about your goals. We'll respond within 24 hours with a plan and timeline.
            </p>
            <div className="mt-10 space-y-4">
              {[
                { icon: Mail, label: "soulgenzai@gmail.com", href: "mailto:soulgenzai@gmail.com" },
                { icon: Send, label: "t.me/iorpx", href: "https://t.me/iorpx" },
                { icon: Youtube, label: "youtube.com/@stakepredictorai", href: "https://youtube.com/@stakepredictorai" },
                { icon: MapPin, label: "California", href: null },
              ].map((c) => {
                const Wrapper = c.href ? "a" : "div";
                return (
                  <Wrapper 
                    key={c.label} 
                    href={c.href || undefined} 
                    target={c.href ? "_blank" : undefined} 
                    rel={c.href ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-3 ${c.href ? "hover:opacity-80 transition-opacity cursor-pointer" : ""}`}
                  >
                    <div className="grid size-10 place-items-center rounded-xl border border-border bg-surface/60 text-accent">
                      <c.icon className="size-4" />
                    </div>
                    <span className="text-sm text-foreground">{c.label}</span>
                  </Wrapper>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface/50 backdrop-blur-xl p-8 flex flex-col gap-6">
            <div className="flex gap-2 p-1.5 bg-background/50 rounded-xl w-fit border border-border">
              <button 
                onClick={() => setFaqTab("services")}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${faqTab === "services" ? "bg-accent text-accent-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
              >
                Services
              </button>
              <button 
                onClick={() => setFaqTab("stake")}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${faqTab === "stake" ? "bg-accent text-accent-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
              >
                Stake Query
              </button>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {(faqTab === "services" ? FAQ : STAKE_FAQ).map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="rounded-xl border border-border bg-surface/50 backdrop-blur px-6 data-[state=open]:border-accent/40 transition-colors"
                >
                  <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating CTA                                                       */
/* ------------------------------------------------------------------ */

function FloatingCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 800);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href="#contact"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_40px_var(--glow)] animate-pulse-glow"
        >
          <MessageCircle className="size-4" />
          Let's talk
        </motion.a>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SoulAILanding() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <ScrollProgress />
      <CursorGlow />
      <SoulAINavbar mode="landing" />
      <Hero />
      <TrustedBy />
      <Services />
      <WhySoulAI />
      <Projects />
      <Process />
      <TechStack />
      <Stats />
      <Testimonials />
      <Contact />
      <SoulAIFooter />
      <FloatingCTA />
    </main>
  );
}
