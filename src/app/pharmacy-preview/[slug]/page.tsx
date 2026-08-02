import { notFound } from "next/navigation";
import { PharmacyJobDetailV2 } from "@/components/job-detail/PharmacyJobDetailV2";
import { getPharmacyJobDetail } from "@/data/pharmacyJobDetails";

interface PharmacyPreviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PharmacyPreviewPage({ params }: PharmacyPreviewPageProps) {
  const { slug } = await params;
  const detail = getPharmacyJobDetail(slug);

  if (!detail) {
    notFound();
  }

  // isPreview — 이 화면은 기업 담당자가 구직자 시점을 확인하는 용도라 보는 사람의 개인 세션을 따르지 않고
  // 항상 비로그인(처음 방문한 구직자) 화면으로 고정한다. 실제 상세(/jobs/[slug])는 이 prop을 넘기지 않는다.
  return <PharmacyJobDetailV2 data={detail} isPreview />;
}
