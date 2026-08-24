import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/**
 * 목록·섹션 사이에 서는 안내 행 — 한 줄 문구 + 우측 검정 아웃라인 버튼.
 *
 * 같은 문법이 이미 두 곳에 인라인으로 서 있다(홈 RecruiterSolutionBanner, 추천 공고
 * HeadhuntingNoticeRow). 세 번째가 생기면서 여기로 뽑았지만 **그 둘은 아직 옮기지 않았다** —
 * 두 곳 모두 "한쪽을 고치면 함께 볼 것"이라는 주석으로 서로를 붙들고 있어, 이관은 그 쌍을
 * 통째로 다루는 별도 사이클의 일이다. 그래서 이 파일이 지금 가진 사용처는 한 곳뿐이다.
 *
 * 클래스는 그 둘에서 그대로 가져왔다(px-6 py-5 · #fafafa · 15px/medium/#333333 ·
 * 아웃라인 버튼 hover 반전). ≤760px에서 문구·버튼이 세로로 쌓이는 것과, 그때만 뜨는 우측
 * 장식 아이콘까지 같은 규격이라 두 곳이 나중에 이 컴포넌트로 그대로 들어올 수 있다.
 */
export function NoticeRow({
  text,
  actionLabel,
  actionHref,
  icon: Icon,
}: {
  text: string;
  /**
   * 버튼. 둘 다 넘기지 않으면 문구만 있는 행이 된다 — 알리기만 하고 할 일이 없는 상태
   * (예: 접수된 신청을 기다리는 중)가 그렇다. 기존 두 사용처는 항상 함께 넘긴다.
   */
  actionLabel?: string;
  actionHref?: string;
  /** ≤760px에서만 뜨는 우측 장식 — 정보를 얹지 않는다. 넘기지 않으면 렌더하지 않는다. */
  icon?: LucideIcon;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border border-border bg-[#fafafa] px-6 py-5">
      {/* 문구+버튼을 한 겹 더 싸서, 데스크톱은 이 겹이 폭을 다 먹고 좌우로 벌리고
          ≤760px는 세로로 쌓여 좌측 정렬 덩어리가 된다. 장식 아이콘은 이 겹 밖이라 항상 행 끝에 선다.

          min-h는 버튼 높이(41px)다 — 버튼 없는 행이 그만큼 낮아지면, 같은 자리에서 상태만 바뀌는
          화면(약국 인증 안내)에서 행 높이가 출렁인다. 버튼이 있는 기존 두 사용처에는 영향이 없다. */}
      <div className="flex min-h-[41px] min-w-0 flex-1 items-center justify-between gap-6 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-4">
        <p className="min-w-0 text-[15px] font-medium text-[#333333]">{text}</p>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex shrink-0 items-center gap-1.5 border border-[#111111] px-4 py-2 text-[13px] font-medium text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {Icon ? <Icon className="hidden h-9 w-9 shrink-0 text-[#d1d6dd] max-[760px]:block" strokeWidth={1.5} aria-hidden /> : null}
    </div>
  );
}
