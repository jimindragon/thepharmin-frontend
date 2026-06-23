"use client";

import clsx from "clsx";
import { Bookmark, ChevronRight, ExternalLink, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import {
  insightCategories,
  insights,
  salaryInsightSummary,
  salaryTenureChartPoints,
  salaryTenureTableRows,
  type InsightArticle,
  type InsightChartPoint,
} from "@/data/insights";
import type { Job } from "@/types/jobs";

interface InsightDetailClientProps {
  insight: InsightArticle;
  relatedArticles: InsightArticle[];
  relatedJobs: Job[];
}

const legendColors: Record<InsightChartPoint["revenueSize"], string> = {
  "1조원 이상": "#0d6f68",
  "5천억~1조원": "#1f9b8e",
  "1천억~5천억": "#7fc8bf",
  "1천억 미만": "#b9ddd8",
};

function formatViews(views: number) {
  return views.toLocaleString("ko-KR");
}

function MiniJobCard({ job }: { job: Job }) {
  return (
    <Link href={job.slug ? `/jobs/${job.slug}` : "/jobs"} className="group border border-[#dfe4ea] bg-white p-4 transition hover:border-[#111111]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-[#667181]">{job.company}</p>
          <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-[1.45] tracking-[-0.02em] text-[#171d26] group-hover:underline">{job.title}</h3>
        </div>
        <span className="shrink-0 text-[13px] font-semibold text-danger">{job.deadlineLabel.replace("마감 ", "")}</span>
      </div>
      <p className="mt-4 text-[12px] font-normal text-[#7b8491]">
        {job.career} · {job.location}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="bg-[#f3f4f5] px-2 py-1 text-[11px] font-medium text-[#68717e]">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

function SalaryTenureChart() {
  const width = 640;
  const height = 360;
  const padding = { left: 58, right: 30, top: 28, bottom: 50 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const xScale = (tenure: number) => padding.left + (tenure / 22) * plotWidth;
  const yScale = (salary: number) => padding.top + (1 - (salary - 3000) / 13000) * plotHeight;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_164px] gap-5 max-[900px]:grid-cols-1">
      <div className="overflow-x-auto border border-[#dfe4ea] bg-white p-5">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[620px]">
          <rect x={0} y={0} width={width} height={height} fill="#ffffff" />
          {[4000, 8000, 12000, 16000].map((salary) => (
            <g key={salary}>
              <line x1={padding.left} x2={width - padding.right} y1={yScale(salary)} y2={yScale(salary)} stroke="#e9edf2" />
              <text x={18} y={yScale(salary) + 4} fontSize={12} fontWeight={700} fill="#7b8491">
                {salary.toLocaleString("ko-KR")}
              </text>
            </g>
          ))}
          {[0, 5, 10, 15, 20].map((tenure) => (
            <g key={tenure}>
              <line x1={xScale(tenure)} x2={xScale(tenure)} y1={padding.top} y2={height - padding.bottom} stroke="#f0f3f6" />
              <text x={xScale(tenure)} y={height - 22} textAnchor="middle" fontSize={12} fontWeight={700} fill="#7b8491">
                {tenure}
              </text>
            </g>
          ))}
          <line x1={padding.left} x2={width - padding.right} y1={height - padding.bottom} y2={height - padding.bottom} stroke="#cfd7e2" />
          <line x1={padding.left} x2={padding.left} y1={padding.top} y2={height - padding.bottom} stroke="#cfd7e2" />
          <text x={width / 2} y={height - 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#4f5967">
            평균 근속연수(년)
          </text>
          <text x={16} y={20} fontSize={12} fontWeight={800} fill="#4f5967">
            평균 연봉(만원)
          </text>

          {salaryTenureChartPoints.map((point) => (
            <circle
              key={`${point.company}-${point.salary}-${point.tenure}`}
              cx={xScale(point.tenure)}
              cy={yScale(point.salary)}
              r={point.company === "A사" ? 5 : 4}
              fill={legendColors[point.revenueSize]}
              opacity={point.company === "A사" ? 1 : 0.82}
            />
          ))}
          <g transform={`translate(${xScale(18.8) + 7}, ${yScale(13200) - 26})`}>
            <rect width={32} height={24} fill="#111111" />
            <text x={16} y={16} textAnchor="middle" fontSize={11} fontWeight={900} fill="#ffffff">
              A사
            </text>
          </g>
        </svg>
      </div>

      <aside className="border border-[#dfe4ea] bg-[#fbfcfd] p-4">
        <p className="text-[13px] font-medium text-[#171d26]">매출 규모</p>
        <div className="mt-4 space-y-3">
          {Object.entries(legendColors).map(([label, color]) => (
            <div key={label} className="flex items-center gap-2 text-[12px] font-normal text-[#5e6875]">
              <span className="h-2.5 w-2.5" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function InsightDetailClient({ insight, relatedArticles, relatedJobs }: InsightDetailClientProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareInsight = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: insight.title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="bg-white pb-16 pt-[18px]">
      <div className="app-shell">
        <PageBreadcrumb
          items={[
            { label: "인사이트룸", href: "/insights" },
            { label: insight.category },
            { label: insight.title },
          ]}
        />

        <div className="mt-7 grid grid-cols-[minmax(0,1fr)_292px] gap-8 max-[1080px]:grid-cols-1">
          <article className="min-w-0">
            <header className="border-b border-[#dfe4ea] pb-8">
              <span className="inline-flex h-7 items-center border border-[#dfe4ea] bg-[#f7f8fa] px-2.5 text-[11px] font-medium text-[#596373]">
                {insight.category}
              </span>
              <h1 className="mt-5 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#111827] max-[720px]:text-[26px]">
                {insight.title}
              </h1>
              <p className="mt-4 text-[16px] font-normal leading-[1.75] text-[#5f6876]">{insight.description}</p>
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 text-[12px] font-normal text-[#7b8491]">
                  <span className="font-medium text-[#303946]">THE PHARMA INSIGHT</span>
                  <span className="h-3 w-px bg-[#d8dde4]" />
                  <span>{insight.date}</span>
                  <span className="h-3 w-px bg-[#d8dde4]" />
                  <span>읽기 {formatViews(insight.views)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBookmarked((current) => !current)}
                    className="grid h-10 w-10 place-items-center border border-[#dfe4ea] bg-white text-[#596373] hover:border-[#111111] hover:text-[#111111]"
                    aria-label="인사이트 북마크"
                  >
                    <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    onClick={shareInsight}
                    className="inline-flex h-10 items-center gap-2 border border-[#dfe4ea] bg-white px-3 text-[12px] font-medium text-[#596373] hover:border-[#111111] hover:text-[#111111]"
                  >
                    <Share2 size={17} />
                    {copied ? "복사됨" : "공유"}
                  </button>
                </div>
              </div>
            </header>

            <section className="mt-8 border border-[#dfe4ea] bg-[#f7f8fa] p-6">
              <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#111827]">핵심 요약</h2>
              <ul className="mt-4 space-y-2.5">
                {salaryInsightSummary.map((summary) => (
                  <li key={summary} className="flex gap-2 text-[13px] font-normal leading-[1.75] text-[#4e5967]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#111111]" />
                    {summary}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#111827]">1. 평균 연봉 vs 평균 근속연수 매핑</h2>
              <p className="mt-3 text-[13px] font-normal leading-[1.7] text-[#6f7783]">
                상장 제약바이오 기업의 평균 연봉과 평균 근속연수를 한 화면에서 비교한 mock chart입니다.
              </p>
              <div className="mt-5">
                <SalaryTenureChart />
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#111827]">2. 매출 규모별 분포</h2>
              <div className="mt-5 overflow-x-auto border border-[#dfe4ea] bg-white">
                <table className="w-full min-w-[620px] border-collapse text-left text-[13px]">
                  <thead className="bg-[#f5f6f7] text-[#3c4654]">
                    <tr>
                      <th className="border-r border-[#dfe4ea] px-4 py-3 font-medium">구분</th>
                      <th className="border-r border-[#dfe4ea] px-4 py-3 text-right font-medium">평균 연봉(만원)</th>
                      <th className="border-r border-[#dfe4ea] px-4 py-3 text-right font-medium">평균 근속연수(년)</th>
                      <th className="px-4 py-3 text-right font-medium">기업 수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryTenureTableRows.map((row) => (
                      <tr key={row.revenueSize} className={clsx(row.revenueSize === "전체 평균" && "bg-[#fbfcfd] font-bold")}>
                        <td className="border-r border-t border-[#dfe4ea] px-4 py-3 font-normal text-[#3f4855]">{row.revenueSize}</td>
                        <td className="border-r border-t border-[#dfe4ea] px-4 py-3 text-right font-normal text-[#3f4855]">{row.averageSalary}</td>
                        <td className="border-r border-t border-[#dfe4ea] px-4 py-3 text-right font-normal text-[#3f4855]">{row.averageTenure}</td>
                        <td className="border-t border-[#dfe4ea] px-4 py-3 text-right font-normal text-[#3f4855]">{row.companyCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[12px] font-normal text-[#8a94a3]">출처: DART 사업보고서(2024), 각 사 공시 기준</p>
            </section>

            <section className="mt-12 border-t border-[#dfe4ea] pt-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#111827]">데이터로 본 기업의 채용공고 확인하기</h2>
                  <p className="mt-2 text-[13px] font-normal text-[#6f7783]">연봉·근속 데이터와 함께 볼 만한 제약바이오 채용공고입니다.</p>
                </div>
                <Link href="/jobs" className="text-[13px] font-medium text-[#777777] hover:text-[#111111]">
                  전체 공고 보기
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
                {relatedJobs.map((job) => (
                  <MiniJobCard key={job.id} job={job} />
                ))}
              </div>
            </section>
          </article>

          <aside className="self-start max-[1080px]:grid max-[1080px]:grid-cols-2 max-[720px]:grid-cols-1">
            <div className="sticky top-[92px] space-y-5 max-[1080px]:static">
              <section className="border border-[#dfe4ea] bg-white p-5">
                <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#111827]">연관 콘텐츠</h2>
                <div className="mt-4 space-y-4">
                  {relatedArticles.slice(0, 3).map((article) => (
                    <Link key={article.id} href={`/insights/${article.slug}`} className="group grid grid-cols-[1fr_72px] gap-3 border-b border-[#eef1f4] pb-4 last:border-b-0 last:pb-0">
                      <div className="min-w-0">
                        <span className="text-[11px] font-medium text-[#596373]">{article.category}</span>
                        <h3 className="mt-2 line-clamp-2 text-[13px] font-bold leading-[1.45] tracking-[-0.02em] text-[#252d39] group-hover:underline">{article.title}</h3>
                        <p className="mt-2 text-[11px] font-normal text-[#8a94a3]">{article.date}</p>
                      </div>
                      <img src={article.thumbnail} alt="" className="h-[58px] w-[72px] object-cover grayscale" />
                    </Link>
                  ))}
                </div>
              </section>

              <section className="border border-[#dfe4ea] bg-white p-5">
                <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#111827]">카테고리</h2>
                <div className="mt-3 divide-y divide-[#eef1f4]">
                  {insightCategories.slice(1).map((category) => (
                    <Link
                      key={category}
                      href="/insights"
                      className={clsx(
                        "flex h-10 items-center justify-between text-[13px] font-medium hover:text-[#111111]",
                        category === insight.category ? "text-[#111111]" : "text-[#4f5967]",
                      )}
                    >
                      {category}
                      <ChevronRight size={14} />
                    </Link>
                  ))}
                </div>
              </section>

              <section className="border border-[#dfe4ea] bg-[#fbfcfd] p-5">
                <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#111827]">추천 공고 연결</h2>
                <p className="mt-3 text-[13px] font-normal leading-[1.7] text-[#68717e]">
                  데이터로 본 기업의 채용 현황과 실제 공고를 함께 비교해 보세요.
                </p>
                <Link href="/jobs" className="mt-5 inline-flex h-10 items-center gap-2 border border-[#111111] bg-[#111111] px-4 text-[12px] font-medium text-white">
                  채용공고 보기
                  <ExternalLink size={14} />
                </Link>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
