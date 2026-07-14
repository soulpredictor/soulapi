import { createFileRoute } from "@tanstack/react-router";
import SoulAICategoryPage, { type CategoryPlan } from "@/components/soulai/SoulAICategoryPage";

const PLANS: CategoryPlan[] = [
  {
    name: "AI Automation",
    tag: "For operations",
    priceWeekly: "$249",
    priceMonthly: "$899",
    features: [
      "Automation blueprint",
      "Workflow build + testing",
      "Tool integrations (Zapier/API)",
      "Weekly improvements",
      "Documentation included",
    ],
  },
  {
    name: "Bots + Community",
    tag: "Most popular",
    highlight: true,
    priceWeekly: "$349",
    priceMonthly: "$1,299",
    features: [
      "Discord bot + moderation tools",
      "Custom commands + roles",
      "Analytics + alerts",
      "Deploy + monitoring",
      "Weekly updates",
      "Priority support",
    ],
  },
  {
    name: "Custom Product",
    tag: "Build anything",
    priceWeekly: "Custom",
    priceMonthly: "Custom",
    features: [
      "Full-stack app development",
      "Architecture + roadmap",
      "Security + performance",
      "Team augmentation option",
      "SLA + dedicated support",
    ],
  },
];

export const Route = createFileRoute("/custom")({
  component: () => (
    <SoulAICategoryPage
      heroEyebrow="Custom Builds"
      heroTitle={
        <>
          <span className="text-gradient">AI, bots, apps</span> — built around your workflow.
        </>
      }
      heroDescription="From AI automations and social workflows to Discord bots and internal tools — we ship custom systems with clear deliverables."
      pricingEyebrow="Plans"
      pricingTitle={<>Custom pricing.</>}
      pricingDescription="Weekly and monthly options for recurring builds. For bigger scope, request a custom quote."
      plans={PLANS}
      showHeroPricingArrow
    />
  ),
  head: () => ({
    meta: [{ property: "og:url", content: "/custom" }],
    links: [{ rel: "canonical", href: "/custom" }],
  }),
});
