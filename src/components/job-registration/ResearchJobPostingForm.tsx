"use client";

import clsx from "clsx";
import { AlertCircle, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { SectionCard } from "@/components/business/BusinessFormControls";
import { companyExampleImages } from "@/config/companyImages";
import { researchFieldCategoryOptions } from "@/config/researchFields";
import type { LabInstitutionType, ResearchApplyVia } from "@/types/jobs";

// ── Types ──────────────────────────────────────────────────────────────────────

type FieldGroup = (typeof researchFieldCategoryOptions)[number]["id"];
type LocationScope = "국내" | "해외";
type SalaryKindR = "연봉" | "협의";

// ── Static data ────────────────────────────────────────────────────────────────

const RECRUIT_TYPES = ["PostDoc", "연구교수", "전임연구원", "연구원", "석사연구원", "연구조교", "인턴연구원"] as const;

const DEGREE_OPTIONS = ["박사", "박사수료", "박사예정", "석사", "석사수료", "석사예정"] as const;

const HEADCOUNT_OPTIONS = ["1명", "2명", "3명", "4명 이상", "미정"] as const;

const DOMESTIC_REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
] as const;

const INSTITUTION_TYPES: LabInstitutionType[] = ["대학(의대제외)", "의과대학", "병원", "정부출연연", "기업부설연", "기타"];

const APPLY_VIA_OPTIONS: ResearchApplyVia[] = ["이메일", "기관홈페이지", "플랫폼"];

const PRESET_BENEFITS = [
  "4대 보험", "퇴직금", "연차", "성과급", "해외학회 참석 지원", "국내학회 참석 지원",
  "연구장비 지원", "논문 게재 지원", "건강검진", "식대 지원", "진료비 지원", "주차 지원",
];

const MAX_KEYWORDS = 8;
const DEFAULT_LAB_IMAGE = companyExampleImages.research;

const mockLab = {
  institution: "서울아산병원",
  institutionType: "병원" as LabInstitutionType,
  displayName: "서울아산병원 대장항문외과",
};

// ── Style constants ────────────────────────────────────────────────────────────

const IN =
  "h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8";
const SEL = `${IN} appearance-none pr-8`;
const TA = `${IN} h-auto resize-y py-2.5 leading-relaxed`;
const LBL = "block mb-1.5 text-[13px] font-medium text-[#2f3845]";
const HINT = "mt-1 text-[11.5px] text-[#a0a9b7]";
const SUB = "mb-5 pb-5 border-b border-[#f0f2f5] last:mb-0 last:pb-0 last:border-b-0";
const REQ = (
  <span className="ml-1 text-danger" aria-hidden>*</span>
);
const ChevronSvg = (
  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a95a5]" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

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

