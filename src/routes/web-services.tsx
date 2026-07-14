import { createFileRoute } from "@tanstack/react-router";
import SoulAICategoryPage, { type CategoryPlan } from "@/components/soulai/SoulAICategoryPage";

const PLANS: CategoryPlan[] = [
  {
    name: "Web Launch",
    tag: "For fast shipping",
    priceWeekly: "$149",
    priceMonthly: "$549",
    features: [
      "High-converting landing page",
      "Mobile-first design",
      "Basic SEO + performance",
      "Analytics setup",
      "Weekly iteration cycle",
    ],
  },
  {
    name: "Growth Stack",
    tag: "Most popular",
    highlight: true,
    priceWeekly: "$299",
    priceMonthly: "$1,099",
    features: [
      "Multi-page website",
      "SEO + content structure",
      "Social media creatives pack",
      "Conversion tracking",
      "Weekly optimization",
      "Priority support",
    ],
  },
  {
    name: "Scale Suite",
    tag: "Teams & brands",
    priceWeekly: "Custom",
    priceMonthly: "Custom",
    features: [
      "Full web platform",
      "Design system + components",
      "Advanced SEO + technical audits",
      "Ongoing growth experiments",
      "Dedicated team",
    ],
  },
];

export const Route = createFileRoute("/web-services")({
  component: () => (
    <SoulAICategoryPage
      heroEyebrow="WebServices"
      heroTitle={
        <>
          <span className="text-gradient">Websites</span> that look premium and convert.
        </>
      }
      heroDescription="Design, development, SEO, and social-ready assets — delivered in a weekly rhythm with clear scope and measurable results."
      pricingEyebrow="Plans"
      pricingTitle={<>Web services pricing.</>}
      pricingDescription="Weekly or monthly plans for web, SEO, and social content. Pick a plan or request a custom scope."
      plans={PLANS}
      showHeroPricingArrow
    />
  ),
  head: () => ({
    meta: [{ property: "og:url", content: "/web-services" }],
    links: [{ rel: "canonical", href: "/web-services" }],
  }),
});
