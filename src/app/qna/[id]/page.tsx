import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { QnaDetailClient } from "@/components/qna/QnaDetailClient";
import { buildQnaPreviewQuery, resolveQnaViewerState, QNA_REDIRECT_REASON_PHARMACIST_ONLY } from "@/config/qnaAccess";
import { getQnaPostById } from "@/data/qna";

interface QnaDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pharmacist?: string; licenseEligible?: string }>;
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
  const { isLoggedIn, isVerifiedPharmacist } = await resolveQnaViewerState(sp);

  const post = getQnaPostById(id);
  if (!post) notFound();

  const previewQuery = buildQnaPreviewQuery(sp);

  /**
   * 약사 인증 없이는 약사 QNA 상세에 접근할 수 없다 — URL 직접 입력도 서버에서 막고 산업 QNA로 보낸다.
   * 되돌려보내는 이유를 함께 실어, 목록이 "왜 여기로 왔는지"를 말할 수 있게 한다 — 이유 없이 튕기면
   * 링크를 눌렀는데 목록으로 돌아온 것으로만 읽힌다. 안내를 실제로 띄울지는 목록이 판단한다
   * (자격 무관 회원에게는 띄우지 않는다).
   */
  if (post.qnaType === "pharmacist" && !isVerifiedPharmacist) {
    const redirectParams = new URLSearchParams(previewQuery.replace(/^\?/, ""));
    redirectParams.set("reason", QNA_REDIRECT_REASON_PHARMACIST_ONLY);
    redirect(`/qna?${redirectParams.toString()}`);
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
