"use client";

import clsx from "clsx";
import { AlertCircle, Info, X } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { SectionCard } from "@/components/business/BusinessFormControls";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

// ── Types ──────────────────────────────────────────────────────────────────────

type JobCat = "rnd" | "sales" | "clinical" | "ra" | "ma" | "qc" | "pv" | "strategy" | "data" | "biz";

// ── Static data ────────────────────────────────────────────────────────────────

const JOB_CATEGORIES: { key: JobCat; label: string }[] = [
  { key: "rnd",      label: "연구개발" },
  { key: "sales",    label: "영업·마케팅" },
  { key: "clinical", label: "임상" },
  { key: "ra",       label: "RA·인허가" },
  { key: "ma",       label: "Medical·Market Access" },
  { key: "qc",       label: "생산·품질" },
  { key: "pv",       label: "약무·의약 관리" },
  { key: "strategy", label: "전략·투자" },
  { key: "data",     label: "데이터·AI" },
  { key: "biz",      label: "경영지원" },
];

const JOB_DETAILS: Record<JobCat, string[]> = {
  rnd:      ["신약개발", "바이오의약품 전임·분석", "콜리·독성", "비임상", "합성·CMC", "의료기기 R&D"],
  sales:    ["제약영업·MR", "의료기기 영업", "마케팅·PM", "영업기획·관리", "디지털마케팅", "해외영업"],
  clinical: ["임상시험이사", "Medical Writing", "CRA", "CRC", "임상 QA", "임상 PM", "임상 DM·통계"],
  ra:       ["RA", "CMC RA", "허가 전략", "의료기기 RA"],
  ma:       ["Medical Affairs", "MSL", "HEOR·RWE", "약가·보험"],
  qc:       ["생산·제조", "SCM", "공정기술", "QC", "QA", "Validation", "GMP·QMS"],
  pv:       ["병원 약무", "제약 약무", "유통 약무", "PV·Drug Safety"],
  strategy: ["BD·Licensing", "사업전략", "투자", "M&A", "IR"],
  data:     ["AI 신약개발", "IT·Software", "Bioinformatics", "Data Science", "RWE 데이터"],
  biz:      ["HR", "디자인", "재무·회계", "법무·컴플라이언스", "구매·이무", "홍보·PR"],
};

const KW_BY_CAT: Record<JobCat, string[]> = {
  rnd:      ["신약개발", "전임상", "콜리", "독성", "합성", "전임 연구", "바이오의약품", "CMC", "스크린", "후보물질", "의료기기 R&D", "특허"],
  sales:    ["제약영업", "MR", "의료기기 영업", "마케팅", "PM", "브랜드전략", "디지털마케팅", "해외영업", "KOL", "시장분석", "영업기획"],
  clinical: ["임상시험이사", "CRA", "CRC", "Medical Writing", "임상 QA", "임상 PM", "ICH-GCP", "프로토콜", "DM", "통계", "모니터링", "SAE"],
  ra:       ["RA", "CTD", "인허가", "규제기관", "IND/NDA", "FDA", "EMA", "CMC RA", "허가전략", "의료기기 RA", "변경허가", "글로벌 인허가"],
  ma:       ["Medical Affairs", "MSL", "HEOR", "RWE", "약가", "보험", "근거생성", "KOL", "임상논문", "Market Access", "약물경제성"],
  qc:       ["GMP", "QC", "QA", "QMS", "Validation", "CAPA", "품질보증", "품질관리", "SOP", "공정기술", "제조관리", "일탈관리"],
  pv:       ["PV", "Pharmacovigilance", "약물감시", "약물감사", "안전성", "ICSR", "시그널", "안전정보", "복약지도", "조제", "마약류 관리", "DUR"],
  strategy: ["BD", "Licensing", "License-in", "사업개발", "기술이전", "파트너링", "투자", "M&A", "IR", "사업전략", "계약협상"],
  data:     ["AI 신약개발", "Bioinformatics", "Data Science", "RWE 데이터", "머신러닝", "빅데이터", "IT", "Software", "데이터분석"],
  biz:      ["HR", "채용", "재무", "회계", "법무", "컴플라이언스", "구매", "이무", "홍보", "PR", "디자인", "경영지원"],
};

