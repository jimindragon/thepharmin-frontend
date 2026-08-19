import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

/**
 * 아이콘을 담는 사각 판. 후기 화면의 아이콘 문법을 한 곳에 둔다 —
 * 44px 정사각 · 배경 #fafafa · radius 0 · 아이콘 20px 본문 검정.
 *
 * 원형 배경을 쓰지 않는 것은 이 프로젝트가 radius 0으로 서 있기 때문이다. 아이콘 하나만 원형이면
 * 그 자리만 다른 언어로 읽히고, 원형은 아바타(PersonAvatar)가 이미 쓰고 있어 사람과 헷갈린다.
 *
 * 맨 아이콘 대신 판을 두는 이유는 크기다 — 20px 잉크 하나는 15px 글줄 옆에서 글자처럼 읽혀
 * 블록의 머리 노릇을 하지 못한다. 44px 판이 서면 그 아래 글줄이 판에 딸린 설명으로 읽힌다.
 */
export function SquareIcon({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span className={clsx("grid h-11 w-11 shrink-0 place-items-center bg-[#fafafa]", className)}>
      <Icon size={20} className="text-[#111111]" aria-hidden />
    </span>
  );
}
