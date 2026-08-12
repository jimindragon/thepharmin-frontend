"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { getCompanyDetailCounts, getCompanyTrack } from "@/data/companyDirectory";

/** 앵커 스크롤 대신 실제 라우트로 이동하는 탭. (hub)/layout.tsx의 CompaniesHubTabs와 동일한 패턴(border-radius: 0).
 * 카운트는 전부 실제 데이터 length — 프로필에 하드코딩된 숫자를 신뢰하지 않는다(getCompanyDetailCounts). */
export function CompanyDetailTabs({ companyId }: { companyId: string }) {
  const pathname = usePathname();
  const activeTabRef = useRef<HTMLAnchorElement | null>(null);

  /**
   * 활성 탭이 가로 스크롤 밖으로 밀려 있으면 끌어온다. 390px 기준 탭 총폭 391px에 셸 폭은 342px이라
   * 마지막 탭(기업 리뷰·뉴스)으로 들어오면 활성 표시가 오른쪽으로 잘려 나간다 — 그 화면에 와 있는데
   * 어디에 와 있는지가 화면 밖인 셈이다. 761px 이상은 넘칠 일이 없어 아무 일도 하지 않는다.
   *
   * block:"nearest"가 필수다 — 기본값(start)이면 세로 스크롤까지 함께 움직여 페이지가 튄다.
   * SectionAnchorNav가 같은 이유로 같은 처방을 쓴다.
   */
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  const counts = getCompanyDetailCounts(companyId);
  const track = getCompanyTrack(companyId);
  // 뉴스 탭은 산업 트랙 전용이다(N3 상세 개편) — profile.news 데이터 자체는 다른 트랙도 삭제하지 않고 그대로 둔다.
  // 병원(snubh 등)은 실제로 news를 채워둔 프로필이 있어도 탭을 숨기므로, 트랙별 개수 유무가 아니라 트랙 자체가
  // 기준이다. 이전엔 "병원·약국이 아니면 노출"(블록리스트)이라 연구 트랙(STEP 4에서 신설)이 걸러지지 않고 샜다 —
  // 명시적 허용리스트로 바꿔 향후 새 트랙이 추가돼도 기본은 숨김이 되게 한다.
  const showNewsTab = track === "industry";

  /** 건수를 라벨 문자열에 섞지 않고 따로 든다. 출처는 getCompanyDetailCounts 하나이며 개요 탭 앵커도 같은 값을 쓴다. */
  const tabs = [
    { href: `/companies/${companyId}`, label: "기업 개요" },
    { href: `/companies/${companyId}/jobs`, label: "채용공고", count: counts.jobs },
    { href: `/companies/${companyId}/interviews`, label: "면접 후기", count: counts.interviews },
    { href: `/companies/${companyId}/reviews`, label: "기업 리뷰", count: counts.reviews },
    ...(showNewsTab ? [{ href: `/companies/${companyId}/news`, label: "뉴스", count: counts.news }] : []),
  ];

  const rootHref = `/companies/${companyId}`;

  /**
   * ≤760px 개요 탭에서만 이 행을 숨긴다 — 그 자리는 SectionAnchorNav가 대신한다. 좁은 화면에서
   * 히어로 바로 밑에 가로 스크롤 탭 행이 둘(라우트 탭·섹션 앵커) 쌓이는 것이 실기기에서 걸린 문제고,
   * 개요 본문은 네 목적지(공고·면접 후기·기업 리뷰·뉴스)를 미리보기 섹션으로 모두 갖고 있어
   * 앵커 + 각 섹션의 "전체 보기" 링크만으로 같은 페이지에 전부 닿는다. 앵커가 흡수한 건수는
   * getCompanyDetailCounts로 이 행과 같은 출처를 쓴다.
   *
   * 하위 탭(/jobs·/interviews·/reviews·/news)에서는 그대로 둔다 — 그쪽에는 앵커 행이 없어
   * 여기까지 숨기면 좁은 화면에서 기업 상세 안을 오갈 수단이 사라진다.
   *
   * 개요에서 앵커가 렌더되지 않는 경우는 없다: 소개·정보 카드와 면접 후기·기업 리뷰 미리보기는
   * 0건이어도 빈 상태로 남아 항상 4섹션 이상이라 MIN_SECTIONS(3) 아래로 내려가지 않는다.
   */
  const isOverview = pathname === rootHref;

  // nav는 w-fit으로 탭 총폭(최대 5개, ~473px)만큼만 차지하되 max-w-full로 부모(app-shell) 폭에 갇힌다 —
  // max-w-full 없이 w-fit만 두면 좁은 화면(390px 등)에서 nav가 부모를 넘어 문서 전체에 가로 스크롤이 생겼다.
  // 넘치는 분량은 nav 내부에서만 가로 스크롤한다(overflow-hidden은 overflow-x-auto와 서로 덮어써 제거했다).
  //
  // **다르게 동작하는 nav는 다르게 보이도록 재분리한다(2026.08.12 확정).** 종전 이 행은 ≤760px에서
  // 개요 탭의 SectionAnchorNav와 같은 시각 사양(전폭 흰 sticky 바 + 밑선 인디케이터, 13px/#8a94a3)을
  // 입고 있었다. 히어로 아래 같은 자리에 서는 두 행의 생김새를 맞춘다는 의도였지만 결과는 반대였다 —
  // 하나뿐으로 보이는 탭 바가 개요에서는 스크롤을 따라다니고(앵커: 스크롤 스파이) 하위 탭에서는
  // 화면을 갈아치워(이 행: 라우트 이동), 눌러 보기 전에는 어느 쪽이 일어날지 알 수 없었다.
  // 이제 액자에 담긴 검정 칠 탭(=라우트 이동)과 전폭 흰 바의 밑선(=현재 위치)이라는 두 문법으로 갈린다.
  //
  // 새 모바일 스킨을 발명하지 않고 761px 이상 렌더를 그대로 내려 쓴다 — 이 행은 폭과 무관하게 한 가지
  // 일(라우트 이동)만 하고, PC에서는 그 문법이 이미 혼선 없이 읽히고 있었다. sticky도 함께 걷는다:
  // 액자형 박스가 본문 위에 떠 있으면 바가 아니라 카드가 따라다니는 것처럼 보이고, PC에도 없던 동작이다.
  // 대신 히어로 쪽에서 하위 탭 진입을 컴팩트 바로 접어(CompanyHero variant="compact") 탭 행까지
  // 되돌아오는 스크롤 거리를 줄였다. h-11(44px)은 그 자체로 모바일 터치 타깃 기준을 채운다.
  //
  // 컴포넌트를 SectionAnchorNav와 합치지 않는 이유는 종전과 같다(한쪽은 스크롤 관측 + 버튼, 이쪽은 링크).
  return (
    <nav
      className={clsx(
        // max-[760px]:mb-6 — layout.tsx의 children 래퍼는 그 폭에서 mt-0이다(히어로에 붙어 있어야 하는
        // 개요의 sticky 앵커 행 기준). 이 행은 더 이상 sticky 바가 아니라 액자형 박스라 본문과 붙으면
        // 목록에 눌어붙는다. 개요에서는 아래 hidden으로 행 자체가 사라지며 이 마진도 함께 빠지므로
        // 그쪽 계산(히어로~앵커 0px)은 그대로다.
        "mt-6 flex h-11 w-fit max-w-full overflow-x-auto overflow-y-hidden border border-border bg-white max-[760px]:mb-6",
        isOverview && "max-[760px]:hidden",
      )}
      role="tablist"
      aria-label="기업 정보 메뉴"
    >
      {tabs.map((tab) => {
        // 기업 개요 탭(루트 href)은 정확 일치만 활성으로 본다 — 하위 경로 매칭을 적용하면 모든 하위 페이지에서 항상 활성이 되어버린다.
        // 그 외 탭은 목록 페이지(/interviews)뿐 아니라 하위 경로(/interviews/new 등)에서도 활성으로 본다.
        const active = tab.href === rootHref ? pathname === tab.href : pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            ref={active ? activeTabRef : undefined}
            role="tab"
            aria-selected={active}
            className={clsx(
              "flex h-full shrink-0 items-center justify-center whitespace-nowrap px-5 text-[14px] font-medium transition-colors",
              active ? "bg-[#111111] text-white" : "text-[#596373] hover:text-[#111111]",
            )}
          >
            {tab.label}
            {/* 건수는 색·굵기를 링크에서 물려받아 "채용공고 1" 한 덩어리로 읽힌다 — 활성 탭의 검정 칠이
                이미 "지금 어디"를 말하므로 숫자를 따로 눌러 둘 이유가 없다.

                라벨과 숫자 사이는 마진이 아니라 공백 문자 그대로다 — ml-1(4px)을 주면 14px 기준
                공백(≈3.2px)보다 넓어 탭 폭이 탭당 0.8px씩 늘어난다.
                일반 공백이 아니라 NBSP인 것은 이 링크가 flex 컨테이너이기 때문이다: 라벨과 span 사이의
                공백만 있는 텍스트 노드는 익명 flex 아이템이 되지 못하고 통째로 사라져(플렉스 명세)
                "채용공고1"로 붙어 버렸다. 숫자와 한 노드에 넣으면 그 규칙에 걸리지 않는다. */}
            {typeof tab.count === "number" ? (
              <span className="font-medium text-inherit">{` ${tab.count}`}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
