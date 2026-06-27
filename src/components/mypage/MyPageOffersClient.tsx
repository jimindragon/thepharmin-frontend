"use client";

import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";

type OfferType = "job" | "headhunting";
type OfferStatus = "new" | "read";
type OfferTabFilter = "all" | "job" | "headhunting";

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
    sender: "한독",
    positionTitle: "의학부 학술영업 담당자 (MSL)",
    receivedAt: "2026.06.25",
    status: "new",
    message:
      "안녕하세요, 한독 인사팀입니다.\n\n귀하의 이력서를 검토한 결과, 당사 의학부 학술영업(MSL) 포지션에 적합한 인재라 판단하여 먼저 연락드립니다.\n\n해당 포지션은 제약 영업 3년 이상의 경력을 보유하신 분으로, 전국 주요 거점 병원의 의사·약사를 대상으로 한독 제품의 학술 정보를 전달하고 Key Opinion Leader(KOL)를 관리하는 업무를 담당합니다.\n\n처우는 귀하의 경력과 역량에 따라 협의 가능하며, 내부 기준 상위 20% 수준을 보장해 드립니다.\n\n관심이 있으시다면 제안을 수락해 주시면 채용 담당자가 별도로 연락드리겠습니다.",
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
  { id: "job", label: "입사제안" },
  { id: "headhunting", label: "헤드헌팅 제안" },
];

function OfferTypeBadge({ type }: { type: OfferType }) {
  if (type === "headhunting") {
    return (
      <span className="inline-flex shrink-0 items-center border border-[#b8dad8] bg-[#e8f5f4] px-2 py-0.5 text-[11px] font-medium text-[#005f59]">
        헤드헌팅 제안
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center border border-[#dfe4ea] bg-[#f7f8fa] px-2 py-0.5 text-[11px] font-medium text-[#596373]">
      입사제안
    </span>
  );
}

function OfferStatusBadge({ status }: { status: OfferStatus }) {
  if (status === "new") {
    return (
      <span className="inline-flex h-5 shrink-0 items-center border border-[#9ecec9] bg-[#e8f5f4] px-1.5 text-[11px] font-medium text-[#00746C]">
        신규
      </span>
    );
  }
  return (
    <span className="inline-flex h-5 shrink-0 items-center border border-[#c4cbd5] px-1.5 text-[11px] font-normal text-[#8a94a3]">
      확인함
    </span>
  );
}

export function MyPageOffersClient() {
  const [activeTab, setActiveTab] = useState<OfferTabFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const tabCounts: Record<OfferTabFilter, number> = {
    all: mockOffers.length,
    job: mockOffers.filter((o) => o.type === "job").length,
    headhunting: mockOffers.filter((o) => o.type === "headhunting").length,
  };

  const filtered = activeTab === "all" ? mockOffers : mockOffers.filter((o) => o.type === activeTab);

  function toggleExpand(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "받은 제안" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">받은 제안</h1>
      <p className="mt-2.5 max-w-[560px] text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        받은 입사 제안과 헤드헌팅 제안을 한곳에서 확인할 수 있습니다.
      </p>

      {/* 상단 상태 칩 */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="inline-flex h-6 items-center gap-1.5 border border-[#b8dad8] bg-[#e8f5f4] px-2.5 text-[11px] font-medium text-[#00746C]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00746C]" />
          제안 받기 켜짐
        </span>
        <span className="inline-flex h-6 items-center border border-[#e0e4ea] bg-[#f7f8fa] px-2.5 text-[11px] font-medium text-[#68717e]">
          이력서 1건 공개 중
        </span>
      </div>

      {/* 탭 — 지원 현황과 동일한 패턴 */}
      <div className="mt-7 flex items-center gap-6 border-b border-[#e5e9ef]">
        {OFFER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "relative flex items-center gap-1.5 pb-3 text-[14px] font-medium transition-colors",
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
            <article key={offer.id} className="border border-[#dfe4ea] bg-white">
              {/* 행 */}
              <div className="flex items-center gap-4 p-6 max-[600px]:flex-wrap max-[600px]:gap-2.5 max-[640px]:p-5">
                {/* 좌: 뱃지 + 포지션 + 발신자 */}
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="mt-0.5">
                    <OfferTypeBadge type={offer.type} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[17px] font-bold tracking-[-0.01em] text-[#17202c]">
                      {offer.positionTitle}
                    </p>
                    <p className="mt-1 text-[13px] font-normal leading-[1.6] text-[#68717e]">
                      {offer.sender} · 받은 날짜 {offer.receivedAt}
                    </p>
                  </div>
                </div>
                {/* 우: 상태 + 버튼 */}
                <div className="flex shrink-0 items-center gap-3">
                  <OfferStatusBadge status={offer.status} />
                  <button
                    type="button"
                    onClick={() => toggleExpand(offer.id)}
                    className={clsx(
                      "inline-flex h-8 items-center gap-1 border px-3 text-[12px] font-medium transition",
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
              {expandedId === offer.id && (
                <div className="border-t border-[#edf1f5] bg-[#f7f8fa] px-6 py-5 max-[640px]:px-5">
                  <p className="text-[12px] font-medium text-[#a0a9b7]">
                    {offer.receivedAt} · {offer.sender}
                  </p>
                  <p className="mt-1 text-[15px] font-semibold tracking-[-0.01em] text-[#17202c]">
                    {offer.positionTitle}
                  </p>
                  <div className="mt-4 whitespace-pre-line text-[13px] font-normal leading-[1.8] tracking-[-0.005em] text-[#4f5967]">
                    {offer.message}
                  </div>
                  {/* 비활성 액션 영역 */}
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#edf1f5] pt-4">
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="inline-flex h-8 cursor-not-allowed items-center border border-[#d8dde5] bg-[#f0f2f4] px-4 text-[12px] font-medium text-[#b0b8c3]"
                    >
                      수락
                    </button>
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="inline-flex h-8 cursor-not-allowed items-center border border-[#d8dde5] px-4 text-[12px] font-medium text-[#b0b8c3]"
                    >
                      거절
                    </button>
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="inline-flex h-8 cursor-not-allowed items-center border border-[#d8dde5] px-4 text-[12px] font-medium text-[#b0b8c3]"
                    >
                      보류
                    </button>
                    <span className="text-[12px] font-normal text-[#a4adba]">
                      응답 기능은 추후 제공될 예정입니다.
                    </span>
                  </div>
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="border border-[#dfe4ea] bg-white p-10 text-center">
            <p className="text-[14px] font-medium text-[#303946]">해당하는 제안이 없습니다.</p>
            <p className="mt-2 text-[13px] font-normal text-[#8a94a3]">
              이력서를 공개하면 기업과 헤드헌터가 포지션을 제안할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </MyPageShell>
  );
}
