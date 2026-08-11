"use client";

import clsx from "clsx";
import {
  Award,
  BadgeCheck,
  Bookmark,
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  Info,
  ListChecks,
  Monitor,
  Share2,
  Stethoscope,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import {
  ApplyCard,
  CompanyCtaButtons,
  firstWords,
  FormattedContentView,
  getApplyAction,
  getApplyButtonLabel,
  HiringProcessSteps,
  IconSectionShell,
  InfoRow,
  InfoRowList,
  JobDetailHeroHeader,
  MapPlaceholder,
  MobileApplyInfoSection,
  MobileDeadlineCalendarSection,
  SimilarJobsSection,
  SummaryStatCell,
  SummaryStatGrid,
  useStickySidebarTop,
} from "@/components/job-detail/shared";
import { SectionAnchorNav } from "@/components/shared/SectionAnchorNav";
import { jobDetailAnchors } from "@/config/jobDetailAnchors";
import {
  educationLabelMap,
  employmentTypeLabelMap,
  experienceLabelMap,
  pharmacyFeatureLabelMap,
  pharmacyTypeLabelMap,
  pharmacyWorkTypeLabelMap,
  type PharmacyJobDetail,
} from "@/data/pharmacyJobDetails";
import { getSimilarJobs } from "@/data/similarJobs";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";
import { getPharmacyJobCoverImage } from "@/utils/pharmacyImage";
import type { Job } from "@/types/jobs";

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * jobRecord: jobs.ts의 실제 Job 레코드. 마감 표시(ApplyCard)만 이 값을 파생 소스로 쓴다 — PharmacyJobDetail 자체의 job(동명이지만 별도 타입)과 혼동 주의.
 * optional인 이유: /pharmacy-preview(기업센터 미리보기)는 jobs.ts에 아직 등록되지 않은 초안을 렌더링할 수 있어 조인 대상이 없을 수 있다.
 *
 * isPreview: 기업센터 미리보기(/pharmacy-preview)에서만 true. 이 화면은 기업 담당자가 "구직자에게 이렇게 보인다"를
 * 확인하는 용도라, 보는 사람의 개인 세션에 따라 결과가 달라지면 미리보기 역할을 못 한다 — 처음 방문한 구직자 기준인
 * 비로그인으로 고정한다. 기본값 false라 실제 상세(/jobs/[slug])는 종전대로 개인 세션을 따른다.
 */
export function PharmacyJobDetailV2({
  data,
  jobRecord,
  isPreview = false,
}: {
  data: PharmacyJobDetail;
  jobRecord?: Job;
  isPreview?: boolean;
}) {
  const { job, org } = data;

  // 훅은 미리보기에서도 그대로 호출하고(조건부 호출은 React 규칙 위반) 값만 덮어쓴다.
  // 로그인 상태의 출처는 개인 세션 쿠키 하나뿐 — 같은 화면의 헤더(Header.tsx)와 같다.
  const { isLoggedIn: personalLoggedIn } = usePersonalLoginState();
  const isLoggedIn = isPreview ? false : personalLoggedIn;

  const [saved, setSaved] = useState(false);
  const [interested, setInterested] = useState(false);
  const { ref: sidebarRef, top: sidebarTop } = useStickySidebarTop();

  /** 히어로(768px 이상)와 모바일 하단바(767px 이하)가 공유하는 공유 액션. 실제 공유 로직은 아직 없다. */
  const handleShare = () => {};

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

  const similarJobs = getSimilarJobs(data.slug, 3);

  const heroImage = org.coverImageUrl ?? getPharmacyJobCoverImage(data.id);

  const pharmacyFeatureLabel = pharmacyFeatureLabelMap[org.pharmacyFeatureId] ?? org.pharmacyFeatureId;
  const pharmacyTypeLabel = pharmacyTypeLabelMap[org.pharmacyTypeId] ?? org.pharmacyTypeId;

  const heroMeta = [firstWords(org.location.address, 2), workTypeLabels.join("/"), pharmacyTypeLabel]
    .filter(Boolean)
    .join(" · ");

  const hasPreferred = job.preferred.length > 0;

  const hasDetailImages = Boolean(job.detailImages && job.detailImages.length > 0);
  const hasAttachments = Boolean(job.attachments && job.attachments.length > 0);
  const hasAdditionalNotes = Boolean(job.additionalNotes);
  const hasAdditionalInfoSection = hasDetailImages || hasAttachments || hasAdditionalNotes;

  const hasHiringProcess = Boolean(job.hiringProcess && job.hiringProcess.length > 0);
  const hasRequiredDocuments = Boolean(job.requiredDocuments && job.requiredDocuments.length > 0);
  const hasHiringProcessSection = hasHiringProcess || hasRequiredDocuments;

  return (
    <>
      <main className="bg-[#f5f6f7] pb-28 pt-6">
        <div className="app-shell">
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_318px] gap-6 max-[1120px]:grid-cols-1">
            {/* ── 본문 ──────────────────────────────────────────────────── */}
            {/* 종전 space-y-5와 같은 20px 리듬이지만 gap으로 준다. space-y-*는 자식에게
                margin-top·margin-bottom을 **둘 다** 걸고(후자는 0) 그 선택자 특이도가 (0,3,0)이라,
                앵커 한 자리만 붙이려고 `> nav`(0,1,1)로 마진을 덮으면 조용히 진다.
                gap에는 경쟁할 마진 선언이 없어 [&>nav]:-mb-5 한 줄이 그대로 먹는다 —
                섹션 앵커 바로 아래 20px만 지우고 나머지 섹션 사이 간격은 그대로 둔다. */}
            <div className="flex min-w-0 flex-col gap-5 [&>nav]:-mb-5">
              {/* 히어로 */}
              <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-white shadow-[var(--shadow)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt=""
                  className="h-[286px] w-full object-cover max-[720px]:h-[210px]"
                />
                <div className="px-7 pb-7 pt-6 max-[720px]:px-5">
                  <JobDetailHeroHeader
                    orgName={org.pharmacyName}
                    companyId={data.companyId}
                    showLogo={false}
                    saved={saved}
                    onToggleSave={() => setSaved((v) => !v)}
                    interested={interested}
                    onToggleInterest={() => setInterested((v) => !v)}
                    onShare={handleShare}
                    title={job.title}
                    meta={heroMeta}
                    intro={job.summary}
                  />
                </div>
              </section>

              {/* ≤760px 섹션 앵커 — 히어로 아래, 본문 시작 직전. 옵셔널 섹션 필터링·미노출 판정은 컴포넌트가 한다 */}
              <SectionAnchorNav sections={jobDetailAnchors.pharmacy} ariaLabel="공고 섹션 바로가기" />

              {/* 공고 상세 */}
              <IconSectionShell id="summary" icon={ClipboardList} title="공고 상세">
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
                  <SummaryStatCell icon={Award} label="경력조건" value={experienceLabelMap[job.experienceId] ?? job.experienceId} />
                  <SummaryStatCell icon={GraduationCap} label="학력조건" value={educationLabelMap[job.educationId] ?? job.educationId} />
                  <SummaryStatCell icon={Users} label="모집인원" value={job.headcount} />
                </SummaryStatGrid>
              </IconSectionShell>

              {/* 주요 업무 */}
              <IconSectionShell id="duties" icon={ClipboardCheck} title="주요 업무">
                <FormattedContentView content={{ format: "bullet", items: job.responsibilities }} />
              </IconSectionShell>

              {/* 자격 요건 및 우대사항 */}
              <IconSectionShell id="qualifications" icon={BadgeCheck} title="자격 요건 및 우대사항">
                <div className="space-y-7">
                  <div>
                    <h3 className="text-[17px] font-bold text-[#2f3845]">필수 요건</h3>
                    <div className="mt-3">
                      <FormattedContentView content={{ format: "bullet", items: job.requirements }} />
                    </div>
                  </div>
                  {hasPreferred ? (
                    <div>
                      <h3 className="text-[17px] font-bold text-[#2f3845]">우대사항</h3>
                      <div className="mt-3">
                        <FormattedContentView content={{ format: "bullet", items: job.preferred }} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </IconSectionShell>

              {/* 근무 조건 (근무지역 포함) */}
              <IconSectionShell id="conditions" icon={CalendarClock} title="근무 조건">
                <div className="space-y-7">
                  <div>
                    <h3 className="text-[17px] font-bold text-[#2f3845]">근무 일정</h3>
                    <div className="mt-3">
                      <FormattedContentView
                        content={{ format: "bullet", items: scheduleLines.map((line) => `${line.days} ${line.time}`) }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-[#2f3845]">복리후생</h3>
                    <p className="mt-2.5 text-[15px] font-normal leading-[1.75] text-[#3f4855]">
                      {job.benefits.join(" · ")}
                    </p>
                  </div>
                  <div className="border-t border-[#edf1f4] pt-6">
                    <h3 className="text-[17px] font-bold text-[#2f3845]">근무조건 상세</h3>
                    <div className="mt-3">
                      <FormattedContentView content={{ format: "paragraph", items: [job.workConditionDetail] }} />
                    </div>
                  </div>
                  <div className="border-t border-[#edf1f4] pt-6">
                    <h3 className="text-[17px] font-bold text-[#2f3845]">근무지역</h3>
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-[15px] font-normal leading-[1.75] text-[#3f4855]">{org.location.address}</p>
                        <p className="mt-1 text-[13px] font-normal text-[#7d8796]">{org.location.detailAddress}</p>
                      </div>
                      <MapPlaceholder address={org.location.address} orgName={org.pharmacyName} />
                      <FormattedContentView content={{ format: "paragraph", items: [org.location.parkingTransit] }} />
                    </div>
                  </div>
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
                    {pharmacyTypeLabel ? <InfoRow label="약국 유형" value={pharmacyTypeLabel} /> : null}
                    {pharmacyFeatureLabel ? <InfoRow label="약국 특성" value={pharmacyFeatureLabel} /> : null}
                    <InfoRow label="주요 처방과" value={org.mainDepartments} />
                    <InfoRow label="주요 처방 병원" value={mainPrescribingHospital} />
                    <InfoRow label="영업시간" value={org.businessHours} />
                    <InfoRow label="조제 장비" value={org.dispensingEquipment.join(" · ")} />
                  </InfoRowList>
                </div>
              </IconSectionShell>

              {/* 전형절차 및 제출서류 */}
              {hasHiringProcessSection ? (
                <IconSectionShell id="hiring-process" icon={ListChecks} title="전형절차 및 제출서류">
                  <div className="space-y-7">
                    {hasHiringProcess ? (
                      <div>
                        <h3 className="text-[17px] font-bold text-[#2f3845]">전형절차</h3>
                        <div className="mt-3">
                          <HiringProcessSteps steps={job.hiringProcess} />
                        </div>
                      </div>
                    ) : null}
                    {hasRequiredDocuments ? (
                      <div className={clsx(hasHiringProcess && "border-t border-[#edf1f4] pt-6")}>
                        <h3 className="text-[17px] font-bold text-[#2f3845]">제출서류</h3>
                        <p className="mt-2.5 text-[15px] font-normal leading-[1.75] text-[#3f4855]">
                          {job.requiredDocuments!.join(" · ")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </IconSectionShell>
              ) : null}

              {/* 추가 안내 */}
              {hasAdditionalInfoSection ? (
                <IconSectionShell id="additional-info" icon={Info} title="추가 안내">
                  <div className="space-y-7">
                    {hasDetailImages ? (
                      <div>
                        <h3 className="text-[17px] font-bold text-[#2f3845]">상세 이미지</h3>
                        <div className="mt-3 space-y-3">
                          {job.detailImages!.map((url) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={url} src={url} alt="" className="w-full border border-[#e2e8ef] object-cover" />
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {hasAttachments ? (
                      <div className={clsx(hasDetailImages && "border-t border-[#edf1f4] pt-6")}>
                        <h3 className="text-[17px] font-bold text-[#2f3845]">첨부파일</h3>
                        <div className="mt-3 space-y-2">
                          {job.attachments!.map((file) => (
                            <a
                              key={file.url}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3 text-[13px] font-medium text-[#4f5967] transition hover:border-brand hover:text-brand"
                            >
                              <FileText size={14} aria-hidden />
                              {file.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {hasAdditionalNotes ? (
                      <div className={clsx((hasDetailImages || hasAttachments) && "border-t border-[#edf1f4] pt-6")}>
                        <FormattedContentView content={{ format: "paragraph", items: [job.additionalNotes as string] }} />
                      </div>
                    ) : null}
                  </div>
                </IconSectionShell>
              ) : null}

              {/* 약국 정보 */}
              <IconSectionShell id="pharmacy" icon={Building2} title="약국 정보">
                <p className="text-[17px] font-bold text-[#1f2733]">{org.pharmacyName}</p>
                <p className="mt-2 text-[15px] font-medium leading-[1.6] text-[#2f3845]">{org.shortIntro}</p>
                {org.fullIntro ? (
                  <p className="mt-3 text-[14px] font-normal leading-relaxed text-[#3f4855]">{org.fullIntro}</p>
                ) : null}

                <CompanyCtaButtons companyId={data.companyId} detailLabel="기관 정보 더보기" />
              </IconSectionShell>

              {/* 마감일 + 캘린더 추가 — 720px 이하에서만. 이 폭에선 사이드바가 숨겨져 이 공고의 마감일이 화면 어디에도 없다 */}
              <MobileDeadlineCalendarSection job={jobRecord} />

              {/* 지원 정보 — 720px 이하에서만. 이 폭에선 사이드바가 숨겨져 연락처에 닿을 길이 없다 */}
              <MobileApplyInfoSection apply={job.apply} isLoggedIn={isLoggedIn} />

              {/* 비슷한 공고 */}
              <SimilarJobsSection jobs={similarJobs} track="pharmacy" />
            </div>

            {/* ── 사이드바 ──────────────────────────────────────────────── */}
            <aside
              ref={sidebarRef}
              style={{ top: sidebarTop }}
              className="sticky self-start h-fit space-y-3 max-[1120px]:static max-[720px]:hidden"
            >
              <ApplyCard job={jobRecord} apply={job.apply} isLoggedIn={isLoggedIn} />

              <section className="rounded-[var(--radius)] border border-border bg-white px-5 py-5 shadow-[var(--shadow)]">
                <div className="space-y-2.5">
                  {[
                    ["급여", job.salary.amount],
                    ["근무", daysSummary],
                    ["지역", firstWords(org.location.address, 2)],
                    ["특성", pharmacyFeatureLabel],
                    ["전산", org.software],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <span className="text-[13px] font-medium text-[#8993a1]">{label}</span>
                      <span className="text-[14px] font-normal text-[#3f4855]">{value}</span>
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-8px_20px_rgba(20,32,46,0.08)] min-[721px]:hidden">
        <div className="mx-auto grid max-w-[560px] grid-cols-[92px_48px_1fr] gap-2">
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            className={clsx(
              "flex h-12 items-center justify-center gap-1.5 border bg-white text-[13px] font-medium",
              saved ? "border-brand text-brand" : "border-border text-[#4f5a66]",
            )}
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
            스크랩
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="공고 공유"
            className="flex h-12 items-center justify-center border border-border bg-white text-[#4f5a66]"
          >
            <Share2 size={17} />
          </button>
          {/* 사이드바 ApplyCard와 같은 문구·동작을 쓴다 — 720px 이하에선 이 버튼이 유일한 지원 CTA다 */}
          <button
            type="button"
            onClick={getApplyAction(job.apply)}
            className="flex h-12 items-center justify-center gap-2 bg-brand text-[14px] font-medium text-white"
          >
            {getApplyButtonLabel(job.apply)}
          </button>
        </div>
      </div>
    </>
  );
}
