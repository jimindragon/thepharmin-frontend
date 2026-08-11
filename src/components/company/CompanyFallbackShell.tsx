import type { ReactNode } from "react";

/**
 * companyProfiles.ts에 프로필이 없는 기업(대부분의 약국 등)이 /jobs·/interviews·/reviews·/news에
 * 접근했을 때 쓰는 최소 래퍼. [companyId]/layout.tsx는 프로필이 없으면 hero/탭/app-shell을 전혀
 * 렌더링하지 않으므로, 이 경우 각 페이지가 스스로 최소한의 폭을 잡아줘야 한다.
 * MissingCompany(기업 개요 전용, 완전히 다른 화면)와는 별개로 유지한다.
 */
export function CompanyFallbackShell({ children }: { children: ReactNode }) {
  return (
    /* ≤760px px-0 — 이 main의 px-6이 .app-shell의 거터 위에 한 겹 더 쌓여 셸이 이중으로 물러나 있었다
       (390px에서 셸 폭 294, 좌우 48px). 프로필이 있는 쪽(layout.tsx)의 main에는 좌우 패딩이 없어 같은
       화면인데 여백 선이 서로 달랐고, 후기 목록의 ≤760px 풀블리드(-shell-gutter/2)도 이 한 겹 때문에
       화면 끝까지 닿지 못했다. 거터는 .app-shell 하나에만 맡긴다 — 761px 이상은 종전 그대로다. */
    <main className="bg-[#f5f6f7] px-6 py-16 max-[760px]:px-0">
      <div className="app-shell">{children}</div>
    </main>
  );
}
