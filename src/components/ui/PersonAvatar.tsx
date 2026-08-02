"use client";

import clsx from "clsx";

/** id 문자열을 0~mod-1 범위로 결정론적으로 매핑(djb2) — Math.random 대신 매 렌더링 동일한 값을 내도록 */
function hashToIndex(id: string, mod: number): number {
  let hash = 5381;
  for (let i = 0; i < id.length; i += 1) {
    hash = ((hash << 5) + hash + id.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

/** seed가 있을 때 로테이션되는 회색 톤. 값·순서 모두 QNA 아바타에서 쓰던 것 그대로 — 바꾸면 기존 톤 배정이 어긋난다 */
const personAvatarTones = [
  "bg-[#eef1f5] text-[#596373]",
  "bg-[#dde3ea] text-[#45505f]",
  "bg-[#c9d1db] text-[#333d4b]",
  "bg-[#b3bec9] text-[#202734]",
];

/** seed가 없을 때(= 서로 구분될 필요가 없는 단일 정체) 쓰는 고정 톤 */
const singleTone = "bg-[#e8ebef] text-[#596373]";

/**
 * 박스 대비 글자 크기 비율이 지점마다 0.346~0.467로 흩어져 있어 단일 비율로는 현행을 재현할 수 없다.
 * 실제로 필요한 값이 11/14/18 세 개뿐이라 비례식 대신 구간으로 끊는다.
 */
function fontSizeFor(size: number): number {
  if (size <= 28) return 11;
  if (size >= 48) return 18;
  return 14;
}

/**
 * 사람을 나타내는 아바타. 기업/기관(EntityLogo·CompanyLogo)이 사각인 것과 대비되는
 * 원형이며, 이 프로젝트에서 radius-0 원칙의 명문화된 예외다.
 *
 * seed를 주면 그 문자열 해시로 4톤 중 하나를 받아 같은 화면의 다른 사람과 구분되고,
 * 주지 않으면 단일 톤이다 — 화면에 하나뿐이거나(내 계정·지원자 상세)
 * 서로 식별되면 안 되는 경우(익명)에 해당한다.
 *
 * 드롭다운 트리거 <button> 안에서도 쓰이므로 인터랙티브 요소를 렌더하지 않는다.
 */
export function PersonAvatar({
  label,
  size,
  seed,
  className,
}: {
  label: string;
  size: number;
  seed?: string;
  className?: string;
}) {
  const tone = seed === undefined ? singleTone : personAvatarTones[hashToIndex(seed, personAvatarTones.length)];

  return (
    <span
      className={clsx("grid place-items-center rounded-full font-bold", tone, className)}
      style={{ width: size, height: size, fontSize: fontSizeFor(size) }}
      aria-hidden="true"
    >
      {label.slice(0, 1)}
    </span>
  );
}
