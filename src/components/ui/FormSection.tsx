"use client";

import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, type ReactNode } from "react";

/**
 * 이력서 편집 전용. 공고 등록·기업 프로필은 BusinessFormControls의
 * SectionCard(별개 구현)를 사용 — 그쪽과 구분하려고 이름을 분리했다.
 */
export function ResumeSectionCard({
  title,
  description,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <section className="registration-section-card surface overflow-hidden">
      <div
        className={clsx(
          "registration-section-header flex items-start justify-between gap-5 border-b border-border px-7 py-5",
          collapsible && "cursor-pointer select-none",
        )}
        onClick={collapsible ? () => setOpen((current) => !current) : undefined}
        {...(collapsible ? { "data-collapsible-header": true, "aria-expanded": isOpen } : {})}
      >
        <div className="min-w-0 flex items-start gap-3">
          <div className="min-w-0">
            <h2 className="registration-section-title font-bold tracking-[-0.02em] text-[#242b36]">{title}</h2>
            {description ? <p className="registration-section-description mt-1.5 text-[13px] font-normal text-[#768190]">{description}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <span
            className={clsx(
              "registration-status-pill mt-1 shrink-0 whitespace-nowrap border px-2.5 py-1 text-[12px] font-medium",
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
      {isOpen ? <div className="registration-section-body px-7 py-6">{children}</div> : null}
    </section>
  );
}

export function ResumeFieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="registration-field-label block text-[15px] font-medium text-[#2d3644]">
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
        "registration-form-row grid grid-cols-[150px_minmax(0,1fr)] items-start gap-6 border-b border-border py-4 last:border-b-0 max-[760px]:grid-cols-1 max-[760px]:gap-2",
        align === "center" && "registration-form-row--control",
      )}
    >
      <ResumeFieldLabel required={required}>{label}</ResumeFieldLabel>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
