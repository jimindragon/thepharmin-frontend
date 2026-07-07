"use client";

import clsx from "clsx";
import { AlertCircle, ArrowUpRight, Info, X } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { AttachmentUploader, type AttachmentItem } from "@/components/business/AttachmentUploader";
import { SectionCard } from "@/components/business/BusinessFormControls";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { educationOptions, employmentTypeOptions, experienceOptions } from "@/config/jobFilters/index";
import { hospitalJobCategoryOptions, shiftTypeOptions } from "@/config/jobFilters/hospitalFilters";
import { initialHospitalOrgProfile } from "@/data/businessOrgProfile";
import type { JobCategoryOption } from "@/types/jobs";

// ── Static data ────────────────────────────────────────────────────────────────

const WEEKDAY_OPTS = ["월", "화", "수", "목", "금", "토", "일"];
const SALARY_OPTS = ["기관 내규", "3,000만↑", "5,000만↑", "7,000만↑", "9,000만↑"];
const WELFARE_OPTS = [
  "퇴직연금", "연차·휴가", "의료비 지원", "식대 지원", "구내식당", "당직·휴일수당",
  "교육 지원", "학회·연수 지원", "전문약사 교육 지원", "경조사 지원", "직원 주차", "기숙사·사택",
];
// 병원은 직무별 분기 없이 항상 동일한 단일 키워드 목록을 쓴다(산업의 KW_BY_CAT 같은 분기 로직 없음)
const HOSPITAL_KEYWORDS = [
  "조제", "투약", "처방검토", "복약상담", "병동약료", "임상약료", "무균조제", "항암조제",
  "TPN", "NST", "ASP", "감염약료", "종양약료", "DI", "마약류 관리", "의약품 관리", "임상시험약 관리",
];
const MAX_KW = 8;

// ── Helpers ────────────────────────────────────────────────────────────────────

function toggleSet<T>(s: Set<T>, item: T): Set<T> {
  const n = new Set(s);
  if (n.has(item)) n.delete(item);
  else n.add(item);
  return n;
}

// ── Sub-components (로컬 정의 — 산업/연구 폼과 동일, 공유 모듈 아님) ───────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1 text-[12px] text-danger">
      <AlertCircle size={12} aria-hidden />
      {message}
    </p>
  );
}

function InlineNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 border border-[#dfe4ea] bg-[#f7f8fa] px-3.5 py-2.5 text-[12px] text-[#6b7280]">
      <Info size={13} className="mt-0.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

type ChipOption = string | { id: string; label: string };
function chipOptionId(opt: ChipOption): string { return typeof opt === "string" ? opt : opt.id; }
function chipOptionLabel(opt: ChipOption): string { return typeof opt === "string" ? opt : opt.label; }

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
  options: ChipOption[];
  selected: Set<string>;
  onToggle: (v: string) => void;
  hint?: string;
}) {
  const internalId = useId();
  const id = labelId ?? internalId;
  return (
    <div>
      <p id={id} className="mb-2 text-[14px] font-medium text-[#2f3845]">
        {label}
        {required && <span className="ml-1 text-danger" aria-hidden>*</span>}
        {max != null && <span className="ml-2 text-[12px] font-normal text-[#7b8491]">최대 {max}개</span>}
      </p>
      <div role="group" aria-labelledby={id} className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const optId = chipOptionId(opt);
          const optLabel = chipOptionLabel(opt);
          const on = selected.has(optId);
          const blocked = max != null && selected.size >= max && !on;
          return (
            <button key={optId} type="button" role="checkbox" aria-checked={on} aria-disabled={blocked}
              onClick={() => !blocked && onToggle(optId)}
              className={clsx(
                "inline-flex h-9 items-center gap-1.5 border px-3.5 text-[12px] font-medium transition-colors",
                on ? "border-[#111111] bg-[#111111] text-white"
                  : blocked ? "cursor-not-allowed border-[#dfe4ea] bg-[#f5f6f7] text-[#aeb6c0]"
                    : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
              )}>
              {on && <span className="text-[10px]" aria-hidden>✓</span>}
              {optLabel}
            </button>
          );
        })}
      </div>
      {hint && <p className="mt-2 text-[11.5px] text-[#a0a9b7]">{hint}</p>}
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
      <p id={id} className="mb-2 text-[13px] font-medium text-[#2f3845]">
        {label}
        {required && <span className="ml-1 text-danger" aria-hidden>*</span>}
      </p>
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
    <div className="flex items-start justify-between gap-4 border border-[#dfe4ea] bg-white px-4 py-3">
      <div>
        <p className="text-[13px] font-medium text-[#303946]">{title}</p>
        {description && <p className="mt-1 text-[11.5px] text-[#7b8491]">{description}</p>}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={ariaLabel} />
    </div>
  );
}

