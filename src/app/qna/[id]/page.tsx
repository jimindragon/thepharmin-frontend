import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { QnaDetailClient } from "@/components/qna/QnaDetailClient";
import { buildQnaPreviewQuery, resolveQnaViewerState } from "@/config/qnaAccess";
import { getQnaPostById } from "@/data/qna";

interface QnaDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ guest?: string; pharmacist?: string }>;
}

export async function generateMetadata({ params }: QnaDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = getQnaPostById(id);
  return {
    title: post ? `${post.title} | 채용 QNA | THE PHARMA Recruit.` : "채용 QNA | THE PHARMA Recruit.",
  };
}

export default async function QnaDetailPage({ params, searchParams }: QnaDetailPageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const { isLoggedIn, isVerifiedPharmacist } = resolveQnaViewerState(sp);

  const post = getQnaPostById(id);
  if (!post) notFound();

  const previewQuery = buildQnaPreviewQuery(sp);

  /** 약사 인증 없이는 약사 QNA 상세에 접근할 수 없다 — URL 직접 입력도 서버에서 막고 산업 QNA로 보낸다 */
  if (post.qnaType === "pharmacist" && !isVerifiedPharmacist) {
    redirect(`/qna${previewQuery}`);
  }

  const backParams = new URLSearchParams(previewQuery.replace(/^\?/, ""));
  backParams.set("type", post.qnaType);
  const backHref = `/qna?${backParams.toString()}`;

  return (
    <>
      <Header />
      <QnaDetailClient post={post} backHref={backHref} previewQuery={previewQuery} isLoggedIn={isLoggedIn} />
    </>
  );
}
