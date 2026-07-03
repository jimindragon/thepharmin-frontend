import type { Metadata } from "next";
import { PharmacySignupClient } from "@/components/business/signup/PharmacySignupClient";

export const metadata: Metadata = {
  title: "약국 가입 | 더파마 리크루트",
  description: "약국을 운영하며 약사 인력을 채용하려는 약국장·관리약사를 위한 가입입니다.",
};

export default function BusinessSignupPharmacyPage() {
  return <PharmacySignupClient />;
}