/** 2단(대분류 → 세부 항목) 선택기 — 모집 직무 등에 공용 (연구 폼의 TwoTierPicker와 동일) */
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
      <p className="mb-2 text-[14px] font-medium text-[#2f3845]">
        {label}
        {required && <span className="ml-1 text-danger" aria-hidden>*</span>}
        {hint && <span className="ml-2 text-[12px] font-normal text-[#7b8491]">{hint}</span>}
      </p>
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
          <p className="mb-3 text-[12.5px] font-semibold text-[#4f5967]">
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
        <p className="mt-2 text-[11.5px] text-[#7b8491]">
          선택됨: {Array.from(selected).map((id) => labelById.get(id) ?? id).join(", ")}
        </p>
      )}
      <FieldError message={error} />
    </div>
  );
}

// ── Style constants ────────────────────────────────────────────────────────────

const IN = "h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8";
const SEL = `${IN} appearance-none pr-8`;
const LBL = "block mb-1.5 text-[14px] font-medium text-[#2f3845]";
const HINT = "mt-1 text-[11.5px] text-[#a0a9b7]";
const REQ = <span className="ml-1 text-danger" aria-hidden>*</span>;

// ── Main component ─────────────────────────────────────────────────────────────

export function HospitalJobPostingForm() {
  // §1 기본 정보
  const [title, setTitle] = useState("");
  const [activeJobCategory, setActiveJobCategory] = useState(hospitalJobCategoryOptions[0].id);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [employmentType, setEmploymentType] = useState("permanent");
  const [careerType, setCareerType] = useState("any");
  const [educationType, setEducationType] = useState("any");
  const [isLeadership, setIsLeadership] = useState(false);

  // §2 모집 내용
  const [summary, setSummary] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [preferred, setPreferred] = useState("");

  // §3 근무조건
  const [shiftTypeIds, setShiftTypeIds] = useState<Set<string>>(new Set());
  const [workDays, setWorkDays] = useState<Set<string>>(new Set());
  const [address, setAddress] = useState("");
  const [sameAsInstitutionAddress, setSameAsInstitutionAddress] = useState(false);
  const [salary, setSalary] = useState("");
  const [selectedBenefits, setSelectedBenefits] = useState<Set<string>>(new Set());
  const [workCondDetail, setWorkCondDetail] = useState("");

  // §4 검색 노출 설정
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [customKwInput, setCustomKwInput] = useState("");
  const [imageOption, setImageOption] = useState<"default" | "upload" | "none">("default");

  // §5 지원방법 및 마감일
  const [applyMethod, setApplyMethod] = useState<"url" | "quick" | "email">("url");
  const [applyUrl, setApplyUrl] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [deadline, setDeadline] = useState("");
  const [rollingToggle, setRollingToggle] = useState(false);

  // §6 상세 이미지 및 첨부 자료
  const [imageAttachments, setImageAttachments] = useState<AttachmentItem[]>([]);
  const [fileAttachments, setFileAttachments] = useState<AttachmentItem[]>([]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [missingCount, setMissingCount] = useState(0);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const setRef = (key: string) => (el: HTMLElement | null) => { fieldRefs.current[key] = el; };

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "공고 제목을 입력해 주세요.";
    if (selectedJobs.size === 0) next.selectedJobs = "모집 직무를 하나 이상 선택해 주세요.";
    if (!summary.trim()) next.summary = "공고 요약을 입력해 주세요.";
    if (!responsibilities.trim()) next.responsibilities = "주요 업무를 입력해 주세요.";
    if (!requirements.trim()) next.requirements = "필수 자격요건을 입력해 주세요.";
    if (shiftTypeIds.size === 0) next.shiftTypeIds = "근무 형태를 하나 이상 선택해 주세요.";
    if (!address.trim()) next.address = "근무지를 입력해 주세요.";
    if (!salary) next.salary = "급여를 선택해 주세요.";
    if (applyMethod === "url" && !applyUrl.trim()) next.applyUrl = "채용페이지 URL을 입력해 주세요.";
    if (applyMethod === "email" && !applyEmail.trim()) next.applyEmail = "지원 이메일 주소를 입력해 주세요.";
    if (!rollingToggle && !deadline) next.deadline = "접수 마감일을 입력해 주세요.";

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

  function toggleShiftType(id: string) {
    setShiftTypeIds((prev) => toggleSet(prev, id));
  }

  function toggleWorkDay(day: string) {
    setWorkDays((prev) => toggleSet(prev, day));
  }

  function toggleBenefit(item: string) {
    setSelectedBenefits((prev) => toggleSet(prev, item));
  }

  function toggleSameAsInstitutionAddress(checked: boolean) {
    setSameAsInstitutionAddress(checked);
    if (checked) setAddress(initialHospitalOrgProfile.address);
  }

  function toggleKeyword(kw: string) {
    setSelectedKeywords((prev) => {
      const n = new Set(prev);
      if (n.has(kw)) n.delete(kw);
      else if (n.size < MAX_KW) n.add(kw);
      return n;
    });
  }

  function addCustomKeyword() {
    const v = customKwInput.trim();
    if (!v || v.length > 10 || selectedKeywords.has(v) || selectedKeywords.size >= MAX_KW) return;
    setSelectedKeywords((prev) => { const n = new Set(prev); n.add(v); return n; });
    setCustomKeywords((prev) => [...prev, v]);
    setCustomKwInput("");
  }

  function removeCustomKeyword(kw: string) {
    setSelectedKeywords((prev) => { const n = new Set(prev); n.delete(kw); return n; });
    setCustomKeywords((prev) => prev.filter((k) => k !== kw));
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
            <span className="font-medium text-[#8791a0]">병원 약사</span>
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] font-normal text-[#68717e]">
            <span>등록 기관</span>
            <span className="font-semibold text-[#303946]">분당서울대학교병원</span>
            <span className="text-[#c0c8d2]">·</span>
            <Link href="/business/hospital/profile" className="inline-flex items-center gap-0.5 underline underline-offset-2 transition hover:text-[#303946]">
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
            <label htmlFor="h-title" className={LBL}>공고 제목{REQ}</label>
            <input id="h-title" value={title} onChange={(e) => setTitle(e.target.value)}
              className={IN} placeholder="약제부 병원약사 채용" aria-required="true" />
            <FieldError message={errors.title} />
          </div>

          {/* 모집 직무 — 2단계 선택기 */}
          <div className="mb-5" ref={setRef("selectedJobs")}>
            <TwoTierPicker
              label="모집 직무"
              required
              hint="1차 분류를 고르고 세부 직무를 선택하세요."
              categories={hospitalJobCategoryOptions}
              activeCategoryId={activeJobCategory}
              onActiveCategoryChange={setActiveJobCategory}
              selected={selectedJobs}
              onToggle={toggleJob}
              error={errors.selectedJobs}
              categoryAriaLabel="직무 대분류"
              detailAriaLabel="세부 직무"
            />
          </div>

          {/* 고용형태 + 경력 + 학력 */}
          <div className="grid grid-cols-3 gap-4 max-[640px]:grid-cols-1">
            <div>
              <label htmlFor="h-emptype" className={LBL}>고용형태{REQ}</label>
              <select id="h-emptype" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={SEL}>
                {employmentTypeOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="h-career" className={LBL}>경력{REQ}</label>
              <select id="h-career" value={careerType} onChange={(e) => setCareerType(e.target.value)} className={SEL}>
                {experienceOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="h-edu" className={LBL}>
                학력{REQ}
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">지원 가능한 학력 조건을 선택해 주세요.</span>
              </label>
              <select id="h-edu" value={educationType} onChange={(e) => setEducationType(e.target.value)} className={SEL}>
                {educationOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <ToggleRow
              title="리더급 공고"
              description="약제부 관리자, 파트장급 등 리더 포지션 채용일 때 선택해 주세요."
              checked={isLeadership}
              onChange={setIsLeadership}
              ariaLabel="리더급 공고"
            />
          </div>
        </SectionCard>

        {/* ── §2 모집 내용 ──────────────────────────────────────────────────── */}
        <SectionCard title="모집 내용">
          <div className="mb-5" ref={setRef("summary")}>
            <label htmlFor="h-summary" className={LBL}>
              공고 요약{REQ}
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">공고 목록과 상세 상단에 노출되는 짧은 소개 문장입니다.</span>
            </label>
            <input id="h-summary" value={summary} onChange={(e) => setSummary(e.target.value)}
              className={IN}
              placeholder="조제 및 의약품 관리를 담당해주실 약사님을 모집합니다."
              maxLength={100}
              aria-required="true" />
            <p className="mt-2 text-right text-[12px] font-medium text-[#98a2b0]">{summary.length} / 100</p>
            <FieldError message={errors.summary} />
          </div>

          <div className="mb-5" ref={setRef("responsibilities")}>
            <label htmlFor="h-duties" className={LBL}>
              주요 업무{REQ}
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">담당 업무를 입력해 주세요.</span>
            </label>
            <textarea id="h-duties" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"입원·외래 처방 검토 및 조제\n복약상담 및 투약 설명\n의약품 재고·마약류 관리"}
              aria-required="true" />
            <FieldError message={errors.responsibilities} />
          </div>

          <div className="mb-5" ref={setRef("requirements")}>
            <label htmlFor="h-reqQual" className={LBL}>
              필수 자격요건{REQ}
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">지원에 필요한 필수 조건을 입력해 주세요.</span>
            </label>
            <textarea id="h-reqQual" value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder="약사 면허 소지자" aria-required="true" />
            <FieldError message={errors.requirements} />
          </div>

          <div>
            <label htmlFor="h-preferred" className={LBL}>
              우대사항
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">우대하는 경험이나 역량을 입력해 주세요.</span>
            </label>
            <textarea id="h-preferred" value={preferred} onChange={(e) => setPreferred(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"병원 약제부 근무 경험 보유자\n전문약사 자격 또는 관련 교육 이수자"} />
          </div>
        </SectionCard>

        {/* ── §3 근무조건 ───────────────────────────────────────────────────── */}
        <SectionCard title="근무조건">
          <div className="mb-5" ref={setRef("shiftTypeIds")}>
            <ChipGroup label="근무 형태" required options={shiftTypeOptions} selected={shiftTypeIds}
              onToggle={toggleShiftType} hint="해당하는 근무 형태를 모두 선택해 주세요." />
            <FieldError message={errors.shiftTypeIds} />
          </div>

          <div className="mb-5">
            <ChipGroup label="근무 요일" options={WEEKDAY_OPTS} selected={workDays} onToggle={toggleWorkDay} />
          </div>

          <div className="mb-5" ref={setRef("address")}>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="h-address" className="text-[14px] font-medium text-[#2f3845]">근무지{REQ}</label>
              <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#4c5665]">
                <input type="checkbox" checked={sameAsInstitutionAddress}
                  onChange={(e) => toggleSameAsInstitutionAddress(e.target.checked)}
                  className="h-4 w-4 accent-[#111111]" />
                기관 주소와 동일
              </label>
            </div>
            <input id="h-address" value={address} onChange={(e) => setAddress(e.target.value)}
              readOnly={sameAsInstitutionAddress}
              placeholder="예: 서울 강남구 테헤란로 123, 8층"
              className={clsx(IN, sameAsInstitutionAddress && "bg-[#f5f6f8] text-[#7d8796] cursor-not-allowed")}
              aria-required="true" />
            <FieldError message={errors.address} />
          </div>

          <div className="my-5 border-t border-[#f0f2f5]" />

          <div className="mb-5" ref={setRef("salary")}>
            <SegControl label="급여" required options={SALARY_OPTS} value={salary} onChange={setSalary} />
            <FieldError message={errors.salary} />
          </div>

          <div className="mb-5">
            <ChipGroup label="복리후생" options={WELFARE_OPTS} selected={selectedBenefits} onToggle={toggleBenefit} />
          </div>

          <div>
            <label htmlFor="h-workcond" className={LBL}>근무조건 상세</label>
            <textarea id="h-workcond" value={workCondDetail} onChange={(e) => setWorkCondDetail(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder="당직 여부, 휴일 수당 등 구체적인 근무 조건을 적어주세요." />
          </div>
        </SectionCard>

        {/* ── §4 검색 노출 설정 ─────────────────────────────────────────────── */}
        <SectionCard title="검색 노출 설정">
          <div className="mb-6">
            <p className={LBL}>
              검색 키워드
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">{selectedKeywords.size} / {MAX_KW}개 선택</span>
            </p>
            <p className={`${HINT} mb-3`}>
              병원 약사 직무에 자주 쓰이는 키워드를 추천합니다.
            </p>

            <div role="group" aria-label="추천 키워드" className="flex flex-wrap gap-2">
              {HOSPITAL_KEYWORDS.map((kw) => {
                const on = selectedKeywords.has(kw);
                const blocked = selectedKeywords.size >= MAX_KW && !on;
                return (
                  <button key={kw} type="button" role="checkbox" aria-checked={on} aria-disabled={blocked}
                    onClick={() => !blocked && toggleKeyword(kw)}
                    className={clsx(
                      "inline-flex h-9 items-center gap-1.5 border px-3.5 text-[12px] font-medium transition-colors",
                      on ? "border-[#111111] bg-[#111111] text-white"
                        : blocked ? "cursor-not-allowed border-[#dfe4ea] bg-[#f5f6f7] text-[#aeb6c0]"
                          : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
                    )}>
                    {on && <span className="text-[10px]" aria-hidden>✓</span>}
                    {kw}
                  </button>
                );
              })}
            </div>

            <div className="my-4 border-t border-[#f0f2f5]" />

            <p className={LBL}>기타 키워드 직접 추가</p>
            <p className={`${HINT} mb-2`}>추천 목록에 없는 키워드는 직접 입력하세요.</p>
            <div className="flex gap-2">
              <input
                value={customKwInput}
                onChange={(e) => setCustomKwInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomKeyword(); } }}
                maxLength={10}
                placeholder="예: DUR, 조제실 관리, 약물상담"
                className={`${IN} flex-1`}
                aria-label="키워드 직접 입력"
              />
              <button type="button" onClick={addCustomKeyword}
                disabled={selectedKeywords.size >= MAX_KW}
                className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:border-[#dfe4ea] disabled:text-[#aeb6c0]">
                ＋ 직접 추가
              </button>
            </div>
            <p className={HINT}>(10자 이내)</p>

            {customKeywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customKeywords.map((kw) => (
                  <button key={kw} type="button" onClick={() => removeCustomKeyword(kw)}
                    aria-label={`${kw} 키워드 삭제`}
                    className="inline-flex h-9 items-center gap-1.5 border border-[#111111] bg-[#111111] px-3.5 text-[12px] font-medium text-white">
                    <span className="text-[10px]" aria-hidden>✓</span>
                    {kw}
                    <X size={11} className="ml-0.5 opacity-70" aria-hidden />
                  </button>
                ))}
              </div>
            )}

            <p className="mt-2.5 text-[11.5px] text-[#a0a9b7]">
              선택한 키워드는 공고 목록과 추천 매칭에 활용되며, 목록에는 최대 5개까지 표시됩니다.
            </p>
          </div>

          <div>
            <p className={LBL} id="h-img-lbl">대표 이미지</p>
            <p className={`${HINT} mb-3`}>공고 상세 상단에 표시할 이미지를 선택합니다.</p>
            <div role="radiogroup" aria-labelledby="h-img-lbl" className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
              {(["default", "upload", "none"] as const).map((opt) => {
                const labels = {
                  default: "기관 기본 이미지 사용",
                  upload: "새 이미지 업로드",
                  none: "기본 배경 사용",
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

        {/* ── §5 지원방법 및 마감일 ─────────────────────────────────────────── */}
        <SectionCard title="지원방법 및 마감일">
          <div className="mb-5">
            <p id="h-apply-method-label" className="mb-2 text-[13px] font-medium text-[#2f3845]">
              지원 방식{REQ}
            </p>
            <div role="radiogroup" aria-labelledby="h-apply-method-label" className="inline-flex overflow-hidden border border-[#d8e0e8]">
              {(
                [
                  { value: "url" as const, label: "채용페이지 지원" },
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
                <InlineNote>
                  <span className="mb-1 block font-semibold text-[#2f3845]">더파마에서 바로 지원받기</span>
                  <span className="block text-[#6b7280]">
                    별도 채용페이지나 이메일 이동 없이, 지원자가 더파마 프로필과 이력서로 바로 지원할 수 있습니다. 접수 내역은 기관 센터에서 관리됩니다.
                  </span>
                </InlineNote>
              </div>
              <div className="max-w-sm" ref={setRef("deadline")}>
                <label htmlFor="h-deadline" className={LBL}>
                  {rollingToggle ? "마감 예정일" : <>접수 마감일{REQ}</>}
                </label>
                <input id="h-deadline" type="date" value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={rollingToggle}
                  className={clsx(IN, rollingToggle && "cursor-not-allowed opacity-45")}
                  aria-required={!rollingToggle ? "true" : undefined} />
                <FieldError message={errors.deadline} />
              </div>
            </div>
          ) : applyMethod === "url" ? (
            <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div ref={setRef("applyUrl")}>
                <label htmlFor="h-apply-url" className={LBL}>채용페이지 URL{REQ}</label>
                <input id="h-apply-url" type="url"
                  value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)}
                  className={IN}
                  placeholder="예: https://hospital.or.kr/careers/..."
                  aria-required="true" />
                <FieldError message={errors.applyUrl} />
              </div>
              <div ref={setRef("deadline")}>
                <label htmlFor="h-deadline" className={LBL}>
                  {rollingToggle ? "마감 예정일" : <>접수 마감일{REQ}</>}
                </label>
                <input id="h-deadline" type="date" value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={rollingToggle}
                  className={clsx(IN, rollingToggle && "cursor-not-allowed opacity-45")}
                  aria-required={!rollingToggle ? "true" : undefined} />
                <FieldError message={errors.deadline} />
              </div>
            </div>
          ) : (
            <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div ref={setRef("applyEmail")}>
                <label htmlFor="h-apply-email" className={LBL}>지원 이메일 주소{REQ}</label>
                <input id="h-apply-email" type="email"
                  value={applyEmail} onChange={(e) => setApplyEmail(e.target.value)}
                  className={IN}
                  placeholder="예: recruit@hospital.or.kr"
                  aria-required="true" />
                <FieldError message={errors.applyEmail} />
              </div>
              <div ref={setRef("deadline")}>
                <label htmlFor="h-deadline" className={LBL}>
                  {rollingToggle ? "마감 예정일" : <>접수 마감일{REQ}</>}
                </label>
                <input id="h-deadline" type="date" value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={rollingToggle}
                  className={clsx(IN, rollingToggle && "cursor-not-allowed opacity-45")}
                  aria-required={!rollingToggle ? "true" : undefined} />
                <FieldError message={errors.deadline} />
              </div>
            </div>
          )}

          <ToggleRow
            title="조기 마감 가능"
            description="채용이 완료되면 마감일 전에도 공고를 마감할 수 있습니다."
            checked={rollingToggle}
            onChange={setRollingToggle}
            ariaLabel="채용 시 마감"
          />
        </SectionCard>

        {/* ── §6 상세 이미지 및 첨부 자료 ───────────────────────────────────── */}
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
            <InlineNote>
              검색과 추천 품질을 위해 주요 업무 · 자격요건 · 근무조건은 텍스트로 입력해 주세요.
            </InlineNote>
          </div>
        </SectionCard>

        {/* ── 하단 저장바 — space-y-5 스택의 마지막 자식 ── */}
        <div className="sticky bottom-0 z-30 min-h-[64px] border-t border-[#dfe4ea] bg-white/95 px-6 py-4 shadow-[0_-4px_16px_rgba(20,32,46,0.08)] backdrop-blur max-[760px]:px-4">
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
