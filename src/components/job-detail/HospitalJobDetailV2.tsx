"use client";

import clsx from "clsx";
import {
  Award,
  BadgeCheck,
  BedDouble,
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
  Stethoscope,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import {
  ApplyCard,
  type ApplyMethodId,
  CompanyCtaButtons,
  CompanyLogo,
  firstWords,
  FormattedContentView,
  HiringProcessSteps,
  IconSectionShell,
  InfoRow,
  InfoRowList,
  JobDetailActionRow,
  MapPlaceholder,
  SummaryStatCell,
  SummaryStatGrid,
  useStickySidebarTop,
} from "@/components/job-detail/shared";
import { hospitalOperatorLabels, hospitalTypeLabels } from "@/config/companyTypes";
import {
  educationLabelMap,
  employmentTypeLabelMap,
  experienceLabelMap,
  hospitalBenefitLabelMap,
  medicalDepartmentLabelMap,
  shiftTypeLabelMap,
  type HospitalJobDetail,
} from "@/data/hospitalJobDetails";
import { getHospitalJobCoverImage } from "@/utils/hospitalImage";

// ── Main component ─────────────────────────────────────────────────────────────

export function HospitalJobDetailV2({ data }: { data: HospitalJobDetail }) {
  const { job, org } = data;

  // 검증용 mock 로그인 토글 — 실제 세션 연결은 추후 처리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [interested, setInterested] = useState(false);
  const { ref: sidebarRef, top: sidebarTop } = useStickySidebarTop();

  const heroImage = getHospitalJobCoverImage(data.slug);

  const shiftTypeLabel = job.shiftTypeIds.map((id) => shiftTypeLabelMap[id] ?? id).join("/");
  const hospitalTypeLabel = hospitalTypeLabels[org.hospitalTypeId] ?? org.hospitalTypeId;
  const hospitalOperatorLabel = hospitalOperatorLabels[org.hospitalOperatorId] ?? org.hospitalOperatorId;
  const employmentTypeLabel = employmentTypeLabelMap[job.employmentTypeId] ?? job.employmentTypeId;

  const heroMeta = [firstWords(org.location.address, 2), shiftTypeLabel, hospitalTypeLabel]
    .filter(Boolean)
    .join(" · ");

  const hasPreferred = Boolean(job.preferred && job.preferred.length > 0);

  const hasShiftType = Boolean(job.shiftTypeIds && job.shiftTypeIds.length > 0);
  const hasWorkDays = Boolean(job.workDays && job.workDays.length > 0);
  const hasBenefits = Boolean(job.benefitIds && job.benefitIds.length > 0);
  const hasWorkConditionDetail = Boolean(job.workConditionDetail);

  const hasBedCount = Boolean(org.bedCount);
  const hasPharmacyStaffCount = Boolean(org.pharmacyStaffCount);
  const hasMedicalDepartments = Boolean(org.medicalDepartments && org.medicalDepartments.length > 0);
  const hasSpecialistPharmacists = Boolean(org.specialistPharmacists && org.specialistPharmacists.length > 0);
  const hasDutySystem = Boolean(org.dutySystem);
  const hasPharmacyEnvironmentDescription = Boolean(org.pharmacyEnvironmentDescription);

  const hasDetailImages = Boolean(job.detailImages && job.detailImages.length > 0);
  const hasAttachments = Boolean(job.attachments && job.attachments.length > 0);
  const hasAdditionalNotes = Boolean(job.additionalNotes);
  const hasAdditionalInfoSection = hasDetailImages || hasAttachments || hasAdditionalNotes;

  const hasHiringProcess = Boolean(job.hiringProcess && job.hiringProcess.length > 0);
  const hasRequiredDocuments = Boolean(job.requiredDocuments && job.requiredDocuments.length > 0);
  const hasHiringProcessSection = hasHiringProcess || hasRequiredDocuments;

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
                    orgName={org.hospitalName}
                    showLogo
                    logoUrl={org.logoUrl}
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
                  <SummaryStatCell icon={Wallet} label="급여" value={job.salary} />
                  {hasWorkDays ? (
                    <SummaryStatCell icon={CalendarDays} label="근무 요일" value={job.workDays!.join("·")} />
                  ) : null}
                  <SummaryStatCell
                    icon={Briefcase}
                    label="고용형태"
                    value={
                      <span className="inline-flex items-center gap-2">
                        {employmentTypeLabel}
                        {job.isLeadership ? (
                          <span className="inline-flex items-center border border-[#d7dce2] bg-[#f7f8fa] px-1.5 py-0.5 text-[11px] font-medium text-[#667181]">
                            리더급
                          </span>
                        ) : null}
                      </span>
                    }
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
                        <FormattedContentView content={{ format: "bullet", items: job.preferred as string[] }} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </IconSectionShell>

              {/* 근무 조건 (근무지역 포함) */}
              <IconSectionShell id="conditions" icon={CalendarClock} title="근무 조건">
                <div className="space-y-7">
                  {hasShiftType ? (
                    <div>
                      <h3 className="text-[15px] font-bold text-[#2f3845]">근무 형태</h3>
                      <p className="mt-2.5 text-[16px] font-normal leading-[1.85] text-[#3f4855]">
                        {shiftTypeLabel}
                      </p>
                    </div>
                  ) : null}
                  {hasBenefits ? (
                    <div className={clsx(hasShiftType && "border-t border-[#edf1f4] pt-6")}>
                      <h3 className="text-[15px] font-bold text-[#2f3845]">복리후생</h3>
                      <p className="mt-2.5 text-[16px] font-normal leading-[1.85] text-[#3f4855]">
                        {job.benefitIds!.map((id) => hospitalBenefitLabelMap[id] ?? id).join(" · ")}
                      </p>
                    </div>
                  ) : null}
                  {hasWorkConditionDetail ? (
                    <div className={clsx((hasShiftType || hasBenefits) && "border-t border-[#edf1f4] pt-6")}>
                      <h3 className="text-[15px] font-bold text-[#2f3845]">근무조건 상세</h3>
                      <div className="mt-3">
                        <FormattedContentView content={{ format: "paragraph", items: [job.workConditionDetail as string] }} />
                      </div>
                    </div>
                  ) : null}
                  <div className={clsx((hasShiftType || hasBenefits || hasWorkConditionDetail) && "border-t border-[#edf1f4] pt-6")}>
                    <h3 className="text-[15px] font-bold text-[#2f3845]">근무지역</h3>
                    <div className="mt-3 space-y-4">
                      <p className="text-[16px] font-normal leading-[1.85] text-[#3f4855]">{job.address}</p>
                      <MapPlaceholder address={job.address} orgName={org.hospitalName} />
                    </div>
                  </div>
                </div>
              </IconSectionShell>

              {/* 병원 근무환경 */}
              <IconSectionShell id="workenv" icon={Stethoscope} title="병원 근무환경">
                <SummaryStatGrid>
                  <SummaryStatCell icon={Building2} label="병원 유형" value={hospitalTypeLabel} />
                  {hasBedCount ? <SummaryStatCell icon={BedDouble} label="병상 수" value={org.bedCount} /> : null}
                  {hasPharmacyStaffCount ? <SummaryStatCell icon={Users} label="약사 인원" value={org.pharmacyStaffCount} /> : null}
                </SummaryStatGrid>
                <div className="mt-6 border-t border-[#f0f2f5] pt-1">
                  <InfoRowList>
                    <InfoRow label="운영 형태" value={hospitalOperatorLabel} />
                    {hasMedicalDepartments ? (
                      <InfoRow
                        label="진료과목"
                        value={org.medicalDepartments!.map((id) => medicalDepartmentLabelMap[id] ?? id).join(" · ")}
                      />
                    ) : null}
                    {hasSpecialistPharmacists ? (
                      <InfoRow label="전문약사 보유" value={org.specialistPharmacists!.join(" · ")} />
                    ) : null}
                    {hasDutySystem ? <InfoRow label="당직 체계" value={org.dutySystem} /> : null}
                  </InfoRowList>
                </div>
                {hasPharmacyEnvironmentDescription ? (
                  <div className="mt-6 border-t border-[#f0f2f5] pt-6">
                    <h3 className="text-[15px] font-bold text-[#2f3845]">약제부 근무 환경</h3>
                    <p className="mt-2.5 text-[16px] font-normal leading-[1.85] text-[#3f4855]">
                      {org.pharmacyEnvironmentDescription}
                    </p>
                  </div>
                ) : null}
              </IconSectionShell>

              {/* 전형절차 및 제출서류 */}
              {hasHiringProcessSection ? (
                <IconSectionShell id="hiring-process" icon={ListChecks} title="전형절차 및 제출서류">
                  <div className="space-y-7">
                    {hasHiringProcess ? (
                      <div>
                        <h3 className="text-[15px] font-bold text-[#2f3845]">전형절차</h3>
                        <div className="mt-3">
                          <HiringProcessSteps steps={job.hiringProcess} />
                        </div>
                      </div>
                    ) : null}
                    {hasRequiredDocuments ? (
                      <div className={clsx(hasHiringProcess && "border-t border-[#edf1f4] pt-6")}>
                        <h3 className="text-[15px] font-bold text-[#2f3845]">제출서류</h3>
                        <p className="mt-2.5 text-[16px] font-normal leading-[1.85] text-[#3f4855]">
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

              {/* 병원 정보 */}
              <IconSectionShell id="hospital" icon={Building2} title="병원 정보">
                <div className="flex items-start gap-4">
                  <CompanyLogo name={org.hospitalName} logoText="" logoUrl={org.logoUrl} size="lg" />
                  <div>
                    <p className="text-[17px] font-bold text-[#1f2733]">{org.hospitalName}</p>
                    <p className="mt-2 text-[16px] font-medium leading-[1.6] text-[#2f3845]">{org.shortIntro}</p>
                    {org.fullIntro ? (
                      <p className="mt-3 text-[14px] font-normal leading-relaxed text-[#3f4855]">{org.fullIntro}</p>
                    ) : null}
                  </div>
                </div>

                <CompanyCtaButtons companyId={data.companyId} detailLabel="기관 정보 더보기" />
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
                    ["급여", job.salary],
                    ["근무", shiftTypeLabel],
                    ["지역", firstWords(org.location.address, 2)],
                    ["고용형태", employmentTypeLabel],
                    ["직무", job.jobCategory.sub],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <span className="text-[13px] font-medium text-[#8993a1]">{label}</span>
                      <span className="text-[14px] font-normal text-[#3f4855]">{value}</span>
                    </div>
                  ))}
                </div>
                {job.keywords && job.keywords.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 border-t border-[#f0f2f5] pt-3">
                    {job.keywords.slice(0, 6).map((keyword) => (
                      <span key={keyword} className="text-[12px] font-medium text-[#667181]">
                        #{keyword}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>
            </aside>
          </div>
        </div>
      </main>

      {/* 모바일 하단 바 */}
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
