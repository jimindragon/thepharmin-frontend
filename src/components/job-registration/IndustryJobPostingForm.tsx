"use client";

import clsx from "clsx";
import { AlertCircle, ArrowUpRight, Info, X } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { AttachmentUploader, type AttachmentItem } from "@/components/business/AttachmentUploader";
import { FieldLabel, SectionCard } from "@/components/business/BusinessFormControls";
import { HiringProcessSelector } from "@/components/job-registration/HiringProcessSelector";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import {
  educationOptions,
  employmentTypeOptions,
  experienceOptions,
  industryJobCategoryOptions,
  workModeOptions,
} from "@/config/jobFilters/index";
import { initialBusinessCompanyProfile } from "@/data/businessCompanyProfile";
import type { JobSubcategoryOption } from "@/types/jobs";

// ── Types ──────────────────────────────────────────────────────────────────────

type JobCat = "rnd" | "sales" | "clinical" | "ra" | "ma" | "qc" | "pv" | "strategy" | "data" | "biz";

// ── Static data ────────────────────────────────────────────────────────────────

/**
 * 이 폼의 대분류 탭 키(JobCat)는 키워드 추천(KW_BY_CAT)을 위한 내부 식별자이며,
 * 정본 카테고리 id와 1:1로 매핑해 라벨·소분류를 industryJobCategoryOptions에서 가져온다.
 */
const JOB_CAT_TO_CATEGORY_ID: Record<JobCat, string> = {
  rnd: "rd",
  sales: "sales-marketing",
  clinical: "clinical",
  ra: "regulatory",
  ma: "medical-market",
  qc: "production-quality",
  pv: "pharmacy-safety",
  strategy: "strategy-investment",
  data: "data-ai",
  biz: "management",
};

const JOB_CATEGORIES: { key: JobCat; label: string; subcategories: JobSubcategoryOption[] }[] = (
  Object.keys(JOB_CAT_TO_CATEGORY_ID) as JobCat[]
).map((key) => {
  const category = industryJobCategoryOptions.find((c) => c.id === JOB_CAT_TO_CATEGORY_ID[key]);
  return { key, label: category?.label ?? "", subcategories: category?.subcategories ?? [] };
});

const SUBCATEGORY_LABEL_BY_ID = new Map(
  industryJobCategoryOptions.flatMap((category) => category.subcategories).map((sub) => [sub.id, sub.label] as const),
);

const KW_BY_CAT: Record<JobCat, string[]> = {
  rnd: ["신약개발", "전임상 연구", "후보물질 발굴", "스크리닝", "약리평가", "독성평가", "약동학/약력학", "제형연구", "분석법 개발", "CMC", "바이오의약품", "세포주 개발", "의료기기 R&D", "특허/IP"],
  sales: ["제약영업", "MR", "의료기기 영업", "병원영업", "KOL 관리", "Product Marketing", "브랜드 전략", "디지털 마케팅", "시장분석", "영업기획", "Key Account", "해외영업"],
  clinical: ["CRA", "CRC", "임상 PM", "Clinical Operations", "Medical Writing", "임상 QA", "ICH-GCP", "프로토콜", "Site Management", "모니터링", "SAE", "Data Management", "Biostatistics", "eTMF"],
  ra: ["RA", "인허가", "CTD", "eCTD", "IND/NDA", "MFDS", "FDA", "EMA", "허가전략", "변경허가", "CMC RA", "의료기기 RA", "글로벌 인허가", "규제기관 대응"],
  ma: ["Medical Affairs", "MSL", "Medical Science", "KOL Engagement", "Scientific Communication", "Medical Education", "HEOR", "RWE", "근거생성", "Market Access", "보험등재", "약가전략", "약물경제성", "논문·학술자료"],
  qc: ["GMP", "QA", "QC", "품질보증", "품질관리", "QMS", "Validation", "CSV", "SOP", "CAPA", "Deviation", "Audit", "공정관리", "제조관리", "LIMS"],
  pv: ["PV", "Drug Safety", "Pharmacovigilance", "이상사례", "ICSR", "Safety Database", "Signal Detection", "Literature Review", "DSUR", "PSUR/PBRER", "RMP", "안전성 보고", "SOP", "규제기관 보고"],
  strategy: ["BD", "사업개발", "Licensing", "License-in", "License-out", "기술이전", "파트너링", "Alliance Management", "M&A", "IR", "사업전략", "시장성 평가", "기술가치평가", "계약협상"],
  data: ["AI 신약개발", "Bioinformatics", "Data Science", "의료데이터", "RWE 데이터", "머신러닝", "빅데이터 분석", "데이터 파이프라인", "Python", "SQL", "CDISC", "SAS", "헬스케어 소프트웨어", "SaMD"],
  biz: ["HR", "채용", "조직문화", "재무", "회계", "법무", "컴플라이언스", "구매", "SCM", "물류", "홍보", "PR", "IR 지원", "총무"],
};

