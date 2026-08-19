"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { CompanyReviewCard } from "@/components/company/CompanyReviewCard";
import { PharmacyReviewRecheckModal } from "@/components/business/PharmacyReviewRecheckModal";
import { PharmacyReviewReportModal } from "@/components/business/PharmacyReviewReportModal";
import { Button } from "@/components/ui/Button";
import { PageTitle } from "@/components/ui/Typography";
import { MOCK_TODAY } from "@/config/mockToday";
import { companyReviews } from "@/data/companies";
import { toCompanyReviewCardItem } from "@/data/companyReviewItems";
import {
  OWNER_PHARMACY_ID,
  initialPharmacyReviewOwnerState,
  type PharmacyReviewOwnerState,
} from "@/data/pharmacyReviewOwnerState";

const REPLY_GUIDE = "답변은 약국 이름으로 공개됩니다. 사실관계와 개선 방향을 중심으로 작성해 주세요.";

const TEXTAREA_CLASS =
  "h-auto w-full resize-y border border-[#d8e0e8] bg-white px-3.5 py-2.5 text-[15px] font-normal leading-relaxed text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]";

/**
 * 카드 상태 한 줄 — 배경 없는 상태 텍스트 + 8px 점(마이페이지 대시보드·받은 제안과 같은 문법).
 *
 * 점 색은 statusTone.ts의 3단 원칙을 그대로 따른다: 초록 = 완료, 파랑 = 진행 중.
 * 신고 접수와 재검토는 둘 다 운영팀이 아직 보고 있는 상태라 "진행 중"이지, 나쁜 결과가 아니다.
 */
function StatusText({ label, tone }: { label: string; tone: "done" | "progress" }) {
  return (
    <span className="inline-flex w-fit items-center gap-[8px]">
      <span className={clsx("h-[8px] w-[8px] shrink-0 rounded-full", tone === "done" ? "bg-status-positive-dot" : "bg-status-pending-dot")} />
      <span className={clsx("text-[13px] font-medium", tone === "done" ? "text-status-positive" : "text-status-pending")}>{label}</span>
    </span>
  );
}

/**
 * 기업센터 후기 관리. 약국 계정이 자기 약국에 달린 재직 후기를 읽고, 공식 답변·신고·재검토 신청을 한다.
 *
 * 후기 카드는 구직자 화면과 **같은 부품**(CompanyReviewCard)을 쓴다. 두 벌로 만들면 한쪽만 필드가 늘어
 * 약국장이 보는 후기와 구직자가 보는 후기가 달라진다 — 답변을 쓰는 사람이 상대가 무엇을 보는지 모르게 된다.
 * 다른 점은 두 가지뿐이다: 열람권을 넘기지 않아 항상 펼쳐져 있고(자기 약국 후기라 잠글 이유가 없다),
 * frameless로 테두리를 벗어 이 화면의 흰 블록 안에 들어간다.
 *
 * 상태·조치는 후기 원본이 아니라 pharmacyReviewOwnerState에서 온다(그 파일 주석 참조).
 * 저장은 없다 — 초기값을 로컬 state로 복사해 쓰고 새로고침하면 되돌아간다.
 */
