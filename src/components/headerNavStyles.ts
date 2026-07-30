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
