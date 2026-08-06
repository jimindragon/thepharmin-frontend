"use client";

import { useEffect, useRef, useState } from "react";
import { TA } from "@/components/job-registration/fieldClasses";
import { ModalShell } from "@/components/ui/ModalShell";

/**
 * AI가 채울 수 있는 산업 트랙 필드의 부분집합. 폼의 세터와 1:1로 대응하며,
 * 값이 undefined인 키는 "원문에 없어 채우지 않음"을 뜻한다(빈 문자열로 덮어쓰지 않는다).
 *
 * 셀렉트 3종은 라벨이 아니라 옵션 id를 담는다 — jobFilters/shared.ts의 값과 정확히 같아야 한다.
 */
export interface AiFillPatch {
  title?: string;
  summary?: string;
  positionIntro?: string;
  mainDuties?: string;
  requiredQual?: string;
  preferred?: string;
  additionalNotes?: string;
  workCondDetail?: string;
  /** employmentTypeOptions의 id */
  employmentType?: string;
  /** experienceOptions의 id */
  careerType?: string;
  /** educationOptions의 id */
  educationType?: string;
}

/**
 * 1차 데모용 고정 응답. 실제 AI 호출은 아직 없고, 붙여넣은 원문과 무관하게 이 값이 적용된다.
 *
 * 모집 직무·급여·근무지·마감일·지원 방식은 의도적으로 비워 둔다 — "원문에 없는 건 채우지 않는다"를
 * 보여주는 동시에, 채운 뒤에도 필수 검증이 정상으로 걸리는지 확인하는 용도다.
 */
const DEMO_PATCH: AiFillPatch = {
  title: "품질관리(QC) 분석 담당자 채용",
  summary: "의약품 품질 분석을 담당할 QC 담당자를 찾습니다.",
  mainDuties: "완제·원료 의약품 품질 분석\n시험법 밸리데이션 수행\n시험 기록서 작성 및 관리",
  requiredQual: "화학·생명과학 계열 학사 이상\nHPLC 등 분석 장비 사용 경험",
  preferred: "GMP 환경 근무 경험\n의약품 QC 실무 경험",
  employmentType: "permanent", // 정규직
  careerType: "1-3", // 1~3년
  educationType: "bachelor", // 학사 (4년제)
};

/** 분석 흉내 시간(ms). 실제 호출이 붙으면 이 상수와 setTimeout이 함께 사라진다. */
const FAKE_ANALYZE_MS = 1200;

export function AiFillModal({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (patch: AiFillPatch) => void;
}) {
  const [source, setSource] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const timerRef = useRef<number | null>(null);

  // 분석 중에 닫히면(Escape·배경 클릭·X) 적용을 취소한다 — 닫힌 모달이 폼을 채우면 안 된다.
  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const canApply = source.trim().length > 0 && !analyzing;

  function handleApply() {
    if (!canApply) return;
    setAnalyzing(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      onApply(DEMO_PATCH);
      onClose();
    }, FAKE_ANALYZE_MS);
  }

  return (
    <ModalShell title="AI로 공고 내용 채우기" onClose={onClose}>
      <div className="overflow-y-auto px-6 py-5">
        <p className="text-[13px] font-normal leading-[1.6] text-[#68717e]">
          기존 공고문을 붙여넣으면 항목별로 나눠 담습니다. 원문에 없는 내용은 채우지 않습니다.
        </p>
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={8}
          disabled={analyzing}
          aria-label="공고 원문 붙여넣기"
          placeholder="채용 사이트나 사내 문서에 있는 공고문을 그대로 붙여넣어 주세요."
          className={`${TA} mt-3`}
        />
        <p className="mt-2 text-[12px] font-normal text-[#8a94a3]">
          붙여넣은 내용은 이 공고 작성에만 사용됩니다.
        </p>
      </div>

      <div className="flex shrink-0 justify-end gap-2 px-6 pb-6 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="h-10 border border-[#d8e0e8] bg-white px-4 text-[13px] font-medium text-[#44505f] transition hover:border-[#111111] hover:text-[#111111]"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={!canApply}
          className="h-10 border border-[#111111] bg-[#111111] px-4 text-[13px] font-semibold text-white transition hover:border-[#303946] hover:bg-[#303946] disabled:cursor-not-allowed disabled:border-[#dfe4ea] disabled:bg-[#f5f6f7] disabled:text-[#aeb6c0]"
        >
          {analyzing ? "분석 중…" : "항목에 나눠 담기"}
        </button>
      </div>
    </ModalShell>
  );
}
