import type { ReactNode } from "react";

/**
 * companyProfiles.ts에 프로필이 없는 기업(대부분의 약국 등)이 /jobs·/interviews·/reviews·/news에
 * 접근했을 때 쓰는 최소 래퍼. [companyId]/layout.tsx는 프로필이 없으면 hero/탭/app-shell을 전혀
 * 렌더링하지 않으므로, 이 경우 각 페이지가 스스로 최소한의 폭을 잡아줘야 한다.
 * MissingCompany(기업 개요 전용, 완전히 다른 화면)와는 별개로 유지한다.
 */
export function CompanyFallbackShell({ children }: { children: ReactNode }) {
  return (
    <main className="bg-[#f5f6f7] px-6 py-16">
      <div className="app-shell">{children}</div>
    </main>
  );
}
