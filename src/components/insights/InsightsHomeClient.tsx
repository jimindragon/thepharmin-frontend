"use client";

import clsx from "clsx";
import { ChevronRight, Database } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  featuredInsightIds,
  insightCategories,
  insightCategoryMeta,
  insightDataCards,
  insightJobWikiEntries,
  insights,
  newsLinkedInsightIds,
  type InsightArticle,
  type InsightCategory,
  type InsightJobWikiEntry,
} from "@/data/insights";
import { jobs } from "@/data/jobs";

type ContentInsightCategory = Exclude<InsightCategory, "전체">;

const contentInsightCategories = insightCategories.filter((category): category is ContentInsightCategory => category !== "전체");

function formatViews(views: number) {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return `${views}`;
}

function InsightCard({ article }: { article: InsightArticle }) {
  return (
    <Link href={`/insights/${article.slug}`} className="group block min-h-[360px] border border-[#dfe4ea] bg-white transition hover:border-[#111111]">
      <div className="h-[160px] overflow-hidden border-b border-[#e4e8ee] bg-[#f2f3f4]">
        <img src={article.thumbnail} alt="" className="h-full w-full object-cover grayscale transition duration-200 group-hover:scale-[1.02]" />
      </div>

      <div className="p-5">
        <span className="inline-flex h-6 items-center border border-[#dfe4ea] bg-[#f7f8fa] px-2 text-[11px] font-medium text-[#596373]">
          {article.category}
        </span>
        <h3 className="mt-3 text-[19px] font-bold leading-[1.42] tracking-[-0.02em] text-[#171d26] group-hover:underline">{article.title}</h3>
        <p className="mt-3 text-[13px] font-normal leading-[1.65] text-[#6f7783]">{article.description}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-[#f3f4f5] px-2 py-1 text-[11px] font-medium text-[#68717e]">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function CategoryArticleCard({ article }: { article: InsightArticle }) {
  return (
    <Link href={`/insights/${article.slug}`} className="group border border-[#dfe4ea] bg-white transition hover:border-[#111111]">
      <div className="h-[160px] overflow-hidden bg-[#f2f3f4]">
        <img src={article.thumbnail} alt="" className="h-full w-full object-cover grayscale transition duration-200 group-hover:scale-[1.02]" />
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-[17px] font-bold leading-[1.42] tracking-[-0.02em] text-[#171d26] group-hover:underline">{article.title}</h3>
        <p className="mt-3 line-clamp-2 text-[12px] font-normal leading-[1.65] text-[#6f7783]">{article.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-[#f3f4f5] px-2 py-1 text-[11px] font-medium text-[#68717e]">
              #{tag}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] font-normal text-[#9aa3af]">
          <span>{article.date}</span>
          <span>읽기 {formatViews(article.views)}</span>
        </div>
      </div>
    </Link>
  );
}

function JobWikiCard({ entry }: { entry: InsightJobWikiEntry }) {
  const openCount = useMemo(
    () => jobs.filter((job) => job.jobSubcategoryIds.includes(entry.jobSubcategoryId)).length,
    [entry.jobSubcategoryId],
  );

  return (
    <Link href={`/jobs?subcategory=${entry.jobSubcategoryId}`} className="group border border-[#dfe4ea] bg-white transition hover:border-[#111111]">
      <div className="relative h-[140px] overflow-hidden bg-[#f2f3f4]">
        <img src={entry.thumbnail} alt="" className="h-full w-full object-cover grayscale transition duration-200 group-hover:scale-[1.02]" />
        <span className="absolute left-0 top-0 inline-flex h-7 items-center bg-[#0b756e] px-2.5 text-[11px] font-medium text-white">{entry.code}</span>
      </div>
      <div className="p-5">
        <h3 className="text-[17px] font-bold tracking-[-0.02em] text-[#171d26]">{entry.title}</h3>
        <p className="mt-1 text-[12px] font-normal text-[#8a94a3]">{entry.englishLabel}</p>
        <p className="mt-3 text-[12px] font-normal leading-[1.65] text-[#6f7783]">{entry.description}</p>
        <p className="mt-4 text-[12px] font-medium text-[#0b756e] group-hover:underline">진행 중 공고 {openCount}건 ›</p>
      </div>
    </Link>
  );
}

function SectionHeader({ title, actionHref }: { title: string; actionHref?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#111111]">{title}</h2>
      {actionHref ? (
        <Link href={actionHref} className="inline-flex items-center gap-1 text-[13px] font-medium text-[#777777] hover:text-[#111111]">
          더보기
          <ChevronRight size={15} />
        </Link>
      ) : null}
    </div>
  );
}

function CategoryTabs({ activeCategory, onChange }: { activeCategory: InsightCategory; onChange: (category: InsightCategory) => void }) {
  return (
    <nav className="flex overflow-x-auto border-b border-[#dfe4ea] bg-white" aria-label="인사이트 카테고리">
      {insightCategories.map((category) => {
        const selected = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={clsx(
              "relative inline-flex h-12 shrink-0 items-center px-5 text-[14px] font-medium whitespace-nowrap transition",
              selected
                ? "font-semibold text-[#111111] after:absolute after:-bottom-px after:left-0 after:h-[2px] after:w-full after:bg-[#111111]"
                : "text-[#4f5967] hover:text-[#111111]",
            )}
          >
            {category}
          </button>
        );
      })}
    </nav>
  );
}

function RankedInsights({ articles, actionHref }: { articles: InsightArticle[]; actionHref?: string }) {
  return (
    <section className="mt-10 border border-[#dfe4ea] bg-white p-5">
      <SectionHeader title="지금 많이 읽는 인사이트" actionHref={actionHref} />
      <div className="divide-y divide-[#e5e9ef]">
        {articles.map((article, index) => (
          <Link
            key={article.id}
            href={`/insights/${article.slug}`}
            className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0"
          >
            <span className="w-6 shrink-0 text-[18px] font-bold text-[#111111]">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[14px] font-bold text-[#171d26] group-hover:underline">{article.title}</h3>
              <p className="mt-1 text-[11px] font-normal text-[#9aa3af]">
                읽기 {formatViews(article.views)} · {article.date}
              </p>
            </div>
            <span className="shrink-0 text-[11px] font-medium text-[#596373]">{article.category}</span>
            <ChevronRight size={16} className="shrink-0 text-[#c2c9d2]" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function InsightsHomeClient() {
  const [activeCategory, setActiveCategory] = useState<InsightCategory>("전체");

  const featuredArticles = useMemo(
    () => featuredInsightIds.map((id) => insights.find((article) => article.id === id)).filter((article): article is InsightArticle => Boolean(article)),
    [],
  );

  const newsLinkedInsights = useMemo(
    () => newsLinkedInsightIds.map((id) => insights.find((article) => article.id === id)).filter((article): article is InsightArticle => Boolean(article)),
    [],
  );

  const leadArticle = useMemo(() => [...insights].sort((a, b) => b.views - a.views)[0], []);

  const latestArticles = useMemo(() => [...insights].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4), []);

  const rankedArticles = useMemo(() => [...insights].sort((a, b) => b.views - a.views).slice(0, 5), []);

  const categoryArticles = useMemo(() => {
    if (activeCategory === "전체" || activeCategory === "직무백과") return [];
    return insights.filter((article) => article.category === activeCategory);
  }, [activeCategory]);

  return (
    <main className="bg-white pb-16">
      <section className="border-b border-[#e4e7eb] bg-white">
        <div className="app-shell">
          <CategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} />
        </div>
      </section>

      <div className="app-shell">
        {activeCategory === "전체" ? (
          <>
            <section className="mt-7">
              <div className="group relative min-h-[300px] overflow-hidden border border-[#dce2e8] bg-[#070a0d] text-white">
                <img src={leadArticle.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 grayscale" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_45%,rgba(0,0,0,0.22)_100%)]" />
                <div className="relative z-10 max-w-[760px] px-9 pb-10 pt-[68px] max-[720px]:px-6 max-[720px]:pt-10">
                  <Link href={`/insights/${leadArticle.slug}`} className="block">
                    <span className="inline-flex h-7 items-center bg-[#111111] px-3 text-[11px] font-medium text-white">{leadArticle.category}</span>
                    <h1 className="mt-7 max-w-[820px] text-[38px] font-extrabold leading-[1.25] tracking-[-0.02em] text-white group-hover:underline max-[720px]:text-[24px]">
                      {leadArticle.title}
                    </h1>
                    <p className="mt-5 max-w-[620px] text-[15px] font-normal leading-[1.75] tracking-[-0.01em] text-white/72">{leadArticle.description}</p>
                    <p className="mt-6 text-[12px] font-normal text-white/55">
                      {leadArticle.date} · 읽기 {formatViews(leadArticle.views)}
                    </p>
                  </Link>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href={`/insights/${leadArticle.slug}`}
                      className="inline-flex h-11 items-center border border-white bg-white px-5 text-[13px] font-medium text-[#111111] hover:bg-[#f3f4f5]"
                    >
                      자세히 보기
                    </Link>
                    <Link
                      href="/jobs"
                      className="inline-flex h-11 items-center border border-white/28 bg-white/8 px-5 text-[13px] font-medium text-white hover:bg-white/14"
                    >
                      관련 채용공고 보기
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <SectionHeader title="주목할 만한 인사이트" actionHref="/insights" />
              <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
                {featuredArticles.map((article) => (
                  <InsightCard key={article.id} article={article} />
                ))}
              </div>
            </section>

            <RankedInsights articles={rankedArticles} />

            <section className="mt-10 border border-[#dfe4ea] bg-white p-5">
              <SectionHeader title="데이터로 보는 제약바이오" />
              <div className="grid grid-cols-4 gap-3 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
                {insightDataCards.map((card) => (
                  <article key={card.label} className="border border-[#e1e6ec] bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[12px] font-medium text-[#596373]">{card.label}</p>
                      <Database size={18} className="text-[#8c98a7]" />
                    </div>
                    <p className="mt-4 text-[28px] font-bold tracking-[-0.02em] text-[#111827]">{card.value}</p>
                    <p className="mt-3 text-[12px] font-normal text-[#667181]">
                      <span className="font-semibold text-[#337ddf]">{card.change}</span> {card.caption}
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
                      <span className="border border-[#dfe4ea] bg-[#f7f8fa] px-2 py-1 text-[11px] font-medium text-[#596373]">{article.category}</span>
                      <span className="text-[11px] font-normal text-[#9aa3af]">{article.date}</span>
                    </div>
                    <h3 className="mt-4 line-clamp-2 min-h-[44px] text-[16px] font-bold leading-[1.45] tracking-[-0.02em] text-[#171d26] group-hover:underline">
                      {article.title}
                    </h3>
                    <div className="mt-5 flex items-center justify-between gap-3 text-[11px] font-normal text-[#7b8491]">
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
                      <span className="text-[11px] font-medium text-[#596373]">{article.category}</span>
                      <h3 className="mt-2 line-clamp-2 text-[16px] font-bold leading-[1.45] tracking-[-0.02em] text-[#171d26] group-hover:underline">{article.title}</h3>
                      <p className="mt-3 line-clamp-3 text-[12px] font-normal leading-[1.65] text-[#6f7783]">{article.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="mt-10">
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#8a94a3]">{insightCategoryMeta[activeCategory].eyebrow}</p>
            <h1 className="mt-3 text-[31px] font-bold tracking-[-0.02em] text-[#111111]">
              {activeCategory}{" "}
              <span className="text-[15px] font-medium text-[#8a94a3]">
                총 <span className="font-bold text-[#111111]">{activeCategory === "직무백과" ? insightJobWikiEntries.length : categoryArticles.length}</span>
                개{activeCategory === "직무백과" ? " 직무" : "의 글"}
              </span>
            </h1>
            <p className="mt-3 text-[14px] font-normal text-[#68717e]">{insightCategoryMeta[activeCategory].description}</p>

            <div className="mt-8 grid grid-cols-3 gap-4 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
              {activeCategory === "직무백과"
                ? insightJobWikiEntries.map((entry) => <JobWikiCard key={entry.code} entry={entry} />)
                : categoryArticles.map((article) => <CategoryArticleCard key={article.id} article={article} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
