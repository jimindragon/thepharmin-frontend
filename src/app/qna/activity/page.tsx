import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { QnaActivityClient } from "@/components/qna/QnaActivityClient";
import { buildQnaPreviewQuery, resolveQnaViewerState } from "@/config/qnaAccess";

export const metadata: Metadata = {
  title: "내 활동 | 채용 QNA | THE PHARMA Recruit.",
  description: "내 QNA 활동을 한곳에서 확인할 수 있습니다.",
};

interface QnaActivityPageProps {
  searchParams: Promise<{ guest?: string; pharmacist?: string; tab?: string }>;
}

export default async function QnaActivityPage({ searchParams }: QnaActivityPageProps) {
  const sp = await searchParams;
  const { isLoggedIn } = resolveQnaViewerState(sp);

  /** 스크랩·작성글·작성댓글 모두 로그인 사용자 전용 활동이라, 비로그인이면 목록으로 되돌린다 */
  if (!isLoggedIn) {
    redirect(`/qna${buildQnaPreviewQuery(sp)}`);
  }

  return (
    <>
      <Header />
      <QnaActivityClient />
    </>
  );
}
