import type { Metadata } from "next";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { HospitalOrgProfileClient } from "@/components/business/HospitalOrgProfileClient";

export const metadata: Metadata = {
  title: "병원정보 관리 | 더파마 리크루트 기업",
  description: "더파마 리크루트 기업센터 병원정보 관리",
};

export default function BusinessHospitalProfilePage() {
  return (
    <BusinessCenterShell>
      <HospitalOrgProfileClient />
    </BusinessCenterShell>
  );
}
