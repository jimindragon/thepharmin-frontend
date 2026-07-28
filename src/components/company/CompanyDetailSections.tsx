import clsx from "clsx";
import Link from "next/link";
import { type ReactNode } from "react";
import {
  BedDouble,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  Calendar,
  ChevronRight,
  ExternalLink,
  Factory,
  Landmark,
  MapPin,
  MessageSquareText,
  Percent,
  Tag,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { CompanyJobsGrid } from "@/components/company/CompanyJobsGrid";
import { CompanyReviewCard, type CompanyReviewCardItem } from "@/components/company/CompanyReviewCard";
import { getPharmacyTypeLabel, hospitalOperatorLabels, hospitalTypeLabels } from "@/config/companyTypes";
import { medicalDepartmentOptions } from "@/config/jobFilters/hospitalFilters";
import { pharmacyFeatureOptions } from "@/config/jobFilters/pharmacyFilters";
import { getResearchInstitutionTypeLabel, researchStaffScaleOptions } from "@/config/jobFilters/researchFilters";
import { getResearchFieldShortLabel } from "@/config/researchFields";
import { companyReviews } from "@/data/companies";
import { getActiveJobCount, getActiveJobs } from "@/data/companyDirectory";
import type { CompanyProfile, CompanyProfileFeature } from "@/data/companyProfiles";
import type { Company, CompanyReview, CompanyReviewType } from "@/types/jobs";

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

export function EmptyState({ message, cta }: { message: string; cta?: ReactNode }) {
  return (
    <div className="border border-dashed border-[#d8e0e8] bg-[#fbfcfd] px-5 py-8 text-center">
      <p className="text-[14px] font-medium text-[#6c7684]">{message}</p>
      {cta ? <div className="mt-4">{cta}</div> : null}
    </div>
  );
}

/** 산업 트랙 "기업 개요" 첫 섹션 — 본문 소개(fullIntro) + 기관 키워드 + 기관 특징만 다룬다(STEP 3a-2).
 * 로고·기관명·한줄소개는 Hero가 이미 보여줘 본문에서 반복하지 않는다. 셋 다 없으면 섹션 자체를 숨긴다. */
export function CompanyOverview({ profile }: { profile: CompanyProfile }) {
  const hasIntro = Boolean(profile.fullIntro);
  const hasKeywords = profile.keywords.length > 0;
  const hasFeatures = Boolean(profile.features?.length);
  if (!hasIntro && !hasKeywords && !hasFeatures) return null;

  return (
    <SectionShell title="기업 소개">
      {profile.fullIntro ? (
        <p className="text-[14px] font-normal leading-relaxed text-[#3f4855]">{profile.fullIntro}</p>
      ) : null}
      {hasKeywords ? (
        <div className={clsx("flex flex-wrap gap-x-2.5 gap-y-1.5", hasIntro && "mt-3")}>
          {profile.keywords.map((keyword) => (
            <span key={keyword} className="text-[13px] font-medium text-[#667181]">
              #{keyword}
            </span>
          ))}
        </div>
      ) : null}
      <InstitutionFeatures features={profile.features} />
    </SectionShell>
  );
}

/** job-detail/shared.tsx의 SummaryStatCell과 동일한 시각 스타일이지만 이 파일에 로컬로 복제했다 — shared.tsx는
 * "use client" 모듈이라, "use client"가 없는 이 서버 컴포넌트에서 아이콘(함수) prop을 그대로 넘기면 RSC 직렬화
 * 오류("Functions cannot be passed directly to Client Components")가 난다(import 재사용이 구조상 부적절한 경우). */
function IndustryStatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-5 text-center">
      <Icon size={20} className="mx-auto text-[#6b7280]" aria-hidden />
      <p className="mt-2 text-[12.5px] font-medium text-[#8893a2]">{label}</p>
      <div className="mt-2 text-[17px] font-bold leading-snug text-[#2f3845]">{value}</div>
    </div>
  );
}

/** 구분선 스타일 파일럿(STEP: B 카드 회색 박스 → 세로 구분선 전환 검토). 산업 트랙 개요의 B 카드 4장에만 시범
 * 적용한다 — 병원·약국·연구 B 카드는 비교 기준으로 IndustryStatCard(박스형)를 그대로 둔다. 배경·보더 박스 없이
 * 아이콘+라벨+값만 남기고, 셀 사이 구분은 부모 그리드의 divide-x가 담당한다(대표 제품 리스트형과 같은
 * "여백+타이포" 문법). */
function IndustryDividerStatCell({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="px-4 py-2 text-center">
      <Icon size={18} className="mx-auto text-[#6b7280]" aria-hidden />
      <p className="mt-2 text-[13px] font-normal text-[#8b95a1]">{label}</p>
      <p className="mt-1 text-[17px] font-bold text-[#17202c]">{value}</p>
    </div>
  );
}

