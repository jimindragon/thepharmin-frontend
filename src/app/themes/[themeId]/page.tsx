import { notFound } from "next/navigation";
import { THEME_META } from "@/data/taxonomy";
import { ThemeHubClient } from "@/components/themes/ThemeHubClient";
import type { ThemeId } from "@/types/jobs";

const VALID_THEME_IDS = new Set<string>(["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9"]);

export async function generateStaticParams() {
  return ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9"].map((themeId) => ({ themeId }));
}

export default async function ThemeHubPage({ params }: { params: Promise<{ themeId: string }> }) {
  const { themeId } = await params;

  if (!VALID_THEME_IDS.has(themeId)) {
    notFound();
  }

  const theme = THEME_META[themeId as ThemeId];
  return <ThemeHubClient themeId={themeId as ThemeId} theme={theme} />;
}
