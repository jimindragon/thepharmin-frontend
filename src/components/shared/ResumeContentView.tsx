import type { ReactNode } from "react";
import { DetailPill } from "@/components/shared/DetailPill";
import { optionLabelMaps } from "@/config/jobFilters/index";
import { jobTrackLabels } from "@/config/jobTracks";
import type { ResumeContent } from "@/data/resumes";

function optionLabel(map: Map<string, string>, id: string | null): string {
  if (!id) return "-";
  return map.get(id) ?? id;
}

function ContentSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-border bg-white p-6 max-[640px]:p-4">
      <h2 className="mb-4 text-[15px] font-bold tracking-[-0.01em] text-[#17202c]">{title}</h2>
      {children}
    </section>
  );
}

/** 목록이 비었을 때의 안내 한 줄. 읽기 전용 뷰와 이력서 편집 폼이 같은 문구·같은 톤을 쓴다. */
export function EmptyNotice() {
  return <p className="text-[13px] font-normal text-[#a0a9b7]">입력된 내용이 없습니다</p>;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-x-6 py-3 max-[560px]:grid-cols-1 max-[560px]:gap-x-0 max-[560px]:gap-y-1">
      <span className="text-[13px] font-medium text-[#8a94a3]">{label}</span>
      <span className="min-w-0 text-[15px] font-normal leading-relaxed text-[#2f3845]">{value}</span>
    </div>
  );
}

function PanelField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[12px] font-medium text-[#8a94a3]">{label}</p>
      <p className="mt-1 text-[14px] font-bold text-[#17202c]">{value}</p>
    </div>
  );
}

export function ResumeContentView({ content }: { content: ResumeContent }) {
  const trackLabel = jobTrackLabels[content.workPreference.track];

  const educationEmpty = !content.education.school.trim() && !content.education.degreeId && !content.education.major.trim();
  const workPreferenceEmpty =
    !content.workPreference.experienceId &&
    content.workPreference.regionIds.length === 0 &&
    !content.workPreference.salaryId &&
    !content.workPreference.employmentTypeId;

  return (
    <div className="space-y-5">
      <ContentSection title="경력">
        {content.careers.length > 0 ? (
          <div className="divide-y divide-[#f0f2f5]">
            {content.careers.map((career) => (
              <div key={career.id} className="py-4 first:pt-0">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-[15px] font-bold text-[#17202c]">{career.company}</p>
                    <p className="text-[14px] font-medium text-[#596373]">{career.role}</p>
                  </div>
                  <p className="shrink-0 text-[12px] font-normal text-[#8a94a3]">{career.period}</p>
                </div>
                {career.description ? <p className="mt-2 text-[13px] font-normal leading-relaxed text-[#3f4855]">{career.description}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyNotice />
        )}
      </ContentSection>

      <ContentSection title="전문 직무">
        {content.jobSubcategoryIds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {content.jobSubcategoryIds.map((id) => (
              <DetailPill key={id}>{optionLabelMaps.jobSubcategory.get(id) ?? id}</DetailPill>
            ))}
          </div>
        ) : (
          <EmptyNotice />
        )}
      </ContentSection>

      <ContentSection title="기본 정보">
        <div>
          <p className="text-[15px] font-bold text-[#17202c]">학력</p>
          {educationEmpty ? (
            <div className="mt-1">
              <EmptyNotice />
            </div>
          ) : (
            <div className="mt-1 divide-y divide-[#f0f2f5]">
              <DetailRow label="학교" value={content.education.school || "-"} />
              <DetailRow label="학위" value={optionLabel(optionLabelMaps.education, content.education.degreeId)} />
              <DetailRow label="전공" value={content.education.major || "-"} />
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-[#eef1f5] pt-5">
          <p className="text-[15px] font-bold text-[#17202c]">자격·면허</p>
          {content.certificates.length > 0 ? (
            <div className="mt-1 divide-y divide-[#f0f2f5]">
              {content.certificates.map((certificate) => (
                <DetailRow
                  key={certificate.id}
                  label={certificate.name}
                  value={[certificate.issuer, certificate.issuedYear].filter(Boolean).join(" · ") || "-"}
                />
              ))}
            </div>
          ) : (
            <div className="mt-1">
              <EmptyNotice />
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-[#eef1f5] pt-5">
          <p className="text-[15px] font-bold text-[#17202c]">어학</p>
          {content.languages.length > 0 ? (
            <div className="mt-1 divide-y divide-[#f0f2f5]">
              {content.languages.map((language) => (
                <DetailRow key={language.id} label={language.name} value={language.level} />
              ))}
            </div>
          ) : (
            <div className="mt-1">
              <EmptyNotice />
            </div>
          )}
        </div>
      </ContentSection>

      <ContentSection title="자기소개">
        {content.selfIntroduction.trim() ? (
          <p className="text-[15px] font-normal leading-[1.75] text-[#3f4855]">{content.selfIntroduction}</p>
        ) : (
          <EmptyNotice />
        )}
      </ContentSection>

      <ContentSection title="희망 근무조건">
        {workPreferenceEmpty ? (
          <EmptyNotice />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <PanelField label="희망 분야" value={trackLabel} />
            <PanelField label="경력 구분" value={optionLabel(optionLabelMaps.experience, content.workPreference.experienceId)} />
            <PanelField
              label="희망 지역"
              value={
                content.workPreference.regionIds.length
                  ? content.workPreference.regionIds.map((id) => optionLabelMaps.region.get(id) ?? id).join(", ")
                  : "-"
              }
            />
            <PanelField label="희망 연봉" value={optionLabel(optionLabelMaps.salary, content.workPreference.salaryId)} />
            <PanelField label="근무형태" value={optionLabel(optionLabelMaps.employmentType, content.workPreference.employmentTypeId)} />
          </div>
        )}
      </ContentSection>
    </div>
  );
}
