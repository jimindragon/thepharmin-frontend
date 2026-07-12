import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { HospitalJobDetailClient } from "@/components/job-detail/HospitalJobDetailClient";
import { HospitalJobDetailV2 } from "@/components/job-detail/HospitalJobDetailV2";
import { IndustryJobDetailClient } from "@/components/job-detail/IndustryJobDetailClient";
import { JobDetailClient } from "@/components/job-detail/JobDetailClient";
import { PharmacyJobDetailClient } from "@/components/job-detail/PharmacyJobDetailClient";
import { PharmacyJobDetailV2 } from "@/components/job-detail/PharmacyJobDetailV2";
import { ResearchJobDetailClient } from "@/components/job-detail/ResearchJobDetailClient";
import { ResearchJobDetailV2 } from "@/components/job-detail/ResearchJobDetailV2";
import { companies, companyReviews, reviewAccessMock } from "@/data/companies";
import { getHospitalJobDetail } from "@/data/hospitalJobDetails";
import { getIndustryJobDetail } from "@/data/industryJobDetails";
import { hasJobDetail } from "@/data/jobDetailIndex";
import { jobs } from "@/data/jobs";
import { getPharmacyJobDetail } from "@/data/pharmacyJobDetails";
import { getResearchJobDetail } from "@/data/researchJobDetails";
import type { Job } from "@/types/jobs";

interface JobDetailPageProps {
  params: Promise<{ slug: string }>;
}

function getSimilarJobs(job: Job) {
  const byConfiguredIds = (job.similarJobIds ?? [])
    .map((id) => jobs.find((item) => item.id === id))
    .filter((item): item is Job => Boolean(item));

  const byContext = jobs.filter((item) => {
    if (item.id === job.id || byConfiguredIds.some((configured) => configured.id === item.id)) {
      return false;
    }

    const sameCategory = item.jobSubcategoryIds.some((id) => job.jobSubcategoryIds.includes(id));
    const sameRegion = item.regionId === job.regionId;
    const sharedKeyword = (item.coreKeywords ?? []).some((tag) => (job.coreKeywords ?? []).includes(tag));

    return sameCategory || sameRegion || sharedKeyword;
  });

  return [...byConfiguredIds, ...byContext].slice(0, 4);
}

/** Company 엔티티가 없는 연구 공고는 기관·연구실 정보의 "현재 등록된 다른 공고 수"를 같은 기관 이름으로 직접 집계한다. */
function getOtherLabJobsCount(job: Job) {
  if (!job.researchLab) {
    return 0;
  }

  return jobs.filter((item) => item.id !== job.id && item.researchLab?.institution === job.researchLab?.institution).length;
}

function MissingJob() {
  return (
    <>
      <Header />
      <main className="grid min-h-[calc(100vh-70px)] place-items-center bg-[#f5f5f3] px-6">
        <section className="w-full max-w-[520px] rounded-[var(--radius)] border border-border bg-white p-8 text-center shadow-[var(--shadow)]">
          <p className="text-[13px] font-black text-brand">채용공고</p>
          <h1 className="mt-2 text-[28px] font-bold text-[#202734]">공고를 찾을 수 없습니다.</h1>
          <p className="mt-3 text-[15px] font-semibold leading-[1.7] text-[#667181]">
            주소가 변경되었거나 마감되어 더 이상 열람할 수 없는 공고입니다.
          </p>
          <Link
            href="/jobs"
            className="mx-auto mt-6 inline-flex h-12 items-center gap-2 bg-brand px-5 text-[15px] font-black text-white shadow-[0_4px_14px_rgba(17,17,17,0.18)] transition hover:bg-[var(--color-brand-dark)]"
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

  if (!job) {
    return <MissingJob />;
  }

  if (!hasJobDetail(slug)) {
    return <MissingJob />;
  }

  const company = companies.find((item) => item.id === job.companyId) ?? null;

  if (job.track === "hospital") {
    const hospitalDetailV2 = getHospitalJobDetail(slug);

    if (hospitalDetailV2) {
      return (
        <>
          <Header />
          <HospitalJobDetailV2 data={hospitalDetailV2} />
        </>
      );
    }

    return (
      <>
        <Header />
        <HospitalJobDetailClient job={job} company={company} similarJobs={getSimilarJobs(job)} />
      </>
    );
  }

  if (job.track === "pharmacy") {
    const pharmacyDetailV2 = getPharmacyJobDetail(slug);

    if (pharmacyDetailV2) {
      return (
        <>
          <Header />
          <PharmacyJobDetailV2 data={pharmacyDetailV2} />
        </>
      );
    }

    return (
      <>
        <Header />
        <PharmacyJobDetailClient job={job} company={company} similarJobs={getSimilarJobs(job)} />
      </>
    );
  }

  if (job.track === "research") {
    const researchDetailV2 = getResearchJobDetail(slug);

    if (researchDetailV2) {
      return (
        <>
          <Header />
          <ResearchJobDetailV2 data={researchDetailV2} />
        </>
      );
    }

    return (
      <>
        <Header />
        <ResearchJobDetailClient job={job} similarJobs={getSimilarJobs(job)} otherLabJobsCount={getOtherLabJobsCount(job)} />
      </>
    );
  }

  if (job.track === "industry") {
    const industryDetail = getIndustryJobDetail(slug);
    if (industryDetail) {
      return (
        <>
          <Header />
          <IndustryJobDetailClient data={industryDetail} />
        </>
      );
    }
  }

  const reviews = companyReviews.filter((review) => review.companyId === job.companyId);

  return (
    <>
      <Header />
      <JobDetailClient
        job={job}
        company={company}
        similarJobs={getSimilarJobs(job)}
        reviews={reviews}
        reviewAccess={reviewAccessMock}
      />
    </>
  );
}
