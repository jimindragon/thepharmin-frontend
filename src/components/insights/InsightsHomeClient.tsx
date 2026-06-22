"use client";

import clsx from "clsx";
import { BarChart3, BriefcaseBusiness, Building2, ChevronRight, Database, FileText, LineChart, Users } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import {
  featuredInsightIds,
  insightCategories,
  insightDataCards,
  insights,
  newsLinkedInsights,
  type InsightArticle,
  type InsightCategory,
} from "@/data/insights";

type ContentInsightCategory = Exclude<InsightCategory, "전체">;

const contentInsightCategories = insightCategories.filter((category): category is ContentInsightCategory => category !== "전체");

const categoryIcons: Record<ContentInsightCategory, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  직무백과: FileText,
  "현직자 인터뷰": Users,
  "산업 인사이트": LineChart,
  "기업 이야기": Building2,
  "취업·이직 가이드": BriefcaseBusiness,
  "데이터 인사이트": BarChart3,
};

function formatViews(views: number) {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return `${views}`;
}

function InsightCard({ article, featured = false }: { article: InsightArticle; featured?: boolean }) {
  const href = `/insights/${article.slug}`;

  return (
    <Link
      href={href}
      className={clsx(
        "group block border border-[#dfe4ea] bg-white transition hover:border-[#111111]",
        featured ? "min-h-[360px]" : "min-h-[186px]",
      )}
    >
      {featured ? (
        <div className="relative h-[160px] overflow-hidden border-b border-[#e4e8ee] bg-[#101419]">
          {article.id === "salary-tenure-map" ? (
            <div className="absolute inset-0 bg-white px-5 py-4">
              <div className="relative h-full border-l border-b border-[#dce3ea]">
                {[0, 1, 2, 3].map((line) => (
                  <span key={line} className="absolute left-0 right-0 h-px bg-[#edf1f5]" style={{ top: `${line * 28 + 18}px` }} />
                ))}
                {[8, 15, 28, 41, 56, 67, 82].map((left, index) => (
                  <span
                    key={`${left}-${index}`}
                    className={clsx("absolute h-1.5 w-1.5 bg-[#0c8278]", index % 3 === 0 ? "opacity-100" : "opacity-55")}
                    style={{ left: `${left}%`, bottom: `${18 + ((index * 17) % 78)}%` }}
                  />
                ))}
                <span className="absolute right-[14%] top-[28%] bg-[#111111] px-2 py-1 text-[10px] font-black text-white">A사</span>
              </div>
            </div>
          ) : (
            <img src={article.thumbnail} alt="" className="h-full w-full object-cover grayscale transition duration-200 group-hover:scale-[1.02]" />
          )}
        </div>
      ) : null}

      <div className={clsx(featured ? "p-5" : "p-4")}>
        <span className="inline-flex h-6 items-center border border-[#cfe2df] bg-[#f7fbfa] px-2 text-[11px] font-black text-[#0b756e]">
          {article.category}
        </span>
        <h3 className={clsx("mt-3 font-black leading-[1.42] tracking-[0] text-[#171d26] group-hover:underline", featured ? "text-[18px]" : "text-[15px]")}>
          {article.title}
        </h3>
        <p className={clsx("mt-3 font-semibold leading-[1.65] text-[#6f7783]", featured ? "text-[13px]" : "line-clamp-2 text-[12px]")}>
          {article.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-[#f3f4f5] px-2 py-1 text-[11px] font-bold text-[#68717e]">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({ title, actionHref }: { title: string; actionHref?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="text-[22px] font-black tracking-[0] text-[#111111]">{title}</h2>
      {actionHref ? (
        <Link href={actionHref} className="inline-flex items-center gap-1 text-[13px] font-bold text-[#777777] hover:text-[#111111]">
          더보기
          <ChevronRight size={15} />
        </Link>
      ) : null}
    </div>
  );
}

export function InsightsHomeClient() {
  const [activeCategory, setActiveCategory] = useState<InsightCategory>("전체");

  const featuredArticles = useMemo(
    () => featuredInsightIds.map((id) => insights.find((article) => article.id === id)).filter((article): article is InsightArticle => Boolean(article)),
    [],
  );

  const latestArticles = useMemo(() => {
    return insights.filter((article) => activeCategory === "전체" || article.category === activeCategory).slice(0, 4);
  }, [activeCategory]);

  return (
    <main className="bg-white pb-16">
      <section className="border-b border-[#e4e7eb] bg-white">
        <div className="app-shell pt-7">
          <div className="relative min-h-[300px] overflow-hidden border border-[#dce2e8] bg-[#070a0d] text-white">
            <img src="/images/company/company_pic_example_1.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 grayscale" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_45%,rgba(0,0,0,0.22)_100%)]" />
            <div className="relative z-10 max-w-[760px] px-9 pb-10 pt-[68px] max-[720px]:px-6 max-[720px]:pt-10">
              <span className="inline-flex h-7 items-center border border-white/18 bg-white/8 px-3 text-[11px] font-black text-[#d8f1ef]">
                THE PHARMA INSIGHT+
              </span>
              <h1 className="mt-7 text-[34px] font-black leading-[1.24] tracking-[0] text-white max-[720px]:text-[26px]">
                제약바이오 산업과 커리어를 한눈에, 인사이트룸
              </h1>
              <p className="mt-5 max-w-[620px] text-[15px] font-semibold leading-[1.8] text-white/72">
                현직자의 경험과 데이터 기반 인사이트로 당신의 커리어 결정을 더 스마트하게.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/insights/pharma-salary-tenure-map" className="inline-flex h-11 items-center border border-white bg-white px-5 text-[13px] font-black text-[#111111] hover:bg-[#f3f4f5]">
                  데이터 리포트 보기
                </Link>
                <Link href="/jobs" className="inline-flex h-11 items-center border border-white/28 bg-white/8 px-5 text-[13px] font-black text-white hover:bg-white/14">
                  관련 채용공고 보기
                </Link>
              </div>
            </div>
          </div>

          <nav className="mt-0 flex overflow-x-auto border-x border-b border-[#dfe4ea] bg-white" aria-label="인사이트 카테고리">
            {contentInsightCategories.map((category) => {
              const Icon = categoryIcons[category];
              const selected = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={clsx(
                    "inline-flex h-14 shrink-0 items-center gap-2 border-r border-[#edf1f5] px-5 text-[13px] font-black transition",
                    selected ? "text-[#0b756e] shadow-[inset_0_-2px_0_#0b756e]" : "text-[#4f5967] hover:bg-[#f7f8fa] hover:text-[#111111]",
                  )}
                >
                  <Icon size={15} strokeWidth={2.1} />
                  {category}
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="app-shell">
        <section className="mt-10">
          <SectionHeader title="주목할 만한 인사이트" actionHref="/insights" />
          <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
            {featuredArticles.map((article) => (
              <InsightCard key={article.id} article={article} featured />
            ))}
          </div>
        </section>

        <section className="mt-10 border border-[#dfe4ea] bg-white p-5">
          <SectionHeader title="데이터로 보는 제약바이오" />
          <div className="grid grid-cols-4 gap-3 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
            {insightDataCards.map((card) => (
              <article key={card.label} className="border border-[#e1e6ec] bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[12px] font-black text-[#596373]">{card.label}</p>
                  <Database size={18} className="text-[#8c98a7]" />
                </div>
                <p className="mt-4 text-[28px] font-black tracking-[0] text-[#111827]">{card.value}</p>
                <p className="mt-3 text-[12px] font-bold text-[#667181]">
                  <span className="font-black text-[#0b756e]">{card.change}</span> {card.caption}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <SectionHeader title="최신 콘텐츠" actionHref="/insights" />
          <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
            {latestArticles.map((article) => (
              <Link key={article.id} href={`/insights/${article.slug}`} className="group border border-[#dfe4ea] bg-white p-4 transition hover:border-[#111111]">
                <div className="flex items-center justify-between gap-2">
                  <span className="border border-[#cfe2df] bg-[#f7fbfa] px-2 py-1 text-[11px] font-black text-[#0b756e]">{article.category}</span>
                  <span className="text-[11px] font-bold text-[#9aa3af]">{article.date}</span>
                </div>
                <h3 className="mt-4 line-clamp-2 min-h-[44px] text-[15px] font-black leading-[1.45] text-[#171d26] group-hover:underline">
                  {article.title}
                </h3>
                <div className="mt-5 flex items-center justify-between gap-3 text-[11px] font-bold text-[#7b8491]">
                  <span>{article.tags.slice(0, 2).map((tag) => `#${tag}`).join(" ")}</span>
                  <span>읽기 {formatViews(article.views)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <SectionHeader title="더파마뉴스에서 본 산업 변화" actionHref="/insights" />
          <div className="grid grid-cols-3 gap-4 max-[980px]:grid-cols-1">
            {newsLinkedInsights.map((article) => (
              <Link key={article.id} href={`/insights/${article.slug}`} className="group grid grid-cols-[112px_1fr] border border-[#dfe4ea] bg-white transition hover:border-[#111111] max-[520px]:grid-cols-1">
                <div className="h-full min-h-[156px] overflow-hidden bg-[#f2f3f4] max-[520px]:h-[148px]">
                  <img src={article.thumbnail} alt="" className="h-full w-full object-cover grayscale transition duration-200 group-hover:scale-[1.02]" />
                </div>
                <div className="p-4">
                  <span className="text-[11px] font-black text-[#0b756e]">{article.category}</span>
                  <h3 className="mt-2 line-clamp-2 text-[15px] font-black leading-[1.45] text-[#171d26] group-hover:underline">{article.title}</h3>
                  <p className="mt-3 line-clamp-3 text-[12px] font-semibold leading-[1.65] text-[#6f7783]">{article.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
