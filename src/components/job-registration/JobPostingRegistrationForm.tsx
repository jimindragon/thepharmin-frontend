"use client";

import clsx from "clsx";
import {
  AlertCircle,
  ArrowRight,
  Bold,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  GripVertical,
  HelpCircle,
  Image as ImageIcon,
  ImageOff,
  Info,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  MapPin,
  PanelRight,
  Pilcrow,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Table2,
  Trash2,
  Undo2,
  Underline,
  Upload,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { jobTrackLabels } from "@/config/jobTracks";
import { deriveJobTrack, organizationTypeLabels } from "@/config/trackMapping";
import type { OrganizationType } from "@/types/jobs";

type FormatMode = "paragraph" | "bullet" | "number";
type ImageMode = "upload" | "company" | "none";
type BlockType = "image" | "gallery" | "text" | "table" | "process" | "benefit" | "divider";

const mockOrganizationType: OrganizationType = "pharmaceutical_company";
const mockDerivedTrack = deriveJobTrack(mockOrganizationType);

interface EditorItem {
  id: string;
  text: string;
  bold?: boolean;
  linked?: boolean;
}

interface DetailBlock {
  id: string;
  type: BlockType;
  title: string;
  description: string;
}

interface StructuredEditorProps {
  label: string;
  required?: boolean;
  helper?: string;
  defaultMode: FormatMode;
  initialItems: string[];
  onContentChange: (content: string) => void;
}

const modeOptions: Array<{ mode: FormatMode; label: string; icon: typeof List }> = [
  { mode: "bullet", label: "항목형", icon: List },
  { mode: "number", label: "번호형", icon: ListOrdered },
  { mode: "paragraph", label: "문단형", icon: Pilcrow },
];

const standardKeywordPool = [
  "CTD",
  "규제기관 대응",
  "약사 면허",
  "영어 커뮤니케이션",
  "IND/NDA",
  "FDA",
  "EMA",
  "글로벌 인허가",
  "CMC RA",
  "GMP",
  "허가심사 대응",
  "임상시험계획",
];

const initialIntro = "의약품 허가 및 규제 대응을 총괄하는 RA Specialist 포지션입니다.";

const initialResponsibilities = [
  "의약품 품목 허가, 변경 허가 및 관련 인허가 업무 총괄",
  "CTD 작성 및 제출, 허가심사 대응",
  "규제기관 질의 대응 및 문서 관리",
];

const initialRequirements = ["관련 전공 학사 이상", "RA 유관 경력 3년 이상", "의약품 인허가 업무 경험 보유"];

const initialPreferredQualifications = ["약사 면허 보유자", "영어 커뮤니케이션 가능자", "글로벌 허가 경험 보유자"];

const keywordAliases: Record<string, string> = {
  인허가: "규제기관 대응",
  허가: "규제기관 대응",
  영어: "영어 커뮤니케이션",
  license: "약사 면허",
  pharmacist: "약사 면허",
  nda: "IND/NDA",
  ind: "IND/NDA",
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toEditorItems(lines: string[]) {
  return lines.map((text) => ({ id: uid("item"), text }));
}

function normalizeKeyword(keyword: string) {
  return keyword.toLowerCase().replace(/[\s/·.-]/g, "");
}

function canonicalKeyword(rawKeyword: string) {
  const trimmed = rawKeyword.trim();
  if (!trimmed) return "";

  const aliasMatch = Object.entries(keywordAliases).find(([alias]) => normalizeKeyword(trimmed).includes(normalizeKeyword(alias)));
  if (aliasMatch) {
    return aliasMatch[1];
  }

  return standardKeywordPool.find((keyword) => normalizeKeyword(keyword) === normalizeKeyword(trimmed)) ?? trimmed;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [removed] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, removed);
  return nextItems;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="registration-field-label block pt-2.5 text-[15px] font-black text-[#2d3644]">
      {children}
      {required ? <span className="ml-1 text-danger">*</span> : null}
    </label>
  );
}

function SectionCard({
  title,
  description,
  index,
  status = "입력 중",
  children,
}: {
  title: string;
  description?: string;
  index?: number;
  status?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="registration-section-card surface overflow-hidden">
      <div className="registration-section-header flex items-start justify-between gap-5 border-b border-[#e7ecf2] px-7 py-5">
        <div className="flex items-start gap-3">
          {index ? (
            <span className="registration-section-index mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-[15px] font-black text-white">
              {index}
            </span>
          ) : null}
          <div>
            <h2 className="registration-section-title text-[22px] font-black tracking-[0] text-[#242b36]">{title}</h2>
            {description ? <p className="registration-section-description mt-1.5 text-[13px] font-semibold text-[#768190]">{description}</p> : null}
          </div>
        </div>
        <span className="registration-status-pill mt-1 rounded-full border border-[#dddddd] bg-brand-soft px-3 py-1.5 text-[12px] font-black text-brand">
          {status}
        </span>
      </div>
      <div className="registration-section-body px-7 py-6">{children}</div>
    </section>
  );
}

function FormRow({
  label,
  required,
  children,
  align = "start",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  align?: "start" | "center";
}) {
  return (
    <div
      className={clsx(
        "registration-form-row grid grid-cols-[150px_minmax(0,1fr)] gap-6 border-b border-[#edf1f5] py-4 last:border-b-0 max-[760px]:grid-cols-1 max-[760px]:gap-2",
        align === "center" && "items-center",
      )}
    >
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function PageStepper() {
  const steps = [
    { label: "기본정보", state: "done" },
    { label: "포지션 정보", state: "active" },
    { label: "근무·지원", state: "todo" },
    { label: "미리보기", state: "todo" },
  ];

  return (
    <div className="registration-stepper mt-10 grid grid-cols-[1fr_1fr_1fr_1fr] items-center gap-0">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center">
          <div className="flex items-center gap-3">
            <span
              className={clsx(
                "registration-step-circle grid h-11 w-11 place-items-center rounded-full text-[18px] font-black",
                step.state === "done" && "bg-[#e8e8e8] text-brand",
                step.state === "active" && "bg-brand text-white",
                step.state === "todo" && "bg-[#eef1f4] text-[#8b95a3]",
              )}
            >
              {step.state === "done" ? "✓" : index + 1}
            </span>
            <span className={clsx("registration-step-label text-[18px] font-black", step.state === "active" ? "text-brand" : "text-[#6d7683]")}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 ? <span className="mx-6 h-px flex-1 bg-[#dfe5ec]" /> : null}
        </div>
      ))}
    </div>
  );
}

