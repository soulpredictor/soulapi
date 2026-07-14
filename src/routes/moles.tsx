import { createFileRoute } from "@tanstack/react-router";
import MolesPredictor from "@/components/soulai/predictors/MolesPredictor";

export const Route = createFileRoute("/moles")({
  component: MolesPredictor,
  head: () => ({
    meta: [
      { property: "og:url", content: "/moles" },
      { title: "Moles Predictor — SoulAI" },
      { name: "description", content: "Real-time AI Moles prediction. Safe holes are highlighted automatically once a bet is detected on Stake." },
    ],
    links: [{ rel: "canonical", href: "/moles" }],
  }),
});
