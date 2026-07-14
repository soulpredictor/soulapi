import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Github, Instagram, Linkedin, MessageCircle, Menu, X, Sparkles, Youtube } from "lucide-react";

function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>;
}

type NavMode = "landing" | "page";

function NavLinks({ mode, onNavigate }: { mode: NavMode; onNavigate?: () => void }) {
  const items =
    mode === "landing"
      ? [
          { label: "Home", kind: "hash" as const, href: "#home" },
          { label: "Services", kind: "hash" as const, href: "#services" },
          { label: "Projects", kind: "hash" as const, href: "#projects" },
          { label: "Stake Tools", kind: "route" as const, to: "/stake-tools" },
          { label: "WebServices", kind: "route" as const, to: "/web-services" },
          { label: "Custom", kind: "route" as const, to: "/custom" },
          { label: "About", kind: "hash" as const, href: "#about" },
          { label: "Contact", kind: "hash" as const, href: "#contact" },
        ]
      : [
          { label: "Home", kind: "route" as const, to: "/" },
          { label: "Stake Tools", kind: "route" as const, to: "/stake-tools" },
          { label: "WebServices", kind: "route" as const, to: "/web-services" },
          { label: "Custom", kind: "route" as const, to: "/custom" },
          { label: "Contact", kind: "hash" as const, href: "/#contact" },
        ];

  return (
    <>
      {items.map((item) =>
        item.kind === "hash" ? (
          <a
            key={`${item.kind}-${item.href}`}
            href={item.href}
            onClick={onNavigate}
            className="group relative rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground active:scale-[0.98]"
          >
            {item.label}
            <span className="pointer-events-none absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
          </a>
        ) : (
          <Link
            key={`${item.kind}-${item.to}`}
            to={item.to}
            onClick={onNavigate}
            className="group relative rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground active:scale-[0.98]"
          >
            {item.label}
            <span className="pointer-events-none absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
          </Link>
        ),
      )}
    </>
  );
}

export function SoulAINavbar({ mode = "page" }: { mode?: NavMode }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "py-3.5" : "py-5"}`}
    >
      <Container>
        <div
          className={`mx-auto flex w-full max-w-5xl items-center justify-between rounded-2xl border border-border px-4 py-3 transition-all duration-300 ${
            scrolled ? "bg-background/80 backdrop-blur-2xl shadow-elegant" : "bg-surface/30 backdrop-blur-md"
          }`}
        >
          {mode === "landing" ? (
            <a href="#home" className="flex items-center gap-2 pl-2">
              <div className="size-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                <img src="/favicon.ico" alt="Logo" className="w-[130%] h-[130%] object-cover" />
              </div>
              <span className="font-display text-lg font-semibold tracking-tight">SoulAI</span>
            </a>
          ) : (
            <Link to="/" className="flex items-center gap-2 pl-2">
              <div className="size-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                <img src="/favicon.ico" alt="Logo" className="w-[130%] h-[130%] object-cover" />
              </div>
              <span className="font-display text-lg font-semibold tracking-tight">SoulAI</span>
            </Link>
          )}
          <nav className="hidden md:flex items-center gap-1">
            <NavLinks mode={mode} />
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/panel"
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:shadow-[0_0_30px_var(--glow)] hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Stake Panel
              <ArrowUpRight className="size-4" />
            </Link>
            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden grid place-items-center size-10 rounded-xl border border-border bg-surface/50 active:scale-[0.98]"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="md:hidden mt-2 rounded-2xl border border-border bg-background/90 backdrop-blur-xl p-4"
            >
              <div className="flex flex-col">
                <NavLinks
                  mode={mode}
                  onNavigate={() => {
                    setOpen(false);
                  }}
                />
                <Link
                  to="/panel"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
                >
                  Stake Panel
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </motion.header>
  );
}

export function SoulAIFooter() {
  return (
    <footer className="relative pt-20 pb-10 border-t border-border/60 mt-10" style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}>
      <Container>
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                <img src="/favicon.ico" alt="Logo" className="w-[130%] h-[130%] object-cover" />
              </div>
              <span className="font-display text-lg font-semibold">SoulAI</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Premium AI development studio building websites, automation and custom software for the next generation of
              companies.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[Github, Linkedin, Instagram, MessageCircle, Youtube].map((I, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="grid size-9 place-items-center rounded-xl border border-border bg-surface/50 text-muted-foreground hover:text-accent hover:border-accent/50 hover:shadow-[0_0_20px_var(--glow)] transition-all"
                >
                  <I className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { h: "Company", l: ["Home", "About", "Contact"] },
            { h: "Services", l: ["Stake Tools", "WebServices", "Custom"] },
            { h: "Resources", l: ["Projects", "Stake Panel"] },
          ].map((col) => (
            <div key={col.h}>
              <h4 className="text-sm font-semibold">{col.h}</h4>
              <ul className="mt-4 space-y-2">
                {col.l.map((i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>



        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SoulAI. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Cookies
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
