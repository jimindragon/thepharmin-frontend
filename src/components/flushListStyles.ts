/**
 * ≤760px 풀블리드 카드 목록 컨테이너.
 *
 * 목록을 감싼 셸(.sidebar-shell·.app-shell)이 좌우로 --shell-gutter/2씩 물러나 있으므로,
 * 그만큼 음수 마진으로 되밀면 카드가 화면 폭을 꽉 채운다. 두 셸의 거터 값이 같은 토큰이라
 * 마이페이지(본문 px-0)와 일반 페이지가 같은 한 줄을 공유한다.
 *
 * 카드 좌우 테두리는 각 카드의 flush 분기가 지우고, 카드 사이 선은 여기 divide-y가 그린다 —
 * 첫 카드 위·마지막 카드 아래에는 선이 생기지 않는다. 카드 사이 세로 리듬은 gap이 아니라
 * 카드 내부 패딩이 담당하므로 ≤760px에서 gap-0으로 접는다.
 *
 * 761px 이상은 종전 그대로(gap-3 카드 목록)라 데스크톱 렌더에는 영향이 없다.
 */
export const FLUSH_LIST_CLASS =
  "flex flex-col gap-3 max-[760px]:-mx-[calc(var(--shell-gutter)/2)] max-[760px]:gap-0 max-[760px]:divide-y max-[760px]:divide-[var(--color-border)]";
