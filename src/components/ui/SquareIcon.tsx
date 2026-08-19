import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

/**
 * 아이콘을 담는 사각 판. 후기 화면의 아이콘 문법을 한 곳에 둔다 —
 * 정사각 · 배경 #fafafa · radius 0 · 아이콘 본문 검정.
 *
 * 원형 배경을 쓰지 않는 것은 이 프로젝트가 radius 0으로 서 있기 때문이다. 아이콘 하나만 원형이면
 * 그 자리만 다른 언어로 읽히고, 원형은 아바타(PersonAvatar)가 이미 쓰고 있어 사람과 헷갈린다.
 *
 * 맨 아이콘 대신 판을 두는 이유는 크기다 — 잉크 하나는 옆 글줄과 같은 층으로 읽혀 블록의 머리
 * 노릇을 하지 못한다. 판이 서면 그 아래 글줄이 판에 딸린 설명으로 읽힌다.
 */

/**
 * 판 크기 두 벌. 판과 잉크의 비(44:20 ≈ 32:16 ≈ 2.2:1)를 맞춰 둔 것이라 두 크기가 같은 그림으로 읽힌다.
 *
 *   default — 44px. 카드 한 장이 통째로 그 아이콘의 자리인 곳(목록 첫 슬롯 카드, 상세 잠금 카드).
 *   compact — 32px. 카드가 낮아 44px 판이 남은 글줄보다 무거워지는 곳(허브 피드 잠금 카드).
 *
 * 크기를 부르는 쪽이 정하게 두는 대신 두 값만 여는 것은, 자리마다 px를 고르기 시작하면
 * 이 파일이 잡고 있는 "같은 문법" 자체가 흩어지기 때문이다.
 */
export type SquareIconSize = "default" | "compact";

const SIZE_CLASS: Record<SquareIconSize, { box: string; ink: number }> = {
  default: { box: "h-11 w-11", ink: 20 },
  compact: { box: "h-8 w-8", ink: 16 },
};

export function SquareIcon({
  icon: Icon,
  size = "default",
  className,
}: {
  icon: LucideIcon;
  size?: SquareIconSize;
  className?: string;
}) {
  const { box, ink } = SIZE_CLASS[size];

  return (
    <span className={clsx("grid shrink-0 place-items-center bg-[#fafafa]", box, className)}>
      <Icon size={ink} className="text-[#111111]" aria-hidden />
    </span>
  );
}
