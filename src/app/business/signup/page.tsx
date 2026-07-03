import type { Metadata } from "next";
import { SignupTypeSelectClient } from "@/components/business/signup/SignupTypeSelectClient";

export const metadata: Metadata = {
  title: "기업회원 가입 | 더파마 리크루트",
  description: "기업·병원·연구기관, 약국 등 가입 유형을 선택해 더파마 리크루트 기업회원으로 가입하세요.",
};

export default function BusinessSignupPage() {
  return <SignupTypeSelectClient />;
}
