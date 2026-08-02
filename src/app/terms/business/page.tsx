import type { Metadata } from "next";
import { TermsDocumentClient } from "@/components/terms/TermsDocumentClient";

export const metadata: Metadata = {
  title: "기관회원 이용약관 | 더파마 리크루트",
};

export default function BusinessTermsPage() {
  return <TermsDocumentClient docId="business" />;
}
