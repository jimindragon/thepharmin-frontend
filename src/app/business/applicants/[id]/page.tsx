import { notFound } from "next/navigation";
import { BusinessApplicantDetailClient } from "@/components/business/BusinessApplicantDetailClient";
import { applicants } from "@/data/applicants";

interface BusinessApplicantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BusinessApplicantDetailPage({ params }: BusinessApplicantDetailPageProps) {
  const { id } = await params;
  const applicant = applicants.find((item) => item.id === id);

  if (!applicant) {
    notFound();
  }

  return <BusinessApplicantDetailClient applicant={applicant} />;
}
