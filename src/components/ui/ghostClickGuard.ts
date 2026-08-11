/**
 * MobileDrawer가 닫힌 직후 도착하는 "고스트 클릭"을 삼킬지 판정하는 순수 로직.
 *
 * 터치 기기는 touchend 뒤에 mousedown·mouseup·click을 뒤이어 쏘는데, 드로어가 탭과 동시에
 * 언마운트되면 그 클릭의 히트 테스트는 이미 사라진 드로어가 아니라 "그 아래에 있던 것"을 고른다.
 * 판정만 여기 떼어 둔 이유는 좌표 규칙을 실측값으로 검증하기 위해서다(MobileDrawer.tsx는 tsx라
 * 이 프로젝트의 vitest 설정으로 임포트되지 않는다). 리스너 장착/해제는 MobileDrawer가 갖는다.
 */

/** 고스트 클릭 감시 창. touchend 뒤 합성 클릭은 고전적으로 ~300ms 안에 온다. */
export const GHOST_CLICK_WINDOW_MS = 400;

/**
 * 닫기 탭 좌표 주변 허용 반경. 딤처럼 패널 **밖**에서 닫을 때, 그 자리로 오는 고스트만 집어내기 위한 것이다.
 * 고스트는 원래 탭과 같은 좌표로 오지만 손가락이 살짝 움직인 채 떨어질 수 있어 여유를 둔다.
 */
export const GHOST_CLICK_POINT_SLOP_PX = 24;

export type ClosePoint = { x: number; y: number };

/** 판정에 필요한 rect의 최소 형태 — 테스트에서 DOMRect를 통째로 만들지 않아도 되게 좁혀 둔다. */
export type GuardRect = { left: number; right: number; top: number; bottom: number };

/**
 * 닫힘 직후 삼킬 영역. 언마운트 **직전**에 채워지며, 채워져 있다는 것 자체가
 * "드로어 자신의 닫기 조작(X·딤·ESC)으로 닫혔다"는 표시다 — 항목 링크 탭으로 닫히면 null로 남는다.
 */
export type GhostClickGuard = {
  /** 언마운트 직전 패널 rect. 패널이 덮고 있던 자리로 오는 고스트를 잡는다. */
  rect: GuardRect | null;
  /** 닫기를 유발한 탭 좌표. 키보드로 X를 누르거나 ESC로 닫으면 null이다. */
  point: ClosePoint | null;
};

/**
 * 이 클릭이 "드로어가 차지하던 자리"로 온 것인가. 밖이면 통과시킨다 —
 * 닫힘과 무관한 곳을 새로 누른 것이라 삼킬 이유가 없다.
 *
 * 패널 rect만으로는 딤 탭이 빠진다(딤으로 닫는 지점은 정의상 패널 밖이다). 그 자리로 오는 고스트는
 * 아래 페이지 콘텐츠를 때리므로, 닫기 탭 좌표 주변도 함께 본다.
 */
export function isInsideGhostGuardRegion(guard: GhostClickGuard, x: number, y: number) {
  const { rect, point } = guard;
  if (rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return true;
  if (point && Math.abs(x - point.x) <= GHOST_CLICK_POINT_SLOP_PX && Math.abs(y - point.y) <= GHOST_CLICK_POINT_SLOP_PX) {
    return true;
  }
  return false;
}
