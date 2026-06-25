import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { QnaHomeClient } from "@/components/qna/QnaHomeClient";
import { buildQnaPreviewQuery, resolveQnaViewerState } from "@/config/qnaAccess";
import { getPopularQnaEntries, getQnaListEntries } from "@/data/qna";
import type { QnaType } from "@/types/qna";

export const metadata: Metadata = {
  title: "채용 QNA | THE PHARMA Recruit.",
  description: "약국·병원 약사와 제약·바이오 산업 종사자를 위한 채용 QNA입니다.",
};

interface QnaPageProps {
  searchParams: Promise<{ guest?: string; pharmacist?: string; type?: string }>;
}

export default async function QnaPage({ searchParams }: QnaPageProps) {
  const params = await searchParams;
  const { isLoggedIn, isVerifiedPharmacist } = resolveQnaViewerState(params);

  const requestedType: QnaType | undefined =
    params.type === "industry" ? "industry" : params.type === "pharmacist" ? "pharmacist" : undefined;
  /** 약사 인증이 없으면 type 파라미터를 직접 조작해도 산업 QNA만 내려준다 — 약사 QNA 데이터 자체를 서버에서 걸러낸다 */
  const activeType: QnaType = isVerifiedPharmacist ? requestedType ?? "pharmacist" : "industry";

  const entries = getQnaListEntries(activeType);
  const popularEntries = getPopularQnaEntries(activeType);
  const previewQuery = buildQnaPreviewQuery(params);

  return (
    <>
      <Header />
      <QnaHomeClient
        activeType={activeType}
        canSwitchType={isVerifiedPharmacist}
        isLoggedIn={isLoggedIn}
        entries={entries}
        popularEntries={popularEntries}
        previewQuery={previewQuery}
      />
    </>
  );
}
