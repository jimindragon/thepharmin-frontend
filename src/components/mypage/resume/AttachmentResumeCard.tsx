"use client";

import { FileText } from "lucide-react";
import type { AttachmentResume } from "@/data/resumes";
import { ResumeActionsMenu } from "@/components/mypage/resume/ResumeActionsMenu";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { ResumePrimaryBadge } from "@/components/shared/ResumePrimaryBadge";

export function AttachmentResumeCard({
  resume,
  onSetPrimary,
  onDuplicate,
  onDelete,
  onToggleProposal,
}: {
  resume: AttachmentResume;
  onSetPrimary: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleProposal: (enabled: boolean) => void;
}) {
  return (
    <article className="flex flex-wrap items-center justify-between gap-3 border border-border bg-white p-6 max-[640px]:p-5">
      <div className="flex min-w-0 items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center border border-border bg-[#f7f8fa] text-[#596373]">
          <FileText size={20} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[16px] font-semibold tracking-[-0.01em] text-[#1c2128]">{resume.fileName}</h3>
            <span className="inline-flex items-center border border-border bg-[#f7f8fa] px-2 py-0.5 text-[13px] font-medium text-[#596373]">첨부형</span>
            {resume.isPrimary ? <ResumePrimaryBadge /> : null}
          </div>
          <p className="mt-2 text-[13px] font-normal text-[#8a94a3]">
            업로드 {resume.updatedAt.replaceAll("-", ".")}
            <span className="px-1.5 text-[#d3d9e1]">·</span>
            {resume.fileSizeLabel}
            <span className="px-1.5 text-[#d3d9e1]">·</span>
            완성도 검사 없이 바로 지원 가능
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#8a94a3]">제안 받기</span>
          <ToggleSwitch label={`${resume.fileName} 제안 받기`} checked={resume.proposalEnabled} onChange={onToggleProposal} />
        </div>
        <ResumeActionsMenu label={resume.fileName} isPrimary={resume.isPrimary} onSetPrimary={onSetPrimary} onDuplicate={onDuplicate} onDelete={onDelete} />
      </div>
    </article>
  );
}
