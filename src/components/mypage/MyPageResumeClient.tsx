"use client";

import { Info, Plus } from "lucide-react";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { AttachmentResumeCard } from "@/components/mypage/resume/AttachmentResumeCard";
import { ConfirmDialog } from "@/components/mypage/resume/ConfirmDialog";
import { ResumeCard } from "@/components/mypage/resume/ResumeCard";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { LinkButton } from "@/components/ui/Button";
import { mockResumes, type ResumeItem } from "@/data/resumes";

function resumeLabel(resume: ResumeItem) {
  return resume.kind === "built" ? resume.title : resume.fileName;
}

export function MyPageResumeClient() {
  const [resumes, setResumes] = useState<ResumeItem[]>(mockResumes);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const setPrimary = (id: string) => {
    setResumes((current) => current.map((resume) => ({ ...resume, isPrimary: resume.id === id })));
    showToast("대표 이력서로 지정했습니다.");
  };

  const duplicateResume = (id: string) => {
    setResumes((current) => {
      const target = current.find((resume) => resume.id === id);
      if (!target) return current;

      const copy: ResumeItem =
        target.kind === "built"
          ? { ...target, id: `${target.id}-copy-${Date.now()}`, title: `${target.title} 복사본`, isPrimary: false }
          : { ...target, id: `${target.id}-copy-${Date.now()}`, fileName: `${target.fileName.replace(/\.pdf$/i, "")} 복사본.pdf`, isPrimary: false };

      const index = current.findIndex((resume) => resume.id === id);
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
    });
    showToast("이력서를 복제했습니다.");
  };

  const toggleProposal = (id: string, enabled: boolean) => {
    setResumes((current) => current.map((resume) => (resume.id === id ? { ...resume, proposalEnabled: enabled } : resume)));
    showToast(enabled ? "제안 받기를 켰습니다." : "제안 받기를 껐습니다.");
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    setResumes((current) => current.filter((resume) => resume.id !== pendingDeleteId));
    setPendingDeleteId(null);
    showToast("이력서를 삭제했습니다.");
  };

  const pendingDeleteResume = resumes.find((resume) => resume.id === pendingDeleteId);

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "내 정보" }, { label: "이력서 관리" }]} />

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">이력서 관리</h1>
          <p className="mt-2.5 max-w-[560px] text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
            직무별로 이력서를 따로 관리하고, 대표 이력서를 간편지원에 바로 첨부합니다.
          </p>
        </div>
        <LinkButton href="/mypage/resume/new" variant="primary" size="md" className="shrink-0">
          <Plus size={16} />
          새 이력서 작성
        </LinkButton>
      </div>

      <div className="mt-7 flex items-start gap-2.5 border border-[#e5e9ef] bg-[#f7f8fa] px-4 py-3.5">
        <Info size={16} className="mt-0.5 shrink-0 text-[#8a94a3]" />
        <p className="text-[13px] font-normal leading-[1.7] text-[#68717e]">
          <strong className="font-medium text-[#3d4653]">대표 이력서</strong>는 간편지원 시 기본으로 첨부됩니다.{" "}
          <strong className="font-medium text-[#3d4653]">제안 받기</strong>를 켜면 헤드헌팅·기업 담당자에게 해당 이력서가 공개되어 포지션 제안을 받을 수
          있습니다.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {resumes.length > 0 ? (
          resumes.map((resume) =>
            resume.kind === "built" ? (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onSetPrimary={() => setPrimary(resume.id)}
                onDuplicate={() => duplicateResume(resume.id)}
                onDelete={() => setPendingDeleteId(resume.id)}
                onToggleProposal={(enabled) => toggleProposal(resume.id, enabled)}
              />
            ) : (
              <AttachmentResumeCard
                key={resume.id}
                resume={resume}
                onSetPrimary={() => setPrimary(resume.id)}
                onDuplicate={() => duplicateResume(resume.id)}
                onDelete={() => setPendingDeleteId(resume.id)}
                onToggleProposal={(enabled) => toggleProposal(resume.id, enabled)}
              />
            ),
          )
        ) : (
          <div className="border border-[#dfe4ea] bg-white p-10 text-center">
            <p className="text-[14px] font-medium text-[#303946]">등록된 이력서가 없습니다.</p>
            <p className="mt-2 text-[13px] font-normal text-[#8a94a3]">새 이력서를 작성하면 간편지원과 포지션 제안에 활용할 수 있어요.</p>
            <LinkButton href="/mypage/resume/new" variant="secondary" size="sm" className="mt-4">
              <Plus size={15} />
              새 이력서 작성
            </LinkButton>
          </div>
        )}
      </div>

      {pendingDeleteResume ? (
        <ConfirmDialog
          title="이력서를 삭제할까요?"
          description={`'${resumeLabel(pendingDeleteResume)}'을(를) 삭제하면 되돌릴 수 없습니다.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />
      ) : null}

      {toast ? (
        <div className="fixed right-6 top-[84px] z-[80] border border-[#cfd8e3] bg-white px-5 py-3 text-[13px] font-medium text-[#303946] shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
          {toast}
        </div>
      ) : null}
    </MyPageShell>
  );
}
