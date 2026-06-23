"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export function FieldLabel({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="text-[13px] font-black text-[#2f3845]">
      {children}
      {required ? <span className="ml-1 text-danger">*</span> : null}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  disabled,
  placeholder,
  right,
}: {
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex">
      <input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className={clsx(
          "h-11 min-w-0 flex-1 border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-bold text-[#303946] outline-none transition placeholder:text-[#a4adba] focus:border-[#111111]",
          disabled && "bg-[#f5f6f7] text-[#7d8796]",
        )}
      />
      {right}
    </div>
  );
}

export function SectionCard({
  id,
  title,
  description,
  action,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[132px] border border-[#dfe4ea] bg-white p-6 shadow-[var(--shadow)] max-[760px]:p-4">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-black tracking-[0] text-[#1f2733]">{title}</h2>
          {description ? <p className="mt-2 text-[13px] font-semibold leading-[1.65] text-[#7b8491]">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