/** job-detail/shared.tsx의 InfoRow와 동일한 시각 스타일을 로컬로 복제(사유는 IndustryStatCard와 동일) */
function IndustryInfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-x-6 py-3 max-[560px]:grid-cols-1 max-[560px]:gap-x-0 max-[560px]:gap-y-1">
      <span className="text-[13px] font-medium text-[#8993a1]">{label}</span>
      <span className="min-w-0 text-left text-[14px] font-normal leading-relaxed text-[#2f3845]">{value}</span>
    </div>
  );
}

/** job-detail/shared.tsx의 MapPlaceholder와 동일한 시각 패턴을 로컬로 복제(사유는 IndustryStatCard와 동일 — RSC 경계) */
function LocationMapPlaceholder({ address, orgName }: { address: string; orgName: string }) {
  return (
    <div className="relative grid h-[190px] place-items-center overflow-hidden border border-dashed border-[#cbd8df] bg-[#f3f3f3]">
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(#dedede 1px, transparent 1px), linear-gradient(90deg, #dedede 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative z-10 border border-[#d7dde5] bg-white px-5 py-3 text-center shadow-[0_5px_14px_rgba(20,32,46,0.08)]">
        <MapPin className="mx-auto text-[#6b7280]" size={20} aria-hidden />
        <p className="mt-1 text-[13px] font-bold text-[#2f3845]">{orgName}</p>
        <p className="mt-0.5 text-[11.5px] font-normal text-[#8993a1]">{address}</p>
      </div>
    </div>
  );
}

/** "위치" 서브섹션 — 3트랙 "기업/병원/약국 정보" 카드가 공통으로 C(정보 리스트) 바로 아래에 붙인다(STEP 3a-2).
 * 주소 텍스트는 V2 "근무지역" 블록과 동일하게 일반 본문 스타일로, 그 아래 지도 placeholder가 따른다.
 * 주소가 없으면 지도를 보여줄 근거가 없어 섹션째 숨긴다. */
function LocationSection({ address, orgName }: { address?: string; orgName: string }) {
  if (!address) return null;
  return (
    <div className="mt-6 border-t border-[#edf1f5] pt-5">
      <h3 className="text-[15px] font-bold text-[#2f3845]">위치</h3>
      <div className="mt-3 space-y-3">
        <p className="text-[16px] font-normal leading-[1.85] text-[#3f4855]">{address}</p>
        <LocationMapPlaceholder address={address} orgName={orgName} />
      </div>
    </div>
  );
}

/** 산업 트랙 "기업 개요" B+C+위치+D+E — 기업 카드 4개(기관 유형·직원 수·설립 연도·사업 분야) + 기업 정보 리스트(주소·
 * 대표 전화·대표 이메일·홈페이지) + 위치(지도) + 대표 제품(D, 사이드바에서 이동) + 재무 정보(E, 값이 모두 없으면
 * 블록 자체를 숨긴다). 값 없는 카드·행은 개별적으로 숨긴다. */
export function CompanyDetailOverview({ profile }: { profile: CompanyProfile }) {
  const orgType = detailValue(profile, "기관 유형");
  const employeeCount = detailValue(profile, "직원 수");
  const foundedYear = detailValue(profile, "설립 연도");
  const businessField = detailValue(profile, "사업 분야");
  const hasCards = Boolean(orgType || employeeCount || foundedYear || businessField);

  const address = detailValue(profile, "본사 위치");
  const homepage = detailValue(profile, "홈페이지");
  const hasInfoRows = Boolean(address || profile.phone || profile.email || homepage);

  const financeItems = [
    { label: "매출액", value: profile.revenue, icon: TrendingUp },
    { label: "영업이익", value: profile.operatingProfit, icon: Wallet },
    { label: "R&D 투자비율", value: profile.rndRatio, icon: Percent },
  ].filter((item): item is { label: string; value: string; icon: LucideIcon } => Boolean(item.value));

  return (
    <div className="border border-border bg-white p-6 shadow-[var(--shadow)]">
      <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#202733]">기업 정보</h2>

      {hasCards ? (
        <div className="mt-6 grid grid-cols-4 divide-x divide-[#e8edf2] max-[640px]:grid-cols-2">
          {orgType ? <IndustryDividerStatCell icon={Building2} label="기관 유형" value={orgType} /> : null}
          {employeeCount ? <IndustryDividerStatCell icon={Users} label="직원 수" value={employeeCount} /> : null}
          {foundedYear ? <IndustryDividerStatCell icon={Calendar} label="설립 연도" value={foundedYear} /> : null}
          {businessField ? <IndustryDividerStatCell icon={Factory} label="사업 분야" value={businessField} /> : null}
        </div>
      ) : null}

      {hasInfoRows ? (
        <div className="mt-6 divide-y divide-[#f0f2f5]">
          {address ? <IndustryInfoRow label="주소" value={address} /> : null}
          {profile.phone ? <IndustryInfoRow label="대표 전화" value={profile.phone} /> : null}
          {profile.email ? <IndustryInfoRow label="대표 이메일" value={profile.email} /> : null}
          {homepage ? (
            <IndustryInfoRow
              label="홈페이지"
              value={
                <a
                  href={`https://${homepage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#111111] hover:underline"
                >
                  {homepage}
                  <ExternalLink size={12} className="ml-1 inline" />
                </a>
              }
            />
          ) : null}
        </div>
      ) : null}

      <LocationSection address={address} orgName={profile.name} />

      {profile.sidebar.products.length > 0 ? (
        <div className="mt-6 border-t border-[#edf1f5] pt-5">
          <h3 className="text-[15px] font-bold text-[#2f3845]">대표 제품</h3>
          <div className="mt-3 grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
            {profile.sidebar.products.map((product) => (
              <div key={product.name} className="border-l-2 border-[#d8e0e8] pl-3.5">
                <p className="text-[15px] font-bold text-[#17202c]">{product.name}</p>
                <p className="mt-1 text-[14px] font-normal leading-relaxed text-[#8b95a1]">{product.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {financeItems.length > 0 ? (
        <div className="mt-6 border-t border-[#edf1f5] pt-5">
          <h3 className="text-[15px] font-bold text-[#2f3845]">재무 정보</h3>
          <div className="mt-3 grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
            {financeItems.map((item) => (
              <IndustryStatCard
                key={item.label}
                icon={item.icon}
                label={profile.financialYear ? `${item.label} (${profile.financialYear})` : item.label}
                value={item.value}
              />
            ))}
          </div>
        </div>
      ) : null}
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

/** 개요 미리보기 카드가 받는 값은 companyReviews의 부분집합이다. content는 기업 리뷰(company)에만 담고, 면접 후기
 * (interview)는 열람권 게이팅 대상이라 이 매핑이 애초에 그 필드를 채우지 않는다 — 원문이 전달될 수 없다는 원칙은
 * CompanyReviewCard(variant="compact")에서도 그대로 지켜진다(면접 후기는 content가 null이면 본문 영역 자체를
 * 렌더하지 않는다). 새 필드가 필요해지면 여기서 명시적으로 추가할 것 — review 원본을 그대로 넘기지 말 것. */
function toReviewCardItem(review: CompanyReview): CompanyReviewCardItem {
  return {
    id: review.id,
    tags: review.tags,
    content: review.type === "company" ? review.content : null,
    jobRole: review.jobRole,
    authorStatus: review.authorStatus,
    writtenAt: review.writtenAt,
    helpfulCount: review.helpfulCount,
    outcome: review.outcome,
    isInterview: review.type === "interview",
  };
}

/** 개요 페이지의 면접 후기/기업 리뷰 미리보기 — [companyId]/reviews·interviews 전용 페이지와 같은 카드
 * (`CompanyReviewCard`)를 `variant="compact"`로 재사용한다(STEP 9-4: 로컬 중복 카드 구현 제거).
 * 최신 2건 + 전체 보기 링크만 보여주고, 게이팅은 전용 페이지의 몫이라 여기서는 고려하지 않는다. */
export function CompanyReviewsPreviewSection({ profile, type }: { profile: CompanyProfile; type: CompanyReviewType }) {
  const isInterview = type === "interview";
  const title = isInterview ? "면접 후기" : "기업 리뷰";
  const href = `/companies/${profile.id}/${isInterview ? "interviews" : "reviews"}`;

  const all = companyReviews
    .filter((review) => review.companyId === profile.id && review.type === type)
    .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt));
  const preview = all.slice(0, 2).map(toReviewCardItem);
  const topKeywords = all.length >= 3 ? topTagsByFrequency(all.map((review) => review.tags)) : [];

  return (
    <SectionShell
      title={title}
      description={
        isInterview
          ? "실제 지원자들이 경험한 면접 과정과 분위기를 확인해 보세요."
          : "재직자들이 말하는 실제 근무 환경과 조직 문화를 확인해 보세요."
      }
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
              <CompanyReviewCard key={review.id} review={review} variant="compact" />
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
      description="이 기업이 채용 중인 포지션을 살펴보세요."
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
          message="현재 채용중인 공고가 없습니다. 관심 기업으로 저장해두면 새 공고가 올라올 때 알려드릴게요."
          cta={<button className="h-10 border border-[#111111] px-4 text-[13px] font-medium text-[#111111]">관심 기업으로 저장</button>}
        />
      )}
    </SectionShell>
  );
}

/** [companyId] 개요 탭 본문 — "채용중인 공고" 미리보기(최대 2건, STEP 6). 면접 후기·기업 리뷰 미리보기
 * (`CompanyReviewsPreviewSection`)와 동일한 섹션 문법(제목+"전체 보기" 액션 링크)을 따르되, 공고는 리뷰처럼
 * 사용자에게 작성을 유도할 대상이 아니라서 0건이면 빈 상태 카드 없이 섹션 전체를 숨긴다. 조회는 getActiveJobs를
 * 그대로 재사용한다(새 조회 로직 없음) — `/jobs` 탭 전용의 `CompanyJobsPreview`(전체 목록, 다른 문구/링크)와는
 * 별개 컴포넌트다. */
export function CompanyActiveJobsPreviewSection({ profile }: { profile: CompanyProfile }) {
  const activeJobs = getActiveJobs(profile.id).slice(0, 2);
  if (!activeJobs.length) return null;

  return (
    <SectionShell
      title="채용중인 공고"
      action={
        <Link
          href={`/companies/${profile.id}/jobs`}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#596373] hover:text-[#111111]"
        >
          전체 보기
          <ChevronRight size={15} />
        </Link>
      }
    >
      <CompanyJobsGrid jobs={activeJobs} />
    </SectionShell>
  );
}

export function CompanyNewsSection({ profile }: { profile: CompanyProfile }) {
  return (
    <SectionShell
      title="관련 뉴스"
      description="더파마뉴스에 보도된 이 기업의 최근 소식을 확인해 보세요."
      action={
        <a
          href="https://thepharmanews.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#596373] hover:text-[#111111]"
        >
          더파마뉴스에서 더 보기
          <ChevronRight size={15} />
        </a>
      }
    >
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

/** 개요 본문 최하단 "관련 뉴스" 미리보기(산업 트랙 전용, STEP 8-A) — 뉴스 탭(`CompanyNewsSection`)의 카드 마크업을
 * 이미지+날짜+제목만 남긴 축소 변형으로 재사용한다(요약문 생략). 최신 3건 + "전체 보기" 링크만 보여주고,
 * 뉴스가 0건이면 섹션 자체를 숨긴다(면접 후기·기업 리뷰 미리보기와 달리 작성 유도 대상이 아니라 빈 상태 카드도 없다). */
export function CompanyNewsPreviewSection({ profile }: { profile: CompanyProfile }) {
  const items = profile.news.slice(0, 3);
  if (!items.length) return null;

  return (
    <SectionShell
      title="관련 뉴스"
      action={
        <Link
          href={`/companies/${profile.id}/news`}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#596373] hover:text-[#111111]"
        >
          전체 보기
          <ChevronRight size={15} />
        </Link>
      }
    >
      <div className="grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
        {items.map((news) => (
          <a
            key={news.id}
            href={news.href}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden border border-[#e0e6ee] bg-white transition hover:border-[#111111]"
          >
            <div className="h-[100px] bg-[#eef1f4]">
              <img src={news.thumbnail} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
            </div>
            <div className="p-3">
              <p className="text-[11px] font-medium text-[#8a95a5]">{news.date}</p>
              <h3 className="mt-1.5 line-clamp-2 min-h-[36px] text-[13px] font-bold leading-[1.4] text-[#202733]">{news.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </SectionShell>
  );
}

export function CompanyAsidePanel({ profile }: { profile: CompanyProfile }) {
  return (
    <aside className="sticky top-[88px] grid h-fit gap-4 self-start max-[1120px]:static">
      <CompanyCoreInfoCard profile={profile} />
    </aside>
  );
}

/* ── 병원·약국 트랙 개요 (STEP 3a 재설계) — 산업 트랙 렌더(위 CompanyOverview/CompanyDetailOverview)는 건드리지 않는다 ── */

function detailValue(profile: CompanyProfile, label: string) {
  return profile.details.find((item) => item.label === label)?.value ?? undefined;
}

function metricValue(profile: CompanyProfile, label: string) {
  return profile.metrics?.find((item) => item.label === label)?.value;
}

/** STEP 3b 전까지 데이터가 없는 항목이 대부분이라 이 헬퍼로 조회되는 값은 당분간 비어 있을 수 있다(정상) */
function businessSummaryValue(profile: CompanyProfile, label: string) {
  return profile.businessSummary.find((item) => item.label === label)?.value ?? undefined;
}

/** 기관 특징 — 병원·약국 공통. "요약" 카드에서 키워드 바로 아래에 둔다(서술형 콘텐츠라 A의 연장선으로 배치) */
function InstitutionFeatures({ features }: { features?: CompanyProfileFeature[] }) {
  if (!features || !features.length) return null;
  return (
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
  );
}

/** [companyId] 개요 탭 — 병원 트랙 "병원 소개" 첫 섹션(본문 소개+키워드+기관 특징만, STEP 3a-2).
 * 로고·병원명·한줄소개는 Hero가 이미 보여줘 반복하지 않는다. 셋 다 없으면 섹션 자체를 숨긴다. */
function HospitalOverviewCard({ profile }: { profile: CompanyProfile }) {
  const hasIntro = Boolean(profile.fullIntro);
  const hasKeywords = profile.keywords.length > 0;
  const hasFeatures = Boolean(profile.features?.length);
  if (!hasIntro && !hasKeywords && !hasFeatures) return null;

  return (
    <SectionShell title="병원 소개">
      {profile.fullIntro ? (
        <p className="text-[14px] font-normal leading-relaxed text-[#3f4855]">{profile.fullIntro}</p>
      ) : null}
      {hasKeywords ? (
        <div className={clsx("flex flex-wrap gap-x-2.5 gap-y-1.5", hasIntro && "mt-3")}>
          {profile.keywords.map((keyword) => (
            <span key={keyword} className="text-[13px] font-medium text-[#667181]">
              #{keyword}
            </span>
          ))}
        </div>
      ) : null}
      <InstitutionFeatures features={profile.features} />
    </SectionShell>
  );
}

/** [companyId] 개요 탭 — 병원 트랙 "병원 정보" 카드(B: 병원유형·운영형태·병상수·설립연도, C: 주소·대표전화·이메일·홈페이지,
 * D: 약제부 근무환경) */
function HospitalInfoCard({ profile, company }: { profile: CompanyProfile; company: Company }) {
  const hospitalType = company.hospitalType ? hospitalTypeLabels[company.hospitalType] : undefined;
  const hospitalOperator = company.hospitalOperator ? hospitalOperatorLabels[company.hospitalOperator] : undefined;
  const bedCount = metricValue(profile, "병상 수");
  const foundedYear = detailValue(profile, "설립 연도");
  const hasCards = Boolean(hospitalType || hospitalOperator || bedCount || foundedYear);

  const address = detailValue(profile, "본사 위치");
  const homepage = detailValue(profile, "홈페이지");
  const hasInfoRows = Boolean(address || profile.phone || profile.email || homepage);

  const pharmacyStaffCount = metricValue(profile, "약제부 인력");
  const medicalDepartmentLabels = (profile.medicalDepartments ?? [])
    .map((id) => medicalDepartmentOptions.find((option) => option.id === id)?.label)
    .filter((label): label is string => Boolean(label));
  const specialistPharmacists = profile.specialistPharmacists ?? [];
  const hasDutyRows = Boolean(
    pharmacyStaffCount || profile.dutySystem || medicalDepartmentLabels.length || specialistPharmacists.length,
  );
  const hasDutySection = hasDutyRows || Boolean(profile.pharmacyEnvironmentDescription);

  return (
    <div className="border border-border bg-white p-6 shadow-[var(--shadow)]">
      <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#202733]">병원 정보</h2>

      {hasCards ? (
        <div className="mt-6 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
          {hospitalType ? <IndustryStatCard icon={Building2} label="병원 유형" value={hospitalType} /> : null}
          {hospitalOperator ? <IndustryStatCard icon={Landmark} label="운영 형태" value={hospitalOperator} /> : null}
          {bedCount ? <IndustryStatCard icon={BedDouble} label="병상 수" value={bedCount} /> : null}
          {foundedYear ? <IndustryStatCard icon={Calendar} label="설립 연도" value={foundedYear} /> : null}
        </div>
      ) : null}

      {hasInfoRows ? (
        <div className="mt-6 divide-y divide-[#f0f2f5]">
          {address ? <IndustryInfoRow label="주소" value={address} /> : null}
          {profile.phone ? <IndustryInfoRow label="대표 전화" value={profile.phone} /> : null}
          {profile.email ? <IndustryInfoRow label="이메일" value={profile.email} /> : null}
          {homepage ? (
            <IndustryInfoRow
              label="홈페이지"
              value={
                <a href={`https://${homepage}`} target="_blank" rel="noreferrer" className="hover:text-[#111111] hover:underline">
                  {homepage}
                  <ExternalLink size={12} className="ml-1 inline" />
                </a>
              }
            />
          ) : null}
        </div>
      ) : null}

      <LocationSection address={address} orgName={profile.name} />

      {hasDutySection ? (
        <div className="mt-6 border-t border-[#edf1f5] pt-5">
          <h3 className="text-[15px] font-bold text-[#2f3845]">약제부 근무환경</h3>
          {hasDutyRows ? (
            <div className="mt-3 divide-y divide-[#f0f2f5]">
              {pharmacyStaffCount ? <IndustryInfoRow label="약사 인원" value={pharmacyStaffCount} /> : null}
              {profile.dutySystem ? <IndustryInfoRow label="당직 체계" value={profile.dutySystem} /> : null}
              {medicalDepartmentLabels.length ? <IndustryInfoRow label="진료과목" value={medicalDepartmentLabels.join(" · ")} /> : null}
              {specialistPharmacists.length ? <IndustryInfoRow label="전문약사 보유" value={specialistPharmacists.join(" · ")} /> : null}
            </div>
          ) : null}
          {profile.pharmacyEnvironmentDescription ? (
            <p className={clsx("text-[13px] font-normal leading-[1.7] text-[#596373]", hasDutyRows && "mt-4")}>
              {profile.pharmacyEnvironmentDescription}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** [companyId] 개요 탭 — 병원 트랙. "병원 요약"(A+키워드+기관 특징) + "병원 정보"(B+C+D) 두 카드를 순서대로 렌더한다.
 * 두 카드 모두 CompanyOverviewClient의 "grid gap-5" 컨테이너에 나란히 들어가 산업 트랙(CompanyOverview+CompanyDetailOverview)과
 * 동일한 카드 리듬을 이룬다. */
export function HospitalSummarySection({ profile, company }: { profile: CompanyProfile; company: Company }) {
  return (
    <>
      <HospitalOverviewCard profile={profile} />
      <HospitalInfoCard profile={profile} company={company} />
    </>
  );
}

/** [companyId] 개요 탭 — 약국 트랙 "약국 소개" 첫 섹션(본문 소개+키워드+기관 특징만, STEP 3a-2).
 * 약국명·한줄소개는 Hero가 이미 보여줘 반복하지 않는다. 셋 다 없으면 섹션 자체를 숨긴다. */
function PharmacyOverviewCard({ profile }: { profile: CompanyProfile }) {
  const hasIntro = Boolean(profile.fullIntro);
  const hasKeywords = profile.keywords.length > 0;
  const hasFeatures = Boolean(profile.features?.length);
  if (!hasIntro && !hasKeywords && !hasFeatures) return null;

  return (
    <SectionShell title="약국 소개">
      {profile.fullIntro ? (
        <p className="text-[14px] font-normal leading-relaxed text-[#3f4855]">{profile.fullIntro}</p>
      ) : null}
      {hasKeywords ? (
        <div className={clsx("flex flex-wrap gap-x-2.5 gap-y-1.5", hasIntro && "mt-3")}>
          {profile.keywords.map((keyword) => (
            <span key={keyword} className="text-[13px] font-medium text-[#667181]">
              #{keyword}
            </span>
          ))}
        </div>
      ) : null}
      <InstitutionFeatures features={profile.features} />
    </SectionShell>
  );
}

/** [companyId] 개요 탭 — 약국 트랙 "약국 정보" 카드(B: 약국유형·약국특성·직원구성, C: 주소·대표전화·대표이메일·영업시간,
 * D: 조제 환경) */
function PharmacyInfoCard({ profile, company }: { profile: CompanyProfile; company: Company }) {
  const pharmacyType = company.pharmacyType ? getPharmacyTypeLabel(company.pharmacyType) : undefined;
  const pharmacyFeatureLabel = profile.pharmacyFeatures
    ? pharmacyFeatureOptions.find((option) => option.id === profile.pharmacyFeatures)?.label
    : undefined;
  const pharmacistCount = businessSummaryValue(profile, "근무 약사");
  const supportCount = businessSummaryValue(profile, "직원");
  const staffParts = [pharmacistCount ? `약사 ${pharmacistCount}` : null, supportCount ? `지원 ${supportCount}` : null].filter(
    (part): part is string => Boolean(part),
  );
  const staffComposition = staffParts.length ? staffParts.join(" · ") : undefined;
  const hasCards = Boolean(pharmacyType || pharmacyFeatureLabel || staffComposition);

  const address = detailValue(profile, "본사 위치");
  const hasInfoRows = Boolean(address || profile.phone || profile.email || profile.businessHours);

  const avgPrescriptions = metricValue(profile, "일평균 처방");
  const mainDepartments = metricValue(profile, "주요 처방과");
  const mainHospitals = businessSummaryValue(profile, "주요 처방 병원");
  const dispensingEquipment = (profile.dispensingEquipment ?? []).join(" · ") || undefined;
  const parkingTransit = businessSummaryValue(profile, "주차·교통");
  const hasWorkEnvRows = Boolean(
    avgPrescriptions || mainDepartments || mainHospitals || profile.pharmacySoftware || dispensingEquipment || parkingTransit,
  );

  return (
    <div className="border border-border bg-white p-6 shadow-[var(--shadow)]">
      <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#202733]">약국 정보</h2>

      {hasCards ? (
        <div className="mt-6 grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
          {pharmacyType ? <IndustryStatCard icon={Building2} label="약국 유형" value={pharmacyType} /> : null}
          {pharmacyFeatureLabel ? <IndustryStatCard icon={Tag} label="약국 특성" value={pharmacyFeatureLabel} /> : null}
          {staffComposition ? <IndustryStatCard icon={Users} label="직원 구성" value={staffComposition} /> : null}
        </div>
      ) : null}

      {hasInfoRows ? (
        <div className="mt-6 divide-y divide-[#f0f2f5]">
          {address ? <IndustryInfoRow label="주소" value={address} /> : null}
          {profile.phone ? <IndustryInfoRow label="대표 전화" value={profile.phone} /> : null}
          {profile.email ? <IndustryInfoRow label="대표 이메일" value={profile.email} /> : null}
          {profile.businessHours ? <IndustryInfoRow label="영업시간" value={profile.businessHours} /> : null}
        </div>
      ) : null}

      <LocationSection address={address} orgName={profile.name} />

      {hasWorkEnvRows ? (
        <div className="mt-6 border-t border-[#edf1f5] pt-5">
          <h3 className="text-[15px] font-bold text-[#2f3845]">조제 환경</h3>
          <div className="mt-3 divide-y divide-[#f0f2f5]">
            {avgPrescriptions ? <IndustryInfoRow label="일 평균 처방" value={avgPrescriptions} /> : null}
            {mainDepartments ? <IndustryInfoRow label="주요 처방과" value={mainDepartments} /> : null}
            {mainHospitals ? <IndustryInfoRow label="주요 처방 병원" value={mainHospitals} /> : null}
            {profile.pharmacySoftware ? <IndustryInfoRow label="전산 프로그램" value={profile.pharmacySoftware} /> : null}
            {dispensingEquipment ? <IndustryInfoRow label="조제 장비" value={dispensingEquipment} /> : null}
            {parkingTransit ? <IndustryInfoRow label="주차·교통" value={parkingTransit} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** [companyId] 개요 탭 — 약국 트랙. "약국 요약"(A+키워드+기관 특징) + "약국 정보"(B+C+D) 두 카드를 순서대로 렌더한다. */
export function PharmacySummarySection({ profile, company }: { profile: CompanyProfile; company: Company }) {
  return (
    <>
      <PharmacyOverviewCard profile={profile} />
      <PharmacyInfoCard profile={profile} company={company} />
    </>
  );
}

function reviewSummaryLabel(companyId: string) {
  const interviewCount = companyReviews.filter((review) => review.companyId === companyId && review.type === "interview").length;
  const companyReviewCount = companyReviews.filter((review) => review.companyId === companyId && review.type === "company").length;
  return `면접 ${interviewCount} · 리뷰 ${companyReviewCount}`;
}

/** [companyId] 개요 탭 사이드바 — 4트랙 공통 단일 카드(STEP 6: 기존 "기관 핵심 정보"+"채용·후기" 2카드를 통합).
 * 정보 3행(관심 등록 수/채용중 공고/후기) 아래 버튼 2개(채용공고 보기/후기 보기)만 남기고, 두 카드에 중복 표시되던
 * "채용중인 공고 N건" 문구는 제거했다 — 위 정보 행에 이미 동일한 값이 있다. */
function CompanyCoreInfoCard({ profile }: { profile: CompanyProfile }) {
  const infoItems = [
    // interestedCount는 "내가 저장했는지"가 아니라 이 기관을 관심 등록한 사람 수(집계값)다 — /companies 목록의 "관심순" 정렬도 같은 값을 쓴다.
    { label: "관심 등록 수", value: profile.sidebar.interestedCount, icon: Bookmark },
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

      <div className="mt-5 grid gap-2">
        <Link
          href={`/companies/${profile.id}/jobs`}
          className="inline-flex h-11 w-full items-center justify-center gap-2 bg-[#111111] text-[14px] font-medium text-white hover:bg-[#2a2a2a]"
        >
          채용공고 보기
          <ChevronRight size={16} />
        </Link>
        <Link
          href={`/companies/${profile.id}/reviews`}
          className="inline-flex h-11 w-full items-center justify-center border border-border text-[14px] font-medium text-[#4f5a66] hover:border-[#111111] hover:text-[#111111]"
        >
          후기 보기
        </Link>
      </div>
    </section>
  );
}

/** [companyId] 개요 탭 사이드바 — 병원 트랙. 단일 카드 원칙(STEP 6): 기관 핵심 정보 카드만 남긴다.
 * 진료과목/전문약사 칩, 추천 카드, 위치 카드는 본문(D/위치)과 중복이거나 추천 기준이 없어 렌더에서 제외했다. */
export function HospitalAsidePanel({ profile }: { profile: CompanyProfile }) {
  return (
    <aside className="sticky top-[88px] grid h-fit gap-4 self-start max-[1120px]:static">
      <CompanyCoreInfoCard profile={profile} />
    </aside>
  );
}

/** [companyId] 개요 탭 사이드바 — 약국 트랙. 단일 카드 원칙(STEP 6): 기관 핵심 정보 카드만 남긴다.
 * 조제환경·장비/조제특성 칩, 추천 카드, 위치 카드는 본문(D/위치)과 중복이거나 추천 기준이 없어 렌더에서 제외했다. */
export function PharmacyAsidePanel({ profile }: { profile: CompanyProfile }) {
  return (
    <aside className="sticky top-[88px] grid h-fit gap-4 self-start max-[1120px]:static">
      <CompanyCoreInfoCard profile={profile} />
    </aside>
  );
}

/* ── 연구 트랙 개요 (STEP 4: Company 승격 + 인사이트 페이지 신설) — 병원 패턴의 변형이다 ── */

/** [companyId] 개요 탭 — 연구 트랙 "기관 소개" 첫 섹션(본문 소개+키워드만). 연구 트랙은 기관 특징(features) 개념이
 * 없어 값이 없을 뿐, InstitutionFeatures 호출 자체는 다른 트랙과 동일하게 유지해 features가 채워지면 그대로 렌더된다.
 * 로고·기관명·한줄소개는 Hero가 이미 보여줘 반복하지 않는다. 소개·키워드가 모두 없으면 섹션 자체를 숨긴다. */
function ResearchOverviewCard({ profile }: { profile: CompanyProfile }) {
  const hasIntro = Boolean(profile.fullIntro);
  const hasKeywords = profile.keywords.length > 0;
  const hasFeatures = Boolean(profile.features?.length);
  if (!hasIntro && !hasKeywords && !hasFeatures) return null;

  return (
    <SectionShell title="기관 소개">
      {profile.fullIntro ? (
        <p className="text-[14px] font-normal leading-relaxed text-[#3f4855]">{profile.fullIntro}</p>
      ) : null}
      {hasKeywords ? (
        <div className={clsx("flex flex-wrap gap-x-2.5 gap-y-1.5", hasIntro && "mt-3")}>
          {profile.keywords.map((keyword) => (
            <span key={keyword} className="text-[13px] font-medium text-[#667181]">
              #{keyword}
            </span>
          ))}
        </div>
      ) : null}
      <InstitutionFeatures features={profile.features} />
    </SectionShell>
  );
}

/** [companyId] 개요 탭 — 연구 트랙 "연구기관 정보" 카드(B: 기관 유형·연구 인력 규모·설립 연도, C: 주소·홈페이지
 * — 대표 전화·이메일은 자리만 두고 값이 없어 숨김, D: 연구 환경 — 연구 분야·연구 장비·인프라·주요 연구 성과) */
function ResearchInfoCard({ profile }: { profile: CompanyProfile }) {
  const orgType = profile.institutionTypeId ? getResearchInstitutionTypeLabel(profile.institutionTypeId) : undefined;
  const staffScale = profile.staffScaleId
    ? researchStaffScaleOptions.find((option) => option.id === profile.staffScaleId)?.label
    : undefined;
  const foundedYear = detailValue(profile, "설립 연도");
  const hasCards = Boolean(orgType || staffScale || foundedYear);

  const address = detailValue(profile, "본사 위치");
  const homepage = detailValue(profile, "홈페이지");
  const hasInfoRows = Boolean(address || profile.phone || profile.email || homepage);

  const researchFieldLabels = (profile.researchFields ?? [])
    .map((id) => getResearchFieldShortLabel(id))
    .filter((label): label is string => Boolean(label));
  const hasResearchEnvRows = Boolean(researchFieldLabels.length || profile.equipmentInfra || profile.achievements);

  return (
    <div className="border border-border bg-white p-6 shadow-[var(--shadow)]">
      <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#202733]">연구기관 정보</h2>

      {hasCards ? (
        <div className="mt-6 grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
          {orgType ? <IndustryStatCard icon={Building2} label="기관 유형" value={orgType} /> : null}
          {staffScale ? <IndustryStatCard icon={Users} label="연구 인력 규모" value={staffScale} /> : null}
          {foundedYear ? <IndustryStatCard icon={Calendar} label="설립 연도" value={foundedYear} /> : null}
        </div>
      ) : null}

      {hasInfoRows ? (
        <div className="mt-6 divide-y divide-[#f0f2f5]">
          {address ? <IndustryInfoRow label="주소" value={address} /> : null}
          {profile.phone ? <IndustryInfoRow label="대표 전화" value={profile.phone} /> : null}
          {profile.email ? <IndustryInfoRow label="대표 이메일" value={profile.email} /> : null}
          {homepage ? (
            <IndustryInfoRow
              label="홈페이지"
              value={
                <a
                  href={`https://${homepage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#111111] hover:underline"
                >
                  {homepage}
                  <ExternalLink size={12} className="ml-1 inline" />
                </a>
              }
            />
          ) : null}
        </div>
      ) : null}

      <LocationSection address={address} orgName={profile.name} />

      {hasResearchEnvRows ? (
        <div className="mt-6 border-t border-[#edf1f5] pt-5">
          <h3 className="text-[15px] font-bold text-[#2f3845]">연구 환경</h3>
          <div className="mt-3 divide-y divide-[#f0f2f5]">
            {researchFieldLabels.length ? <IndustryInfoRow label="연구 분야" value={researchFieldLabels.join(" · ")} /> : null}
            {profile.equipmentInfra ? <IndustryInfoRow label="연구 장비·인프라" value={profile.equipmentInfra} /> : null}
            {profile.achievements ? <IndustryInfoRow label="주요 연구 성과" value={profile.achievements} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** [companyId] 개요 탭 — 연구 트랙. "기관 소개"(A+키워드) + "연구기관 정보"(B+C+연구환경) 두 카드를 순서대로 렌더한다.
 * 병원·약국과 달리 Company의 트랙 전용 필드가 없어(institutionTypeId 등은 CompanyProfile에 둔다) company 인자가 필요 없다. */
export function ResearchSummarySection({ profile }: { profile: CompanyProfile }) {
  return (
    <>
      <ResearchOverviewCard profile={profile} />
      <ResearchInfoCard profile={profile} />
    </>
  );
}

/** [companyId] 개요 탭 사이드바 — 연구 트랙. 단일 카드 원칙(STEP 6): 기관 핵심 정보 카드만 남긴다. */
export function ResearchAsidePanel({ profile }: { profile: CompanyProfile }) {
  return (
    <aside className="sticky top-[88px] grid h-fit gap-4 self-start max-[1120px]:static">
      <CompanyCoreInfoCard profile={profile} />
    </aside>
  );
}
