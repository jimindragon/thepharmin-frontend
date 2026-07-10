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

  return <PharmacyJobDetailV2 data={detail} />;
}
