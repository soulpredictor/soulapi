import { createFileRoute } from "@tanstack/react-router";
import BlackjackPredictor from "@/components/soulai/predictors/BlackjackPredictor";

export const Route = createFileRoute("/blackjack")({
  component: BlackjackPredictor,
  head: () => ({
    meta: [
      { property: "og:url", content: "/blackjack" },
      { title: "Blackjack Predictor — SoulAI" },
      { name: "description", content: "Real-time AI Blackjack strategy advisor. Hit, Stand, Double, or Split — powered by the SoulAI prediction engine." },
    ],
    links: [{ rel: "canonical", href: "/blackjack" }],
  }),
});
