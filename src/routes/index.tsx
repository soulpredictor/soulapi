import { createFileRoute } from "@tanstack/react-router";
import SoulAILanding from "@/components/soulai/SoulAILanding";

export const Route = createFileRoute("/")({
  component: SoulAILanding,
  head: () => ({
    meta: [
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});
