import type { Metadata } from "next";
import { TermsDocumentClient } from "@/components/terms/TermsDocumentClient";

export const metadata: Metadata = {
  title: "이용약관 | 더파마 리크루트",
};

export default function TermsPage() {
  return <TermsDocumentClient docId="service" />;
}
