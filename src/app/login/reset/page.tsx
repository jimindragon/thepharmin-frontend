import type { Metadata } from "next";
import { AuthHeader } from "@/components/shared/AuthHeader";
import { PasswordResetRequestClient } from "@/components/login/PasswordResetRequestClient";

export const metadata: Metadata = {
  title: "비밀번호 재설정 | 더파마 리크루트",
};

export default function PasswordResetPage() {
  return (
    <>
      <AuthHeader />
      <PasswordResetRequestClient />
    </>
  );
}
