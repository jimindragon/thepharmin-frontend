import type { ReactNode } from "react";

/**
 * 마이페이지 목록이 비었을 때의 안내 상자. 표시 전용 셸이라 문구·행동은 전부 호출부가 정한다.
 * action은 슬롯이다 — 최근 본 공고는 "공고 둘러보기" LinkButton을 넣고, 스크랩은 비운다.
 */
export function MyPageEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-border bg-white p-10 text-center max-[760px]:p-8">
      <p className="text-[15px] font-medium text-[#303946]">{title}</p>
      <p className="mt-2 text-[13px] font-normal leading-[1.6] text-[#8a94a3]">{description}</p>
      {action}
    </div>
  );
}
