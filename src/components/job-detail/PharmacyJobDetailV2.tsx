"use client";

import clsx from "clsx";
import {
  BadgeCheck,
  Bookmark,
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Lock,
  MapPin,
  Monitor,
  Share2,
  Stethoscope,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  FormattedContentView,
  HeaderTag,
  useStickySidebarTop,
} from "@/components/job-detail/shared";
import { companyReviews } from "@/data/companies";
import { getCompanyProfile } from "@/data/companyProfiles";
import {
  applyMethodLabelMap,
  educationLabelMap,
  employmentTypeLabelMap,
  experienceLabelMap,
  pharmacyFeatureLabelMap,
  pharmacyTypeLabelMap,
  pharmacyWorkTypeLabelMap,
  type PharmacyJobDetail,
} from "@/data/pharmacyJobDetails";

// ── Static data ────────────────────────────────────────────────────────────────

const PHARMACY_HERO_IMAGES = [
  "/images/pharmacy/pharmacy_pic_example.jpg",
  "/images/pharmacy/pharmacy_pic_example_1.jpg",
  "/images/pharmacy/pharmacy_pic_example_2.jpg",
  "/images/pharmacy/pharmacy_pic_example_3.jpg",
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function firstWords(text: string, count: number): string {
  return text.split(" ").slice(0, count).join(" ");
}

// ── Small local UI pieces (기존 job-detail 디자인 토큰과 동일한 클래스만 사용) ──────

/**
 * SectionShell(shared.tsx)과 동일한 카드 셸(배경/border/shadow/radius/padding)을 그대로 쓰되,
 * title이 string 전용이라 아이콘 슬롯이 없어 제목 옆 아이콘만 로컬로 보강한 버전.
 * shared.tsx는 참조만 하고 수정하지 않는다.
 */
function IconSectionShell({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[130px] rounded-[var(--radius)] border border-border bg-white px-7 py-6 shadow-[var(--shadow)] max-[720px]:px-5">
      <h2 className="flex items-center gap-2 text-[26px] font-bold tracking-[-0.02em] text-[#242b36]">
        <Icon size={18} className="shrink-0 text-[#6b7280]" aria-hidden />
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * "공고 요약"·"약국 근무환경" 상단 3열 요약 카드. 두 섹션이 SummaryStatGrid+SummaryStatCell을
 * 그대로 공유하므로 라벨/값 크기·weight·여백·정렬·아이콘이 구조적으로 항상 같아진다.
 */
function SummaryStatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">{children}</div>;
}

function SummaryStatCell({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  caption?: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-5 text-center">
      <Icon size={20} className="mx-auto text-[#6b7280]" aria-hidden />
      <p className="mt-2 text-[12.5px] font-medium text-[#8893a2]">{label}</p>
      <div className="mt-2 text-[17px] font-bold leading-snug text-[#2f3845]">{value}</div>
      {caption ? <p className="mt-1 text-[12px] font-normal text-[#a0a9b7]">{caption}</p> : null}
    </div>
  );
}

/** 지도 SDK 없이 쓰는 자리표시자. shared.tsx의 MapBox와 같은 톤(격자 패턴+핀+카드)이되 약국명을 더 보여준다. */
function MapPlaceholder({ address, pharmacyName }: { address: string; pharmacyName: string }) {
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
        <p className="mt-1 text-[13px] font-bold text-[#2f3845]">{pharmacyName}</p>
        <p className="mt-0.5 text-[11.5px] font-normal text-[#8993a1]">{address}</p>
      </div>
    </div>
  );
}

/** "라벨 + 값" 가로 정렬 행. 여러 개를 divide-y로 묶어 옅은 구분선의 리스트를 만든다(박스 나열 대체). */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <span className="shrink-0 text-[13px] font-medium text-[#8993a1]">{label}</span>
      <span className="min-w-0 flex-1 text-right text-[14px] font-normal leading-relaxed text-[#2f3845]">
        {value}
      </span>
    </div>
  );
}

