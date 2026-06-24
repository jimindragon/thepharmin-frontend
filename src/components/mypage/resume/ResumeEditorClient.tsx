"use client";

import clsx from "clsx";
import { ChevronDown, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { JobFilterPanel } from "@/components/SearchFilterPanel";
import { Button } from "@/components/ui/Button";
import { FormRow, SectionCard } from "@/components/ui/FormSection";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
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
import {
  calculateResumeCompletion,
  createEmptyBuiltResume,
  getSectionCompletion,
  type BuiltResume,
  type ResumeCareerEntry,
  type ResumeCertificate,
  type ResumeLanguage,
} from "@/data/resumes";
import type { JobTrack } from "@/types/jobs";

const jobCategoryOptionsByTrack: Record<JobTrack, typeof industryJobCategoryOptions> = {
  industry: industryJobCategoryOptions,
  research: researchJobCategoryOptions,
  pharmacy: pharmacyJobCategoryOptions,
  hospital: hospitalJobCategoryOptions,
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

interface SectionDef {
  key: keyof ReturnType<typeof getSectionCompletion>;
  label: string;
  required: boolean;
}

const sectionDefs: SectionDef[] = [
  { key: "workPreference", label: "희망 근무조건", required: true },
  { key: "education", label: "학력", required: true },
  { key: "certificates", label: "자격·면허", required: false },
  { key: "jobSubcategory", label: "전문 직무", required: true },
  { key: "careers", label: "경력", required: false },
  { key: "languages", label: "어학", required: false },
  { key: "selfIntroduction", label: "자기소개", required: false },
];

function SelectShell({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative max-w-[320px]">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none border border-[#dce4ec] bg-white px-3.5 pr-9 text-[14px] font-medium text-[#333c49] outline-none transition hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a95a5]" size={16} />
    </div>
  );
}

function ListEmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-normal text-[#a0a9b7]">{children}</p>;
}

export function ResumeEditorClient({ mode, initialResume }: { mode: "create" | "edit"; initialResume?: BuiltResume }) {
  const router = useRouter();
  const [draft, setDraft] = useState<BuiltResume>(() => initialResume ?? createEmptyBuiltResume(uid("resume")));
  const [notice, setNotice] = useState("");

  const completion = calculateResumeCompletion(draft);
  const sections = getSectionCompletion(draft);
  const categoriesForTrack = jobCategoryOptionsByTrack[draft.workPreference.track];

  const updateWorkPreference = <K extends keyof BuiltResume["workPreference"]>(key: K, value: BuiltResume["workPreference"][K]) => {
    setDraft((current) => ({ ...current, workPreference: { ...current.workPreference, [key]: value } }));
  };

  const toggleRegion = (id: string) => {
    setDraft((current) => ({
      ...current,
      workPreference: {
        ...current.workPreference,
        regionIds: current.workPreference.regionIds.includes(id)
          ? current.workPreference.regionIds.filter((existing) => existing !== id)
          : [...current.workPreference.regionIds, id],
      },
    }));
  };

  const toggleJobCategory = (categoryId: string) => {
    const category = categoriesForTrack.find((item) => item.id === categoryId);
    if (!category) return;
    const subcategoryIds = category.subcategories.map((subcategory) => subcategory.id);
    const allSelected = subcategoryIds.every((id) => draft.jobSubcategoryIds.includes(id));

    setDraft((current) => ({
      ...current,
      jobSubcategoryIds: allSelected
        ? current.jobSubcategoryIds.filter((id) => !subcategoryIds.includes(id))
        : Array.from(new Set([...current.jobSubcategoryIds, ...subcategoryIds])),
    }));
  };

  const toggleJobSubcategory = (id: string) => {
    setDraft((current) => ({
      ...current,
      jobSubcategoryIds: current.jobSubcategoryIds.includes(id)
        ? current.jobSubcategoryIds.filter((existing) => existing !== id)
        : [...current.jobSubcategoryIds, id],
    }));
  };

  const addCertificate = () => {
    const next: ResumeCertificate = { id: uid("cert"), name: "", issuedYear: "", issuer: "" };
    setDraft((current) => ({ ...current, certificates: [...current.certificates, next] }));
  };

  const updateCertificate = (id: string, patch: Partial<ResumeCertificate>) => {
    setDraft((current) => ({
      ...current,
      certificates: current.certificates.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const removeCertificate = (id: string) => {
    setDraft((current) => ({ ...current, certificates: current.certificates.filter((item) => item.id !== id) }));
  };

  const addCareer = () => {
    const next: ResumeCareerEntry = { id: uid("career"), company: "", role: "", period: "", description: "" };
    setDraft((current) => ({ ...current, careers: [...current.careers, next] }));
  };

  const updateCareer = (id: string, patch: Partial<ResumeCareerEntry>) => {
    setDraft((current) => ({ ...current, careers: current.careers.map((item) => (item.id === id ? { ...item, ...patch } : item)) }));
  };

  const removeCareer = (id: string) => {
    setDraft((current) => ({ ...current, careers: current.careers.filter((item) => item.id !== id) }));
  };

  const addLanguage = () => {
    const next: ResumeLanguage = { id: uid("lang"), name: "", level: "" };
    setDraft((current) => ({ ...current, languages: [...current.languages, next] }));
  };

  const updateLanguage = (id: string, patch: Partial<ResumeLanguage>) => {
    setDraft((current) => ({ ...current, languages: current.languages.map((item) => (item.id === id ? { ...item, ...patch } : item)) }));
  };

  const removeLanguage = (id: string) => {
    setDraft((current) => ({ ...current, languages: current.languages.filter((item) => item.id !== id) }));
  };

  const scrollToSection = (key: string) => {
    const wrapper = document.getElementById(`resume-section-${key}`);
    if (!wrapper) return;
    wrapper.querySelector<HTMLElement>('[data-collapsible-header][aria-expanded="false"]')?.click();
    wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const saveDraft = () => {
    setNotice("임시저장되었습니다. 작성 중인 내용은 이 브라우저에 남아있는 동안 유지됩니다.");
  };

  const showPreview = () => {
    setNotice("미리보기 화면은 준비 중입니다. 입력한 내용은 작성 완료 후 이력서 카드에서 바로 확인할 수 있어요.");
  };

  const completeResume = () => {
    if (!draft.title.trim()) {
      setNotice("이력서 제목을 입력해 주세요.");
      return;
    }
    router.push("/mypage/resume");
  };

  const pageTitle = mode === "create" ? "이력서 작성" : "이력서 편집";

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "내 정보" }, { label: "이력서 관리", href: "/mypage/resume" }, { label: pageTitle }]} />

      <div className="mt-5 flex items-center justify-between gap-4">
        <h1 className="text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">{pageTitle}</h1>
      </div>
      <p className="mt-2.5 text-[13px] font-normal leading-[1.6] text-[#68717e]">대표 이력서로 지정하면 간편지원에 바로 첨부됩니다.</p>

      {notice ? (
        <div className="mt-5 flex items-center justify-between gap-3 border border-[#dddddd] bg-brand-soft px-4 py-3 text-[13px] font-medium text-brand">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="알림 닫기">
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_300px] gap-5 max-[1180px]:grid-cols-1">
        <div className="min-w-0 space-y-5">
          <section className="surface px-7 py-6">
            <FormRow label="이력서 제목" required align="center">
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="예: RA 직무용, 메디컬 마케팅용"
                className="h-11 w-full max-w-[420px] border border-[#dce4ec] px-3.5 text-[15px] font-medium text-[#333c49] outline-none transition hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </FormRow>
            <FormRow label="대표 이력서" align="center">
              <label className="inline-flex h-11 items-center gap-2.5 text-[13px] font-medium text-[#4c5665]">
                <input
                  type="checkbox"
                  checked={draft.isPrimary}
                  onChange={(event) => setDraft((current) => ({ ...current, isPrimary: event.target.checked }))}
                  className="h-[18px] w-[18px] accent-[var(--color-brand)]"
                />
                대표 이력서로 지정하면 간편지원에 바로 첨부됩니다.
              </label>
            </FormRow>
            <FormRow label="제안 받기" align="center">
              <div className="flex items-center gap-3">
                <ToggleSwitch
                  label="제안 받기"
                  checked={draft.proposalEnabled}
                  onChange={(checked) => setDraft((current) => ({ ...current, proposalEnabled: checked }))}
                />
                <span className="text-[12px] font-normal text-[#8a94a3]">헤드헌팅·기업 담당자에게 이력서를 공개해 포지션 제안을 받습니다.</span>
              </div>
            </FormRow>
          </section>

          <div id="resume-section-workPreference">
            <SectionCard
              index={1}
              title="희망 근무조건"
              description="채용 추천과 간편지원에 활용되는 기본 조건입니다."
              status={sections.workPreference ? "완료" : "필수 입력 필요"}
            >
              <FormRow label="희망 분야" required align="center">
                <div className="flex flex-wrap gap-2">
                  {jobTracks.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => updateWorkPreference("track", track.id)}
                      className={clsx(
                        "h-10 min-w-[88px] border px-4 text-[13px] font-medium transition-colors",
                        draft.workPreference.track === track.id
                          ? "border-[#111111] bg-[#111111] text-white"
                          : "border-[#dddddd] bg-[#f4f4f4] text-[#555555] hover:border-[#bdbdbd] hover:text-[#111111]",
                      )}
                    >
                      {track.label}
                    </button>
                  ))}
                </div>
              </FormRow>
              <FormRow label="경력 구분" required align="center">
                <SelectShell value={draft.workPreference.experienceId ?? ""} onChange={(value) => updateWorkPreference("experienceId", value || null)}>
                  <option value="">선택 안 함</option>
                  {experienceOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </SelectShell>
              </FormRow>
              <FormRow label="희망 지역" required>
                <div className="flex flex-wrap gap-2">
                  {regionOptions.slice(0, 9).map((option) => {
                    const active = draft.workPreference.regionIds.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleRegion(option.id)}
                        className={clsx(
                          "h-9 border px-3 text-[13px] font-medium transition-colors",
                          active ? "border-brand bg-[var(--color-brand-soft)] text-brand" : "border-[#dfe4ea] bg-white text-[#424b57] hover:border-brand hover:text-brand",
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </FormRow>
              <FormRow label="희망 연봉" align="center">
                <SelectShell value={draft.workPreference.salaryId ?? ""} onChange={(value) => updateWorkPreference("salaryId", value || null)}>
                  <option value="">선택 안 함</option>
                  {salaryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </SelectShell>
              </FormRow>
              <FormRow label="근무형태" align="center">
                <SelectShell
                  value={draft.workPreference.employmentTypeId ?? ""}
                  onChange={(value) => updateWorkPreference("employmentTypeId", value || null)}
                >
                  <option value="">선택 안 함</option>
                  {employmentTypeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </SelectShell>
              </FormRow>
            </SectionCard>
          </div>

          <div id="resume-section-education">
            <SectionCard index={2} title="학력" status={sections.education ? "완료" : "필수 입력 필요"}>
              <FormRow label="학교" required align="center">
                <input
                  value={draft.education.school}
                  onChange={(event) => setDraft((current) => ({ ...current, education: { ...current.education, school: event.target.value } }))}
                  placeholder="예: 서울대학교"
                  className="h-11 w-full max-w-[420px] border border-[#dce4ec] px-3.5 text-[14px] font-medium text-[#333c49] outline-none transition hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
              </FormRow>
              <FormRow label="학위" required align="center">
                <SelectShell
                  value={draft.education.degreeId ?? ""}
                  onChange={(value) => setDraft((current) => ({ ...current, education: { ...current.education, degreeId: value || null } }))}
                >
                  <option value="">선택 안 함</option>
                  {educationOptions
                    .filter((option) => option.id !== "any")
                    .map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                </SelectShell>
              </FormRow>
              <FormRow label="전공" align="center">
                <input
                  value={draft.education.major}
                  onChange={(event) => setDraft((current) => ({ ...current, education: { ...current.education, major: event.target.value } }))}
                  placeholder="예: 약학"
                  className="h-11 w-full max-w-[420px] border border-[#dce4ec] px-3.5 text-[14px] font-medium text-[#333c49] outline-none transition hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
              </FormRow>
              <p className="mt-3 text-[12px] font-normal text-[#8a94a3]">학위·전공은 제약·바이오 공고 매칭에 우선 반영됩니다.</p>
            </SectionCard>
          </div>

          <div id="resume-section-certificates">
            <SectionCard index={3} title="자격·면허" status={sections.certificates ? "완료" : "선택 사항"}>
              <div className="space-y-2.5">
                {draft.certificates.length ? (
                  draft.certificates.map((certificate) => (
                    <div key={certificate.id} className="flex flex-wrap items-center gap-2 border border-[#e5e9ef] bg-[#fbfcfd] p-3">
                      <input
                        value={certificate.name}
                        onChange={(event) => updateCertificate(certificate.id, { name: event.target.value })}
                        placeholder="자격·면허명"
                        className="h-9 flex-1 min-w-[160px] border border-[#dce4ec] bg-white px-3 text-[13px] font-medium outline-none focus:border-brand"
                      />
                      <input
                        value={certificate.issuedYear}
                        onChange={(event) => updateCertificate(certificate.id, { issuedYear: event.target.value })}
                        placeholder="취득년도"
                        className="h-9 w-[100px] border border-[#dce4ec] bg-white px-3 text-[13px] font-medium outline-none focus:border-brand"
                      />
                      <input
                        value={certificate.issuer}
                        onChange={(event) => updateCertificate(certificate.id, { issuer: event.target.value })}
                        placeholder="발급기관"
                        className="h-9 w-[140px] border border-[#dce4ec] bg-white px-3 text-[13px] font-medium outline-none focus:border-brand"
                      />
                      <button
                        type="button"
                        onClick={() => removeCertificate(certificate.id)}
                        aria-label="자격·면허 삭제"
                        className="grid h-9 w-9 shrink-0 place-items-center text-[#a0a9b7] hover:bg-[#fff0f0] hover:text-danger"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                ) : (
                  <ListEmptyRow>등록된 자격·면허가 없습니다.</ListEmptyRow>
                )}
                <button type="button" onClick={addCertificate} className="subtle-button inline-flex h-9 items-center gap-1.5 px-3 text-[13px] font-medium">
                  <Plus size={15} />
                  자격·면허 추가
                </button>
              </div>
            </SectionCard>
          </div>

          <div id="resume-section-jobSubcategory">
            <SectionCard
              index={4}
              title="전문 직무"
              description="공고 필터와 같은 직무 분류에서 선택합니다. 하나의 분류 체계를 필터·이력서·관심 조건에서 공유합니다."
              status={sections.jobSubcategory ? "완료" : "필수 입력 필요"}
            >
              <p className="mb-3 text-[13px] font-medium text-[#596373]">선택됨 {draft.jobSubcategoryIds.length}</p>
              <JobFilterPanel
                categories={categoriesForTrack}
                selectedCategoryIds={[]}
                selectedJobIds={draft.jobSubcategoryIds}
                onToggleJobCategory={toggleJobCategory}
                onToggleJobSubcategory={toggleJobSubcategory}
              />
              <p className="mt-3 text-[12px] font-normal leading-[1.6] text-[#8a94a3]">선택한 직무는 공고 추천·간편지원 매칭에 사용됩니다.</p>
            </SectionCard>
          </div>

          <div id="resume-section-careers">
            <SectionCard index={5} title="경력" collapsible defaultOpen={draft.careers.length > 0} status={sections.careers ? "완료" : "선택 사항"}>
              <div className="space-y-3">
                {draft.careers.length ? (
                  draft.careers.map((career) => (
                    <div key={career.id} className="border border-[#e5e9ef] bg-[#fbfcfd] p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="grid flex-1 grid-cols-2 gap-2 max-[520px]:grid-cols-1">
                          <input
                            value={career.company}
                            onChange={(event) => updateCareer(career.id, { company: event.target.value })}
                            placeholder="회사명"
                            className="h-9 border border-[#dce4ec] bg-white px-3 text-[13px] font-medium outline-none focus:border-brand"
                          />
                          <input
                            value={career.role}
                            onChange={(event) => updateCareer(career.id, { role: event.target.value })}
                            placeholder="직무·역할"
                            className="h-9 border border-[#dce4ec] bg-white px-3 text-[13px] font-medium outline-none focus:border-brand"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCareer(career.id)}
                          aria-label="경력 삭제"
                          className="grid h-9 w-9 shrink-0 place-items-center text-[#a0a9b7] hover:bg-[#fff0f0] hover:text-danger"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <input
                        value={career.period}
                        onChange={(event) => updateCareer(career.id, { period: event.target.value })}
                        placeholder="근무기간 (예: 2022.03 - 재직중)"
                        className="mt-2 h-9 w-full border border-[#dce4ec] bg-white px-3 text-[13px] font-medium outline-none focus:border-brand"
                      />
                      <textarea
                        value={career.description}
                        onChange={(event) => updateCareer(career.id, { description: event.target.value })}
                        placeholder="주요 업무를 간단히 작성해 주세요."
                        rows={2}
                        className="mt-2 w-full resize-y border border-[#dce4ec] bg-white px-3 py-2 text-[13px] font-normal leading-[1.6] outline-none focus:border-brand"
                      />
                    </div>
                  ))
                ) : (
                  <ListEmptyRow>등록된 경력이 없습니다.</ListEmptyRow>
                )}
                <button type="button" onClick={addCareer} className="subtle-button inline-flex h-9 items-center gap-1.5 px-3 text-[13px] font-medium">
                  <Plus size={15} />
                  경력 추가
                </button>
              </div>
            </SectionCard>
          </div>

          <div id="resume-section-languages">
            <SectionCard index={6} title="어학" collapsible defaultOpen={draft.languages.length > 0} status={sections.languages ? "완료" : "선택 사항"}>
              <div className="space-y-2.5">
                {draft.languages.length ? (
                  draft.languages.map((language) => (
                    <div key={language.id} className="flex flex-wrap items-center gap-2 border border-[#e5e9ef] bg-[#fbfcfd] p-3">
                      <input
                        value={language.name}
                        onChange={(event) => updateLanguage(language.id, { name: event.target.value })}
                        placeholder="언어 (예: 영어)"
                        className="h-9 w-[140px] border border-[#dce4ec] bg-white px-3 text-[13px] font-medium outline-none focus:border-brand"
                      />
                      <input
                        value={language.level}
                        onChange={(event) => updateLanguage(language.id, { level: event.target.value })}
                        placeholder="수준 (예: 비즈니스 회화 가능)"
                        className="h-9 flex-1 min-w-[160px] border border-[#dce4ec] bg-white px-3 text-[13px] font-medium outline-none focus:border-brand"
                      />
                      <button
                        type="button"
                        onClick={() => removeLanguage(language.id)}
                        aria-label="어학 삭제"
                        className="grid h-9 w-9 shrink-0 place-items-center text-[#a0a9b7] hover:bg-[#fff0f0] hover:text-danger"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                ) : (
                  <ListEmptyRow>등록된 어학 정보가 없습니다.</ListEmptyRow>
                )}
                <button type="button" onClick={addLanguage} className="subtle-button inline-flex h-9 items-center gap-1.5 px-3 text-[13px] font-medium">
                  <Plus size={15} />
                  어학 추가
                </button>
              </div>
            </SectionCard>
          </div>

          <div id="resume-section-selfIntroduction">
            <SectionCard
              index={7}
              title="자기소개"
              collapsible
              defaultOpen={draft.selfIntroduction.trim().length > 0}
              status={sections.selfIntroduction ? "완료" : "선택 사항"}
            >
              <textarea
                value={draft.selfIntroduction}
                onChange={(event) => setDraft((current) => ({ ...current, selfIntroduction: event.target.value }))}
                placeholder="직무 경험과 강점을 간단히 소개해 주세요."
                rows={5}
                maxLength={1000}
                className="w-full resize-y border border-[#dce4ec] px-3.5 py-3 text-[14px] font-normal leading-[1.7] outline-none transition placeholder:text-[#a4adba] hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
              <p className="mt-2 text-right text-[12px] font-medium text-[#98a2b0]">{draft.selfIntroduction.length} / 1000</p>
            </SectionCard>
          </div>
        </div>

        <aside className="sticky top-[84px] h-fit space-y-4 self-start max-[1180px]:static">
          <section className="surface px-6 py-6">
            <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#242b36]">작성 완료도</h2>
            <div className="mt-4 border border-[#e0e6ee] bg-[#f8fafb] p-4">
              <div className="flex items-end justify-between">
                <p className="text-[24px] font-medium text-[#111827]">{completion}%</p>
                <span className="text-[12px] font-medium text-[#5f6876]">{completion === 100 ? "작성 완료" : "작성 중"}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden bg-[#e3e8ef]">
                <span className="block h-full bg-[#111111] transition-all" style={{ width: `${completion}%` }} />
              </div>
            </div>

            <ul className="mt-5 space-y-1">
              {sectionDefs.map((section) => {
                const done = sections[section.key];
                return (
                  <li key={section.key}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(section.key)}
                      className="flex w-full items-center gap-2.5 px-1.5 py-2 text-left text-[13px] font-medium text-[#3d4653] transition-colors hover:text-brand"
                    >
                      <span className={clsx("h-[7px] w-[7px] shrink-0", done ? "bg-[#111111]" : "border border-[#c7cdd5] bg-transparent")} />
                      <span className="min-w-0 flex-1 truncate">{section.label}</span>
                      {section.required && !done ? <span className="shrink-0 text-[11px] font-normal text-danger">필수</span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 flex flex-col gap-2 border-t border-[#edf1f5] pt-5">
              <Button type="button" variant="primary" size="md" onClick={completeResume}>
                작성 완료
              </Button>
              <Button type="button" variant="secondary" size="md" onClick={showPreview}>
                미리보기
              </Button>
              <button type="button" onClick={saveDraft} className="h-9 text-[13px] font-medium text-[#8a94a3] hover:text-[#111111]">
                임시저장
              </button>
            </div>
          </section>
        </aside>
      </div>
    </MyPageShell>
  );
}
