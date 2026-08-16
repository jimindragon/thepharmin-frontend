"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

/** CompanyDetailTabs·SectionAnchorNav가 개요/하위 탭을 가르는 폭과 같은 경계다 */
const MOBILE_QUERY = "(max-width: 760px)";

/**
 * ≤760px에서 기업 상세 하위 목록(공고·면접 후기·기업 리뷰·뉴스)을 개요의 해당 섹션으로 돌려보내는 가드.
 *
 * 그 폭의 기업 상세는 개요 한 장으로 통합됐고 네 목적지는 전부 인라인 펼침으로 들어와 있다. 그런데 목록
 * 라우트는 외부 진입·딥링크·데스크톱용으로 존치돼, 마이페이지 "다시 보기"나 공고 상세 CTA처럼 그쪽을
 * 직접 가리키는 진입(13지점)으로 들어오면 통합 이전 화면 — 라우트 탭 행이 달린 목록 — 이 다시 떴다.
 * 진입점을 하나씩 고쳐 돌리는 대신 도착지에서 한 번에 흡수한다: 진입점은 앞으로도 늘어나지만
 * 도착지는 이 넷뿐이다.
 *
 * **서버에서 뷰포트를 모르므로 클라이언트 리다이렉트다.** Next의 redirect()를 쓰려면 폭을 알아야 하는데
 * 그 값은 요청에 없다. 그래서 SSR은 목록을 그대로 내려보내고, 마운트 후 폭을 재서 좁으면 옮긴다 —
 * 그 사이 한 프레임의 공백이 생기는 것을 목업 단계에서 받아들인다.
 *
 * 옮기는 동안 children을 그리지 않는 것은 그 한 프레임에 대한 답이다. 목록을 띄워 둔 채 옮기면 벗어나려던
 * 화면이 매번 한 번씩 스쳐, 고치려던 증상이 짧게 재연된다. 다만 지워지는 것은 목록 본문뿐이다 —
 * 히어로와 라우트 탭 행은 [companyId]/layout.tsx 소관이라 그 한 프레임 동안 그대로 남는다.
 *
 * push가 아니라 replace다 — 뒤로 가기를 눌렀을 때 방금 튕겨 나온 목록으로 되돌아가 다시 튕기는 고리가
 * 생기면 안 된다.
 *
 * 폭 변화도 따라간다(change 리스너). 데스크톱에서 목록을 보다 창을 좁히면 그 순간부터 ≤760px의 규칙이
 * 적용돼야 하고, 마운트 때 한 번만 재면 그 화면만 규칙 밖에 남는다. 반대 방향(좁힘 → 넓힘)은 이미
 * 개요에 가 있으므로 이 컴포넌트가 관여할 일이 없다.
 */
export function CompanyMobileOverviewRedirect({
  companyId,
  /** 개요에서 이 목록에 대응하는 섹션의 앵커 id(companyDetailAnchors) */
  anchorId,
  children,
}: {
  companyId: string;
  anchorId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const go = () => {
      if (!mql.matches) return;
      setRedirecting(true);
      router.replace(`/companies/${companyId}#${anchorId}`);
    };

    go();
    mql.addEventListener("change", go);
    return () => mql.removeEventListener("change", go);
  }, [router, companyId, anchorId]);

  if (redirecting) return null;
  return <>{children}</>;
}
