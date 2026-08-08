"use client";

import { Plus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { AttachmentResumeCard } from "@/components/mypage/resume/AttachmentResumeCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ResumeCard } from "@/components/mypage/resume/ResumeCard";
import { ResumeConvertModal } from "@/components/mypage/resume/ResumeConvertModal";
import { analyzeResumeDemo, saveResumeConvertDraft } from "@/components/mypage/resume/resumeConvertDemo";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { InfoNoticeBox } from "@/components/shared/InfoNoticeBox";
import { Button, LinkButton } from "@/components/ui/Button";
import { MOCK_TODAY } from "@/config/mockToday";
import { mockResumes, type AttachmentResume, type ResumeItem } from "@/data/resumes";

/** 첨부 이력서로 받는 형식. 기업 공고 등록의 첨부 위젯(AttachmentUploader 호출부)과 같은 값. */
const RESUME_ACCEPT = ".pdf,.hwp,.docx";

/** 카드가 쓰는 표기("1.2MB")에 맞춘 용량 문자열. AttachmentUploader의 같은 함수가 export되어 있지 않아 여기 둔다. */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function resumeLabel(resume: ResumeItem) {
  return resume.kind === "built" ? resume.title : resume.fileName;
}

export function MyPageResumeClient() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeItem[]>(mockResumes);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [convertOpen, setConvertOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** 대기 중 모달이 닫혔는지 판단하는 표식 — 닫힌 뒤 도착한 결과로 페이지를 옮기지 않는다. */
  const convertOpenRef = useRef(false);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  /**
   * 고른 파일을 첨부형 이력서 카드로 목록 끝에 붙인다. 파일은 File 참조로만 들고 있어
   * 새로고침하면 사라진다 — 저장소가 붙기 전까지의 한계다.
   */
  const uploadResume = (file: File) => {
    const next: AttachmentResume = {
      id: `resume-upload-${Date.now()}`,
      kind: "attachment",
      fileName: file.name,
      isPrimary: false,
      proposalEnabled: false,
      // 카드가 "-"를 "."로 바꿔 그리므로 저장은 기존 목데이터와 같은 하이픈 형식으로 맞춘다.
      updatedAt: MOCK_TODAY.replaceAll(".", "-"),
      fileSizeLabel: formatFileSize(file.size),
      file,
    };
    setResumes((current) => [...current, next]);
    showToast("이력서가 추가되었습니다.");
  };

  const openConvert = () => {
    convertOpenRef.current = true;
    setConvertOpen(true);
  };

  const closeConvert = () => {
    convertOpenRef.current = false;
    setConvertOpen(false);
  };

  /**
   * 모달에 넘기는 분석기. 결과를 sessionStorage에 두고 에디터로 이동하면 에디터가 그것을 집어 채운다 —
   * 두 화면이 라우트가 달라 props로 넘길 수 없다. 원본 첨부 이력서는 그대로 목록에 남긴다.
   */
  const handleConvertAnalyze = async (text: string) => {
    const patch = await analyzeResumeDemo(text);
    if (!convertOpenRef.current) return; // 대기 중 닫혔으면 반영하지 않는다
    saveResumeConvertDraft(patch);
    router.push("/mypage/resume/new");
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
          <p className="mt-2.5 max-w-[560px] text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
            직무별로 이력서를 따로 관리해 보세요.
          </p>
        </div>
        {/* 작성이 주경로라 검정 채움을 유지하고, 업로드는 테두리형으로 한 단계 낮춘다. */}
        <div className="flex shrink-0 items-center gap-2">
          {/* AttachmentUploader·FileUploadField는 둘 다 라벨·드롭존이 딸린 블록이라 버튼 한 개짜리
              이 자리에 맞지 않는다 — 숨긴 input + Button 조합으로 최소 구현한다(원본은 그대로). */}
          <input
            ref={fileInputRef}
            type="file"
            accept={RESUME_ACCEPT}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) uploadResume(file);
              // 같은 파일을 연달아 고를 때도 change가 다시 뜨도록 비운다.
              event.target.value = "";
            }}
          />
          {/* 라벨은 "업로드"까지만 — "파일 업로드"면 버튼 줄이 넓어져 1280px대에서 헤더가 두 줄로 접힌다. */}
          <Button type="button" variant="secondary" size="md" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} />
            업로드
          </Button>
          <LinkButton href="/mypage/resume/new" variant="primary" size="md">
            <Plus size={16} />
            새 이력서 작성
          </LinkButton>
        </div>
      </div>

      <div className="mt-7">
        {/* 서로 다른 두 규칙이라 한 문단으로 흘리지 않고 문장별로 끊는다 — 훑을 때 어느 쪽 설명인지 바로 잡힌다.
            InfoNoticeBox의 아이콘은 mt-0.5로 첫 줄에 맞춰져 있어, 행이 늘어도 위쪽 정렬 그대로다. */}
        <InfoNoticeBox>
          <div className="flex flex-col gap-1.5">
            <p className="text-[13px] font-normal leading-[1.7] text-[#68717e]">
              <strong className="font-medium text-[#3d4653]">대표 이력서</strong>는 간편지원 시 기본으로 첨부됩니다.
            </p>
            <p className="text-[13px] font-normal leading-[1.7] text-[#68717e]">
              <strong className="font-medium text-[#3d4653]">제안 받기</strong>를 켜면 헤드헌팅·기업 담당자에게 해당 이력서가 공개되어 포지션 제안을 받을 수
              있습니다.
            </p>
          </div>
        </InfoNoticeBox>
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
                onConvert={openConvert}
                onDuplicate={() => duplicateResume(resume.id)}
                onDelete={() => setPendingDeleteId(resume.id)}
                onToggleProposal={(enabled) => toggleProposal(resume.id, enabled)}
              />
            ),
          )
        ) : (
          <div className="border border-border bg-white p-10 text-center">
            <p className="text-[15px] font-medium text-[#303946]">등록된 이력서가 없습니다.</p>
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
          ariaLabel="이력서 삭제 확인"
          title="이력서를 삭제할까요?"
          description={`'${resumeLabel(pendingDeleteResume)}'을(를) 삭제하면 되돌릴 수 없습니다.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />
      ) : null}

      {convertOpen ? <ResumeConvertModal onClose={closeConvert} onAnalyze={handleConvertAnalyze} /> : null}

      {toast ? (
        <div className="fixed right-6 top-[84px] z-[80] border border-border bg-white px-5 py-3 text-[13px] font-medium text-[#303946] shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
          {toast}
        </div>
      ) : null}
    </MyPageShell>
  );
}
