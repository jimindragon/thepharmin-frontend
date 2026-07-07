import type { Metadata } from "next";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { PharmacyOrgProfileClient } from "@/components/business/PharmacyOrgProfileClient";

export const metadata: Metadata = {
  title: "약국정보 관리 | 더파마 리크루트 기업",
  description: "더파마 리크루트 기업센터 약국정보 관리",
};

export default function BusinessPharmacyProfilePage() {
  return (
    <BusinessCenterShell>
      <PharmacyOrgProfileClient />
    </BusinessCenterShell>
  );
}
