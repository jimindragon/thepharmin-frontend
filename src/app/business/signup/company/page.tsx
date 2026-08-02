import type { Metadata } from "next";
import { AuthHeader } from "@/components/shared/AuthHeader";
import { CompanySignupClient } from "@/components/business/signup/CompanySignupClient";

export const metadata: Metadata = {
  title: "기업·병원·연구기관 가입 | 더파마 리크루트",
  description: "제약사, 바이오텍, 의료기기, CRO·CDMO, 병원, 연구기관 채용 담당자를 위한 가입입니다.",
};

export default function BusinessSignupCompanyPage() {
  return (
    <>
      <AuthHeader />
      <CompanySignupClient />
    </>
  );
}
