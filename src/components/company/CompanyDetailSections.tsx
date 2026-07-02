import Link from "next/link";
import { type ReactNode } from "react";
import { BriefcaseBusiness, Building2, ChevronRight, Clock3, ExternalLink, Heart, MapPin, MessageSquareText, Users } from "lucide-react";
import type { CompanyProfile } from "@/data/companyProfiles";

/** [companyId] 탭 페이지들(개요/채용공고/면접 후기/기업 리뷰/뉴스)이 공유하는 섹션 빌딩 블록.
 * 예전 앵커 스크롤 시절의 SectionShell은 id/scroll-mt를 가졌지만, 지금은 각 섹션이 별도 라우트의
 * 페이지 콘텐츠 그 자체라 더 이상 앵커가 필요 없다. */
export function SectionShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border border-border bg-white p-6 shadow-[var(--shadow)] max-[720px]:p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#202733] max-[720px]:text-[20px]">{title}</h2>
          {description ? <p className="mt-2 text-[13px] font-normal leading-[1.65] text-[#7b8594]">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "dark" }) {
  return (
    <span
      className={
        tone === "accent"
          ? "inline-flex h-8 items-center border border-[#d8e0e8] bg-[#f7f8fa] px-3 text-[12px] font-medium text-[#46505f]"
          : tone === "dark"
            ? "inline-flex h-8 items-center bg-[#111111] px-3 text-[12px] font-medium text-white"
            : "inline-flex h-8 items-center border border-[#e2e7ee] bg-[#f8fafb] px-3 text-[12px] font-medium text-[#596373]"
      }
    >
      {children}
    </span>
  );
}

export function EmptyState({ message, cta }: { message: string; cta?: ReactNode }) {
  return (
    <div className="border border-dashed border-[#d8e0e8] bg-[#fbfcfd] px-5 py-8 text-center">
      <p className="text-[14px] font-medium text-[#6c7684]">{message}</p>
      {cta ? <div className="mt-4">{cta}</div> : null}
    </div>
  );
}

