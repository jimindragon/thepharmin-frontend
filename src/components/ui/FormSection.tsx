"use client";

import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, type ReactNode } from "react";

/**
 * 공고 등록 폼에서 갈라져 나온 컴포넌트라 한동안 globals.css의 registration-* 규칙이
 * 여기 Tailwind 값을 조용히 덮어쓰고 있었다. 그 CSS는 전부 제거했고 실렌더값을 그대로
 * 클래스로 옮겼으니, 이제 크기·여백은 아래 className만 고치면 된다.
 */

/**
 * 이력서 편집 전용. 공고 등록·기업 프로필은 BusinessFormControls의
 * SectionCard(별개 구현)를 사용 — 그쪽과 구분하려고 이름을 분리했다.
 */
/**
 * 배지 어휘는 이 둘뿐이다 — 필수 영역에만 붙고, 선택 영역은 배지를 달지 않는다(status 생략).
 * "선택 사항"·"작성 중" 같은 중립 배지는 정보량 없이 필수 배지의 주목도만 깎아서 없앴다.
 */
export type ResumeSectionStatus = "필수" | "완료";

export function ResumeSectionCard({
  title,
  description,
  index: _index,
  status,
  collapsible = false,
  defaultOpen = true,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  index?: number;
  status?: ResumeSectionStatus;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = collapsible ? open : true;

  return (
    <section className="surface overflow-hidden">
      <div
        className={clsx(
          "flex items-start justify-between gap-[14px] border-b border-border px-5 py-[15px]",
          collapsible && "cursor-pointer select-none",
        )}
        onClick={collapsible ? () => setOpen((current) => !current) : undefined}
        {...(collapsible ? { "data-collapsible-header": true, "aria-expanded": isOpen } : {})}
      >
        <div className="min-w-0 flex items-start gap-3">
          <div className="min-w-0">
            <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#242b36]">{title}</h2>
            {description ? <p className="mt-1.5 text-[13px] font-normal text-[#768190]">{description}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          {status ? (
            <span
              className={clsx(
                "mt-1 shrink-0 whitespace-nowrap border px-2.5 py-[5px] text-[11px] font-medium",
                status === "완료"
                  ? "border-border bg-[#f4f5f6] text-[#252d39]"
                  : "border-status-error-border bg-status-error-subtle text-status-error",
              )}
            >
              {status}
            </span>
          ) : null}
          {collapsible ? (
            <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center text-[#8a94a3]">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          ) : null}
        </div>
      </div>
      {isOpen ? <div className="px-5 py-[18px]">{children}</div> : null}
    </section>
  );
}

export function ResumeFieldLabel({
  children,
  required,
  align = "start",
}: {
  children: ReactNode;
  required?: boolean;
  /** "center" = 컨트롤과 세로 중앙을 맞추는 행. 라벨 상단 여백이 2px 더 붙는다 */
  align?: "start" | "center";
}) {
  return (
    <label
      className={clsx(
        "block text-[14px] font-medium leading-[1.45] text-[#2d3644] max-[760px]:pt-0",
        align === "center" ? "pt-2.5" : "pt-2",
      )}
    >
      {children}
      {required ? <span className="ml-1 text-danger">*</span> : null}
    </label>
  );
}

export function FormRow({
  label,
  required,
  children,
  align = "start",
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  align?: "start" | "center";
}) {
  return (
    <div
      className={clsx(
        "grid grid-cols-[124px_minmax(0,1fr)] items-start gap-4 border-b border-border py-2.5 last:border-b-0 max-[760px]:grid-cols-1 max-[760px]:gap-2",
        // 카드 패딩(18px)과 행 패딩(10px)이 겹쳐 위아래만 28px로 벌어져 있었다.
        // 첫/마지막 행의 바깥쪽 패딩을 음수 마진으로 상쇄해 18px로 맞춘다 — 행을 통째로 옮기므로
        // 라벨·컨트롤의 상대 위치와 행과 행 사이 간격은 그대로다.
        // (패딩을 0으로 만들면 라벨의 pt만 남아 첫 행의 기준선이 어긋난다.)
        "first:-mt-2.5 last:-mb-2.5",
      )}
    >
      <ResumeFieldLabel required={required} align={align}>
        {label}
      </ResumeFieldLabel>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
