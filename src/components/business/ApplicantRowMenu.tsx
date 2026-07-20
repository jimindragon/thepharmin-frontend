"use client";

import clsx from "clsx";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useDropdownMenu } from "@/hooks/useDropdownMenu";
import type { Applicant } from "@/data/applicants";

interface ApplicantRowMenuProps {
  applicant: Applicant;
  onReject: (applicantId: string) => void;
}

export function ApplicantRowMenu({ applicant, onReject }: ApplicantRowMenuProps) {
  const { open, setOpen, containerRef } = useDropdownMenu<HTMLDivElement>();
  const isRejected = applicant.stage === "rejected";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="더보기"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-[#cfd8e3] text-[#8a94a3] transition hover:border-[#111111] hover:text-[#111111]"
      >
        <MoreHorizontal size={14} />
      </button>

      {open ? (
        <div
          role="menu"
          className="dropdown-panel absolute right-0 top-[calc(100%+6px)] z-30 w-[180px] border border-[#e5e9ef] bg-white p-1.5 shadow-[0_8px_22px_rgba(20,32,46,0.12)]"
        >
          <Link
            href={`/business/applicants/${applicant.id}`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex h-9 w-full items-center px-3 text-left text-[13px] font-medium text-[#3d4653] hover:bg-[#f5f8fa]"
          >
            프로필 보기
          </Link>
          <div className="my-1 h-px bg-[#edf1f5]" />
          <button
            type="button"
            role="menuitem"
            disabled={isRejected}
            onClick={() => {
              if (isRejected) return;
              onReject(applicant.id);
              setOpen(false);
            }}
            className={clsx(
              "flex h-9 w-full items-center px-3 text-left text-[13px] font-medium",
              isRejected ? "cursor-not-allowed text-[#a0aab6]" : "text-status-error hover:bg-[#fdf2f0]",
            )}
          >
            불합격 처리
          </button>
        </div>
      ) : null}
    </div>
  );
}
