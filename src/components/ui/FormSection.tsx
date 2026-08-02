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
export function ResumeSectionCard({
  title,
  description,
  index: _index,
  status = "작성 중",
  collapsible = false,
  defaultOpen = true,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  index?: number;
  status?: string;
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
          <span
            className={clsx(
              "mt-1 shrink-0 whitespace-nowrap border px-2.5 py-[5px] text-[11px] font-medium",
              status === "완료" && "border-border bg-[#f4f5f6] text-[#252d39]",
              status === "작성 중" && "border-border bg-white text-[#5f6876]",
              status === "필수 입력 필요" && "border-status-error-border bg-status-error-subtle text-status-error",
              status === "선택 사항" && "border-border bg-[#f8f9fa] text-[#7a8493]",
            )}
          >
            {status}
          </span>
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
      )}
    >
      <ResumeFieldLabel required={required} align={align}>
        {label}
      </ResumeFieldLabel>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
