import { createFileRoute } from "@tanstack/react-router";
import CrashPredictor from "@/components/soulai/predictors/CrashPredictor";

export const Route = createFileRoute("/crash")({
  component: () => <CrashPredictor />,
  head: () => ({
    meta: [{ property: "og:url", content: "/crash" }],
    links: [{ rel: "canonical", href: "/crash" }],
  }),
});
