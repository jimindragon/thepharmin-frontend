"use client";

import clsx from "clsx";
import { AlertCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { AttachmentUploader, type AttachmentItem } from "@/components/business/AttachmentUploader";
import { FieldLabel, SectionCard } from "@/components/business/BusinessFormControls";
import { HINT, IN, SEL, TA } from "@/components/job-registration/fieldClasses";
import { HiringProcessSelector } from "@/components/job-registration/HiringProcessSelector";
import { RecommendedKeywordPicker } from "@/components/job-registration/RecommendedKeywordPicker";
import { InfoNoticeBox } from "@/components/shared/InfoNoticeBox";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import {
  contractPeriodOptions,
  educationOptions,
  employmentTypeOptions,
  experienceOptions,
  researchJobCategoryOptions,
  workModeOptions,
} from "@/config/jobFilters/index";
import { researchInstitutionTypeOptions } from "@/config/jobFilters/researchFilters";
import { getRecommendedKeywords } from "@/config/coreKeywords";
import { researchFieldCategoryOptions } from "@/config/researchFields";
import type { JobCategoryOption } from "@/types/jobs";

// ── Static data ────────────────────────────────────────────────────────────────

const mockLab = {
  institution: "서울아산병원",
};

/** 실서비스에서는 로그인한 기관 프로필의 등록 주소로 대체될 자리 표시자 */
const MOCK_INSTITUTION_ADDRESS = "서울 송파구 올림픽로43길 88";

const SALARY_OPTS = ["기관 내규", "3,000만↑", "5,000만↑", "7,000만↑", "9,000만↑"];
const WELFARE_OPTS = [
  "연차·휴가", "유연근무제", "식대 지원", "교통 지원", "주거 지원", "건강검진",
  "교육 지원", "어학 지원", "학회·세미나 지원", "연구활동 지원", "논문·출판 지원", "장비·인프라 지원",
];

const MAX_KW = 8;

// ── Helpers (산업 폼에서 복사) ───────────────────────────────────────────────────

function toggleSet<T>(s: Set<T>, item: T): Set<T> {
  const n = new Set(s);
  if (n.has(item)) n.delete(item);
  else n.add(item);
  return n;
}

// ── Sub-components (산업 폼에서 복사) ────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1 text-[12px] text-danger">
      <AlertCircle size={12} aria-hidden />
      {message}
    </p>
  );
}

function ChipGroup({
  labelId,
  label,
  required,
  max,
  options,
  selected,
  onToggle,
  hint,
}: {
  labelId?: string;
  label: string;
  required?: boolean;
  max?: number;
  options: string[];
  selected: Set<string>;
  onToggle: (v: string) => void;
  hint?: string;
}) {
  const internalId = useId();
  const id = labelId ?? internalId;
  return (
    <div>
      <div id={id}>
        <FieldLabel className="block mb-2">
          {label}
          {required && <span className="ml-1 text-danger" aria-hidden>*</span>}
          {max != null && <span className="ml-2 text-[12px] font-normal text-[#7b8491]">최대 {max}개</span>}
        </FieldLabel>
      </div>
      <div role="group" aria-labelledby={id} className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = selected.has(opt);
          const blocked = max != null && selected.size >= max && !on;
          return (
            <button key={opt} type="button" role="checkbox" aria-checked={on} aria-disabled={blocked}
              onClick={() => !blocked && onToggle(opt)}
              className={clsx(
                "inline-flex h-9 items-center gap-1.5 border px-3.5 text-[12px] font-medium transition-colors",
                on ? "border-[#111111] bg-[#111111] text-white"
                  : blocked ? "cursor-not-allowed border-[#dfe4ea] bg-[#f5f6f7] text-[#aeb6c0]"
                    : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
              )}>
              {on && <span className="text-[10px]" aria-hidden>✓</span>}
              {opt}
            </button>
          );
        })}
      </div>
      {hint && <p className="mt-2 text-[12px] text-[#a0a9b7]">{hint}</p>}
    </div>
  );
}

