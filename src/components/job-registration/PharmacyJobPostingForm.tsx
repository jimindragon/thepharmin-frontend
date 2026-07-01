"use client";

import clsx from "clsx";
import { AlertCircle, Info, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { SectionCard } from "@/components/business/BusinessFormControls";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { SalaryDetail } from "@/types/jobs";
import { convertToHourly, formatSalaryDetail, formatWon } from "@/utils/salary";

// ── Local types ────────────────────────────────────────────────────────────────

type Simpyeong = "필요" | "불필요" | "";
type SalaryKind = "월급" | "일급" | "시급" | "연봉" | "면접후결정";
type ParkingOpt = "가능" | "불가" | "지원" | "";

interface ShiftRow { id: number; label: string; days: string; time: string; note: string; }
interface StepRow  { id: number; label: string; }
interface TipRow   { id: number; question: string; answer: string; }

// ── Helpers ────────────────────────────────────────────────────────────────────

function toggleSet<T>(set: Set<T>, item: T): Set<T> {
  const n = new Set(set);
  n.has(item) ? n.delete(item) : n.add(item);
  return n;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1 text-[12px] text-danger">
      <AlertCircle size={12} aria-hidden />{message}
    </p>
  );
}

function InlineNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 border border-[#dfe4ea] bg-[#f7f8fa] px-3.5 py-2.5 text-[12px] text-[#6b7280]">
      <Info size={13} className="mt-0.5 shrink-0" aria-hidden /><span>{children}</span>
    </div>
  );
}

function ChipGroup({ label, required, options, selected, onToggle, max, hint }: {
  label: string; required?: boolean; options: string[]; selected: Set<string>;
  onToggle: (item: string) => void; max?: number; hint?: string;
}) {
  const labelId = useId();
  return (
    <div>
      <p id={labelId} className="mb-2 text-[13px] font-medium text-[#2f3845]">
        {label}
        {required && <span className="ml-1 text-danger" aria-hidden>*</span>}
        {max && <span className="ml-2 text-[12px] font-normal text-[#7b8491]">최대 {max}개</span>}
      </p>
      <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = selected.has(opt);
          const atMax = max !== undefined && selected.size >= max && !on;
          return (
            <button key={opt} type="button" role="checkbox" aria-checked={on} aria-disabled={atMax}
              onClick={() => !atMax && onToggle(opt)}
              className={clsx("inline-flex h-9 items-center gap-1.5 border px-3.5 text-[12px] font-medium transition-colors",
                on ? "border-[#111111] bg-[#111111] text-white"
                  : atMax ? "cursor-not-allowed border-[#dfe4ea] bg-[#f5f6f7] text-[#aeb6c0]"
                    : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]")}>
              {on && <span className="text-[10px]" aria-hidden>✓</span>}{opt}
            </button>
          );
        })}
      </div>
      {hint && <p className="mt-2 text-[11.5px] text-[#a0a9b7]">{hint}</p>}
    </div>
  );
}

