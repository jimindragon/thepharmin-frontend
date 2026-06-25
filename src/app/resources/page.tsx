import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ResourcesHomeClient } from "@/components/resources/ResourcesHomeClient";

export const metadata: Metadata = {
  title: "자료실 | THE PHARMA Recruit.",
  description: "제약·바이오 취업을 위한 기업분석·면접후기·직무가이드 전자책. 더파마가 직접 만들어 제공합니다.",
};

export default function ResourcesPage() {
  return (
    <>
      <Header />
      <ResourcesHomeClient />
    </>
  );
}
