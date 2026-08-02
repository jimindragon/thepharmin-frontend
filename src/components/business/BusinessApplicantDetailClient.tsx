"use client";

import { FileText } from "lucide-react";
import type { ReactNode } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { SectionCard } from "@/components/business/BusinessFormControls";
import { FitScoreBar } from "@/components/business/FitScoreBar";
import { DetailPill } from "@/components/shared/DetailPill";
import { JobTagChip } from "@/components/shared/JobTagChip";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import { STATUS_TONE } from "@/config/statusTone";
import {
  APPLICANT_STAGE_TONE,
  applicantJobPostings,
  applicantStageLabel,
  STAGE_TABS,
  type Applicant,
} from "@/data/applicants";
import { getApplicantResume } from "@/data/applicantResumes";
import {
  educationOptions,
  employmentTypeOptions,
  experienceOptions,
  hospitalJobCategoryOptions,
  industryJobCategoryOptions,
  pharmacyJobCategoryOptions,
  regionOptions,
  researchJobCategoryOptions,
  salaryOptions,
} from "@/config/jobFilters/index";
import { jobTracks } from "@/config/jobTracks";
import type { JobTrack } from "@/types/jobs";

const jobCategoryOptionsByTrack: Record<JobTrack, typeof industryJobCategoryOptions> = {
  industry: industryJobCategoryOptions,
  research: researchJobCategoryOptions,
  pharmacy: pharmacyJobCategoryOptions,
  hospital: hospitalJobCategoryOptions,
};

const STAGE_STEP_IDS: Applicant["stage"][] = ["new", "screening", "first_interview", "final_interview", "offer"];

function findLabel(options: { id: string; label: string }[], id: string | null): string | null {
  if (!id) return null;
  return options.find((option) => option.id === id)?.label ?? id;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-x-6 py-3 max-[560px]:grid-cols-1 max-[560px]:gap-x-0 max-[560px]:gap-y-1">
      <span className="text-[13px] font-medium text-[#8a94a3]">{label}</span>
      <span className="min-w-0 text-[15px] font-normal leading-relaxed text-[#2f3845]">{value}</span>
    </div>
  );
}

function HeaderCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-4 py-3 first:pl-0 last:pr-0 max-[640px]:px-0">
      <p className="text-[13px] font-medium text-[#8a94a3]">{label}</p>
      <p className="mt-1.5 text-[15px] font-semibold text-[#17202c]">{children}</p>
    </div>
  );
}

function PanelField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[13px] font-medium text-[#8a94a3]">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-[#17202c]">{value}</p>
    </div>
  );
}

