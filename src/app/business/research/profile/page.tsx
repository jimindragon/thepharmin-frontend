import type { Metadata } from "next";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { ResearchOrgProfileClient } from "@/components/business/ResearchOrgProfileClient";

export const metadata: Metadata = {
  title: "기관정보 관리 | 더파마 리크루트 기업",
  description: "더파마 리크루트 기업센터 기관정보 관리",
};

export default function BusinessResearchProfilePage() {
  return (
    <BusinessCenterShell>
      <ResearchOrgProfileClient />
    </BusinessCenterShell>
  );
}
