import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { JobDetailClient } from "@/components/job-detail/JobDetailClient";
import { companies, companyReviews, reviewAccessMock } from "@/data/companies";
import { jobs } from "@/data/jobs";
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
    const sharedKeyword = item.tags.some((tag) => job.tags.includes(tag));

    return sameCategory || sameRegion || sharedKeyword;
  });

  return [...byConfiguredIds, ...byContext].slice(0, 4);
}

function MissingJob() {
  return (
    <>
      <Header />
      <main className="grid min-h-[calc(100vh-70px)] place-items-center bg-[#f5f5f3] px-6">
        <section className="w-full max-w-[520px] rounded-[var(--radius)] border border-border bg-white p-8 text-center shadow-[var(--shadow)]">
          <p className="text-[13px] font-black text-brand">채용공고</p>
          <h1 className="mt-2 text-[28px] font-black text-[#202734]">공고를 찾을 수 없습니다.</h1>
          <p className="mt-3 text-[15px] font-semibold leading-[1.7] text-[#667181]">
            주소가 변경되었거나 마감되어 더 이상 열람할 수 없는 공고입니다.
          </p>
          <Link
            href="/jobs"
            className="mx-auto mt-6 inline-flex h-12 items-center gap-2 rounded-[var(--radius)] bg-brand px-5 text-[15px] font-black text-white shadow-[0_4px_14px_rgba(17,17,17,0.18)] transition hover:bg-[var(--color-brand-dark)]"
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

  const company = companies.find((item) => item.id === job.companyId) ?? null;
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