export function CompanyOverview({ profile }: { profile: CompanyProfile }) {
  return (
    <SectionShell title="한눈에 보는 기업" description="더파마 리크루트가 지원자 관점에서 정리한 기업 기본 정보입니다.">
      <div className="grid grid-cols-4 gap-3 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
        {profile.metrics.map((metric) => (
          <div key={metric.label} className="border border-[#e2e8ef] bg-white p-4">
            <p className="text-[12px] font-medium text-[#738091]">{metric.label}</p>
            <p className="mt-3 text-[24px] font-medium tracking-[0] text-[#17212c]">{metric.value}</p>
            {metric.caption || metric.estimated ? (
              <p className="mt-2 text-[12px] font-medium text-[#8a95a5]">
                {metric.caption}
                {metric.estimated ? <span className="ml-1 text-[#b4791b]">(추정)</span> : null}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3 border border-[#e2e8ef] bg-[#fbfcfd] p-4 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
        {profile.businessSummary.map((item) => (
          <div key={item.label}>
            <p className="text-[12px] font-medium text-[#738091]">{item.label}</p>
            <p className="mt-2 text-[14px] font-normal leading-[1.55] text-[#303946]">
              {item.value ?? "정보 없음"}
              {item.estimated ? <span className="ml-1 text-[12px] font-medium text-[#b4791b]">(추정)</span> : null}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CompanyDetailOverview({ profile }: { profile: CompanyProfile }) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)_300px] gap-5 max-[980px]:grid-cols-1">
      <div className="border border-border bg-white p-6 shadow-[var(--shadow)]">
        <div className="flex items-start justify-between gap-4 max-[640px]:flex-col">
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#202733]">기업 요약</h2>
            <p className="mt-3 text-[14px] font-normal leading-[1.85] text-[#596373]">{profile.recruitSummary}</p>
          </div>
          <a
            href={`https://${profile.details.find((item) => item.label === "홈페이지")?.value ?? "www.thepharma.co.kr"}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 shrink-0 items-center gap-2 border border-[#d8e0e8] px-3 text-[12px] font-medium text-[#4f5a66] transition hover:border-[#111111] hover:text-[#111111]"
          >
            기업 홈페이지 바로가기
            <ExternalLink size={14} />
          </a>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 max-[640px]:grid-cols-1">
          {profile.details.map((item) => (
            <div key={item.label} className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 text-[13px]">
              <dt className="font-medium text-[#8a94a3]">{item.label}</dt>
              <dd className="font-medium leading-[1.6] text-[#3c4654]">
                {item.value ?? "정보 없음"}
                {item.estimated ? <span className="ml-1 text-[11px] font-normal text-[#b4791b]">(추정)</span> : null}
              </dd>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-border bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-[19px] font-bold tracking-[-0.02em] text-[#202733]">핵심 키워드</h2>
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

export function CompanyJobsPreview({ profile }: { profile: CompanyProfile }) {
  return (
    <SectionShell
      title="채용공고"
      description={`현재 채용중인 공고 ${profile.jobs.length}건 중 주요 공고를 먼저 확인해 보세요.`}
      action={
        <Link href={`/jobs?company=${profile.id}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-[#596373] hover:text-[#111111]">
          더보기
          <ChevronRight size={15} />
        </Link>
      }
    >
      {profile.jobs.length ? (
        <div className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2 max-[620px]:grid-cols-1">
          {profile.jobs.map((job) => (
            <Link key={job.id} href={job.href} className="group border border-[#e0e6ee] bg-white p-4 transition hover:border-[#111111]">
              <p className="text-[13px] font-medium text-danger">{job.dDay}</p>
              <h3 className="mt-3 line-clamp-2 min-h-[42px] text-[15px] font-bold leading-[1.45] text-[#202733] group-hover:underline">{job.title}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <span key={tag} className="bg-[#f1f3f5] px-2 py-1 text-[11px] font-medium text-[#667181]">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[12px] font-medium text-[#7b8594]">
                {job.career} · {job.location}
              </p>
              <span className="mt-4 inline-flex text-[12px] font-medium text-[#596373]">상세내용</span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          message="현재 채용중인 공고가 없습니다. 관심기업으로 등록하면 새 공고가 올라올 때 알려드릴게요."
          cta={<button className="h-10 border border-[#111111] px-4 text-[13px] font-medium text-[#111111]">관심기업 등록</button>}
        />
      )}
    </SectionShell>
  );
}

export function CompanyNewsSection({ profile }: { profile: CompanyProfile }) {
  return (
    <SectionShell title="관련 뉴스" description="더파마뉴스에 보도된 기업 관련 기사와 산업 뉴스를 지원자 관점에서 확인해 보세요.">
      {profile.news.length ? (
        <div className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2 max-[620px]:grid-cols-1">
          {profile.news.map((news) => (
            <a key={news.id} href={news.href} target="_blank" rel="noreferrer" className="group overflow-hidden border border-[#e0e6ee] bg-white transition hover:border-[#111111]">
              <div className="h-[122px] bg-[#eef1f4]">
                <img src={news.thumbnail} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
              </div>
              <div className="p-4">
                <p className="text-[11px] font-medium text-[#8a95a5]">{news.date}</p>
                <h3 className="mt-2 line-clamp-2 min-h-[40px] text-[14px] font-bold leading-[1.45] text-[#202733]">{news.title}</h3>
                <p className="mt-2 text-[12px] font-medium text-[#596373]">
                  {news.source} · {news.category}
                </p>
                <p className="mt-2 line-clamp-2 text-[12px] font-normal leading-[1.6] text-[#667181]">{news.summary}</p>
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

export function CompanyAsidePanel({ profile }: { profile: CompanyProfile }) {
  const infoItems = [
    { label: "관심기업", value: profile.sidebar.interestedCount, icon: Heart },
    { label: "채용중 공고", value: `${profile.jobs.length}건`, icon: BriefcaseBusiness },
    { label: "후기 키워드", value: profile.sidebar.reviewKeywordCount, icon: MessageSquareText },
    { label: "응답률", value: profile.sidebar.responseRate, icon: Users },
    { label: "평균 응답 시간", value: profile.sidebar.averageResponseTime, icon: Clock3 },
    { label: "팔로워", value: profile.sidebar.followers, icon: Users },
    ...(profile.sidebar.industryRank ? [{ label: "동종업계 순위", value: profile.sidebar.industryRank, icon: Building2 }] : []),
  ];

  return (
    <aside className="sticky top-[88px] grid h-fit gap-4 self-start max-[1120px]:static">
      <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
        <h2 className="text-[19px] font-bold tracking-[-0.02em] text-[#202733]">기업 핵심 정보</h2>
        <dl className="mt-4 grid gap-3">
          {infoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between gap-3 border-b border-[#edf1f5] pb-3 last:border-b-0 last:pb-0">
                <dt className="flex items-center gap-2 text-[12px] font-medium text-[#697484]">
                  <Icon size={15} />
                  {item.label}
                </dt>
                <dd className="text-[13px] font-medium text-[#202733]">{item.value}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
        <h2 className="text-[19px] font-bold tracking-[-0.02em] text-[#202733]">대표 제품</h2>
        <div className="mt-4 grid gap-3">
          {profile.sidebar.products.map((product) => (
            <div key={product.name} className="flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center border border-[#e0e7ee] bg-[#f8fafb] text-[13px] font-medium text-[#46505f]">
                {product.name.slice(0, 1)}
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#202733]">{product.name}</p>
                <p className="mt-1 text-[12px] font-normal text-[#7b8594]">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
        <h2 className="text-[19px] font-bold tracking-[-0.02em] text-[#202733]">위치</h2>
        <p className="mt-3 text-[13px] font-medium leading-[1.7] text-[#596373]">{profile.sidebar.address}</p>
        <div className="mt-4 grid h-[130px] place-items-center border border-[#dfe6ee] bg-[#f3f5f7]">
          <div className="text-center">
            <MapPin className="mx-auto text-[#596373]" size={24} />
            <p className="mt-2 text-[12px] font-medium text-[#596373]">지도 preview</p>
          </div>
        </div>
        <button className="mt-3 text-[12px] font-medium text-[#596373] hover:text-[#111111]">지도에서 보기</button>
      </section>

      <section className="border border-[#b9ddd9] bg-[linear-gradient(135deg,#f6fbfa_0%,#eef8f6_100%)] p-5 shadow-[var(--shadow)]">
        <h2 className="text-[22px] font-bold leading-[1.35] tracking-[-0.02em] text-[#202733]">이 회사에 지원하고 싶다면?</h2>
        <p className="mt-2 text-[13px] font-medium leading-[1.65] text-[#687382]">지금 채용공고를 확인해보세요.</p>
        <Link href={`/jobs?company=${profile.id}`} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 bg-[#111111] text-[14px] font-medium text-white hover:bg-[#2a2a2a]">
          채용공고 보기
          <ChevronRight size={16} />
        </Link>
      </section>

      <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
        <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#202733]">후기를 더 자세히 보려면</h2>
        <p className="mt-2 text-[12px] font-normal leading-[1.65] text-[#667181]">기업 리뷰와 면접 후기를 더 자세히 확인하려면 후기를 작성하거나 열람권을 사용하세요.</p>
        <Link href={`/companies/${profile.id}/reviews`} className="mt-3 inline-flex h-10 items-center justify-center border border-[#dfe5ec] px-3 text-[12px] font-medium text-[#4f5a66] hover:border-[#111111] hover:text-[#111111]">
          후기 페이지 보기
        </Link>
      </section>
    </aside>
  );
}

export function ExtraInfoCards({ profile }: { profile: CompanyProfile }) {
  return (
    <section className="grid grid-cols-4 gap-3 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
      {profile.extraCards.map((card) => (
        <div key={card.title} className="border border-border bg-white p-5 shadow-[var(--shadow)]">
          <span className="inline-flex h-7 items-center bg-[#f1f3f5] px-2.5 text-[11px] font-medium text-[#6b7280]">{card.status}</span>
          <h3 className="mt-4 text-[18px] font-bold tracking-[-0.02em] text-[#202733]">{card.title}</h3>
          <p className="mt-2 text-[13px] font-normal leading-[1.65] text-[#667181]">{card.description}</p>
        </div>
      ))}
    </section>
  );
}

export function RelatedCompanies({ profile }: { profile: CompanyProfile }) {
  return (
    <section className="border border-border bg-white p-6 shadow-[var(--shadow)]">
      <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#202733]">관련 기업</h2>
      <div className="mt-5 grid grid-cols-3 gap-3 max-[820px]:grid-cols-1">
        {profile.relatedCompanies.map((company) => (
          <Link key={company.id} href={company.href} className="border border-[#e0e6ee] p-4 transition hover:border-[#111111]">
            <p className="text-[15px] font-medium text-[#202733]">{company.name}</p>
            <p className="mt-2 text-[13px] font-normal text-[#667181]">{company.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
