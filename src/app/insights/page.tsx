import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { InsightsHomeClient } from "@/components/insights/InsightsHomeClient";

export const metadata: Metadata = {
  title: "Insight+ | THE PHARMA Recruit.",
  description: "제약바이오 산업과 커리어를 위한 인사이트룸",
};

export default function InsightsPage() {
  return (
    <>
      <Header />
      <InsightsHomeClient />
    </>
  );
}
