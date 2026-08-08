"use client";

import { FileText } from "lucide-react";
import type { AttachmentResume } from "@/data/resumes";
import { ResumeActionsMenu } from "@/components/mypage/resume/ResumeActionsMenu";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { ResumePrimaryBadge } from "@/components/shared/ResumePrimaryBadge";

export function AttachmentResumeCard({
  resume,
  onSetPrimary,
  onConvert,
  onDuplicate,
  onDelete,
  onToggleProposal,
}: {
  resume: AttachmentResume;
  onSetPrimary: () => void;
  onConvert: () => void;
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
            {/* "첨부형" 표시는 제목 옆 칩이 아니라 아래 액션 줄의 주 버튼 슬롯이 맡는다. */}
            {resume.isPrimary ? <ResumePrimaryBadge /> : null}
          </div>
          <p className="mt-2 text-[13px] font-normal text-[#8a94a3]">
            업로드 {resume.updatedAt.replaceAll("-", ".")}
            <span className="px-1.5 text-[#d3d9e1]">·</span>
            {resume.fileSizeLabel}
          </p>
        </div>
      </div>

      {/* 작성형 카드(ResumeCard)와 같은 가로 한 줄 액션 — 라벨+토글은 8px로 묶고 ⋯와는 12px. */}
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#8a94a3]">제안 받기</span>
          <ToggleSwitch label={`${resume.fileName} 제안 받기`} checked={resume.proposalEnabled} onChange={onToggleProposal} />
        </div>
        {/* 첨부형은 편집할 본문이 없어 주 버튼이 없다 — ResumeCard의 "수정하기"(120×36)와 같은 크기의 박스로
            그 자리를 채워 ⋯의 x좌표를 맞춘다. 테두리·글자가 버튼(#d8e0e8·#44505f)보다 옅고 커서도 기본값이라
            같은 크기여도 눌리는 것으로 오인되지 않는다.
            640px 아래에서는 120px가 액션 줄을 넘치게 하므로 폭만 내용 크기로 되돌린다(높이는 유지). */}
        <span className="flex h-9 w-[120px] cursor-default items-center justify-center border border-[#d9d9d9] text-[13px] font-normal text-[#999999] max-[640px]:w-auto max-[640px]:px-4">
          첨부형
        </span>
        <ResumeActionsMenu
          label={resume.fileName}
          isPrimary={resume.isPrimary}
          onSetPrimary={onSetPrimary}
          onConvert={onConvert}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}
