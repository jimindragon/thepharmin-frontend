"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCompanyDetailCounts, getCompanyTrack } from "@/data/companyDirectory";

/** 앵커 스크롤 대신 실제 라우트로 이동하는 탭. (hub)/layout.tsx의 CompaniesHubTabs와 동일한 패턴(border-radius: 0).
 * 카운트는 전부 실제 데이터 length — 프로필에 하드코딩된 숫자를 신뢰하지 않는다(getCompanyDetailCounts). */
export function CompanyDetailTabs({ companyId }: { companyId: string }) {
  const pathname = usePathname();

  const counts = getCompanyDetailCounts(companyId);
  const track = getCompanyTrack(companyId);
  // 뉴스 탭은 산업 트랙 전용이다(N3 상세 개편) — profile.news 데이터 자체는 다른 트랙도 삭제하지 않고 그대로 둔다.
  // 병원(snubh 등)은 실제로 news를 채워둔 프로필이 있어도 탭을 숨기므로, 트랙별 개수 유무가 아니라 트랙 자체가
  // 기준이다. 이전엔 "병원·약국이 아니면 노출"(블록리스트)이라 연구 트랙(STEP 4에서 신설)이 걸러지지 않고 샜다 —
  // 명시적 허용리스트로 바꿔 향후 새 트랙이 추가돼도 기본은 숨김이 되게 한다.
  const showNewsTab = track === "industry";

  /** 건수를 라벨 문자열에 섞지 않고 따로 든다 — ≤760px 스킨이 SectionAnchorNav처럼 숫자만 회색으로 그린다.
   * 출처는 종전과 같은 getCompanyDetailCounts 하나다(개요 탭 앵커도 같은 값을 쓴다). */
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
  // ≤760px는 개요 탭의 SectionAnchorNav와 같은 시각 사양으로 갈아입는다 — 히어로 아래 같은 자리에서
  // 개요는 앵커 행, 하위 탭은 이 행이 뜨는데 하나는 전폭 흰 sticky 바(밑선 인디케이터)고 하나는
  // 안쪽으로 물러난 액자에 검정 칠 탭이라, 탭을 눌러 오갈 때마다 다른 세대의 화면으로 넘어가는 것처럼 보였다.
  // **동작은 그대로 라우트 이동이다** — 앵커가 아니므로 Link/tablist 구조는 손대지 않고 스킨만 바꾼다.
  // 컴포넌트를 SectionAnchorNav와 합치지 않는 이유도 그것이다(한쪽은 스크롤 관측 + 버튼, 이쪽은 링크).
  //
  // 이 nav는 스크롤 컨테이너이면서 동시에 sticky다. 앵커 행은 바깥 nav(sticky) + 안쪽 div(스크롤)로
  // 나뉘어 있지만, 여기서는 한 요소가 겸해도 같은 결과다(sticky를 깨는 것은 *조상*의 overflow지 자신의 것이 아니다).
  // 새 층을 만들지 않는 쪽이 덜 침습적이라 그대로 둔다. top-16/z-30도 앵커 행과 같은 값이다.
  return (
    <nav
      className={clsx(
        // ≤760px mt-0 — 히어로 직후에 바로 붙인다(히어로~탭 행 잔여 24px 제거). 아래 본문과의 간격도
        // layout.tsx의 children 래퍼가 같은 폭에서 mt-0이라, 히어로·탭 행·본문이 틈 없이 이어진다.
        "mt-6 flex h-11 w-fit max-w-full overflow-x-auto overflow-y-hidden border border-border bg-white max-[760px]:mt-0",
        // 액자를 풀어 화면 폭을 채우는 흰 바로 — 셸이 물러난 만큼 되밀고(-mx), 좌우·위 테두리를 지워
        // 밑선 하나만 남긴다. w-auto가 w-fit을 대신해(변형 붙은 유틸리티가 이긴다) 바가 전폭을 차지한다.
        // 컨테이너 px-3 + 탭 px-3으로 첫 탭 문구가 같은 화면의 본문 24px 선에서 시작한다 — 앵커 행과 같은 계산.
        // h-[45px]는 앵커 행 실측 높이와 같은 값이다(탭 줄 44 + 밑선 1). 앵커 행은 바깥/안쪽 두 요소로
        // 나뉘어 44 + 1이 자연히 쌓이지만, 여기는 한 요소가 겸해 border-box인 h-11이 밑선까지 44 안에
        // 밀어 넣는다 — 1px을 더해야 두 행의 아랫변이 같은 자리에 서고 본문 시작 위치도 일치한다.
        // max-w-none은 w-auto와 한 쌍이다: max-w-full(=부모 342px)이 남아 있으면 되민 만큼 폭이 늘지 않아
        // 바 왼쪽만 화면 끝에 닿고 오른쪽에 회색이 샜다.
        "max-[760px]:sticky max-[760px]:top-16 max-[760px]:z-30 max-[760px]:-mx-[calc(var(--shell-gutter)/2)] max-[760px]:h-[45px] max-[760px]:w-auto max-[760px]:min-w-0 max-[760px]:max-w-none max-[760px]:border-x-0 max-[760px]:border-t-0 max-[760px]:px-3",
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
            role="tab"
            aria-selected={active}
            className={clsx(
              "relative flex h-full shrink-0 items-center justify-center whitespace-nowrap px-5 text-[14px] font-medium transition-colors",
              // ≤760px 텍스트 토글 — 칠(bg)을 걷고 활성은 검정 글자 + 밑선 2px으로만 알린다.
              // 앵커 행과 같은 13px/#111111·#8a94a3 쌍이다.
              "max-[760px]:px-3 max-[760px]:text-[13px]",
              active
                ? "bg-[#111111] text-white max-[760px]:bg-transparent max-[760px]:text-[#111111]"
                : "text-[#596373] hover:text-[#111111] max-[760px]:text-[#8a94a3]",
            )}
          >
            {tab.label}
            {/* 건수는 ≤760px에서만 회색으로 떨어져 나온다 — 색이 라벨을 따라가면 숫자가 두 번째 라벨처럼
                강해져 "지금 어디"를 알리는 인디케이터와 경쟁한다(앵커 행과 같은 처방).
                761px 이상은 색·굵기를 링크에서 물려받아 종전의 "채용공고 1" 한 덩어리 그대로다.

                라벨과 숫자 사이는 마진이 아니라 공백 문자 그대로다 — 앵커 행처럼 ml-1(4px)을 주면 14px
                기준 공백(≈3.2px)보다 넓어 데스크톱 탭 폭이 탭당 0.8px씩 늘어난다. 스킨 교체가 761px 이상
                렌더를 건드리지 않아야 해서 문자 쪽을 택했다(≤760px 간격은 앵커 행보다 1px 좁다).
                일반 공백이 아니라 NBSP인 것은 이 링크가 flex 컨테이너이기 때문이다: 라벨과 span 사이의
                공백만 있는 텍스트 노드는 익명 flex 아이템이 되지 못하고 통째로 사라져(플렉스 명세)
                "채용공고1"로 붙어 버렸다. 숫자와 한 노드에 넣으면 그 규칙에 걸리지 않는다. */}
            {typeof tab.count === "number" ? (
              <span className="font-medium text-inherit max-[760px]:font-normal max-[760px]:text-[#8a94a3]">{` ${tab.count}`}</span>
            ) : null}
            {/* 인디케이터 — 데스크톱은 검정 칠이 활성을 알리므로 그리지 않는다 */}
            {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#111111] min-[761px]:hidden" aria-hidden /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
