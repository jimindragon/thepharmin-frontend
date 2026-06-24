"use client";

import clsx from "clsx";
import { Copy, MoreHorizontal, Star, Trash2 } from "lucide-react";
import { useDropdownMenu } from "@/hooks/useDropdownMenu";

export function ResumeActionsMenu({
  label,
  isPrimary,
  onSetPrimary,
  onDuplicate,
  onDelete,
}: {
  label: string;
  isPrimary: boolean;
  onSetPrimary?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { open, setOpen, containerRef } = useDropdownMenu<HTMLDivElement>();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${label} 추가 관리 메뉴`}
        className="grid h-9 w-9 place-items-center border border-[#d9e1e8] bg-white text-[#596373] transition-colors hover:border-brand hover:text-brand"
      >
        <MoreHorizontal size={17} />
      </button>

      {open ? (
        <div
          role="menu"
          className="dropdown-panel absolute right-0 top-[calc(100%+6px)] z-30 w-[180px] border border-[#e5e9ef] bg-white p-1.5 shadow-[0_8px_22px_rgba(20,32,46,0.12)]"
        >
          {!isPrimary && onSetPrimary ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onSetPrimary();
                setOpen(false);
              }}
              className="flex h-9 w-full items-center gap-2 px-3 text-left text-[13px] font-medium text-[#3d4653] hover:bg-[#f5f8fa]"
            >
              <Star size={15} />
              대표 이력서로 지정
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onDuplicate();
              setOpen(false);
            }}
            className="flex h-9 w-full items-center gap-2 px-3 text-left text-[13px] font-medium text-[#3d4653] hover:bg-[#f5f8fa]"
          >
            <Copy size={15} />
            복제
          </button>
          <div className="my-1 h-px bg-[#edf1f5]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className={clsx("flex h-9 w-full items-center gap-2 px-3 text-left text-[13px] font-medium text-danger hover:bg-[#fdf2f0]")}
          >
            <Trash2 size={15} />
            삭제
          </button>
        </div>
      ) : null}
    </div>
  );
}
