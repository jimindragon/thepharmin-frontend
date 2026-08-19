"use client";

import clsx from "clsx";
import Link from "next/link";
import { ChevronDown, MessageCircle, ThumbsUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FLUSH_LIST_CLASS } from "@/components/flushListStyles";
import { PageHeader } from "@/components/PageHeader";
import { PageTabBar } from "@/components/ui/PageTabBar";
import { getEntryCommentCount, qnaCategoryFilters } from "@/data/qna";
import type { QnaListEntry, QnaType } from "@/types/qna";
import {
  MyActivityPanel,
  PopularTagsPanel,
  QnaAuthorAvatar,
  QnaNotice,
  QnaOperationPrinciplePanel,
  showQnaNotice,
  TrendingPostsPanel,
} from "@/components/qna/QnaShared";
import { QnaComposer } from "@/components/qna/QnaComposer";
import { PharmacistLicenseNoticeGate } from "@/components/qna/PharmacistLicenseNoticeModal";

type QnaSortOption = "추천순" | "최신순" | "공감순";
const qnaSortOptions: QnaSortOption[] = ["추천순", "최신순", "공감순"];

const qnaTypeTabs: { id: QnaType; label: string }[] = [
  { id: "pharmacist", label: "약사 QNA" },
  { id: "industry", label: "산업 QNA" },
];

const qnaTypeIntro: Record<QnaType, string> = {
  pharmacist: "약국·병원에서 일하는 약사 인증 회원을 위한 채용·이직 QNA입니다.",
  industry: "제약·바이오 산업 종사자를 위한 채용·이직 QNA입니다.",
};

function withTypeParam(type: QnaType, previewQuery: string) {
  const params = new URLSearchParams(previewQuery.replace(/^\?/, ""));
  params.set("type", type);
  return `/qna?${params.toString()}`;
}

