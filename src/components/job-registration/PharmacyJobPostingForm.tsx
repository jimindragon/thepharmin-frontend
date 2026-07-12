"use client";

import clsx from "clsx";
import { AlertCircle, ArrowUpRight, Info, X } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { AttachmentUploader, type AttachmentItem } from "@/components/business/AttachmentUploader";
import { SectionCard } from "@/components/business/BusinessFormControls";
import { HiringProcessSelector } from "@/components/job-registration/HiringProcessSelector";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { educationOptions, employmentTypeOptions, experienceOptions } from "@/config/jobFilters/index";
import { pharmacyJobCategoryOptions, pharmacyWorkTypeOptions } from "@/config/jobFilters/pharmacyFilters";
import { initialPharmacyOrgProfile } from "@/data/businessOrgProfile";
import type { JobCategoryOption } from "@/types/jobs";
import { formatWon } from "@/utils/salary";

// ── Static data ────────────────────────────────────────────────────────────────

const WEEKDAY_OPTS = ["월", "화", "수", "목", "금", "토", "일"];
// 근무 시간대 블록: 같은 시간에 근무하는 요일을 묶음 (pharmacyJobDetails.ts의 WorkScheduleBlock과 동형)
interface WorkScheduleBlock {
  days: string[];
  time: string;
}
type SalaryKind = "시급" | "일급" | "월급" | "연봉" | "면접 후 결정";
const SALARY_KIND_OPTS: SalaryKind[] = ["시급", "일급", "월급", "연봉", "면접 후 결정"];
const WELFARE_OPTS = [
  "4대보험", "퇴직금", "연차·휴가", "식대 지원", "교통비 지원", "주차 지원",
  "숙소 지원", "명절 상여", "경조사 지원", "인센티브", "교육 지원",
];
// 약국은 직무별 분기 없이 항상 동일한 단일 키워드 목록을 쓴다
const PHARMACY_KEYWORDS = [
  "처방조제", "복약지도", "처방검토", "OTC 상담", "매약 상담",
  "건기식 상담", "자동조제기", "산제포장",
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
        {hint && <span className="ml-2 text-[12px] font-normal text-[#7b8491]">{hint}</span>}
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

export function PharmacyJobPostingForm() {
  // §1 기본 정보
  const [title, setTitle] = useState("");
  const [activeJobCategory, setActiveJobCategory] = useState(pharmacyJobCategoryOptions[0].id);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [pharmacyWorkTypeIds, setPharmacyWorkTypeIds] = useState<Set<string>>(new Set());
  const [employmentType, setEmploymentType] = useState("permanent");
  const [careerType, setCareerType] = useState("any");
  const [educationType, setEducationType] = useState("any");
  const [headcount, setHeadcount] = useState("");

  // §2 모집 내용
  const [summary, setSummary] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [preferred, setPreferred] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // §3 근무조건
  const [workSchedule, setWorkSchedule] = useState<WorkScheduleBlock[]>([
    { days: [], time: "" },
  ]);
  const [address, setAddress] = useState("");
  const [sameAsInstitutionAddress, setSameAsInstitutionAddress] = useState(false);
  const [salaryKind, setSalaryKind] = useState<SalaryKind>("시급");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryHours, setSalaryHours] = useState("");
  const [salaryNote, setSalaryNote] = useState("");
  const [selectedBenefits, setSelectedBenefits] = useState<Set<string>>(new Set());
  const [staffPharmacistCount, setStaffPharmacistCount] = useState("");
  const [staffSupportCount, setStaffSupportCount] = useState("");
  const [mainPrescribingHospital, setMainPrescribingHospital] = useState("");
  const [workCondDetail, setWorkCondDetail] = useState("");

  // §4 검색 노출 설정
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [customKwInput, setCustomKwInput] = useState("");
  const [imageOption, setImageOption] = useState<"default" | "upload" | "none">("default");

  // 전형절차 및 제출서류 (선택 입력)
  const [hiringProcess, setHiringProcess] = useState<string[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);

  // §5 지원방법 및 마감일
  const [applyMethod, setApplyMethod] = useState<"quick" | "phone" | "email">("quick");
  const [applyPhone, setApplyPhone] = useState("");
  const [applyManagerName, setApplyManagerName] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [contactNote, setContactNote] = useState("");
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
    if (selectedJobs.size === 0) next.selectedJobs = "모집 직군을 하나 이상 선택해 주세요.";
    if (pharmacyWorkTypeIds.size === 0) next.pharmacyWorkTypeIds = "근무 형태를 하나 이상 선택해 주세요.";
    if (!headcount.trim()) next.headcount = "모집인원을 입력해 주세요.";
    if (!summary.trim()) next.summary = "공고 요약을 입력해 주세요.";
    if (!responsibilities.trim()) next.responsibilities = "주요 업무를 입력해 주세요.";
    if (!requirements.trim()) next.requirements = "필수 자격요건을 입력해 주세요.";
    if (!workSchedule.some((b) => b.days.length > 0 && b.time.trim())) next.workSchedule = "근무 요일과 시간을 하나 이상 입력해 주세요.";
    if (!address.trim()) next.address = "근무지를 입력해 주세요.";
    if (salaryKind !== "면접 후 결정" && !salaryAmount.trim()) next.salaryAmount = "급여를 입력해 주세요.";
    if (!workCondDetail.trim()) next.workCondDetail = "근무조건 상세를 입력해 주세요.";
    if (applyMethod === "phone" && !applyPhone.trim()) next.applyPhone = "지원 연락처를 입력해 주세요.";
    if (applyMethod === "email" && !applyEmail.trim()) next.applyEmail = "지원 이메일을 입력해 주세요.";
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

  function toggleWorkType(id: string) {
    setPharmacyWorkTypeIds((prev) => toggleSet(prev, id));
  }

  function toggleScheduleDay(blockIndex: number, day: string) {
    setWorkSchedule((prev) => prev.map((b, i) => {
      if (i !== blockIndex) return b;
      const days = b.days.includes(day) ? b.days.filter((d) => d !== day) : [...b.days, day];
      return { ...b, days };
    }));
  }

  function setScheduleTime(blockIndex: number, time: string) {
    setWorkSchedule((prev) => prev.map((b, i) => (i === blockIndex ? { ...b, time } : b)));
  }

  function addScheduleBlock() {
    setWorkSchedule((prev) => [...prev, { days: [], time: "" }]);
  }

  function removeScheduleBlock(blockIndex: number) {
    setWorkSchedule((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== blockIndex)));
  }

  function toggleBenefit(item: string) {
    setSelectedBenefits((prev) => toggleSet(prev, item));
  }

  function toggleSameAsInstitutionAddress(checked: boolean) {
    setSameAsInstitutionAddress(checked);
    if (checked) setAddress(initialPharmacyOrgProfile.address);
  }

  // 확정 급여 1건 기준 시급 환산 — legacy convertToHourly(범위형)를 단일값으로 단순화한 로컬 계산
  function estimateHourly(): number | null {
    const amount = parseInt(salaryAmount.replace(/,/g, ""), 10);
    if (!salaryAmount.trim() || isNaN(amount)) return null;
    const won = salaryKind === "월급" || salaryKind === "연봉" ? amount * 10000 : amount;
    if (salaryKind === "시급") return won;
    const hours = parseInt(salaryHours, 10);
    if (!salaryHours.trim() || isNaN(hours) || hours <= 0) return null;
    if (salaryKind === "일급") return Math.round(won / hours);
    if (salaryKind === "월급") return Math.round(won / (hours * 4.345));
    if (salaryKind === "연봉") return Math.round(won / (hours * 52));
    return null;
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
            <span className="font-medium text-[#8791a0]">약국 약사</span>
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] font-normal text-[#68717e]">
            <span>등록 기관</span>
            <span className="font-semibold text-[#303946]">더파마약국</span>
            <span className="text-[#c0c8d2]">·</span>
            <Link href="/business/pharmacy/profile" className="inline-flex items-center gap-0.5 underline underline-offset-2 transition hover:text-[#303946]">
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
            <label htmlFor="p-title" className={LBL}>공고 제목{REQ}</label>
            <input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)}
              className={IN} placeholder="문전약국 풀타임 약사 모집" aria-required="true" />
            <FieldError message={errors.title} />
          </div>

          {/* 모집 직군 — 2단계 선택기 */}
          <div className="mb-5" ref={setRef("selectedJobs")}>
            <TwoTierPicker
              label="모집 직군"
              required
              hint="1차 분류를 고르고 세부 직군을 선택하세요."
              categories={pharmacyJobCategoryOptions}
              activeCategoryId={activeJobCategory}
              onActiveCategoryChange={setActiveJobCategory}
              selected={selectedJobs}
              onToggle={toggleJob}
              error={errors.selectedJobs}
              categoryAriaLabel="직군 대분류"
              detailAriaLabel="세부 직군"
            />
          </div>

          {/* 근무 형태 */}
          <div className="mb-5" ref={setRef("pharmacyWorkTypeIds")}>
            <ChipGroup label="근무 형태" required options={pharmacyWorkTypeOptions} selected={pharmacyWorkTypeIds}
              onToggle={toggleWorkType} hint="해당하는 근무 형태를 모두 선택해 주세요." />
            <FieldError message={errors.pharmacyWorkTypeIds} />
          </div>

          {/* 고용형태 + 모집인원 */}
          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div>
              <label htmlFor="p-emptype" className={LBL}>고용형태{REQ}</label>
              <select id="p-emptype" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={SEL}>
                {employmentTypeOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            <div ref={setRef("headcount")}>
              <label htmlFor="p-headcount" className={LBL}>모집인원{REQ}</label>
              <input id="p-headcount" value={headcount} onChange={(e) => setHeadcount(e.target.value)}
                className={IN} placeholder="예: 1명" aria-required="true" />
              <FieldError message={errors.headcount} />
            </div>
          </div>

          {/* 경력 + 학력 */}
          <div className="mt-4 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div>
              <label htmlFor="p-career" className={LBL}>경력{REQ}</label>
              <select id="p-career" value={careerType} onChange={(e) => setCareerType(e.target.value)} className={SEL}>
                {experienceOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="p-edu" className={LBL}>
                학력{REQ}
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">지원 가능한 학력 조건을 선택해 주세요.</span>
              </label>
              <select id="p-edu" value={educationType} onChange={(e) => setEducationType(e.target.value)} className={SEL}>
                {educationOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>

        {/* ── §2 모집 내용 ──────────────────────────────────────────────────── */}
        <SectionCard title="모집 내용">
          <div className="mb-5" ref={setRef("summary")}>
            <label htmlFor="p-summary" className={LBL}>
              공고 요약{REQ}
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">공고 목록과 상세 상단에 노출되는 짧은 소개 문장입니다.</span>
            </label>
            <input id="p-summary" value={summary} onChange={(e) => setSummary(e.target.value)}
              className={IN}
              placeholder="조제와 복약상담을 함께해주실 약사님을 모집합니다."
              maxLength={100}
              aria-required="true" />
            <p className="mt-2 text-right text-[12px] font-medium text-[#98a2b0]">{summary.length} / 100</p>
            <FieldError message={errors.summary} />
          </div>

          <div className="mb-5" ref={setRef("responsibilities")}>
            <label htmlFor="p-duties" className={LBL}>
              주요 업무{REQ}
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">담당 업무를 입력해 주세요.</span>
            </label>
            <textarea id="p-duties" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"처방전 검토 및 조제\n복약상담 및 고객 응대\n의약품 재고 관리 및 발주\nOTC 의약품 상담"}
              aria-required="true" />
            <FieldError message={errors.responsibilities} />
          </div>

          <div className="mb-5" ref={setRef("requirements")}>
            <label htmlFor="p-reqQual" className={LBL}>
              필수 자격요건{REQ}
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">지원에 필요한 필수 조건을 입력해 주세요.</span>
            </label>
            <textarea id="p-reqQual" value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder="약사 면허 소지자" aria-required="true" />
            <FieldError message={errors.requirements} />
          </div>

          <div>
            <label htmlFor="p-preferred" className={LBL}>
              우대사항
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">우대하는 경험이나 역량을 입력해 주세요.</span>
            </label>
            <textarea id="p-preferred" value={preferred} onChange={(e) => setPreferred(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"약국 근무 경험 보유자\n전산 프로그램 사용 경험자\n주말 또는 야간 근무 가능자"} />
          </div>

          <div>
            <label htmlFor="p-additionalNotes" className={LBL}>
              기타 참고사항
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">공고 상세에서는 &apos;추가 안내&apos; 영역에 노출됩니다.</span>
            </label>
            <textarea id="p-additionalNotes" value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"지원자가 알아두면 좋은 추가 안내가 있다면 입력해 주세요. 예: 입사 후 교육, 전형 일정 관련 안내 등"} />
          </div>
        </SectionCard>

        {/* ── §3 근무조건 ───────────────────────────────────────────────────── */}
        <SectionCard title="근무조건">
          <div className="mb-5" ref={setRef("workSchedule")}>
            <p className="mb-2 text-[14px] font-medium text-[#2f3845]">
              근무 시간대{REQ}
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">요일마다 근무 시간이 다르면 시간대를 나눠서 추가하세요.</span>
            </p>
            <div className="space-y-3">
              {workSchedule.map((block, idx) => (
                <div key={idx} className="border border-[#dfe4ea] bg-[#fbfcfd] p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div role="group" aria-label={`시간대 ${idx + 1} 근무 요일`} className="flex flex-wrap gap-1.5">
                      {WEEKDAY_OPTS.map((day) => {
                        const on = block.days.includes(day);
                        return (
                          <button key={day} type="button" role="checkbox" aria-checked={on}
                            onClick={() => toggleScheduleDay(idx, day)}
                            className={clsx(
                              "flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-medium transition-colors",
                              on ? "border-[#111111] bg-[#111111] text-white" : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
                            )}>
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    {workSchedule.length > 1 && (
                      <button type="button" onClick={() => removeScheduleBlock(idx)} aria-label={`시간대 ${idx + 1} 삭제`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#dfe4ea] bg-white text-[#7b8491] transition-colors hover:border-[#111111] hover:text-[#111111]">
                        <X size={14} aria-hidden />
                      </button>
                    )}
                  </div>
                  <input value={block.time} onChange={(e) => setScheduleTime(idx, e.target.value)}
                    className={IN} placeholder="예: 09:00–18:00" aria-label={`시간대 ${idx + 1} 근무 시간`} />
                </div>
              ))}
            </div>
            <button type="button" onClick={addScheduleBlock}
              className="mt-3 h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f8fa]">
              ＋ 시간대 추가
            </button>
            <FieldError message={errors.workSchedule} />
          </div>

          <div className="mb-5" ref={setRef("address")}>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="p-address" className="text-[14px] font-medium text-[#2f3845]">근무지{REQ}</label>
              <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#4c5665]">
                <input type="checkbox" checked={sameAsInstitutionAddress}
                  onChange={(e) => toggleSameAsInstitutionAddress(e.target.checked)}
                  className="h-4 w-4 accent-[#111111]" />
                약국 주소와 동일
              </label>
            </div>
            <input id="p-address" value={address} onChange={(e) => setAddress(e.target.value)}
              readOnly={sameAsInstitutionAddress}
              placeholder="예: 서울 강남구 테헤란로 123, 1층"
              className={clsx(IN, sameAsInstitutionAddress && "bg-[#f5f6f8] text-[#7d8796] cursor-not-allowed")}
              aria-required="true" />
            <FieldError message={errors.address} />
          </div>

          <div className="my-5 border-t border-[#f0f2f5]" />

          <div className="mb-5">
            <SegControl label="급여 방식" required options={SALARY_KIND_OPTS} value={salaryKind}
              onChange={(v) => setSalaryKind(v as SalaryKind)} />
          </div>

          {salaryKind !== "면접 후 결정" && (
            <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div ref={setRef("salaryAmount")}>
                <label htmlFor="p-salary-amount" className={LBL}>{salaryKind}{REQ}</label>
                <div className="relative">
                  <input id="p-salary-amount" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)}
                    className={`${IN} pr-12`}
                    placeholder={
                      salaryKind === "시급" ? "예: 25000"
                        : salaryKind === "일급" ? "예: 200000"
                          : salaryKind === "월급" ? "예: 500"
                            : "예: 6000"
                    } />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#7b8491]" aria-hidden>
                    {salaryKind === "시급" || salaryKind === "일급" ? "원" : "만원"}
                  </span>
                </div>
                <FieldError message={errors.salaryAmount} />
              </div>

              {salaryKind !== "시급" && (
                <div>
                  <label htmlFor="p-salary-hours" className={LBL}>
                    {salaryKind === "일급" ? "1일 근무시간" : "주당 근무시간"}
                    <span className="ml-1 text-[12px] font-normal text-[#7b8491]">시급 환산용, 선택</span>
                  </label>
                  <div className="relative">
                    <input id="p-salary-hours" value={salaryHours} onChange={(e) => setSalaryHours(e.target.value)}
                      className={`${IN} pr-10`} placeholder={salaryKind === "일급" ? "예: 8" : "예: 40"}
                      type="number" min="1" max="168" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#7b8491]" aria-hidden>시간</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {salaryKind !== "면접 후 결정" && salaryKind !== "시급" && (
            <div className="mb-5">
              <p className={LBL}>환산 시급 <span className="text-[12px] font-normal text-[#7b8491]">자동 계산</span></p>
              {estimateHourly() != null ? (
                <div className="flex h-11 items-center border border-[#c5e8e3] bg-[#edf7f5] px-3.5">
                  <span className="text-[13px] font-semibold text-[#0d7369]">약 {formatWon(estimateHourly()!)} (추정)</span>
                </div>
              ) : (
                <div className="flex h-11 items-center border border-[#dfe4ea] bg-[#f7f8fa] px-3.5">
                  <span className="text-[13px] text-[#a4adba]">
                    {salaryKind === "일급" ? "1일 근무시간 입력 시 환산" : "주당 근무시간 입력 시 환산"}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="p-salary-note" className={LBL}>급여 비고</label>
            <input id="p-salary-note" value={salaryNote} onChange={(e) => setSalaryNote(e.target.value)}
              className={IN} placeholder="예: 경력과 근무 요일에 따라 협의 가능합니다." />
          </div>

          <div className="my-5 border-t border-[#f0f2f5]" />

          <div className="mb-5">
            <ChipGroup label="복리후생" options={WELFARE_OPTS} selected={selectedBenefits} onToggle={toggleBenefit} />
          </div>

          <div className="my-5 border-t border-[#f0f2f5]" />

          <div className="mb-5">
            <p className={LBL}>근무자 구성</p>
            <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div>
                <label htmlFor="p-staff-ph" className="mb-1 block text-[12px] font-medium text-[#6b7280]">약사 수</label>
                <div className="relative">
                  <input id="p-staff-ph" value={staffPharmacistCount} onChange={(e) => setStaffPharmacistCount(e.target.value)}
                    className={`${IN} pr-8`} placeholder="예: 2" type="number" min="0" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#7b8491]" aria-hidden>명</span>
                </div>
              </div>
              <div>
                <label htmlFor="p-staff-sp" className="mb-1 block text-[12px] font-medium text-[#6b7280]">약무 지원 수</label>
                <div className="relative">
                  <input id="p-staff-sp" value={staffSupportCount} onChange={(e) => setStaffSupportCount(e.target.value)}
                    className={`${IN} pr-8`} placeholder="예: 1" type="number" min="0" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#7b8491]" aria-hidden>명</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="p-mainhospital" className={LBL}>
              주요 처방 병원
            </label>
            <input id="p-mainhospital" value={mainPrescribingHospital} onChange={(e) => setMainPrescribingHospital(e.target.value)}
              className={IN} placeholder="예: 인근 OO내과, OO정형외과" />
          </div>

          <div ref={setRef("workCondDetail")}>
            <label htmlFor="p-workcond" className={LBL}>근무조건 상세{REQ}</label>
            <textarea id="p-workcond" value={workCondDetail} onChange={(e) => setWorkCondDetail(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder="예: 주 5일 근무, 오전·오후 교대, 파트타임 가능 여부, 요일별 근무자 구성" />
            <FieldError message={errors.workCondDetail} />
          </div>
        </SectionCard>

        {/* ── §4 검색 노출 설정 ─────────────────────────────────────────────── */}
        <SectionCard title="검색 노출 설정">
          <div className="mb-6">
            <p className={LBL}>
              검색 키워드
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">{selectedKeywords.size} / {MAX_KW}개 선택</span>
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">약국 약사 직무에 자주 쓰이는 키워드를 추천합니다.</span>
            </p>

            <div role="group" aria-label="추천 키워드" className="flex flex-wrap gap-2">
              {PHARMACY_KEYWORDS.map((kw) => {
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

            <p className={LBL}>
              기타 키워드 직접 추가
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">추천 목록에 없는 키워드는 직접 입력하세요.</span>
            </p>
            <div className="flex gap-2">
              <input
                value={customKwInput}
                onChange={(e) => setCustomKwInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomKeyword(); } }}
                maxLength={10}
                placeholder="예: 건기식 상담, 산제포장, 야간근무"
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
            <p className={LBL} id="p-img-lbl">
              대표 이미지
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">공고 상세 상단에 표시할 이미지를 선택합니다.</span>
            </p>
            <div role="radiogroup" aria-labelledby="p-img-lbl" className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
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

        {/* ── 전형절차 및 제출서류 ──────────────────────────────────────────── */}
        <SectionCard title="전형절차 및 제출서류">
          <HiringProcessSelector
            processSteps={hiringProcess}
            onProcessChange={setHiringProcess}
            documents={requiredDocuments}
            onDocumentsChange={setRequiredDocuments}
          />
        </SectionCard>

        {/* ── §5 지원방법 및 마감일 ─────────────────────────────────────────── */}
        <SectionCard title="지원방법 및 마감일">
          <div className="mb-5">
            <p id="p-apply-method-label" className="mb-2 text-[13px] font-medium text-[#2f3845]">
              지원 방식{REQ}
            </p>
            <div role="radiogroup" aria-labelledby="p-apply-method-label" className="inline-flex overflow-hidden border border-[#d8e0e8]">
              {(
                [
                  { value: "quick" as const, label: "더파마 간편지원", badge: "추천" },
                  { value: "phone" as const, label: "전화·문자 지원" },
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
                    별도 연락처나 이메일 이동 없이, 지원자가 더파마 프로필과 이력서로 바로 지원할 수 있습니다. 접수 내역은 채용관리 화면에서 확인할 수 있습니다.
                  </span>
                </InlineNote>
              </div>
              <div className="max-w-sm" ref={setRef("deadline")}>
                <label htmlFor="p-deadline" className={LBL}>
                  {rollingToggle ? "마감 예정일" : <>접수 마감일{REQ}</>}
                </label>
                <input id="p-deadline" type="date" value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={rollingToggle}
                  className={clsx(IN, rollingToggle && "cursor-not-allowed opacity-45")}
                  aria-required={!rollingToggle ? "true" : undefined} />
                <FieldError message={errors.deadline} />
              </div>
            </div>
          ) : applyMethod === "phone" ? (
            <div className="mb-5">
              <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                <div ref={setRef("applyPhone")}>
                  <label htmlFor="p-apply-phone" className={LBL}>지원 연락처{REQ}</label>
                  <input id="p-apply-phone" type="tel"
                    value={applyPhone} onChange={(e) => setApplyPhone(e.target.value)}
                    className={IN}
                    placeholder="예: 010-1234-5678"
                    aria-required="true" />
                  <p className={HINT}>지원 연락처는 공고 상세에서 바로 노출하지 않고, 지원자가 로그인 후 확인할 수 있도록 처리합니다.</p>
                  <FieldError message={errors.applyPhone} />
                </div>
                <div>
                  <label htmlFor="p-apply-manager" className={LBL}>
                    담당자명
                  </label>
                  <input id="p-apply-manager" value={applyManagerName} onChange={(e) => setApplyManagerName(e.target.value)}
                    className={IN} placeholder="예: 홍길동" />
                </div>
              </div>
              <div className="mt-4 max-w-sm" ref={setRef("deadline")}>
                <label htmlFor="p-deadline" className={LBL}>
                  {rollingToggle ? "마감 예정일" : <>접수 마감일{REQ}</>}
                </label>
                <input id="p-deadline" type="date" value={deadline}
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
                <label htmlFor="p-apply-email" className={LBL}>지원 이메일{REQ}</label>
                <input id="p-apply-email" type="email"
                  value={applyEmail} onChange={(e) => setApplyEmail(e.target.value)}
                  className={IN}
                  placeholder="예: manager@pharmacy.kr"
                  aria-required="true" />
                <p className={HINT}>지원 이메일은 공고 상세에서 바로 노출하지 않고, 지원자가 로그인 후 확인할 수 있도록 처리합니다.</p>
                <FieldError message={errors.applyEmail} />
              </div>
              <div ref={setRef("deadline")}>
                <label htmlFor="p-deadline" className={LBL}>
                  {rollingToggle ? "마감 예정일" : <>접수 마감일{REQ}</>}
                </label>
                <input id="p-deadline" type="date" value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={rollingToggle}
                  className={clsx(IN, rollingToggle && "cursor-not-allowed opacity-45")}
                  aria-required={!rollingToggle ? "true" : undefined} />
                <FieldError message={errors.deadline} />
              </div>
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="p-contact-note" className={LBL}>
              연락 안내 문구
            </label>
            <input id="p-contact-note" value={contactNote} onChange={(e) => setContactNote(e.target.value)}
              className={IN} placeholder="예: 문자로 간단한 자기소개와 희망 근무시간을 보내주세요." />
            <p className={HINT}>지원자에게 전달할 연락 안내나 유의사항을 입력해 주세요.</p>
          </div>

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
