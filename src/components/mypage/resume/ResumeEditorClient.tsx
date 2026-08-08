"use client";

import { ChevronDown, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { JobFilterPanel, OptionChip } from "@/components/SearchFilterPanel";
import { Segmented } from "@/components/business/BusinessFormControls";
import { IN, SEL, TA } from "@/components/job-registration/fieldClasses";
import {
  applyResumeConvertPatch,
  countPatchedSections,
  readResumeConvertDraft,
} from "@/components/mypage/resume/resumeConvertDemo";
import { EmptyNotice, ResumeContentView } from "@/components/shared/ResumeContentView";
import { Button } from "@/components/ui/Button";
import { FormRow, ResumeSectionCard } from "@/components/ui/FormSection";
import { ModalShell } from "@/components/ui/ModalShell";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import {
  domesticRegionOptions,
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
import { normalizeRegionIdsForTrack } from "@/hooks/useJobFilters";
import {
  createEmptyBuiltResume,
  getMatchReadiness,
  getMissingRequiredSections,
  getSectionCompletion,
  type BuiltResume,
  type ResumeCareerEntry,
  type ResumeCertificate,
  type ResumeLanguage,
  type ResumeMatchReadiness,
} from "@/data/resumes";
import type { JobTrack } from "@/types/jobs";

const matchReadinessLabels: Record<ResumeMatchReadiness, string> = {
  basic: "기본",
  medium: "보통",
  full: "충분",
};

const jobCategoryOptionsByTrack: Record<JobTrack, typeof industryJobCategoryOptions> = {
  industry: industryJobCategoryOptions,
  research: researchJobCategoryOptions,
  pharmacy: pharmacyJobCategoryOptions,
  hospital: hospitalJobCategoryOptions,
};

/**
 * 이력서의 "경력 구분"은 본인의 경력이므로 공고 쪽 "경력무관"(any)은 뺀다.
 * 바로 아래 학위 셀렉트가 educationOptions에서 "학력무관"을 빼는 것과 같은 규칙이다.
 */
const resumeExperienceOptions = experienceOptions.filter((option) => option.id !== "any");

/** 트랙별 희망 지역 선택지. 약국·병원은 "해외"가 없다 — 공고 필터 4트랙과 같은 규칙. */
function regionOptionsForTrack(track: JobTrack) {
  return track === "pharmacy" || track === "hospital" ? domesticRegionOptions : regionOptions;
}

/**
 * 셀렉트에 없는 경력 구분 값(과거에 저장된 "경력무관" 등)을 미선택으로 되돌린다.
 * 그대로 두면 controlled select가 맞는 option을 못 찾아 빈칸으로 그려지는데,
 * 값 자체는 남아 있어 완료도만 채워진 것처럼 보인다 — 화면과 상태를 함께 맞춘다.
 */
function withKnownExperienceId(resume: BuiltResume): BuiltResume {
  const { experienceId } = resume.workPreference;
  if (!experienceId || resumeExperienceOptions.some((option) => option.id === experienceId)) return resume;
  return { ...resume, workPreference: { ...resume.workPreference, experienceId: null } };
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * 한 줄 입력·셀렉트의 공통 폭. 리스트 행 안에서 나란히 놓이는 입력(자격 3칸 등)은
 * 행 레이아웃이 폭을 정하므로 여기서 제외한다.
 */
const FIELD_WIDTH = "max-w-[420px]";

/**
 * 여러 줄 입력의 폭. 기관정보 관리의 720px보다 넓게 잡는다 — 이력서의 자기소개·경력 상세는
 * 문단 단위로 길게 쓰는 칸이라 한 줄이 더 길어도 읽힌다.
 * 공용 상수(PROFILE_TEXT_FIELD_WIDTH)는 다른 화면도 쓰므로 건드리지 않고 여기서만 덮는다.
 */
const TEXTAREA_WIDTH = "max-w-[800px]";

/**
 * SEL은 화살표 자리(pr-8)만 비워 두고 아이콘은 그리지 않는다 — 공고 등록 폼도 같다.
 * 이력서 폼은 아이콘을 유지하기로 해서, 그 위치를 잡을 relative 컨테이너만 남긴다.
 */
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
    <div className={`relative ${FIELD_WIDTH}`}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={SEL}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a95a5]" size={16} />
    </div>
  );
}