function SegControl({
  label,
  required,
  options,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div>
      <div id={id}>
        <FieldLabel className="block mb-2" required={required}>
          {label}
        </FieldLabel>
      </div>
      <div role="radiogroup" aria-labelledby={id} className="inline-flex overflow-hidden border border-[#d8e0e8]">
        {options.map((opt) => (
          <button key={opt} type="button" role="radio" aria-checked={value === opt} onClick={() => onChange(opt)}
            className={clsx(
              "h-11 border-r border-[#d8e0e8] px-5 text-[13px] font-medium last:border-r-0 transition-colors",
              value === opt ? "bg-[#111111] text-white" : "bg-white text-[#4f5967] hover:bg-[#f7f8fa]",
            )}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  ariaLabel,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border border-border bg-white px-4 py-3">
      <div>
        <p className="text-[13px] font-medium text-[#303946]">{title}</p>
        {description && <p className="mt-1 text-[12px] text-[#7b8491]">{description}</p>}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={ariaLabel} />
    </div>
  );
}

/** 2단(대분류 → 세부 항목) 선택기 — 모집 직무·연구 분야 공용 */
function TwoTierPicker({
  label,
  hint,
  required,
  categories,
  activeCategoryId,
  onActiveCategoryChange,
  selected,
  onToggle,
  error,
  categoryAriaLabel,
  detailAriaLabel,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  categories: JobCategoryOption[];
  activeCategoryId: string;
  onActiveCategoryChange: (id: string) => void;
  selected: Set<string>;
  onToggle: (id: string) => void;
  error?: string;
  categoryAriaLabel: string;
  detailAriaLabel: string;
}) {
  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const labelById = new Map(categories.flatMap((c) => c.subcategories).map((s) => [s.id, s.label] as const));

  return (
    <div>
      <FieldLabel className="block mb-2">
        {label}
        {required && <span className="ml-1 text-danger" aria-hidden>*</span>}
        {hint && <span className="ml-2 text-[12px] font-normal text-[#7b8491]">{hint}</span>}
      </FieldLabel>
      <div className="grid grid-cols-[180px_1fr] border border-[#d8e0e8] max-[640px]:grid-cols-1">
        <div
          role="radiogroup"
          aria-label={categoryAriaLabel}
          className="max-h-[260px] overflow-auto border-r border-[#dfe4ea] bg-[#fbfcfd] max-[640px]:max-h-none max-[640px]:border-b max-[640px]:border-r-0"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={activeCategoryId === cat.id}
              onClick={() => onActiveCategoryChange(cat.id)}
              className={clsx(
                "block w-full border-b border-[#f0f2f5] px-3.5 py-2.5 text-left text-[13px] font-medium last:border-b-0 transition-colors",
                activeCategoryId === cat.id
                  ? "bg-[#111111] text-white"
                  : "bg-transparent text-[#4f5967] hover:bg-[#f5f6f7]",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          <p className="mb-3 text-[13px] font-semibold text-[#4f5967]">
            {activeCategory?.label} · 세부 항목
          </p>
          <div role="group" aria-label={detailAriaLabel} className="flex flex-wrap gap-2">
            {activeCategory?.subcategories.map((sub) => {
              const on = selected.has(sub.id);
              return (
                <button key={sub.id} type="button" role="checkbox" aria-checked={on}
                  onClick={() => onToggle(sub.id)}
                  className={clsx(
                    "inline-flex h-9 items-center gap-1.5 border px-3.5 text-[12px] font-medium transition-colors",
                    on
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
                  )}>
                  {on && <span className="text-[10px]" aria-hidden>✓</span>}
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {selected.size > 0 && (
        <p className="mt-2 text-[12px] text-[#7b8491]">
          선택됨: {Array.from(selected).map((id) => labelById.get(id) ?? id).join(", ")}
        </p>
      )}
      <FieldError message={error} />
    </div>
  );
}

// ── Style constants ────────────────────────────────────────────────────────────


// ── Main component ─────────────────────────────────────────────────────────────

export function ResearchJobPostingForm() {
  // §1 기본 정보
  const [title, setTitle] = useState("");
  const [activeJobCategory, setActiveJobCategory] = useState(researchJobCategoryOptions[0].id);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [activeFieldCategory, setActiveFieldCategory] = useState(researchFieldCategoryOptions[0].id);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [headcount, setHeadcount] = useState("");
  const [employmentType, setEmploymentType] = useState("permanent");
  const [careerType, setCareerType] = useState("any");
  const [educationType, setEducationType] = useState("any");
  const [isLeadership, setIsLeadership] = useState(false);

  // §2 연구실 정보
  const [labInstitutionType, setLabInstitutionType] = useState("");
  const [labName, setLabName] = useState("");
  const [labPi, setLabPi] = useState("");
  const [labAddress, setLabAddress] = useState("");
  const [sameAsInstitutionAddress, setSameAsInstitutionAddress] = useState(false);
  const [labHomepage, setLabHomepage] = useState("");
  const [labCareerPage, setLabCareerPage] = useState("");
  const [labIntro, setLabIntro] = useState("");

  // §3 모집 내용
  const [summary, setSummary] = useState("");
  const [researchTopics, setResearchTopics] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [preferred, setPreferred] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // §4 근무조건
  const [workMode, setWorkMode] = useState("");
  const [salary, setSalary] = useState("");
  const [contractPeriod, setContractPeriod] = useState("");
  const [selectedBenefits, setSelectedBenefits] = useState<Set<string>>(new Set());
  const [workCondDetail, setWorkCondDetail] = useState("");

  // §5 검색 노출 설정
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [imageOption, setImageOption] = useState<"default" | "upload" | "none">("default");

  // 전형절차 및 제출서류 (선택 입력)
  const [hiringProcess, setHiringProcess] = useState<string[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);

  // §6 지원방법 및 마감일
  const [applyMethod, setApplyMethod] = useState<"url" | "quick" | "email">("url");
  const [applyUrl, setApplyUrl] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [deadline, setDeadline] = useState("");
  const [earlyClose, setEarlyClose] = useState(false);

  // §7 상세 이미지 및 첨부 자료
  const [imageAttachments, setImageAttachments] = useState<AttachmentItem[]>([]);
  const [fileAttachments, setFileAttachments] = useState<AttachmentItem[]>([]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [missingCount, setMissingCount] = useState(0);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const setRef = (key: string) => (el: HTMLElement | null) => { fieldRefs.current[key] = el; };

  // 선택된 연구 분야(소분류) 기준으로 추천 키워드를 계산 — 분야가 바뀔 때마다 재계산
  const recommendedKeywords = useMemo(
    () => getRecommendedKeywords("research", { fieldIds: Array.from(selectedFields) }),
    [selectedFields],
  );

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim())              next.title          = "공고 제목을 입력해 주세요.";
    if (selectedJobs.size === 0)    next.selectedJobs   = "모집 직무를 하나 이상 선택해 주세요.";
    if (selectedFields.size === 0)  next.selectedFields = "연구 분야를 하나 이상 선택해 주세요.";
    if (!headcount)                 next.headcount      = "모집인원을 선택해 주세요.";
    if (!labInstitutionType)        next.labInstitutionType = "기관 분류를 선택해 주세요.";
    if (!labPi.trim())              next.labPi          = "PI·책임자명을 입력해 주세요.";
    if (!labAddress.trim())         next.labAddress     = "근무지를 입력해 주세요.";
    if (!summary.trim())            next.summary        = "공고 요약을 입력해 주세요.";
    if (!researchTopics.trim())     next.researchTopics = "연구 주제를 입력해 주세요.";
    if (!responsibilities.trim())   next.responsibilities = "주요 업무를 입력해 주세요.";
    if (!requirements.trim())       next.requirements   = "필수 자격요건을 입력해 주세요.";
    if (!workMode)                  next.workMode       = "근무 방식을 선택해 주세요.";
    if (!salary)                    next.salary         = "급여를 선택해 주세요.";
    if (!contractPeriod)            next.contractPeriod = "계약 기간을 선택해 주세요.";
    if (applyMethod === "url" && !applyUrl.trim())     next.applyUrl   = "채용페이지 URL을 입력해 주세요.";
    if (applyMethod === "email" && !applyEmail.trim()) next.applyEmail = "지원 이메일 주소를 입력해 주세요.";
    if (!earlyClose && !deadline)   next.deadline       = "접수 마감일을 선택해 주세요.";

    setErrors(next);
    const count = Object.keys(next).length;
    setMissingCount(count);
    if (count > 0) {
      const firstKey = Object.keys(next)[0];
      const el = fieldRefs.current[firstKey];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.querySelector<HTMLElement>("input,select,textarea,button")?.focus();
      }
    }
    return count === 0;
  }

  function toggleJob(id: string) {
    setSelectedJobs((prev) => toggleSet(prev, id));
  }
  function toggleField(id: string) {
    setSelectedFields((prev) => toggleSet(prev, id));
  }

  function toggleSameAsInstitutionAddress(checked: boolean) {
    setSameAsInstitutionAddress(checked);
    if (checked) setLabAddress(MOCK_INSTITUTION_ADDRESS);
  }

  function toggleBenefit(item: string) {
    setSelectedBenefits((prev) => toggleSet(prev, item));
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between gap-5 max-[760px]:flex-col">
        <div>
          <PageBreadcrumb
            items={[
              { label: "기업센터", href: "/business/dashboard" },
              { label: "채용관리" },
              { label: "공고 등록" },
            ]}
          />
          <h1 className="mt-5 flex flex-wrap items-center gap-3 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">
            공고 등록
            <span className="h-6 w-px bg-[#dfe5ec]" aria-hidden />
            <span className="font-medium text-[#8791a0]">연구</span>
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] font-normal text-[#68717e]">
            <span>등록 기관</span>
            <span className="font-semibold text-[#303946]">{mockLab.institution}</span>
            <span className="text-[#c0c8d2]">·</span>
            <Link href="/business/research/profile" className="inline-flex items-center gap-0.5 underline underline-offset-2 transition hover:text-[#303946]">
              기관 정보 관리
              <ArrowUpRight size={12} aria-hidden />
            </Link>
          </p>
        </div>
      </div>

      {/* Section stack — save bar is last child so position:sticky works */}
      <div className="mt-8 space-y-5">

        {/* ── §1 기본 정보 ──────────────────────────────────────────────────── */}
        <SectionCard title="기본 정보">
          {/* 공고 제목 */}
          <div className="mb-5" ref={setRef("title")}>
            <FieldLabel htmlFor="r-title" className="block mb-1.5" required>공고 제목</FieldLabel>
            <input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)}
              className={IN} placeholder="대장암 오가노이드 연구 박사후연구원 모집" aria-required="true" />
            <FieldError message={errors.title} />
          </div>

          {/* 모집 직무 — 2단계 선택기 */}
          <div className="mb-5" ref={setRef("selectedJobs")}>
            <TwoTierPicker
              label="모집 직무"
              required
              hint="1차 분류를 고르고 세부 직무를 선택하세요."
              categories={researchJobCategoryOptions}
              activeCategoryId={activeJobCategory}
              onActiveCategoryChange={setActiveJobCategory}
              selected={selectedJobs}
              onToggle={toggleJob}
              error={errors.selectedJobs}
              categoryAriaLabel="직무 대분류"
              detailAriaLabel="세부 직무"
            />
          </div>

          {/* 연구 분야 — 2단계 선택기 */}
          <div className="mb-5" ref={setRef("selectedFields")}>
            <TwoTierPicker
              label="연구 분야"
              required
              hint="분야를 선택해 주세요. 복수 선택할 수 있습니다."
              categories={researchFieldCategoryOptions}
              activeCategoryId={activeFieldCategory}
              onActiveCategoryChange={setActiveFieldCategory}
              selected={selectedFields}
              onToggle={toggleField}
              error={errors.selectedFields}
              categoryAriaLabel="연구 분야 대분류"
              detailAriaLabel="세부 분야"
            />
          </div>

          {/* 모집인원 + 고용형태 */}
          <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div ref={setRef("headcount")}>
              <FieldLabel htmlFor="r-headcount" className="block mb-1.5" required>모집인원</FieldLabel>
              <select id="r-headcount" value={headcount} onChange={(e) => setHeadcount(e.target.value)}
                className={SEL} aria-required="true">
                <option value="" disabled>채용 예정 인원을 선택해 주세요</option>
                <option>1명</option>
                <option>2명</option>
                <option>3명</option>
                <option>0명(채용 시 마감)</option>
              </select>
              <FieldError message={errors.headcount} />
            </div>
            <div>
              <FieldLabel htmlFor="r-emptype" className="block mb-1.5" required>고용형태</FieldLabel>
              <select id="r-emptype" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={SEL}>
                {employmentTypeOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 경력 + 학력 */}
          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div>
              <FieldLabel htmlFor="r-career" className="block mb-1.5" required>경력</FieldLabel>
              <select id="r-career" value={careerType} onChange={(e) => setCareerType(e.target.value)} className={SEL}>
                {experienceOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="r-edu" className="block mb-1.5">
                학력
                <span className="ml-1 text-danger" aria-hidden>*</span>
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">지원 가능한 학력 조건을 선택해 주세요.</span>
              </FieldLabel>
              <select id="r-edu" value={educationType} onChange={(e) => setEducationType(e.target.value)} className={SEL}>
                {educationOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <ToggleRow
              title="리더급 공고"
              description="연구책임자, PI, 팀장급 등 리더 포지션 채용일 때 선택해 주세요."
              checked={isLeadership}
              onChange={setIsLeadership}
              ariaLabel="리더급 공고"
            />
          </div>
        </SectionCard>

        {/* ── §2 연구실 정보 ────────────────────────────────────────────────── */}
        <SectionCard title="연구실 정보">
          <div className="mb-5" ref={setRef("labInstitutionType")}>
            <FieldLabel htmlFor="r-lab-type" className="block mb-1.5" required>기관 분류</FieldLabel>
            <select id="r-lab-type" value={labInstitutionType} onChange={(e) => setLabInstitutionType(e.target.value)}
              className={SEL} aria-required="true">
              <option value="" disabled>기관 유형을 선택해 주세요</option>
              {researchInstitutionTypeOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <FieldError message={errors.labInstitutionType} />
          </div>

          <div className="mb-5">
            <FieldLabel htmlFor="r-lab-name" className="block mb-1.5">
              소속 연구실·부서
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
            </FieldLabel>
            <p className={`${HINT} mb-2`}>실제 근무하게 될 연구실, 진료과, 센터명이 있다면 입력해 주세요.</p>
            <input id="r-lab-name" value={labName} onChange={(e) => setLabName(e.target.value)}
              placeholder="예: 대장항문외과 연구팀, 신경과학연구실, ○○연구센터" className={IN} />
          </div>

          <div className="mb-5" ref={setRef("labPi")}>
            <FieldLabel htmlFor="r-lab-pi" className="block mb-1.5" required>PI·책임자명</FieldLabel>
            <input id="r-lab-pi" value={labPi} onChange={(e) => setLabPi(e.target.value)}
              placeholder="예: 홍길동 교수" className={IN} aria-required="true" />
            <FieldError message={errors.labPi} />
          </div>

          <div className="mb-5" ref={setRef("labAddress")}>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <FieldLabel htmlFor="r-lab-address" required>근무지</FieldLabel>
              <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#4c5665]">
                <input type="checkbox" checked={sameAsInstitutionAddress}
                  onChange={(e) => toggleSameAsInstitutionAddress(e.target.checked)}
                  className="h-4 w-4 accent-[#111111]" />
                기관 주소와 동일
              </label>
            </div>
            <input id="r-lab-address" value={labAddress} onChange={(e) => setLabAddress(e.target.value)}
              readOnly={sameAsInstitutionAddress}
              placeholder="예: 서울 송파구 올림픽로43길 88, 의공학연구동"
              className={clsx(IN, sameAsInstitutionAddress && "bg-[#f5f6f8] text-[#7d8796] cursor-not-allowed")}
              aria-required="true" />
            <FieldError message={errors.labAddress} />
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div>
              <FieldLabel htmlFor="r-lab-home" className="block mb-1.5">
                홈페이지 URL
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
              </FieldLabel>
              <input id="r-lab-home" value={labHomepage} onChange={(e) => setLabHomepage(e.target.value)}
                placeholder="예: https://..." className={IN} />
            </div>
            <div>
              <FieldLabel htmlFor="r-lab-career" className="block mb-1.5">
                채용 웹페이지 URL
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
              </FieldLabel>
              <input id="r-lab-career" value={labCareerPage} onChange={(e) => setLabCareerPage(e.target.value)}
                placeholder="예: https://..." className={IN} />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="r-lab-intro" className="block mb-1.5">
              연구실 소개
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
            </FieldLabel>
            <textarea id="r-lab-intro" value={labIntro} onChange={(e) => setLabIntro(e.target.value)} rows={3}
              placeholder="연구실 연구 분야와 특징을 간단히 소개해 주세요."
              className={TA} />
          </div>
        </SectionCard>

        {/* ── §3 모집 내용 ──────────────────────────────────────────────────── */}
        <SectionCard title="모집 내용">
          <div className="mb-5" ref={setRef("summary")}>
            <FieldLabel htmlFor="r-summary" className="block mb-1.5">
              공고 요약
              <span className="ml-1 text-danger" aria-hidden>*</span>
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">공고 목록과 상세 상단에 노출되는 짧은 소개 문장입니다.</span>
            </FieldLabel>
            <input id="r-summary" value={summary} onChange={(e) => setSummary(e.target.value)}
              className={IN}
              placeholder="대장암 오가노이드와 환자유래 모델을 활용한 중개연구를 함께할 연구원을 찾습니다."
              maxLength={100}
              aria-required="true" />
            <p className="mt-2 text-right text-[12px] font-medium text-[#98a2b0]">{summary.length} / 100</p>
            <FieldError message={errors.summary} />
          </div>

          <div className="mb-5" ref={setRef("researchTopics")}>
            <FieldLabel htmlFor="r-topics" className="block mb-1.5">
              연구 주제
              <span className="ml-1 text-danger" aria-hidden>*</span>
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">이 연구실에서 수행하는 연구를 소개해 주세요.</span>
            </FieldLabel>
            <textarea id="r-topics" value={researchTopics} onChange={(e) => setResearchTopics(e.target.value)} rows={4}
              placeholder={"대장암 오가노이드 기반 약물 반응성 연구\nPDX 모델을 이용한 종양 미세환경 분석\n단일세포 전사체 기반 종양 이질성 규명"}
              className={TA} aria-required="true" />
            <FieldError message={errors.researchTopics} />
          </div>

          <div className="mb-5" ref={setRef("responsibilities")}>
            <FieldLabel htmlFor="r-duties" className="block mb-1.5">
              주요 업무
              <span className="ml-1 text-danger" aria-hidden>*</span>
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">담당 업무를 입력해 주세요.</span>
            </FieldLabel>
            <textarea id="r-duties" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={4}
              placeholder={"환자유래 오가노이드 모델 수립 및 유지\n약물 반응성 평가 및 데이터 정리\n분자생물학 실험 수행 및 결과 분석\n연구 결과 정리, 논문화 및 학회 발표 지원"}
              className={TA} aria-required="true" />
            <FieldError message={errors.responsibilities} />
          </div>

          <div className="mb-5" ref={setRef("requirements")}>
            <FieldLabel htmlFor="r-req" className="block mb-1.5">
              필수 자격요건
              <span className="ml-1 text-danger" aria-hidden>*</span>
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">지원에 필요한 필수 조건을 입력해 주세요.</span>
            </FieldLabel>
            <textarea id="r-req" value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3}
              placeholder={"약학, 생명과학, 화학, 생명공학 등 관련 전공 학사 이상\n신입 또는 관련 연구 경험 보유자"}
              className={TA} aria-required="true" />
            <FieldError message={errors.requirements} />
          </div>

          <div>
            <FieldLabel htmlFor="r-pref" className="block mb-1.5">
              우대사항
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">우대하는 경험이나 역량을 입력해 주세요.</span>
            </FieldLabel>
            <textarea id="r-pref" value={preferred} onChange={(e) => setPreferred(e.target.value)} rows={5}
              placeholder={"오가노이드, 세포배양 또는 동물실험 경험 보유자\nNGS, FACS, IHC 등 연구기술 활용 경험\n영어 논문 작성 또는 학회 발표 경험\nR, Python 등 데이터 분석 경험"}
              className={TA} />
          </div>

          <div className="mt-5">
            <FieldLabel htmlFor="r-additionalNotes" className="block mb-1.5">
              기타 참고사항
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">공고 상세에서는 &apos;추가 안내&apos; 영역에 노출됩니다.</span>
            </FieldLabel>
            <textarea id="r-additionalNotes" value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={4}
              className={TA}
              placeholder={"지원자가 알아두면 좋은 추가 안내가 있다면 입력해 주세요. 예: 입사 후 교육, 전형 일정 관련 안내 등"} />
          </div>
        </SectionCard>

        {/* ── §4 근무조건 ───────────────────────────────────────────────────── */}
        <SectionCard title="근무조건">
          <div className="mb-5" ref={setRef("workMode")}>
            <FieldLabel htmlFor="r-workmode" className="block mb-1.5" required>근무 방식</FieldLabel>
            <select id="r-workmode" value={workMode} onChange={(e) => setWorkMode(e.target.value)}
              className={SEL} aria-required="true">
              <option value="" disabled>근무 방식을 선택해 주세요</option>
              {workModeOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <FieldError message={errors.workMode} />
          </div>

          <div className="mb-5" ref={setRef("salary")}>
            <SegControl label="급여" required options={SALARY_OPTS} value={salary} onChange={setSalary} />
            <FieldError message={errors.salary} />
          </div>

          <div className="mb-5" ref={setRef("contractPeriod")}>
            <FieldLabel htmlFor="r-contract" className="block mb-1.5" required>계약 기간</FieldLabel>
            <select id="r-contract" value={contractPeriod} onChange={(e) => setContractPeriod(e.target.value)}
              className={SEL} aria-required="true">
              <option value="" disabled>계약 기간을 선택해 주세요</option>
              {contractPeriodOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <FieldError message={errors.contractPeriod} />
          </div>

          <div className="mb-5">
            <ChipGroup label="복리후생" options={WELFARE_OPTS} selected={selectedBenefits} onToggle={toggleBenefit} />
          </div>

          <div>
            <FieldLabel htmlFor="r-workcond" className="block mb-1.5">근무조건 상세</FieldLabel>
            <textarea id="r-workcond" value={workCondDetail} onChange={(e) => setWorkCondDetail(e.target.value)} rows={4}
              className={TA}
              placeholder="예: 연구 과제 일정에 따라 근무시간을 조정할 수 있으며, 학회·세미나 참석과 연구활동을 지원합니다." />
          </div>
        </SectionCard>

        {/* ── §5 검색 노출 설정 ─────────────────────────────────────────────── */}
        <SectionCard title="검색 노출 설정">
          <RecommendedKeywordPicker
            recommendedKeywords={recommendedKeywords}
            hint="연구 분야를 선택하면 관련 키워드를 추천해 드립니다."
            customPlaceholder="예: PDX, scRNA-seq, LC-MS"
            selected={selectedKeywords}
            onSelectedChange={setSelectedKeywords}
            customKeywords={customKeywords}
            onCustomKeywordsChange={setCustomKeywords}
            maxCount={MAX_KW}
          />

          {/* 대표 이미지 */}
          <div>
            <div id="r-img-lbl">
              <FieldLabel className="block mb-1.5">
                대표 이미지
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">공고 상세 상단에 표시할 이미지를 선택합니다.</span>
              </FieldLabel>
            </div>
            <div role="radiogroup" aria-labelledby="r-img-lbl" className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
              {(["default", "upload", "none"] as const).map((opt) => {
                const labels = {
                  default: "기관 기본 이미지 사용",
                  upload:  "새 이미지 업로드",
                  none:    "기본 배경 사용",
                };
                const on = imageOption === opt;
                return (
                  <button key={opt} type="button" role="radio" aria-checked={on}
                    onClick={() => setImageOption(opt)}
                    className={clsx(
                      "flex h-12 items-center justify-center border text-[13px] font-medium transition-colors",
                      on
                        ? "border-[#111111] bg-white text-[#111111] shadow-[inset_0_0_0_1px_#111111]"
                        : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
                    )}>
                    {labels[opt]}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>

        {/* ── 전형절차 및 제출서류 ──────────────────────────────────────────── */}
        <SectionCard title="전형절차 및 제출서류">
          <HiringProcessSelector
            processSteps={hiringProcess}
            onProcessChange={setHiringProcess}
            documents={requiredDocuments}
            onDocumentsChange={setRequiredDocuments}
          />
        </SectionCard>

        {/* ── §6 지원방법 및 마감일 ─────────────────────────────────────────── */}
        <SectionCard title="지원방법 및 마감일">
          <div className="mb-5">
            <div id="r-apply-method-label">
              <FieldLabel className="block mb-2" required>지원 방식</FieldLabel>
            </div>
            <div role="radiogroup" aria-labelledby="r-apply-method-label" className="inline-flex overflow-hidden border border-[#d8e0e8]">
              {(
                [
                  { value: "url" as const, label: "기관 채용페이지 지원" },
                  { value: "quick" as const, label: "더파마 간편지원", badge: "추천" },
                  { value: "email" as const, label: "이메일 지원" },
                ]
              ).map(({ value: v, label, badge }) => {
                const on = applyMethod === v;
                return (
                  <button key={v} type="button" role="radio" aria-checked={on} onClick={() => setApplyMethod(v)}
                    className={clsx(
                      "inline-flex h-11 items-center gap-1.5 border-r border-[#d8e0e8] px-5 text-[13px] font-medium last:border-r-0 transition-colors",
                      on ? "bg-[#111111] text-white" : "bg-white text-[#4f5967] hover:bg-[#f7f8fa]",
                    )}>
                    {label}
                    {badge && (
                      <span className={clsx(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                        on ? "bg-white text-[#111111]" : "bg-[#111111] text-white",
                      )}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {applyMethod === "quick" ? (
            <div className="mb-5">
              <div className="mb-4">
                <InfoNoticeBox>
                  <span className="mb-1 block font-semibold text-[#2f3845]">더파마에서 바로 지원받기</span>
                  <span className="block text-[#6b7280]">
                    별도 채용페이지나 이메일 이동 없이, 지원자가 더파마 프로필과 이력서로 바로 지원할 수 있습니다. 접수 내역은 기업 센터에서 관리됩니다.
                  </span>
                </InfoNoticeBox>
              </div>
              <div className="max-w-sm" ref={setRef("deadline")}>
                <FieldLabel htmlFor="r-deadline" className="block mb-1.5" required={!earlyClose}>
                  {earlyClose ? "마감 예정일" : "접수 마감일"}
                </FieldLabel>
                <input id="r-deadline" type="date" value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={earlyClose}
                  className={clsx(IN, earlyClose && "cursor-not-allowed opacity-45")}
                  aria-required={!earlyClose ? "true" : undefined} />
                <FieldError message={errors.deadline} />
              </div>
            </div>
          ) : (
            <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              {applyMethod === "url" ? (
                <div ref={setRef("applyUrl")}>
                  <FieldLabel htmlFor="r-apply-url" className="block mb-1.5" required>채용페이지 URL</FieldLabel>
                  <input id="r-apply-url" type="url" value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)}
                    className={IN}
                    placeholder="예: https://lab.hospital.or.kr/careers/..."
                    aria-required="true" />
                  <FieldError message={errors.applyUrl} />
                </div>
              ) : (
                <div ref={setRef("applyEmail")}>
                  <FieldLabel htmlFor="r-apply-email" className="block mb-1.5" required>지원 이메일 주소</FieldLabel>
                  <input id="r-apply-email" type="email" value={applyEmail} onChange={(e) => setApplyEmail(e.target.value)}
                    className={IN}
                    placeholder="예: recruit@lab.or.kr"
                    aria-required="true" />
                  <FieldError message={errors.applyEmail} />
                </div>
              )}

              <div ref={setRef("deadline")}>
                <FieldLabel htmlFor="r-deadline" className="block mb-1.5" required={!earlyClose}>
                  {earlyClose ? "마감 예정일" : "접수 마감일"}
                </FieldLabel>
                <input id="r-deadline" type="date" value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={earlyClose}
                  className={clsx(IN, earlyClose && "cursor-not-allowed opacity-45")}
                  aria-required={!earlyClose ? "true" : undefined} />
                <FieldError message={errors.deadline} />
              </div>
            </div>
          )}

          <ToggleRow
            title="조기 마감 가능"
            description="채용이 완료되면 마감일 전에도 공고를 마감할 수 있습니다."
            checked={earlyClose}
            onChange={setEarlyClose}
            ariaLabel="채용 시 마감"
          />
        </SectionCard>

        {/* ── §7 상세 이미지 및 첨부 자료 ───────────────────────────────────── */}
        <SectionCard title="상세 이미지 및 첨부 자료">
          <div className="grid grid-cols-2 gap-6 max-[640px]:grid-cols-1">
            <AttachmentUploader
              label="이미지"
              description="공고 상세 본문에 표시됩니다."
              accept="image/*"
              buttonLabel="이미지 추가"
              emptyText="첨부된 이미지가 없습니다."
              value={imageAttachments}
              onChange={setImageAttachments}
            />
            <AttachmentUploader
              label="첨부 파일"
              description="공고 상세에서 다운로드 링크로 제공됩니다."
              accept=".pdf,.hwp,.docx"
              buttonLabel="파일 추가"
              emptyText="첨부된 파일이 없습니다."
              value={fileAttachments}
              onChange={setFileAttachments}
            />
          </div>

          <div className="mt-4">
            <InfoNoticeBox>
              검색과 추천 품질을 위해 주요 업무 · 자격요건 · 근무조건은 텍스트로 입력해 주세요.
            </InfoNoticeBox>
          </div>
        </SectionCard>

        {/* ── 하단 저장바 — space-y-5 스택의 마지막 자식 ── */}
        <div className="sticky bottom-0 z-30 min-h-[64px] border-t border-border bg-white/95 px-6 py-4 shadow-[0_-4px_16px_rgba(20,32,46,0.08)] backdrop-blur max-[760px]:px-4">
          <div className="flex items-center justify-between gap-4 max-[640px]:flex-col">
            <p className="text-[12px] font-normal text-[#7b8491]">
              저장되지 않은 변경사항이 있습니다
              {missingCount > 0 && (
                <> · 게시 전 <strong className="text-danger">필수 항목 {missingCount}개</strong>를 확인하세요</>
              )}
            </p>
            <div className="flex gap-2 max-[640px]:w-full">
              <button type="button"
                className="inline-flex h-11 items-center justify-center border border-[#cfd8e3] bg-white px-7 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] max-[640px]:flex-1">
                미리보기
              </button>
              <button type="button"
                className="inline-flex h-11 items-center justify-center border border-[#111111] bg-white px-7 text-[13px] font-medium text-[#111111] hover:bg-[#f7f8fa] max-[640px]:flex-1">
                임시 저장
              </button>
              <button type="button" onClick={() => validate()}
                className="inline-flex h-11 items-center justify-center px-9 text-[13px] font-bold text-white transition max-[640px]:flex-1"
                style={{ backgroundImage: "var(--gradient-cta)", textShadow: "0 1px 3px rgba(5,60,55,0.28)" }}>
                공고 게시하기
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