function StageStepper({ applicant }: { applicant: Applicant }) {
  if (applicant.stage === "rejected") {
    return <p className="text-[14px] font-bold text-status-error">불합격</p>;
  }

  const currentIndex = STAGE_STEP_IDS.indexOf(applicant.stage);

  return (
    <div>
      {STAGE_STEP_IDS.map((id, index) => {
        const label = STAGE_TABS.find((tab) => tab.id === id)?.label ?? id;
        const reached = index <= currentIndex;
        const isLast = index === STAGE_STEP_IDS.length - 1;
        const segmentFilled = index < currentIndex;
        return (
          <div key={id} className="flex gap-2.5">
            <div className="flex flex-col items-center">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full border ${reached ? "border-[#111111] bg-[#111111]" : "border-[#c7cdd5] bg-white"}`} />
              {!isLast ? <span className={`w-px flex-1 ${segmentFilled ? "bg-[#111111]" : "bg-[#dfe4ea]"}`} /> : null}
            </div>
            <div className={`-mt-[3.25px] ${isLast ? "pb-0.5" : "pb-6"}`}>
              <p className={`leading-none text-[13px] ${reached ? "font-bold text-[#17202c]" : "font-normal text-[#a0a9b7]"}`}>{label}</p>
              {index === 0 ? <p className="mt-1 text-[12px] font-normal text-[#8a94a3]">{applicant.appliedAt}</p> : null}
              {index === currentIndex ? <p className="mt-1 text-[12px] font-normal text-[#8a94a3]">현재 단계</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BusinessApplicantDetailClient({ applicant }: { applicant: Applicant }) {
  const resume = getApplicantResume(applicant.id);
  const posting = applicantJobPostings.find((item) => item.id === applicant.postingId);

  const trackLabel = resume ? (jobTracks.find((track) => track.id === resume.workPreference.track)?.label ?? resume.workPreference.track) : null;
  const categoriesForTrack = resume ? jobCategoryOptionsByTrack[resume.workPreference.track] : null;
  const subcategoryLabels =
    resume && categoriesForTrack
      ? resume.jobSubcategoryIds.map((id) => {
          const subcategory = categoriesForTrack.flatMap((category) => category.subcategories).find((item) => item.id === id);
          return subcategory?.label ?? id;
        })
      : [];

  const profilePills: string[] = [];
  if (resume?.careers[0]) {
    profilePills.push(`${resume.careers[0].company} ${resume.careers[0].role}`);
  }
  if (resume?.education.major.trim() && resume.education.degreeId) {
    const degreeLabel = findLabel(educationOptions, resume.education.degreeId);
    if (degreeLabel) profilePills.push(`${resume.education.major} ${degreeLabel}`);
  }
  if (resume?.workPreference.employmentTypeId) {
    const employmentLabel = findLabel(employmentTypeOptions, resume.workPreference.employmentTypeId);
    if (employmentLabel) profilePills.push(`${employmentLabel} 희망`);
  }

  return (
    <BusinessCenterShell>
      <div>
        <PageBreadcrumb
          items={[
            { label: "기업센터", href: "/business/dashboard" },
            { label: "채용관리" },
            { label: "지원자 관리", href: "/business/applicants" },
            { label: applicant.name },
          ]}
        />
        <h1 className="mt-5 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">지원자 프로필</h1>
        <p className="mt-2 text-[15px] font-normal leading-[1.7] text-[#68717e]">지원자의 이력과 지원 현황을 확인합니다.</p>

        <section className="mt-5 border border-border bg-white p-6 shadow-[var(--shadow)] max-[760px]:p-4">
          <div className="flex items-center gap-4">
            <PersonAvatar label={applicant.name} size={52} className="shrink-0" />
            <div>
              <p className="text-[22px] font-bold text-[#17202c]">{applicant.name}</p>
              <p className="mt-1 text-[13px] font-normal text-[#68717e]">
                {applicant.age}세 · 경력 {applicant.experienceYears}년 · {applicant.location}
              </p>
            </div>
          </div>

          {profilePills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {profilePills.map((pill, index) => (
                <DetailPill key={index}>{pill}</DetailPill>
              ))}
            </div>
          ) : null}

          <div className="mt-5 border-t border-[#eef1f5] pt-5">
            <div className="grid grid-cols-3 divide-x divide-[#eef1f5] max-[640px]:grid-cols-1 max-[640px]:divide-x-0 max-[640px]:divide-y">
              <HeaderCell label="지원 공고">
                <span className="inline-flex flex-wrap items-center gap-2">
                  <span>{posting?.title ?? "-"}</span>
                  {posting ? <JobTagChip>{posting.category}</JobTagChip> : null}
                </span>
              </HeaderCell>
              <HeaderCell label="지원일">{applicant.appliedAt}</HeaderCell>
              <HeaderCell label="현재 단계">
                {/* 표가 아니라 헤더 셀이라 점 없이 텍스트만 — 크기·굵기는 HeaderCell에서 상속받는다.
                    색은 지원자 목록과 같은 APPLICANT_STAGE_TONE을 쓴다(두 경로로 갈리지 않게). */}
                <span className={STATUS_TONE[APPLICANT_STAGE_TONE[applicant.stage]].text}>
                  {applicantStageLabel(applicant.stage)}
                </span>
              </HeaderCell>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_300px] gap-5 max-[1180px]:grid-cols-1">
          <div className="min-w-0 space-y-5">
            {resume && resume.careers.length > 0 ? (
              <SectionCard title="경력">
                <p className="mb-4 text-[13px] font-normal text-[#68717e]">총 경력 {applicant.experienceYears}년</p>
                <div className="divide-y divide-[#f0f2f5]">
                  {resume.careers.map((career) => (
                    <div key={career.id} className="py-4 first:pt-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <p className="text-[15px] font-semibold text-[#17202c]">{career.company}</p>
                          <p className="text-[13px] font-normal text-[#596373]">{career.role}</p>
                        </div>
                        <p className="shrink-0 text-[13px] font-normal text-[#8a94a3]">{career.period}</p>
                      </div>
                      {career.description ? <p className="mt-2 text-[13px] font-normal leading-relaxed text-[#3f4855]">{career.description}</p> : null}
                    </div>
                  ))}
                </div>
              </SectionCard>
            ) : null}

            {resume ? (
              <SectionCard title="전문 직무">
                <div className="flex flex-wrap gap-2">
                  {subcategoryLabels.map((label, index) => (
                    <DetailPill key={`${label}-${index}`}>{label}</DetailPill>
                  ))}
                </div>
              </SectionCard>
            ) : null}

            {resume ? (
              <SectionCard title="기본 정보">
                <div>
                  <p className="text-[15px] font-semibold text-[#17202c]">학력</p>
                  <div className="mt-1 divide-y divide-[#f0f2f5]">
                    <DetailRow label="학교" value={resume.education.school || "-"} />
                    <DetailRow label="학위" value={findLabel(educationOptions, resume.education.degreeId) ?? "-"} />
                    <DetailRow label="전공" value={resume.education.major || "-"} />
                  </div>
                </div>

                {resume.certificates.length > 0 ? (
                  <div className="mt-6 border-t border-[#eef1f5] pt-5">
                    <p className="text-[15px] font-semibold text-[#17202c]">자격·면허</p>
                    <div className="mt-1 divide-y divide-[#f0f2f5]">
                      {resume.certificates.map((certificate) => (
                        <DetailRow
                          key={certificate.id}
                          label={certificate.name}
                          value={[certificate.issuer, certificate.issuedYear].filter(Boolean).join(" · ") || "-"}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {resume.languages.length > 0 ? (
                  <div className="mt-6 border-t border-[#eef1f5] pt-5">
                    <p className="text-[15px] font-semibold text-[#17202c]">어학</p>
                    <div className="mt-1 divide-y divide-[#f0f2f5]">
                      {resume.languages.map((language) => (
                        <DetailRow key={language.id} label={language.name} value={language.level} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </SectionCard>
            ) : null}

            {resume && resume.selfIntroduction.trim() ? (
              <SectionCard title="자기소개">
                <p className="max-w-[680px] text-[15px] font-normal leading-[1.75] text-[#3f4855]">{resume.selfIntroduction}</p>
              </SectionCard>
            ) : null}

            {resume && resume.attachments.length > 0 ? (
              <SectionCard title="첨부 문서">
                <div className="divide-y divide-[#f0f2f5]">
                  {resume.attachments.map((attachment) => {
                    const extension = attachment.fileName.split(".").pop()?.toUpperCase() ?? "";
                    return (
                      <div key={attachment.fileName} className="flex items-center gap-4 py-4 first:pt-0">
                        <span className="grid h-12 w-12 shrink-0 place-items-center border border-[#e5e9ef] bg-[#f7f8fa] text-[#596373]">
                          <FileText size={20} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[16px] font-semibold tracking-[-0.01em] text-[#1c2128]">{attachment.fileName}</p>
                          <p className="mt-1 text-[13px] font-normal text-[#8a94a3]">
                            {extension} · {attachment.fileSizeLabel}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            ) : null}
          </div>

          <aside className="sticky top-[84px] h-fit space-y-4 self-start max-[1180px]:static">
            <SectionCard title="직무 적합도">
              <FitScoreBar score={applicant.fitScore} />
              <p className="mt-1 text-[13px] font-normal text-[#8a94a3]">
                {applicant.fitTotal}개 요건 중 {applicant.fitMet}개 충족
              </p>
              <p className="mt-4 text-[13px] font-normal leading-relaxed text-[#8a94a3]">지원자가 입력한 이력서와 공고 요건을 비교한 참고 정보입니다.</p>
            </SectionCard>

            <SectionCard title="채용 진행">
              <StageStepper applicant={applicant} />
            </SectionCard>

            {resume ? (
              <SectionCard title="희망 근무조건">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <PanelField label="희망 분야" value={trackLabel ?? "-"} />
                  <PanelField label="경력 구분" value={findLabel(experienceOptions, resume.workPreference.experienceId) ?? "-"} />
                  <PanelField
                    label="희망 지역"
                    value={resume.workPreference.regionIds.length ? resume.workPreference.regionIds.map((id) => findLabel(regionOptions, id) ?? id).join(", ") : "-"}
                  />
                  <PanelField label="희망 연봉" value={findLabel(salaryOptions, resume.workPreference.salaryId) ?? "-"} />
                  <PanelField label="근무형태" value={findLabel(employmentTypeOptions, resume.workPreference.employmentTypeId) ?? "-"} />
                </div>
              </SectionCard>
            ) : null}
          </aside>
        </div>
      </div>
    </BusinessCenterShell>
  );
}