function InfoRowList({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-[#f0f2f5]">{children}</div>;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function PharmacyJobDetailV2({ data }: { data: PharmacyJobDetail }) {
  const { job, org } = data;

  // 검증용 mock 로그인 토글 — 실제 세션 연결은 추후 처리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saved, setSaved] = useState(false);
  const { ref: sidebarRef, top: sidebarTop } = useStickySidebarTop();

  const allDays = job.workSchedule.flatMap((block) => block.days);
  const daysSummary = allDays.join("·");
  const weekCount = allDays.length;
  const scheduleLines = job.workSchedule.map((block) => ({
    days: block.days.join("·"),
    time: block.time,
  }));

  const workTypeLabels = job.workTypeIds.map((id) => pharmacyWorkTypeLabelMap[id] ?? id);
  const employmentTypeLabel = employmentTypeLabelMap[job.employmentTypeId] ?? job.employmentTypeId;
  const remainingWorkTypeLabels = workTypeLabels.filter((label) => label !== employmentTypeLabel);
  const employmentCaption = remainingWorkTypeLabels.length > 0 ? `${remainingWorkTypeLabels.join("·")} 근무` : "";

  const pharmacistCount = job.staffPharmacistCount ?? org.staffPharmacistCount;
  const supportCount = job.staffSupportCount ?? org.staffSupportCount;

  const mainPrescribingHospital = job.mainPrescribingHospital.trim()
    ? job.mainPrescribingHospital
    : org.mainHospitals.join(", ");

  const heroIdx = [...data.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PHARMACY_HERO_IMAGES.length;
  const heroImage = org.coverImageUrl ?? PHARMACY_HERO_IMAGES[heroIdx];

  const pharmacyFeatureLabel = pharmacyFeatureLabelMap[org.pharmacyFeatureId] ?? org.pharmacyFeatureId;

  const heroTags = [
    pharmacyTypeLabelMap[org.pharmacyTypeId] ?? org.pharmacyTypeId,
    pharmacyFeatureLabel,
    employmentTypeLabel,
    experienceLabelMap[job.experienceId] ?? job.experienceId,
    firstWords(org.location.address, 2),
  ].filter(Boolean);

  const companyProfile = getCompanyProfile(data.companyId);
  const companyHref = companyProfile ? `/companies/${data.companyId}` : null;

  const companyReviewCount = companyReviews.filter(
    (review) => review.companyId === data.companyId && review.type === "company",
  ).length;
  const interviewReviewCount = companyReviews.filter(
    (review) => review.companyId === data.companyId && review.type === "interview",
  ).length;
  const hasReviews = companyReviewCount > 0 || interviewReviewCount > 0;

  const hasPreferred = job.preferred.length > 0;

  const applyMethodLabel = applyMethodLabelMap[job.apply.method] ?? job.apply.method;

  return (
    <>
      {/* 검증용 로그인 토글 (실 서비스에는 없음) */}
      <button
        type="button"
        onClick={() => setIsLoggedIn((v) => !v)}
        className="fixed right-4 top-4 z-50 border border-[#d7dce2] bg-white px-3 py-1.5 text-[12px] font-medium text-[#4f5967] shadow-[var(--shadow)] hover:border-brand"
      >
        {isLoggedIn ? "로그인됨 (클릭: 로그아웃 보기)" : "비로그인 (클릭: 로그인 보기)"}
      </button>

      <main className="bg-[#f5f6f7] pb-28 pt-6">
        <div className="app-shell">
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_318px] gap-6 max-[1120px]:grid-cols-1">
            {/* ── 본문 ──────────────────────────────────────────────────── */}
            <div className="min-w-0 space-y-5">
              {/* 히어로 */}
              <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-white shadow-[var(--shadow)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt=""
                  className="h-[286px] w-full object-cover max-[720px]:h-[210px]"
                />
                <div className="px-7 pb-7 pt-6 max-[720px]:px-5">
                  <p className="text-[15px] font-normal text-[#667181]">{org.pharmacyName}</p>
                  <h1 className="mt-2 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#1f2733] max-[720px]:text-[25px]">
                    {job.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {heroTags.map((tag) => (
                      <HeaderTag key={tag}>{tag}</HeaderTag>
                    ))}
                  </div>
                  <p className="mt-4 max-w-[760px] text-[16px] font-normal leading-[1.65] text-[#667181]">
                    {job.summary}
                  </p>
                </div>
              </section>

              {/* 공고 요약 */}
              <IconSectionShell id="summary" icon={ClipboardList} title="공고 요약">
                <SummaryStatGrid>
                  <SummaryStatCell icon={Wallet} label="급여" value={job.salary.amount} />
                  <SummaryStatCell
                    icon={CalendarDays}
                    label="근무 일정"
                    value={
                      <div className="space-y-1">
                        {scheduleLines.map((line, i) => (
                          <p key={i} className="text-[15px] font-bold leading-snug text-[#2f3845]">
                            {line.days} {line.time}
                          </p>
                        ))}
                      </div>
                    }
                    caption={`주 ${weekCount}일 근무`}
                  />
                  <SummaryStatCell
                    icon={Briefcase}
                    label="고용형태"
                    value={employmentTypeLabel}
                    caption={employmentCaption || undefined}
                  />
                </SummaryStatGrid>
                <div className="mt-6 border-t border-[#f0f2f5] pt-1">
                  <InfoRowList>
                    <InfoRow label="경력" value={experienceLabelMap[job.experienceId] ?? job.experienceId} />
                    <InfoRow label="모집인원" value={job.headcount} />
                    <InfoRow label="자격" value={educationLabelMap[job.educationId] ?? job.educationId} />
                    <InfoRow label="근무지" value={org.location.address} />
                  </InfoRowList>
                </div>
              </IconSectionShell>

              {/* 약국 근무환경 */}
              <IconSectionShell id="workenv" icon={Stethoscope} title="약국 근무환경">
                <SummaryStatGrid>
                  <SummaryStatCell icon={TrendingUp} label="일 평균 처방" value={org.avgDailyPrescriptions} />
                  <SummaryStatCell
                    icon={Users}
                    label="근무 인원"
                    value={
                      <div className="space-y-1">
                        <p className="text-[15px] font-bold leading-snug text-[#2f3845]">
                          약사 {pharmacistCount != null ? `${pharmacistCount}명` : "-"}
                        </p>
                        <p className="text-[15px] font-bold leading-snug text-[#2f3845]">
                          지원 {supportCount != null ? `${supportCount}명` : "-"}
                        </p>
                      </div>
                    }
                  />
                  <SummaryStatCell icon={Monitor} label="전산 프로그램" value={org.software} />
                </SummaryStatGrid>
                <div className="mt-6 border-t border-[#f0f2f5] pt-1">
                  <InfoRowList>
                    <InfoRow label="주요 처방과" value={org.mainDepartments} />
                    <InfoRow label="주요 처방 병원" value={mainPrescribingHospital} />
                    <InfoRow label="영업시간" value={org.businessHours} />
                    <InfoRow label="조제 장비" value={org.dispensingEquipment.join(" · ")} />
                  </InfoRowList>
                </div>
              </IconSectionShell>

              {/* 주요 업무 */}
              <IconSectionShell id="duties" icon={ClipboardCheck} title="주요 업무">
                <FormattedContentView content={{ format: "bullet", items: job.responsibilities }} />
              </IconSectionShell>

              {/* 자격요건·우대사항 */}
              <IconSectionShell id="qualifications" icon={BadgeCheck} title="자격요건·우대사항">
                <div className="space-y-7">
                  <div>
                    <h3 className="text-[15px] font-bold text-[#2f3845]">필수 요건</h3>
                    <div className="mt-3">
                      <FormattedContentView content={{ format: "bullet", items: job.requirements }} />
                    </div>
                  </div>
                  {hasPreferred ? (
                    <div>
                      <h3 className="text-[15px] font-bold text-[#2f3845]">우대사항</h3>
                      <div className="mt-3">
                        <FormattedContentView content={{ format: "bullet", items: job.preferred }} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </IconSectionShell>

              {/* 상세 근무조건 */}
              <IconSectionShell id="conditions" icon={CalendarClock} title="상세 근무조건">
                <div className="space-y-7">
                  <div>
                    <h3 className="text-[15px] font-bold text-[#2f3845]">근무 일정</h3>
                    <div className="mt-3">
                      <FormattedContentView
                        content={{ format: "bullet", items: scheduleLines.map((line) => `${line.days} ${line.time}`) }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#2f3845]">복리후생</h3>
                    <p className="mt-2.5 text-[14px] font-normal leading-relaxed text-[#3f4855]">
                      {job.benefits.join(" · ")}
                    </p>
                  </div>
                  <div className="border-t border-[#edf1f4] pt-6">
                    <h3 className="text-[15px] font-bold text-[#2f3845]">근무 안내</h3>
                    <div className="mt-3">
                      <FormattedContentView content={{ format: "paragraph", items: [job.workConditionDetail] }} />
                    </div>
                  </div>
                </div>
              </IconSectionShell>

              {/* 위치·교통 */}
              <IconSectionShell id="location" icon={MapPin} title="위치·교통">
                <div className="space-y-4">
                  <div>
                    <p className="text-[15px] font-bold text-[#2f3845]">{org.location.address}</p>
                    <p className="mt-1 text-[13px] font-normal text-[#7d8796]">{org.location.detailAddress}</p>
                  </div>
                  <MapPlaceholder address={org.location.address} pharmacyName={org.pharmacyName} />
                  <FormattedContentView content={{ format: "paragraph", items: [org.location.parkingTransit] }} />
                </div>
              </IconSectionShell>

              {/* 약국 정보 */}
              <IconSectionShell id="pharmacy" icon={Building2} title="약국 정보">
                <p className="text-[16px] font-medium leading-[1.6] text-[#2f3845]">{org.shortIntro}</p>
                <div className="mt-5 grid grid-cols-3 gap-5 max-[640px]:grid-cols-1">
                  {org.features.map((feature) => (
                    <div key={feature.title}>
                      <p className="text-[15px] font-bold text-[#2f3845]">{feature.title}</p>
                      <p className="mt-1.5 text-[13px] font-normal leading-[1.7] text-[#566171]">{feature.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-x-2.5 gap-y-1.5 border-t border-[#f0f2f5] pt-4">
                  {org.keywords.map((keyword) => (
                    <span key={keyword} className="text-[13px] font-medium text-[#667181]">
                      #{keyword}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius)] border border-[#e2e8ef] bg-[#fbfcfd] px-5 py-4">
                  <div>
                    {hasReviews ? (
                      <>
                        <p className="text-[14px] font-medium text-[#2f3845]">
                          기업 리뷰 {companyReviewCount}건 · 면접 후기 {interviewReviewCount}건
                        </p>
                        <p className="mt-1 text-[12px] font-normal text-[#8893a2]">실제 근무·면접 경험을 확인해보세요</p>
                      </>
                    ) : (
                      <>
                        <p className="text-[14px] font-medium text-[#2f3845]">약국 소개·리뷰·면접 후기</p>
                        <p className="mt-1 text-[12px] font-normal text-[#8893a2]">등록된 후기가 있을 때 확인할 수 있습니다</p>
                      </>
                    )}
                  </div>
                  {companyHref ? (
                    <Link
                      href={companyHref}
                      className="inline-flex h-10 items-center justify-center border border-border bg-white px-4 text-[13px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
                    >
                      약국 정보 더보기
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-10 cursor-not-allowed items-center justify-center border border-[#e5e9ef] bg-white px-4 text-[13px] font-medium text-[#c3c9d1]"
                    >
                      약국 정보 더보기
                    </button>
                  )}
                </div>
              </IconSectionShell>
            </div>

            {/* ── 사이드바 ──────────────────────────────────────────────── */}
            <aside
              ref={sidebarRef}
              style={{ top: sidebarTop }}
              className="sticky self-start h-fit space-y-3 max-[1120px]:static max-[720px]:hidden"
            >
              <section className="rounded-[var(--radius)] border border-border bg-white px-5 py-5 shadow-[var(--shadow)]">
                <p className="text-[13px] font-medium text-[#7d8796]">지원 정보</p>
                <h2 className="mt-2 text-[30px] font-bold text-brand">{job.deadlineLabel}</h2>
                <p className="mt-2 text-[13px] font-medium text-[#8993a1]">{applyMethodLabel}</p>

                <button
                  type="button"
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-brand text-[15px] font-medium text-white shadow-[0_4px_14px_rgba(17,17,17,0.2)] transition hover:bg-[var(--color-brand-dark)]"
                >
                  이메일 지원하기
                </button>

                {isLoggedIn ? (
                  <div className="mt-4 border-t border-[#e6ecf1] pt-4">
                    <p className="text-[12px] font-medium text-[#8993a1]">지원 이메일</p>
                    <p className="mt-1 break-all text-[13px] font-normal text-[#3f4855]">{job.apply.email}</p>
                  </div>
                ) : (
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] font-normal text-[#a0a9b7]">
                    <Lock size={12} />
                    로그인 후 지원 이메일을 확인할 수 있습니다
                  </p>
                )}

                {job.apply.notice ? (
                  <p className="mt-4 bg-[#f7f7f7] px-3 py-3 text-[12px] font-normal leading-[1.65] text-[#667181]">
                    {job.apply.notice}
                  </p>
                ) : null}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSaved((v) => !v)}
                    className={clsx(
                      "flex h-11 items-center justify-center gap-2 border bg-white text-[14px] font-medium transition",
                      saved ? "border-brand text-brand" : "border-border text-[#4f5a66] hover:border-brand hover:text-brand",
                    )}
                  >
                    <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
                    저장
                  </button>
                  <button
                    type="button"
                    className="flex h-11 items-center justify-center gap-2 border border-border bg-white text-[14px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
                  >
                    <Share2 size={17} />
                    공유
                  </button>
                </div>
              </section>

              <section className="rounded-[var(--radius)] border border-border bg-white px-5 py-5 shadow-[var(--shadow)]">
                <p className="text-[13px] font-medium text-[#7d8796]">이 공고 핵심</p>
                <div className="mt-3 space-y-2.5">
                  {[
                    ["급여", job.salary.amount],
                    ["근무", daysSummary],
                    ["지역", firstWords(org.location.address, 2)],
                    ["특성", pharmacyFeatureLabel],
                    ["전산", org.software],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="font-medium text-[#8993a1]">{label}</span>
                      <span className="font-normal text-[#3f4855]">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 border-t border-[#f0f2f5] pt-3">
                  {job.coreKeywords.slice(0, 6).map((keyword) => (
                    <span key={keyword} className="text-[12px] font-medium text-[#667181]">
                      #{keyword}
                    </span>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white px-4 py-3 shadow-[0_-8px_20px_rgba(20,32,46,0.08)] md:hidden">
        <div className="mx-auto grid max-w-[560px] grid-cols-[92px_1fr] gap-2">
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            className={clsx(
              "flex h-12 items-center justify-center gap-1.5 border bg-white text-[13px] font-medium",
              saved ? "border-brand text-brand" : "border-border text-[#4f5a66]",
            )}
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
            저장
          </button>
          <button type="button" className="flex h-12 items-center justify-center gap-2 bg-brand text-[14px] font-medium text-white">
            이메일 지원하기
          </button>
        </div>
      </div>
    </>
  );
}
