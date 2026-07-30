import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { HospitalJobDetailV2 } from "@/components/job-detail/HospitalJobDetailV2";
import { IndustryJobDetailClient } from "@/components/job-detail/IndustryJobDetailClient";
import { PharmacyJobDetailV2 } from "@/components/job-detail/PharmacyJobDetailV2";
import { ResearchJobDetailV2 } from "@/components/job-detail/ResearchJobDetailV2";
import { RecentJobRecorder } from "@/components/jobs/RecentJobRecorder";
import { getHospitalJobDetail } from "@/data/hospitalJobDetails";
import { getIndustryJobDetail } from "@/data/industryJobDetails";
import { hasJobDetail } from "@/data/jobDetailIndex";
import { jobs } from "@/data/jobs";
import { getPharmacyJobDetail } from "@/data/pharmacyJobDetails";
import { getResearchJobDetail } from "@/data/researchJobDetails";

interface JobDetailPageProps {
  params: Promise<{ slug: string }>;
}

function MissingJob() {
  return (
    <>
      <Header />
      <main className="grid min-h-[calc(100vh-70px)] place-items-center bg-[#f5f5f3] px-6">
        <section className="w-full max-w-[520px] rounded-[var(--radius)] border border-border bg-white p-8 text-center shadow-[var(--shadow)]">
          <p className="text-[13px] font-medium text-brand">채용공고</p>
          <h1 className="mt-2 text-[28px] font-bold text-[#202734]">공고를 찾을 수 없습니다.</h1>
          <p className="mt-3 text-[15px] font-medium leading-[1.7] text-[#667181]">
            주소가 변경되었거나 마감되어 더 이상 열람할 수 없는 공고입니다.
          </p>
          <Link
            href="/jobs"
            className="mx-auto mt-6 inline-flex h-12 items-center gap-2 bg-brand px-5 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(17,17,17,0.18)] transition hover:bg-[var(--color-brand-dark)]"
          >
            <ChevronLeft size={18} />
            채용공고 목록으로 돌아가기
          </Link>
        </section>
      </main>
    </>
  );
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const job = jobs.find((item) => item.slug === slug);

  if (!job || !hasJobDetail(slug)) {
    return <MissingJob />;
  }

  if (job.track === "hospital") {
    const hospitalDetailV2 = getHospitalJobDetail(slug);
    if (!hospitalDetailV2) {
      return <MissingJob />;
    }

    return (
      <>
        <Header />
        <RecentJobRecorder jobId={job.id} />
        <HospitalJobDetailV2 data={hospitalDetailV2} jobRecord={job} />
      </>
    );
  }

  if (job.track === "pharmacy") {
    const pharmacyDetailV2 = getPharmacyJobDetail(slug);
    if (!pharmacyDetailV2) {
      return <MissingJob />;
    }

    return (
      <>
        <Header />
        <RecentJobRecorder jobId={job.id} />
        <PharmacyJobDetailV2 data={pharmacyDetailV2} jobRecord={job} />
      </>
    );
  }

  if (job.track === "research") {
    const researchDetailV2 = getResearchJobDetail(slug);
    if (!researchDetailV2) {
      return <MissingJob />;
    }

    return (
      <>
        <Header />
        <RecentJobRecorder jobId={job.id} />
        <ResearchJobDetailV2 data={researchDetailV2} jobRecord={job} />
      </>
    );
  }

  const industryDetail = getIndustryJobDetail(slug);
  if (!industryDetail) {
    return <MissingJob />;
  }

  return (
    <>
      <Header />
      <RecentJobRecorder jobId={job.id} />
      <IndustryJobDetailClient data={industryDetail} jobRecord={job} />
    </>
  );
}
