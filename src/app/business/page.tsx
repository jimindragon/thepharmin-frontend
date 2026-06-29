import type { Metadata } from "next";
import { BusinessPricingClient } from "@/components/business/BusinessPricingClient";

export const metadata: Metadata = {
  title: "기업 서비스 | 더파마 리크루트",
  description: "더파마 리크루트 기업 서비스",
};

export default function BusinessPage() {
  return <BusinessPricingClient />;
}