function SegControl({ label, required, options, value, onChange, noDeselect }: {
  label: string; required?: boolean; options: string[]; value: string;
  onChange: (v: string) => void; noDeselect?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <p id={id} className="mb-2 text-[13px] font-medium text-[#2f3845]">
        {label}{required && <span className="ml-1 text-danger" aria-hidden>*</span>}
      </p>
      <div role="radiogroup" aria-labelledby={id} className="inline-flex overflow-hidden border border-[#d8e0e8]">
        {options.map((opt) => (
          <button key={opt} type="button" role="radio" aria-checked={value === opt}
            onClick={() => onChange(noDeselect && opt === value ? opt : opt === value ? "" : opt)}
            className={clsx("h-11 border-r border-[#d8e0e8] px-5 text-[13px] font-medium transition-colors last:border-r-0",
              value === opt ? "bg-[#111111] text-white" : "bg-white text-[#4f5967] hover:bg-[#f7f8fa]")}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange, ariaLabel }: {
  title: string; description?: string; checked: boolean; onChange: (v: boolean) => void; ariaLabel: string;
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

// ── Constants ──────────────────────────────────────────────────────────────────

const PHARMACY_JOB_TYPES = ["풀타임약사","파트타임약사","토요일주말약사","단기대체약사","관리약사","전산약무","조제보조","매장관리판매","사무보조"];
const PHARMACY_TYPES = ["문전약국","의원층약국","일반약국","마트약국","기타"];
const EMPLOYMENT_TYPE_OPTS = ["정규직","계약직","아르바이트","기타"];
const WORK_TYPE_OPTS = ["상근직","시간제","교대제","기타"];
const CAREER_OPTS = ["경력무관","신입","1년 미만","1~3년","3~5년","5~10년"];
const EDUCATION_OPTS = ["학력무관","고졸","전문대졸","대졸(4년제)","대졸(6년제)","석사 이상"];
const SOFTWARE_PRESETS = ["유팜","팜IT 3000","팜트리","비트컴퓨터","이지팜"];
const DEVICE_PRESETS = ["계수기","산제자동포장기","자동정제반절기","약포지인쇄기","자동투약기"];
const BENEFIT_PRESETS = ["4대보험","퇴직연금","식사 제공","숙소 제공","연차","경조 지원","교통비 지원","명절 상여","직원 주차","복지포인트"];
const DOC_PRESETS = ["약사 면허증 사본","입사지원서(자사양식)","졸업증명서","성적증명서","경력증명서","자기소개서"];
const APPLY_CHANNELS = ["간편지원","전화","문자","이메일"];
const PHARMA_KW = ["처방조제","복약지도","OTC 판매","재고관리","발주","전산청구","심평원","마약류 관리","고객응대","건강기능식품","주사제조제","소분조제"];
const TIP_Q_HINTS = ["약국 근무 환경은 어떤가요?","근무 시간 조정이 가능한가요?","면접은 어떻게 진행되나요?","입사 시기는 언제인가요?"];
const MAX_KW = 8;

const IN  = "h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8";
const SEL = `${IN} appearance-none pr-8`;
const LBL = "block mb-1.5 text-[13px] font-medium text-[#2f3845]";
const HINT = "mt-1 text-[11.5px] text-[#a0a9b7]";
const REQ  = <span className="ml-1 text-danger" aria-hidden>*</span>;

// ── Main component ─────────────────────────────────────────────────────────────

export function PharmacyJobPostingForm() {

  // §1 기본 정보
  const [title,          setTitle]          = useState("");
  const [role,           setRole]           = useState("");
  const [pharmacyType,   setPharmacyType]   = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [workType,       setWorkType]       = useState("");
  const [career,         setCareer]         = useState("");
  const [education,      setEducation]      = useState("");
  const [headcount,      setHeadcount]      = useState("");
  const [simpyeong,      setSimpyeong]      = useState<Simpyeong>("");

  // §2 모집부문
  const [recruitPart,          setRecruitPart]          = useState("");
  const [recruitDuty,          setRecruitDuty]          = useState("");
  const [recruitQualification, setRecruitQualification] = useState("");
  const recruitPartTouched = useRef(false);

  // §3 업무·자격
  const [oneLineIntro, setOneLineIntro] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [mainDuties,   setMainDuties]   = useState("");
  const [requiredQual, setRequiredQual] = useState("");
  const [preferred,    setPreferred]    = useState("");

  // §4 근무 일정
  const nextShiftId = useRef(2);
  const [shifts, setShifts] = useState<ShiftRow[]>([
    { id: 1, label: "", days: "", time: "", note: "" },
  ]);

  // §5 급여
  const [salaryKind,          setSalaryKind]          = useState<SalaryKind>("시급");
  const [salaryMin,           setSalaryMin]           = useState("");
  const [salaryMax,           setSalaryMax]           = useState("");
  const [weekdayNet,          setWeekdayNet]          = useState("");
  const [weekendNet,          setWeekendNet]          = useState("");
  const [salaryNote,          setSalaryNote]          = useState("");
  const [weeklyHours,         setWeeklyHours]         = useState("");
  const [showHourlyOnDetail,  setShowHourlyOnDetail]  = useState(true);

  // §6 약국 환경
  const [selectedSoftware,    setSelectedSoftware]    = useState<Set<string>>(new Set());
  const [customSoftwareItems, setCustomSoftwareItems] = useState<string[]>([]);
  const [customSoftwareInput, setCustomSoftwareInput] = useState("");
  const [atc,                 setAtc]                 = useState("");
  const [selectedDevices,     setSelectedDevices]     = useState<Set<string>>(new Set());
  const [customDeviceItems,   setCustomDeviceItems]   = useState<string[]>([]);
  const [customDeviceInput,   setCustomDeviceInput]   = useState("");
  const [staffPharmacist,     setStaffPharmacist]     = useState("");
  const [staffSupport,        setStaffSupport]        = useState("");
  const [mainHospital,        setMainHospital]        = useState("");
  const [mainDeptItems,       setMainDeptItems]       = useState<string[]>([]);
  const [mainDeptInput,       setMainDeptInput]       = useState("");

  // §7 근무지·교통편
  const [workplaceName, setWorkplaceName] = useState("");
  const [address,       setAddress]       = useState("");
  const [location,      setLocation]      = useState("");
  const [subwayItems,   setSubwayItems]   = useState<string[]>([]);
  const [subwayInput,   setSubwayInput]   = useState("");
  const [busItems,      setBusItems]      = useState<string[]>([]);
  const [busInput,      setBusInput]      = useState("");
  const [car,           setCar]           = useState("");
  const [parking,       setParking]       = useState<ParkingOpt>("");

  // §8 상세 모집 내용
  const [details, setDetails] = useState("");

  // §9 복리후생
  const [selectedBenefits,    setSelectedBenefits]    = useState<Set<string>>(new Set());
  const [customBenefitItems,  setCustomBenefitItems]  = useState<string[]>([]);
  const [customBenefitInput,  setCustomBenefitInput]  = useState("");

  // §10 접수방법
  const nextStepId = useRef(4);
  const [applyChannels,       setApplyChannels]       = useState<Set<string>>(new Set(["간편지원"]));
  const [blocked,             setBlocked]             = useState("");
  const [applyNote,           setApplyNote]           = useState("");
  const [applyPhone,          setApplyPhone]          = useState("");
  const [applyEmail,          setApplyEmail]          = useState("");
  const applyPhoneTouched = useRef(false);
  const applyEmailTouched = useRef(false);
  const [applyPhoneAutofilled, setApplyPhoneAutofilled] = useState(false);
  const [applyEmailAutofilled, setApplyEmailAutofilled] = useState(false);
  const [managerName,         setManagerName]         = useState("");
  const [managerPhone,        setManagerPhone]        = useState("");
  const [managerEmail,        setManagerEmail]        = useState("");
  const [selectedDocs,     setSelectedDocs]     = useState<Set<string>>(new Set());
  const [customDocItems,   setCustomDocItems]   = useState<string[]>([]);
  const [customDocInput,   setCustomDocInput]   = useState("");
  const [hiringSteps,      setHiringSteps]      = useState<StepRow[]>([
    { id: 1, label: "서류전형" },
    { id: 2, label: "면접" },
    { id: 3, label: "최종합격" },
  ]);

  // §11 근무 환경 안내
  const nextTipId = useRef(3);
  const [tipRows, setTipRows] = useState<TipRow[]>([
    { id: 1, question: "", answer: "" },
    { id: 2, question: "", answer: "" },
  ]);

  // §12 마감일·키워드·이미지
  const [deadline,        setDeadline]        = useState("");
  const [rollingToggle,   setRollingToggle]   = useState(false);
  const [keywords,        setKeywords]        = useState<Set<string>>(new Set());
  const [customKwItems,   setCustomKwItems]   = useState<string[]>([]);
  const [customKwInput,   setCustomKwInput]   = useState("");
  const [imageOption,     setImageOption]     = useState<"default" | "upload" | "none">("default");

  // Validation
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [missingCount, setMissingCount] = useState(0);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const setRef = (key: string) => (el: HTMLElement | null) => { fieldRefs.current[key] = el; };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const currentSalaryDetail = useMemo((): SalaryDetail => {
    const isHourly = salaryKind === "시급";
    const factor = isHourly ? 1 : 10000;
    const minNum = salaryMin ? parseInt(salaryMin.replace(/,/g, ""), 10) * factor : undefined;
    const maxNum = salaryMax ? parseInt(salaryMax.replace(/,/g, ""), 10) * factor : undefined;
    return {
      kind: salaryKind,
      min: minNum && !isNaN(minNum) ? minNum : undefined,
      max: maxNum && !isNaN(maxNum) ? maxNum : undefined,
      note: salaryNote || undefined,
      weekdayNet: isHourly && weekdayNet ? parseInt(weekdayNet, 10) : undefined,
      weekendNet: isHourly && weekendNet ? parseInt(weekendNet, 10) : undefined,
      weeklyHours: weeklyHours ? parseInt(weeklyHours, 10) : undefined,
    };
  }, [salaryKind, salaryMin, salaryMax, salaryNote, weekdayNet, weekendNet, weeklyHours]);

  const salaryPreview = useMemo((): string => {
    const { primary, diff } = formatSalaryDetail(currentSalaryDetail);
    return diff ? `${primary} (${diff})` : primary;
  }, [currentSalaryDetail]);

  const hourlyResult = useMemo(() => convertToHourly(currentSalaryDetail), [currentSalaryDetail]);

  const hourlyPreviewText = useMemo((): string => {
    if (hourlyResult.status === "estimated") {
      const { min, max } = hourlyResult;
      if (min != null && max != null && min !== max) return `약 ${formatWon(min)}~${formatWon(max)} (추정)`;
      const single = min ?? max;
      return single != null ? `약 ${formatWon(single)} (추정)` : "(추정)";
    }
    return salaryKind === "일급" ? "1일 근무시간 입력 시 환산" : "주당 근무시간 입력 시 환산";
  }, [hourlyResult, salaryKind]);

  // ── Effects ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!recruitPartTouched.current && role) setRecruitPart(`약국 > ${role}`);
  }, [role]);

  // 담당자 연락처 → 채널 연락처 자동채움 (단방향, 등록자가 직접 수정한 경우 제외)
  useEffect(() => {
    if (applyPhoneTouched.current) return;
    if (!(applyChannels.has("전화") || applyChannels.has("문자"))) return;
    setApplyPhone(managerPhone);
    setApplyPhoneAutofilled(!!managerPhone);
  }, [managerPhone, applyChannels]);

  useEffect(() => {
    if (applyEmailTouched.current) return;
    if (!applyChannels.has("이메일")) return;
    setApplyEmail(managerEmail);
    setApplyEmailAutofilled(!!managerEmail);
  }, [managerEmail, applyChannels]);

  // ── Validation ────────────────────────────────────────────────────────────────

  function validate(): boolean {
    const next: Record<string, string> = {};
    // §1
    if (!title.trim())        next.title        = "공고 제목을 입력해 주세요.";
    if (!role)                next.role         = "직종을 선택해 주세요.";
    if (!pharmacyType)        next.pharmacyType = "약국 유형을 선택해 주세요.";
    if (!employmentType)      next.employmentType = "고용형태를 선택해 주세요.";
    if (!career)              next.career       = "경력을 선택해 주세요.";
    if (!education)           next.education    = "학력을 선택해 주세요.";
    if (!headcount.trim())    next.headcount    = "모집인원을 입력해 주세요.";
    // §2
    if (!recruitPart.trim())          next.recruitPart          = "모집부문명을 입력해 주세요.";
    if (!recruitDuty.trim())          next.recruitDuty          = "담당업무를 입력해 주세요.";
    if (!recruitQualification.trim()) next.recruitQualification = "자격요건을 입력해 주세요.";
    // §3
    if (!oneLineIntro.trim()) next.oneLineIntro = "한 줄 소개를 입력해 주세요.";
    if (!mainDuties.trim())   next.mainDuties   = "주요업무를 입력해 주세요.";
    if (!requiredQual.trim()) next.requiredQual = "필수 자격조건을 입력해 주세요.";
    // §4
    if (!shifts.some(s => s.days.trim() && s.time.trim())) {
      next.shifts = "근무 요일과 시간을 입력해 주세요.";
    }
    // §7
    if (!address.trim())  next.address  = "근무지 주소를 입력해 주세요.";
    // §10
    if (applyChannels.size === 0) next.applyChannels = "지원 채널을 하나 이상 선택해 주세요.";
    if (hiringSteps.length === 0) next.hiringSteps   = "전형 단계를 입력해 주세요.";
    // §12
    if (!rollingToggle && !deadline) next.deadline = "접수 마감일을 입력해 주세요.";

    setErrors(next);
    const count = Object.keys(next).length;
    setMissingCount(count);
    if (count > 0) {
      const el = fieldRefs.current[Object.keys(next)[0]];
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.querySelector<HTMLElement>("input,select,textarea,button")?.focus(); }
    }
    return count === 0;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function addShift() { setShifts(p => [...p, { id: nextShiftId.current++, label: "", days: "", time: "", note: "" }]); }
  function removeShift(id: number) { setShifts(p => p.filter(s => s.id !== id)); }
  function updateShift(id: number, field: keyof Omit<ShiftRow,"id">, val: string) {
    setShifts(p => p.map(s => s.id === id ? { ...s, [field]: val } : s));
  }

  function addStep() { setHiringSteps(p => [...p, { id: nextStepId.current++, label: "" }]); }
  function removeStep(id: number) { setHiringSteps(p => p.filter(s => s.id !== id)); }
  function updateStep(id: number, label: string) { setHiringSteps(p => p.map(s => s.id === id ? { ...s, label } : s)); }

  function addTip() { setTipRows(p => [...p, { id: nextTipId.current++, question: "", answer: "" }]); }
  function removeTip(id: number) { setTipRows(p => p.filter(t => t.id !== id)); }
  function updateTip(id: number, field: keyof Omit<TipRow,"id">, val: string) {
    setTipRows(p => p.map(t => t.id === id ? { ...t, [field]: val } : t));
  }

  function addCustomItem(
    input: string,
    setInput: (v: string) => void,
    setItems: React.Dispatch<React.SetStateAction<string[]>>,
    setSelected?: React.Dispatch<React.SetStateAction<Set<string>>>,
    maxLen = 30,
  ) {
    const v = input.trim();
    if (!v || v.length > maxLen) return;
    setItems(p => p.includes(v) ? p : [...p, v]);
    if (setSelected) setSelected(prev => { const n = new Set(prev); n.add(v); return n; });
    setInput("");
  }

  function removeCustomItem(
    item: string,
    setItems: React.Dispatch<React.SetStateAction<string[]>>,
    setSelected?: React.Dispatch<React.SetStateAction<Set<string>>>,
  ) {
    setItems(p => p.filter(x => x !== item));
    if (setSelected) setSelected(prev => { const n = new Set(prev); n.delete(item); return n; });
  }

  function addLineItem(input: string, setInput: (v: string) => void, setItems: React.Dispatch<React.SetStateAction<string[]>>) {
    const v = input.trim();
    if (!v) return;
    setItems(p => p.includes(v) ? p : [...p, v]);
    setInput("");
  }

  function toggleKeyword(kw: string) {
    setKeywords(prev => { const n = new Set(prev); n.has(kw) ? n.delete(kw) : n.size < MAX_KW && n.add(kw); return n; });
  }
  function addCustomKw() {
    const v = customKwInput.trim();
    if (!v || v.length > 20 || keywords.size >= MAX_KW) return;
    setKeywords(prev => { const n = new Set(prev); n.add(v); return n; });
    setCustomKwItems(p => [...p, v]);
    setCustomKwInput("");
  }
  function removeCustomKw(kw: string) {
    setKeywords(prev => { const n = new Set(prev); n.delete(kw); return n; });
    setCustomKwItems(p => p.filter(k => k !== kw));
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="flex items-start justify-between gap-5 max-[760px]:flex-col">
        <div>
          <PageBreadcrumb items={[{ label: "기업센터", href: "/business/dashboard" }, { label: "채용관리" }, { label: "공고 등록" }]} />
          <h1 className="mt-5 flex flex-wrap items-center gap-3 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">
            약국 공고 등록
            <span className="inline-flex items-center gap-1.5 border border-[#dfe4ea] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#4f5967]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0d7369]" aria-hidden />
              더파마약국 명의로 작성 중 ·{" "}
              <Link href="#" className="ml-0.5 font-bold text-[#0d7369] underline-offset-2 hover:underline">기관정보</Link>
            </span>
          </h1>
          <p className="mt-2 text-[13px] font-normal text-[#68717e]">
            약국 채용 공고를 등록합니다. 입력한 내용은 공고 상세 페이지에 그대로 노출됩니다.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-5">

        {/* ── §1 기본 정보 ──────────────────────────────────────────────────────── */}
        <SectionCard title="기본 정보" description="공고 제목, 직종, 약국 유형, 채용 조건을 입력합니다."
          status={errors.title || errors.role || errors.pharmacyType || errors.employmentType || errors.career || errors.education || errors.headcount ? "필수 입력 필요" : "작성 중"}>

          <div className="mb-5" ref={setRef("title")}>
            <label htmlFor="p-title" className={LBL}>공고 제목{REQ}</label>
            <input id="p-title" value={title} onChange={e => setTitle(e.target.value)} className={IN}
              placeholder="예: 문전약국 풀타임 약사 모집 / 토요일 파트타임 약사" aria-required="true" />
            <FieldError message={errors.title} />
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div ref={setRef("role")}>
              <label htmlFor="p-role" className={LBL}>직종{REQ}</label>
              <select id="p-role" value={role} onChange={e => setRole(e.target.value)} className={SEL} aria-required="true">
                <option value="" disabled>직종을 선택해 주세요</option>
                {PHARMACY_JOB_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <FieldError message={errors.role} />
            </div>
            <div ref={setRef("pharmacyType")}>
              <label htmlFor="p-phartype" className={LBL}>약국 유형{REQ}</label>
              <select id="p-phartype" value={pharmacyType} onChange={e => setPharmacyType(e.target.value)} className={SEL} aria-required="true">
                <option value="" disabled>약국 유형을 선택해 주세요</option>
                {PHARMACY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <FieldError message={errors.pharmacyType} />
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div ref={setRef("employmentType")}>
              <label htmlFor="p-emptype" className={LBL}>고용형태{REQ}</label>
              <select id="p-emptype" value={employmentType} onChange={e => setEmploymentType(e.target.value)} className={SEL} aria-required="true">
                <option value="" disabled>선택</option>
                {EMPLOYMENT_TYPE_OPTS.map(t => <option key={t}>{t}</option>)}
              </select>
              <FieldError message={errors.employmentType} />
            </div>
            <div>
              <label htmlFor="p-worktype" className={LBL}>근무형태</label>
              <select id="p-worktype" value={workType} onChange={e => setWorkType(e.target.value)} className={SEL}>
                <option value="">선택 안 함</option>
                {WORK_TYPE_OPTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-4 max-[640px]:grid-cols-1">
            <div ref={setRef("career")}>
              <label htmlFor="p-career" className={LBL}>경력{REQ}</label>
              <select id="p-career" value={career} onChange={e => setCareer(e.target.value)} className={SEL} aria-required="true">
                <option value="" disabled>선택</option>
                {CAREER_OPTS.map(t => <option key={t}>{t}</option>)}
              </select>
              <FieldError message={errors.career} />
            </div>
            <div ref={setRef("education")}>
              <label htmlFor="p-edu" className={LBL}>학력{REQ}</label>
              <select id="p-edu" value={education} onChange={e => setEducation(e.target.value)} className={SEL} aria-required="true">
                <option value="" disabled>선택</option>
                {EDUCATION_OPTS.map(t => <option key={t}>{t}</option>)}
              </select>
              <FieldError message={errors.education} />
            </div>
            <div ref={setRef("headcount")}>
              <label htmlFor="p-headcount" className={LBL}>모집인원{REQ}</label>
              <input id="p-headcount" value={headcount} onChange={e => setHeadcount(e.target.value)} className={IN}
                placeholder="예: 1명" aria-required="true" />
              <FieldError message={errors.headcount} />
            </div>
          </div>

          <SegControl label="심평원 등록" options={["필요", "불필요"]} value={simpyeong} onChange={v => setSimpyeong(v as Simpyeong)} />
          <p className={HINT} style={{ marginTop: 6 }}>공고 상세에 강조 배지로 노출됩니다. 해당 없으면 선택하지 않아도 됩니다.</p>
        </SectionCard>

        {/* ── §2 모집부문 및 자격요건 ───────────────────────────────────────────── */}
        <SectionCard title="모집부문 및 자격요건"
          description="약국은 단일 모집부문으로 구성됩니다. 직종 선택 시 부문명이 자동으로 채워지며 수정할 수 있습니다."
          status={errors.recruitPart || errors.recruitDuty || errors.recruitQualification ? "필수 입력 필요" : "작성 중"}>

          <div className="mb-5" ref={setRef("recruitPart")}>
            <label htmlFor="p-rpart" className={LBL}>모집부문명{REQ}</label>
            <input id="p-rpart" value={recruitPart}
              onChange={e => { recruitPartTouched.current = true; setRecruitPart(e.target.value); }}
              className={IN} placeholder="예: 약국 > 풀타임약사" aria-required="true" />
            {!recruitPartTouched.current && role && (
              <p className={HINT}>직종 선택값으로 자동 채워졌습니다. 수정하면 자동 갱신이 중단됩니다.</p>
            )}
            <FieldError message={errors.recruitPart} />
          </div>

          <div className="mb-5" ref={setRef("recruitDuty")}>
            <label htmlFor="p-rduty" className={LBL}>담당업무{REQ}</label>
            <p className={`${HINT} mb-1.5`}>한 줄에 하나씩 입력하세요.</p>
            <textarea id="p-rduty" value={recruitDuty} onChange={e => setRecruitDuty(e.target.value)} rows={3}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"처방 조제 및 복약 지도\n재고 관리 및 발주\n고객 상담 및 OTC 판매"} aria-required="true" />
            <FieldError message={errors.recruitDuty} />
          </div>

          <div ref={setRef("recruitQualification")}>
            <label htmlFor="p-rqual" className={LBL}>자격요건{REQ}</label>
            <p className={`${HINT} mb-1.5`}>경력·학력·심평원 등록 여부 등을 줄 단위로 입력하세요.</p>
            <textarea id="p-rqual" value={recruitQualification} onChange={e => setRecruitQualification(e.target.value)} rows={3}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"약사 면허 소지자\n경력 무관(신입 환영)\n심평원 등록 필요"} aria-required="true" />
            <FieldError message={errors.recruitQualification} />
          </div>
        </SectionCard>

        {/* ── §3 업무·자격 ──────────────────────────────────────────────────────── */}
        <SectionCard title="업무·자격" description="공고 상세에 노출되는 소개 문장과 주요업무·자격조건을 입력합니다."
          status={errors.oneLineIntro || errors.mainDuties || errors.requiredQual ? "필수 입력 필요" : "작성 중"}>

          <div className="mb-5" ref={setRef("oneLineIntro")}>
            <label htmlFor="p-oneline" className={LBL}>한 줄 소개{REQ}</label>
            <input id="p-oneline" value={oneLineIntro} onChange={e => setOneLineIntro(e.target.value)} className={IN}
              placeholder="예: 친절한 문전약국에서 함께할 풀타임 약사를 모집합니다." aria-required="true" />
            <p className={HINT}>공고 목록과 상세 상단 제목 아래에 노출되는 요약 문장입니다.</p>
            <FieldError message={errors.oneLineIntro} />
          </div>

          <div className="mb-5">
            <label htmlFor="p-intro" className={LBL}>포지션 소개</label>
            <textarea id="p-intro" value={introduction} onChange={e => setIntroduction(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder="약국 환경, 팀 분위기, 일하는 방식 등을 자유롭게 소개해 주세요." />
            <p className={HINT}>상세 '포지션 소개' 섹션에 노출됩니다.</p>
          </div>

          <div className="my-5 border-t border-[#f0f2f5]" />

          <div className="mb-5" ref={setRef("mainDuties")}>
            <label htmlFor="p-duties" className={LBL}>주요업무{REQ}</label>
            <p className={`${HINT} mb-1.5`}>한 줄에 하나씩 입력하면 항목 목록으로 표시됩니다.</p>
            <textarea id="p-duties" value={mainDuties} onChange={e => setMainDuties(e.target.value)} rows={4}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"처방전 조제 및 복약 지도\n의약품 재고 관리 및 발주\n심평원 청구 업무\nOTC 의약품 및 건강기능식품 판매"}
              aria-required="true" />
            <FieldError message={errors.mainDuties} />
          </div>

          <div className="mb-5" ref={setRef("requiredQual")}>
            <label htmlFor="p-reqQual" className={LBL}>자격조건(필수){REQ}</label>
            <p className={`${HINT} mb-1.5`}>한 줄에 하나씩 입력하세요.</p>
            <textarea id="p-reqQual" value={requiredQual} onChange={e => setRequiredQual(e.target.value)} rows={3}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"약사 면허 소지자\n성실하고 팀워크를 중시하는 분"} aria-required="true" />
            <FieldError message={errors.requiredQual} />
          </div>

          <div>
            <label htmlFor="p-preferred" className={LBL}>우대사항</label>
            <textarea id="p-preferred" value={preferred} onChange={e => setPreferred(e.target.value)} rows={2}
              className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
              placeholder={"약국 근무 경력자\n심평원 등록 경험자"} />
          </div>
        </SectionCard>

        {/* ── §4 근무 일정 ──────────────────────────────────────────────────────── */}
        <SectionCard title="근무 일정" description="근무 옵션을 하나 이상 입력합니다. 복수 옵션(평일/토요일 등)을 추가할 수 있습니다."
          status={errors.shifts ? "필수 입력 필요" : "작성 중"}>

          <div ref={setRef("shifts")} className="space-y-3">
            {shifts.map((s, i) => (
              <div key={s.id} className="border border-[#dfe4ea] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="bg-[#111111] px-3 py-1 text-[12px] font-black text-white">옵션 {i + 1}</span>
                  {shifts.length > 1 && (
                    <button type="button" onClick={() => removeShift(s.id)} aria-label={`옵션 ${i+1} 삭제`}
                      className="h-7 border border-[#dfe4ea] bg-white px-3 text-[12px] font-medium text-danger hover:bg-[#fff3f0] transition-colors">
                      삭제
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
                  <div>
                    <label htmlFor={`sh-lbl-${s.id}`} className={LBL}>라벨</label>
                    <input id={`sh-lbl-${s.id}`} value={s.label}
                      onChange={e => updateShift(s.id, "label", e.target.value)}
                      className={IN} placeholder="예: 평일, 토요일" />
                  </div>
                  <div>
                    <label htmlFor={`sh-days-${s.id}`} className={LBL}>근무 요일{REQ}</label>
                    <input id={`sh-days-${s.id}`} value={s.days}
                      onChange={e => updateShift(s.id, "days", e.target.value)}
                      className={IN} placeholder="예: 월~금" />
                  </div>
                  <div>
                    <label htmlFor={`sh-time-${s.id}`} className={LBL}>근무 시간{REQ}</label>
                    <input id={`sh-time-${s.id}`} value={s.time}
                      onChange={e => updateShift(s.id, "time", e.target.value)}
                      className={IN} placeholder="예: 09:00~18:00" />
                  </div>
                </div>
                <div className="mt-3">
                  <label htmlFor={`sh-note-${s.id}`} className={LBL}>비고</label>
                  <input id={`sh-note-${s.id}`} value={s.note}
                    onChange={e => updateShift(s.id, "note", e.target.value)}
                    className={IN} placeholder="예: 점심시간 1시간 별도, 주 40시간" />
                </div>
              </div>
            ))}
          </div>
          <FieldError message={errors.shifts} />

          <button type="button" onClick={addShift}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 border border-dashed border-[#d8e0e8] bg-white text-[13px] font-medium text-[#4f5967] transition-colors hover:border-[#111111] hover:text-[#111111]">
            <Plus size={14} aria-hidden /> 근무 옵션 추가
          </button>
        </SectionCard>

        {/* ── §5 급여 ───────────────────────────────────────────────────────────── */}
        <SectionCard title="급여" description="급여 표기 방식과 금액을 입력합니다." status="작성 중">
          <div className="mb-5">
            <SegControl label="급여 표기 방식" required options={["월급","일급","시급","연봉","면접후결정"]}
              value={salaryKind} onChange={v => setSalaryKind(v as SalaryKind)} noDeselect />
          </div>

          {salaryKind !== "면접후결정" && (
            <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div>
                <label htmlFor="p-sal-min" className={LBL}>
                  최소 {salaryKind === "시급" ? "시급" : salaryKind}
                </label>
                <div className="relative">
                  <input id="p-sal-min" value={salaryMin} onChange={e => setSalaryMin(e.target.value)}
                    className={`${IN} pr-12`} placeholder={salaryKind === "시급" ? "예: 15000" : "예: 350"} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#7b8491]" aria-hidden>
                    {salaryKind === "시급" ? "원" : "만원"}
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="p-sal-max" className={LBL}>
                  최대 {salaryKind === "시급" ? "시급" : salaryKind}
                </label>
                <div className="relative">
                  <input id="p-sal-max" value={salaryMax} onChange={e => setSalaryMax(e.target.value)}
                    className={`${IN} pr-12`} placeholder={salaryKind === "시급" ? "예: 18000" : "예: 500"} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#7b8491]" aria-hidden>
                    {salaryKind === "시급" ? "원" : "만원"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {salaryKind === "시급" && (
            <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div>
                <label htmlFor="p-wdnet" className={LBL}>평일 세후 시급</label>
                <div className="relative">
                  <input id="p-wdnet" value={weekdayNet} onChange={e => setWeekdayNet(e.target.value)}
                    className={`${IN} pr-8`} placeholder="예: 14000" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#7b8491]" aria-hidden>원</span>
                </div>
                <p className={HINT}>공고 상세 처우 섹션에 표시됩니다.</p>
              </div>
              <div>
                <label htmlFor="p-wenet" className={LBL}>주말 세후 시급</label>
                <div className="relative">
                  <input id="p-wenet" value={weekendNet} onChange={e => setWeekendNet(e.target.value)}
                    className={`${IN} pr-8`} placeholder="예: 16000" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#7b8491]" aria-hidden>원</span>
                </div>
              </div>
            </div>
          )}

          {/* [근무시간 | 환산 시급] 2열 — 월급·연봉·일급에만 */}
          {(salaryKind === "월급" || salaryKind === "연봉" || salaryKind === "일급") && (
            <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              {/* 좌: 근무시간 입력 */}
              <div>
                <label htmlFor="p-weekly-hours" className={LBL}>
                  {salaryKind === "일급" ? "1일 근무시간" : "주당 근무시간"}
                  <span className="ml-1 text-[12px] font-normal text-[#7b8491]">시급 환산용, 선택</span>
                </label>
                <div className="relative">
                  <input id="p-weekly-hours" value={weeklyHours} onChange={e => setWeeklyHours(e.target.value)}
                    className={`${IN} pr-10`} placeholder={salaryKind === "일급" ? "예: 8" : "예: 40"}
                    type="number" min="1" max="168" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#7b8491]" aria-hidden>시간</span>
                </div>
                <p className={HINT}>입력하면 시급으로 환산되어 시급 필터에 반영됩니다. 비워두면 필터에서 제외됩니다.</p>
              </div>
              {/* 우: 환산 시급 (자동 계산 결과) */}
              <div>
                <p className={LBL}>
                  환산 시급
                  <span className="ml-1 text-[12px] font-normal text-[#7b8491]">자동 계산</span>
                </p>
                {hourlyResult.status === "estimated" ? (
                  <div className="flex h-11 items-center border border-[#c5e8e3] bg-[#edf7f5] px-3.5">
                    <span className="text-[13px] font-semibold text-[#0d7369]">{hourlyPreviewText}</span>
                  </div>
                ) : (
                  <div className="flex h-11 items-center border border-[#dfe4ea] bg-[#f7f8fa] px-3.5">
                    <span className="text-[13px] text-[#a4adba]">{hourlyPreviewText}</span>
                  </div>
                )}
                {hourlyResult.status === "estimated" && weeklyHours && (
                  <p className={HINT}>
                    {salaryKind === "월급"
                      ? `월급 ÷ 주 ${weeklyHours}시간 × 4.35주 기준`
                      : `연봉 ÷ 주 ${weeklyHours}시간 × 52주 기준`}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="p-salnote" className={LBL}>급여 비고</label>
            <input id="p-salnote" value={salaryNote} onChange={e => setSalaryNote(e.target.value)} className={IN}
              placeholder="예: 신입 기준, 경력·근무 횟수에 따라 상이" />
            {salaryKind === "면접후결정" && (
              <p className={HINT}>"실수령 연봉 7,500만원", "식대 포함" 같은 참고 정보를 입력할 수 있습니다.</p>
            )}
          </div>

          {/* 노출 토글 — 단독 행, 월급·연봉·일급에만 */}
          {(salaryKind === "월급" || salaryKind === "연봉" || salaryKind === "일급") && (
            <ToggleRow
              title="환산 시급을 공고 상세에 표시"
              description="끄더라도 시급 필터에는 계속 반영됩니다."
              checked={showHourlyOnDetail}
              onChange={setShowHourlyOnDetail}
              ariaLabel="환산 시급 상세 노출"
            />
          )}
        </SectionCard>

        {/* ── §6 약국 근무 환경 ─────────────────────────────────────────────────── */}
        <SectionCard title="약국 근무 환경" description="전산·기기·인력 구성 등 약국 환경을 입력합니다. 전부 선택 입력이며, 입력한 항목만 상세에 노출됩니다." status="선택 사항">

          {/* 전산 소프트웨어 */}
          <div className="mb-5">
            <ChipGroup label="전산 소프트웨어" options={SOFTWARE_PRESETS}
              selected={selectedSoftware} onToggle={opt => setSelectedSoftware(prev => toggleSet(prev, opt))} />
            <div className="mt-2 flex gap-2">
              <input value={customSoftwareInput} onChange={e => setCustomSoftwareInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomItem(customSoftwareInput, setCustomSoftwareInput, setCustomSoftwareItems); }}}
                placeholder="기타 소프트웨어 직접 입력" className={`${IN} flex-1`} aria-label="기타 소프트웨어" />
              <button type="button" onClick={() => addCustomItem(customSoftwareInput, setCustomSoftwareInput, setCustomSoftwareItems)}
                className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] hover:bg-[#f7f8fa]">＋</button>
            </div>
            {customSoftwareItems.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customSoftwareItems.map(item => (
                  <button key={item} type="button" onClick={() => removeCustomItem(item, setCustomSoftwareItems)}
                    aria-label={`${item} 삭제`}
                    className="inline-flex h-9 items-center gap-1.5 border border-[#111111] bg-[#111111] px-3.5 text-[12px] font-medium text-white">
                    <span className="text-[10px]" aria-hidden>✓</span>{item}
                    <X size={11} className="ml-0.5 opacity-70" aria-hidden />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 자동조제기 */}
          <div className="mb-5">
            <label htmlFor="p-atc" className={LBL}>자동조제기(ATC)</label>
            <input id="p-atc" value={atc} onChange={e => setAtc(e.target.value)} className={IN}
              placeholder="예: JVM, 유팜 오토팩" />
          </div>

          {/* 기타 자동화기기 */}
          <div className="mb-5">
            <ChipGroup label="기타 자동화기기" options={DEVICE_PRESETS}
              selected={selectedDevices} onToggle={opt => setSelectedDevices(prev => toggleSet(prev, opt))} />
            <div className="mt-2 flex gap-2">
              <input value={customDeviceInput} onChange={e => setCustomDeviceInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomItem(customDeviceInput, setCustomDeviceInput, setCustomDeviceItems); }}}
                placeholder="기타 기기 직접 입력" className={`${IN} flex-1`} aria-label="기타 기기 입력" />
              <button type="button" onClick={() => addCustomItem(customDeviceInput, setCustomDeviceInput, setCustomDeviceItems)}
                className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] hover:bg-[#f7f8fa]">＋</button>
            </div>
            {customDeviceItems.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customDeviceItems.map(item => (
                  <button key={item} type="button" onClick={() => removeCustomItem(item, setCustomDeviceItems)}
                    aria-label={`${item} 삭제`}
                    className="inline-flex h-9 items-center gap-1.5 border border-[#111111] bg-[#111111] px-3.5 text-[12px] font-medium text-white">
                    <span className="text-[10px]" aria-hidden>✓</span>{item}
                    <X size={11} className="ml-0.5 opacity-70" aria-hidden />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 근무자 구성 */}
          <div className="mb-5">
            <p className={LBL}>근무자 구성</p>
            <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div>
                <label htmlFor="p-staff-ph" className="mb-1 block text-[12px] font-medium text-[#6b7280]">약사 수</label>
                <div className="relative">
                  <input id="p-staff-ph" value={staffPharmacist} onChange={e => setStaffPharmacist(e.target.value)}
                    className={`${IN} pr-8`} placeholder="예: 3" type="number" min="0" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#7b8491]" aria-hidden>명</span>
                </div>
              </div>
              <div>
                <label htmlFor="p-staff-sp" className="mb-1 block text-[12px] font-medium text-[#6b7280]">약무지원 수</label>
                <div className="relative">
                  <input id="p-staff-sp" value={staffSupport} onChange={e => setStaffSupport(e.target.value)}
                    className={`${IN} pr-8`} placeholder="예: 2" type="number" min="0" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#7b8491]" aria-hidden>명</span>
                </div>
              </div>
            </div>
          </div>

          {/* 주처방 병원 / 주처방 진료과 */}
          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div>
              <label htmlFor="p-mainhospital" className={LBL}>주처방 병원</label>
              <input id="p-mainhospital" value={mainHospital} onChange={e => setMainHospital(e.target.value)} className={IN}
                placeholder="예: ○○의원, ○○내과" />
            </div>
            <div>
              <label className={LBL}>주처방 진료과</label>
              <div className="flex gap-2">
                <input value={mainDeptInput} onChange={e => setMainDeptInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLineItem(mainDeptInput, setMainDeptInput, setMainDeptItems); }}}
                  placeholder="예: 정형외과, 내과" className={`${IN} flex-1`} aria-label="주처방 진료과 입력" />
                <button type="button" onClick={() => addLineItem(mainDeptInput, setMainDeptInput, setMainDeptItems)}
                  className="h-11 border border-[#d8e0e8] bg-white px-3.5 text-[12px] font-medium text-[#4f5967] hover:border-[#111111]">＋</button>
              </div>
              {mainDeptItems.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {mainDeptItems.map(d => (
                    <span key={d} className="inline-flex items-center gap-1 border border-[#d8e0e8] bg-[#f7f8fa] px-2.5 py-1 text-[12px] font-medium text-[#4f5967]">
                      {d}
                      <button type="button" onClick={() => setMainDeptItems(p => p.filter(x => x !== d))}
                        aria-label={`${d} 삭제`} className="ml-0.5 text-[#a0a9b7] hover:text-danger">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── §7 근무지·교통편 ──────────────────────────────────────────────────── */}
        <SectionCard title="근무지·교통편" description="근무지 주소와 교통편을 입력합니다. 입력한 항목만 상세에 노출됩니다."
          status={errors.address ? "필수 입력 필요" : "작성 중"}>

          <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div>
              <label htmlFor="p-wpname" className={LBL}>근무지명</label>
              <input id="p-wpname" value={workplaceName} onChange={e => setWorkplaceName(e.target.value)} className={IN}
                placeholder="예: 더파마약국" />
            </div>
            <div>
              <label htmlFor="p-location" className={LBL}>근무 지역</label>
              <input id="p-location" value={location} onChange={e => setLocation(e.target.value)} className={IN}
                placeholder="예: 서울 강남구" />
              <p className={HINT}>공고 목록·상세 개요에 표시되는 짧은 지역명입니다.</p>
            </div>
          </div>

          <div className="mb-5" ref={setRef("address")}>
            <label htmlFor="p-address" className={LBL}>주소{REQ}</label>
            <input id="p-address" value={address} onChange={e => setAddress(e.target.value)} className={IN}
              placeholder="예: 서울 강남구 테헤란로 123, 1층" aria-required="true" />
            <FieldError message={errors.address} />
          </div>

          <div className="my-5 border-t border-[#f0f2f5]" />
          <p className="mb-4 text-[13px] font-medium text-[#2f3845]">교통편 <span className="ml-1.5 text-[12px] font-normal text-[#7b8491]">선택 — 입력한 항목만 상세에 표시됩니다</span></p>

          {/* 지하철 */}
          <div className="mb-4">
            <p className={LBL}>지하철</p>
            <div className="flex gap-2">
              <input value={subwayInput} onChange={e => setSubwayInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLineItem(subwayInput, setSubwayInput, setSubwayItems); }}}
                placeholder="예: 2호선 강남역 도보 6분" className={`${IN} flex-1`} aria-label="지하철 노선 추가" />
              <button type="button" onClick={() => addLineItem(subwayInput, setSubwayInput, setSubwayItems)}
                className="h-11 border border-[#d8e0e8] bg-white px-3.5 text-[12px] font-medium text-[#4f5967] hover:border-[#111111]">＋</button>
            </div>
            {subwayItems.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {subwayItems.map(item => (
                  <li key={item} className="flex items-center justify-between border border-[#edf1f5] bg-[#fafbfc] px-3 py-2 text-[13px] text-[#303946]">
                    {item}
                    <button type="button" onClick={() => setSubwayItems(p => p.filter(x => x !== item))}
                      aria-label={`${item} 삭제`} className="ml-3 text-[#a0a9b7] hover:text-danger"><X size={13} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 버스 */}
          <div className="mb-4">
            <p className={LBL}>버스·광역버스</p>
            <div className="flex gap-2">
              <input value={busInput} onChange={e => setBusInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLineItem(busInput, setBusInput, setBusItems); }}}
                placeholder="예: 145·341번 ○○사거리 정류장 하차" className={`${IN} flex-1`} aria-label="버스 노선 추가" />
              <button type="button" onClick={() => addLineItem(busInput, setBusInput, setBusItems)}
                className="h-11 border border-[#d8e0e8] bg-white px-3.5 text-[12px] font-medium text-[#4f5967] hover:border-[#111111]">＋</button>
            </div>
            {busItems.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {busItems.map(item => (
                  <li key={item} className="flex items-center justify-between border border-[#edf1f5] bg-[#fafbfc] px-3 py-2 text-[13px] text-[#303946]">
                    {item}
                    <button type="button" onClick={() => setBusItems(p => p.filter(x => x !== item))}
                      aria-label={`${item} 삭제`} className="ml-3 text-[#a0a9b7] hover:text-danger"><X size={13} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 자차 + 주차 */}
          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div>
              <label htmlFor="p-car" className={LBL}>자차·IC</label>
              <input id="p-car" value={car} onChange={e => setCar(e.target.value)} className={IN}
                placeholder="예: 동부간선도로 ○○IC에서 5분" />
            </div>
            <div>
              <SegControl label="주차" options={["가능","불가","지원"]} value={parking}
                onChange={v => setParking(v as ParkingOpt)} />
            </div>
          </div>
        </SectionCard>

        {/* ── §8 상세 모집 내용 ─────────────────────────────────────────────────── */}
        <SectionCard title="상세 모집 내용" description="포지션 소개와 별개로 자유롭게 모집 내용을 입력합니다. (선택)" status="선택 사항">
          <label htmlFor="p-details" className={LBL}>상세 내용</label>
          <p className={`${HINT} mb-1.5`}>줄바꿈이 유지되며 공고 상세 '상세 모집 내용' 섹션에 단락으로 노출됩니다.</p>
          <textarea id="p-details" value={details} onChange={e => setDetails(e.target.value)} rows={6}
            className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
            placeholder={"저희 약국은 2010년 개업 이래 지역 주민들과 함께해 온 문전약국입니다.\n\n약사 선생님이 편안하게 근무하실 수 있도록 충분한 휴게 시간과 지원을 제공합니다."} />
        </SectionCard>

        {/* ── §9 복리후생 ───────────────────────────────────────────────────────── */}
        <SectionCard title="복리후생" description="복리후생 항목을 선택하거나 직접 입력합니다. (선택)" status="선택 사항">
          <ChipGroup label="복리후생" options={BENEFIT_PRESETS}
            selected={selectedBenefits} onToggle={opt => setSelectedBenefits(prev => toggleSet(prev, opt))} />

          <div className="mt-3 flex gap-2">
            <input value={customBenefitInput} onChange={e => setCustomBenefitInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomItem(customBenefitInput, setCustomBenefitInput, setCustomBenefitItems); }}}
              placeholder="기타 복리후생 직접 입력" className={`${IN} flex-1`} aria-label="기타 복리후생 입력" />
            <button type="button" onClick={() => addCustomItem(customBenefitInput, setCustomBenefitInput, setCustomBenefitItems)}
              className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] hover:bg-[#f7f8fa]">＋ 추가</button>
          </div>
          {customBenefitItems.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {customBenefitItems.map(item => (
                <button key={item} type="button" onClick={() => removeCustomItem(item, setCustomBenefitItems)}
                  aria-label={`${item} 삭제`}
                  className="inline-flex h-9 items-center gap-1.5 border border-[#111111] bg-[#111111] px-3.5 text-[12px] font-medium text-white">
                  <span className="text-[10px]" aria-hidden>✓</span>{item}
                  <X size={11} className="ml-0.5 opacity-70" aria-hidden />
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── §10 접수방법 및 채용절차 ──────────────────────────────────────────── */}
        <SectionCard title="접수방법 및 채용절차" description="지원 채널, 제출서류, 전형절차를 입력합니다."
          status={errors.applyChannels || errors.hiringSteps ? "필수 입력 필요" : "작성 중"}>

          {/* 지원 채널 */}
          <div className="mb-5" ref={setRef("applyChannels")}>
            <ChipGroup label="지원 채널" required options={APPLY_CHANNELS}
              selected={applyChannels} onToggle={opt => setApplyChannels(prev => toggleSet(prev, opt))}
              hint="복수 선택 가능" />
            <FieldError message={errors.applyChannels} />
          </div>

          {/* 채널 연락처 */}
          {(applyChannels.has("전화") || applyChannels.has("문자")) && (
            <div className="mb-5">
              <label htmlFor="p-phone" className={LBL}>접수 연락처</label>
              <p className={`${HINT} mb-1.5`}>지원자가 실제로 지원·접수하는 연락처입니다.</p>
              <input id="p-phone" value={applyPhone}
                onChange={e => { applyPhoneTouched.current = true; setApplyPhoneAutofilled(false); setApplyPhone(e.target.value); }}
                className={IN} placeholder="예: 02-1234-5678" type="tel" />
              {applyPhoneAutofilled
                ? <p className={HINT}>담당자 정보에서 가져옴 · 수정 가능 · 로그인 후 확인 안내로 노출됩니다.</p>
                : <p className={HINT}>로그인 후 확인 안내로 노출됩니다.</p>
              }
            </div>
          )}
          {applyChannels.has("이메일") && (
            <div className="mb-5">
              <label htmlFor="p-email" className={LBL}>접수 이메일</label>
              <p className={`${HINT} mb-1.5`}>지원자가 실제로 지원·접수하는 이메일입니다.</p>
              <input id="p-email" value={applyEmail}
                onChange={e => { applyEmailTouched.current = true; setApplyEmailAutofilled(false); setApplyEmail(e.target.value); }}
                className={IN} placeholder="예: recruit@pharmacy.kr" type="email" />
              {applyEmailAutofilled
                ? <p className={HINT}>담당자 정보에서 가져옴 · 수정 가능 · 로그인 후 확인 안내로 노출됩니다.</p>
                : <p className={HINT}>로그인 후 확인 안내로 노출됩니다.</p>
              }
            </div>
          )}

          {/* 담당자 정보 */}
          <div className="mb-5 border border-[#dfe4ea] p-4">
            <p className="mb-0.5 text-[13px] font-medium text-[#2f3845]">담당자 정보 <span className="ml-1 text-[12px] font-normal text-[#7b8491]">선택 — 전부 선택 입력</span></p>
            <p className={`${HINT} mb-3`}>공고 문의·관리 담당자 정보입니다. 접수 연락처와 다를 경우 별도로 입력하세요. 전화·이메일 채널이 켜져 있고 접수 연락처가 비어 있으면 자동으로 채워집니다.</p>
            <div className="space-y-3">
              <div>
                <label htmlFor="p-mgr-name" className="mb-1 block text-[12px] font-medium text-[#6b7280]">담당자명</label>
                <input id="p-mgr-name" value={managerName} onChange={e => setManagerName(e.target.value)} className={IN}
                  placeholder="예: 홍길동" />
                <p className={HINT}>지원자에게는 마스킹 처리되어 노출됩니다.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
                <div>
                  <label htmlFor="p-mgr-phone" className="mb-1 block text-[12px] font-medium text-[#6b7280]">담당자 연락처</label>
                  <input id="p-mgr-phone" value={managerPhone} onChange={e => setManagerPhone(e.target.value)} className={IN}
                    placeholder="예: 010-1234-5678" type="tel" />
                  <p className={HINT}>로그인 후 확인 안내로 노출됩니다.</p>
                </div>
                <div>
                  <label htmlFor="p-mgr-email" className="mb-1 block text-[12px] font-medium text-[#6b7280]">담당자 이메일</label>
                  <input id="p-mgr-email" value={managerEmail} onChange={e => setManagerEmail(e.target.value)} className={IN}
                    placeholder="예: manager@pharmacy.kr" type="email" />
                  <p className={HINT}>로그인 후 확인 안내로 노출됩니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 지원 제한 안내 (blocked) */}
          <div className="mb-3">
            <label htmlFor="p-blocked" className={LBL}>지원 제한 안내</label>
            <input id="p-blocked" value={blocked} onChange={e => setBlocked(e.target.value)} className={IN}
              placeholder="예: 간편지원 불가. 이메일·전화 지원만 가능합니다." />
            <p className={HINT}>특정 채널을 제한하거나 간편지원이 불가한 경우에만 입력하세요.</p>
          </div>

          {/* 연락 안내 문구 (note) */}
          <div className="mb-5">
            <label htmlFor="p-apply-note" className={LBL}>연락 안내 문구</label>
            <input id="p-apply-note" value={applyNote} onChange={e => setApplyNote(e.target.value)} className={IN}
              placeholder="예: 문자로 간단한 자기소개와 희망 근무시간을 보내주세요." />
            <p className={HINT}>지원자에게 전달할 연락 안내나 유의사항을 입력하세요.</p>
          </div>

          <div className="my-5 border-t border-[#f0f2f5]" />

          {/* 제출서류 */}
          <div className="mb-5">
            <ChipGroup label="제출서류" options={DOC_PRESETS}
              selected={selectedDocs} onToggle={opt => setSelectedDocs(prev => toggleSet(prev, opt))} />
            <div className="mt-2 flex gap-2">
              <input value={customDocInput} onChange={e => setCustomDocInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomItem(customDocInput, setCustomDocInput, setCustomDocItems); }}}
                placeholder="기타 서류 직접 입력" className={`${IN} flex-1`} aria-label="기타 제출서류 입력" />
              <button type="button" onClick={() => addCustomItem(customDocInput, setCustomDocInput, setCustomDocItems)}
                className="h-11 border border-[#d8e0e8] bg-white px-3.5 text-[12px] font-medium text-[#4f5967] hover:border-[#111111]">＋</button>
            </div>
            {customDocItems.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customDocItems.map(item => (
                  <button key={item} type="button" onClick={() => removeCustomItem(item, setCustomDocItems)}
                    aria-label={`${item} 삭제`}
                    className="inline-flex h-9 items-center gap-1.5 border border-[#111111] bg-[#111111] px-3.5 text-[12px] font-medium text-white">
                    <span className="text-[10px]" aria-hidden>✓</span>{item}
                    <X size={11} className="ml-0.5 opacity-70" aria-hidden />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="my-5 border-t border-[#f0f2f5]" />

          {/* 전형절차 */}
          <div ref={setRef("hiringSteps")}>
            <p className={LBL} id="p-steps-lbl">전형절차{REQ}</p>
            <ol aria-labelledby="p-steps-lbl" className="flex flex-col gap-2">
              {hiringSteps.map((step, i) => (
                <li key={step.id} className="flex items-center gap-2">
                  <span aria-hidden className="grid h-7 w-7 shrink-0 select-none place-items-center bg-[#111111] text-[12px] font-bold text-white">{i + 1}</span>
                  <input aria-label={`전형 단계 ${i + 1}`} value={step.label}
                    onChange={e => updateStep(step.id, e.target.value)}
                    className={`flex-1 ${IN}`} />
                  <button type="button" aria-label={`${i + 1}단계 삭제`} onClick={() => removeStep(step.id)}
                    className="grid h-9 w-9 shrink-0 place-items-center border border-[#dfe4ea] bg-white text-[#a0a9b7] transition-colors hover:border-danger/30 hover:text-danger">
                    <Trash2 size={14} aria-hidden />
                  </button>
                </li>
              ))}
            </ol>
            <button type="button" onClick={addStep}
              className="mt-3 inline-flex h-9 items-center gap-1.5 border border-dashed border-[#d8e0e8] bg-white px-4 text-[12.5px] font-medium text-[#4f5967] transition-colors hover:border-[#111111] hover:text-[#111111]">
              <Plus size={13} aria-hidden /> 단계 추가
            </button>
            <FieldError message={errors.hiringSteps} />
          </div>
        </SectionCard>

        {/* ── §11 근무 환경 안내 ─────────────────────────────────────────────────── */}
        <SectionCard title="근무 환경 안내" description="Q&A 형식으로 약국 근무 환경을 안내합니다. 답변을 입력한 항목만 상세에 노출됩니다. (전체 선택)" status="선택 사항">
          <div className="space-y-4">
            {tipRows.map((tip, i) => (
              <div key={tip.id} className="border border-[#dfe4ea] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#4f5967]">질문 {i + 1}</span>
                  {tipRows.length > 1 && (
                    <button type="button" onClick={() => removeTip(tip.id)} aria-label={`질문 ${i + 1} 삭제`}
                      className="text-[12px] font-medium text-[#a0a9b7] hover:text-danger">삭제</button>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor={`tip-q-${tip.id}`} className="mb-1 block text-[12px] font-medium text-[#6b7280]">질문</label>
                  <input id={`tip-q-${tip.id}`} value={tip.question}
                    onChange={e => updateTip(tip.id, "question", e.target.value)}
                    className={IN} placeholder={TIP_Q_HINTS[i % TIP_Q_HINTS.length]} />
                </div>
                <div>
                  <label htmlFor={`tip-a-${tip.id}`} className="mb-1 block text-[12px] font-medium text-[#6b7280]">답변</label>
                  <textarea id={`tip-a-${tip.id}`} value={tip.answer}
                    onChange={e => updateTip(tip.id, "answer", e.target.value)} rows={2}
                    className={`${IN} h-auto resize-y py-2.5 leading-relaxed`}
                    placeholder="답변을 입력하세요. 빈 답변은 상세 페이지에 노출되지 않습니다." />
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addTip}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 border border-dashed border-[#d8e0e8] bg-white text-[13px] font-medium text-[#4f5967] transition-colors hover:border-[#111111] hover:text-[#111111]">
            <Plus size={14} aria-hidden /> Q&A 추가
          </button>
        </SectionCard>

        {/* ── §12 지원 방법 및 마감일 ───────────────────────────────────────────── */}
        <SectionCard title="지원 방법 및 마감일" description="접수 마감일과 핵심 키워드, 대표 이미지를 설정합니다."
          status={errors.deadline ? "필수 입력 필요" : "작성 중"}>

          {/* 마감일 */}
          <div className="mb-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div ref={setRef("deadline")}>
              <label htmlFor="p-deadline" className={LBL}>
                {rollingToggle ? "마감 예정일" : <>접수 마감일{REQ}</>}
              </label>
              <input id="p-deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                disabled={rollingToggle}
                className={clsx(IN, rollingToggle && "cursor-not-allowed opacity-45")}
                aria-required={!rollingToggle ? "true" : undefined} />
              <FieldError message={errors.deadline} />
            </div>
          </div>

          <ToggleRow title="채용 시 마감(조기 마감 가능)"
            description="정한 마감일과 별개로, 채용이 완료되면 조기 마감합니다. 켜면 마감일은 '예정일'로 표시됩니다."
            checked={rollingToggle} onChange={setRollingToggle} ariaLabel="채용 시 마감" />

          <div className="my-5 border-t border-[#f0f2f5]" />

          {/* 핵심 키워드 */}
          <div className="mb-6">
            <p className="mb-1.5 text-[13px] font-medium text-[#2f3845]">
              핵심 키워드 <span className="ml-2 text-[12px] font-normal text-[#7b8491]">최대 {MAX_KW}개</span>
            </p>
            <p className={`${HINT} mb-3`}>선택한 키워드를 기준으로 유사 공고 추천과 검색에 활용됩니다.</p>
            <div role="group" aria-label="추천 키워드" className="flex flex-wrap gap-2">
              {PHARMA_KW.map(kw => {
                const on = keywords.has(kw);
                const blocked = keywords.size >= MAX_KW && !on;
                return (
                  <button key={kw} type="button" role="checkbox" aria-checked={on} aria-disabled={blocked}
                    onClick={() => !blocked && toggleKeyword(kw)}
                    className={clsx("inline-flex h-9 items-center gap-1.5 border px-3.5 text-[12px] font-medium transition-colors",
                      on ? "border-[#111111] bg-[#111111] text-white"
                        : blocked ? "cursor-not-allowed border-[#dfe4ea] bg-[#f5f6f7] text-[#aeb6c0]"
                          : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]")}>
                    {on && <span className="text-[10px]" aria-hidden>✓</span>}{kw}
                  </button>
                );
              })}
            </div>

            <div className="my-4 border-t border-[#f0f2f5]" />
            <p className="mb-1 text-[12.5px] font-semibold text-[#7b8491]">기타 키워드 직접 추가</p>
            <p className={`${HINT} mb-2`}>추천 목록에 없는 키워드는 직접 입력하세요. (Enter로 추가, 20자 이내)</p>
            <div className="flex gap-2">
              <input value={customKwInput} onChange={e => setCustomKwInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomKw(); }}}
                maxLength={20} placeholder="예: 건식 코너" className={`${IN} flex-1`} aria-label="키워드 직접 입력" />
              <button type="button" onClick={addCustomKw}
                disabled={keywords.size >= MAX_KW}
                className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:border-[#dfe4ea] disabled:text-[#aeb6c0]">
                ＋ 추가
              </button>
            </div>
            {customKwItems.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customKwItems.map(kw => (
                  <button key={kw} type="button" onClick={() => removeCustomKw(kw)} aria-label={`${kw} 키워드 삭제`}
                    className="inline-flex h-9 items-center gap-1.5 border border-[#111111] bg-[#111111] px-3.5 text-[12px] font-medium text-white">
                    <span className="text-[10px]" aria-hidden>✓</span>{kw}
                    <X size={11} className="ml-0.5 opacity-70" aria-hidden />
                  </button>
                ))}
              </div>
            )}
            <p className="mt-2.5 text-[11.5px] text-[#a0a9b7]">선택됨 {keywords.size}개</p>
          </div>

          {/* 대표 이미지 */}
          <div>
            <p className={LBL} id="p-img-lbl">대표 이미지</p>
            <div role="radiogroup" aria-labelledby="p-img-lbl" className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
              {(["default", "upload", "none"] as const).map(opt => {
                const labels = { default: "기관 기본 이미지 사용", upload: "새 이미지 업로드", none: "대표 이미지 없음" };
                const isOn = imageOption === opt;
                return (
                  <button key={opt} type="button" role="radio" aria-checked={isOn} onClick={() => setImageOption(opt)}
                    className={clsx("flex h-12 items-center justify-center border text-[13px] font-medium transition-colors",
                      isOn ? "border-[#111111] bg-white text-[#111111] shadow-[inset_0_0_0_1px_#111111]"
                        : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]")}>
                    {labels[opt]}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>

        {/* ── 하단 저장바 ────────────────────────────────────────────────────────── */}
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
