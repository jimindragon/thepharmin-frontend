"use client";

import { useEffect, useRef, useState } from "react";
import { TA } from "@/components/job-registration/fieldClasses";
import { ModalShell } from "@/components/ui/ModalShell";

/**
 * 첨부 이력서를 구조화 이력서로 변환하는 모달. 분석은 하지 않고 UI 상태(대기·오류)만 담당한다 —
 * 실제 분석·에디터 이동·토스트는 부모가 넘긴 onAnalyze가 전부 책임진다(AiFillModal과 같은 역할 분담).
 *
 * onAnalyze가 resolve되면 모달을 닫고, reject되면 오류 줄을 띄우고 열린 채 재시도를 받는다.
 *
 * 대기 중 취소(또는 Escape·배경 클릭)로 닫히는 경우 진행 중인 onAnalyze를 여기서 멈출 수는 없다 —
 * 부모가 "닫혔으면 반영하지 않는다"를 판단한다.
 */
export function ResumeConvertModal({
  onClose,
  onAnalyze,
}: {
  onClose: () => void;
  onAnalyze: (text: string) => Promise<void>;
}) {
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  // 닫힌 뒤에 도착한 결과로 상태를 만지지 않기 위한 표식
  const mountedRef = useRef(true);

  // 마운트에서 true로 되돌리는 것이 중요하다 — Strict Mode(dev)는 effect를 mount→cleanup→mount로
  // 두 번 돌리므로, cleanup만 false를 쓰면 살아 있는 모달이 계속 false인 채로 남는다.
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loading = status === "loading";
  const canAnalyze = source.trim().length > 0 && !loading;

  async function handleAnalyze() {
    if (!canAnalyze) return;
    setStatus("loading"); // 재시도면 오류 줄이 여기서 사라진다
    try {
      await onAnalyze(source);
      if (!mountedRef.current) return;
      onClose();
    } catch {
      if (!mountedRef.current) return;
      setStatus("error");
    }
  }

  return (
    <ModalShell title="구조화 이력서로 변환" onClose={onClose}>
      <div className="overflow-y-auto px-6 py-5">
        <p className="text-[13px] font-normal leading-[1.6] text-[#68717e]">
          이력서 내용을 붙여넣으면 항목별로 나눠 담습니다. 원문에 없는 내용은 채우지 않습니다.
        </p>
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={8}
          disabled={loading}
          aria-label="이력서 내용 붙여넣기"
          placeholder="올려두신 이력서 파일을 열어 내용을 그대로 붙여넣어 주세요."
          className={`${TA} mt-3`}
        />
        {loading ? (
          <p className="mt-2 text-[13px] font-normal leading-[1.6] text-[#68717e]">
            이력서 내용을 항목별로 나누고 있습니다. 잠시만 기다려 주세요.
          </p>
        ) : (
          <p className="mt-2 text-[12px] font-normal text-[#8a94a3]">
            붙여넣은 내용은 이 이력서 작성에만 사용됩니다.
          </p>
        )}
      </div>

      {status === "error" ? (
        <p role="alert" className="shrink-0 px-6 text-[13px] font-medium text-status-error">
          분석에 실패했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}

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
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="h-10 border border-[#111111] bg-[#111111] px-4 text-[13px] font-semibold text-white transition hover:border-[#303946] hover:bg-[#303946] disabled:cursor-not-allowed disabled:border-[#dfe4ea] disabled:bg-[#f5f6f7] disabled:text-[#aeb6c0]"
        >
          {loading ? "분석 중…" : "항목에 나눠 담기"}
        </button>
      </div>
    </ModalShell>
  );
}
