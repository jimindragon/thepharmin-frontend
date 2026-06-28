"use client";

import clsx from "clsx";
import { AlertCircle, Info, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { SectionCard } from "@/components/business/BusinessFormControls";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Dept {
  id: number;
  name: string;
  headcount: string;
  hours: string;
  duties: string;
  requirements: string;
}

interface HiringStep {
  id: number;
  label: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function toggleSet<T>(set: Set<T>, item: T): Set<T> {
  const next = new Set(set);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}

// ── Shared field components ────────────────────────────────────────────────────

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
    <div className="flex items-start gap-2 bg-[#f7f8fa] border border-[#dfe4ea] px-3.5 py-2.5 text-[12px] text-[#6b7280]">
      <Info size={13} className="mt-0.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

function ChipGroup({
  label,
  required,
  options,
  selected,
  onToggle,
  max,
  hint,
}: {
  label: string;
  required?: boolean;
  options: string[];
  selected: Set<string>;
  onToggle: (item: string) => void;
  max?: number;
  hint?: string;
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
          const isOn = selected.has(opt);
          const atMax = max !== undefined && selected.size >= max && !isOn;
          return (
            <button
              key={opt}
              type="button"
              role="checkbox"
              aria-checked={isOn}
              aria-disabled={atMax}
              onClick={() => !atMax && onToggle(opt)}
              className={clsx(
                "h-9 border px-3.5 text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors",
                isOn
                  ? "border-[#111111] bg-[#111111] text-white"
                  : atMax
                    ? "border-[#dfe4ea] bg-[#f5f6f7] text-[#aeb6c0] cursor-not-allowed"
                    : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
              )}
            >
              {isOn && <span className="text-[10px]" aria-hidden>✓</span>}
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
  labelId: externalLabelId,
  options,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  labelId?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const internalId = useId();
  const id = externalLabelId ?? internalId;
  return (
    <div>
      <p id={id} className="mb-2 text-[13px] font-medium text-[#2f3845]">
        {label}
        {required && <span className="ml-1 text-danger" aria-hidden>*</span>}
      </p>
      <div role="radiogroup" aria-labelledby={id} className="inline-flex border border-[#d8e0e8] overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            onClick={() => onChange(opt)}
            className={clsx(
              "h-11 px-5 border-r border-[#d8e0e8] last:border-r-0 text-[13px] font-medium transition-colors",
              value === opt ? "bg-[#111111] text-white" : "bg-white text-[#4f5967] hover:bg-[#f7f8fa]",
            )}
          >
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
    <div className="flex items-start justify-between border border-[#dfe4ea] px-4 py-3 gap-4 bg-white">
      <div>
        <p className="text-[13px] font-medium text-[#303946]">{title}</p>
        {description && <p className="text-[11.5px] text-[#7b8491] mt-1">{description}</p>}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={ariaLabel} />
    </div>
  );
}

// ── Constant data ──────────────────────────────────────────────────────────────

const LICENSE_OPTS = ["약사 면허", "감염전문약사", "종양전문약사", "정맥영양(TPN)", "항응고전문약사", "심평원 등록"];
const KW_BY_JOBCAT: Record<string, string[]> = {
  "입원·조제 약사": ["조제", "복약지도", "처방감사", "투약", "입원조제", "외래조제", "마약류 관리", "의약품 관리", "무균조제", "주사제"],
  "임상·전문약사":  ["ASP", "감염관리", "항생제", "종양약사", "TPN", "정맥영양", "항응고", "DUR", "약물상담", "전문약사", "임상약학"],
  "임상시험 약사":  ["임상시험", "IP 관리", "임상시험약", "프로토콜", "GCP", "SAE", "임상연구", "CRC 협업"],
  "약제부 관리":    ["약제부 운영", "약사 인력관리", "의약품 구매", "재고관리", "DUR", "처방 모니터링", "약무 통계", "위원회 운영"],
  "약무행정":       ["약무행정", "보험심사", "삭감관리", "약가", "청구", "인증평가", "규정 관리", "문서 관리"],
};
const MAX_KW = 8;
const WELFARE_OPTS = ["4대보험", "퇴직연금", "본인·가족 의료비", "교육비 지원", "경조 지원", "사내식당", "직원 주차", "연·월차", "휴양시설", "직장 어린이집"];
const SUBMISSION_OPTS = ["입사지원서(자사양식)", "최종학력 성적증명서", "약사 면허증 사본", "자기소개서", "경력증명서", "자격증 사본"];
const WORK_TYPE_OPTS = ["주간", "야간·당직", "주말", "파트타임", "교대"];

// Shared input class — no rounding (sharp corners), matches BusinessFormControls.TextInput style
const IN = "h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8";
const SEL = `${IN} appearance-none pr-8`;
const LBL = "block mb-1.5 text-[13px] font-medium text-[#2f3845]";
const HINT = "mt-1 text-[11.5px] text-[#a0a9b7]";
const REQ = <span className="ml-1 text-danger" aria-hidden>*</span>;

// ── Main component ─────────────────────────────────────────────────────────────

export function HospitalJobPostingForm() {
  // §1 기본정보
  const [title, setTitle] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [workplaceCategory, setWorkplaceCategory] = useState("");
  const [workTypes, setWorkTypes] = useState<Set<string>>(new Set(["주간"]));
  const [employmentType, setEmploymentType] = useState("정규직");
  const [careerType, setCareerType] = useState("경력무관");
  const [educationType, setEducationType] = useState("학력무관");

  // §2 모집부문
  const nextDeptId = useRef(3);
  const [departments, setDepartments] = useState<Dept[]>([
    { id: 1, name: "", headcount: "", hours: "", duties: "", requirements: "" },
    { id: 2, name: "ASP팀 감염전문약사", headcount: "", hours: "", duties: "", requirements: "" },
  ]);

  // §3 업무·자격
  const [summary, setSummary] = useState("");
  const [mainDuties, setMainDuties] = useState("");
  const [requiredQual, setRequiredQual] = useState("");
  const [preferred, setPreferred] = useState("");
  const [licenses, setLicenses] = useState<Set<string>>(new Set(["약사 면허"]));

  // §4 근무조건
  const [workSchedule, setWorkSchedule] = useState("");
  const [nightShift, setNightShift] = useState("");
  const [overtimeToggle, setOvertimeToggle] = useState(true);
  const [salaryType, setSalaryType] = useState("연봉");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryNote, setSalaryNote] = useState("");
  const [welfare, setWelfare] = useState<Set<string>>(new Set(["4대보험", "퇴직연금", "본인·가족 의료비", "교육비 지원"]));
  const [workCondDetail, setWorkCondDetail] = useState("");
  const [workplaceName, setWorkplaceName] = useState("더파마병원");
  const [nearStation, setNearStation] = useState("");
  const [address, setAddress] = useState("서울 강남구 테헤란로 123, 8층");

  // §5 전형·서류
  const nextStepId = useRef(6);
  const [steps, setSteps] = useState<HiringStep[]>([
    { id: 1, label: "서류전형" },
    { id: 2, label: "1차 면접" },
    { id: 3, label: "최종 면접" },
    { id: 4, label: "채용검진" },
    { id: 5, label: "최종합격" },
  ]);
  const [submissionDocs, setSubmissionDocs] = useState<Set<string>>(
    new Set(["입사지원서(자사양식)", "최종학력 성적증명서", "약사 면허증 사본"])
  );
  const [blindHire, setBlindHire] = useState(false);

  // §6 키워드·이미지
  const [keywords, setKeywords] = useState<Set<string>>(new Set());
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [customKwInput, setCustomKwInput] = useState("");
  const [imageOption, setImageOption] = useState<"default" | "upload" | "none">("default");

  // §7 지원·마감
  const [applyMethod, setApplyMethod] = useState<"quick" | "url" | "email">("quick");
  const [applyTarget, setApplyTarget] = useState("");
  const [deadline, setDeadline] = useState("2026-07-20");
  const [rollingToggle, setRollingToggle] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [missingCount, setMissingCount] = useState(0);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const setRef = (key: string) => (el: HTMLElement | null) => { fieldRefs.current[key] = el; };

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "공고 제목을 입력해 주세요.";
    if (!jobCategory) next.jobCategory = "직무 분류를 선택해 주세요.";
    if (!workplaceCategory) next.workplaceCategory = "사업장 분류를 선택해 주세요.";
    if (workTypes.size === 0) next.workTypes = "근무형태를 하나 이상 선택해 주세요.";
    departments.forEach((dept, i) => {
      if (!dept.name.trim()) next[`dept_${i}_name`] = "부문명을 입력해 주세요.";
      if (!dept.headcount.trim()) next[`dept_${i}_headcount`] = "모집인원을 입력해 주세요.";
      if (!dept.hours.trim()) next[`dept_${i}_hours`] = "근무시간을 입력해 주세요.";
    });
    if (!summary.trim()) next.summary = "한 줄 요약을 입력해 주세요.";
    if (!mainDuties.trim()) next.mainDuties = "주요업무를 입력해 주세요.";
    if (!requiredQual.trim()) next.requiredQual = "필수 자격조건을 입력해 주세요.";
    if (!workSchedule.trim()) next.workSchedule = "근무 요일/시간을 입력해 주세요.";
    if (!workplaceName.trim()) next.workplaceName = "근무지명을 입력해 주세요.";
    if (!address.trim()) next.address = "주소를 입력해 주세요.";
    if (steps.length === 0) next.steps = "전형 단계를 하나 이상 입력해 주세요.";
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

  // Dept helpers
  function addDept() {
    setDepartments((prev) => [
      ...prev,
      { id: nextDeptId.current++, name: "", headcount: "", hours: "", duties: "", requirements: "" },
    ]);
  }
  function removeDept(id: number) { setDepartments((prev) => prev.filter((d) => d.id !== id)); }
  function updateDept(id: number, field: keyof Omit<Dept, "id">, value: string) {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  }

  // Step helpers
  function addStep() { setSteps((prev) => [...prev, { id: nextStepId.current++, label: "" }]); }
  function removeStep(id: number) { setSteps((prev) => prev.filter((s) => s.id !== id)); }
  function updateStep(id: number, label: string) { setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, label } : s))); }

  // Keyword helpers
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

  return (
    <div>
      {/* Page header — matches BusinessCompanyProfileClient pattern */}
      <div className="flex items-start justify-between gap-5 max-[760px]:flex-col">
        <div>
          <PageBreadcrumb items={[{ label: "기업센터", href: "/business/dashboard" }, { label: "채용관리" }, { label: "공고 등록" }]} />
          <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c] flex flex-wrap items-center gap-3">
            병원약사 공고 등록
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#4f5967] bg-white border border-[#dfe4ea] px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d7369]" aria-hidden />
              더파마병원 명의로 작성 중 ·{" "}
              <Link href="#" className="text-[#0d7369] font-bold ml-0.5 hover:underline underline-offset-2">기관정보</Link>
            </span>
          </h1>
          <p className="mt-2 text-[13px] font-normal text-[#68717e]">
            병원·약제부 채용 공고를 등록합니다. 입력한 내용은 공고 상세 페이지에 그대로 노출됩니다.
          </p>
        </div>
      </div>

      {/* Section stack — fills full column width; save bar is last child so sticky works */}
      <div className="mt-8 space-y-5">

        {/* ── §1 기본 정보 ──────────────────────────────────────────────────────── */}
        <SectionCard
          title="기본 정보"
          description="공고 제목과 직무, 채용 조건을 입력합니다."
          status={errors.title || errors.jobCategory || errors.workplaceCategory || errors.workTypes ? "필수 입력 필요" : "작성 중"}
        >
          <div className="mb-5" ref={setRef("title")}>
            <label htmlFor="h-title" className={LBL}>공고 제목{REQ}</label>
            <input id="h-title" value={title} onChange={(e) => setTitle(e.target.value)}
              className={IN} placeholder="예: 약제팀 약사 / ASP팀 감염전문약사 채용" aria-required="true" />
            <FieldError message={errors.title} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5 max-[640px]:grid-cols-1">
            <div ref={setRef("jobCategory")}>
              <label htmlFor="h-jobcat" className={LBL}>직무 분류{REQ}</label>
              <select id="h-jobcat" value={jobCategory} onChange={(e) => setJobCategory(e.target.value)} className={SEL} aria-required="true">
                <option value="" disabled>직무를 선택해 주세요</option>
                <optgroup label="약사 직무">
                  <option>입원·조제 약사</option><option>임상·전문약사</option><option>임상시험 약사</option>
                </optgroup>
                <optgroup label="관리·행정">
                  <option>약제부 관리</option><option>약무행정</option>
                </optgroup>
              </select>
              <FieldError message={errors.jobCategory} />
            </div>
            <div ref={setRef("workplaceCategory")}>
              <label htmlFor="h-wpcat" className={LBL}>사업장 분류{REQ}</label>
              <select id="h-wpcat" value={workplaceCategory} onChange={(e) => setWorkplaceCategory(e.target.value)} className={SEL} aria-required="true">
                <option value="" disabled>의료기관 유형을 선택해 주세요</option>
                <option>상급종합병원</option><option>종합병원</option><option>병원</option><option>요양병원</option>
              </select>
              <FieldError message={errors.workplaceCategory} />
            </div>
          </div>

          <div className="mb-5" ref={setRef("workTypes")}>
            <ChipGroup label="근무유형" required options={WORK_TYPE_OPTS} selected={workTypes}
              onToggle={(item) => setWorkTypes(toggleSet(workTypes, item))} hint="복수 선택 가능" />
            <FieldError message={errors.workTypes} />
          </div>

          <div className="grid grid-cols-3 gap-4 max-[640px]:grid-cols-1">
            <div>
              <label htmlFor="h-emptype" className={LBL}>고용형태{REQ}</label>
              <select id="h-emptype" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={SEL}>
                <option>정규직</option><option>계약직</option><option>파트타임</option><option>프리랜서</option>
              </select>
            </div>
            <div>
              <label htmlFor="h-career" className={LBL}>경력{REQ}</label>
              <select id="h-career" value={careerType} onChange={(e) => setCareerType(e.target.value)} className={SEL}>
                <option>경력무관</option><option>신입</option><option>1년 미만</option><option>1~3년</option><option>3~5년</option><option>5~10년</option>
              </select>
            </div>
            <div>
              <label htmlFor="h-edu" className={LBL}>학력{REQ}</label>
              <select id="h-edu" value={educationType} onChange={(e) => setEducationType(e.target.value)} className={SEL}>
                <option>학력무관</option><option>대졸(4년제)</option><option>대졸(6년제)</option><option>석사 이상</option>
              </select>
            </div>
          </div>
          <p className={HINT} style={{ marginTop: 8 }}>모집인원은 아래 '모집부문'에서 부문별로 입력합니다.</p>
        </SectionCard>

        {/* ── §2 모집부문 ───────────────────────────────────────────────────────── */}
        <SectionCard
          title="모집부문"
          description="모집하는 부문을 부문별로 입력합니다. 부문이 2개 이상이면 공고 상세에서 비교 표로 노출됩니다. 모집인원은 여기에서만 입력합니다."
          status="작성 중"
        >
          {departments.map((dept, i) => (
            <div key={dept.id} className="border border-[#dfe4ea] p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-black text-white bg-[#111111] px-3 py-1">부문 {i + 1}</span>
                {departments.length > 1 && (
                  <button type="button" onClick={() => removeDept(dept.id)} aria-label={`부문 ${i + 1} 삭제`}
                    className="h-7 px-3 border border-[#dfe4ea] text-[12px] font-medium text-danger bg-white hover:bg-[#fff3f0] transition-colors">
                    삭제
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 max-[640px]:grid-cols-1">
                <div ref={setRef(`dept_${i}_name`)}>
                  <label htmlFor={`h-dept-${dept.id}-name`} className={LBL}>부문명{REQ}</label>
                  <input id={`h-dept-${dept.id}-name`} value={dept.name}
                    onChange={(e) => updateDept(dept.id, "name", e.target.value)}
                    className={IN} placeholder="예: 약제팀 평일약사" aria-required="true" />
                  <FieldError message={errors[`dept_${i}_name`]} />
                </div>
                <div ref={setRef(`dept_${i}_headcount`)}>
                  <label htmlFor={`h-dept-${dept.id}-hc`} className={LBL}>모집인원{REQ}</label>
                  <input id={`h-dept-${dept.id}-hc`} value={dept.headcount}
                    onChange={(e) => updateDept(dept.id, "headcount", e.target.value)}
                    className={IN} placeholder="예: 1명 (또는 0명·채용 시 마감)" aria-required="true" />
                  <FieldError message={errors[`dept_${i}_headcount`]} />
                </div>
              </div>

              <div className="mb-4" ref={setRef(`dept_${i}_hours`)}>
                <label htmlFor={`h-dept-${dept.id}-hrs`} className={LBL}>근무시간{REQ}</label>
                <input id={`h-dept-${dept.id}-hrs`} value={dept.hours}
                  onChange={(e) => updateDept(dept.id, "hours", e.target.value)}
                  className={IN} placeholder="예: 월–금 08:30~16:30 (탄력근무제)" aria-required="true" />
                <FieldError message={errors[`dept_${i}_hours`]} />
              </div>

              <div className="mb-4">
                <label htmlFor={`h-dept-${dept.id}-duties`} className={LBL}>담당업무</label>
                <textarea id={`h-dept-${dept.id}-duties`} value={dept.duties}
                  onChange={(e) => updateDept(dept.id, "duties", e.target.value)} rows={2}
                  className={`${IN} h-auto py-2.5 resize-y leading-relaxed`}
                  placeholder={"예: 처방 감사, 입·퇴원 조제 및 투약설명, 의약품·마약류 관리"} />
              </div>

              <div>
                <label htmlFor={`h-dept-${dept.id}-req`} className={LBL}>자격요건</label>
                <textarea id={`h-dept-${dept.id}-req`} value={dept.requirements}
                  onChange={(e) => updateDept(dept.id, "requirements", e.target.value)} rows={2}
                  className={`${IN} h-auto py-2.5 resize-y leading-relaxed`}
                  placeholder="예: 약사 면허 소지자 / 경력 무관" />
              </div>
            </div>
          ))}

          <button type="button" onClick={addDept}
            className="w-full h-11 border border-dashed border-[#d8e0e8] bg-white text-[13px] font-medium text-[#4f5967] flex items-center justify-center gap-2 hover:border-[#111111] hover:text-[#111111] transition-colors">
            <Plus size={14} aria-hidden /> 모집부문 추가
          </button>
        </SectionCard>

        {/* ── §3 업무·자격 (부문 공통) ──────────────────────────────────────────── */}
        <SectionCard
          title="업무·자격"
          description="모든 모집부문에 공통으로 적용되는 소개와 자격을 입력합니다. 부문마다 다른 내용은 위 '모집부문'의 각 부문에 입력하세요."
          status="작성 중"
          action={
            <span className="text-[12px] font-bold text-[#0d7369] bg-[rgba(31,191,146,0.10)] border border-[rgba(31,191,146,0.30)] px-2.5 py-0.5 whitespace-nowrap">
              부문 공통
            </span>
          }
        >
          <div className="mb-5" ref={setRef("summary")}>
            <label htmlFor="h-summary" className={LBL}>한 줄 소개{REQ}</label>
            <input id="h-summary" value={summary} onChange={(e) => setSummary(e.target.value)}
              className={IN} placeholder="예: 약제 전반 업무를 담당할 병원약사를 모집합니다." aria-required="true" />
            <p className={HINT}>공고 목록과 상세 상단에 노출되는 요약 문장입니다.</p>
            <FieldError message={errors.summary} />
          </div>

          <div className="mb-5" ref={setRef("mainDuties")}>
            <label htmlFor="h-duties" className={LBL}>주요업무{REQ}</label>
            <p className={`${HINT} mb-1.5`}>한 줄에 하나씩 입력하면 항목으로 표시됩니다.</p>
            <textarea id="h-duties" value={mainDuties} onChange={(e) => setMainDuties(e.target.value)} rows={4}
              className={`${IN} h-auto py-2.5 resize-y leading-relaxed`}
              placeholder={"처방 감사를 통한 처방 오류 사전 점검\n입·퇴원 환자 처방 조제 및 투약 설명\n의약품 및 마약류 관리, 부작용 모니터링"}
              aria-required="true" />
            <FieldError message={errors.mainDuties} />
          </div>

          <div className="mb-5" ref={setRef("requiredQual")}>
            <label htmlFor="h-reqQual" className={LBL}>자격조건(필수){REQ}</label>
            <p className={`${HINT} mb-1.5`}>한 줄에 하나씩 입력하세요.</p>
            <textarea id="h-reqQual" value={requiredQual} onChange={(e) => setRequiredQual(e.target.value)} rows={3}
              className={`${IN} h-auto py-2.5 resize-y leading-relaxed`}
              placeholder={"약사 면허 소지자\n대졸(약학과) 이상"} aria-required="true" />
            <FieldError message={errors.requiredQual} />
          </div>

          <div className="mb-5">
            <label htmlFor="h-preferred" className={LBL}>우대사항</label>
            <textarea id="h-preferred" value={preferred} onChange={(e) => setPreferred(e.target.value)} rows={2}
              className={`${IN} h-auto py-2.5 resize-y leading-relaxed`}
              placeholder="예: 종합병원 약제 경력 보유자 (한 줄에 하나씩)" />
          </div>

          <ChipGroup label="자격·면허 및 전문분야" options={LICENSE_OPTS} selected={licenses}
            onToggle={(item) => setLicenses(toggleSet(licenses, item))}
            hint="상세 페이지에 강조 배지로 노출됩니다." />
        </SectionCard>

        {/* ── §4 근무조건 ───────────────────────────────────────────────────────── */}
        <SectionCard title="근무조건" description="근무 일정, 급여, 복리후생과 근무지를 입력합니다." status="작성 중">
          <div className="mb-5" ref={setRef("workSchedule")}>
            <label htmlFor="h-wsched" className={LBL}>근무 요일/시간{REQ}</label>
            <input id="h-wsched" value={workSchedule} onChange={(e) => setWorkSchedule(e.target.value)}
              className={IN} placeholder="예: 주 5일 / 월~금 08:30~16:30 (부문별로 다르면 모집부문에 입력)" aria-required="true" />
            <FieldError message={errors.workSchedule} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5 max-[640px]:grid-cols-1">
            <div>
              <label htmlFor="h-nightshift" className={LBL}>당직 여부·빈도</label>
              <input id="h-nightshift" value={nightShift} onChange={(e) => setNightShift(e.target.value)}
                className={IN} placeholder="예: 야간 당직 월 2~3회" />
            </div>
            <div>
              <p className={LBL} id="h-overtime-lbl">연장·휴일 수당</p>
              <div aria-labelledby="h-overtime-lbl"
                className="flex items-center justify-between border border-[#dfe4ea] px-4 bg-white" style={{ height: 44 }}>
                <div>
                  <span className="text-[13px] font-medium text-[#303946]">별도 지급</span>
                  <span className="text-[11.5px] text-[#7b8491] ml-2">발생 시 수당 별도 지급</span>
                </div>
                <ToggleSwitch checked={overtimeToggle} onChange={setOvertimeToggle} label="연장·휴일 수당 별도 지급" />
              </div>
            </div>
          </div>

          <div className="border-t border-[#f0f2f5] my-5" />

          <div className="mb-5">
            <SegControl label="급여 표기 방식" required options={["연봉", "일급·회당", "면접 후 결정"]} value={salaryType} onChange={setSalaryType} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5 max-[640px]:grid-cols-1">
            <div>
              <label htmlFor="h-salary-amt" className={LBL}>금액</label>
              <div className="relative">
                <input id="h-salary-amt" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)}
                  className={`${IN} pr-10`} placeholder="예: 7,000" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#7b8491]" aria-hidden>만원</span>
              </div>
              <p className={HINT}>신규(1년차) 기준 등 산정 기준이 있으면 함께 적어주세요.</p>
            </div>
            <div>
              <label htmlFor="h-salary-note" className={LBL}>급여 비고</label>
              <input id="h-salary-note" value={salaryNote} onChange={(e) => setSalaryNote(e.target.value)}
                className={IN} placeholder="예: 신규 기준, 경력·근무횟수에 따라 상이" />
            </div>
          </div>

          <div className="border-t border-[#f0f2f5] my-5" />

          <div className="mb-5">
            <ChipGroup label="복리후생" options={WELFARE_OPTS} selected={welfare}
              onToggle={(item) => setWelfare(toggleSet(welfare, item))} />
          </div>

          <div className="mb-5">
            <label htmlFor="h-workcond" className={LBL}>근무조건 상세</label>
            <textarea id="h-workcond" value={workCondDetail} onChange={(e) => setWorkCondDetail(e.target.value)} rows={3}
              className={`${IN} h-auto py-2.5 resize-y leading-relaxed`}
              placeholder="예: 4대 보험, 퇴직연금, 본인·가족 의료비 지원, 교육비 지원, 경조 휴가 등을 운영합니다." />
          </div>

          <div className="border-t border-[#f0f2f5] my-5" />

          <div className="grid grid-cols-2 gap-4 mb-5 max-[640px]:grid-cols-1">
            <div ref={setRef("workplaceName")}>
              <label htmlFor="h-wpname" className={LBL}>근무지명{REQ}</label>
              <input id="h-wpname" value={workplaceName} onChange={(e) => setWorkplaceName(e.target.value)}
                className={IN} aria-required="true" />
              <FieldError message={errors.workplaceName} />
            </div>
            <div>
              <label htmlFor="h-nearstation" className={LBL}>가까운 역·교통</label>
              <input id="h-nearstation" value={nearStation} onChange={(e) => setNearStation(e.target.value)}
                className={IN} placeholder="예: 2호선 강남역 도보 6분" />
            </div>
          </div>

          <div ref={setRef("address")}>
            <label htmlFor="h-address" className={LBL}>주소{REQ}</label>
            <input id="h-address" value={address} onChange={(e) => setAddress(e.target.value)}
              className={IN} aria-required="true" />
            {!address.trim() && (
              <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-[#9a6b00] bg-[#fff9ef] border border-[#f1dcb7] px-3 py-1.5">
                <AlertCircle size={13} aria-hidden />
                기관정보에 설립연도·가까운 역 정보가 비어 있습니다. 비어있으면 상세에 노출되지 않습니다.
              </div>
            )}
            <FieldError message={errors.address} />
          </div>
        </SectionCard>

        {/* ── §5 전형절차 & 제출서류 ────────────────────────────────────────────── */}
        <SectionCard title="전형절차 & 제출서류" description="전형 단계와 지원자가 제출할 서류를 입력합니다." status="작성 중">
          <div className="mb-6" ref={setRef("steps")}>
            <p className={LBL} id="h-steps-lbl">전형 단계{REQ}</p>
            <ol aria-labelledby="h-steps-lbl" className="flex flex-col gap-2">
              {steps.map((step, i) => (
                <li key={step.id} className="flex items-center gap-2">
                  <span aria-hidden className="w-7 h-7 bg-[#111111] text-white text-[12px] font-bold grid place-items-center shrink-0 select-none">
                    {i + 1}
                  </span>
                  <input aria-label={`전형 단계 ${i + 1}`} value={step.label}
                    onChange={(e) => updateStep(step.id, e.target.value)}
                    className={`flex-1 ${IN}`} />
                  <button type="button" aria-label={`${i + 1}단계 삭제`} onClick={() => removeStep(step.id)}
                    className="w-9 h-9 border border-[#dfe4ea] bg-white text-[#a0a9b7] grid place-items-center hover:text-danger hover:border-danger/30 transition-colors shrink-0">
                    <Trash2 size={14} aria-hidden />
                  </button>
                </li>
              ))}
            </ol>
            <button type="button" onClick={addStep}
              className="mt-3 h-9 px-4 border border-dashed border-[#d8e0e8] bg-white text-[12.5px] font-medium text-[#4f5967] inline-flex items-center gap-1.5 hover:border-[#111111] hover:text-[#111111] transition-colors">
              <Plus size={13} aria-hidden /> 단계 추가
            </button>
            <FieldError message={errors.steps} />
          </div>

          <div className="mb-6">
            <ChipGroup label="제출서류" options={SUBMISSION_OPTS} selected={submissionDocs}
              onToggle={(item) => setSubmissionDocs(toggleSet(submissionDocs, item))} />
          </div>

          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <div>
              <p className={LBL}>지원 양식 첨부</p>
              <label className="border border-dashed border-[#d8e0e8] bg-[#fbfcfd] flex flex-col items-center justify-center gap-1.5 py-6 cursor-pointer hover:border-[#111111] transition-colors"
                tabIndex={0} role="button" aria-label="자사양식 파일 업로드">
                <span className="text-[13px] font-medium text-[#303946]">+ 자사양식 업로드</span>
                <span className="text-[11.5px] text-[#7b8491]">.hwp, .docx</span>
                <span className="text-[11.5px] text-[#7b8491]">지정 양식이 있으면 첨부하세요.</span>
                <input type="file" accept=".hwp,.docx" className="sr-only" tabIndex={-1} />
              </label>
            </div>
            <div>
              <p className={LBL}>블라인드 채용</p>
              <ToggleRow title="블라인드 적용"
                description="학교·나이·출신지 등 인적사항을 평가에서 제외합니다. 국공립·공공의료기관에서 주로 사용합니다."
                checked={blindHire} onChange={setBlindHire} ariaLabel="블라인드 채용 적용" />
            </div>
          </div>
        </SectionCard>

        {/* ── §6 키워드·이미지 ──────────────────────────────────────────────────── */}
        <SectionCard title="키워드 · 이미지" description="검색·추천에 쓰일 키워드와 대표 이미지를 선택합니다. (선택)" status="선택 사항">
          <div className="mb-6">
            <p className="mb-1.5 text-[13px] font-medium text-[#2f3845]">
              핵심 키워드
              <span className="ml-2 text-[12px] font-normal text-[#7b8491]">최대 {MAX_KW}개</span>
            </p>

            {jobCategory && KW_BY_JOBCAT[jobCategory] ? (
              <>
                <p className={`${HINT} mb-3`}>
                  선택한 직무({jobCategory})에 맞춰 추천 키워드가 표시됩니다.
                </p>
                <div role="group" aria-label="추천 키워드" className="flex flex-wrap gap-2">
                  {KW_BY_JOBCAT[jobCategory].map((kw) => {
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
              </>
            ) : (
              <p className={`${HINT} mb-3`}>직무를 먼저 선택하면 추천 키워드가 표시됩니다.</p>
            )}

            <div className="my-4 border-t border-[#f0f2f5]" />

            <p className="mb-1 text-[12.5px] font-semibold text-[#7b8491]">기타 키워드 직접 추가</p>
            <p className={`${HINT} mb-2`}>추천 목록에 없는 키워드는 직접 입력하세요. (Enter로 추가, 키워드당 20자 이내)</p>
            <div className="flex gap-2">
              <input
                value={customKwInput}
                onChange={(e) => setCustomKwInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomKeyword(); } }}
                maxLength={20}
                placeholder="예: 무균조제"
                className={`${IN} flex-1`}
                aria-label="키워드 직접 입력"
              />
              <button type="button" onClick={addCustomKeyword}
                disabled={keywords.size >= MAX_KW}
                className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:border-[#dfe4ea] disabled:text-[#aeb6c0]">
                ＋ 추가
              </button>
            </div>

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

          <div>
            <p className={LBL} id="h-img-lbl">대표 이미지</p>
            <div role="radiogroup" aria-labelledby="h-img-lbl" className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
              {(["default", "upload", "none"] as const).map((opt) => {
                const labels = { default: "기관 기본 이미지 사용", upload: "새 이미지 업로드", none: "대표 이미지 사용 안 함" };
                const isOn = imageOption === opt;
                return (
                  <button key={opt} type="button" role="radio" aria-checked={isOn} onClick={() => setImageOption(opt)}
                    className={clsx(
                      "h-12 border text-[13px] font-medium flex items-center justify-center transition-colors",
                      isOn ? "border-[#111111] shadow-[inset_0_0_0_1px_#111111] text-[#111111] bg-white"
                        : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
                    )}>
                    {labels[opt]}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>

        {/* ── §7 지원방법 및 마감일 ─────────────────────────────────────────────── */}
        <SectionCard title="지원방법 및 마감일" description="지원 방식에 따라 공고 상세에 필요한 정보가 노출됩니다."
          status={errors.applyTarget || errors.deadline ? "필수 입력 필요" : "작성 중"}>
          <div className="mb-5">
            <SegControl label="지원 방식" required
              options={["간편지원", "기관 홈페이지 지원", "이메일 지원"]}
              value={applyMethod === "quick" ? "간편지원" : applyMethod === "url" ? "기관 홈페이지 지원" : "이메일 지원"}
              onChange={(v) => setApplyMethod(v === "간편지원" ? "quick" : v === "기관 홈페이지 지원" ? "url" : "email")} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5 max-[640px]:grid-cols-1">
            {applyMethod !== "quick" ? (
              <div ref={setRef("applyTarget")}>
                <label htmlFor="h-apply-target" className={LBL}>
                  {applyMethod === "url" ? "지원 페이지 URL" : "지원 이메일 주소"}{REQ}
                </label>
                <input id="h-apply-target" type={applyMethod === "url" ? "url" : "email"}
                  value={applyTarget} onChange={(e) => setApplyTarget(e.target.value)}
                  className={IN}
                  placeholder={applyMethod === "url" ? "예: https://hospital.or.kr/recruit" : "예: hr@hospital.or.kr"}
                  aria-required="true" />
                <FieldError message={errors.applyTarget} />
              </div>
            ) : (
              <div>
                <p className={LBL}>지원 안내</p>
                <InlineNote>간편지원은 더파마 지원서로 접수됩니다. 별도 URL·이메일이 필요 없습니다.</InlineNote>
              </div>
            )}

            <div ref={setRef("deadline")}>
              <label htmlFor="h-deadline" className={LBL}>
                {rollingToggle ? "마감 예정일" : <>접수 마감일{REQ}</>}
              </label>
              <input id="h-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                disabled={rollingToggle}
                className={clsx(IN, rollingToggle && "opacity-45 cursor-not-allowed")}
                aria-required={!rollingToggle ? "true" : undefined} />
              <FieldError message={errors.deadline} />
            </div>
          </div>

          <ToggleRow title="채용 시 마감(조기 마감 가능)"
            description="정한 마감일과 별개로, 채용이 완료되면 조기 마감합니다. 켜면 마감일은 '예정일'로 표시됩니다."
            checked={rollingToggle} onChange={setRollingToggle} ariaLabel="채용 시 마감" />

          <div className="mt-4">
            <InlineNote>이미지·포스터를 첨부할 수 있지만, 검색·추천을 위해 주요업무·자격요건·근무조건은 반드시 입력해 주세요.</InlineNote>
          </div>
        </SectionCard>

        {/* ── 하단 저장바 — space-y-5 스택의 마지막 자식으로 sticky가 정상 동작 ── */}
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