export function BusinessReviewsClient() {
  const [ownerState, setOwnerState] = useState<Record<string, PharmacyReviewOwnerState>>(initialPharmacyReviewOwnerState);
  /** 인라인으로 열린 답변 편집기의 후기 id. 모달이 아닌 것은 원문을 보면서 써야 하기 때문이다. */
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const [recheckTargetId, setRecheckTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const reviews = useMemo(
    () =>
      companyReviews
        .filter((review) => review.companyId === OWNER_PHARMACY_ID && review.type === "company")
        .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt)),
    [],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const openReply = (reviewId: string) => {
    setReplyTargetId(reviewId);
    setReplyDraft(ownerState[reviewId]?.officialReply?.content ?? "");
  };

  const submitReply = (reviewId: string) => {
    const content = replyDraft.trim();
    if (!content) return;
    setOwnerState((prev) => ({
      ...prev,
      [reviewId]: { ...prev[reviewId], officialReply: { content, writtenAt: MOCK_TODAY.slice(0, 7) } },
    }));
    setReplyTargetId(null);
    setReplyDraft("");
    showToast("공식 답변이 등록되었습니다.");
  };

  const submitReport = (reviewId: string) => {
    setOwnerState((prev) => ({ ...prev, [reviewId]: { ...prev[reviewId], reportStatus: "submitted" } }));
    setReportTargetId(null);
    showToast("신고가 접수되었습니다. 운영팀 검토 후 결과를 안내드립니다.");
  };

  const submitRecheck = (reviewId: string) => {
    setOwnerState((prev) => ({ ...prev, [reviewId]: { ...prev[reviewId], recheckStatus: "inProgress" } }));
    setRecheckTargetId(null);
    showToast("사실관계 재검토 신청이 접수되었습니다.");
  };

  return (
    <BusinessCenterShell>
      <div>
        <PageBreadcrumb
          items={[
            { label: "기업센터", href: "/business/dashboard" },
            { label: "기업관리" },
            { label: "후기 관리" },
          ]}
        />
        <PageTitle className="max-[760px]:mt-0">후기 관리</PageTitle>
        <p className="mt-2 text-[15px] font-normal leading-[1.7] text-[#68717e]">
          우리 약국에 등록된 재직 후기를 확인하고 공식 답변을 남길 수 있습니다.
        </p>

        <div className="mt-8 grid gap-4">
          {reviews.map((review) => {
            const state = ownerState[review.id];
            const item = { ...toCompanyReviewCardItem(review), officialReply: state?.officialReply };
            /* 비공개 후기에는 조치할 것이 남아 있지 않다 — 답변할 본문도, 신고할 내용도 이미 내려갔다 */
            const isHidden = Boolean(item.hiddenNotice);
            const isReplying = replyTargetId === review.id;

            return (
              <section key={review.id} className="border border-border bg-white p-5 max-[760px]:p-4">
                {state?.officialReply || state?.reportStatus === "submitted" || state?.recheckStatus === "inProgress" ? (
                  <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    {state?.officialReply ? <StatusText label="공식 답변 완료" tone="done" /> : null}
                    {state?.reportStatus === "submitted" ? <StatusText label="신고 접수됨" tone="progress" /> : null}
                    {state?.recheckStatus === "inProgress" ? <StatusText label="재검토 진행 중" tone="progress" /> : null}
                  </div>
                ) : null}

                <CompanyReviewCard review={item} frameless />

                {isHidden ? null : (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[#edf1f5] pt-4">
                    <Button type="button" variant="primary" size="sm" onClick={() => openReply(review.id)}>
                      {state?.officialReply ? "답변 수정" : "공식 답변 작성"}
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setReportTargetId(review.id)}>
                      신고
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setRecheckTargetId(review.id)}>
                      사실관계 재검토 신청
                    </Button>
                  </div>
                )}

                {isReplying ? (
                  <div className="mt-4 border-t border-[#edf1f5] pt-4">
                    <p className="text-[13px] font-normal leading-[1.65] text-[#68717e]">{REPLY_GUIDE}</p>
                    <textarea
                      value={replyDraft}
                      onChange={(event) => setReplyDraft(event.target.value)}
                      rows={4}
                      className={clsx(TEXTAREA_CLASS, "mt-2.5")}
                      placeholder="후기에 대한 답변을 작성해 주세요."
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => setReplyTargetId(null)}>
                        취소
                      </Button>
                      <Button type="button" variant="primary" size="sm" disabled={!replyDraft.trim()} onClick={() => submitReply(review.id)}>
                        등록
                      </Button>
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>

      {reportTargetId ? (
        <PharmacyReviewReportModal onClose={() => setReportTargetId(null)} onSubmit={() => submitReport(reportTargetId)} />
      ) : null}
      {recheckTargetId ? (
        <PharmacyReviewRecheckModal onClose={() => setRecheckTargetId(null)} onSubmit={() => submitRecheck(recheckTargetId)} />
      ) : null}

      {toast ? (
        <div className="fixed right-6 top-[84px] z-[80] border border-border bg-white px-5 py-3 text-[13px] font-medium text-[#303946] shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
          {toast}
        </div>
      ) : null}
    </BusinessCenterShell>
  );
}
