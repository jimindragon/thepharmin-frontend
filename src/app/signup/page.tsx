import type { Metadata } from "next";
import { AuthHeader } from "@/components/shared/AuthHeader";
import { PersonalSignupClient } from "@/components/signup/PersonalSignupClient";

export const metadata: Metadata = {
  title: "회원가입 | 더파마 리크루트",
};

export default function PersonalSignupPage() {
  return (
    <>
      <AuthHeader />
      <PersonalSignupClient />
    </>
  );
}
