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
  MapPin,
  Monitor,
  Stethoscope,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import {
  ApplyCard,
  type ApplyMethodId,
  firstWords,
  FormattedContentView,
  IconSectionShell,
  InfoRow,
  InfoRowList,
  JobDetailActionRow,
  MapPlaceholder,
  SummaryStatCell,
  SummaryStatGrid,
  useStickySidebarTop,
} from "@/components/job-detail/shared";
import {
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

// ── Main component ─────────────────────────────────────────────────────────────

export function PharmacyJobDetailV2({ data }: { data: PharmacyJobDetail }) {
  const { job, org } = data;

  // 검증용 mock 로그인 토글 — 실제 세션 연결은 추후 처리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [interested, setInterested] = useState(false);
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
  const pharmacyTypeLabel = pharmacyTypeLabelMap[org.pharmacyTypeId] ?? org.pharmacyTypeId;

  const heroMeta = [firstWords(org.location.address, 2), workTypeLabels.join("/"), pharmacyTypeLabel]
    .filter(Boolean)
    .join(" · ");

  const hasPreferred = job.preferred.length > 0;

  const hasDetailImages = Boolean(job.detailImages && job.detailImages.length > 0);
  const hasAttachments = Boolean(job.attachments && job.attachments.length > 0);
  const hasAdditionalNotes = Boolean(job.additionalNotes);
  const hasAdditionalInfoSection = hasDetailImages || hasAttachments || hasAdditionalNotes;

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
                  <JobDetailActionRow
                    orgName={org.pharmacyName}
                    showLogo={false}
                    saved={saved}
                    onToggleSave={() => setSaved((v) => !v)}
                    interested={interested}
                    onToggleInterest={() => setInterested((v) => !v)}
                    onShare={() => {}}
                  />
                  <p className="mt-3 text-[15px] font-normal text-[#667181]">{heroMeta}</p>
                  <h1 className="mt-2 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#1f2733] max-[720px]:text-[25px]">
                    {job.title}
                  </h1>
                  <p className="mt-4 max-w-[760px] text-[16px] font-normal leading-[1.65] text-[#667181]">
                    {job.summary}
                  </p>
                </div>
              </section>

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
                    <p className="mt-2.5 text-[16px] font-normal leading-[1.85] text-[#3f4855]">
                      {job.benefits.join(" · ")}
                    </p>
                  </div>
                  <div className="border-t border-[#edf1f4] pt-6">
                    <h3 className="text-[15px] font-bold text-[#2f3845]">근무조건 상세</h3>
                    <div className="mt-3">
                      <FormattedContentView content={{ format: "paragraph", items: [job.workConditionDetail] }} />
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

              {/* 위치·교통 */}
              <IconSectionShell id="location" icon={MapPin} title="위치·교통">
                <div className="space-y-4">
                  <div>
                    <p className="text-[16px] font-normal leading-[1.85] text-[#3f4855]">{org.location.address}</p>
                    <p className="mt-1 text-[13px] font-normal text-[#7d8796]">{org.location.detailAddress}</p>
                  </div>
                  <MapPlaceholder address={org.location.address} orgName={org.pharmacyName} />
                  <FormattedContentView content={{ format: "paragraph", items: [org.location.parkingTransit] }} />
                </div>
              </IconSectionShell>

              {/* 추가 안내 */}
              {hasAdditionalInfoSection ? (
                <IconSectionShell id="additional-info" icon={Info} title="추가 안내">
                  <div className="space-y-7">
                    {hasDetailImages ? (
                      <div>
                        <h3 className="text-[15px] font-bold text-[#2f3845]">상세 이미지</h3>
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
                        <h3 className="text-[15px] font-bold text-[#2f3845]">첨부파일</h3>
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
                <p className="mt-2 text-[16px] font-medium leading-[1.6] text-[#2f3845]">{org.shortIntro}</p>
                {org.fullIntro ? (
                  <p className="mt-3 text-[14px] font-normal leading-relaxed text-[#3f4855]">{org.fullIntro}</p>
                ) : null}

                <div className="mt-9 flex flex-wrap gap-2 max-[640px]:flex-col">
                  <button
                    type="button"
                    className="inline-flex h-11 flex-1 items-center justify-center bg-brand px-5 text-[14px] font-semibold text-white transition hover:bg-[var(--color-brand-dark)]"
                  >
                    기업 정보 더보기
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-11 flex-1 items-center justify-center border border-border bg-white px-5 text-[14px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
                  >
                    기업 리뷰 보기
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-11 flex-1 items-center justify-center border border-border bg-white px-5 text-[14px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
                  >
                    면접 후기 보기
                  </button>
                </div>
              </IconSectionShell>
            </div>

            {/* ── 사이드바 ──────────────────────────────────────────────── */}
            <aside
              ref={sidebarRef}
              style={{ top: sidebarTop }}
              className="sticky self-start h-fit space-y-3 max-[1120px]:static max-[720px]:hidden"
            >
              <ApplyCard
                deadlineLabel={job.deadlineLabel}
                method={job.apply.method as ApplyMethodId}
                target={job.apply.email}
                notice={job.apply.notice}
                isLoggedIn={isLoggedIn}
              />

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
