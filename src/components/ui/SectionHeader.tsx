import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { typeScale } from "@/components/ui/Typography";

/**
 * 홈의 섹션 제목 행. "제목 좌측 / 액션 우측, 한 줄" 문법 하나로 통일한다.
 *
 * 추출한 이유는 홈에 같은 구조가 다섯 번 반복되기 때문이다 — 업계를 이끄는 기업 / 테마별 공고 /
 * 나를 위한 추천 공고 / 주목할 만한 공고 / 공고 둘러보기. 다섯 곳이 justify-between·items-end·
 * items-center·gap-4·gap-2를 제각각 쓰고 있었고, 우측 액션도 어떤 섹션엔 있고 어떤 섹션엔 없었다.
 *
 * 우측 슬롯은 폭에 따라 역할이 갈린다.
 *   ≥761px: `action`(캐러셀 화살표 등) — 데스크톱은 화살표로 캐러셀을 민다.
 *   ≤760px: `viewAll`("전체 보기 ›") — 화살표가 숨겨지는 폭이라 우측이 비고, 이 자리를 목록 전체로
 *           가는 링크가 대신 받는다. 좁은 화면에서 카드를 끝까지 미는 것보다 이쪽이 빠르다.
 * 그래서 **둘 다 준 섹션에서는 viewAll이 ≤760px 전용**이고(=데스크톱 렌더가 종전과 같다),
 * `viewAll`만 준 섹션(나를 위한 추천 공고)은 종전처럼 모든 폭에서 보인다.
 *
 * 제목 쪽 min-w-0 + 링크 쪽 whitespace-nowrap/shrink-0이 한 쌍이다. 이게 없으면 좁은 폭에서
 * flex 기본값(min-width:auto)이 제목을 안 줄여 우측 링크가 "전체 보 / 기"로 접히거나 잘린다.
 */
export function SectionHeader({
  title,
  adornment,
  action,
  viewAll,
  className,
}: {
  title: string;
  /** 제목 바로 옆에 붙는 부가 요소(안내 팝오버 등) — 제목 덩어리와 함께 좌측에 남는다. */
  adornment?: ReactNode;
  /** 우측 액션. 데스크톱 전용 크롬(캐러셀 화살표)은 호출부에서 `hidden md:block`으로 감싼다. */
  action?: ReactNode;
  /** 우측 "전체 보기" 링크. `action`과 함께 주면 ≤760px에서만 나타난다. */
  viewAll?: { href: string; label?: string };
  className?: string;
}) {
  return (
    // 제목~아래 카드 간격 20 → 12px(≤760px): 모바일은 섹션이 세로로 길게 이어져 20px 띠가 매 섹션마다 쌓인다.
    <div className={clsx("mb-5 flex items-center justify-between gap-4 max-[760px]:mb-3", className)}>
      <div className="flex min-w-0 items-center gap-2">
        <h2 className={clsx(typeScale.sectionTitle, "min-w-0 truncate text-[#111111]")}>{title}</h2>
        {adornment}
      </div>
      {action}
      {viewAll ? (
        <Link
          href={viewAll.href}
          className={clsx(
            typeScale.meta,
            "shrink-0 whitespace-nowrap hover:text-[#111111]",
            // action이 있는 섹션에서는 데스크톱 우측을 그 액션이 이미 쓰고 있다 — 링크는 ≤760px 전용이다.
            action && "min-[761px]:hidden",
          )}
        >
          {viewAll.label ?? "전체 보기"} ›
        </Link>
      ) : null}
    </div>
  );
}
