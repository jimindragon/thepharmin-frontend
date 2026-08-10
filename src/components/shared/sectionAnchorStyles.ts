/**
 * SectionAnchorNav의 기하 상수. 컴포넌트(`SectionAnchorNav.tsx`)가 아니라 여기 따로 두는 이유는
 * 이 값을 쓰는 쪽에 서버 컴포넌트가 있기 때문이다 — 기업 상세 CompanyDetailSections.tsx는
 * "use client"가 없고, 문자열 하나를 위해 클라이언트 모듈을 서버 그래프로 끌어올 이유가 없다.
 * 공용 클래스 문자열을 평범한 .ts로 빼 두는 것은 flushListStyles.ts와 같은 방식이다.
 */

/** 앵커 행 실측 높이 — 탭 줄 h-11(44px) + 하단 경계선 1px. */
const NAV_HEIGHT = 44 + 1;

/**
 * 헤더(64px, sticky) + 앵커 행 = 109. 섹션 상단이 앵커 행에 가리지 않고 바로 아래 서는 값이며,
 * IntersectionObserver의 rootMargin 상단 컷도 같은 값을 쓴다.
 */
export const SECTION_ANCHOR_OFFSET = 64 + NAV_HEIGHT;

/**
 * 앵커가 가리키는 섹션에 붙이는 scroll-margin. 클릭 시의 위치 보정은 전부 이 한 줄이 맡는다.
 *
 * ≤760px 변형으로만 두는 이유가 둘이다. 앵커 행 자체가 그 폭에서만 뜨고, 공고 상세
 * IconSectionShell이 이미 변형 없는 scroll-mt-[130px](데스크톱 앵커 시절의 잔재)를 달고 있어
 * 변형을 붙여야 같은 축에서 이긴다 — "변형 없는 유틸리티 < 변형 붙은 유틸리티".
 *
 * Tailwind는 리터럴만 수집하므로 109를 손으로 적는다. 위 SECTION_ANCHOR_OFFSET을 고치면
 * 여기도 같이 고쳐야 한다.
 */
export const SECTION_ANCHOR_SCROLL_MT_CLASS = "max-[760px]:scroll-mt-[109px]";
