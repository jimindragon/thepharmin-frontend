import type { Metadata } from "next";
import { TermsDocumentClient } from "@/components/terms/TermsDocumentClient";

export const metadata: Metadata = {
  title: "이메일무단수집거부 | 더파마 리크루트",
};

export default function EmailPolicyPage() {
  return <TermsDocumentClient docId="email" />;
}