function SelectWrap({ id, value, onChange, required, children }: {
  id?: string; value: string; onChange: (v: string) => void; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className={SEL} aria-required={required || undefined}>
        {children}
      </select>
      {ChevronSvg}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-[15px] font-bold tracking-[-0.01em] text-[#2f3845]">{children}</h3>;
}

/** 2-panel 전공분야 선택기 */
function ResearchFieldPicker({ selected, onToggle, error }: {
  selected: Set<string>; onToggle: (id: string) => void; error?: string;
}) {
  const [activeGroup, setActiveGroup] = useState<FieldGroup>(researchFieldCategoryOptions[0].id as FieldGroup);
  const groupData = researchFieldCategoryOptions.find((g) => g.id === activeGroup);

  return (
    <div>
      <p className="mb-2 text-[13px] font-medium text-[#2f3845]">
        전공분야{REQ}
        <span className="ml-2 text-[12px] font-normal text-[#7b8491]">대분류 선택 후 세부 전공을 고르세요. 복수 선택 가능.</span>
      </p>
      <div className="grid grid-cols-[160px_1fr] border border-[#d8e0e8] max-[640px]:grid-cols-1">
        <div role="radiogroup" aria-label="전공 대분류"
          className="border-r border-[#dfe4ea] bg-[#fbfcfd] max-[640px]:border-b max-[640px]:border-r-0">
          {researchFieldCategoryOptions.map((group) => (
            <button key={group.id} type="button" role="radio" aria-checked={activeGroup === group.id}
              onClick={() => setActiveGroup(group.id as FieldGroup)}
              className={clsx(
                "block w-full border-b border-[#f0f2f5] px-3.5 py-2.5 text-left text-[13px] font-medium last:border-b-0 transition-colors",
                activeGroup === group.id ? "bg-[#111111] text-white" : "text-[#4f5967] hover:bg-[#f5f6f7]",
              )}>
              {group.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-[#4f5967]">{groupData?.label} · 세부 전공</p>
          <div role="group" aria-label="세부 전공" className="flex flex-wrap gap-2">
            {groupData?.subcategories.map((sub) => {
              const on = selected.has(sub.id);
              return (
                <button key={sub.id} type="button" role="checkbox" aria-checked={on} onClick={() => onToggle(sub.id)}
                  className={clsx(
                    "inline-flex h-9 items-center gap-1.5 border px-3.5 text-[12px] font-medium transition-colors",
                    on ? "border-[#111111] bg-[#111111] text-white" : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
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
          선택됨:{" "}
          {Array.from(selected).map((id) => {
            for (const g of researchFieldCategoryOptions) {
              const sub = g.subcategories.find((s) => s.id === id);
              if (sub) return `${g.label} > ${sub.label}`;
            }
            return id;
          }).join(", ")}
        </p>
      )}
      <FieldError message={error} />
    </div>
  );
}

/** 연구 키워드 직접 추가 */
function KeywordInput({ keywords, onAdd, onRemove }: {
  keywords: string[]; onAdd: (kw: string) => void; onRemove: (kw: string) => void;
}) {
  const [input, setInput] = useState("");
  function handleAdd() {
    const v = input.trim();
    if (!v || v.length > 20 || keywords.includes(v) || keywords.length >= MAX_KEYWORDS) return;
    onAdd(v);
    setInput("");
  }
  return (
    <div>
      {keywords.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <button key={kw} type="button" onClick={() => onRemove(kw)} aria-label={`${kw} 키워드 삭제`}
              className="inline-flex h-9 items-center gap-1.5 border border-[#111111] bg-[#111111] px-3.5 text-[12px] font-medium text-white">
              <span className="text-[10px]" aria-hidden>✓</span>
              {kw}
              <X size={11} className="ml-0.5 opacity-70" aria-hidden />
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          maxLength={20} placeholder="예: 오가노이드, CRISPR, NGS, 단백질 구조 분석 …"
          className={`${IN} flex-1`} aria-label="연구 키워드 직접 입력"
          disabled={keywords.length >= MAX_KEYWORDS} />
        <button type="button" onClick={handleAdd} disabled={keywords.length >= MAX_KEYWORDS}
          className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:border-[#dfe4ea] disabled:text-[#aeb6c0]">
          ＋ 추가
        </button>
      </div>
      <p className={HINT}>{keywords.length}/{MAX_KEYWORDS}개 · Enter 또는 추가 버튼으로 입력. 키워드당 20자 이내.</p>
    </div>
  );
}

/** 연구비·과제 배열 항목 추가 (키워드와 동일 패턴) */
function FundingInput({ items, onAdd, onRemove }: {
  items: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void;
}) {
  const [input, setInput] = useState("");
  function handleAdd() {
    const v = input.trim();
    if (!v || items.includes(v)) return;
    onAdd(v);
    setInput("");
  }
  return (
    <div>
      {items.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <button key={item} type="button" onClick={() => onRemove(item)} aria-label={`${item} 삭제`}
              className="inline-flex h-8 items-center gap-1.5 border border-[#d8e0e8] bg-[#f7f8fa] px-3 text-[12px] font-medium text-[#4f5967]">
              {item}
              <X size={11} className="opacity-60" aria-hidden />
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          placeholder="예: 국책과제, 한국연구재단 기초연구사업 …"
          className={`${IN} flex-1`} aria-label="연구비·과제 직접 입력" />
        <button type="button" onClick={handleAdd}
          className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] hover:bg-[#f7f8fa]">
          ＋ 추가
        </button>
      </div>
      <p className={HINT}>연구비·과제 출처를 하나씩 추가합니다. 상세 페이지에 별도 표시됩니다.</p>
    </div>
  );
}

/** 근무지 지도 자리표시자 (SDK 없음) */
function MapPlaceholder({ address }: { address: string }) {
  return (
    <div className="overflow-hidden border border-[#dce4ec] bg-[#f7f8fa]">
      <div className="relative h-[140px] bg-[linear-gradient(135deg,#eef2f5_0%,#f8fafb_45%,#e9eef2_100%)]">
        <div className="absolute left-6 top-5 h-px w-[calc(100%-48px)] bg-white" />
        <div className="absolute left-6 top-16 h-px w-[calc(100%-48px)] bg-white" />
        <div className="absolute left-6 top-[104px] h-px w-[calc(100%-48px)] bg-white" />
        <div className="absolute left-16 top-4 h-[calc(100%-32px)] w-px bg-white" />
        <div className="absolute right-20 top-4 h-[calc(100%-32px)] w-px bg-white" />
        <div className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#111111] text-[11px] font-medium text-white shadow-[0_8px_18px_rgba(0,0,0,0.16)]">
          위치
        </div>
      </div>
      <div className="border-t border-[#dce4ec] bg-white px-4 py-2.5">
        <p className="text-[12px] font-normal text-[#7d8796]">{address || "주소를 입력하면 지도에 표시됩니다."}</p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ResearchJobPostingForm() {
  // §1 기본 정보
  const [title, setTitle] = useState("");
  const [recruitType, setRecruitType] = useState("");
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [degree, setDegree] = useState("");
  const [headcount, setHeadcount] = useState("");
  const [locationScope, setLocationScope] = useState<LocationScope>("국내");
  const [locationRegion, setLocationRegion] = useState("");

  // §2 포지션 소개
  const [oneLineIntro, setOneLineIntro] = useState("");
  const [introduction, setIntroduction] = useState("");

  // §3 연구 내용
  const [researchTopics, setResearchTopics] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  // §4 지원 자격
  const [requirements, setRequirements] = useState("");
  const [preferred, setPreferred] = useState("");

  // §5 근무·지원 — 근무지 추가 필드
  const [locationAddress, setLocationAddress] = useState("");
  const [locationDetail, setLocationDetail] = useState("");
  const [locationSecondment, setLocationSecondment] = useState("");

  // §5 근무·지원 — 급여 및 연구비·과제
  const [salaryKind, setSalaryKind] = useState<SalaryKindR>("연봉");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryNote, setSalaryNote] = useState("");
  const [fundingItems, setFundingItems] = useState<string[]>([]);

  // §5 근무·지원 — 복리후생
  const [selectedBenefits, setSelectedBenefits] = useState<Set<string>>(new Set());
  const [customBenefits, setCustomBenefits] = useState<string[]>([]);
  const [customBenefitInput, setCustomBenefitInput] = useState("");

  // §6 전형절차 & 제출서류
  const [hiringSteps, setHiringSteps] = useState(["서류전형", "면접전형"]);
  const [researchDocuments, setResearchDocuments] = useState("");

  // §7 연구실 정보
  const [labInstitutionType, setLabInstitutionType] = useState<LabInstitutionType | "">(mockLab.institutionType);
  const [labInstitution, setLabInstitution] = useState(mockLab.institution);
  const [labName, setLabName] = useState("");
  const [labPi, setLabPi] = useState("");
  const [labAddress, setLabAddress] = useState("");
  const [labHomepage, setLabHomepage] = useState("");
  const [labCareerPage, setLabCareerPage] = useState("");
  const [labInstitutionIntro, setLabInstitutionIntro] = useState("");
  const [labIntro, setLabIntro] = useState("");

  // §8 지원 방법 및 마감일
  const [applyVia, setApplyVia] = useState<ResearchApplyVia | "">("");
  const [contactEmail, setContactEmail] = useState("");
  const [deadlineMode, setDeadlineMode] = useState<"date" | "untilHired">("date");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [imageMode, setImageMode] = useState<"company" | "upload" | "none">("company");

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState("저장 전");
  const [notice, setNotice] = useState("");
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const setRef = (key: string) => (el: HTMLElement | null) => { fieldRefs.current[key] = el; };
  const scopeId = useId();
  const salaryKindId = useId();

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function toggleField(id: string) {
    setSelectedFields((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function toggleBenefit(item: string) {
    setSelectedBenefits((prev) => { const n = new Set(prev); if (n.has(item)) n.delete(item); else n.add(item); return n; });
  }
  function addCustomBenefit() {
    const v = customBenefitInput.trim();
    if (!v || customBenefits.includes(v) || selectedBenefits.has(v)) return;
    setCustomBenefits((prev) => [...prev, v]);
    setSelectedBenefits((prev) => new Set([...prev, v]));
    setCustomBenefitInput("");
  }
  function removeCustomBenefit(item: string) {
    setCustomBenefits((prev) => prev.filter((b) => b !== item));
    setSelectedBenefits((prev) => { const n = new Set(prev); n.delete(item); return n; });
  }

  // ── Validation ────────────────────────────────────────────────────────────────

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim())            next.title            = "공고 제목을 입력해 주세요.";
    if (!recruitType)             next.recruitType      = "채용 형태를 선택해 주세요.";
    if (selectedFields.size === 0) next.selectedFields  = "전공분야를 하나 이상 선택해 주세요.";
    if (!degree)                  next.degree           = "최종학력을 선택해 주세요.";
    if (!headcount)               next.headcount        = "채용 인원을 선택해 주세요.";
    if (!locationRegion.trim())   next.locationRegion   = locationScope === "국내" ? "시·도를 선택해 주세요." : "근무 국가를 입력해 주세요.";
    if (!oneLineIntro.trim())     next.oneLineIntro     = "한 줄 소개를 입력해 주세요.";
    if (!introduction.trim())     next.introduction     = "포지션 소개 본문을 입력해 주세요.";
    if (!researchTopics.trim())   next.researchTopics   = "연구 주제를 하나 이상 입력해 주세요.";
    if (!responsibilities.trim()) next.responsibilities = "담당 업무를 하나 이상 입력해 주세요.";
    if (!requirements.trim())     next.requirements     = "지원 자격을 입력해 주세요.";
    if (!locationAddress.trim())  next.locationAddress  = "기관 주소를 입력해 주세요.";
    if (!salaryKind)              next.salaryKind       = "급여 표기를 선택해 주세요.";
    if (salaryKind === "연봉" && !salaryMin.trim()) next.salaryMin = "최소 연봉을 입력해 주세요.";
    if (!researchDocuments.trim()) next.researchDocuments = "제출서류를 입력해 주세요.";
    if (!labInstitution.trim())   next.labInstitution   = "기관명을 입력해 주세요.";
    if (!labInstitutionType)      next.labInstitutionType = "기관 분류를 선택해 주세요.";
    if (!labPi.trim())            next.labPi            = "PI(책임자명)를 입력해 주세요.";
    if (!applyVia)                next.applyVia         = "지원 방식을 선택해 주세요.";
    if (deadlineMode === "date" && !deadlineDate) next.deadlineDate = "마감일을 선택해 주세요.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      const el = fieldRefs.current[Object.keys(next)[0]];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.querySelector<HTMLElement>("input,select,textarea,button")?.focus();
      }
    }
    return Object.keys(next).length === 0;
  }

  function saveDraft() {
    const now = new Date();
    setSaveStatus(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} 임시 저장됨`);
    setNotice("작성 중인 공고가 브라우저 상태에 임시 저장되었습니다.");
  }
  function showPreview() { setNotice("미리보기 화면을 열 준비가 되었습니다. 현재 입력된 내용 기준으로 표시됩니다."); }
  function publish() {
    if (!validate()) { setNotice("필수 항목을 모두 입력해야 게시할 수 있습니다."); return; }
    setNotice("공고 등록 완료 처리는 추후 연결 예정입니다.");
  }

  // ── Section error checks ──────────────────────────────────────────────────────

  const s1Err = Boolean(errors.title || errors.recruitType || errors.selectedFields || errors.degree || errors.headcount || errors.locationRegion);
  const s2Err = Boolean(errors.oneLineIntro || errors.introduction);
  const s3Err = Boolean(errors.researchTopics || errors.responsibilities);
  const s4Err = Boolean(errors.requirements);
  const s5Err = Boolean(errors.locationAddress || errors.salaryKind || errors.salaryMin);
  const s6Err = Boolean(errors.researchDocuments);
  const s7Err = Boolean(errors.labInstitution || errors.labInstitutionType || errors.labPi);
  const s8Err = Boolean(errors.applyVia || errors.deadlineDate);

  // ── Render ────────────────────────────────────────────────────────────────────

  const allBenefits = Array.from(new Set([...PRESET_BENEFITS, ...customBenefits]));

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between gap-5 max-[760px]:flex-col">
        <div>
          <PageBreadcrumb
            items={[{ label: "기업센터", href: "/business/dashboard" }, { label: "채용관리" }, { label: "연구 공고 등록" }]}
          />
          <h1 className="mt-5 flex flex-wrap items-center gap-3 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">
            연구 공고 등록
            <span className="inline-flex items-center gap-1.5 border border-[#dfe4ea] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#4f5967]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0d7369]" aria-hidden />
              {mockLab.displayName} 명의로 작성 중 ·{" "}
              <Link href="/business/company/profile" className="ml-0.5 font-bold text-[#0d7369] underline-offset-2 hover:underline">기관정보</Link>
            </span>
          </h1>
          <p className="mt-2 text-[13px] font-normal text-[#68717e]">연구직 채용 공고를 등록합니다. 입력한 내용은 공고 상세 페이지에 그대로 노출됩니다.</p>
        </div>
      </div>

      {/* Notice banner */}
      {notice && (
        <div className="mt-6 flex items-center justify-between border border-[#dddddd] bg-[#f0f9f7] px-4 py-3 text-[13px] font-medium text-[#0d7369]">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="알림 닫기"><X size={16} /></button>
        </div>
      )}

      <div className="mt-8 space-y-5">

        {/* ── §1 기본 정보 ─────────────────────────────────────────────────── */}
        <SectionCard title="기본 정보" description="공고 제목과 채용 형태, 전공분야, 모집 조건을 입력합니다."
          status={s1Err ? "필수 입력 필요" : "작성 중"}>

          <div className="mb-5" ref={setRef("title")}>
            <label htmlFor="r-title" className={LBL}>공고 제목{REQ}</label>
            <input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)}
              className={IN} placeholder="예: [서울아산병원] 대장항문외과 박사후연구원(PostDoc) 모집" aria-required="true" />
            <FieldError message={errors.title} />
          </div>

          <div className="mb-5" ref={setRef("recruitType")}>
            <label htmlFor="r-recruit-type" className={LBL}>채용 형태{REQ}</label>
            <SelectWrap id="r-recruit-type" value={recruitType} onChange={setRecruitType} required>
              <option value="" disabled>채용 형태를 선택해 주세요</option>
              {RECRUIT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </SelectWrap>
            <p className={HINT}>고용형태(정규/계약)가 아닌 연구 직위 유형입니다.</p>
            <FieldError message={errors.recruitType} />
          </div>

          <div className="mb-5" ref={setRef("selectedFields")}>
            <ResearchFieldPicker selected={selectedFields} onToggle={toggleField} error={errors.selectedFields} />
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div ref={setRef("degree")}>
              <label htmlFor="r-degree" className={LBL}>최종학력{REQ}</label>
              <SelectWrap id="r-degree" value={degree} onChange={setDegree} required>
                <option value="" disabled>학력 요건을 선택해 주세요</option>
                {DEGREE_OPTIONS.map((d) => <option key={d}>{d}</option>)}
              </SelectWrap>
              <FieldError message={errors.degree} />
            </div>
            <div ref={setRef("headcount")}>
              <label htmlFor="r-headcount" className={LBL}>채용 인원{REQ}</label>
              <SelectWrap id="r-headcount" value={headcount} onChange={setHeadcount} required>
                <option value="" disabled>인원을 선택해 주세요</option>
                {HEADCOUNT_OPTIONS.map((h) => <option key={h}>{h}</option>)}
              </SelectWrap>
              <FieldError message={errors.headcount} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div>
              <p id={scopeId} className={LBL}>근무 범위{REQ}</p>
              <div role="radiogroup" aria-labelledby={scopeId} className="inline-flex overflow-hidden border border-[#d8e0e8]">
                {(["국내", "해외"] as const).map((scope) => (
                  <button key={scope} type="button" role="radio" aria-checked={locationScope === scope}
                    onClick={() => { setLocationScope(scope); setLocationRegion(""); }}
                    className={clsx("h-11 border-r border-[#d8e0e8] px-7 text-[13px] font-medium last:border-r-0 transition-colors",
                      locationScope === scope ? "bg-[#111111] text-white" : "bg-white text-[#4f5967] hover:bg-[#f7f8fa]")}>
                    {scope}
                  </button>
                ))}
              </div>
            </div>
            <div ref={setRef("locationRegion")}>
              {locationScope === "국내" ? (
                <>
                  <label htmlFor="r-region" className={LBL}>근무지역(시·도){REQ}</label>
                  <SelectWrap id="r-region" value={locationRegion} onChange={setLocationRegion} required>
                    <option value="" disabled>시·도를 선택해 주세요</option>
                    {DOMESTIC_REGIONS.map((r) => <option key={r}>{r}</option>)}
                  </SelectWrap>
                </>
              ) : (
                <>
                  <label htmlFor="r-country" className={LBL}>근무 국가{REQ}</label>
                  <input id="r-country" value={locationRegion} onChange={(e) => setLocationRegion(e.target.value)}
                    placeholder="예: 미국, 독일, 영국" className={IN} aria-required="true" />
                </>
              )}
              <FieldError message={errors.locationRegion} />
            </div>
          </div>
        </SectionCard>

        {/* ── §2 포지션 소개 ────────────────────────────────────────────────── */}
        <SectionCard title="포지션 소개" description="공고 목록 상단과 상세 페이지에 노출되는 포지션 설명을 입력합니다."
          status={s2Err ? "필수 입력 필요" : "작성 중"}>

          <div className="mb-5" ref={setRef("oneLineIntro")}>
            <label htmlFor="r-oneline" className={LBL}>한 줄 소개{REQ}</label>
            <input id="r-oneline" value={oneLineIntro} onChange={(e) => setOneLineIntro(e.target.value.slice(0, 120))}
              placeholder="예: 대장암 오가노이드·PDX 모델 기반 종양 연구를 함께할 연구원을 찾습니다."
              className={IN} aria-required="true" maxLength={120} />
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <p className={HINT}>공고 목록과 상세 상단에 노출되는 요약 문장입니다.</p>
              <span className="text-[11.5px] text-[#a0a9b7]">{oneLineIntro.length} / 120</span>
            </div>
            <FieldError message={errors.oneLineIntro} />
          </div>

          <div ref={setRef("introduction")}>
            <label htmlFor="r-intro" className={LBL}>포지션 소개 본문{REQ}</label>
            <textarea id="r-intro" value={introduction} onChange={(e) => setIntroduction(e.target.value)} rows={6}
              placeholder={"연구실 및 포지션에 대한 전반적인 소개를 자유롭게 작성해 주세요.\n예: 저희 연구실은 …을 연구하고 있으며, 이번 채용을 통해 …을 함께 진행할 열정 있는 연구원을 찾습니다."}
              className={TA} aria-required="true" />
            <FieldError message={errors.introduction} />
          </div>
        </SectionCard>

        {/* ── §3 연구 내용 ──────────────────────────────────────────────────── */}
        <SectionCard title="연구 내용" description="연구 주제, 담당 업무, 연구 키워드를 입력합니다."
          status={s3Err ? "필수 입력 필요" : "작성 중"}>

          <div className="mb-5" ref={setRef("researchTopics")}>
            <label htmlFor="r-topics" className={LBL}>연구 주제{REQ}</label>
            <p className={`${HINT} mb-1.5`}>한 줄에 하나씩 입력하면 항목으로 표시됩니다.</p>
            <textarea id="r-topics" value={researchTopics} onChange={(e) => setResearchTopics(e.target.value)} rows={4}
              placeholder={"대장암 오가노이드 기반 약물 반응성 연구\nPDX 모델을 이용한 종양 미세환경 분석\n단일세포 시퀀싱 데이터 분석 및 해석"}
              className={TA} aria-required="true" />
            <FieldError message={errors.researchTopics} />
          </div>

          <div className="mb-5" ref={setRef("responsibilities")}>
            <label htmlFor="r-duties" className={LBL}>담당 업무{REQ}</label>
            <p className={`${HINT} mb-1.5`}>한 줄에 하나씩 입력하면 항목으로 표시됩니다.</p>
            <textarea id="r-duties" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={4}
              placeholder={"환자 유래 오가노이드·PDX 모델 수립 및 유지\n약물 조합 스크리닝 및 반응성 데이터 분석\n분자생물학 실험 수행 (PCR, WB, IHC, FACS 등)\n연구 결과 논문화 및 학회 발표 지원"}
              className={TA} aria-required="true" />
            <FieldError message={errors.responsibilities} />
          </div>

          <div>
            <p className={LBL}>연구 키워드
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">최대 {MAX_KEYWORDS}개 · 선택 사항</span>
            </p>
            <KeywordInput keywords={keywords} onAdd={(kw) => setKeywords((p) => [...p, kw])} onRemove={(kw) => setKeywords((p) => p.filter((k) => k !== kw))} />
          </div>
        </SectionCard>

        {/* ── §4 지원 자격 ──────────────────────────────────────────────────── */}
        <SectionCard title="지원 자격" description="지원 자격(필수)과 우대 사항(선택)을 입력합니다."
          status={s4Err ? "필수 입력 필요" : "작성 중"}>

          <div className="mb-5" ref={setRef("requirements")}>
            <label htmlFor="r-req" className={LBL}>지원 자격{REQ}</label>
            <p className={`${HINT} mb-1.5`}>한 줄에 하나씩 입력하면 항목으로 표시됩니다.</p>
            <textarea id="r-req" value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={4}
              placeholder={"생명과학 또는 의약학 관련 전공 박사수료 이상\n세포·동물 모델 실험 경험 보유"}
              className={TA} aria-required="true" />
            <FieldError message={errors.requirements} />
          </div>

          <div>
            <label htmlFor="r-pref" className={LBL}>우대 사항
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
            </label>
            <p className={`${HINT} mb-1.5`}>한 줄에 하나씩 입력하세요.</p>
            <textarea id="r-pref" value={preferred} onChange={(e) => setPreferred(e.target.value)} rows={3}
              placeholder={"오가노이드 또는 PDX 모델 구축 경험 보유자\n종양·유전체 연구 관련 논문 게재 경험 보유자"}
              className={TA} />
          </div>
        </SectionCard>

        {/* ── §5 근무·지원 ──────────────────────────────────────────────────── */}
        <SectionCard title="근무·지원" description="근무지, 급여 및 연구비, 복리후생을 입력합니다."
          status={s5Err ? "필수 입력 필요" : "작성 중"}>

          {/* 근무지 */}
          <div className={SUB}>
            <SectionLabel>근무지</SectionLabel>

            {/* §1 값 읽기 전용 표시 */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex h-9 items-center border border-[#d8e0e8] bg-[#f7f8fa] px-3.5 text-[12px] font-medium text-[#4f5967]">
                {locationScope}
              </span>
              {locationRegion && (
                <span className="inline-flex h-9 items-center border border-[#d8e0e8] bg-[#f7f8fa] px-3.5 text-[12px] font-medium text-[#4f5967]">
                  {locationScope === "국내" ? locationRegion : `국가: ${locationRegion}`}
                </span>
              )}
              <span className="self-center text-[11.5px] text-[#a0a9b7]">기본 정보에서 입력한 값 · 수정하려면 §1로 이동하세요.</span>
            </div>

            <div className="mb-4" ref={setRef("locationAddress")}>
              <label htmlFor="r-addr" className={LBL}>기관 주소{REQ}</label>
              <input id="r-addr" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="예: 서울 송파구 올림픽로 43길 88"
                className={IN} aria-required="true" />
              <FieldError message={errors.locationAddress} />
            </div>

            <div className="mb-4">
              <label htmlFor="r-detail" className={LBL}>캠퍼스·건물
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
              </label>
              <input id="r-detail" value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="예: 의공학연구동 3층 302호"
                className={IN} />
            </div>

            {locationScope === "해외" && (
              <div className="mb-4">
                <label htmlFor="r-secondment" className={LBL}>비자·이주 안내
                  <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
                </label>
                <input id="r-secondment" value={locationSecondment} onChange={(e) => setLocationSecondment(e.target.value)}
                  placeholder="예: J-1 비자 스폰서 가능, 이주비 지원 별도 안내"
                  className={IN} />
              </div>
            )}

            <MapPlaceholder address={locationAddress} />
          </div>

          {/* 급여 및 연구비·과제 */}
          <div className={SUB}>
            <SectionLabel>급여 및 연구비·과제</SectionLabel>

            <div className="mb-4" ref={setRef("salaryKind")}>
              <p id={salaryKindId} className={LBL}>급여 표기{REQ}</p>
              <div role="radiogroup" aria-labelledby={salaryKindId} className="inline-flex overflow-hidden border border-[#d8e0e8]">
                {(["연봉", "협의"] as const).map((kind) => (
                  <button key={kind} type="button" role="radio" aria-checked={salaryKind === kind}
                    onClick={() => setSalaryKind(kind)}
                    className={clsx("h-11 border-r border-[#d8e0e8] px-8 text-[13px] font-medium last:border-r-0 transition-colors",
                      salaryKind === kind ? "bg-[#111111] text-white" : "bg-white text-[#4f5967] hover:bg-[#f7f8fa]")}>
                    {kind === "협의" ? "면접 후 결정" : kind}
                  </button>
                ))}
              </div>
              <FieldError message={errors.salaryKind} />
            </div>

            {salaryKind === "연봉" && (
              <div className="mb-4 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                <div ref={setRef("salaryMin")}>
                  <label htmlFor="r-sal-min" className={LBL}>최소 연봉 (만원){REQ}</label>
                  <input id="r-sal-min" type="number" min={0} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="예: 4000" className={IN} aria-required="true" />
                  <FieldError message={errors.salaryMin} />
                </div>
                <div>
                  <label htmlFor="r-sal-max" className={LBL}>최대 연봉 (만원)
                    <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
                  </label>
                  <input id="r-sal-max" type="number" min={0} value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="예: 6000" className={IN} />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="r-sal-note" className={LBL}>급여 비고
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
              </label>
              <input id="r-sal-note" value={salaryNote} onChange={(e) => setSalaryNote(e.target.value)}
                placeholder="예: 경력 및 연구실 내규에 따라 협의, 첫 1개월 수습 기간 90% 지급"
                className={IN} />
            </div>

            <div>
              <p className={LBL}>연구비·과제
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
              </p>
              <FundingInput
                items={fundingItems}
                onAdd={(v) => setFundingItems((p) => [...p, v])}
                onRemove={(v) => setFundingItems((p) => p.filter((i) => i !== v))}
              />
            </div>
          </div>

          {/* 복리후생 */}
          <div>
            <SectionLabel>복리후생
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
            </SectionLabel>

            <div role="group" aria-label="복리후생 선택" className="mb-3 flex flex-wrap gap-2">
              {allBenefits.map((item) => {
                const on = selectedBenefits.has(item);
                const isCustom = customBenefits.includes(item);
                return (
                  <button key={item} type="button" role="checkbox" aria-checked={on}
                    onClick={() => on && isCustom ? removeCustomBenefit(item) : toggleBenefit(item)}
                    className={clsx(
                      "inline-flex h-9 items-center gap-1.5 border px-3.5 text-[12px] font-medium transition-colors",
                      on ? "border-[#111111] bg-[#111111] text-white" : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
                    )}>
                    {on && <span className="text-[10px]" aria-hidden>✓</span>}
                    {item}
                    {isCustom && on && <X size={11} className="ml-0.5 opacity-70" aria-hidden />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input value={customBenefitInput} onChange={(e) => setCustomBenefitInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomBenefit(); } }}
                placeholder="예: 연구용 노트북 지원, 기숙사 제공 …"
                className={`${IN} flex-1`} aria-label="복리후생 직접 입력" />
              <button type="button" onClick={addCustomBenefit}
                className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] hover:bg-[#f7f8fa]">
                ＋ 추가
              </button>
            </div>
            <p className={HINT}>목록에 없는 복리후생은 직접 추가하세요. 상세 페이지에 "+N" 형식으로 표시됩니다.</p>
          </div>
        </SectionCard>

        {/* ── §6 전형절차 & 제출서류 ───────────────────────────────────────── */}
        <SectionCard title="전형절차 & 제출서류" description="전형 단계와 필요 서류를 입력합니다."
          status={s6Err ? "필수 입력 필요" : "작성 중"}>

          <div className="mb-5">
            <p className={LBL}>전형 단계{REQ}</p>
            <div className="space-y-2">
              {hiringSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center bg-[#f4f5f6] text-[13px] font-medium text-[#596373]">{idx + 1}</span>
                  <input value={step}
                    onChange={(e) => setHiringSteps((p) => p.map((s, i) => i === idx ? e.target.value : s))}
                    placeholder={`전형 단계 ${idx + 1}`}
                    className="h-11 flex-1 border border-[#d8e0e8] px-3 text-[13px] font-medium outline-none transition placeholder:text-[#a4adba] hover:border-brand focus:border-brand focus:ring-4 focus:ring-[#111111]/8" />
                  <button type="button"
                    onClick={() => setHiringSteps((p) => p.filter((_, i) => i !== idx))}
                    disabled={hiringSteps.length <= 1}
                    className="grid h-7 w-7 place-items-center text-[#b1bac6] transition hover:bg-status-error-subtle hover:text-danger disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label={`${idx + 1}번째 단계 삭제`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setHiringSteps((p) => [...p, ""])}
              className="mt-2 inline-flex h-10 items-center gap-1.5 border border-[#d8e0e8] bg-white px-4 text-[13px] font-medium text-[#4f5968] transition hover:border-brand hover:text-brand">
              <Plus size={15} />
              단계 추가
            </button>
          </div>

          <div ref={setRef("researchDocuments")}>
            <label htmlFor="r-docs" className={LBL}>제출서류{REQ}</label>
            <textarea id="r-docs" value={researchDocuments} onChange={(e) => setResearchDocuments(e.target.value)} rows={3}
              placeholder={"이력서, 연구계획서(2~3페이지), 대표 논문 1편, 학위증명서\n(모든 서류를 PDF로 취합하여 이메일 제출)"}
              className={TA} aria-required="true" />
            <FieldError message={errors.researchDocuments} />
          </div>
        </SectionCard>

        {/* ── §7 연구실 정보 ────────────────────────────────────────────────── */}
        <SectionCard title="연구실 정보" description="기관·연구실·PI 정보를 입력합니다. 상세 페이지 하단 '연구실 정보' 탭에 노출됩니다."
          status={s7Err ? "필수 입력 필요" : "작성 중"}>

          <div className="mb-4 flex items-center gap-3 border border-[#dfe4ea] bg-[#f7f8fa] px-4 py-3">
            <p className="min-w-0 flex-1 text-[13px] font-medium text-[#303946]">
              기관 정보 불러오기 — <span className="font-normal text-[#667181]">기관 프로필에 등록된 기관명·기관 분류를 자동 입력합니다.</span>
            </p>
            <button type="button"
              onClick={() => { setLabInstitution(mockLab.institution); setLabInstitutionType(mockLab.institutionType); }}
              className="shrink-0 border border-[#d8e0e8] bg-white px-4 py-2 text-[13px] font-medium text-[#303946] transition hover:border-[#111111]">
              불러오기
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div ref={setRef("labInstitutionType")}>
              <label htmlFor="r-lab-type" className={LBL}>기관 분류{REQ}</label>
              <SelectWrap id="r-lab-type" value={labInstitutionType} onChange={(v) => setLabInstitutionType(v as LabInstitutionType)} required>
                <option value="" disabled>기관 분류를 선택해 주세요</option>
                {INSTITUTION_TYPES.map((t) => <option key={t}>{t}</option>)}
              </SelectWrap>
              <FieldError message={errors.labInstitutionType} />
            </div>
            <div ref={setRef("labInstitution")}>
              <label htmlFor="r-lab-inst" className={LBL}>기관명{REQ}</label>
              <input id="r-lab-inst" value={labInstitution} onChange={(e) => setLabInstitution(e.target.value)}
                placeholder="예: 서울아산병원" className={IN} aria-required="true" />
              <FieldError message={errors.labInstitution} />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div>
              <label htmlFor="r-lab-name" className={LBL}>연구실·소속 조직
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
              </label>
              <input id="r-lab-name" value={labName} onChange={(e) => setLabName(e.target.value)}
                placeholder="예: 대장항문외과, 신경생리연구실(뇌과학연구소)" className={IN} />
            </div>
            <div ref={setRef("labPi")}>
              <label htmlFor="r-pi" className={LBL}>PI (책임자명){REQ}</label>
              <input id="r-pi" value={labPi} onChange={(e) => setLabPi(e.target.value)}
                placeholder="예: 박은정, 김철수 교수" className={IN} aria-required="true" />
              <FieldError message={errors.labPi} />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="r-lab-addr" className={LBL}>주소
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
            </label>
            <div className="flex gap-2">
              <input id="r-lab-addr" value={labAddress} onChange={(e) => setLabAddress(e.target.value)}
                placeholder="기관 주소와 다를 경우 직접 입력하세요" className={`${IN} flex-1`} />
              {locationAddress && (
                <button type="button"
                  onClick={() => setLabAddress(locationAddress)}
                  className="shrink-0 border border-[#d8e0e8] bg-white px-4 text-[12px] font-medium text-[#4f5967] transition hover:border-[#111111]">
                  근무지와 동일
                </button>
              )}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div>
              <label htmlFor="r-lab-home" className={LBL}>연구실 홈페이지 URL
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
              </label>
              <input id="r-lab-home" value={labHomepage} onChange={(e) => setLabHomepage(e.target.value)}
                placeholder="https://lab.example.ac.kr" className={IN} />
            </div>
            <div>
              <label htmlFor="r-lab-career" className={LBL}>채용 웹페이지 URL
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
              </label>
              <input id="r-lab-career" value={labCareerPage} onChange={(e) => setLabCareerPage(e.target.value)}
                placeholder="https://example.ac.kr/recruit" className={IN} />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="r-inst-intro" className={LBL}>기관 소개
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
            </label>
            <textarea id="r-inst-intro" value={labInstitutionIntro} onChange={(e) => setLabInstitutionIntro(e.target.value)} rows={3}
              placeholder="기관의 전반적인 소개를 간략히 작성해 주세요. (연구 분야, 규모, 특성 등)"
              className={TA} />
          </div>

          <div>
            <label htmlFor="r-lab-intro" className={LBL}>연구실 소개
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
            </label>
            <textarea id="r-lab-intro" value={labIntro} onChange={(e) => setLabIntro(e.target.value)} rows={3}
              placeholder="이 공고를 게시하는 연구실의 주요 연구 방향, 분위기, 특징을 자유롭게 소개해 주세요."
              className={TA} />
          </div>
        </SectionCard>

        {/* ── §8 지원 방법 및 마감일 ───────────────────────────────────────── */}
        <SectionCard title="지원 방법 및 마감일" description="지원 방식, 마감일, 대표 이미지를 설정합니다."
          status={s8Err ? "필수 입력 필요" : "작성 중"}>

          <div className={SUB}>
            <SectionLabel>지원 방법</SectionLabel>

            <div className="mb-4" ref={setRef("applyVia")}>
              <label htmlFor="r-apply-via" className={LBL}>지원 방식{REQ}</label>
              <SelectWrap id="r-apply-via" value={applyVia} onChange={(v) => setApplyVia(v as ResearchApplyVia)} required>
                <option value="" disabled>지원 방식을 선택해 주세요</option>
                {APPLY_VIA_OPTIONS.map((v) => <option key={v}>{v}</option>)}
              </SelectWrap>
              <FieldError message={errors.applyVia} />
            </div>

            <div>
              <label htmlFor="r-contact-email" className={LBL}>담당자 이메일
                <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항 · 상세 페이지에는 "지원 시 공개"로 표시됩니다.</span>
              </label>
              <input id="r-contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                placeholder="recruit@example.ac.kr" className={IN} />
            </div>
          </div>

          <div className={SUB}>
            <SectionLabel>마감일</SectionLabel>

            <div ref={setRef("deadlineDate")} className="flex items-center gap-4 max-[640px]:flex-col max-[640px]:items-start">
              <input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)}
                disabled={deadlineMode === "untilHired"}
                className={clsx(IN, "w-auto flex-1 max-[640px]:w-full", deadlineMode === "untilHired" && "bg-[#f3f5f7] text-[#9aa4b2]")} />
              <label className="inline-flex h-11 shrink-0 items-center gap-2 text-[13px] font-medium text-[#4c5665]">
                <input type="checkbox" checked={deadlineMode === "untilHired"}
                  onChange={(e) => setDeadlineMode(e.target.checked ? "untilHired" : "date")}
                  className="h-5 w-5 accent-[var(--color-brand)]" />
                채용 시 마감 (조기 마감 가능)
              </label>
            </div>
            <FieldError message={errors.deadlineDate} />
          </div>

          <div>
            <SectionLabel>대표 이미지
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">선택 사항</span>
            </SectionLabel>
            <p className="mb-3 text-[11.5px] text-[#a0a9b7]">공고 상세 상단에 노출되는 커버 이미지입니다.</p>
            <div role="radiogroup" aria-label="대표 이미지 설정" className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
              {([
                { key: "company" as const, label: "기관 기본 이미지 사용" },
                { key: "upload" as const, label: "새 이미지 업로드" },
                { key: "none" as const, label: "이미지 없이 등록" },
              ]).map(({ key, label }) => (
                <button key={key} type="button" role="radio" aria-checked={imageMode === key}
                  onClick={() => setImageMode(key)}
                  className={clsx(
                    "flex h-12 items-center justify-center border text-[13px] font-medium transition-colors",
                    imageMode === key
                      ? "border-[#111111] bg-white text-[#111111] shadow-[inset_0_0_0_1px_#111111]"
                      : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
                  )}>
                  {label}
                </button>
              ))}
            </div>
            {imageMode === "company" && (
              <div className="mt-3 border border-[#dfe7ee] bg-white p-2">
                <img src={DEFAULT_LAB_IMAGE} alt="연구 기본 이미지 미리보기" className="h-[160px] w-full object-cover" />
                <p className="mt-2 text-[11.5px] text-[#7a8594]">기관에 등록된 기본 연구 이미지를 사용합니다.</p>
              </div>
            )}
            {imageMode === "none" && (
              <div className="mt-3 border border-[#dfe7ee] bg-[#fbfcfd] px-4 py-4 text-[13px] font-normal leading-[1.7] text-[#667181]">
                이미지 없이 등록합니다. 상세 페이지에서는 기관 로고와 브랜드 컬러로 기본 커버가 표시됩니다.
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── 하단 버튼 바 ──────────────────────────────────────────────────── */}
        <div className="sticky bottom-0 z-30 border-t border-[#dfe4ea] bg-white/95 px-6 py-4 shadow-[0_-4px_16px_rgba(20,32,46,0.08)] backdrop-blur max-[760px]:px-4">
          <div className="flex items-center justify-between gap-4 max-[640px]:flex-col">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#667181]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
              </svg>
              {saveStatus}
            </div>
            <div className="flex gap-2 max-[640px]:w-full">
              <button type="button" onClick={showPreview}
                className="inline-flex h-11 items-center justify-center border border-[#cfd8e3] bg-white px-7 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] max-[640px]:flex-1">
                미리보기
              </button>
              <button type="button" onClick={saveDraft}
                className="inline-flex h-11 items-center justify-center border border-[#111111] bg-[#111111] px-9 text-[13px] font-medium text-white hover:bg-[#2a2a2a] max-[640px]:flex-1">
                임시 저장
              </button>
              <button type="button" onClick={publish}
                className="inline-flex h-11 items-center justify-center border border-[#111111] bg-[#111111] px-9 text-[13px] font-bold text-white transition hover:bg-[#2a2a2a] max-[640px]:flex-1">
                등록하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