const WELFARE_OPTS = ["4대보험", "연차", "교육비 지원", "성과금", "유연근무", "재택근무", "글로벌 교육", "건강검진", "사내카페", "직원 주차"];

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
      <p id={id} className="mb-2 text-[13px] font-medium text-[#2f3845]">
        {label}
        {required && <span className="ml-1 text-danger" aria-hidden>*</span>}
        {max != null && <span className="ml-2 text-[12px] font-normal text-[#7b8491]">최대 {max}개</span>}
      </p>
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

// ── Style constants ────────────────────────────────────────────────────────────

const IN = "h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8";
const SEL = `${IN} appearance-none pr-8`;
const LBL = "block mb-1.5 text-[13px] font-medium text-[#2f3845]";
const HINT = "mt-1 text-[11.5px] text-[#a0a9b7]";
const REQ = <span className="ml-1 text-danger" aria-hidden>*</span>;

// ── Main component ─────────────────────────────────────────────────────────────

export function IndustryJobPostingForm() {
  // §1 기본정보
  const [title, setTitle] = useState("");
  const [activeJobCat, setActiveJobCat] = useState<JobCat>("rnd");
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [industryCat, setIndustryCat] = useState("");
  const [headcount, setHeadcount] = useState("");
  const [employmentType, setEmploymentType] = useState("정규직");
  const [careerType, setCareerType] = useState("경력무관");
  const [educationType, setEducationType] = useState("학력무관");

  // §2 포지션 소개·업무·자격
  const [summary, setSummary] = useState("");
  const [mainDuties, setMainDuties] = useState("");
  const [requiredQual, setRequiredQual] = useState("");
  const [preferred, setPreferred] = useState("");

  // §3 근무조건
  const [workplaceMode, setWorkplaceMode] = useState("기관 대표 주소 불러오기");
  const [workRegion, setWorkRegion] = useState("서울 강남구");
  const [workMode, setWorkMode] = useState("");
  const [address, setAddress] = useState("서울 강남구 역삼로 226, 오신 카세코빌딩");
  const [workSchedule, setWorkSchedule] = useState("");
  const [salary, setSalary] = useState("");
  const [welfare, setWelfare] = useState<Set<string>>(new Set(["4대보험", "연차", "교육비 지원", "성과금"]));
  const [workCondDetail, setWorkCondDetail] = useState("");

  // §4 키워드·이미지 — kwCategory tracks which category's pool to show
  const [kwCategory, setKwCategory] = useState<JobCat>("rnd");
  const [keywords, setKeywords] = useState<Set<string>>(new Set());
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [customKwInput, setCustomKwInput] = useState("");
  const [imageOption, setImageOption] = useState<"default" | "upload" | "none">("default");

  // §5 지원방법·마감
  const [applyMethod, setApplyMethod] = useState<"url" | "quick" | "email">("url");
  const [applyTarget, setApplyTarget] = useState("");
  const [deadline, setDeadline] = useState("2026-07-07");
  const [rollingToggle, setRollingToggle] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [missingCount, setMissingCount] = useState(0);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const setRef = (key: string) => (el: HTMLElement | null) => { fieldRefs.current[key] = el; };

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim())           next.title        = "공고 제목을 입력해 주세요.";
    if (selectedJobs.size === 0) next.selectedJobs = "모집 직무를 하나 이상 선택해 주세요.";
    if (!industryCat)            next.industryCat  = "산업 분류를 선택해 주세요.";
    if (!headcount)              next.headcount    = "모집인원을 선택해 주세요.";
    if (!summary.trim())         next.summary      = "한 줄 요약을 입력해 주세요.";
    if (!mainDuties.trim())      next.mainDuties   = "주요업무를 입력해 주세요.";
    if (!requiredQual.trim())    next.requiredQual = "자격조건을 입력해 주세요.";
    if (!workRegion.trim())      next.workRegion   = "근무지역을 입력해 주세요.";
    if (!workMode)               next.workMode     = "근무 방식을 선택해 주세요.";
    if (!address.trim())         next.address      = "주소를 입력해 주세요.";
    if (!workSchedule.trim())    next.workSchedule = "근무 요일/시간을 입력해 주세요.";
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
    if (!v || v.length > 20 || keywords.has(v) || keywords.size >= MAX_KW) return;
    setKeywords((prev) => { const n = new Set(prev); n.add(v); return n; });
    setCustomKeywords((prev) => [...prev, v]);
    setCustomKwInput("");
  }

  function removeCustomKeyword(kw: string) {
    setKeywords((prev) => { const n = new Set(prev); n.delete(kw); return n; });
    setCustomKeywords((prev) => prev.filter((k) => k !== kw));
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const activeCatLabel = JOB_CATEGORIES.find((c) => c.key === activeJobCat)?.label ?? "";
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
            산업 공고 등록
            <span className="inline-flex items-center gap-1.5 border border-[#dfe4ea] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#4f5967]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0d7369]" aria-hidden />
              더팜인뉴스(주) 명의로 작성 중 ·{" "}
              <Link href="#" className="ml-0.5 font-bold text-[#0d7369] underline-offset-2 hover:underline">
                기업정보
              </Link>
            </span>
          </h1>
          <p className="mt-2 text-[13px] font-normal text-[#68717e]">
            제약·바이오·포스케어 기업 채용 공고를 등록합니다. 입력한 내용은 공고 상세 페이지에 그대로 노출됩니다.
          </p>
        </div>
      </div>

      {/* Section stack — save bar is last child so position:sticky works */}
      <div className="mt-8 space-y-5">

        {/* ── §1 기본 정보 ──────────────────────────────────────────────────── */}
        <SectionCard
          title="기본 정보"
          description="공고 제목과 직무, 채용 조건을 입력합니다."
          status={errors.title || errors.selectedJobs || errors.industryCat || errors.headcount ? "필수 입력 필요" : "작성 중"}
        >
          {/* 공고 제목 */}
          <div className="mb-5" ref={setRef("title")}>
            <label htmlFor="i-title" className={LBL}>공고 제목{REQ}</label>
            <input id="i-title" value={title} onChange={(e) => setTitle(e.target.value)}
              className={IN} placeholder="예: [한국오신 카세코] 신규직 MI/PV 채용" aria-required="true" />
            <FieldError message={errors.title} />
          </div>

          {/* 모집 직무 — 2단계 선택기 */}
          <div className="mb-5" ref={setRef("selectedJobs")}>
            <p className="mb-2 text-[13px] font-medium text-[#2f3845]">
              모집 직무{REQ}
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">1차 분류를 고르고 세부 직무를 선택하세요.</span>
            </p>
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
                  {JOB_DETAILS[activeJobCat].map((job) => {
                    const on = selectedJobs.has(job);
                    return (
                      <button key={job} type="button" role="checkbox" aria-checked={on}
                        onClick={() => toggleJob(job)}
                        className={clsx(
                          "inline-flex h-9 items-center gap-1.5 border px-3.5 text-[12px] font-medium transition-colors",
                          on
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
                        )}>
                        {on && <span className="text-[10px]" aria-hidden>✓</span>}
                        {job}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {selectedJobs.size > 0 && (
              <p className="mt-2 text-[11.5px] text-[#7b8491]">
                선택됨: {Array.from(selectedJobs).join(", ")}
              </p>
            )}
            <FieldError message={errors.selectedJobs} />
          </div>

          {/* 산업 분류 + 모집인원 */}
          <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div ref={setRef("industryCat")}>
              <label htmlFor="i-indcat" className={LBL}>산업 분류{REQ}</label>
              <select id="i-indcat" value={industryCat} onChange={(e) => setIndustryCat(e.target.value)}
                className={SEL} aria-required="true">
                <option value="" disabled>산업 유형을 선택해 주세요</option>
                <option>제약·바이오</option>
                <option>CRO·CMDO</option>
                <option>의료기기</option>
                <option>디지털 포스케어</option>
                <option>유통·도매</option>
                <option>기타</option>
              </select>
              <FieldError message={errors.industryCat} />
            </div>
            <div ref={setRef("headcount")}>
              <label htmlFor="i-headcount" className={LBL}>모집인원{REQ}</label>
              <select id="i-headcount" value={headcount} onChange={(e) => setHeadcount(e.target.value)}
                className={SEL} aria-required="true">
                <option value="" disabled>인원을 선택해 주세요</option>
                <option>1명</option>
                <option>2명</option>
                <option>3명</option>
                <option>0명(채용 시 마감)</option>
              </select>
              <FieldError message={errors.headcount} />
            </div>
          </div>

          {/* 고용형태 + 경력 + 학력 */}
          <div className="grid grid-cols-3 gap-4 max-[640px]:grid-cols-1">
            <div>
              <label htmlFor="i-emptype" className={LBL}>고용형태{REQ}</label>
              <select id="i-emptype" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={SEL}>
                <option>정규직</option>
                <option>계약직</option>
                <option>인턴</option>
                <option>파트타임</option>
                <option>프리랜서</option>
              </select>
            </div>
            <div>
              <label htmlFor="i-career" className={LBL}>경력{REQ}</label>
              <select id="i-career" value={careerType} onChange={(e) => setCareerType(e.target.value)} className={SEL}>
                <option>경력무관</option>
                <option>신입</option>
                <option>1년 미만</option>
                <option>1~3년</option>
                <option>3~5년</option>
                <option>5~10년</option>
                <option>10년 이상</option>
              </select>
            </div>
            <div>
              <label htmlFor="i-edu" className={LBL}>학력{REQ}</label>
              <select id="i-edu" value={educationType} onChange={(e) => setEducationType(e.target.value)} className={SEL}>
                <option>학력무관</option>
                <option>학사 이상</option>
                <option>석사 이상</option>
                <option>박사</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* ── §2 포지션 소개 · 업무 · 자격 ─────────────────────────────────── */}
        <SectionCard
          title="포지션 소개 · 업무 · 자격"
          description="포지션 요약과 담당 업무, 자격을 입력합니다."
          status={errors.summary || errors.mainDuties || errors.requiredQual ? "필수 입력 필요" : "작성 중"}
        >
          <div className="mb-5" ref={setRef("summary")}>
            <label htmlFor="i-summary" className={LBL}>한 줄 요약{REQ}</label>
            <input id="i-summary" value={summary} onChange={(e) => setSummary(e.target.value)}
              className={IN}
              placeholder="예: 의약품 안전정보(MI) 제공과 의약품감시(PV) 업무를 담당할 인재를 찾습니다."
              aria-required="true" />
            <p className={HINT}>공고 목록과 상세 상단에 노출되는 요약 문장입니다.</p>
            <FieldError message={errors.summary} />
          </div>

          <div className="mb-5" ref={setRef("mainDuties")}>
            <label htmlFor="i-duties" className={LBL}>주요업무{REQ}</label>
            <p className={`${HINT} mb-1.5`}>한 줄에 하나씩 입력하면 항목으로 표시됩니다.</p>
            <textarea id="i-duties" value={mainDuties} onChange={(e) => setMainDuties(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"의약품 안전정보(MI) 문의 대응 및 자료 관리\n의약품 이상사례(PV) 수집·평가·보고 및 안전성 자료 관리\n규제 기관 보고 및 안전성 문서 작성"}
              aria-required="true" />
            <FieldError message={errors.mainDuties} />
          </div>

          <div className="mb-5" ref={setRef("requiredQual")}>
            <label htmlFor="i-reqQual" className={LBL}>자격조건(필수){REQ}</label>
            <p className={`${HINT} mb-1.5`}>한 줄에 하나씩 입력하세요.</p>
            <textarea id="i-reqQual" value={requiredQual} onChange={(e) => setRequiredQual(e.target.value)} rows={3}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"의약·생명과학 관련 전공 학사 이상\n경력무관(신입 지원 가능)"}
              aria-required="true" />
            <FieldError message={errors.requiredQual} />
          </div>

          <div>
            <label htmlFor="i-preferred" className={LBL}>우대사항</label>
            <textarea id="i-preferred" value={preferred} onChange={(e) => setPreferred(e.target.value)} rows={2}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder="예: 약사 면허 보유자 / 영어 커뮤니케이션 가능자 (한 줄에 하나씩)" />
          </div>
        </SectionCard>

        {/* ── §3 근무조건 ───────────────────────────────────────────────────── */}
        <SectionCard
          title="근무조건"
          description="근무지, 근무 방식, 급여와 복리후생을 입력합니다."
          status={errors.workRegion || errors.workMode || errors.address || errors.workSchedule ? "필수 입력 필요" : "작성 중"}
        >
          <div className="mb-5">
            <SegControl
              label="근무지 입력"
              options={["기관 대표 주소 불러오기", "직접 입력", "재택/하이브리드"]}
              value={workplaceMode}
              onChange={setWorkplaceMode}
            />
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div ref={setRef("workRegion")}>
              <label htmlFor="i-region" className={LBL}>근무지역{REQ}</label>
              <input id="i-region" value={workRegion} onChange={(e) => setWorkRegion(e.target.value)}
                className={IN} aria-required="true" />
              <FieldError message={errors.workRegion} />
            </div>
            <div ref={setRef("workMode")}>
              <label htmlFor="i-workmode" className={LBL}>근무 방식{REQ}</label>
              <select id="i-workmode" value={workMode} onChange={(e) => setWorkMode(e.target.value)}
                className={SEL} aria-required="true">
                <option value="" disabled>근무 방식을 선택해 주세요</option>
                <option>사무실 근무</option>
                <option>현장 근무</option>
                <option>사무실·현장</option>
                <option>재택</option>
                <option>하이브리드</option>
              </select>
              <FieldError message={errors.workMode} />
            </div>
          </div>

          <div className="mb-5" ref={setRef("address")}>
            <label htmlFor="i-address" className={LBL}>주소{REQ}</label>
            <input id="i-address" value={address} onChange={(e) => setAddress(e.target.value)}
              className={IN} aria-required="true" />
            {!address.trim() && (
              <div className="mt-2 flex items-center gap-1.5 border border-[#f1dcb7] bg-[#fff9ef] px-3 py-1.5 text-[11.5px] text-[#9a6b00]">
                <AlertCircle size={13} aria-hidden />
                기관정보에 가까운 역·교통 정보가 비어 있습니다. 비어있으면 상세에 노출되지 않습니다.
              </div>
            )}
            <FieldError message={errors.address} />
          </div>

          <div className="my-5 border-t border-[#f0f2f5]" />

          <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div ref={setRef("workSchedule")}>
              <label htmlFor="i-schedule" className={LBL}>근무 요일/시간{REQ}</label>
              <input id="i-schedule" value={workSchedule} onChange={(e) => setWorkSchedule(e.target.value)}
                className={IN} placeholder="예: 주 5일, 09:00~18:00" aria-required="true" />
              <FieldError message={errors.workSchedule} />
            </div>
            <div>
              <label htmlFor="i-salary" className={LBL}>급여</label>
              <input id="i-salary" value={salary} onChange={(e) => setSalary(e.target.value)}
                className={IN} placeholder="예: 회사 내규에 따름 / 연봉 5,500만~7,000만원" />
            </div>
          </div>

          <div className="mb-5">
            <ChipGroup label="복리후생" options={WELFARE_OPTS} selected={welfare}
              onToggle={(item) => setWelfare(toggleSet(welfare, item))} />
          </div>

          <div>
            <label htmlFor="i-workcond" className={LBL}>근무조건 상세</label>
            <textarea id="i-workcond" value={workCondDetail} onChange={(e) => setWorkCondDetail(e.target.value)} rows={3}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder="예: 다국적 제약사 기준 복리후생 수준을 이용합니다." />
          </div>
        </SectionCard>

        {/* ── §4 키워드 · 이미지 ────────────────────────────────────────────── */}
        <SectionCard
          title="키워드 · 이미지"
          description="검색·추천에 쓰일 키워드와 대표 이미지를 선택합니다. (선택)"
          status="선택 사항"
        >
          <div className="mb-6">
            <p className="mb-1.5 text-[13px] font-medium text-[#2f3845]">
              핵심 키워드
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">최대 {MAX_KW}개</span>
            </p>
            <p className={`${HINT} mb-3`}>
              선택한 직무({kwCatLabel})에 맞춰 추천 키워드가 표시됩니다.
            </p>

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
            <p className="mb-1 text-[12.5px] font-semibold text-[#7b8491]">기타 키워드 직접 추가</p>
            <p className={`${HINT} mb-2`}>추천 목록에 없는 키워드는 직접 입력하세요. (Enter로 추가, 키워드당 20자 이내)</p>
            <div className="flex gap-2">
              <input
                value={customKwInput}
                onChange={(e) => setCustomKwInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomKeyword(); } }}
                maxLength={20}
                placeholder="예: ICH-GCP"
                className={`${IN} flex-1`}
                aria-label="키워드 직접 입력"
              />
              <button type="button" onClick={addCustomKeyword}
                disabled={keywords.size >= MAX_KW}
                className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:border-[#dfe4ea] disabled:text-[#aeb6c0]">
                ＋ 추가
              </button>
            </div>

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
              선택됨 {keywords.size}개 · 공고 목록에는 최대 3개가 노출됩니다.
            </p>
          </div>

          {/* 대표 이미지 */}
          <div>
            <p className={LBL} id="i-img-lbl">대표 이미지</p>
            <div role="radiogroup" aria-labelledby="i-img-lbl" className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
              {(["default", "upload", "none"] as const).map((opt) => {
                const labels = {
                  default: "기관 기본 이미지 사용",
                  upload:  "새 이미지 업로드",
                  none:    "대표 이미지 사용 안 함",
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
        <SectionCard
          title="지원방법 및 마감일"
          description="지원 방식에 따라 공고 상세에 필요한 정보가 노출됩니다."
          status={errors.applyTarget || errors.deadline ? "필수 입력 필요" : "작성 중"}
        >
          <div className="mb-5">
            <SegControl
              label="지원 방식"
              required
              options={["기업 홈페이지 지원", "더팜인 간편지원", "이메일 지원"]}
              value={applyMethod === "url" ? "기업 홈페이지 지원" : applyMethod === "quick" ? "더팜인 간편지원" : "이메일 지원"}
              onChange={(v) =>
                setApplyMethod(
                  v === "기업 홈페이지 지원" ? "url" : v === "더팜인 간편지원" ? "quick" : "email",
                )
              }
            />
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            {applyMethod !== "quick" ? (
              <div ref={setRef("applyTarget")}>
                <label htmlFor="i-apply-target" className={LBL}>
                  {applyMethod === "url" ? "지원 페이지 URL" : "지원 이메일 주소"}{REQ}
                </label>
                <input id="i-apply-target" type={applyMethod === "url" ? "url" : "email"}
                  value={applyTarget} onChange={(e) => setApplyTarget(e.target.value)}
                  className={IN}
                  placeholder={applyMethod === "url" ? "예: https://company.com/careers/..." : "예: recruit@company.com"}
                  aria-required="true" />
                <FieldError message={errors.applyTarget} />
              </div>
            ) : (
              <div>
                <InlineNote>
                  더팜인 간편지원은 더팜인 리크루트 지원자로 연동됩니다. 별도 URL·이메일이 필요 없습니다.
                </InlineNote>
              </div>
            )}

            <div ref={setRef("deadline")}>
              <label htmlFor="i-deadline" className={LBL}>
                {rollingToggle ? "마감 예정일" : <>지원 마감일{REQ}</>}
              </label>
              <input id="i-deadline" type="date" value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={rollingToggle}
                className={clsx(IN, rollingToggle && "cursor-not-allowed opacity-45")}
                aria-required={!rollingToggle ? "true" : undefined} />
              <FieldError message={errors.deadline} />
            </div>
          </div>

          <ToggleRow
            title="채용 시 마감(조기 마감 가능)"
            description="지정 마감일과 별개로, 채용이 완료되면 조기 마감합니다. 켜면 마감일을 '예정일'로 표시됩니다."
            checked={rollingToggle}
            onChange={setRollingToggle}
            ariaLabel="채용 시 마감"
          />

          <div className="mt-4">
            <InlineNote>
              이미지·포스터를 첨부할 수 있지만, 검색·추천을 위해 주요업무·자격조건·근무조건은 반드시 입력해 주세요.
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
