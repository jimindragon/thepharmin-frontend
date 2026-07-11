"use client";

import clsx from "clsx";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";

const PROCESS_STEP_OPTIONS = [
  "서류 전형",
  "인적성 검사",
  "직무적합성 평가",
  "1차 면접",
  "2차 면접",
  "실무 면접",
  "임원 면접",
  "처우 협의",
  "채용검진",
  "신원조회",
  "최종합격",
];

const DOCUMENT_OPTIONS = [
  "이력서",
  "자기소개서",
  "경력기술서",
  "포트폴리오",
  "연구 실적 목록",
  "학위증명서",
  "졸업예정증명서",
  "성적증명서",
  "자격증 사본",
  "면허증 사본",
  "개인정보 수집·이용 동의서",
];

const LBL = "block mb-1.5 text-[14px] font-medium text-[#2f3845]";
const HINT = "mt-1 text-[11.5px] text-[#a0a9b7]";
const IN = "h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8";

export interface HiringProcessSelectorProps {
  processSteps: string[];
  onProcessChange: (value: string[]) => void;
  documents: string[];
  onDocumentsChange: (value: string[]) => void;
}

export function HiringProcessSelector({
  processSteps,
  onProcessChange,
  documents,
  onDocumentsChange,
}: HiringProcessSelectorProps) {
  const [customStepInput, setCustomStepInput] = useState("");
  const [customDocInput, setCustomDocInput] = useState("");

  function toggleStep(option: string) {
    if (processSteps.includes(option)) {
      onProcessChange(processSteps.filter((step) => step !== option));
    } else {
      onProcessChange([...processSteps, option]);
    }
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= processSteps.length) return;
    const next = [...processSteps];
    [next[index], next[target]] = [next[target], next[index]];
    onProcessChange(next);
  }

  function removeStep(index: number) {
    onProcessChange(processSteps.filter((_, i) => i !== index));
  }

  function addCustomStep() {
    const value = customStepInput.trim();
    if (!value || processSteps.includes(value)) return;
    onProcessChange([...processSteps, value]);
    setCustomStepInput("");
  }

  function toggleDocument(option: string) {
    if (documents.includes(option)) {
      onDocumentsChange(documents.filter((doc) => doc !== option));
    } else {
      onDocumentsChange([...documents, option]);
    }
  }

  function removeDocument(doc: string) {
    onDocumentsChange(documents.filter((d) => d !== doc));
  }

  function addCustomDocument() {
    const value = customDocInput.trim();
    if (!value || documents.includes(value)) return;
    onDocumentsChange([...documents, value]);
    setCustomDocInput("");
  }

  const customDocuments = documents.filter((doc) => !DOCUMENT_OPTIONS.includes(doc));

  return (
    <div className="space-y-8">
      {/* 전형절차 */}
      <div>
        <p className={LBL}>전형절차</p>
        <p className={`${HINT} mb-3`}>진행되는 순서대로 클릭해 선택해 주세요.</p>

        <div role="group" aria-label="전형절차 선택" className="flex flex-wrap gap-2">
          {PROCESS_STEP_OPTIONS.map((option) => {
            const on = processSteps.includes(option);
            return (
              <button key={option} type="button" role="checkbox" aria-checked={on}
                onClick={() => toggleStep(option)}
                className={clsx(
                  "inline-flex h-9 items-center gap-1.5 border px-3.5 text-[12px] font-medium transition-colors",
                  on ? "border-[#111111] bg-[#111111] text-white" : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
                )}>
                {on && <span className="text-[10px]" aria-hidden>✓</span>}
                {option}
              </button>
            );
          })}
        </div>

        <div className="my-4 border-t border-[#f0f2f5]" />

        <p className={LBL}>+ 직접 추가</p>
        <div className="flex gap-2">
          <input
            value={customStepInput}
            onChange={(e) => setCustomStepInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomStep(); } }}
            maxLength={20}
            placeholder="예: 온라인 코딩테스트"
            className={`${IN} flex-1`}
            aria-label="전형절차 직접 입력"
          />
          <button type="button" onClick={addCustomStep}
            className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f8fa]">
            ＋ 직접 추가
          </button>
        </div>
        <p className={HINT}>(20자 이내)</p>

        {processSteps.length > 0 && (
          <div className="mt-4">
            <p className={LBL}>선택된 절차 ({processSteps.length})</p>
            <div className="space-y-2">
              {processSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-2 border border-[#d8e0e8] bg-white px-3 py-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center bg-[#111111] text-[11px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-[13px] font-medium text-[#2f3845]">{step}</span>
                  <button type="button" onClick={() => moveStep(index, -1)} disabled={index === 0}
                    aria-label={`${step} 위로 이동`}
                    className="grid h-7 w-7 shrink-0 place-items-center text-[#7b8491] hover:text-[#111111] disabled:cursor-not-allowed disabled:text-[#d8e0e8]">
                    <ChevronUp size={14} />
                  </button>
                  <button type="button" onClick={() => moveStep(index, 1)} disabled={index === processSteps.length - 1}
                    aria-label={`${step} 아래로 이동`}
                    className="grid h-7 w-7 shrink-0 place-items-center text-[#7b8491] hover:text-[#111111] disabled:cursor-not-allowed disabled:text-[#d8e0e8]">
                    <ChevronDown size={14} />
                  </button>
                  <button type="button" onClick={() => removeStep(index)}
                    aria-label={`${step} 삭제`}
                    className="grid h-7 w-7 shrink-0 place-items-center text-[#a0a9b7] hover:text-danger">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 제출서류 */}
      <div>
        <p className={LBL}>제출서류</p>
        <p className={`${HINT} mb-3`}>지원 시 제출받을 서류를 선택해 주세요.</p>

        <div role="group" aria-label="제출서류 선택" className="flex flex-wrap gap-2">
          {DOCUMENT_OPTIONS.map((option) => {
            const on = documents.includes(option);
            return (
              <button key={option} type="button" role="checkbox" aria-checked={on}
                onClick={() => toggleDocument(option)}
                className={clsx(
                  "inline-flex h-9 items-center gap-1.5 border px-3.5 text-[12px] font-medium transition-colors",
                  on ? "border-[#111111] bg-[#111111] text-white" : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
                )}>
                {on && <span className="text-[10px]" aria-hidden>✓</span>}
                {option}
              </button>
            );
          })}
        </div>

        <div className="my-4 border-t border-[#f0f2f5]" />

        <p className={LBL}>+ 직접 추가</p>
        <div className="flex gap-2">
          <input
            value={customDocInput}
            onChange={(e) => setCustomDocInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomDocument(); } }}
            maxLength={20}
            placeholder="예: 병역확인서"
            className={`${IN} flex-1`}
            aria-label="제출서류 직접 입력"
          />
          <button type="button" onClick={addCustomDocument}
            className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f8fa]">
            ＋ 직접 추가
          </button>
        </div>
        <p className={HINT}>(20자 이내)</p>

        {customDocuments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {customDocuments.map((doc) => (
              <button key={doc} type="button" onClick={() => removeDocument(doc)}
                aria-label={`${doc} 삭제`}
                className="inline-flex h-9 items-center gap-1.5 border border-[#111111] bg-[#111111] px-3.5 text-[12px] font-medium text-white">
                <span className="text-[10px]" aria-hidden>✓</span>
                {doc}
                <X size={11} className="ml-0.5 opacity-70" aria-hidden />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