function CompanySummaryCard() {
  return (
    <section className="registration-company-card surface mt-7 flex items-center justify-between gap-6 px-7 py-6">
      <div className="flex min-w-0 items-center gap-5">
        <div className="grid h-[82px] w-[82px] shrink-0 place-items-center rounded-full border border-[#e2eceb] bg-[#f4f4f4]">
          <div className="relative h-11 w-11">
            <span className="absolute left-0 top-2 h-6 w-6 rounded-full bg-brand opacity-90" />
            <span className="absolute right-0 top-2 h-6 w-6 rounded-full bg-[#6f747b] opacity-80" />
            <span className="absolute bottom-0 left-[11px] h-6 w-6 rounded-full bg-brand opacity-70" />
          </div>
        </div>
        <div className="min-w-0">
          <h2 className="registration-company-title text-[24px] font-black tracking-[0] text-[#252d39]">더팜인제약(주)</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[14px] font-bold text-[#758090]">
            <span>업종&nbsp; 전문의약품 제조업</span>
            <span className="h-3 w-px bg-[#d8dfe7]" />
            <span>규모&nbsp; 501~1000명</span>
            <span className="h-3 w-px bg-[#d8dfe7]" />
            <span>대표 주소&nbsp; 서울 강남구 테헤란로 123, 8층</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="h-11 shrink-0 rounded-[8px] border border-[#d8e0e8] bg-white px-5 text-[14px] font-black text-[#3c4655] transition hover:border-brand hover:text-brand"
      >
        기업 정보 수정
      </button>
    </section>
  );
}

function SelectShell({
  children,
  value,
  onChange,
}: {
  children: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="registration-control h-[52px] w-full appearance-none rounded-[10px] border border-[#dce4ec] bg-white px-4 pr-10 text-[16px] font-bold text-[#333c49] transition hover:border-brand focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a95a5]" size={17} />
    </div>
  );
}

function StructuredEditor({
  label,
  required,
  helper,
  defaultMode,
  initialItems,
  onContentChange,
}: StructuredEditorProps) {
  const [mode, setMode] = useState<FormatMode>(defaultMode);
  const [items, setItems] = useState<EditorItem[]>(() => toEditorItems(initialItems));
  const [focusedId, setFocusedId] = useState(items[0]?.id ?? "");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [history, setHistory] = useState<EditorItem[][]>([]);
  const [future, setFuture] = useState<EditorItem[][]>([]);

  const emitContent = useCallback(
    (nextItems: EditorItem[]) => {
      onContentChange(nextItems.map((item) => item.text).join("\n"));
    },
    [onContentChange],
  );

  const commit = (nextItems: EditorItem[]) => {
    setHistory((current) => [...current.slice(-20), items]);
    setFuture([]);
    setItems(nextItems);
    emitContent(nextItems);
  };

  const changeMode = (nextMode: FormatMode) => {
    if (nextMode === mode) return;

    if (nextMode === "paragraph") {
      const nextItems = [{ id: items[0]?.id ?? uid("item"), text: items.map((item) => item.text).join("\n") }];
      commit(nextItems);
      setMode(nextMode);
      setFocusedId(nextItems[0].id);
      return;
    }

    const splitItems = items
      .flatMap((item) => item.text.split(/\r?\n/))
      .map((text) => text.trim())
      .filter(Boolean);
    const nextItems = toEditorItems(splitItems.length ? splitItems : [""]);
    commit(nextItems);
    setMode(nextMode);
    setFocusedId(nextItems[0]?.id ?? "");
  };

  const updateText = (id: string, text: string) => {
    const nextItems = items.map((item) => (item.id === id ? { ...item, text } : item));
    setItems(nextItems);
    emitContent(nextItems);
  };

  const addItemAfter = (id: string, text = "") => {
    const index = items.findIndex((item) => item.id === id);
    const nextItem = { id: uid("item"), text };
    const nextItems = [...items.slice(0, index + 1), nextItem, ...items.slice(index + 1)];
    commit(nextItems);
    setFocusedId(nextItem.id);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      commit([{ ...items[0], text: "" }]);
      return;
    }

    const nextItems = items.filter((item) => item.id !== id);
    commit(nextItems);
    setFocusedId(nextItems[0]?.id ?? "");
  };

  const onItemKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>, id: string) => {
    if (mode !== "paragraph" && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      addItemAfter(id);
    }
  };

  const onItemPaste = (event: ClipboardEvent<HTMLTextAreaElement>, id: string) => {
    if (mode === "paragraph") return;

    const plainText = event.clipboardData.getData("text/plain");
    const lines = plainText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length <= 1) return;

    event.preventDefault();
    const index = items.findIndex((item) => item.id === id);
    const inserted = lines.map((line, lineIndex) => ({
      id: lineIndex === 0 ? id : uid("item"),
      text: line,
    }));
    const nextItems = [...items.slice(0, index), ...inserted, ...items.slice(index + 1)];
    commit(nextItems);
  };

  const toggleInlineFlag = (flag: "bold" | "linked") => {
    const targetId = focusedId || items[0]?.id;
    if (!targetId) return;
    commit(items.map((item) => (item.id === targetId ? { ...item, [flag]: !item[flag] } : item)));
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory((current) => current.slice(0, -1));
    setFuture((current) => [items, ...current]);
    setItems(previous);
    emitContent(previous);
  };

  const redo = () => {
    const next = future[0];
    if (!next) return;
    setFuture((current) => current.slice(1));
    setHistory((current) => [...current, items]);
    setItems(next);
    emitContent(next);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    if (!draggingId || draggingId === targetId) return;
    const fromIndex = items.findIndex((item) => item.id === draggingId);
    const toIndex = items.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    commit(moveItem(items, fromIndex, toIndex));
    setDraggingId(null);
  };

  const paragraphText = items.map((item) => item.text).join("\n");
  const characterCount = paragraphText.length;

  return (
    <FormRow label={label} required={required}>
      <div className="grid grid-cols-[minmax(0,1fr)_190px] gap-6 max-[980px]:grid-cols-1">
        <div className="overflow-hidden rounded-[10px] border border-[#dfe6ee] bg-white focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
          <div className="flex min-h-[50px] items-center justify-between gap-2 border-b border-[#e5ebf1] bg-white px-3">
            <div className="flex items-center gap-1.5">
              {modeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.mode}
                    type="button"
                    onClick={() => changeMode(option.mode)}
                    className={clsx(
                      "inline-flex h-9 items-center gap-1.5 rounded-[7px] px-3 text-[13px] font-black transition",
                      mode === option.mode ? "bg-brand text-white" : "text-[#596373] hover:bg-[#f5f8fa] hover:text-brand",
                    )}
                  >
                    <Icon size={16} />
                    {option.label}
                  </button>
                );
              })}
              <span className="mx-1 h-5 w-px bg-[#dfe5ec]" />
              <button
                type="button"
                onClick={() => toggleInlineFlag("bold")}
                className="grid h-9 w-9 place-items-center rounded-[7px] text-[#2f3946] transition hover:bg-[#f5f8fa] hover:text-brand"
                aria-label="굵게"
              >
                <Bold size={17} />
              </button>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-[7px] text-[#2f3946] transition hover:bg-[#f5f8fa] hover:text-brand"
                aria-label="기울임"
              >
                <Italic size={17} />
              </button>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-[7px] text-[#2f3946] transition hover:bg-[#f5f8fa] hover:text-brand"
                aria-label="밑줄"
              >
                <Underline size={17} />
              </button>
              <button
                type="button"
                onClick={() => toggleInlineFlag("linked")}
                className="grid h-9 w-9 place-items-center rounded-[7px] text-[#2f3946] transition hover:bg-[#f5f8fa] hover:text-brand"
                aria-label="링크"
              >
                <LinkIcon size={17} />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={undo}
                disabled={!history.length}
                className="grid h-9 w-9 place-items-center rounded-[7px] text-[#8a95a5] transition hover:bg-[#f5f8fa] hover:text-brand disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="실행 취소"
              >
                <Undo2 size={17} />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!future.length}
                className="grid h-9 w-9 place-items-center rounded-[7px] text-[#8a95a5] transition hover:bg-[#f5f8fa] hover:text-brand disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="다시 실행"
              >
                <Redo2 size={17} />
              </button>
            </div>
          </div>

          {mode === "paragraph" ? (
            <div className="relative">
              <textarea
                value={paragraphText}
                onChange={(event) => {
                  const nextItems = [{ id: items[0]?.id ?? uid("item"), text: event.target.value }];
                  setItems(nextItems);
                  emitContent(nextItems);
                }}
                onFocus={() => setFocusedId(items[0]?.id ?? "")}
                rows={label.includes("한 줄") ? 2 : 5}
                className={clsx(
                  "min-h-[94px] w-full resize-y border-0 bg-white px-5 py-4 pb-9 text-[15px] font-semibold leading-[1.75] text-[#333c49] outline-none placeholder:text-[#a3adba]",
                  items[0]?.bold && "font-black",
                  items[0]?.linked && "text-brand underline decoration-brand/40 underline-offset-4",
                )}
              />
              <span className="absolute bottom-3 right-4 text-[12px] font-bold text-[#98a2b0]">
                {characterCount} / 800
              </span>
            </div>
          ) : (
            <div className="relative space-y-2 bg-white p-3 pb-9">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => onDrop(event, item.id)}
                  className={clsx(
                    "flex items-start gap-2 rounded-[8px] border border-transparent bg-white px-2.5 py-1.5 transition",
                    draggingId === item.id ? "border-brand bg-brand-soft" : "hover:border-[#dce5ed] hover:bg-[#fbfcfd]",
                  )}
                >
                  <button
                    type="button"
                    draggable={items.length > 1}
                    onDragStart={(event) => {
                      setDraggingId(item.id);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-[6px] text-[#b1bac6] hover:bg-[#f4f7f9] hover:text-brand"
                    aria-label={`${label} ${index + 1}번째 항목 순서 변경`}
                  >
                    <GripVertical size={16} />
                  </button>
                  <span className="mt-[8px] w-5 shrink-0 text-center text-[15px] font-black text-[#202733]">
                    {mode === "number" ? `${index + 1}.` : "•"}
                  </span>
                  <textarea
                    value={item.text}
                    onFocus={() => setFocusedId(item.id)}
                    onKeyDown={(event) => onItemKeyDown(event, item.id)}
                    onPaste={(event) => onItemPaste(event, item.id)}
                    onChange={(event) => updateText(item.id, event.target.value)}
                    rows={item.text.includes("\n") ? 2 : 1}
                    className={clsx(
                      "min-h-[38px] flex-1 resize-y rounded-[6px] border border-transparent bg-transparent px-2 py-2 text-[15px] font-semibold leading-[1.55] text-[#333c49] outline-none focus:border-[#d8e1e9] focus:bg-white",
                      item.bold && "font-black",
                      item.linked && "text-brand underline decoration-brand/40 underline-offset-4",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-[6px] text-[#b1bac6] transition hover:bg-[#fff0f0] hover:text-danger"
                    aria-label={`${label} ${index + 1}번째 항목 삭제`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <span className="absolute bottom-3 right-4 text-[12px] font-bold text-[#98a2b0]">
                {characterCount} / 800
              </span>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div>
            <h4 className="mb-2 text-[14px] font-black text-[#343d4a]">표시 형식</h4>
            <div className="grid grid-cols-3 overflow-hidden rounded-[10px] border border-[#dce4ec] bg-white">
              {modeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.mode}
                    type="button"
                    onClick={() => changeMode(option.mode)}
                    className={clsx(
                      "grid h-12 place-items-center border-r border-[#e4e9ef] last:border-r-0 transition",
                      mode === option.mode ? "bg-[#eeeeee] text-brand" : "text-[#202733] hover:bg-[#f7f9fb]",
                    )}
                    aria-label={`${option.label}으로 표시`}
                  >
                    <Icon size={21} />
                  </button>
                );
              })}
            </div>
          </div>
          {helper ? (
            <div className="rounded-[12px] bg-[#f2f2f2] px-4 py-4">
              <h4 className="text-[15px] font-black text-brand">입력 팁</h4>
              <ul className="mt-2 space-y-1.5 text-[13px] font-bold leading-[1.55] text-[#566171]">
                <li>Enter: 새 항목 추가</li>
                <li>Shift + Enter: 줄바꿈</li>
                <li>드래그: 항목 순서 변경</li>
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </FormRow>
  );
}

function KeywordPanel({
  selectedStandard,
  selectedFree,
  suggestions,
  inputValue,
  message,
  onInputChange,
  onAddKeyword,
  onSelectKeyword,
  onRemoveKeyword,
}: {
  selectedStandard: string[];
  selectedFree: string[];
  suggestions: string[];
  inputValue: string;
  message: string;
  onInputChange: (value: string) => void;
  onAddKeyword: () => void;
  onSelectKeyword: (keyword: string) => void;
  onRemoveKeyword: (keyword: string) => void;
}) {
  const selectedKeywords = [...selectedStandard, ...selectedFree];

  return (
    <SectionCard
      index={3}
      title="핵심 역량 및 전문분야"
      description="검색, 추천, 유사 공고, 알림, 헤드헌팅 매칭에 활용되는 구조화 데이터입니다."
      status="입력 중"
    >
      <div className="grid gap-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[14px] font-black text-[#364050]">선택된 키워드</h3>
            <span className="text-[12px] font-bold text-[#7d8796]">표준 {selectedStandard.length}/8 · 자유 {selectedFree.length}/3</span>
          </div>
          <div className="flex min-h-[46px] flex-wrap gap-2 rounded-[9px] border border-[#dfe7ee] bg-[#fbfcfd] p-3">
            {selectedKeywords.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => onRemoveKeyword(keyword)}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-black transition",
                  selectedStandard.includes(keyword)
                    ? "border-[#dddddd] bg-brand-soft text-brand hover:border-brand"
                    : "border-[#dfe7ee] bg-white text-[#566171] hover:border-brand hover:text-brand",
                )}
              >
                {keyword}
                <X size={14} />
              </button>
            ))}
            {!selectedKeywords.length ? (
              <span className="text-[13px] font-semibold text-[#8a95a5]">키워드를 선택하거나 직접 추가해 주세요.</span>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-[14px] font-black text-[#364050]">시스템 추천 키워드</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => onSelectKeyword(keyword)}
                disabled={selectedStandard.length >= 8}
                className="rounded-full border border-[#dce5ed] bg-white px-3.5 py-2 text-[13px] font-black text-[#47515f] transition hover:border-brand hover:bg-brand-soft hover:text-brand disabled:cursor-not-allowed disabled:opacity-45"
              >
                + {keyword}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-[14px] font-black text-[#364050]">직접 추가</h3>
          <div className="flex gap-2">
            <input
              value={inputValue}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onAddKeyword();
                }
              }}
              placeholder="키워드를 검색하거나 입력하세요"
              className="h-11 flex-1 rounded-[8px] border border-border px-3.5 text-[14px] font-semibold outline-none transition placeholder:text-[#a4adba] hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
            <button
              type="button"
              onClick={onAddKeyword}
              className="inline-flex h-11 items-center gap-1.5 rounded-[8px] bg-brand px-4 text-[14px] font-black text-white hover:bg-[var(--color-brand-dark)]"
            >
              <Plus size={17} />
              추가
            </button>
          </div>
          {message ? <p className="mt-2 text-[12px] font-bold text-brand">{message}</p> : null}
        </div>

        <div className="rounded-[9px] bg-[#f7f7f7] px-4 py-3 text-[12px] font-semibold leading-[1.65] text-[#687484]">
          공고 목록에는 핵심 키워드 최대 3개, 상세 상단에는 직무·산업 태그 최대 3개, 본문에는 핵심 역량 및 전문분야 최대 8개가 노출됩니다.
        </div>
      </div>
    </SectionCard>
  );
}

export function JobPostingRegistrationForm() {
  const [title, setTitle] = useState("RA Specialist (제약·바이오 인허가 담당)");
  const [jobRole, setJobRole] = useState("RA / 인허가");
  const [introContent, setIntroContent] = useState(initialIntro);
  const [responsibilityContent, setResponsibilityContent] = useState(initialResponsibilities.join("\n"));
  const [requirementContent, setRequirementContent] = useState(initialRequirements.join("\n"));
  const [preferredContent, setPreferredContent] = useState(initialPreferredQualifications.join("\n"));
  const [selectedStandard, setSelectedStandard] = useState(["CTD", "규제기관 대응", "약사 면허", "영어 커뮤니케이션"]);
  const [selectedFree, setSelectedFree] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywordMessage, setKeywordMessage] = useState("");
  const [imageMode, setImageMode] = useState<ImageMode>("upload");
  const [imagePreview, setImagePreview] = useState("");
  const [detailBlocks, setDetailBlocks] = useState<DetailBlock[]>([]);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState("저장 전");
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const dynamicSuggestions = useMemo(() => {
    const content = `${jobRole} ${responsibilityContent} ${requirementContent}`.toLowerCase();
    const base = jobRole.includes("RA") ? ["IND/NDA", "FDA", "EMA", "글로벌 인허가", "CMC RA"] : ["GMP", "허가심사 대응"];
    const extra = [
      content.includes("ctd") || content.includes("문서") ? "CTD" : "",
      content.includes("영어") || content.includes("global") || content.includes("글로벌") ? "영어 커뮤니케이션" : "",
      content.includes("규제") || content.includes("기관") ? "규제기관 대응" : "",
      content.includes("임상") ? "임상시험계획" : "",
    ].filter(Boolean);

    return [...base, ...extra, ...standardKeywordPool].filter(
      (keyword, index, array) =>
        keyword &&
        array.indexOf(keyword) === index &&
        ![...selectedStandard, ...selectedFree].some((selected) => normalizeKeyword(selected) === normalizeKeyword(keyword)),
    );
  }, [jobRole, requirementContent, responsibilityContent, selectedFree, selectedStandard]);

  const missingItems = useMemo(() => {
    const entries = [
      ["공고 제목", title.trim()],
      ["직무", jobRole.trim()],
      ["포지션 소개", introContent.trim()],
      ["주요업무", responsibilityContent.trim()],
      ["자격요건", requirementContent.trim()],
    ];
    return entries.filter(([, value]) => !value).map(([label]) => label);
  }, [introContent, jobRole, requirementContent, responsibilityContent, title]);

  const addStandardKeyword = (rawKeyword: string) => {
    const keyword = canonicalKeyword(rawKeyword);
    if (!keyword) return;

    const exists = [...selectedStandard, ...selectedFree].some(
      (selected) => normalizeKeyword(selected) === normalizeKeyword(keyword),
    );

    if (exists) {
      setKeywordMessage(`${keyword} 키워드는 이미 선택되어 유사 키워드와 통합했습니다.`);
      return;
    }

    if (selectedStandard.length >= 8) {
      setKeywordMessage("표준 키워드는 최대 8개까지 선택할 수 있습니다.");
      return;
    }

    setSelectedStandard((current) => [...current, keyword]);
    setKeywordMessage(`${keyword} 키워드를 추가했습니다.`);
  };

  const addKeywordFromInput = () => {
    const keyword = canonicalKeyword(keywordInput);
    if (!keyword) return;

    const exists = [...selectedStandard, ...selectedFree].some(
      (selected) => normalizeKeyword(selected) === normalizeKeyword(keyword),
    );

    if (exists) {
      setKeywordMessage(`${keyword} 키워드는 이미 선택되어 유사 키워드와 통합했습니다.`);
      setKeywordInput("");
      return;
    }

    if (standardKeywordPool.some((standard) => normalizeKeyword(standard) === normalizeKeyword(keyword))) {
      addStandardKeyword(keyword);
      setKeywordInput("");
      return;
    }

    if (selectedFree.length >= 3) {
      setKeywordMessage("자유 키워드는 최대 3개까지 추가할 수 있습니다.");
      return;
    }

    setSelectedFree((current) => [...current, keyword]);
    setKeywordMessage(`${keyword} 자유 키워드를 추가했습니다.`);
    setKeywordInput("");
  };

  const removeKeyword = (keyword: string) => {
    setSelectedStandard((current) => current.filter((item) => item !== keyword));
    setSelectedFree((current) => current.filter((item) => item !== keyword));
  };

  const onImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageMode("upload");
    setImagePreview(URL.createObjectURL(file));
  };

  const addBlock = (type: BlockType) => {
    const blockCopy: Record<BlockType, { title: string; description: string }> = {
      image: { title: "이미지", description: "연구소 또는 팀 이미지를 업로드합니다." },
      gallery: { title: "이미지 갤러리", description: "여러 장의 사진을 묶어 보여줍니다." },
      text: { title: "텍스트 블록", description: "회사 소개나 조직 설명을 입력합니다." },
      table: { title: "표", description: "복리후생, 일정, 보상 정보를 표로 정리합니다." },
      process: { title: "채용 절차", description: "전형 단계와 예상 일정을 보조 자료로 설명합니다." },
      benefit: { title: "복리후생", description: "혜택과 제도를 보기 쉽게 묶습니다." },
      divider: { title: "구분선", description: "상세 자료 사이를 구분합니다." },
    };
    setDetailBlocks((current) => [{ id: uid("block"), type, ...blockCopy[type] }, ...current]);
  };

  const onBlockDrop = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    if (!draggingBlockId || draggingBlockId === targetId) return;
    const fromIndex = detailBlocks.findIndex((block) => block.id === draggingBlockId);
    const toIndex = detailBlocks.findIndex((block) => block.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    setDetailBlocks(moveItem(detailBlocks, fromIndex, toIndex));
    setDraggingBlockId(null);
  };

  const saveDraft = () => {
    const now = new Date();
    setSaveStatus(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} 임시 저장됨`);
    setNotice("작성 중인 공고가 브라우저 상태에 임시 저장되었습니다.");
  };

  const showPreview = () => {
    setNotice("미리보기 화면을 열 준비가 되었습니다. 현재 입력된 구조화 정보 기준으로 표시됩니다.");
  };

  const goNext = () => {
    if (missingItems.length) {
      setNotice(`필수 항목을 먼저 입력해 주세요: ${missingItems.join(", ")}`);
      return;
    }
    setNotice("다음 단계로 이동할 수 있습니다.");
  };

  return (
    <main className="registration-page bg-[#f6f8fa] pb-28 pt-10">
      <div className="registration-container mx-auto">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#8a95a5]">
              <Building2 size={15} />
              기업 서비스
              <span className="text-[#c4cbd5]">/</span>
              공고 등록
            </div>
            <h1 className="registration-page-title mt-5 text-[42px] font-black tracking-[0] text-[#111827]">공고 등록</h1>
            <p className="registration-page-subtitle mt-3 text-[18px] font-bold text-[#747f8f]">
              채용 공고를 손쉽게 등록하세요.
            </p>
          </div>
          <div className="hidden gap-2 xl:flex">
            <button
              type="button"
              onClick={saveDraft}
              className="h-11 rounded-[8px] border border-[#d8e0e8] bg-white px-5 text-[14px] font-black text-[#44505f] transition hover:border-brand hover:text-brand"
            >
              임시 저장
            </button>
            <button
              type="button"
              onClick={showPreview}
              className="h-11 rounded-[8px] border border-[#d8e0e8] bg-white px-5 text-[14px] font-black text-[#44505f] transition hover:border-brand hover:text-brand"
            >
              미리보기
            </button>
          </div>
        </div>

        <PageStepper />
        <CompanySummaryCard />

        {notice ? (
          <div className="mt-5 flex items-center justify-between rounded-[9px] border border-[#dddddd] bg-brand-soft px-4 py-3 text-[13px] font-black text-brand">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} aria-label="알림 닫기">
              <X size={16} />
            </button>
          </div>
        ) : null}

        <div className="registration-layout mt-7 grid grid-cols-[minmax(0,1fr)_300px] gap-5 max-[1180px]:grid-cols-1">
          <div className="registration-main-stack min-w-0 space-y-6">
            <SectionCard index={1} title="기본 정보" description="공고의 분류, 직무, 기본 조건을 입력합니다." status="완료">
              <div>
                <FormRow label="공고 제목" required align="center">
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="registration-control h-[52px] w-full rounded-[10px] border border-[#dce4ec] px-5 py-3 text-[17px] font-bold text-[#333c49] outline-none transition hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                </FormRow>

                <FormRow label="채용 트랙" required align="center">
                  <div className="max-w-[720px] rounded-[10px] border border-[#dddddd] bg-[#f7f7f7] px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-8 items-center rounded-[var(--radius)] bg-brand px-3 text-[13px] font-black text-white">
                        {jobTrackLabels[mockDerivedTrack]} 트랙
                      </span>
                      <span className="text-[14px] font-black text-[#303946]">
                        {organizationTypeLabels[mockOrganizationType]} 계정 기준으로 자동 분류됩니다.
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] font-semibold leading-[1.6] text-[#667181]">
                      공고 등록 시 사용자가 산업·연구·약국·병원을 직접 선택하지 않습니다. 추후 백엔드에서는 로그인한 기관 프로필의
                      organizationType을 읽어 같은 helper로 트랙과 직무 분류를 자동 적용합니다.
                    </p>
                  </div>
                </FormRow>

                <FormRow label="직무" required align="center">
                  <div className="grid grid-cols-[minmax(0,1fr)_142px] gap-4 max-[760px]:grid-cols-1">
                    <div className="flex h-[52px] items-center rounded-[10px] border border-[#dce4ec] bg-white px-5 text-[16px] font-bold text-[#333c49]">
                      인허가·메디컬
                      <ChevronDown className="mx-3 rotate-[-90deg] text-[#a0a9b7]" size={17} />
                      RA
                    </div>
                    <button
                      type="button"
                      className="h-[52px] rounded-[10px] border border-[#d8e0e8] bg-white px-4 text-[15px] font-black text-[#343d4a] transition hover:border-brand hover:text-brand"
                    >
                      직무 선택
                    </button>
                  </div>
                </FormRow>

                <FormRow label="모집 인원" required align="center">
                  <div className="grid grid-cols-[1fr_1fr_1fr] gap-5 max-[760px]:grid-cols-1">
                    <SelectShell>
                      <option>1명</option>
                      <option>2명</option>
                      <option>3명 이상</option>
                    </SelectShell>
                    <SelectShell>
                      <option>경력 3~5년</option>
                      <option>경력 2~4년</option>
                      <option>신입 가능</option>
                      <option>경력 5년 이상</option>
                    </SelectShell>
                    <SelectShell>
                      <option>학사 이상</option>
                      <option>전문학사 이상</option>
                      <option>석사 이상</option>
                    </SelectShell>
                  </div>
                </FormRow>

                <FormRow label="고용 형태" required align="center">
                  <div className="grid grid-cols-[1fr_1fr_220px] items-center gap-5 max-[900px]:grid-cols-1">
                    <SelectShell>
                      <option>정규직</option>
                      <option>계약직</option>
                      <option>인턴</option>
                    </SelectShell>
                    <SelectShell>
                      <option>서울 강남구</option>
                      <option>서울 서초구</option>
                      <option>경기 성남시</option>
                    </SelectShell>
                    <label className="inline-flex h-[52px] items-center gap-2 rounded-[10px] border border-transparent px-1 text-[15px] font-black text-[#4c5665]">
                      <input type="checkbox" defaultChecked className="h-5 w-5 accent-[var(--color-brand)]" />
                      재택근무 가능
                      <Info size={16} className="text-[#9aa4b2]" />
                    </label>
                  </div>
                </FormRow>

                <FormRow label="급여" required align="center">
                  <input
                    defaultValue="회사 내규에 따름"
                    className="registration-control h-[52px] w-full rounded-[10px] border border-[#dce4ec] px-5 py-3 text-[16px] font-bold text-[#333c49] outline-none transition hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                </FormRow>
              </div>
            </SectionCard>

            <SectionCard index={2} title="포지션 소개" description="주요 내용은 반드시 텍스트 구조로 입력해 검색과 추천에 활용되도록 합니다." status="입력 중">
              <div>
                <StructuredEditor
                  label="포지션 한 줄 소개"
                  required
                  defaultMode="paragraph"
                  initialItems={[initialIntro]}
                  onContentChange={setIntroContent}
                />
                <StructuredEditor
                  label="주요업무"
                  required
                  helper="Enter 새 항목 · Shift+Enter 줄바꿈"
                  defaultMode="bullet"
                  initialItems={initialResponsibilities}
                  onContentChange={setResponsibilityContent}
                />
                <StructuredEditor
                  label="자격요건"
                  required
                  defaultMode="bullet"
                  initialItems={initialRequirements}
                  onContentChange={setRequirementContent}
                />
                <StructuredEditor
                  label="우대사항"
                  defaultMode="bullet"
                  initialItems={initialPreferredQualifications}
                  onContentChange={setPreferredContent}
                />
              </div>
            </SectionCard>

            <KeywordPanel
              selectedStandard={selectedStandard}
              selectedFree={selectedFree}
              suggestions={dynamicSuggestions.slice(0, 8)}
              inputValue={keywordInput}
              message={keywordMessage}
              onInputChange={setKeywordInput}
              onAddKeyword={addKeywordFromInput}
              onSelectKeyword={addStandardKeyword}
              onRemoveKeyword={removeKeyword}
            />

            <SectionCard
              index={4}
              title="공고 대표 이미지"
              description="연구소, 사무실, 팀, 제품 또는 회사 분위기를 보여주는 이미지를 등록해 주세요."
              status="선택"
            >
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { mode: "upload" as ImageMode, label: "이미지 업로드", icon: Upload },
                  { mode: "company" as ImageMode, label: "기업 이미지에서 선택", icon: ImageIcon },
                  { mode: "none" as ImageMode, label: "이미지 없이 등록", icon: ImageOff },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.mode}
                      type="button"
                      onClick={() => {
                        setImageMode(option.mode);
                        setImagePreview(option.mode === "company" ? "/images/company-office.svg" : "");
                      }}
                      className={clsx(
                        "inline-flex h-10 items-center gap-2 rounded-[8px] border px-3.5 text-[13px] font-black transition",
                        imageMode === option.mode
                          ? "border-brand bg-brand-soft text-brand"
                          : "border-border bg-white text-[#536071] hover:border-brand hover:text-brand",
                      )}
                    >
                      <Icon size={16} />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onImageUpload} />

              {imageMode === "none" ? (
                <div className="rounded-[10px] border border-[#dfe7ee] bg-[#fbfcfd] px-5 py-5 text-[14px] font-semibold leading-[1.7] text-[#667181]">
                  대표 이미지 없이 등록합니다. 상세 페이지에서는 기업 로고와 브랜드 컬러로 기본 커버를 자동 생성합니다.
                </div>
              ) : imagePreview ? (
                <div className="rounded-[10px] border border-[#dfe7ee] bg-white p-3">
                  <img src={imagePreview} alt="공고 대표 이미지 미리보기" className="h-[190px] w-full rounded-[8px] object-cover" />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[12px] font-bold text-[#7a8594]">상세 페이지 상단 커버와 추천 공고 카드에 우선 노출됩니다.</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-9 rounded-[7px] border border-border bg-white px-3 text-[13px] font-black text-[#536071] hover:border-brand hover:text-brand"
                      >
                        이미지 변경
                      </button>
                      <button
                        type="button"
                        onClick={() => setImagePreview("")}
                        className="h-9 rounded-[7px] border border-border bg-white px-3 text-[13px] font-black text-danger hover:border-danger"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="grid min-h-[174px] w-full place-items-center rounded-[10px] border border-dashed border-[#bfcbd7] bg-[#fbfcfd] px-6 text-center transition hover:border-brand hover:bg-brand-soft"
                >
                  <span>
                    <Upload className="mx-auto text-brand" size={32} />
                    <span className="mt-3 block text-[15px] font-black text-[#364050]">이미지를 업로드하세요</span>
                    <span className="mt-2 block text-[12px] font-semibold leading-[1.7] text-[#7d8796]">
                      권장 비율: 가로형 · 권장 크기: 1600×560px · JPG, PNG, WebP · 최대 5MB
                    </span>
                  </span>
                </button>
              )}
            </SectionCard>

            <SectionCard
              index={5}
              title="상세 소개 자료 · 선택"
              description="회사 소개, 조직도, 채용 절차, 복리후생 자료 등을 추가할 수 있습니다."
              status="선택"
            >
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => addBlock("image")} className="subtle-button h-10 px-3.5 text-[13px] font-black">
                  + 이미지 추가
                </button>
                <button type="button" onClick={() => addBlock("text")} className="subtle-button h-10 px-3.5 text-[13px] font-black">
                  + 텍스트 블록
                </button>
                <button type="button" onClick={() => addBlock("table")} className="subtle-button h-10 px-3.5 text-[13px] font-black">
                  + 표 추가
                </button>
                <button type="button" onClick={() => addBlock("gallery")} className="subtle-button h-10 px-3.5 text-[13px] font-black">
                  이미지 갤러리
                </button>
                <button type="button" onClick={() => addBlock("process")} className="subtle-button h-10 px-3.5 text-[13px] font-black">
                  채용 절차
                </button>
                <button type="button" onClick={() => addBlock("benefit")} className="subtle-button h-10 px-3.5 text-[13px] font-black">
                  복리후생
                </button>
                <button type="button" onClick={() => addBlock("divider")} className="subtle-button h-10 px-3.5 text-[13px] font-black">
                  구분선
                </button>
              </div>

              <div className="mt-4 rounded-[9px] border border-[#f0d6a8] bg-[#fff9ed] px-4 py-3 text-[12px] font-bold leading-[1.65] text-[#8a641c]">
                주요업무, 자격요건, 우대사항, 근무조건, 지원 방법 등 핵심 정보는 이미지로만 대체할 수 없습니다.
              </div>

              <div className="mt-4 space-y-2">
                {detailBlocks.length ? (
                  detailBlocks.map((block) => (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(event) => {
                        setDraggingBlockId(block.id);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => setDraggingBlockId(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => onBlockDrop(event, block.id)}
                      className={clsx(
                        "flex items-center gap-3 rounded-[9px] border bg-white px-3.5 py-3 transition",
                        draggingBlockId === block.id ? "border-brand bg-brand-soft" : "border-[#e1e8ee]",
                      )}
                    >
                      <GripVertical size={18} className="text-[#a0a9b7]" />
                      {block.type === "table" ? <Table2 size={20} className="text-brand" /> : <FileText size={20} className="text-brand" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-black text-[#364050]">{block.title}</p>
                        <p className="truncate text-[12px] font-semibold text-[#7d8796]">{block.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDetailBlocks((current) => current.filter((item) => item.id !== block.id))}
                        className="grid h-8 w-8 place-items-center rounded-[7px] text-[#a0a9b7] hover:bg-[#fff0f0] hover:text-danger"
                        aria-label={`${block.title} 블록 삭제`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="grid min-h-[90px] place-items-center rounded-[9px] border border-dashed border-[#cfd9e2] bg-[#fbfcfd] text-[13px] font-semibold text-[#8a95a5]">
                    추가된 상세 자료가 없습니다.
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard index={6} title="근무 조건" description="근무 방식과 복리후생 등 조건을 입력합니다." status="완료">
              <div>
                <FormRow label="근무시간" required align="center">
                  <input defaultValue="주 5일, 09:00~18:00" className="h-11 w-full rounded-[8px] border border-border px-3.5 text-[14px] font-bold outline-none transition hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10" />
                </FormRow>
                <FormRow label="근무 방식" align="center">
                  <SelectShell>
                    <option>사무실 근무</option>
                    <option>하이브리드</option>
                    <option>원격 근무</option>
                  </SelectShell>
                </FormRow>
                <FormRow label="근무조건 상세" required>
                  <textarea
                    defaultValue={"4대 보험, 연차, 교육비 지원, 성과급 제도를 운영합니다."}
                    rows={3}
                    className="w-full resize-y rounded-[8px] border border-border px-3.5 py-3 text-[14px] font-semibold leading-[1.65] outline-none transition hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                </FormRow>
              </div>
            </SectionCard>

            <SectionCard index={7} title="지원 방법" description="지원 방식과 마감일, 제출 안내를 입력합니다." status="완료">
              <div>
                <FormRow label="지원 방식" required align="center">
                  <SelectShell>
                    <option>기업 홈페이지 지원</option>
                    <option>간편 지원</option>
                  </SelectShell>
                </FormRow>
                <FormRow label="마감일" required align="center">
                  <input
                    type="date"
                    defaultValue="2026-06-30"
                    className="h-11 w-full rounded-[8px] border border-border px-3.5 text-[14px] font-bold outline-none transition hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                </FormRow>
                <FormRow label="지원 안내" required>
                  <textarea
                    defaultValue={"기업 채용 홈페이지에서 지원서를 제출합니다.\n이력서와 경력기술서를 함께 첨부해 주세요."}
                    rows={3}
                    className="w-full resize-y rounded-[8px] border border-border px-3.5 py-3 text-[14px] font-semibold leading-[1.65] outline-none transition hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                </FormRow>
              </div>
            </SectionCard>

            <div className="surface px-5 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={19} className="mt-0.5 text-brand" />
                <p className="text-[13px] font-bold leading-[1.7] text-[#596373]">
                  이미지나 채용 포스터를 추가할 수 있지만, 검색과 추천을 위해 주요업무·자격요건·근무조건은 반드시 별도로 입력해 주세요.
                </p>
              </div>
            </div>
          </div>

          <aside className="registration-sidebar sticky top-5 h-fit space-y-4 max-[1180px]:static">
            <section className="registration-progress-card surface px-7 py-7">
              <h2 className="border-b border-[#e3e9ef] pb-5 text-[22px] font-black text-[#242b36]">등록 진행 상황</h2>
              <div className="registration-progress-list">
                {[
                  { label: "기본 정보", sub: "더팜인제약(주)", state: "done" },
                  {
                    label: "포지션 정보",
                    sub: ["기본 정보", "포지션 소개", "핵심 역량 및 전문분야", "이미지 및 상세 소개"],
                    state: "active",
                  },
                  { label: "근무조건", sub: "근무 조건", state: "todo" },
                  { label: "지원방법", sub: "지원 방식 및 절차", state: "todo" },
                  { label: "미리보기", sub: "최종 확인 및 등록", state: "todo" },
                ].map((item) => (
                  <div key={item.label} className="registration-progress-item">
                    <span
                      className={clsx(
                        "registration-progress-marker",
                        item.state === "done" && "border-brand bg-brand text-white",
                        item.state === "active" && "border-brand bg-brand text-white",
                        item.state === "todo" && "border-[#cfd7e1] bg-[#eef1f4] text-[#9aa4b2]",
                      )}
                    >
                      {item.state === "done" ? "✓" : ""}
                    </span>
                    <h3 className={clsx("text-[18px] font-black", item.state === "todo" ? "text-[#2f3946]" : "text-[#111827]")}>
                      {item.label}
                    </h3>
                    {Array.isArray(item.sub) ? (
                      <ul className="mt-3 space-y-2">
                        {item.sub.map((sub, index) => (
                          <li
                            key={sub}
                            className={clsx(
                              "text-[14px] font-black",
                              index === 1 ? "text-brand" : "text-[#9aa4b2]",
                            )}
                          >
                            <span className={clsx("mr-2 inline-block h-1.5 w-1.5 rounded-full", index === 1 ? "bg-brand" : "bg-[#c8d0da]")} />
                            {sub}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-[14px] font-bold text-[#8a95a5]">{item.sub}</p>
                    )}
                  </div>
                ))}
              </div>
              {missingItems.length ? (
                <div className="mt-5 rounded-[10px] bg-[#fff3f3] px-4 py-3 text-[13px] font-bold leading-[1.6] text-danger">
                  필수 누락: {missingItems.join(", ")}
                </div>
              ) : null}
            </section>

            <section className="registration-exposure-card surface overflow-hidden bg-[#f4f4f4] px-7 py-7">
              <h2 className="text-[22px] font-black text-brand">공고 노출 형태</h2>
              <p className="mt-3 text-[16px] font-bold leading-[1.55] text-[#3f4855]">
                등록 완료 후 표준화된 형식으로 더팜인에 노출됩니다.
              </p>
              <div className="mt-6 overflow-hidden rounded-[12px] border border-[#e0e8ef] bg-white p-4">
                <div className="flex min-w-0 gap-3">
                  <div className="w-[82px] shrink-0 rounded-[8px] bg-[#eef3f7] p-3">
                    <span className="block h-3 w-14 rounded-full bg-[#cfd8e2]" />
                    <span className="mt-3 block h-3 w-12 rounded-full bg-[#d9e1ea]" />
                    <span className="mt-3 block h-3 w-16 rounded-full bg-[#d9e1ea]" />
                    <span className="mt-3 block h-3 w-10 rounded-full bg-[#d9e1ea]" />
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <span className="block h-4 w-full max-w-[132px] rounded-full bg-[#cad7e6]" />
                    <span className="mt-4 block h-3 w-[64%] rounded-full bg-[#dfe5ec]" />
                    <span className="mt-3 block h-3 w-full rounded-full bg-[#dfe5ec]" />
                    <span className="mt-3 block h-3 w-[92%] rounded-full bg-[#dfe5ec]" />
                    <span className="mt-4 block h-3 w-[74%] rounded-full bg-[#dfe5ec]" />
                  </div>
                </div>
              </div>
              <ul className="mt-5 space-y-2 text-[14px] font-bold leading-[1.6] text-[#687484]">
                <li>목록: 제목, 회사, 핵심 키워드 노출</li>
                <li>상세: 모든 정보 + 이미지 노출</li>
                <li>검색/추천: 핵심 키워드 활용</li>
              </ul>
            </section>

            <section className="surface space-y-3 px-7 py-6">
              <button
                type="button"
                onClick={saveDraft}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-[#d8e0e8] bg-white text-[15px] font-black text-[#47515f] transition hover:border-brand hover:text-brand"
              >
                <Save size={18} />
                저장/미리보기
              </button>
              <button
                type="button"
                onClick={showPreview}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-[#d8e0e8] bg-white text-[15px] font-black text-[#47515f] transition hover:border-brand hover:text-brand"
              >
                <Eye size={18} />
                미리보기
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-brand text-[16px] font-black text-white shadow-[0_4px_14px_rgba(17,17,17,0.18)] transition hover:bg-[var(--color-brand-dark)]"
              >
                다음
                <ArrowRight size={19} />
              </button>
              <p className="pt-1 text-center text-[12px] font-bold text-[#7d8796]">{saveStatus}</p>
            </section>

            <section className="surface px-7 py-6">
              <h2 className="flex items-center gap-2 text-[17px] font-black text-[#242b36]">
                <HelpCircle size={18} className="text-brand" />
                도움말
              </h2>
              <p className="mt-2 text-[13px] font-semibold leading-[1.65] text-[#667181]">
                긴 채용 포스터는 상세 소개 자료에 추가하고, 핵심 조건은 입력 필드에 별도로 정리하면 검색 노출이 좋아집니다.
              </p>
            </section>
          </aside>
        </div>
      </div>

      <div className="registration-bottom-bar fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 shadow-[0_-4px_16px_rgba(20,32,46,0.08)] backdrop-blur">
        <div className="app-shell flex h-[72px] items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#667181]">
            <RotateCcw size={16} />
            {saveStatus}
          </div>
          <div className="flex gap-2">
            <button type="button" className="h-11 rounded-[8px] border border-border bg-white px-4 text-[14px] font-black text-[#536071] hover:border-brand hover:text-brand">
              이전
            </button>
            <button type="button" onClick={saveDraft} className="h-11 rounded-[8px] border border-border bg-white px-4 text-[14px] font-black text-[#536071] hover:border-brand hover:text-brand">
              임시 저장
            </button>
            <button type="button" onClick={showPreview} className="h-11 rounded-[8px] border border-border bg-white px-4 text-[14px] font-black text-[#536071] hover:border-brand hover:text-brand">
              미리보기
            </button>
            <button type="button" onClick={goNext} className="h-11 rounded-[8px] bg-brand px-5 text-[14px] font-black text-white hover:bg-[var(--color-brand-dark)]">
              다음
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