const WELFARE_OPTS = ["유연근무제", "재택근무", "성과급", "인센티브", "연차·반차", "건강검진", "식대 지원", "교통비 지원", "교육비 지원", "자격증 취득 지원", "어학 교육 지원", "학회·세미나 지원", "셔틀버스", "기숙사·사택"];
const SALARY_OPTS = ["회사 내규", "3,000만↑", "5,000만↑", "7,000만↑", "9,000만↑"];

const MAX_KW = 8;

// ── Helpers ────────────────────────────────────────────────────────────────────

function toggleSet<T>(s: Set<T>, item: T): Set<T> {
  const n = new Set(s);
  if (n.has(item)) n.delete(item);
  else n.add(item);
  return n;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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
    <div className="flex items-start justify-between gap-4 border border-[#dfe4ea] bg-white px-4 py-3">
      <div>
        <p className="text-[13px] font-medium text-[#303946]">{title}</p>
        {description && <p className="mt-1 text-[11.5px] text-[#7b8491]">{description}</p>}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={ariaLabel} />
    </div>
  );
}

// ── Style constants ────────────────────────────────────────────────────────────

const IN = "h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8";
const SEL = `${IN} appearance-none pr-8`;
const HINT = "mt-1 text-[11.5px] text-[#a0a9b7]";

// ── Main component ─────────────────────────────────────────────────────────────

