import type { Metadata } from "next";
import { BusinessCompanyPreviewClient } from "@/components/business/BusinessCompanyPreviewClient";

export const metadata: Metadata = {
  title: "브랜드 페이지 미리보기 | 더파마 리크루트 기업",
  description: "구직자에게 노출되는 기업/병원/약국/연구기관 상세 페이지를 미리 확인하는 화면입니다.",
};

export default function BusinessCompanyPreviewPage() {
  return <BusinessCompanyPreviewClient />;
}
