"use client";

import clsx from "clsx";
import { CheckCircle2, PencilLine } from "lucide-react";
import Link from "next/link";
import { optionLabelMaps } from "@/config/jobFilters/index";
import { calculateResumeCompletion, isResumeComplete, type BuiltResume } from "@/data/resumes";
import { ResumeActionsMenu } from "@/components/mypage/resume/ResumeActionsMenu";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

export function ResumeCard({
  resume,
  onSetPrimary,
  onDuplicate,
  onDelete,
  onToggleProposal,
}: {
  resume: BuiltResume;
  onSetPrimary: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleProposal: (enabled: boolean) => void;
}) {
  const completion = calculateResumeCompletion(resume);
  const complete = isResumeComplete(resume);
  const tagLabels = resume.jobSubcategoryIds.map((id) => optionLabelMaps.jobSubcategory?.get(id) ?? id).slice(0, 3);

  return (
    <article className="border border-[#dfe4ea] bg-white p-6 max-[640px]:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[17px] font-bold tracking-[-0.01em] text-[#1c2128]">{resume.title}</h3>
            {resume.isPrimary ? (
              <span className="inline-flex h-[22px] items-center bg-[#111111] px-2 text-[11px] font-medium text-white">대표</span>
            ) : null}
            <span
              className={clsx(
                "inline-flex h-[22px] items-center gap-1 px-2 text-[11px] font-medium",
                complete ? "text-status-complete" : "text-[#8a6d1f]",
              )}
            >
              {complete ? <CheckCircle2 size={13} /> : <PencilLine size={13} />}
              {complete ? "작성완료" : "작성 중"}
            </span>
          </div>

          {tagLabels.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tagLabels.map((label) => (
                <span key={label} className="border border-[#e5e9ef] bg-[#f7f8fa] px-2.5 py-1 text-[12px] font-medium text-[#596373]">
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[12px] font-normal text-[#a0a9b7]">직무 태그가 아직 없습니다.</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#8a94a3]">제안 받기</span>
            <ToggleSwitch label={`${resume.title} 제안 받기`} checked={resume.proposalEnabled} onChange={onToggleProposal} />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/mypage/resume/${resume.id}`}
              className="inline-flex h-9 items-center border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-medium text-[#44505f] hover:border-[#111111] hover:text-[#111111]"
            >
              {complete ? "편집" : "이어 작성"}
            </Link>
            <ResumeActionsMenu
              label={resume.title}
              isPrimary={resume.isPrimary}
              onSetPrimary={onSetPrimary}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 max-w-[260px] flex-1 overflow-hidden bg-[#edf0f3]">
          <span className="block h-full bg-[#111111]" style={{ width: `${completion}%` }} />
        </div>
        <span className="shrink-0 text-[12px] font-medium text-[#596373]">{completion}%</span>
      </div>

      <p className="mt-3 text-[12px] font-normal text-[#8a94a3]">
        최종 수정 {resume.updatedAt.replaceAll("-", ".")}
        <span className="px-1.5 text-[#d3d9e1]">·</span>
        {complete ? "간편지원 가능" : "작성을 완료하면 간편지원에 사용할 수 있어요"}
      </p>
    </article>
  );
}
