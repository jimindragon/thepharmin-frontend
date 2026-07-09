import clsx from "clsx";
import Link from "next/link";
import { type ReactNode } from "react";
import { BriefcaseBusiness, ChevronRight, ExternalLink, Heart, MapPin, MessageSquareText, ThumbsUp } from "lucide-react";
import { CompanyJobsGrid } from "@/components/company/CompanyJobsGrid";
import { getHospitalCombinedTypeLabel, getPharmacyTypeLabel } from "@/config/companyTypes";
import { medicalDepartmentOptions } from "@/config/jobFilters/hospitalFilters";
import { pharmacyFeatureOptions } from "@/config/jobFilters/pharmacyFilters";
import { companies, companyReviews } from "@/data/companies";
import { type CompanyDirectoryEntry, companyDirectory, getActiveJobCount, getActiveJobs, provinceFromAddress } from "@/data/companyDirectory";
import type { CompanyProfile, CompanyProfileFeature } from "@/data/companyProfiles";
import type { Company, CompanyReview, CompanyReviewType, HospitalType } from "@/types/jobs";

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

export function Chip({ children, tone = "default", size = "md" }: { children: ReactNode; tone?: "default" | "accent" | "dark"; size?: "md" | "sm" }) {
  const sizing = size === "sm" ? "h-7 px-2.5 text-[11px]" : "h-8 px-3 text-[12px]";
  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium",
        sizing,
        tone === "accent"
          ? "border border-[#d8e0e8] bg-[#f7f8fa] text-[#46505f]"
          : tone === "dark"
            ? "bg-[#111111] text-white"
            : "border border-[#e2e7ee] bg-[#f8fafb] text-[#596373]",
      )}
    >
      {children}
    </span>
  );
}

/** 사이드바 "핵심 정보" 블록 바로 아래에 붙는 핵심 키워드 카드. 좌측 3px 보더 제목 + 칩 wrap.
 * 본문의 핵심 키워드 카드(CompanyDetailOverview 등)와 달리 사이드바 밀도에 맞춰 칩을 한 단계 축소한다. */
