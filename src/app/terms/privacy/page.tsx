import type { Metadata } from "next";
import { TermsDocumentClient } from "@/components/terms/TermsDocumentClient";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 더파마 리크루트",
};

export default function PrivacyPolicyPage() {
  return <TermsDocumentClient docId="privacy" />;
}
