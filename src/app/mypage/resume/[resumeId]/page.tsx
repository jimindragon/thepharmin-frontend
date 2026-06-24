import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { ResumeEditorClient } from "@/components/mypage/resume/ResumeEditorClient";
import { mockResumes, type BuiltResume } from "@/data/resumes";

function isBuiltResume(resume: { kind: string } | undefined): resume is BuiltResume {
  return resume?.kind === "built";
}

interface EditResumePageProps {
  params: Promise<{ resumeId: string }>;
}

function MissingResume() {
  return (
    <>
      <Header />
      <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-[#f5f6f7] px-6 py-20">
        <section className="w-full max-w-[480px] border border-border bg-white p-8 text-center shadow-[var(--shadow)]">
          <p className="text-[13px] font-black text-brand">이력서 관리</p>
          <h1 className="mt-2 text-[24px] font-bold text-[#202734]">이력서를 찾을 수 없습니다.</h1>
          <p className="mt-3 text-[14px] font-medium leading-[1.7] text-[#667181]">삭제되었거나 존재하지 않는 이력서입니다.</p>
          <Link href="/mypage/resume" className="mx-auto mt-6 inline-flex h-11 items-center gap-2 border border-[#111111] px-4 text-[14px] font-black text-[#111111]">
            <ChevronLeft size={17} />
            이력서 관리로 돌아가기
          </Link>
        </section>
      </main>
    </>
  );
}

export default async function EditResumePage({ params }: EditResumePageProps) {
  const { resumeId } = await params;
  const resume = mockResumes.find((item) => item.id === resumeId);

  if (!isBuiltResume(resume)) {
    return <MissingResume />;
  }

  return <ResumeEditorClient mode="edit" initialResume={resume} />;
}
