"use client";

import clsx from "clsx";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { Button } from "@/components/ui/Button";

type OfferType = "job" | "headhunting";
type OfferStatus = "new" | "read" | "accepted" | "declined";
type OfferTabFilter = "all" | "job" | "headhunting";
type PanelStep = "message" | "acceptDone" | "declineDone";
type ContactMethod = "phone" | "email" | "sms" | "any";
type ContactTime = "morning" | "afternoon" | "evening" | "anytime";
type DeclineReason = "no_plan" | "role_mismatch" | "conditions_mismatch" | "not_interested" | "no_reason";
type ResponseModalState = { offerId: string; mode: "accept" | "decline" };
type ResponseModalConfirmPayload =
  | { mode: "accept"; method: ContactMethod; time: ContactTime }
  | { mode: "decline"; reason: DeclineReason | null };

interface Offer {
  id: string;
  type: OfferType;
  sender: string;
  positionTitle: string;
  receivedAt: string;
  status: OfferStatus;
  message: string;
}

const mockOffers: Offer[] = [
  {
    id: "offer-1",
    type: "job",
    sender: "한국로슈",
    positionTitle: "의학부 학술영업 담당자 (MSL)",
    receivedAt: "2026.06.25",
    status: "new",
    message:
      "안녕하세요, 한국로슈 인사팀입니다.\n\n귀하의 이력서를 검토한 결과, 당사 의학부 학술영업(MSL) 포지션에 적합한 인재라 판단하여 먼저 연락드립니다.\n\n해당 포지션은 제약 영업 3년 이상의 경력을 보유하신 분으로, 전국 주요 거점 병원의 의사·약사를 대상으로 한국로슈 제품의 학술 정보를 전달하고 Key Opinion Leader(KOL)를 관리하는 업무를 담당합니다.\n\n처우는 귀하의 경력과 역량에 따라 협의 가능하며, 내부 기준 상위 20% 수준을 보장해 드립니다.\n\n관심이 있으시다면 제안을 수락해 주시면 채용 담당자가 별도로 연락드리겠습니다.",
  },
  {
    id: "offer-2",
    type: "headhunting",
    sender: "더파마 헤드헌터",
    positionTitle: "제약 R&D PM (대리~과장급)",
    receivedAt: "2026.06.24",
    status: "new",
    message:
      "안녕하세요, 더파마 리크루트 헤드헌팅팀입니다.\n\n귀하의 바이오 연구개발 경력과 PM 역량을 바탕으로, 국내 상위 제약사의 R&D PM 포지션을 제안드립니다.\n\n[포지션 주요 정보]\n- 직무: 신약 후보물질 개발 프로젝트 관리 및 외부 CRO 협업\n- 경력: 대리~과장급 (연구 경력 3~8년)\n- 근무지: 판교 / 오송\n- 처우: 연봉 5,500~8,000만원 (협의 가능)\n\n기업명은 개인정보 보호 정책상 제안 수락 후 공개해 드립니다. 궁금하신 점은 수락 후 담당 헤드헌터가 상세히 안내해 드리겠습니다.",
  },
];

const OFFER_TABS: Array<{ id: OfferTabFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "job", label: "입사 제안" },
  { id: "headhunting", label: "헤드헌팅 제안" },
];

const CONTACT_METHOD_OPTIONS: Array<{ id: ContactMethod; label: string }> = [
  { id: "phone", label: "전화" },
  { id: "email", label: "이메일" },
  { id: "sms", label: "문자" },
  { id: "any", label: "연락 방법 무관" },
];

const CONTACT_TIME_OPTIONS: Array<{ id: ContactTime; label: string }> = [
  { id: "morning", label: "오전" },
  { id: "afternoon", label: "오후" },
  { id: "evening", label: "저녁" },
  { id: "anytime", label: "언제든 가능" },
];

const DECLINE_REASON_OPTIONS: Array<{ id: DeclineReason; label: string }> = [
  { id: "no_plan", label: "현재 이직 계획이 없어요" },
  { id: "role_mismatch", label: "직무가 맞지 않아요" },
  { id: "conditions_mismatch", label: "근무 조건이 맞지 않아요" },
  { id: "not_interested", label: "기업에 관심이 없어요" },
  { id: "no_reason", label: "사유를 전달하지 않을게요" },
];

function labelOf<T extends string>(options: Array<{ id: T; label: string }>, id: T): string {
  return options.find((option) => option.id === id)?.label ?? id;
}

function OfferTypeBadge({ type }: { type: OfferType }) {
  return (
    <span className="flex w-[96px] shrink-0 items-center text-[15px] font-medium text-[#596373]">
      {type === "headhunting" ? "헤드헌팅 제안" : "입사 제안"}
    </span>
  );
}

