"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import {
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock3,
  ExternalLink,
  Heart,
  MapPin,
  MessageSquareText,
  Share2,
  ShieldCheck,
  ThumbsUp,
  Users,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import type { CompanyProfile, KeywordReview } from "@/data/companyProfiles";

interface CompanyProfileClientProps {
  profile: CompanyProfile;
}

const tabs = [
  { id: "overview", label: "기업 개요" },
  { id: "jobs", label: "채용공고" },
  { id: "interviews", label: "면접 후기" },
  { id: "reviews", label: "기업 후기" },
  { id: "news", label: "더파마뉴스에서 본 이 기업" },
  { id: "salary", label: "연봉 정보" },
  { id: "culture", label: "복지 및 문화" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SectionShell({
  id,
  title,
  description,
  action,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[130px] border border-border bg-white p-6 shadow-[var(--shadow)] max-[720px]:p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-black tracking-[0] text-[#202733] max-[720px]:text-[19px]">{title}</h2>
          {description ? <p className="mt-2 text-[13px] font-semibold leading-[1.65] text-[#7b8594]">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "dark" }) {
  return (
    <span
      className={
        tone === "accent"
          ? "inline-flex h-8 items-center border border-[#b8dfdb] bg-[#f4fbfa] px-3 text-[12px] font-black text-[#00746c]"
          : tone === "dark"
            ? "inline-flex h-8 items-center bg-[#111111] px-3 text-[12px] font-black text-white"
            : "inline-flex h-8 items-center border border-[#e2e7ee] bg-[#f8fafb] px-3 text-[12px] font-bold text-[#596373]"
      }
    >
      {children}
    </span>
  );
}

function EmptyState({ message, cta }: { message: string; cta?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-[#d8e0e8] bg-[#fbfcfd] px-5 py-8 text-center">
      <p className="text-[14px] font-bold text-[#6c7684]">{message}</p>
      {cta ? <div className="mt-4">{cta}</div> : null}
    </div>
  );
}

function CompanyHero({ profile }: { profile: CompanyProfile }) {
  const [interested, setInterested] = useState(false);
  const [shared, setShared] = useState(false);

  const shareCompany = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: profile.name, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(url);
    setShared(true);
    window.setTimeout(() => setShared(false), 1800);
  };

  return (
    <section className="relative overflow-hidden border border-[#d6dde6] bg-[#081015] text-white shadow-[var(--shadow)]">
      <img src={profile.coverImage} alt={`${profile.name} 기업 이미지`} className="absolute inset-0 h-full w-full object-cover opacity-42" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,14,0.92)_0%,rgba(3,10,14,0.75)_48%,rgba(3,10,14,0.38)_100%)]" />
      <div className="relative z-10 px-8 py-8 max-[720px]:px-5 max-[720px]:py-6">
        <span className="inline-flex h-7 items-center bg-[#111111]/80 px-3 text-[11px] font-black text-[#e5d27b] ring-1 ring-white/12">{profile.premiumLabel}</span>
        <div className="mt-7 flex items-end justify-between gap-6 max-[820px]:items-start max-[820px]:flex-col">
          <div className="flex min-w-0 items-center gap-6 max-[640px]:items-start max-[640px]:gap-4">
            <div className="grid h-[118px] w-[118px] shrink-0 place-items-center border border-white/24 bg-white text-center text-[16px] font-black leading-tight text-[#17212c] shadow-[0_18px_42px_rgba(0,0,0,0.22)] max-[640px]:h-[92px] max-[640px]:w-[92px] max-[640px]:text-[13px]">
              {profile.logoImage ? <img src={profile.logoImage} alt={`${profile.name} 로고`} className="h-full w-full object-contain p-4" /> : profile.logoText}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[30px] font-black tracking-[0] text-white max-[640px]:text-[23px]">{profile.name}</h1>
                <span className="inline-flex h-7 items-center gap-1 border border-[#b8dfdb]/60 bg-white/10 px-2.5 text-[11px] font-black text-[#dff7f4]">
                  <ShieldCheck size={13} />
                  {profile.verifiedLabel}
                </span>
              </div>
              <p className="mt-3 text-[15px] font-semibold text-white/86 max-[640px]:text-[13px]">{profile.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.tags.map((tag) => (
                  <span key={tag} className="inline-flex h-8 items-center bg-white/10 px-3 text-[12px] font-bold text-white/88 ring-1 ring-white/14">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2 max-[640px]:w-full">
            <button
              type="button"
              onClick={() => setInterested((current) => !current)}
              className="inline-flex h-11 items-center justify-center gap-2 border border-white/85 bg-white px-4 text-[13px] font-black text-[#17212c] transition hover:bg-[#f4f4f4] max-[640px]:flex-1"
              aria-pressed={interested}
            >
              <Heart size={16} fill={interested ? "#111111" : "none"} />
              관심기업
            </button>
            <button
              type="button"
              onClick={shareCompany}
              className="inline-flex h-11 items-center justify-center gap-2 border border-white/30 bg-white/10 px-4 text-[13px] font-black text-white transition hover:bg-white/18 max-[640px]:flex-1"
            >
              <Share2 size={16} />
              {shared ? "복사됨" : "공유"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompanyTabs({ profile }: { profile: CompanyProfile }) {
  const tabLabels = useMemo(
    () =>
      tabs.map((tab) => {
        if (tab.id === "jobs") return { ...tab, label: `채용공고 ${profile.jobCount}` };
        if (tab.id === "interviews") return { ...tab, label: `면접 후기 ${profile.interviewReviewCount}` };
        if (tab.id === "reviews") return { ...tab, label: `기업 후기 ${profile.employeeReviewCount}` };
        if (tab.id === "news") return { ...tab, label: `뉴스 ${profile.newsCount}` };
        return tab;
      }),
    [profile],
  );

  return (
    <nav
      data-company-tabs="true"
      className="sticky top-[64px] z-40 border-x border-b border-border bg-white/[0.98] backdrop-blur"
      aria-label="기업 정보 섹션 이동"
    >
      <div className="flex overflow-x-auto">
        {tabLabels.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => scrollToSection(tab.id)}
            className="h-14 shrink-0 border-r border-[#edf1f5] px-6 text-[13px] font-black text-[#4f5967] transition hover:bg-[#f7f8fa] hover:text-[#111111] first:text-brand first:shadow-[inset_0_-2px_0_#00746C]"
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function CompanyOverview({ profile }: { profile: CompanyProfile }) {
  return (
    <SectionShell id="overview" title="한눈에 보는 기업" description="더파마 리크루트가 지원자 관점에서 정리한 기업 기본 정보입니다.">
      <div className="grid grid-cols-4 gap-3 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
        {profile.metrics.map((metric) => (
          <div key={metric.label} className="border border-[#e2e8ef] bg-white p-4">
            <p className="text-[12px] font-black text-[#738091]">{metric.label}</p>
            <p className="mt-3 text-[24px] font-black tracking-[0] text-[#17212c]">{metric.value}</p>
            {metric.caption ? <p className="mt-2 text-[12px] font-bold text-[#8a95a5]">{metric.caption}</p> : null}
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3 border border-[#e2e8ef] bg-[#fbfcfd] p-4 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
        {profile.businessSummary.map((item) => (
          <div key={item.label}>
            <p className="text-[12px] font-black text-[#738091]">{item.label}</p>
            <p className="mt-2 text-[14px] font-extrabold leading-[1.55] text-[#303946]">{item.value}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function CompanyDetailOverview({ profile }: { profile: CompanyProfile }) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)_300px] gap-5 max-[980px]:grid-cols-1">
      <div className="border border-border bg-white p-6 shadow-[var(--shadow)]">
        <div className="flex items-start justify-between gap-4 max-[640px]:flex-col">
          <div>
            <h2 className="text-[22px] font-black tracking-[0] text-[#202733]">더파마 리크루트 기업 요약</h2>
            <p className="mt-3 text-[14px] font-semibold leading-[1.85] text-[#596373]">{profile.recruitSummary}</p>
          </div>
          <a
            href={`https://${profile.details.find((item) => item.label === "홈페이지")?.value ?? "www.thepharma.co.kr"}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 shrink-0 items-center gap-2 border border-[#d8e0e8] px-3 text-[12px] font-black text-[#4f5a66] transition hover:border-[#111111] hover:text-[#111111]"
          >
            기업 홈페이지 바로가기
            <ExternalLink size={14} />
          </a>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 max-[640px]:grid-cols-1">
          {profile.details.map((item) => (
            <div key={item.label} className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 text-[13px]">
              <dt className="font-black text-[#00746c]">{item.label}</dt>
              <dd className="font-bold leading-[1.6] text-[#3c4654]">{item.value}</dd>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-border bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-[18px] font-black text-[#202733]">핵심 키워드</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.keywords.map((keyword) => (
            <Chip key={keyword} tone="accent">
              {keyword}
            </Chip>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompanyJobsPreview({ profile }: { profile: CompanyProfile }) {
  return (
    <SectionShell
      id="jobs"
      title="채용공고"
      description={`현재 채용중인 공고 ${profile.jobCount}건 중 주요 공고를 먼저 확인해 보세요.`}
      action={
        <Link href={`/jobs?company=${profile.id}`} className="inline-flex items-center gap-1 text-[13px] font-black text-[#00746c] hover:text-[#111111]">
          더보기
          <ChevronRight size={15} />
        </Link>
      }
    >
      {profile.jobs.length ? (
        <div className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2 max-[620px]:grid-cols-1">
          {profile.jobs.map((job) => (
            <Link key={job.id} href={job.href} className="group border border-[#e0e6ee] bg-white p-4 transition hover:border-[#111111]">
              <p className="text-[13px] font-black text-danger">{job.dDay}</p>
              <h3 className="mt-3 line-clamp-2 min-h-[42px] text-[15px] font-black leading-[1.45] text-[#202733] group-hover:underline">{job.title}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <span key={tag} className="bg-[#f1f3f5] px-2 py-1 text-[11px] font-bold text-[#667181]">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[12px] font-bold text-[#7b8594]">
                {job.career} · {job.location}
              </p>
              <span className="mt-4 inline-flex text-[12px] font-black text-[#00746c]">상세내용</span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          message="현재 채용중인 공고가 없습니다. 관심기업으로 등록하면 새 공고가 올라올 때 알려드릴게요."
          cta={<button className="h-10 border border-[#111111] px-4 text-[13px] font-black text-[#111111]">관심기업 등록</button>}
        />
      )}
    </SectionShell>
  );
}

function ReviewCard({ review }: { review: KeywordReview }) {
  return (
    <article className="border border-[#e0e6ee] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-black text-[#2f3845]">
          {review.role} · {review.career}
        </p>
        <span className="text-[12px] font-bold text-[#98a2b0]">{review.date}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {review.keywords.map((keyword) => (
          <span key={keyword} className="border border-[#e2e8ef] bg-[#f8fafb] px-2 py-1 text-[11px] font-bold text-[#5f6876]">
            {keyword}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[13px] font-semibold leading-[1.75] text-[#3f4855]">{review.summary}</p>
      <div className="mt-4 flex gap-2 text-[12px] font-bold text-[#7d8796]">
        <button type="button" className="inline-flex items-center gap-1 hover:text-[#111111]">
          <ThumbsUp size={14} />
          도움돼요 {review.helpfulCount ?? 0}
        </button>
        <button type="button" className="inline-flex items-center gap-1 hover:text-[#111111]">
          <Bookmark size={14} />
          저장
        </button>
      </div>
    </article>
  );
}

function CompanyInterviewReviews({ profile }: { profile: CompanyProfile }) {
  return (
    <SectionShell
      id="interviews"
      title="면접 후기"
      description={`최근 면접 후기 ${profile.interviewReviewCount}건을 키워드 중심으로 확인할 수 있습니다.`}
      action={<button className="text-[13px] font-black text-[#00746c] hover:text-[#111111]">더보기</button>}
    >
      {profile.interviewReviews.length ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {profile.interviewTopKeywords.map((keyword) => (
              <Chip key={keyword}>{keyword}</Chip>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 max-[1100px]:grid-cols-2 max-[720px]:grid-cols-1">
            {profile.interviewReviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState message="아직 등록된 후기가 없습니다. 이 기업에 대한 경험을 공유해보세요." cta={<button className="h-10 border border-[#111111] px-4 text-[13px] font-black">면접 후기 작성하기</button>} />
      )}
    </SectionShell>
  );
}

function CompanyCultureReviews({ profile }: { profile: CompanyProfile }) {
  return (
    <SectionShell
      id="reviews"
      title="기업 후기"
      description={`최근 등록 후기 ${profile.employeeReviewCount}건을 근무 키워드 중심으로 정리했습니다.`}
      action={<button className="text-[13px] font-black text-[#00746c] hover:text-[#111111]">더보기</button>}
    >
      {profile.employeeReviews.length ? (
        <>
          <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
            <div className="border border-[#e2e8ef] bg-[#fbfcfd] p-4">
              <p className="text-[13px] font-black text-[#202733]">긍정 키워드</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.employeePositiveKeywords.map((keyword) => (
                  <Chip key={keyword} tone="accent">
                    {keyword}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="border border-[#e2e8ef] bg-[#fbfcfd] p-4">
              <p className="text-[13px] font-black text-[#202733]">개선 키워드</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.employeeImprovementKeywords.map((keyword) => (
                  <Chip key={keyword}>{keyword}</Chip>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 max-[1100px]:grid-cols-2 max-[720px]:grid-cols-1">
            {profile.employeeReviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border border-[#e2e8ef] bg-[#fbfcfd] p-3">
            {profile.employeeTopKeywords.map((keyword) => (
              <Chip key={keyword}>{keyword}</Chip>
            ))}
          </div>
        </>
      ) : (
        <EmptyState message="아직 등록된 후기가 없습니다. 이 기업에 대한 경험을 공유해보세요." cta={<button className="h-10 border border-[#111111] px-4 text-[13px] font-black">기업 후기 작성하기</button>} />
      )}
    </SectionShell>
  );
}

function CompanyNewsSection({ profile }: { profile: CompanyProfile }) {
  return (
    <SectionShell
      id="news"
      title="더파마뉴스에서 본 이 기업"
      description="더파마뉴스에 보도된 기업 관련 기사와 산업 뉴스를 지원자 관점에서 확인해 보세요."
      action={<button className="text-[13px] font-black text-[#00746c] hover:text-[#111111]">더보기</button>}
    >
      {profile.news.length ? (
        <div className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2 max-[620px]:grid-cols-1">
          {profile.news.map((news) => (
            <a key={news.id} href={news.href} target="_blank" rel="noreferrer" className="group overflow-hidden border border-[#e0e6ee] bg-white transition hover:border-[#111111]">
              <div className="h-[122px] bg-[#eef1f4]">
                <img src={news.thumbnail} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
              </div>
              <div className="p-4">
                <p className="text-[11px] font-bold text-[#8a95a5]">{news.date}</p>
                <h3 className="mt-2 line-clamp-2 min-h-[40px] text-[14px] font-black leading-[1.45] text-[#202733]">{news.title}</h3>
                <p className="mt-2 text-[12px] font-bold text-[#00746c]">
                  {news.source} · {news.category}
                </p>
                <p className="mt-2 line-clamp-2 text-[12px] font-semibold leading-[1.6] text-[#667181]">{news.summary}</p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <EmptyState message="아직 연결된 더파마뉴스가 없습니다." />
      )}
    </SectionShell>
  );
}

function CompanyAsidePanel({ profile }: { profile: CompanyProfile }) {
  const infoItems = [
    { label: "관심기업", value: profile.sidebar.interestedCount, icon: Heart },
    { label: "채용중 공고", value: `${profile.jobCount}건`, icon: BriefcaseBusiness },
    { label: "후기 키워드", value: profile.sidebar.reviewKeywordCount, icon: MessageSquareText },
    { label: "응답률", value: profile.sidebar.responseRate, icon: Users },
    { label: "평균 응답 시간", value: profile.sidebar.averageResponseTime, icon: Clock3 },
    { label: "팔로워", value: profile.sidebar.followers, icon: Users },
  ];

  return (
    <aside className="sticky top-[88px] grid h-fit gap-4 self-start max-[1120px]:static">
      <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
        <h2 className="text-[17px] font-black text-[#202733]">기업 핵심 정보</h2>
        <dl className="mt-4 grid gap-3">
          {infoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between gap-3 border-b border-[#edf1f5] pb-3 last:border-b-0 last:pb-0">
                <dt className="flex items-center gap-2 text-[12px] font-bold text-[#697484]">
                  <Icon size={15} />
                  {item.label}
                </dt>
                <dd className="text-[13px] font-black text-[#202733]">{item.value}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
        <h2 className="text-[17px] font-black text-[#202733]">대표 제품</h2>
        <div className="mt-4 grid gap-3">
          {profile.sidebar.products.map((product) => (
            <div key={product.name} className="flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center border border-[#e0e7ee] bg-[#f8fafb] text-[13px] font-black text-[#00746c]">
                {product.name.slice(0, 1)}
              </div>
              <div>
                <p className="text-[13px] font-black text-[#202733]">{product.name}</p>
                <p className="mt-1 text-[12px] font-semibold text-[#7b8594]">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
        <h2 className="text-[17px] font-black text-[#202733]">위치</h2>
        <p className="mt-3 text-[13px] font-bold leading-[1.7] text-[#596373]">{profile.sidebar.address}</p>
        <div className="mt-4 grid h-[130px] place-items-center border border-[#dfe6ee] bg-[#f3f5f7]">
          <div className="text-center">
            <MapPin className="mx-auto text-[#00746c]" size={24} />
            <p className="mt-2 text-[12px] font-black text-[#596373]">지도 preview</p>
          </div>
        </div>
        <button className="mt-3 text-[12px] font-black text-[#00746c] hover:text-[#111111]">지도에서 보기</button>
      </section>

      <section className="border border-[#b9ddd9] bg-[linear-gradient(135deg,#f6fbfa_0%,#eef8f6_100%)] p-5 shadow-[var(--shadow)]">
        <h2 className="text-[20px] font-black leading-[1.35] text-[#202733]">이 회사에 지원하고 싶다면?</h2>
        <p className="mt-2 text-[13px] font-bold leading-[1.65] text-[#687382]">지금 채용공고를 확인해보세요.</p>
        <Link href={`/jobs?company=${profile.id}`} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 bg-[#00746c] text-[14px] font-black text-white hover:bg-[#005e58]">
          채용공고 보기
          <ChevronRight size={16} />
        </Link>
      </section>

      <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
        <h2 className="text-[15px] font-black text-[#202733]">후기를 더 자세히 보려면</h2>
        <p className="mt-2 text-[12px] font-semibold leading-[1.65] text-[#667181]">기업 후기와 면접 후기를 더 자세히 확인하려면 후기를 작성하거나 열람권을 사용하세요.</p>
        <Link href={`/companies/${profile.id}/reviews`} className="mt-3 inline-flex h-10 items-center justify-center border border-[#dfe5ec] px-3 text-[12px] font-black text-[#4f5a66] hover:border-[#111111] hover:text-[#111111]">
          후기 페이지 보기
        </Link>
      </section>
    </aside>
  );
}

function ExtraInfoCards({ profile }: { profile: CompanyProfile }) {
  return (
    <section className="grid grid-cols-4 gap-3 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
      {profile.extraCards.map((card) => (
        <div key={card.title} id={card.title === "연봉 정보" ? "salary" : card.title === "복지 및 문화" ? "culture" : undefined} className="scroll-mt-[130px] border border-border bg-white p-5 shadow-[var(--shadow)]">
          <span className="inline-flex h-7 items-center bg-[#f1f3f5] px-2.5 text-[11px] font-black text-[#6b7280]">{card.status}</span>
          <h3 className="mt-4 text-[17px] font-black text-[#202733]">{card.title}</h3>
          <p className="mt-2 text-[13px] font-semibold leading-[1.65] text-[#667181]">{card.description}</p>
        </div>
      ))}
    </section>
  );
}

function RelatedCompanies({ profile }: { profile: CompanyProfile }) {
  return (
    <section className="border border-border bg-white p-6 shadow-[var(--shadow)]">
      <h2 className="text-[22px] font-black tracking-[0] text-[#202733]">관련 기업</h2>
      <div className="mt-5 grid grid-cols-3 gap-3 max-[820px]:grid-cols-1">
        {profile.relatedCompanies.map((company) => (
          <Link key={company.id} href={company.href} className="border border-[#e0e6ee] p-4 transition hover:border-[#111111]">
            <p className="text-[15px] font-black text-[#202733]">{company.name}</p>
            <p className="mt-2 text-[13px] font-semibold text-[#667181]">{company.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CompanyProfileClient({ profile }: CompanyProfileClientProps) {
  return (
    <main className="bg-[#f5f6f7] pb-24 pt-6">
      <div className="mx-auto w-[min(1280px,calc(100vw-48px))] max-[640px]:w-[calc(100vw-28px)]">
        <PageBreadcrumb className="mb-4" items={[{ label: "기업정보" }, { label: profile.name }]} />

        <CompanyHero profile={profile} />
        <CompanyTabs profile={profile} />

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_300px] gap-6 max-[1120px]:grid-cols-1">
          <div className="grid gap-5">
            <CompanyOverview profile={profile} />
            <CompanyDetailOverview profile={profile} />
            <CompanyJobsPreview profile={profile} />
            <CompanyInterviewReviews profile={profile} />
            <CompanyCultureReviews profile={profile} />
            <CompanyNewsSection profile={profile} />
            <ExtraInfoCards profile={profile} />
            <RelatedCompanies profile={profile} />
          </div>
          <CompanyAsidePanel profile={profile} />
        </div>
      </div>
    </main>
  );
}