export function IndustryJobPostingForm() {
  // §1 기본정보
  const [title, setTitle] = useState("");
  const [activeJobCat, setActiveJobCat] = useState<JobCat>("rnd");
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [headcount, setHeadcount] = useState("");
  const [employmentType, setEmploymentType] = useState("permanent");
  const [careerType, setCareerType] = useState("any");
  const [educationType, setEducationType] = useState("any");
  const [isLeadership, setIsLeadership] = useState(false);

  // §2 포지션 소개·업무·자격
  const [summary, setSummary] = useState("");
  const [positionIntro, setPositionIntro] = useState("");
  const [mainDuties, setMainDuties] = useState("");
  const [requiredQual, setRequiredQual] = useState("");
  const [preferred, setPreferred] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // §3 근무조건
  const [workMode, setWorkMode] = useState("");
  const [address, setAddress] = useState("서울 강남구 역삼로 226, 오신 카세코빌딩");
  const [sameAsCompanyAddress, setSameAsCompanyAddress] = useState(false);
  const [salary, setSalary] = useState("");
  const [welfare, setWelfare] = useState<Set<string>>(new Set());
  const [workCondDetail, setWorkCondDetail] = useState("");

  // §4 키워드·이미지 — kwCategory tracks which category's pool to show
  const [kwCategory, setKwCategory] = useState<JobCat>("rnd");
  const [keywords, setKeywords] = useState<Set<string>>(new Set());
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [customKwInput, setCustomKwInput] = useState("");
  const [imageOption, setImageOption] = useState<"default" | "upload" | "none">("default");

  // 전형절차 및 제출서류 (선택 입력)
  const [hiringProcess, setHiringProcess] = useState<string[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);

  // §5 지원방법·마감
  const [applyMethod, setApplyMethod] = useState<"url" | "quick" | "email">("url");
  const [applyTarget, setApplyTarget] = useState("");
  const [deadline, setDeadline] = useState("2026-07-07");
  const [rollingToggle, setRollingToggle] = useState(false);

  // §6 상세 이미지·첨부 자료
  const [imageAttachments, setImageAttachments] = useState<AttachmentItem[]>([]);
  const [fileAttachments, setFileAttachments] = useState<AttachmentItem[]>([]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [missingCount, setMissingCount] = useState(0);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const setRef = (key: string) => (el: HTMLElement | null) => { fieldRefs.current[key] = el; };

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim())           next.title        = "공고 제목을 입력해 주세요.";
    if (selectedJobs.size === 0) next.selectedJobs = "모집 직무를 하나 이상 선택해 주세요.";
    if (!headcount)              next.headcount    = "모집인원을 선택해 주세요.";
    if (!summary.trim())         next.summary      = "한 줄 요약을 입력해 주세요.";
    if (!mainDuties.trim())      next.mainDuties   = "주요업무를 입력해 주세요.";
    if (!requiredQual.trim())    next.requiredQual = "자격조건을 입력해 주세요.";
    if (!workMode)               next.workMode     = "근무 방식을 선택해 주세요.";
    if (workMode !== "remote") {
      if (!address.trim())       next.address      = "근무지를 입력해 주세요.";
    }
    if (!salary)                 next.salary       = "급여를 선택해 주세요.";
    if ((applyMethod === "url" || applyMethod === "email") && !applyTarget.trim()) {
      next.applyTarget = applyMethod === "url" ? "지원 페이지 URL을 입력해 주세요." : "지원 이메일 주소를 입력해 주세요.";
    }
    if (!rollingToggle && !deadline) next.deadline = "지원 마감일을 입력해 주세요.";

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

  // Selecting a job category updates both the picker display AND the keyword pool
  function selectJobCat(cat: JobCat) {
    setActiveJobCat(cat);
    setKwCategory(cat);
  }

  function toggleJob(job: string) {
    setSelectedJobs((prev) => toggleSet(prev, job));
  }

  function toggleKeyword(kw: string) {
    setKeywords((prev) => {
      const n = new Set(prev);
      if (n.has(kw)) n.delete(kw);
      else if (n.size < MAX_KW) n.add(kw);
      return n;
    });
  }

  function addCustomKeyword() {
    const v = customKwInput.trim();
    if (!v || v.length > 10 || keywords.has(v) || keywords.size >= MAX_KW) return;
    setKeywords((prev) => { const n = new Set(prev); n.add(v); return n; });
    setCustomKeywords((prev) => [...prev, v]);
    setCustomKwInput("");
  }

  function removeCustomKeyword(kw: string) {
    setKeywords((prev) => { const n = new Set(prev); n.delete(kw); return n; });
    setCustomKeywords((prev) => prev.filter((k) => k !== kw));
  }

  function toggleSameAsCompanyAddress(checked: boolean) {
    setSameAsCompanyAddress(checked);
    if (checked) {
      const companyAddress = initialBusinessCompanyProfile.detailAddress
        ? `${initialBusinessCompanyProfile.address} ${initialBusinessCompanyProfile.detailAddress}`
        : initialBusinessCompanyProfile.address;
      setAddress(companyAddress);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const activeCategory = JOB_CATEGORIES.find((c) => c.key === activeJobCat);
  const activeCatLabel = activeCategory?.label ?? "";
  const activeCategorySubcategories = activeCategory?.subcategories ?? [];
  const kwCatLabel     = JOB_CATEGORIES.find((c) => c.key === kwCategory)?.label ?? "";

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
            <span className="font-medium text-[#8791a0]">산업</span>
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] font-normal text-[#68717e]">
            <span>등록 기업</span>
            <span className="font-semibold text-[#303946]">{initialBusinessCompanyProfile.displayName}</span>
            <span className="text-[#c0c8d2]">·</span>
            <Link href="/business/industry/profile" className="inline-flex items-center gap-0.5 underline underline-offset-2 transition hover:text-[#303946]">
              기업 정보 관리
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
            <FieldLabel htmlFor="i-title" className="block mb-1.5" required>공고 제목</FieldLabel>
            <input id="i-title" value={title} onChange={(e) => setTitle(e.target.value)}
              className={IN} placeholder="의약품 안전관리(PV) 담당자 채용" aria-required="true" />
            <FieldError message={errors.title} />
          </div>

          {/* 모집 직무 — 2단계 선택기 */}
          <div className="mb-5" ref={setRef("selectedJobs")}>
            <FieldLabel className="block mb-2">
              모집 직무
              <span className="ml-1 text-danger" aria-hidden>*</span>
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">1차 분류를 고르고 세부 직무를 선택하세요.</span>
            </FieldLabel>
            <div className="grid grid-cols-[180px_1fr] border border-[#d8e0e8] max-[640px]:grid-cols-1">
              {/* Left: category list */}
              <div
                role="radiogroup"
                aria-label="직무 대분류"
                className="max-h-[260px] overflow-auto border-r border-[#dfe4ea] bg-[#fbfcfd] max-[640px]:max-h-none max-[640px]:border-b max-[640px]:border-r-0"
              >
                {JOB_CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    role="radio"
                    aria-checked={activeJobCat === cat.key}
                    onClick={() => selectJobCat(cat.key)}
                    className={clsx(
                      "block w-full border-b border-[#f0f2f5] px-3.5 py-2.5 text-left text-[13px] font-medium last:border-b-0 transition-colors",
                      activeJobCat === cat.key
                        ? "bg-[#111111] text-white"
                        : "bg-transparent text-[#4f5967] hover:bg-[#f5f6f7]",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {/* Right: detail jobs */}
              <div className="p-4">
                <p className="mb-3 text-[12.5px] font-semibold text-[#4f5967]">
                  {activeCatLabel} · 세부 직무
                </p>
                <div role="group" aria-label="세부 직무" className="flex flex-wrap gap-2">
                  {activeCategorySubcategories.map((sub) => {
                    const on = selectedJobs.has(sub.id);
                    return (
                      <button key={sub.id} type="button" role="checkbox" aria-checked={on}
                        onClick={() => toggleJob(sub.id)}
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
            {selectedJobs.size > 0 && (
              <p className="mt-2 text-[11.5px] text-[#7b8491]">
                선택됨: {Array.from(selectedJobs).map((id) => SUBCATEGORY_LABEL_BY_ID.get(id) ?? id).join(", ")}
              </p>
            )}
            <FieldError message={errors.selectedJobs} />
          </div>

          {/* 모집인원 + 고용형태 */}
          <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div ref={setRef("headcount")}>
              <FieldLabel htmlFor="i-headcount" className="block mb-1.5" required>모집인원</FieldLabel>
              <select id="i-headcount" value={headcount} onChange={(e) => setHeadcount(e.target.value)}
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
              <FieldLabel htmlFor="i-emptype" className="block mb-1.5" required>고용형태</FieldLabel>
              <select id="i-emptype" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={SEL}>
                {employmentTypeOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 경력 + 학력 */}
          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div>
              <FieldLabel htmlFor="i-career" className="block mb-1.5" required>경력</FieldLabel>
              <select id="i-career" value={careerType} onChange={(e) => setCareerType(e.target.value)} className={SEL}>
                {experienceOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="i-edu" className="block mb-1.5">
                학력
                <span className="ml-1 text-danger" aria-hidden>*</span>
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">지원 가능한 학력 조건을 선택해 주세요.</span>
              </FieldLabel>
              <select id="i-edu" value={educationType} onChange={(e) => setEducationType(e.target.value)} className={SEL}>
                {educationOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <ToggleRow
              title="리더급 공고"
              description="팀장·임원급 등 리더 포지션 채용일 때 켜 주세요."
              checked={isLeadership}
              onChange={setIsLeadership}
              ariaLabel="리더급 공고"
            />
          </div>
        </SectionCard>

        {/* ── §2 포지션 소개 · 업무 · 자격 ─────────────────────────────────── */}
        <SectionCard title="모집 내용">
          <div className="mb-5" ref={setRef("summary")}>
            <FieldLabel htmlFor="i-summary" className="block mb-1.5">
              한 줄 소개
              <span className="ml-1 text-danger" aria-hidden>*</span>
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">공고 카드와 상세 상단에 노출되는 짧은 소개 문구입니다.</span>
            </FieldLabel>
            <input id="i-summary" value={summary} onChange={(e) => setSummary(e.target.value)}
              className={IN}
              placeholder="예: 글로벌 RA 커리어를 시작할 의료기기 인허가 담당자를 찾습니다."
              maxLength={100}
              aria-required="true" />
            <p className="mt-2 text-right text-[12px] font-medium text-[#98a2b0]">{summary.length} / 100</p>
            <FieldError message={errors.summary} />
          </div>

          <div className="mb-5">
            <FieldLabel htmlFor="i-positionintro" className="block mb-1.5">
              포지션 소개
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">구직자가 포지션의 맥락을 이해할 수 있도록 줄글로 작성해 주세요.</span>
            </FieldLabel>
            <textarea id="i-positionintro" value={positionIntro} onChange={(e) => setPositionIntro(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder="이 포지션이 어떤 팀, 제품, 과제와 연결되는지, 입사 후 어떤 역할을 맡게 되는지 3~5문장으로 작성해 주세요." />
          </div>

          <div className="mb-5" ref={setRef("mainDuties")}>
            <FieldLabel htmlFor="i-duties" className="block mb-1.5">
              주요업무
              <span className="ml-1 text-danger" aria-hidden>*</span>
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">담당 업무를 입력해 주세요.</span>
            </FieldLabel>
            <textarea id="i-duties" value={mainDuties} onChange={(e) => setMainDuties(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"국내외 허가자료 작성 및 제출\nCTD 문서 검토 및 관리\n규제기관 질의 대응 및 변경허가 업무 수행"}
              aria-required="true" />
            <FieldError message={errors.mainDuties} />
          </div>

          <div className="mb-5" ref={setRef("requiredQual")}>
            <FieldLabel htmlFor="i-reqQual" className="block mb-1.5">
              필수 자격요건
              <span className="ml-1 text-danger" aria-hidden>*</span>
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">지원에 필요한 필수 조건을 입력해 주세요.</span>
            </FieldLabel>
            <textarea id="i-reqQual" value={requiredQual} onChange={(e) => setRequiredQual(e.target.value)} rows={3}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"약학, 생명과학, 화학, 생명공학 등 관련 전공 학사 이상\n신입 또는 관련 업무 경험 보유자"}
              aria-required="true" />
            <FieldError message={errors.requiredQual} />
          </div>

          <div>
            <FieldLabel htmlFor="i-preferred" className="block mb-1.5">
              우대사항
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">우대하는 경험이나 역량을 입력해 주세요.</span>
            </FieldLabel>
            <textarea id="i-preferred" value={preferred} onChange={(e) => setPreferred(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"관련 인턴 또는 프로젝트 경험\n영어 문서 작성 및 커뮤니케이션 가능자\n약사 등 관련 면허 보유자"} />
          </div>

          <div className="mt-5">
            <FieldLabel htmlFor="i-additionalnotes" className="block mb-1.5">
              기타 참고사항
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">공고 상세에서는 &apos;추가 안내&apos; 영역에 노출됩니다.</span>
            </FieldLabel>
            <textarea id="i-additionalnotes" value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder="지원자가 알아두면 좋은 추가 안내가 있다면 입력해 주세요. 예: 입사 후 교육, 포트폴리오 제출 안내, 전형 일정 관련 안내 등" />
          </div>
        </SectionCard>

        {/* ── §3 근무조건 ───────────────────────────────────────────────────── */}
        <SectionCard title="근무조건">
          <div className="mb-5" ref={setRef("workMode")}>
            <FieldLabel htmlFor="i-workmode" className="block mb-1.5" required>근무 방식</FieldLabel>
            <select id="i-workmode" value={workMode} onChange={(e) => setWorkMode(e.target.value)}
              className={SEL} aria-required="true">
              <option value="" disabled>근무 방식을 선택해 주세요</option>
              {workModeOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <FieldError message={errors.workMode} />
          </div>

          {workMode !== "remote" && (
            <div className="mb-5" ref={setRef("address")}>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <FieldLabel htmlFor="i-address" required>근무지</FieldLabel>
                <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#4c5665]">
                  <input type="checkbox" checked={sameAsCompanyAddress}
                    onChange={(e) => toggleSameAsCompanyAddress(e.target.checked)}
                    className="h-4 w-4 accent-[#111111]" />
                  기업 주소와 동일
                </label>
              </div>
              <input id="i-address" value={address} onChange={(e) => setAddress(e.target.value)}
                readOnly={sameAsCompanyAddress}
                placeholder="예: 서울 강남구 역삼로 226, 오신 카세코빌딩"
                className={clsx(IN, sameAsCompanyAddress && "bg-[#f5f6f8] text-[#7d8796] cursor-not-allowed")}
                aria-required="true" />
              {!address.trim() && (
                <div className="mt-2 flex items-center gap-1.5 border border-[#f1dcb7] bg-[#fff9ef] px-3 py-1.5 text-[11.5px] text-[#9a6b00]">
                  <AlertCircle size={13} aria-hidden />
                  기관정보에 가까운 역·교통 정보가 비어 있습니다. 비어있으면 상세에 노출되지 않습니다.
                </div>
              )}
              <FieldError message={errors.address} />
            </div>
          )}

          <div className="my-5 border-t border-[#f0f2f5]" />

          <div className="mb-5" ref={setRef("salary")}>
            <SegControl label="급여" required options={SALARY_OPTS} value={salary} onChange={setSalary} />
            <FieldError message={errors.salary} />
          </div>

          <div className="mb-5">
            <ChipGroup label="복리후생" options={WELFARE_OPTS} selected={welfare}
              onToggle={(item) => setWelfare(toggleSet(welfare, item))} />
          </div>

          <div>
            <FieldLabel htmlFor="i-workcond" className="block mb-1.5">근무조건 상세</FieldLabel>
            <textarea id="i-workcond" value={workCondDetail} onChange={(e) => setWorkCondDetail(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder="주 2회 재택근무 가능, 프로젝트 일정에 따라 유연근무를 운영합니다." />
          </div>
        </SectionCard>

        {/* ── §4 키워드 · 이미지 ────────────────────────────────────────────── */}
        <SectionCard title="검색 노출 설정">
          <div className="mb-6">
            <FieldLabel className="block mb-1.5">
              검색 키워드
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">{keywords.size} / {MAX_KW}개 선택</span>
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">모집 직무에 맞춰 자주 쓰이는 키워드를 추천합니다.</span>
            </FieldLabel>

            {/* Recommended pool — changes with job category */}
            <div role="group" aria-label="추천 키워드" className="flex flex-wrap gap-2">
              {KW_BY_CAT[kwCategory].map((kw) => {
                const on = keywords.has(kw);
                const blocked = keywords.size >= MAX_KW && !on;
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

            {/* Custom keyword input */}
            <FieldLabel className="block mb-1.5">
              기타 키워드 직접 추가
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">추천 목록에 없는 키워드는 직접 입력하세요.</span>
            </FieldLabel>
            <div className="flex gap-2">
              <input
                value={customKwInput}
                onChange={(e) => setCustomKwInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomKeyword(); } }}
                maxLength={10}
                placeholder="예: ICH-GCP"
                className={`${IN} flex-1`}
                aria-label="키워드 직접 입력"
              />
              <button type="button" onClick={addCustomKeyword}
                disabled={keywords.size >= MAX_KW}
                className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:border-[#dfe4ea] disabled:text-[#aeb6c0]">
                ＋ 직접 추가
              </button>
            </div>
            <p className={HINT}>(10자 이내)</p>

            {/* Custom keywords as chips (always "on", click removes) */}
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

          {/* 대표 이미지 */}
          <div>
            <div id="i-img-lbl">
              <FieldLabel className="block mb-1.5">
                대표 이미지
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">공고 상세 상단에 표시할 이미지를 선택합니다.</span>
              </FieldLabel>
            </div>
            <div role="radiogroup" aria-labelledby="i-img-lbl" className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
              {(["default", "upload", "none"] as const).map((opt) => {
                const labels = {
                  default: "기업 기본 이미지 사용",
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

        {/* ── §5 지원방법 및 마감일 ─────────────────────────────────────────── */}
        <SectionCard title="지원방법 및 마감일">
          <div className="mb-5">
            <div id="apply-method-label">
              <FieldLabel className="block mb-2" required>지원 방식</FieldLabel>
            </div>
            <div role="radiogroup" aria-labelledby="apply-method-label" className="inline-flex overflow-hidden border border-[#d8e0e8]">
              {(
                [
                  { value: "url" as const, label: "기업 채용페이지 지원" },
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
                    별도 채용페이지나 이메일 이동 없이, 지원자가 더파마 프로필과 이력서로 바로 지원할 수 있습니다. 접수 내역은 기업 센터에서 관리됩니다.
                  </span>
                </InlineNote>
              </div>
              <div className="max-w-sm" ref={setRef("deadline")}>
                <FieldLabel htmlFor="i-deadline" className="block mb-1.5" required={!rollingToggle}>
                  {rollingToggle ? "마감 예정일" : "접수 마감일"}
                </FieldLabel>
                <input id="i-deadline" type="date" value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={rollingToggle}
                  className={clsx(IN, rollingToggle && "cursor-not-allowed opacity-45")}
                  aria-required={!rollingToggle ? "true" : undefined} />
                <FieldError message={errors.deadline} />
              </div>
            </div>
          ) : (
            <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div ref={setRef("applyTarget")}>
                <FieldLabel htmlFor="i-apply-target" className="block mb-1.5" required>
                  {applyMethod === "url" ? "채용페이지 URL" : "지원 이메일 주소"}
                </FieldLabel>
                <input id="i-apply-target" type={applyMethod === "url" ? "url" : "email"}
                  value={applyTarget} onChange={(e) => setApplyTarget(e.target.value)}
                  className={IN}
                  placeholder={applyMethod === "url" ? "예: https://company.com/careers/job-123" : "예: recruit@company.com"}
                  aria-required="true" />
                <FieldError message={errors.applyTarget} />
              </div>

              <div ref={setRef("deadline")}>
                <FieldLabel htmlFor="i-deadline" className="block mb-1.5" required={!rollingToggle}>
                  {rollingToggle ? "마감 예정일" : "접수 마감일"}
                </FieldLabel>
                <input id="i-deadline" type="date" value={deadline}
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

        {/* ── §6 상세 이미지·첨부 자료 ─────────────────────────────────────── */}
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
              검색과 추천 품질을 위해 주요업무 · 자격요건 · 근무조건은 텍스트로 입력해 주세요.
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
