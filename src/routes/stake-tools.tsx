import { createFileRoute } from "@tanstack/react-router";
import SoulAICategoryPage, { type CategoryPlan, type CategoryPlanGroup } from "@/components/soulai/SoulAICategoryPage";

const PREDICTOR_PLANS: CategoryPlan[] = [
  {
    name: "Free",
    tag: "Try predictors",
    badge: "Free",
    priceWeekly: "Free",
    priceMonthly: "Free",
    features: [
      "Limit: 4 times per 24 hours",
      "Success rate: 65–75%",
      "Includes: Crash, Mines, Blackjack, Moles",
    ],
  },
  {
    name: "Diamond",
    tag: "Most popular",
    badge: "Diamond",
    highlight: true,
    priceWeekly: "7.99€",
    priceWeeklyInr: "₹249",
    priceMonthly: "12.99€",
    priceMonthlyInr: "₹349",
    features: ["No usage limit"],
    featuresWeekly: [
      "No usage limit",
      "90% success rate",
      "Website panel access",
      "Includes: Mines, Crash, Blackjack, Moles",
      "Game predictor",
    ],
    featuresMonthly: [
      "No usage limit",
      "97% success rate",
      "Telegram VVIP channel access",
      "Discord channel access",
      "Direct support",
      "Website VVIP panel access",
      "Includes: Mines, Crash, Blackjack, Moles",
      "Game predictor",
    ],
    ctaHrefWeekly: "https://pay.oxapay.com/16579184",
    ctaHrefMonthly: "https://pay.oxapay.com/11522416",
  },
  {
    name: "Obsidian",
    tag: "Max performance",
    badge: "Obsidian",
    priceWeekly: "9.99€",
    priceWeeklyInr: "₹449",
    priceMonthly: "15.99€",
    priceMonthlyInr: "₹549",
    features: ["No usage limit"],
    featuresWeekly: [
      "No usage limit",
      "95% success rate",
      "Telegram VIP channel access",
      "Discord channel access",
      "Direct support",
      "Website panel access",
      "Includes: Mines, Crash, Blackjack, Moles",
      "Game predictor",
    ],
    featuresMonthly: [
      "No usage limit",
      "99% success rate",
      "Telegram VVIP channel access",
      "Discord channel access",
      "Direct support",
      "Website VVIP+ panel access",
      "Includes: Mines, Crash, Blackjack, Moles",
      "Game predictor",
    ],
    ctaHrefWeekly: "https://pay.oxapay.com/15532063",
    ctaHrefMonthly: "https://pay.oxapay.com/17254239",
  },
];

const PLAN_GROUPS: CategoryPlanGroup[] = [
  {
    id: "mines-larp",
    label: "Mines Larp",
    pricingMode: "both",
    plans: [
      {
        name: "Mines Larp",
        tag: "For mines sessions",
        priceWeekly: "Contact!",
        priceMonthly: "Contact!",
        ctaHref: "https://t.me/oglibe",
        features: [
          "Works on 1–24 Mines",
          "F3ke bet history feature",
          "F3ke deposit/withdrawal history",
          "100% replica of the actual game",
          "No deposit required",
          "F3ke balance included (works for Mines)",
          "PC & Mobile (any device)",
          "Set custom bombs/diamonds via website, TG bot, or extension settings",
        ],
      },
    ],
  },
  {
    id: "balance-larp",
    label: "Balance Larp",
    pricingMode: "both",
    plans: [
      {
        name: "Balance Larp",
        tag: "For balance strategies",
        priceWeekly: "Contact!",
        priceMonthly: "Contact!",
        ctaHref: "https://t.me/oglibe",
        features: [
          "Unlimited balance inject (non-withdrawable)",
          "Works in all originals",
          "Works in slots",
          "Supports original games + all currencies",
          "Fully automated balance injector (no manual setup)",
        ],
      },
    ],
  },
  {
    id: "predictors",
    label: "Predictors",
    pricingMode: "toggle",
    plans: PREDICTOR_PLANS,
  },
];

export const Route = createFileRoute("/stake-tools")({
  component: () => (
    <SoulAICategoryPage
      heroEyebrow="Stake Tools"
      heroTitle={
        <>
          <span className="text-gradient">Stake tools</span> built for predictors and automation.
        </>
      }
      heroDescription="Predictors, larp packages, and weekly/monthly plans — optimized for speed, clarity, and premium execution."
      pricingEyebrow="Pricing"
      pricingTitle={<>Pricing</>}
      pricingDescription="Switch between Mines Larp, Balance Larp, and Predictor plans. Weekly/monthly toggle is available for Predictor plans."
      planGroups={PLAN_GROUPS}
      showHeroPricingArrow
      pricingTone="darker"
    />
  ),
  head: () => ({
    meta: [{ property: "og:url", content: "/stake-tools" }],
    links: [{ rel: "canonical", href: "/stake-tools" }],
  }),
});