const OFFER_STATUS_CONFIG: Record<OfferStatus, { dot: string; text: string; label: string }> = {
  new: { dot: "bg-status-positive-dot", text: "text-status-positive", label: "신규" },
  read: { dot: "bg-status-neutral-dot", text: "text-[#6b7280]", label: "확인함" },
  accepted: { dot: "bg-status-positive-dot", text: "text-status-positive", label: "수락함" },
  declined: { dot: "bg-status-neutral-dot", text: "text-[#6b7280]", label: "거절함" },
};

function OfferStatusBadge({ status }: { status: OfferStatus }) {
  const { dot, text, label } = OFFER_STATUS_CONFIG[status];
  return (
    <span className="inline-flex w-fit shrink-0 items-center gap-[8px]">
      <span className={clsx("h-[8px] w-[8px] rounded-full shrink-0", dot)} />
      <span className={clsx("text-[13px] font-medium", text)}>{label}</span>
    </span>
  );
}

/** 응답 흐름의 단일선택 칩 — 기존 폼 칩(직각, 선택 시 border-[#111111] bg-[#f7f8fa]) 관례를 따른다. */
function OfferChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "h-9 border px-3 text-[13px] font-medium transition",
        selected ? "border-[#111111] bg-[#f7f8fa] text-[#111111]" : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
      )}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

/** 접힌 행의 메타 행과 동일한 라벨/값 문법 — 응답 완료 화면에서 선택 내역을 재표시할 때 재사용. */
function MetaRow({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-x-3">
          {index > 0 ? <span aria-hidden="true" className="h-3 w-px bg-[#e5e7eb]" /> : null}
          <span className="flex items-center gap-x-1.5">
            <span className="whitespace-nowrap text-[13px] text-[#9ca3af]">{item.label}</span>
            <span className="whitespace-nowrap text-[13px] text-[#4b5563]">{item.value}</span>
          </span>
        </span>
      ))}
    </div>
  );
}

/**
 * 응답(수락/거절) 모달 — 공용 모달 셸이 없어(src/components/ui/ 확인 완료) business/StageMoveModal.tsx의
 * 구조·스타일 관례(오버레이, 헤더+닫기 버튼, 각진 모서리, 스크롤 락, Esc/오버레이 클릭 닫기)를 참고해
 * 이 파일 안에 로컬로 작성. cross-import 없이 personal 영역 안에서만 재사용.
 */