function QnaTypeToggle({ activeType, previewQuery }: { activeType: QnaType; previewQuery: string }) {
  return (
    <div className="flex h-9 shrink-0 overflow-hidden border border-[#dce2ea] bg-white" role="tablist" aria-label="QNA 유형">
      {qnaTypeTabs.map((tab) => {
        const active = tab.id === activeType;
        return (
          <Link
            key={tab.id}
            href={withTypeParam(tab.id, previewQuery)}
            role="tab"
            aria-selected={active}
            className={clsx(
              "flex h-full min-w-[100px] items-center justify-center border-r border-[#dce2ea] px-4 text-[13px] font-medium transition-colors last:border-r-0",
              active ? "bg-[#111111] text-white" : "text-[#596373] hover:bg-[#f4f4f4] hover:text-[#111111]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

/**
 * ≤760px에서는 박스를 벗고 텍스트 토글이 된다 — 캘린더 "마감/시작" 필터와 같은 문법이다
 * (RecruitmentCalendarClient.tsx의 트랙 필터). 좁은 화면의 검은 박스는 유형 토글·카테고리 칩·BEST
 * 배지까지 이미 세 겹이라, 정렬까지 박스로 두면 무엇이 상위 층인지 읽히지 않는다.
 * 활성은 #111111 + font-medium, 비활성은 #8a94a3 — 밑줄은 쓰지 않는다(칩·탭과 층이 갈리는 신호는 색뿐).
 *
 * 기본값이 모바일이고 min-[761px]:로 박스를 다시 붙이는 방향으로 쓴 이유 — 같은 속성을 두 벌 쓸 때
 * max-/min- 변형끼리 겹치면 Tailwind 출력 순서에 기대게 된다. 한쪽만 변형을 달면 다툼 자체가 없다.
 */
function SortControl({ value, onChange }: { value: QnaSortOption; onChange: (option: QnaSortOption) => void }) {
  return (
    <div
      className="flex h-10 shrink-0 items-center gap-4 min-[761px]:grid min-[761px]:h-[36px] min-[761px]:grid-cols-3 min-[761px]:gap-0 min-[761px]:overflow-hidden min-[761px]:border min-[761px]:border-[#dce2ea] min-[761px]:bg-white"
      role="group"
      aria-label="정렬"
    >
      {qnaSortOptions.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={clsx(
            /* 텍스트일 때도 40px 터치 타깃 — 높이는 부모(h-10)가 주고 버튼이 전부 채운다 */
            "h-full text-[13px] font-medium transition-colors min-[761px]:min-w-[72px] min-[761px]:border-r min-[761px]:border-[#dce2ea] min-[761px]:px-3 min-[761px]:text-[12px] min-[761px]:last:border-r-0",
            value === option
              ? "text-[#111111] min-[761px]:bg-[#111111] min-[761px]:text-white"
              : "text-[#8a94a3] min-[761px]:text-[#3d4653] min-[761px]:hover:bg-[#f4f4f4]",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/**
 * ≤760px 풀블리드. 목록 컨테이너(FLUSH_LIST_CLASS)가 화면 폭까지 밀어내고 카드 사이 선을
 * divide-y로 그리므로, 카드 자신의 테두리는 761px 이상에서만 붙인다. 루트가 .surface가 아니라
 * 순수 유틸리티라 ScrapedOrganizationCard처럼 특이도 다툼 없이 분기만 하면 된다.
 *
 * 좌우 패딩은 화면 여백이 되는 순간 24px로 올려 같은 화면의 h1·칩이 서 있는 선에 맞춘다.
 * p 단축형 대신 px/py로 축을 나눈 이유는 JobCard flush와 같다 — 같은 축 안에서
 * "변형 없는 유틸리티 < 변형 붙은 유틸리티"만 남아 Tailwind 출력 순서에 기대지 않는다.
 */
const QNA_CARD_CLASS = "bg-white px-5 py-5 transition max-[760px]:px-6 min-[761px]:border min-[761px]:border-[#e5e9ef]";

function QnaListCard({ entry, previewQuery }: { entry: QnaListEntry; previewQuery: string }) {
  const clickable = true;
  const excerpt = entry.body[0];
  const commentCount = getEntryCommentCount(entry);
  const isBest = Boolean(entry.isBest);

  const content = (
    <article className={clsx(QNA_CARD_CLASS, clickable && "min-[761px]:hover:border-[#111111]")}>
      {isBest ? (
        <span className="mb-2.5 inline-flex h-6 items-center bg-[#111111] px-2 text-[12px] font-semibold text-white">BEST</span>
      ) : null}

      <div className="flex items-center gap-2.5">
        <QnaAuthorAvatar id={entry.id} nickname={entry.nickname} size={38} />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[#3d4653]">{entry.nickname}</p>
          <p className="mt-0.5 truncate text-[13px] font-normal text-[#8b95a1]">
            {[entry.jobRole, entry.createdAtLabel].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <h3 className="mt-3 text-[17px] font-semibold leading-[1.4] tracking-[-0.01em] text-[#171d26] max-[760px]:text-[16px]">{entry.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-[14px] font-normal leading-[1.6] text-[#596373]">{excerpt}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-[#edf1f5] pt-3">
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-[#596373]">
          {entry.tags.map((tag) => (
            <span key={tag} className="whitespace-nowrap">
              #{tag}
            </span>
          ))}
        </span>
        {/* 댓글·공감 모두 "회색 아이콘 + 숫자"로 통일한다 — 한쪽만 단어를 달고 있으면 두 지표가 같은 층으로 읽히지 않는다.
            단어가 사라져 숫자만 남으므로 각 묶음이 레이블을 직접 진다. role="img"를 함께 두는 이유는
            role 없는 span에는 aria-label이 노출되지 않아(generic 롤), 안쪽을 aria-hidden으로 덮은 순간
            스크린리더에서 지표가 통째로 사라지기 때문이다. gap-3은 두 묶음이 한 덩어리로 뭉치는 것을 막는다. */}
        <span className="inline-flex shrink-0 items-center gap-3 text-[13px] font-normal text-[#8b95a1]">
          <span role="img" aria-label={`댓글 ${commentCount}개`} className="inline-flex items-center gap-1">
            <MessageCircle size={14} aria-hidden="true" />
            <span aria-hidden="true">{commentCount}</span>
          </span>
          <span role="img" aria-label={`공감 ${entry.likeCount}개`} className="inline-flex items-center gap-1">
            <ThumbsUp size={14} aria-hidden="true" />
            <span aria-hidden="true">{entry.likeCount}</span>
          </span>
        </span>
      </div>
    </article>
  );

  if (!clickable) {
    return <div className="cursor-default">{content}</div>;
  }

  return (
    <Link href={`/qna/${entry.id}${previewQuery}`} className="block">
      {content}
    </Link>
  );
}

function QnaListEmptyState() {
  return (
    <div className="flex h-[160px] flex-col items-center justify-center gap-1.5 border border-[#e5e9ef] bg-[#fbfcfd] text-center">
      <p className="text-[14px] font-semibold text-[#3d4653]">조건에 맞는 글이 없습니다.</p>
      <p className="text-[13px] font-normal text-[#8791a0]">다른 카테고리나 정렬을 선택해보세요.</p>
    </div>
  );
}

/**
 * 접힘 상태에서 보여줄 칩 2줄의 높이 — 칩 h-[36px] 두 줄 + 그 사이 gap-2(8px).
 * 위 nav의 `max-[760px]:max-h-[80px]`와 같은 값이어야 한다(한쪽만 바꾸면 넘침 판정이 어긋난다).
 */
const CHIPS_COLLAPSED_MAX_HEIGHT = 36 * 2 + 8;

interface QnaHomeClientProps {
  activeType: QnaType;
  canSwitchType: boolean;
  /**
   * 면허를 등록하면 약사 인증을 받을 수 있는 회원인지. 약사 자격과 무관한 회원에게
   * "면허를 등록하세요"는 안내가 아니라 잘못된 권유라, 안내 창은 이 값으로 갈린다.
   */
  canRegisterLicense: boolean;
  isLoggedIn: boolean;
  entries: QnaListEntry[];
  popularEntries: QnaListEntry[];
  previewQuery: string;
  /** 약사 QNA 상세에서 되돌려보내진 직후인지 — 봤음 기록을 무시하고 안내 창을 다시 띄우는 조건 */
  cameFromPharmacistOnly?: boolean;
}

export function QnaHomeClient({
  activeType,
  canSwitchType,
  canRegisterLicense,
  isLoggedIn,
  entries,
  popularEntries,
  previewQuery,
  cameFromPharmacistOnly = false,
}: QnaHomeClientProps) {
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [sortOption, setSortOption] = useState<QnaSortOption>("추천순");
  const [notice, setNotice] = useState("");
  const [chipsExpanded, setChipsExpanded] = useState(false);
  const [chipsOverflow, setChipsOverflow] = useState(false);
  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /** 상세페이지 "인기 태그" 클릭(/qna?type=...&tag=...)으로 들어왔을 때 해당 태그로 바로 필터링 */
    const tagParam = new URLSearchParams(window.location.search).get("tag");
    const isValidTag = Boolean(tagParam) && qnaCategoryFilters[activeType].includes(tagParam!);
    setCategoryFilter(isValidTag ? tagParam! : "전체");
    setSortOption("추천순");
    setChipsExpanded(false);
  }, [activeType]);

  const filterChips = useMemo(() => ["전체", ...qnaCategoryFilters[activeType]], [activeType]);

  /**
   * 펼치기 버튼을 낼지 판정한다. 칩 **개수**가 아니라 실제 넘침을 본다 — 같은 10개라도 390px에서는
   * 4줄, 720px에서는 2줄이라 개수 기준은 어느 폭에선가 반드시 틀린다.
   *
   * 재는 값은 칩 묶음의 scrollHeight(=클램프와 무관한 콘텐츠 전체 높이)이고, 접힘 높이 80px과 비교한다.
   * clientHeight와 비교하지 않는 이유는 펼친 상태에서 둘이 같아져 버튼이 사라지기 때문이다.
   * ResizeObserver로 폭 변화(회전·리사이즈)를 따라가고, 칩 목록이 바뀌는 유형 전환은 deps가 잡는다.
   * 서버 렌더와 첫 클라이언트 렌더는 모두 false라 하이드레이션 불일치가 없다.
   */
  useEffect(() => {
    const element = chipsRef.current;
    if (!element) return;

    const measure = () => setChipsOverflow(element.scrollHeight > CHIPS_COLLAPSED_MAX_HEIGHT + 1);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [filterChips]);

  const visibleEntries = useMemo(() => {
    const filtered = categoryFilter === "전체" ? entries : entries.filter((entry) => entry.tags.includes(categoryFilter));

    return [...filtered].sort((a, b) => {
      if (sortOption === "공감순") return b.likeCount - a.likeCount;
      if (sortOption === "최신순") return a.minutesAgo - b.minutesAgo;
      const aBest = a.isBest ? 1 : 0;
      const bBest = b.isBest ? 1 : 0;
      if (aBest !== bBest) return bBest - aBest;
      return b.likeCount - a.likeCount;
    });
  }, [entries, categoryFilter, sortOption]);

  return (
    <main className="bg-[#f7f8fa] pb-20 max-[760px]:pb-16">
      {/* ≤760px h1 상단 여백은 캘린더(pt-8 = 32px) 기준으로 통일 — 이전 max-[760px]:pt-6(24px)에서 수렴 */}
      <div className="app-shell pt-8">
        <PageHeader
          breadcrumbLabel="채용 QNA"
          eyebrow="THE PHARMA QNA"
          title="채용 QNA"
          description={qnaTypeIntro[activeType]}
          /* 약사/산업 구분을 설명하는 유일한 문장이라 접지 않고 한 줄 캡션으로 줄인다 */
          mobileDescription="caption"
          rightSlot={canSwitchType ? <QnaTypeToggle activeType={activeType} previewQuery={previewQuery} /> : undefined}
          rightSlotClassName="max-[760px]:hidden"
        />

        {/*
          ≤760px에서는 유형 전환이 다른 탭바 페이지와 같은 자리(h1 블록 바로 아래 전폭 탭바)에 서야 한다.
          제목 옆 우측 슬롯과 h1 아래 형제는 부모가 서로 달라 CSS로 옮길 수 없어, 캘린더
          UpcomingApplicationsSection 선례대로 같은 컨트롤을 양쪽에 렌더하고 브레이크포인트로 한쪽만 남긴다.
          미인증(canSwitchType=false)이면 양쪽 모두 렌더하지 않는 종전 동작 그대로다.
        */}
        {canSwitchType ? (
          <PageTabBar
            className="mt-7 min-[761px]:hidden"
            ariaLabel="QNA 유형"
            items={qnaTypeTabs}
            activeId={activeType}
            hrefFor={(type) => withTypeParam(type, previewQuery)}
          />
        ) : null}

        {/* 사이드바가 본문 맨 아래로 밀리는 1열 폭에서만 본문 상단으로 끌어올린다 —
            "내 활동"은 /qna/activity로 가는 앱 내 유일한 진입점이라 하단 사각지대에 두면 도달률이 0에 수렴한다.
            아래 aside 사본과 max-[1040px]/min-[1041px]로 정확히 상보라 겹치거나 비는 구간이 없다.

            그 1열 구간(761~1040px)용 사본은 여기, ≤760px용 사본은 컴포저 아래에 따로 둔다 —
            좁은 화면에서는 페이지의 목적인 "글쓰기"가 내 활동 요약보다 먼저 와야 하는데, 두 형제의
            자리를 CSS로 맞바꾸려면 .app-shell 전체를 flex로 바꿔야 해서 헤더·칩·본문까지 같이 흔들린다.
            같은 컨트롤을 두 벌 렌더하고 브레이크포인트로 한쪽만 남기는 건 이 파일의 유형 토글(위)과
            캘린더 UpcomingApplicationsSection이 이미 쓰는 방식이다. 세 구간이 서로 배타라 중복 노출은 없다. */}
        {isLoggedIn ? (
          <MyActivityPanel activeType={activeType} variant="compact" className="mt-6 max-[760px]:hidden min-[1041px]:hidden" />
        ) : null}

        {/* 자격 무관 회원에게는 이유를 실어 보냈더라도 아무것도 띄우지 않는다 — 종전의 무음 그대로다.
            canRegisterLicense는 미인증일 때만 참이라 인증 회원이 주소에 reason을 붙여도 뜨지 않는다.
            창은 fixed라 이 자리에 두는 것은 배치가 아니라 "이 화면의 안내"라는 표시다. */}
        {canRegisterLicense ? <PharmacistLicenseNoticeGate cameFromPharmacistOnly={cameFromPharmacistOnly} /> : null}

        <QnaComposer
          activeType={activeType}
          isLoggedIn={isLoggedIn}
          isVerifiedPharmacist={canSwitchType}
          onNotify={(message) => showQnaNotice(setNotice, message)}
        />

        {/* ≤760px 사본. 제목 없는 3칸만으로는 무엇의 숫자인지 읽히지 않아 레이블 행을 함께 붙인다 */}
        {isLoggedIn ? (
          <MyActivityPanel activeType={activeType} variant="compact" showLabelLink className="mt-4 min-[761px]:hidden" />
        ) : null}

        {/*
          ≤760px도 데스크톱과 같은 wrap이다. 한때 1행 가로 스크롤로 접었지만(3줄 124px을 먹어 첫 화면에 글
          카드가 한 장도 안 들어온다는 이유), 실기기에서는 화면 밖 칩이 있다는 사실 자체가 보이지 않아
          10개 중 3개만 있는 필터로 읽혔다. 대신 접힘 2줄 + 펼치기로 세로 예산을 지키면서 나머지가 있다는
          것도 알린다 — 잘린 칩의 일부가 둘째 줄 끝에 보이고, ∨ 버튼이 더 있음을 확정한다.

          바깥 flex는 칩 묶음과 펼치기 버튼을 좌/우로 가른다. 버튼을 칩과 같은 wrap 안에 두면 마지막 칩
          뒤를 따라다녀 행 중간에 서고, 접힘 상태에서는 잘린 영역으로 넘어가 아예 안 보인다.
          761px 이상에서는 자식이 칩 묶음 하나뿐이라(버튼은 min-[761px]:hidden, 칩 묶음은 flex-1)
          종전 `nav.flex.flex-wrap`과 렌더가 같다.
        */}
        <nav className="mt-8 flex items-start gap-2 border-b border-border pb-3.5 max-[760px]:mt-6" aria-label="QNA 카테고리">
          <div
            ref={chipsRef}
            className={clsx(
              "flex flex-1 flex-wrap gap-2",
              /* 80px = CHIPS_COLLAPSED_MAX_HEIGHT. 값을 문자열로 조립하면 Tailwind가 스캔하지 못해 리터럴로 적는다 */
              !chipsExpanded && "max-[760px]:max-h-[80px] max-[760px]:overflow-hidden",
            )}
          >
            {filterChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setCategoryFilter(chip)}
                className={clsx(
                  "h-[36px] shrink-0 whitespace-nowrap px-4 text-[13px] font-medium transition-colors",
                  categoryFilter === chip
                    ? "border border-[#111111] bg-[#111111] text-white"
                    : "border border-[#dce2ea] bg-white text-[#3d4653] hover:border-[#cfd8e3] hover:bg-[#f7f8fa] hover:text-[#111111]",
                )}
              >
                {chip === "전체" ? chip : `#${chip}`}
              </button>
            ))}
          </div>
          {/* 2줄에 다 들어가면 렌더하지 않는다 — 누를 것이 없는 버튼은 "더 있다"는 거짓 신호다.
              -mt-0.5는 40px 버튼을 36px 첫 줄 가운데에 맞춘다(위아래 2px씩). */}
          {chipsOverflow ? (
            <button
              type="button"
              onClick={() => setChipsExpanded((current) => !current)}
              aria-expanded={chipsExpanded}
              aria-label={chipsExpanded ? "카테고리 접기" : "카테고리 모두 보기"}
              className="-mt-0.5 grid h-10 w-10 shrink-0 place-items-center text-[#596373] transition-colors hover:text-[#111111] min-[761px]:hidden"
            >
              <ChevronDown size={18} className={clsx("transition-transform", chipsExpanded && "rotate-180")} aria-hidden="true" />
            </button>
          ) : null}
        </nav>

        {/* gap-8·max-[760px]:gap-6은 두 열 사이의 가로 거터다. ≤1040px에서 1열로 접히면 같은 값이
            "목록 → 사이드 패널" 세로 이음새로 재사용돼 패널 사이(20/16px)보다 넓어진다 —
            그 구간에서만 row gap을 패널 리듬에 맞춘다. 상세(QnaDetailClient)와 같은 처방이다. */}
        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_280px] gap-8 max-[1040px]:grid-cols-1 max-[1040px]:gap-y-5 max-[760px]:mt-6 max-[760px]:gap-6 max-[760px]:gap-y-4">
          <div>
            {/* ≤760px 정렬은 박스가 아니라 텍스트라 밑선 정렬이 어긋난다 — 그 폭에서만 가운데로 맞춘다 */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 min-[761px]:items-end">
              <p className="text-[14px] font-medium text-[#596373]">전체 {visibleEntries.length}개의 글</p>
              <SortControl value={sortOption} onChange={setSortOption} />
            </div>

            {visibleEntries.length ? (
              <div className={FLUSH_LIST_CLASS}>
                {visibleEntries.map((entry) => (
                  <QnaListCard key={entry.id} entry={entry} previewQuery={previewQuery} />
                ))}
              </div>
            ) : (
              <QnaListEmptyState />
            )}
          </div>

          {/* 간격은 space-y가 아니라 gap이다 — space-y는 hidden **클래스**(display:none) 형제를 걸러 내지
              못해, 아래 max-[1040px]:hidden 패널들 뒤의 첫 가시 패널이 마진을 하나 물려받았다
              (상세 QnaDetailClient의 aside 주석에 자세히). display:none 자식은 flex 아이템이 아니라
              gap은 애초에 그 간격을 만들지 않는다. */}
          <aside className="flex flex-col gap-5 max-[760px]:gap-4">
            {/* 1열에서는 본문 목록과 완전 중복 (추천순 상위 = 인기 글, 칩 nav = 태그 풀) */}
            <TrendingPostsPanel entries={popularEntries} previewQuery={previewQuery} className="max-[1040px]:hidden" />
            {isLoggedIn ? <MyActivityPanel activeType={activeType} className="max-[1040px]:hidden" /> : null}
            <PopularTagsPanel
              activeType={activeType}
              selectedTag={categoryFilter !== "전체" ? categoryFilter : undefined}
              onTagClick={(tag) => setCategoryFilter(tag)}
              className="max-[1040px]:hidden"
            />
            <QnaOperationPrinciplePanel />
          </aside>
        </div>

        <QnaNotice message={notice} />
      </div>
    </main>
  );
}