function SidebarKeywordsCard({ keywords }: { keywords: string[] }) {
  if (!keywords.length) return null;
  return (
    <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
      <h2 className="border-l-[3px] border-[#111111] pl-2.5 text-[14px] font-bold leading-none tracking-[-0.01em] text-[#202733]">핵심 키워드</h2>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {keywords.map((keyword) => (
          <Chip key={keyword} tone="accent" size="sm">
            {keyword}
          </Chip>
        ))}
      </div>
    </section>
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
            {metric.caption ? <p className="mt-2 text-[12px] font-medium text-[#8a95a5]">{metric.caption}</p> : null}
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3 border border-[#e2e8ef] bg-[#fbfcfd] p-4 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
        {profile.businessSummary.map((item) => (
          <div key={item.label}>
            <p className="text-[12px] font-medium text-[#738091]">{item.label}</p>
            <p className="mt-2 text-[14px] font-normal leading-[1.55] text-[#303946]">{item.value ?? "정보 없음"}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CompanyDetailOverview({ profile }: { profile: CompanyProfile }) {
  return (
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
      <div className="mt-6 grid grid-cols-3 gap-x-10 gap-y-4 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
        {profile.details.map((item) => (
          <div key={item.label} className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 text-[13px]">
            <dt className="font-medium text-[#8a94a3]">{item.label}</dt>
            <dd className="font-medium leading-[1.6] text-[#3c4654]">{item.value ?? "정보 없음"}</dd>
          </div>
        ))}
      </div>
    </div>
  );
}

/** tags 배열들을 합쳐 등장 빈도순 상위 N개를 뽑는다. 동빈도는 먼저 등장한 순서를 유지한다(Map 삽입 순서).
 * 인자를 string[][]로 제한해 review 원본(특히 content)이 이 계산 경로로 흘러들 수 없게 한다. */
function topTagsByFrequency(tagLists: string[][], limit = 5) {
  const counts = new Map<string, number>();
  for (const tags of tagLists) {
    for (const tag of tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

/** 미리보기 카드가 받는 값은 companyReviews의 부분집합이다 — content가 필드 자체에 없으므로
 * (React가 서버 컴포넌트 JSX 엘리먼트의 props까지 플라이트 페이로드에 실어 보내는 것과 무관하게)
 * 원문이 클라이언트로 전달될 수 없다. 새 필드가 필요해지면 여기 타입에 명시적으로 추가할 것 — review 원본을
 * 그대로 넘기지 말 것. */
interface CompanyReviewPreviewItem {
  id: string;
  type: CompanyReviewType;
  tags: string[];
  jobRole: string;
  authorStatus: string;
  writtenAt: string;
  helpfulCount: number;
  outcome?: "합격" | "불합격";
}

function toReviewPreviewItem(review: CompanyReview): CompanyReviewPreviewItem {
  return {
    id: review.id,
    type: review.type,
    tags: review.tags,
    jobRole: review.jobRole,
    authorStatus: review.authorStatus,
    writtenAt: review.writtenAt,
    helpfulCount: review.helpfulCount,
    outcome: review.outcome,
  };
}

function ReviewPreviewCard({ review, showOutcome }: { review: CompanyReviewPreviewItem; showOutcome: boolean }) {
  return (
    <article className="border border-[#e5e9ef] bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[12px] font-medium text-[#3f4855]">
          {review.jobRole} · {review.authorStatus}
        </span>
        <span className="shrink-0 text-[11px] font-normal text-[#9aa5b2]">{review.writtenAt}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {review.tags.map((tag) => (
          <span key={tag} className="border border-[#e4e9ef] bg-[#f8fafb] px-2 py-1 text-[11px] font-medium text-[#596373]">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-[#edf1f5] pt-3 text-[11px]">
        <span className="inline-flex items-center gap-1 font-normal text-[#8a95a5]">
          <ThumbsUp size={12} />
          {review.helpfulCount}
        </span>
        {showOutcome && review.outcome ? (
          <span
            className={clsx(
              "border px-2 py-0.5",
              review.outcome === "합격" ? "border-[#111111] font-bold text-[#111111]" : "border-[#d9d9d9] font-medium text-[#777777]",
            )}
          >
            {review.outcome}
          </span>
        ) : null}
      </div>
    </article>
  );
}

/** 개요 페이지의 면접 후기/기업 리뷰 미리보기 — 원문은 절대 내려받지 않고(companyReviews는 항상 원문을 갖고 있지만
 * 이 컴포넌트가 content를 아예 읽지 않는다), 최신 2건 + 전체 보기 링크만 보여준다. 게이팅은 전용 페이지(/interviews)의
 * 몫이라 여기서는 고려하지 않는다. */
export function CompanyReviewsPreviewSection({ profile, type }: { profile: CompanyProfile; type: CompanyReviewType }) {
  const isInterview = type === "interview";
  const title = isInterview ? "면접 후기" : "현직자 리뷰";
  const href = `/companies/${profile.id}/${isInterview ? "interviews" : "reviews"}`;

  const all = companyReviews
    .filter((review) => review.companyId === profile.id && review.type === type)
    .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt));
  const preview = all.slice(0, 2).map(toReviewPreviewItem);
  const topKeywords = all.length >= 3 ? topTagsByFrequency(all.map((review) => review.tags)) : [];

  return (
    <SectionShell
      title={title}
      action={
        <Link href={href} className="inline-flex items-center gap-1 text-[13px] font-medium text-[#596373] hover:text-[#111111]">
          전체 보기
          <ChevronRight size={15} />
        </Link>
      }
    >
      {all.length ? (
        <>
          <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
            {preview.map((review) => (
              <ReviewPreviewCard key={review.id} review={review} showOutcome={isInterview} />
            ))}
          </div>
          {topKeywords.length ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#edf1f5] pt-4">
              <span className="text-[12px] font-medium text-[#8a95a5]">자주 언급된 키워드</span>
              {topKeywords.map((keyword) => (
                <Chip key={keyword}>{keyword}</Chip>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          message={`아직 등록된 ${title}가 없습니다.`}
          cta={
            <Link
              href={href}
              className="inline-flex h-10 items-center border border-[#111111] px-4 text-[13px] font-medium text-[#111111] transition hover:bg-[#111111] hover:text-white"
            >
              첫 후기 작성하기
            </Link>
          }
        />
      )}
    </SectionShell>
  );
}

export function CompanyJobsPreview({ profile }: { profile: CompanyProfile }) {
  const activeJobs = getActiveJobs(profile.id);

  return (
    <SectionShell
      title="채용공고"
      description={`현재 채용중인 공고 ${activeJobs.length}건 중 주요 공고를 먼저 확인해 보세요.`}
      action={
        <Link href={`/jobs?company=${profile.id}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-[#596373] hover:text-[#111111]">
          더보기
          <ChevronRight size={15} />
        </Link>
      }
    >
      {activeJobs.length ? (
        <CompanyJobsGrid jobs={activeJobs} />
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
    { label: "채용중 공고", value: `${getActiveJobCount(profile.id)}건`, icon: BriefcaseBusiness },
    { label: "후기 키워드", value: profile.sidebar.reviewKeywordCount, icon: MessageSquareText },
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

      {profile.sidebar.products.length > 0 ? (
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
      ) : null}

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

      <InstitutionReviewMoreCard companyId={profile.id} />
    </aside>
  );
}

/* ── 병원·약국 트랙 개요 (N3 상세 개편) — 산업·CRO 트랙은 위 컴포넌트를 그대로 쓴다, 아래는 건드리지 않는다 ── */

interface SummaryRow {
  label: string;
  value: string;
}

function detailValue(profile: CompanyProfile, label: string) {
  return profile.details.find((item) => item.label === label)?.value ?? undefined;
}

function metricValue(profile: CompanyProfile, label: string) {
  return profile.metrics.find((item) => item.label === label)?.value;
}

function buildHospitalSummaryRows(profile: CompanyProfile, company: Company): SummaryRow[] {
  const typeLabel =
    company.hospitalType && company.hospitalOperator
      ? getHospitalCombinedTypeLabel(company.hospitalType, company.hospitalOperator, company.specialtyLabel)
      : undefined;

  const rows: (SummaryRow | { label: string; value: string | undefined })[] = [
    { label: "병원장", value: detailValue(profile, "대표자") },
    { label: "설립", value: detailValue(profile, "설립일") },
    { label: "병원 유형", value: typeLabel },
    { label: "병상 수", value: metricValue(profile, "병상 수") },
    { label: "약제부 인력", value: metricValue(profile, "약제부 인력") },
    { label: "당직 체계", value: profile.dutySystem },
    { label: "연간 임상시험", value: metricValue(profile, "연간 임상시험") },
    { label: "위치", value: detailValue(profile, "본사 위치") },
    { label: "홈페이지", value: detailValue(profile, "홈페이지") },
  ];
  return rows.filter((row): row is SummaryRow => Boolean(row.value));
}

function buildPharmacySummaryRows(profile: CompanyProfile, company: Company): SummaryRow[] {
  const pharmacistCount = profile.businessSummary.find((item) => item.label === "근무 약사")?.value;
  const staffCount = profile.businessSummary.find((item) => item.label === "직원")?.value;
  const staffComposition =
    [pharmacistCount ? `근무약사 ${pharmacistCount}` : null, staffCount ? `직원 ${staffCount}` : null].filter(Boolean).join(" · ") || undefined;

  const rows: (SummaryRow | { label: string; value: string | undefined })[] = [
    { label: "대표약사", value: detailValue(profile, "대표자") },
    { label: "개국", value: detailValue(profile, "설립일") },
    { label: "약국 유형", value: company.pharmacyType ? getPharmacyTypeLabel(company.pharmacyType) : undefined },
    { label: "근무자 구성", value: staffComposition },
    { label: "일평균 처방", value: metricValue(profile, "일평균 처방") },
    { label: "주처방 진료과", value: metricValue(profile, "주요 처방과") },
    { label: "전산소프트웨어", value: profile.pharmacySoftware },
    { label: "영업시간", value: profile.businessHours },
    { label: "위치", value: detailValue(profile, "본사 위치") },
  ];
  return rows.filter((row): row is SummaryRow => Boolean(row.value));
}

function InstitutionSummaryCard({
  title,
  recruitSummary,
  homepage,
  rows,
  features,
}: {
  title: string;
  recruitSummary: string;
  homepage?: string;
  rows: SummaryRow[];
  features?: CompanyProfileFeature[];
}) {
  return (
    <div className="border border-border bg-white p-6 shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-4 max-[640px]:flex-col">
        <div>
          <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#202733]">{title}</h2>
          <p className="mt-3 text-[14px] font-normal leading-[1.85] text-[#596373]">{recruitSummary}</p>
        </div>
        {homepage ? (
          <a
            href={`https://${homepage}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 shrink-0 items-center gap-2 border border-[#d8e0e8] px-3 text-[12px] font-medium text-[#4f5a66] transition hover:border-[#111111] hover:text-[#111111]"
          >
            기업 홈페이지 바로가기
            <ExternalLink size={14} />
          </a>
        ) : null}
      </div>
      {rows.length ? (
        <div className="mt-6 grid grid-cols-3 gap-x-10 gap-y-4 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 text-[13px]">
              <dt className="font-medium text-[#8a94a3]">{row.label}</dt>
              <dd className="font-medium leading-[1.6] text-[#3c4654]">{row.value}</dd>
            </div>
          ))}
        </div>
      ) : null}
      {features && features.length ? (
        <div className="mt-6 border-t border-[#edf1f5] pt-5">
          <h3 className="text-[15px] font-bold text-[#202733]">기관 특징</h3>
          <div className="mt-3 grid gap-3">
            {features.map((feature) => (
              <div key={feature.label} className="grid grid-cols-[150px_minmax(0,1fr)] gap-4 text-[13px] max-[560px]:grid-cols-1 max-[560px]:gap-1">
                <dt className="font-medium text-[#8a94a3]">{feature.label}</dt>
                <dd className="font-normal leading-[1.6] text-[#3c4654]">{feature.text}</dd>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** [companyId] 개요 탭 — 병원 트랙. "한눈에 보는 기업" 지표 그리드를 없애고 "병원 요약" 카드 하나로 통합한다.
 * 핵심 키워드는 사이드바(InstitutionCoreInfoCard 바로 아래)로 이동했다 — 본문에는 요약 카드만 전체 폭으로 노출한다. */
export function HospitalSummarySection({ profile, company }: { profile: CompanyProfile; company: Company }) {
  return (
    <InstitutionSummaryCard
      title="병원 요약"
      recruitSummary={profile.recruitSummary}
      homepage={detailValue(profile, "홈페이지")}
      rows={buildHospitalSummaryRows(profile, company)}
      features={profile.features}
    />
  );
}

/** [companyId] 개요 탭 — 약국 트랙. 병원과 동일 골격, "약국 요약" 카드로 통합한다. 핵심 키워드는 사이드바로 이동했다. */
export function PharmacySummarySection({ profile, company }: { profile: CompanyProfile; company: Company }) {
  return (
    <InstitutionSummaryCard
      title="약국 요약"
      recruitSummary={profile.recruitSummary}
      homepage={detailValue(profile, "홈페이지")}
      rows={buildPharmacySummaryRows(profile, company)}
      features={profile.features}
    />
  );
}

function reviewSummaryLabel(companyId: string) {
  const interviewCount = companyReviews.filter((review) => review.companyId === companyId && review.type === "interview").length;
  const companyReviewCount = companyReviews.filter((review) => review.companyId === companyId && review.type === "company").length;
  return `면접 ${interviewCount} · 리뷰 ${companyReviewCount}`;
}

/** 병원·약국 트랙 사이드바 상단 — 산업 트랙 CompanyAsidePanel의 6~7항목 대신 3항목만 보여준다 */
function InstitutionCoreInfoCard({ profile }: { profile: CompanyProfile }) {
  const infoItems = [
    { label: "관심 기관", value: profile.sidebar.interestedCount, icon: Heart },
    { label: "채용중 공고", value: `${getActiveJobCount(profile.id)}건`, icon: BriefcaseBusiness },
    { label: "후기", value: reviewSummaryLabel(profile.id), icon: MessageSquareText },
  ];
  return (
    <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
      <h2 className="text-[19px] font-bold tracking-[-0.02em] text-[#202733]">기관 핵심 정보</h2>
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
  );
}

function ChipListCard({ title, items, note }: { title: string; items: string[]; note?: string }) {
  if (!items.length) return null;
  return (
    <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
      <h2 className="text-[19px] font-bold tracking-[-0.02em] text-[#202733]">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <Chip key={item} tone="accent">
            {item}
          </Chip>
        ))}
      </div>
      {note ? <p className="mt-3 text-[12px] font-normal text-[#8a95a5]">{note}</p> : null}
    </section>
  );
}

interface RelatedInstitutionsResult {
  title: string;
  items: CompanyDirectoryEntry[];
}

/** 같은 hospitalType + 채용중인 병원을 우선 추천하고, 없으면 전체 병원 중 채용중인 곳(채용중 공고 많은 순)으로 폴백한다.
 * 그마저도 없으면 null(블록 자체 미노출) */
function relatedHospitals(currentId: string, hospitalType: HospitalType | undefined): RelatedInstitutionsResult | null {
  const candidates = companyDirectory.filter((entry) => entry.track === "hospital" && entry.id !== currentId && entry.activeJobCount > 0);

  if (hospitalType) {
    const sameType = candidates.filter((entry) => companies.find((item) => item.id === entry.id)?.hospitalType === hospitalType);
    if (sameType.length) return { title: "같은 유형 채용중 병원", items: sameType };
  }
  if (candidates.length) {
    return { title: "현재 채용 중인 병원", items: [...candidates].sort((a, b) => b.activeJobCount - a.activeJobCount) };
  }
  return null;
}

/** 같은 시·도(주소 첫 토큰) + 채용중인 약국을 우선 추천하고, 없으면 전국 채용중인 약국으로 폴백한다.
 * 그마저도 없으면 null(블록 자체 미노출) */
function relatedPharmacies(currentId: string, address: string): RelatedInstitutionsResult | null {
  const province = provinceFromAddress(address);
  const candidates = companyDirectory.filter((entry) => entry.track === "pharmacy" && entry.id !== currentId && entry.activeJobCount > 0);

  const sameProvince = candidates.filter((entry) => {
    const candidateCompany = companies.find((item) => item.id === entry.id);
    return candidateCompany ? provinceFromAddress(candidateCompany.address) === province : false;
  });
  if (sameProvince.length) return { title: "같은 지역 채용중 약국", items: sameProvince };
  if (candidates.length) {
    return { title: "현재 채용 중인 약국", items: [...candidates].sort((a, b) => b.activeJobCount - a.activeJobCount) };
  }
  return null;
}

function RelatedInstitutionsCard({ result }: { result: RelatedInstitutionsResult | null }) {
  if (!result || !result.items.length) return null;
  return (
    <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
      <h2 className="text-[19px] font-bold tracking-[-0.02em] text-[#202733]">{result.title}</h2>
      <div className="mt-4 grid gap-3">
        {result.items.slice(0, 5).map((entry) => (
          <Link
            key={entry.id}
            href={entry.detailHref}
            className="flex items-center justify-between gap-3 border-b border-[#edf1f5] pb-3 text-[13px] last:border-b-0 last:pb-0 hover:text-[#111111]"
          >
            <span className="font-medium text-[#3c4654]">{entry.name}</span>
            <span className="shrink-0 text-[12px] font-medium text-[#8a95a5]">채용중 {entry.activeJobCount}건</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function InstitutionLocationCard({ address }: { address: string }) {
  return (
    <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
      <h2 className="text-[19px] font-bold tracking-[-0.02em] text-[#202733]">위치</h2>
      <p className="mt-3 text-[13px] font-medium leading-[1.7] text-[#596373]">{address}</p>
      <div className="mt-4 grid h-[130px] place-items-center border border-[#dfe6ee] bg-[#f3f5f7]">
        <div className="text-center">
          <MapPin className="mx-auto text-[#596373]" size={24} />
          <p className="mt-2 text-[12px] font-medium text-[#596373]">지도 preview</p>
        </div>
      </div>
      <button className="mt-3 text-[12px] font-medium text-[#596373] hover:text-[#111111]">지도에서 보기</button>
    </section>
  );
}

function InstitutionApplyCTACard({ companyId }: { companyId: string }) {
  return (
    <section className="border border-[#b9ddd9] bg-[linear-gradient(135deg,#f6fbfa_0%,#eef8f6_100%)] p-5 shadow-[var(--shadow)]">
      <h2 className="text-[22px] font-bold leading-[1.35] tracking-[-0.02em] text-[#202733]">이 회사에 지원하고 싶다면?</h2>
      <p className="mt-2 text-[13px] font-medium leading-[1.65] text-[#687382]">지금 채용공고를 확인해보세요.</p>
      <Link
        href={`/jobs?company=${companyId}`}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 bg-[#111111] text-[14px] font-medium text-white hover:bg-[#2a2a2a]"
      >
        채용공고 보기
        <ChevronRight size={16} />
      </Link>
    </section>
  );
}

function InstitutionReviewMoreCard({ companyId }: { companyId: string }) {
  return (
    <section className="border border-border bg-white p-5 shadow-[var(--shadow)]">
      <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#202733]">더 많은 후기를 확인해보세요</h2>
      <p className="mt-2 text-[12px] font-normal leading-[1.65] text-[#667181]">현직자 리뷰와 면접 후기를 한 곳에서 확인할 수 있습니다. 후기를 작성하면 열람 기회가 제공됩니다.</p>
      <Link
        href={`/companies/${companyId}/reviews`}
        className="mt-4 inline-flex h-10 w-full items-center justify-center bg-[#202733] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#111111]"
      >
        후기 페이지 보기
      </Link>
      <div className="mt-3 flex items-center justify-center gap-2 text-[12px] text-[#8b95a1]">
        <Link href={`/companies/${companyId}/reviews/new`} className="hover:text-[#4f5a66] hover:underline">
          리뷰 작성
        </Link>
        <span aria-hidden className="text-[#cfd6de]">
          ·
        </span>
        <Link href={`/companies/${companyId}/interviews/new`} className="hover:text-[#4f5a66] hover:underline">
          면접 후기 작성
        </Link>
      </div>
    </section>
  );
}

/** [companyId] 개요 탭 사이드바 — 병원 트랙. 대표 제품 블록은 병원·약국 트랙에서 노출하지 않는다 */
export function HospitalAsidePanel({ profile, company }: { profile: CompanyProfile; company: Company }) {
  const related = relatedHospitals(profile.id, company.hospitalType);
  const medicalDepartmentLabels = (profile.medicalDepartments ?? [])
    .map((id) => medicalDepartmentOptions.find((option) => option.id === id)?.label)
    .filter((label): label is string => Boolean(label));
  return (
    <aside className="sticky top-[88px] grid h-fit gap-4 self-start max-[1120px]:static">
      <InstitutionCoreInfoCard profile={profile} />
      <ChipListCard title="진료과목" items={medicalDepartmentLabels} />
      <ChipListCard title="전문약사 보유" items={profile.specialistPharmacists ?? []} note="기관이 등록한 분야만 표시됩니다" />
      <RelatedInstitutionsCard result={related} />
      <InstitutionLocationCard address={profile.sidebar.address} />
      <InstitutionApplyCTACard companyId={profile.id} />
      <InstitutionReviewMoreCard companyId={profile.id} />
    </aside>
  );
}

/** [companyId] 개요 탭 사이드바 — 약국 트랙. 대표 제품 블록은 병원·약국 트랙에서 노출하지 않는다 */
export function PharmacyAsidePanel({ profile, company }: { profile: CompanyProfile; company: Company }) {
  const related = relatedPharmacies(profile.id, company.address);
  const pharmacyFeatureLabel = profile.pharmacyFeatures
    ? pharmacyFeatureOptions.find((option) => option.id === profile.pharmacyFeatures)?.label
    : undefined;
  return (
    <aside className="sticky top-[88px] grid h-fit gap-4 self-start max-[1120px]:static">
      <InstitutionCoreInfoCard profile={profile} />
      <SidebarKeywordsCard keywords={profile.keywords} />
      <ChipListCard title="조제 환경·장비" items={profile.dispensingEquipment ?? []} />
      <ChipListCard title="조제 특성" items={pharmacyFeatureLabel ? [pharmacyFeatureLabel] : []} />
      <RelatedInstitutionsCard result={related} />
      <InstitutionLocationCard address={profile.sidebar.address} />
      <InstitutionApplyCTACard companyId={profile.id} />
      <InstitutionReviewMoreCard companyId={profile.id} />
    </aside>
  );
}