/** 자격·경력·어학 세 목록이 공유하는 행 삭제 버튼. */
function RowRemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 shrink-0 place-items-center text-[#a0a9b7] hover:bg-[#fff0f0] hover:text-danger"
    >
      <Trash2 size={15} />
    </button>
  );
}

/** 자격·경력·어학 세 목록이 공유하는 행 추가 버튼. */
function RowAddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="subtle-button inline-flex h-9 items-center gap-1.5 px-3 text-[13px] font-medium">
      <Plus size={15} />
      {label}
    </button>
  );
}

export function ResumeEditorClient({ mode, initialResume }: { mode: "create" | "edit"; initialResume?: BuiltResume }) {
  const router = useRouter();
  const [draft, setDraft] = useState<BuiltResume>(() => withKnownExperienceId(initialResume ?? createEmptyBuiltResume(uid("resume"))));
  const [notice, setNotice] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  /**
   * 첨부 이력서 변환으로 넘어온 경우, 목록 화면이 sessionStorage에 둔 결과를 집어 draft에 얹는다.
   * 인계분은 읽는 즉시 지워지므로(readResumeConvertDraft) 한 번만 반영된다 — Strict Mode에서
   * effect가 두 번 돌아도 두 번째는 null이라 중복 채움·중복 알림이 없다.
   */
  useEffect(() => {
    if (mode !== "create") return;
    const patch = readResumeConvertDraft();
    if (!patch) return;
    setDraft((current) => withKnownExperienceId(applyResumeConvertPatch(current, patch)));
    setNotice(`${countPatchedSections(patch)}개 항목을 채웠습니다. 내용을 확인해 주세요.`);
  }, [mode]);

  // 미리보기의 Escape·body 스크롤 잠금은 ModalShell이 맡는다(previewOpen이 마운트를 결정한다).

  const sections = getSectionCompletion(draft);
  // 관문(필수 3영역)과 매칭 준비도(선택 3영역)는 서로 다른 질문이라 지표를 나눠 둔다.
  const missingRequiredCount = getMissingRequiredSections(draft).length;
  const matchReadiness = getMatchReadiness(draft);
  const categoriesForTrack = jobCategoryOptionsByTrack[draft.workPreference.track];
  const regionsForTrack = regionOptionsForTrack(draft.workPreference.track);

  /**
   * "소분류를 전부 고른 분류"를 매번 계산해서 JobFilterPanel에 넘긴다.
   * 이력서는 저장 형식에 jobCategoryIds가 없고(1차 분류만 고른 상태를 담을 자리가 없다)
   * toggleJobCategory가 소분류를 전부 켜는 방식이라, 1차 선택 상태는 소분류에서 되짚는 것이 정본이다.
   * 예전엔 여기에 빈 배열을 넘겨 "OO 전체" 칩이 어떤 경우에도 활성 표시되지 않았다.
   */
  const selectedCategoryIds = categoriesForTrack
    .filter(
      (category) =>
        category.subcategories.length > 0 &&
        category.subcategories.every((subcategory) => draft.jobSubcategoryIds.includes(subcategory.id)),
    )
    .map((category) => category.id);

  const updateWorkPreference = <K extends keyof BuiltResume["workPreference"]>(key: K, value: BuiltResume["workPreference"][K]) => {
    setDraft((current) => ({ ...current, workPreference: { ...current.workPreference, [key]: value } }));
  };

  /** 트랙 전환은 지역 정규화를 함께 해야 해서 updateWorkPreference를 쓰지 않는다. */
  const selectTrack = (track: JobTrack) => {
    setDraft((current) => ({
      ...current,
      workPreference: {
        ...current.workPreference,
        track,
        regionIds: normalizeRegionIdsForTrack(track, current.workPreference.regionIds),
      },
    }));
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

  const saveDraft = () => {
    setNotice("임시저장되었습니다. 작성 중인 내용은 이 브라우저에 남아있는 동안 유지됩니다.");
  };

  const showPreview = () => {
    setPreviewOpen(true);
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
        <div className="mt-5 flex items-center justify-between gap-3 border border-border bg-brand-soft px-4 py-3 text-[13px] font-medium text-brand">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="알림 닫기">
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div className="mt-6 min-w-0 space-y-5">
        {/* 세로 패딩은 섹션 카드 본문(ResumeSectionCard의 py-[18px])에 맞춘다 — 헤더가 없는 카드라
            이 패딩이 곧 첫 행 위 여백이고, py-6이면 아래 카드들보다 6px 더 떠 보였다.
            가로는 px-7 유지(줄이면 라벨·컨트롤 x좌표가 밀린다). */}
        <section className="surface px-7 py-[18px]">
          <FormRow label="이력서 제목" required align="center">
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="예: RA 이직용 (2026 상반기), 메디컬 마케팅 도전용"
              className={`${IN} ${FIELD_WIDTH}`}
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
            {/* FormRow가 items-start라 컨트롤 스스로 높이를 가져야 라벨과 기준선이 맞는다.
                44px은 위 두 행(입력칸·체크박스 라벨)과 같은 값 — 세 행의 중심이 일치한다.
                고정 h-11이 아니라 최소 높이인 이유는 좁은 폭에서 옆 설명이 3줄로 접히면 넘치기 때문이다. */}
            <div className="flex min-h-[44px] items-center gap-3">
              <ToggleSwitch
                label="제안 받기"
                checked={draft.proposalEnabled}
                onChange={(checked) => setDraft((current) => ({ ...current, proposalEnabled: checked }))}
              />
              <span className="text-[12px] font-normal text-[#8a94a3]">헤드헌팅·기업 담당자에게 이력서를 공개해 포지션 제안을 받습니다.</span>
            </div>
          </FormRow>
        </section>

        {/* 매칭 준비도 — 관문(하단 바)과 다른 질문에 답하는 지표라 자리를 나눠 둔다.
            게이지 없이 단계 텍스트만 쓴다: 채울수록 좋아진다는 방향만 알리고 점수처럼 읽히지 않게 한다. */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border border-border bg-[#fafafa] px-5 py-3.5 max-[760px]:px-4">
          <p className="flex items-baseline gap-2">
            <span className="text-[13px] font-normal text-[#595959]">매칭 준비도</span>
            <span className="text-[14px] font-semibold text-[#111111]">{matchReadinessLabels[matchReadiness]}</span>
          </p>
          <p className="text-[13px] font-normal text-[#8a94a3]">매칭에 반영되는 정보를 채울수록 높아져요</p>
        </div>

        <div id="resume-section-workPreference">
          <ResumeSectionCard
            index={1}
            title="희망 근무조건"
            description="채용 추천과 간편지원에 활용되는 기본 조건입니다."
            status={sections.workPreference ? "완료" : "필수"}
          >
            <FormRow label="희망 분야" required align="center">
              <Segmented value={draft.workPreference.track} options={jobTracks} onChange={selectTrack} />
            </FormRow>
            <FormRow label="경력 구분" required align="center">
              <SelectShell value={draft.workPreference.experienceId ?? ""} onChange={(value) => updateWorkPreference("experienceId", value || null)}>
                <option value="">선택 안 함</option>
                {resumeExperienceOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </SelectShell>
            </FormRow>
            <FormRow label="희망 지역" required>
              <div className="flex flex-wrap gap-2">
                {regionsForTrack.map((option) => (
                  <OptionChip
                    key={option.id}
                    option={option}
                    active={draft.workPreference.regionIds.includes(option.id)}
                    onClick={() => toggleRegion(option.id)}
                  />
                ))}
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
          </ResumeSectionCard>
        </div>

        <div id="resume-section-education">
          <ResumeSectionCard index={2} title="학력" status={sections.education ? "완료" : "필수"}>
            <FormRow label="학교" required align="center">
              <input
                value={draft.education.school}
                onChange={(event) => setDraft((current) => ({ ...current, education: { ...current.education, school: event.target.value } }))}
                placeholder="예: 서울대학교"
                className={`${IN} ${FIELD_WIDTH}`}
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
            <FormRow label="전공" required align="center">
              <input
                value={draft.education.major}
                onChange={(event) => setDraft((current) => ({ ...current, education: { ...current.education, major: event.target.value } }))}
                placeholder="예: 약학"
                className={`${IN} ${FIELD_WIDTH}`}
              />
            </FormRow>
            <p className="mt-3 text-[12px] font-normal text-[#8a94a3]">학위·전공은 제약·바이오 공고 매칭에 우선 반영됩니다.</p>
          </ResumeSectionCard>
        </div>

        <div id="resume-section-certificates">
          <ResumeSectionCard index={3} title="자격·면허" description="면허와 자격을 입력하면 매칭 정확도가 높아져요">
            <div className="space-y-2.5">
              {draft.certificates.length ? (
                draft.certificates.map((certificate) => (
                  <div key={certificate.id} className="flex flex-wrap items-center gap-2 border border-border bg-[#fbfcfd] p-3">
                    {/* 행 안의 폭은 width 대신 flex-basis로 준다 — IN의 w-full과 부딪히지 않는다. */}
                    <input
                      value={certificate.name}
                      onChange={(event) => updateCertificate(certificate.id, { name: event.target.value })}
                      placeholder="자격·면허명"
                      className={`${IN} flex-1 min-w-[160px]`}
                    />
                    <input
                      value={certificate.issuedYear}
                      onChange={(event) => updateCertificate(certificate.id, { issuedYear: event.target.value })}
                      placeholder="취득년도"
                      className={`${IN} shrink-0 grow-0 basis-[100px]`}
                    />
                    <input
                      value={certificate.issuer}
                      onChange={(event) => updateCertificate(certificate.id, { issuer: event.target.value })}
                      placeholder="발급기관"
                      className={`${IN} shrink-0 grow-0 basis-[140px]`}
                    />
                    <RowRemoveButton label="자격·면허 삭제" onClick={() => removeCertificate(certificate.id)} />
                  </div>
                ))
              ) : (
                <EmptyNotice />
              )}
              <RowAddButton label="자격·면허 추가" onClick={addCertificate} />
            </div>
          </ResumeSectionCard>
        </div>

        <div id="resume-section-jobSubcategory">
          <ResumeSectionCard
            index={4}
            title="전문 직무"
            description="공고 필터와 같은 직무 분류에서 선택합니다. 하나의 분류 체계를 필터·이력서·관심 조건에서 공유합니다."
            status={sections.jobSubcategory ? "완료" : "필수"}
          >
            <p className="mb-3 text-[13px] font-medium text-[#596373]">선택됨 {draft.jobSubcategoryIds.length}</p>
            <JobFilterPanel
              categories={categoriesForTrack}
              selectedCategoryIds={selectedCategoryIds}
              selectedJobIds={draft.jobSubcategoryIds}
              onToggleJobCategory={toggleJobCategory}
              onToggleJobSubcategory={toggleJobSubcategory}
            />
            <p className="mt-3 text-[12px] font-normal leading-[1.6] text-[#8a94a3]">선택한 직무는 공고 추천·간편지원 매칭에 사용됩니다.</p>
          </ResumeSectionCard>
        </div>

        <div id="resume-section-careers">
          <ResumeSectionCard
            index={5}
            title="경력"
            description="경력을 입력하면 나에게 맞는 공고 매칭에 도움이 돼요"
            collapsible
            defaultOpen={draft.careers.length > 0}
          >
            <div className="space-y-3">
              {draft.careers.length ? (
                draft.careers.map((career) => (
                  <div key={career.id} className="border border-border bg-[#fbfcfd] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="grid flex-1 grid-cols-2 gap-2 max-[520px]:grid-cols-1">
                        <input
                          value={career.company}
                          onChange={(event) => updateCareer(career.id, { company: event.target.value })}
                          placeholder="회사명"
                          className={IN}
                        />
                        <input
                          value={career.role}
                          onChange={(event) => updateCareer(career.id, { role: event.target.value })}
                          placeholder="직무·역할"
                          className={IN}
                        />
                      </div>
                      <RowRemoveButton label="경력 삭제" onClick={() => removeCareer(career.id)} />
                    </div>
                    <input
                      value={career.period}
                      onChange={(event) => updateCareer(career.id, { period: event.target.value })}
                      placeholder="근무기간 (예: 2022.03 - 재직중)"
                      className={`${IN} mt-2`}
                    />
                    <textarea
                      value={career.description}
                      onChange={(event) => updateCareer(career.id, { description: event.target.value })}
                      placeholder="주요 업무를 간단히 작성해 주세요."
                      rows={2}
                      className={`${TA} mt-2 ${TEXTAREA_WIDTH}`}
                    />
                  </div>
                ))
              ) : (
                <EmptyNotice />
              )}
              <RowAddButton label="경력 추가" onClick={addCareer} />
            </div>
          </ResumeSectionCard>
        </div>

        <div id="resume-section-languages">
          <ResumeSectionCard index={6} title="어학" collapsible defaultOpen={draft.languages.length > 0}>
            <div className="space-y-2.5">
              {draft.languages.length ? (
                draft.languages.map((language) => (
                  <div key={language.id} className="flex flex-wrap items-center gap-2 border border-border bg-[#fbfcfd] p-3">
                    <input
                      value={language.name}
                      onChange={(event) => updateLanguage(language.id, { name: event.target.value })}
                      placeholder="언어 (예: 영어)"
                      className={`${IN} shrink-0 grow-0 basis-[140px]`}
                    />
                    <input
                      value={language.level}
                      onChange={(event) => updateLanguage(language.id, { level: event.target.value })}
                      placeholder="수준 (예: 비즈니스 회화 가능)"
                      className={`${IN} flex-1 min-w-[160px]`}
                    />
                    <RowRemoveButton label="어학 삭제" onClick={() => removeLanguage(language.id)} />
                  </div>
                ))
              ) : (
                <EmptyNotice />
              )}
              <RowAddButton label="어학 추가" onClick={addLanguage} />
            </div>
          </ResumeSectionCard>
        </div>

        <div id="resume-section-selfIntroduction">
          <ResumeSectionCard
            index={7}
            title="자기소개"
            description="자기소개를 채우면 경험과 강점이 매칭에 더 잘 반영돼요"
            collapsible
            defaultOpen={draft.selfIntroduction.trim().length > 0}
          >
            <textarea
              value={draft.selfIntroduction}
              onChange={(event) => setDraft((current) => ({ ...current, selfIntroduction: event.target.value }))}
              placeholder="직무 경험과 강점을 간단히 소개해 주세요."
              rows={5}
              maxLength={1000}
              className={`${TA} ${TEXTAREA_WIDTH}`}
            />
            <p className={`mt-2 text-right text-[12px] font-medium text-[#98a2b0] ${TEXTAREA_WIDTH}`}>
              {draft.selfIntroduction.length} / 1000
            </p>
          </ResumeSectionCard>
        </div>

        {/* ── 하단 저장바 — 공고 등록 폼과 같은 문법(space-y-5 스택의 마지막 자식 + sticky bottom-0).
              fixed가 아니라 sticky라 스택 끝에서는 바가 제 자리를 차지한다 — 마지막 섹션이 가려지지 않아
              본문에 따로 하단 여백을 두지 않는다. ── */}
        <div className="sticky bottom-0 z-30 min-h-[64px] border-t border-border bg-white/95 px-6 py-4 shadow-[0_-4px_16px_rgba(20,32,46,0.08)] backdrop-blur max-[760px]:px-4">
          <div className="flex items-center justify-between gap-4">
            {/* 관문 상태 — 작성률이 아니라 "지금 지원에 쓸 수 있는가"에 답한다. 좁은 폭에서는 버튼 3개를 위해 숨긴다. */}
            <p className="text-[13px] font-normal text-[#7b8491] max-[640px]:hidden">
              {missingRequiredCount > 0 ? `필수 항목 ${missingRequiredCount}개 남았어요` : "지원할 준비가 됐어요"}
            </p>
            {/* ≤640px에서는 grid로 3등분한다 — Button의 shrink-0가 flex에서 줄어들지 못하게 막는다. */}
            <div className="flex gap-2 max-[640px]:grid max-[640px]:w-full max-[640px]:grid-cols-3">
              <Button type="button" variant="secondary" size="md" onClick={showPreview} className="max-[640px]:w-full max-[640px]:px-3">
                미리보기
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={saveDraft}
                className="border-transparent text-[#68717e] hover:border-[#cfd8e3] hover:text-[#111111] max-[640px]:w-full max-[640px]:px-3"
              >
                임시저장
              </Button>
              <Button type="button" variant="primary" size="md" onClick={completeResume} className="max-[640px]:w-full max-[640px]:px-3">
                작성 완료
              </Button>
            </div>
          </div>
        </div>
      </div>

      {previewOpen ? (
        <ModalShell
          title={draft.title || "제목 없는 이력서"}
          headerVariant="caption"
          description="기업·헤드헌터에게 보이는 내용을 미리 확인합니다"
          /* 제목이 이력서 이름이라 스크린리더에는 이 창이 무엇인지 따로 알린다 */
          ariaLabel="이력서 미리보기"
          onClose={() => setPreviewOpen(false)}
          maxWidth="max-w-[720px]"
        >
          <div className="overflow-y-auto bg-[#f7f8fa] px-6 py-6">
            <ResumeContentView content={draft} />
          </div>
        </ModalShell>
      ) : null}
    </MyPageShell>
  );
}