function OfferResponseModal({
  mode,
  onClose,
  onConfirm,
}: {
  mode: "accept" | "decline";
  onClose: () => void;
  onConfirm: (payload: ResponseModalConfirmPayload) => void;
}) {
  const [method, setMethod] = useState<ContactMethod | null>(null);
  const [time, setTime] = useState<ContactTime | null>(null);
  const [reason, setReason] = useState<DeclineReason | null>(null);
  const isAccept = mode === "accept";
  const canConfirm = isAccept ? Boolean(method && time) : true;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleConfirm() {
    if (isAccept) {
      if (!method || !time) return;
      onConfirm({ mode: "accept", method, time });
    } else {
      onConfirm({ mode: "decline", reason });
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={isAccept ? "제안 수락" : "제안 거절"}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-[440px] flex-col border border-border bg-white shadow-[0_18px_48px_rgba(0,0,0,0.22)] max-h-[92dvh] max-[480px]:max-h-[100dvh] max-[480px]:max-w-none max-[480px]:self-end">
        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">{isAccept ? "제안 수락" : "제안 거절"}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid h-8 w-8 shrink-0 place-items-center text-[#8a94a3] hover:bg-[#f4f5f6]"
          >
            <X size={16} />
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto px-6 py-5">
          <p className="text-[13px] font-normal leading-relaxed text-[#6b7280]">
            {isAccept
              ? "수락하시면 담당자가 등록된 연락처로 연락드립니다. 제안 수락은 지원이나 입사 확정을 의미하지 않습니다."
              : "거절 의사만 기업에 전달되며, 선택하신 사유는 전달되지 않습니다."}
          </p>

          {isAccept ? (
            <>
              <div className="mt-5">
                <p className="text-[15px] font-medium text-[#303946]">연락 방법</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CONTACT_METHOD_OPTIONS.map((option) => (
                    <OfferChip
                      key={option.id}
                      label={option.label}
                      selected={method === option.id}
                      onClick={() => setMethod(option.id)}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <p className="text-[15px] font-medium text-[#303946]">연락 가능 시간</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CONTACT_TIME_OPTIONS.map((option) => (
                    <OfferChip
                      key={option.id}
                      label={option.label}
                      selected={time === option.id}
                      onClick={() => setTime(option.id)}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-5">
              <p className="text-[15px] font-medium text-[#303946]">거절 사유 (선택)</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DECLINE_REASON_OPTIONS.map((option) => (
                  <OfferChip
                    key={option.id}
                    label={option.label}
                    selected={reason === option.id}
                    onClick={() => setReason((prev) => (prev === option.id ? null : option.id))}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex shrink-0 justify-end gap-2 px-6 py-4">
          <Button type="button" size="sm" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button
            type="button"
            size="sm"
            variant="primary"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {isAccept ? "수락 확정" : "거절 확정"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MyPageOffersClient() {
  const [activeTab, setActiveTab] = useState<OfferTabFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  /** 런타임 상태 — 새로고침 시 초기화되는 목업 관례. mockOffers의 초기 status는 건드리지 않는다. */
  const [offerStatuses, setOfferStatuses] = useState<Record<string, OfferStatus>>(() =>
    Object.fromEntries(mockOffers.map((offer) => [offer.id, offer.status])),
  );
  const [panelStep, setPanelStep] = useState<PanelStep>("message");
  const [acceptSelections, setAcceptSelections] = useState<Record<string, { method: ContactMethod; time: ContactTime }>>({});
  const [activeModal, setActiveModal] = useState<ResponseModalState | null>(null);

  const tabCounts: Record<OfferTabFilter, number> = {
    all: mockOffers.length,
    job: mockOffers.filter((o) => o.type === "job").length,
    headhunting: mockOffers.filter((o) => o.type === "headhunting").length,
  };

  const filtered = activeTab === "all" ? mockOffers : mockOffers.filter((o) => o.type === activeTab);

  function toggleExpand(id: string) {
    const opening = expandedId !== id;
    setExpandedId(opening ? id : null);
    setActiveModal(null);
    if (opening) {
      setOfferStatuses((prev) => (prev[id] === "new" ? { ...prev, [id]: "read" } : prev));
      const current = offerStatuses[id];
      setPanelStep(current === "accepted" ? "acceptDone" : current === "declined" ? "declineDone" : "message");
    }
  }

  function handleModalConfirm(payload: ResponseModalConfirmPayload) {
    if (!activeModal) return;
    const { offerId } = activeModal;
    if (payload.mode === "accept") {
      setOfferStatuses((prev) => ({ ...prev, [offerId]: "accepted" }));
      setAcceptSelections((prev) => ({ ...prev, [offerId]: { method: payload.method, time: payload.time } }));
      setPanelStep("acceptDone");
    } else {
      setOfferStatuses((prev) => ({ ...prev, [offerId]: "declined" }));
      setPanelStep("declineDone");
    }
    setActiveModal(null);
  }

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "받은 제안" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">받은 제안</h1>
      <p className="mt-2.5 max-w-[560px] text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        받은 입사 제안과 헤드헌팅 제안을 한곳에서 확인할 수 있습니다.
      </p>

      {/* 상단 상태 칩 */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="inline-flex h-7 items-center gap-1.5 border border-status-positive-border bg-status-positive-subtle px-2.5 text-[13px] font-medium text-status-positive">
          <span className="h-1.5 w-1.5 rounded-full bg-status-positive" />
          제안 받기 켜짐
        </span>
        <span className="inline-flex h-7 items-center border border-[#e0e4ea] bg-[#f7f8fa] px-2.5 text-[13px] font-medium text-[#68717e]">
          이력서 1건 공개 중
        </span>
      </div>

      {/* 탭 — 지원 현황과 동일한 패턴 */}
      <div className="mt-7 flex items-center gap-6 border-b border-border">
        {OFFER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "relative flex items-center gap-1.5 pb-3 text-[15px] font-medium transition-colors",
              activeTab === tab.id
                ? "text-[#111111] after:absolute after:-bottom-px after:left-0 after:h-[2px] after:w-full after:bg-[#111111]"
                : "text-[#8a94a3] hover:text-[#111111]",
            )}
          >
            {tab.label}
            <span
              className={clsx(
                "text-[13px]",
                activeTab === tab.id ? "font-bold text-[#111111]" : "font-normal text-[#a0a9b7]",
              )}
            >
              {tabCounts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* 제안 목록 */}
      <div className="mt-5 space-y-4">
        {filtered.length > 0 ? (
          filtered.map((offer) => (
            <article key={offer.id} className="border border-border bg-white">
              {/* 행 */}
              <div className="flex items-center gap-4 px-6 py-5 max-[600px]:flex-wrap max-[600px]:gap-2.5 max-[640px]:px-5">
                {/* 좌측 앵커: 유형 라벨 + 세로 헤어라인 (헤어라인은 행 높이만큼, 라벨은 그 안에서 세로 가운데) */}
                <div className="flex shrink-0 items-stretch gap-4 self-stretch max-[600px]:w-full">
                  <OfferTypeBadge type={offer.type} />
                  <span aria-hidden="true" className="w-px shrink-0 self-stretch bg-[#eef1f4]" />
                </div>
                {/* 포지션명 + 메타 행 */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[17px] font-bold tracking-[-0.01em] text-[#17202c]">
                    {offer.positionTitle}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {[{ value: offer.sender }, { label: "받은 날짜", value: offer.receivedAt }].map((item, index) => (
                      <span key={index} className="flex items-center gap-x-3">
                        {index > 0 ? <span aria-hidden="true" className="h-3 w-px bg-[#e5e7eb]" /> : null}
                        <span className="flex items-center gap-x-1.5">
                          {item.label ? <span className="whitespace-nowrap text-[13px] text-[#9ca3af]">{item.label}</span> : null}
                          <span className="whitespace-nowrap text-[13px] text-[#4b5563]">{item.value}</span>
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
                {/* 우: 상태 + 버튼 */}
                <div className="flex shrink-0 items-center gap-3 max-[600px]:self-start">
                  <OfferStatusBadge status={offerStatuses[offer.id]} />
                  <button
                    type="button"
                    onClick={() => toggleExpand(offer.id)}
                    className={clsx(
                      "inline-flex h-8 items-center gap-1 border px-3 text-[13px] font-medium transition",
                      expandedId === offer.id
                        ? "border-[#303946] text-[#303946]"
                        : "border-[#cfd8e3] text-[#596373] hover:border-[#303946] hover:text-[#303946]",
                    )}
                  >
                    상세
                    {expandedId === offer.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>
              </div>

              {/* 상세 펼침 */}
              {/* pl-[153px]는 px-6(24) + 유형 라벨 w-[96px] + gap-4(16) + 헤어라인(1) + gap-4(16)의 합 — 포지션명 왼쪽 끝과 맞추는 값이므로 w-[96px]를 바꾸면 이 값도 함께 고친다. */}
              {expandedId === offer.id && (
                <div className="border-t border-[#edf1f5] py-5 pl-[153px] pr-6 max-[640px]:px-5">
                  {panelStep === "message" && (
                    <>
                      <div className="max-w-[720px] whitespace-pre-line text-[15px] font-normal leading-relaxed tracking-[-0.005em] text-[#4f5967]">
                        {offer.message}
                      </div>
                      <div className="mt-5 flex justify-end gap-2 border-t border-[#edf1f5] pt-4">
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          onClick={() => setActiveModal({ offerId: offer.id, mode: "accept" })}
                        >
                          제안 수락하기
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setActiveModal({ offerId: offer.id, mode: "decline" })}
                        >
                          제안 거절하기
                        </Button>
                      </div>
                    </>
                  )}

                  {panelStep === "acceptDone" && (
                    <div className="max-w-[720px]">
                      <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#17202c]">제안을 수락했습니다</p>
                      <p className="mt-2 text-[15px] font-normal leading-relaxed text-[#4f5967]">
                        {offer.sender} 담당자가 선택하신 방법으로 영업일 기준 1~2일 이내 연락드릴 예정입니다.
                      </p>
                      <p className="mt-2 text-[12px] font-normal text-[#9ca3af]">
                        제안 수락은 지원이나 입사 확정을 의미하지 않습니다.
                      </p>
                      {acceptSelections[offer.id] ? (
                        <div className="mt-4">
                          <MetaRow
                            items={[
                              { label: "연락 방법", value: labelOf(CONTACT_METHOD_OPTIONS, acceptSelections[offer.id].method) },
                              { label: "연락 가능 시간", value: labelOf(CONTACT_TIME_OPTIONS, acceptSelections[offer.id].time) },
                            ]}
                          />
                        </div>
                      ) : null}
                    </div>
                  )}

                  {panelStep === "declineDone" && (
                    <div className="max-w-[720px]">
                      <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#17202c]">제안을 거절했습니다</p>
                      <p className="mt-2 text-[15px] font-normal leading-relaxed text-[#4f5967]">
                        기업에는 거절 의사만 전달됩니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="border border-border bg-white p-10 text-center">
            <p className="text-[15px] font-medium text-[#303946]">해당하는 제안이 없습니다.</p>
            <p className="mt-2 text-[13px] font-normal text-[#8a94a3]">
              이력서를 공개하면 기업과 헤드헌터가 포지션을 제안할 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {activeModal ? (
        <OfferResponseModal mode={activeModal.mode} onClose={() => setActiveModal(null)} onConfirm={handleModalConfirm} />
      ) : null}
    </MyPageShell>
  );
}
