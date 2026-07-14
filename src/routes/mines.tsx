import { createFileRoute } from "@tanstack/react-router";
import MinesPredictor from "@/components/soulai/predictors/MinesPredictor";

export const Route = createFileRoute("/mines")({
  component: () => <MinesPredictor />,
  head: () => ({
    meta: [{ property: "og:url", content: "/mines" }],
    links: [{ rel: "canonical", href: "/mines" }],
  }),
});
