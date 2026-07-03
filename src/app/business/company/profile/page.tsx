import type { Metadata } from "next";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { BusinessOrgProfilePageClient } from "@/components/business/BusinessOrgProfilePageClient";

export const metadata: Metadata = {
  title: "기업정보 관리 | 더파마 리크루트 기업",
  description: "더파마 리크루트 기업센터 기업정보 관리",
};

export default function BusinessCompanyProfilePage() {
  return (
    <BusinessCenterShell>
      <BusinessOrgProfilePageClient />
    </BusinessCenterShell>
  );
}
