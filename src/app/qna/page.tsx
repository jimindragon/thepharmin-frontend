import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { QnaHomeClient } from "@/components/qna/QnaHomeClient";
import { buildQnaPreviewQuery, resolveQnaViewerState, QNA_REDIRECT_REASON_PHARMACIST_ONLY } from "@/config/qnaAccess";
import { getPopularQnaEntries, getQnaListEntries } from "@/data/qna";
import type { QnaType } from "@/types/qna";

export const metadata: Metadata = {
  title: "채용 QNA | THE PHARMA Recruit.",
  description: "약국·병원 약사와 제약·바이오 산업 종사자를 위한 채용 QNA입니다.",
};

interface QnaPageProps {
  searchParams: Promise<{ pharmacist?: string; licenseEligible?: string; type?: string; reason?: string }>;
}

export default async function QnaPage({ searchParams }: QnaPageProps) {
  const params = await searchParams;
  const { isLoggedIn, isVerifiedPharmacist, canRegisterLicense } = await resolveQnaViewerState(params);

  const requestedType: QnaType | undefined =
    params.type === "industry" ? "industry" : params.type === "pharmacist" ? "pharmacist" : undefined;
  /** 약사 인증이 없으면 type 파라미터를 직접 조작해도 산업 QNA만 내려준다 — 약사 QNA 데이터 자체를 서버에서 걸러낸다 */
  const activeType: QnaType = isVerifiedPharmacist ? requestedType ?? "pharmacist" : "industry";

  const entries = getQnaListEntries(activeType);
  const popularEntries = getPopularQnaEntries(activeType);
  const previewQuery = buildQnaPreviewQuery(params);
  /**
   * 약사 QNA 상세에서 되돌아왔는지. 문자열 비교는 여기서 끝내고 아래로는 boolean만 내린다 —
   * 상수가 있는 qnaAccess는 session.server(next/headers)를 import해서 클라이언트 컴포넌트가
   * 직접 가져오면 서버 전용 모듈이 클라이언트 번들로 끌려온다.
   */
  const cameFromPharmacistOnly = params.reason === QNA_REDIRECT_REASON_PHARMACIST_ONLY;

  return (
    <>
      <Header />
      <QnaHomeClient
        activeType={activeType}
        canSwitchType={isVerifiedPharmacist}
        canRegisterLicense={canRegisterLicense}
        isLoggedIn={isLoggedIn}
        entries={entries}
        popularEntries={popularEntries}
        previewQuery={previewQuery}
        cameFromPharmacistOnly={cameFromPharmacistOnly}
      />
    </>
  );
}
