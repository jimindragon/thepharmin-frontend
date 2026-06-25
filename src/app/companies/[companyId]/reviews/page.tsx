import Link from "next/link";
import { ChevronLeft, ThumbsUp } from "lucide-react";
import { Header } from "@/components/Header";
import { companies, companyReviews } from "@/data/companies";

interface CompanyReviewsPageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default async function CompanyReviewsPage({ params, searchParams }: CompanyReviewsPageProps) {
  const { companyId } = await params;
  const { type } = await searchParams;
  const company = companies.find((item) => item.id === companyId);
  const interviewOnly = type === "interview";
  const reviews = companyReviews.filter((review) => review.companyId === companyId && (!interviewOnly || review.type === "interview"));

  return (
    <>
      <Header />
      <main className="bg-[#f8fafb] pb-24 pt-6">
        <div className="app-shell">
          <Link href={`/companies/${companyId}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-[#7d8796] hover:text-brand">
            <ChevronLeft size={16} />
            기업정보로 돌아가기
          </Link>

          <section className="mt-5 rounded-[var(--radius)] border border-border bg-white p-7 shadow-[var(--shadow)]">
            <p className="text-[13px] font-medium text-brand">기업정보·후기</p>
            <h1 className="mt-2 text-[34px] font-bold tracking-[-0.02em] text-[#202734]">
              {company?.name ?? "기업"} {interviewOnly ? "면접 후기" : "후기"}
            </h1>
            {reviews.length === 0 ? (
              <div className="mt-6 flex h-[140px] flex-col items-center justify-center gap-1.5 rounded-[var(--radius)] border border-[#e1e8ef] bg-[#fbfcfd] text-center">
                <p className="text-[14px] font-semibold text-[#3d4653]">
                  {interviewOnly ? "아직 등록된 면접 후기가 없습니다." : "아직 등록된 리뷰가 없습니다."}
                </p>
                <p className="text-[13px] font-normal text-[#8791a0]">새로운 리뷰가 등록되면 이 페이지에서 확인할 수 있습니다.</p>
              </div>
            ) : null}
            <div className="mt-6 grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-[var(--radius)] border border-[#e1e8ef] bg-[#fbfcfd] p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand">
                      {review.type === "interview" ? "면접 후기" : "회사 후기"}
                    </span>
                    <span className="text-[11px] font-normal text-[#9aa5b2]">{review.writtenAt}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {review.tags.map((tag) => (
                      <span key={tag} className="rounded-[var(--radius)] border border-[#e4e9ef] bg-white px-2 py-1 text-[11px] font-medium text-[#687382]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-[13px] font-normal leading-[1.7] text-[#3f4855]">{review.content}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-normal text-[#8a95a5]">
                    <span>
                      {review.jobRole} · {review.authorStatus}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp size={12} />
                      {review.helpfulCount}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
