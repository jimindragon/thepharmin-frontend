"use client";

import clsx from "clsx";
import Link from "next/link";
import { Lock } from "lucide-react";

export interface PageTabBarItem<T extends string = string> {
  id: T;
  label: string;
  /** ≤760px 전용 축약 라벨 — 카운트·자물쇠까지 40px 박스에 수납하기 위한 것. 없으면 label을 그대로 쓴다. */
  shortLabel?: string;
  /** 있을 때만 카운트 뱃지를 그린다. 스코프 전환(캘린더)처럼 "내 것이 몇 개"가 본질인 탭에만 준다. */
  count?: number;
  /** 로그인·인증이 필요한 탭 — 자물쇠를 덧붙인다. */
  locked?: boolean;
}

interface PageTabBarProps<T extends string> {
  items: PageTabBarItem<T>[];
  /** null이면 어느 항목도 활성이 아니다 — 활성값을 아직 모를 때(URL 파싱 전) 잘못된 탭이 켜지는 것을 막는다. */
  activeId: T | null;
  /** 클라이언트 상태 전환용. hrefFor를 주는 경우에는 필요 없다. */
  onSelect?: (id: T) => void;
  /** 항목이 페이지 이동이어야 할 때(QNA 유형 전환)만 준다 — 주면 button 대신 Link로 그린다. */
  hrefFor?: (id: T) => string;
  ariaLabel: string;
  /** 배치 여백은 페이지마다 달라(캘린더 mt-7 / 공고 데스크톱 mt-5) 컴포넌트가 갖지 않는다. */
  className?: string;
}

/**
 * 균등 N열은 Tailwind가 소스에서 리터럴로 읽어야 해 맵으로 둔다 — `grid-cols-${n}`은 빌드에서 사라진다.
 * 탭바 페이지의 항목 수는 2(QNA)·3(캘린더)·4(공고)뿐이고, 5열부터는 ≤760px에서 열 폭이
 * 2글자 라벨도 못 담아 이 컴포넌트가 다룰 형태가 아니다.
 */
const COLUMNS_CLASS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

/**
 * 데스크톱은 button 기본 중앙정렬에 기대고 ≤760px에서만 flex로 바꾼다 —
 * 캘린더에서 이관해 온 원본 구조 그대로다(뱃지·자물쇠가 라벨 베이스라인에 붙는 데스크톱 모습 보존).
 */
const ITEM_CLASS =
  "h-12 text-[15px] font-medium transition max-[760px]:flex max-[760px]:h-10 max-[760px]:items-center max-[760px]:justify-center max-[760px]:gap-1 max-[760px]:whitespace-nowrap max-[760px]:text-[13px]";

const ACTIVE_ITEM_CLASS = "bg-[#111111] text-white shadow-[0_10px_22px_rgba(17,17,17,0.16)]";
const INACTIVE_ITEM_CLASS = "bg-white text-[#4b535f] hover:bg-[#f6f7f8]";

const BADGE_CLASS =
  "ml-2 inline-flex min-w-[26px] items-center justify-center rounded-full px-2 py-[2px] text-[12px] max-[760px]:ml-0 max-[760px]:min-w-0 max-[760px]:px-1.5";

/**
 * 탭바 4페이지(공고·QNA·캘린더)의 "h1 아래 첫 컨트롤" 공용 셸.
 *
 * 세 페이지의 역할은 트랙 전환·유형 전환·스코프 전환으로 서로 다르지만, 인터랙션 계약은
 * "상호배타 1택 + 아래 본문을 통째로 교체"로 같다. 그래서 같은 옷을 입혀 사용자가 배우는 규칙
 * ("h1 아래 검정 채움 = 지금 보고 있는 것")을 화면 사이에서 유지한다.
 *
 * 사양은 캘린더 3탭에서 추출했고 활성색만 #1b1f25 → #111111로 교정했다(전역 활성색 단일화).
 * 데스크톱 모습까지 이 컴포넌트로 통일하는 것은 범위 밖 — 공고는 여전히 사각 탭 행이라
 * CategoryTabs가 variant로 ≤760px에서만 이 스킨을 빌려 쓴다.
 */
export function PageTabBar<T extends string>({
  items,
  activeId,
  onSelect,
  hrefFor,
  ariaLabel,
  className,
}: PageTabBarProps<T>) {
  return (
    <div
      className={clsx(
        "grid gap-0 overflow-hidden border border-[#e0e5eb] bg-white p-1.5",
        COLUMNS_CLASS[items.length] ?? "grid-cols-3",
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        const itemClass = clsx(
          ITEM_CLASS,
          // a는 button과 달리 기본 중앙정렬이 없어 링크형에만 전 폭에서 flex를 얹는다.
          hrefFor && "flex items-center justify-center gap-1",
          active ? ACTIVE_ITEM_CLASS : INACTIVE_ITEM_CLASS,
        );

        const content = (
          <>
            {/* ≤760px에서는 카운트·자물쇠까지 40px 박스에 넣기 위해 축약 라벨로 교체한다. */}
            {item.shortLabel ? (
              <>
                <span className="max-[760px]:hidden">{item.label}</span>
                <span className="min-[761px]:hidden">{item.shortLabel}</span>
              </>
            ) : (
              <span>{item.label}</span>
            )}
            {item.count !== undefined ? (
              <span className={clsx(BADGE_CLASS, active ? "bg-white/20 text-white" : "bg-[#edf0f3] text-[#8a93a1]")}>
                {item.count}
              </span>
            ) : null}
            {item.locked ? (
              <Lock size={13} className="ml-2 inline-block align-[-2px] text-[#a3abb6] max-[760px]:ml-0 max-[760px]:shrink-0" />
            ) : null}
          </>
        );

        if (hrefFor) {
          return (
            <Link key={item.id} href={hrefFor(item.id)} role="tab" aria-selected={active} className={itemClass}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={itemClass}
            onClick={() => onSelect?.(item.id)}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
