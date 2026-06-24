export type HeaderNavTone = "dark" | "light";

/**
 * 개인회원(dark)·기업회원(light) 헤더가 공유하는 메뉴 활성 상태 스타일.
 * 밑줄 대신 색상·굵기 차이로만 현재 위치를 표현한다.
 */
export function headerNavItemClassName(active: boolean, tone: HeaderNavTone) {
  if (tone === "light") {
    return active ? "font-medium text-[#111111]" : "font-normal text-[#4f5967] hover:text-[#111111]";
  }

  return active ? "font-medium text-white" : "font-normal text-white/60 hover:text-white";
}
