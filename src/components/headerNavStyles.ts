/**
 * 다크 헤더(개인 홈·고객센터)가 공유하는 메뉴 활성 상태 스타일.
 * 밑줄 대신 색상·굵기 차이로만 현재 위치를 표현한다.
 *
 * 라이트 헤더(기업센터)는 색이 달라 재사용이 안 되므로 BusinessHeaders.tsx의
 * lightNavItemClassName을 따로 쓴다 — 여기에 tone 분기를 두면 아무도 안 쓰는
 * 죽은 갈래가 생기고, 잘못 호출해도 조용히 다크 스타일이 나간다.
 */
export function headerNavItemClassName(active: boolean) {
  return active ? "font-medium text-white" : "font-normal text-white/60 hover:text-white";
}

/**
 * 계정 드롭다운 안의 '동작' 항목(로그아웃) 클래스. 패널 자체는 다크·라이트 헤더가
 * 똑같은 흰 패널을 쓰므로 실제 렌더되는 2벌(개인 AccountMenu·기업 BusinessAccountMenu)이
 * 이 한 줄을 공유한다. 세 번째 소비처인 고객센터 SupportBusinessAccountMenu는 코드에는
 * 남아 있지만 고객센터 헤더가 개인 세션만 보게 되면서 더 이상 렌더되지 않는다.
 * 이동 항목은 Link, 로그아웃은 button이라 태그만 다르고 시각 스펙은 동일하다.
 */
export const headerDropdownActionClassName =
  "flex w-full items-center px-2 py-2 text-left text-[13px] font-medium text-[#4f5967] transition-colors hover:text-[#111111]";
