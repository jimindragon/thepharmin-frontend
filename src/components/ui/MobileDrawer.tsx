"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  GHOST_CLICK_WINDOW_MS,
  isInsideGhostGuardRegion,
  type ClosePoint,
  type GhostClickGuard,
} from "@/components/ui/ghostClickGuard";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * 모바일(≤760px) 우측 슬라이드 패널.
 *
 * 헤더 앵커 드롭다운(알림 벨·계정 메뉴)이 좁은 폭에서 화면의 95%를 덮으면서도 화면 밖으로
 * 잘려 나가는 문제를 위한 대체 표면이다. ModalShell·OverlayPanel과 같은 "오버레이 + 패널"
 * 계열이지만 가운데 정렬이 아니라 오른쪽 모서리에 붙는다는 점만 다르다.
 *
 * 열림 여부는 이 컴포넌트가 갖지 않는다 — 호출부가 조건부로 마운트한다
 * (ModalShell·OverlayPanel과 같은 방식). Escape·스크롤 잠금 effect가 마운트 시점에만
 * 걸려야 하기 때문이다. 노출 폭 판정도 호출부 몫이다 — 드롭다운과 둘 중 하나만 마운트되어야
 * 데스크톱에서 스크롤이 잠기지 않는다(useIsMobileDrawerViewport 참고).
 */

/** 드로어가 드롭다운을 대신하는 상한 폭. 하단 탭바의 min-[761px]:hidden과 같은 경계다. */
export const MOBILE_DRAWER_MAX_WIDTH = 760;

/**
 * 현재 뷰포트가 드로어 구간(≤760px)인지. 서버·수화 직후에는 false(=드롭다운)를 돌려주지만,
 * 패널은 사용자가 트리거를 누른 뒤에만 마운트되므로 그 시점엔 이미 effect가 값을 채운 뒤다.
 */
export function useIsMobileDrawerViewport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_DRAWER_MAX_WIDTH}px)`);
    setIsMobile(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

export function MobileDrawer({
  title,
  ariaLabel,
  onClose,
  children,
}: {
  /** 헤더 왼쪽 제목. 본문 머리가 제목 노릇을 하는 메뉴(계정 메뉴)에서는 생략한다. */
  title?: ReactNode;
  /** 스크린리더용 이름. 미지정 시 title을 쓴다 — title이 없거나 ReactNode일 때만 지정할 것. */
  ariaLabel?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // 마운트 직후 한 프레임 뒤에 켜서 translate-x-full → 0 전환이 실제로 일어나게 한다.
  // 닫힘은 즉시 언마운트다 — 들어올 때만 움직이는 dropdown-panel과 같은 규칙.
  const [entered, setEntered] = useState(false);

  // 아래 언마운트 가드가 읽는 "닫힘 원인" 겸 "삼킬 영역". 이 컴포넌트가 스스로 닫을 때만 채운다.
  const closeGuardRef = useRef<GhostClickGuard | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /**
   * 드로어 자신의 닫기 조작(X·딤·ESC) 전용 경로. 호출부가 넘긴 onClose와 같은 함수를 부르지만,
   * 부르기 직전에 가드를 장착한다는 점이 다르다 — 닫힘 원인을 여기서만 알 수 있기 때문이다.
   *
   * 호출부는 X·딤과 항목 링크에 **같은** close 함수를 넘긴다(AccountMenuContent·NotificationList 참고).
   * 그래서 onClose의 정체로는 원인을 가릴 수 없고, "드로어가 스스로 불렀는가"만이 유일한 구분점이다.
   * rect를 여기서 재는 이유도 같다 — 언마운트 cleanup(패시브 이펙트)은 DOM이 이미 떨어진 뒤에 돌 수 있어
   * 그때 재면 0이 나온다. 닫기를 부르기 직전인 지금이 마지막으로 실측 가능한 시점이다.
   */
  const closeFromDrawer = useCallback(
    (point: ClosePoint | null) => {
      closeGuardRef.current = { rect: panelRef.current?.getBoundingClientRect() ?? null, point };
      onClose();
    },
    [onClose],
  );

  // detail === 0은 키보드로 누른 버튼(Enter/Space)이다 — clientX/Y가 0,0이라 좌표로 쓰면 화면 좌상단을 가리킨다.
  const closeFromPointer = (event: ReactMouseEvent) =>
    closeFromDrawer(event.detail === 0 ? null : { x: event.clientX, y: event.clientY });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeFromDrawer(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeFromDrawer]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // 드로어 안의 mousedown을 여기서 끊는다. 호출부(헤더 드롭다운)는 useDropdownMenu의
  // document mousedown 감지로 "바깥 클릭"을 닫는데, 포털로 나간 드로어는 그 기준에서
  // 항상 바깥이다 — 그대로 두면 링크를 누르는 순간 mouseup 전에 언마운트돼 이동이 먹지 않는다.
  // React 합성 이벤트의 stopPropagation은 루트 컨테이너(document)에서 일어나 같은 document에
  // 걸린 리스너를 막지 못하므로, 드로어 노드에 네이티브로 직접 건다.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const stop = (event: MouseEvent) => event.stopPropagation();
    node.addEventListener("mousedown", stop);
    return () => node.removeEventListener("mousedown", stop);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 닫힌 직후에 도착하는 클릭 1회를 삼킨다(고스트 클릭 차단).
  //
  // 실기기 증상 둘이 같은 원인이었다:
  //   · X를 누르면 닫혔다가 드로어가 다시 뜬다
  //   · 알림 "전체 보기"를 누르면 캘린더로 간다
  // 드로어는 탭과 동시에 언마운트되는데, 터치 기기는 touchend 뒤에 mousedown·mouseup·
  // click을 뒤이어 쏘고 그 시점의 히트 테스트는 이미 사라진 드로어가 아니라 "그 아래에
  // 있던 것"을 고른다. 390×664 실측으로 아래에 무엇이 있었는지 확인했다:
  //   · X(354,28) 아래 = 헤더의 계정 메뉴 트리거 → 계정 드로어가 열린다
  //     (계정 드로어에서는 자기 트리거라 같은 드로어가 다시 뜬다)
  //   · 드로어 패널(x 59~390)이 하단 탭바를 덮고, 캘린더 칸이 x 234~312 →
  //     패널 폭 전체를 쓰는 "전체 보기"를 아래쪽에서 누르면 캘린더로 간다
  //
  // 그래서 트리거의 토글 로직이나 mousedown 차단이 범인이 아니다 — 이벤트가 트리거까지
  // 버블링하는 것도 아니다(드로어는 body로 포털돼 트리거의 형제도 자손도 아니다).
  // 고칠 지점은 "닫힌 뒤에 오는 여분의 클릭" 하나뿐이라, 여기서 한 번만 끊는다.
  //
  // 캡처 단계에서 끊는 이유 — React의 루트 리스너(버블)보다 먼저 잡아야 아래 요소의
  // onClick이 아예 실행되지 않는다. preventDefault는 <a href>의 브라우저 기본 이동을 막는다.
  // coarse 포인터에서만 건다: 마우스는 클릭이 한 번뿐이라 삼킬 것이 없고, 그대로 두면
  // 닫은 직후의 정상 클릭이 먹히지 않는다.
  //
  // ── 발동 조건을 두 겹으로 좁힌다(실기기에서 드로어 안 항목 탭이 먹지 않아서) ──
  // (1) 닫힘 원인: X·딤·ESC로 닫을 때만 장착한다. 항목 링크 탭으로 닫히면 closeGuardRef가
  //     비어 있어 그냥 지나간다. iOS는 touchend 뒤 클릭을 늦게(~300ms) 쏘는데, 그 사이 드로어가
  //     사라져 있으면 뒤늦게 도착한 **정상** 클릭을 가드가 고스트로 오인해 삼켰다.
  // (2) 좌표: 장착된 경우에도 드로어가 차지하던 자리로 온 클릭만 삼킨다. 그 밖은 닫힘과
  //     무관한 새 조작이라 통과시킨다.
  // 시간 창(400ms)은 그대로다.
  //
  // ⚠ (1)의 대가 — 위 두 증상 중 **"전체 보기 → 캘린더"는 다시 열린 구멍이다**. 그쪽은 항목 탭이라
  //   이제 가드가 걸리지 않아, 항목 탭 뒤 고스트가 패널이 덮고 있던 하단 탭바로 샌다(재현 확인함).
  //   정상 탭이 아예 먹지 않는 쪽이 더 큰 손실이라 이 순서로 택했다. 둘 다 잡으려면 항목 탭에도
  //   가드를 걸되 (2)의 좌표 조건에만 기대야 하는데, 그러면 지연 도착한 정상 클릭이 같은 좌표라
  //   구분되지 않는다 — 좌표가 아닌 다른 축(예: 이 클릭이 이미 처리된 그 클릭인지)이 필요하다.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (!closeGuardRef.current) return;
      if (!window.matchMedia("(pointer: coarse)").matches) return;
      // 아래 swallow는 함수 선언이라 호이스팅되고, TS는 그 본문에서 위 narrowing을 신뢰하지 않는다 — 여기서 못박는다.
      const guard: GhostClickGuard = closeGuardRef.current;

      let timer = 0;
      const release = () => {
        document.removeEventListener("click", swallow, true);
        window.clearTimeout(timer);
      };
      function swallow(event: MouseEvent) {
        // 첫 클릭 한 번으로 감시를 거둔다 — 삼키든 통과시키든. 고스트는 닫힘 뒤 첫 클릭으로 오고,
        // 그게 아니라면 사용자가 새로 누른 것이라 이후까지 지켜볼 이유가 없다.
        release();
        if (!isInsideGhostGuardRegion(guard, event.clientX, event.clientY)) return;
        event.stopPropagation();
        event.preventDefault();
      }

      document.addEventListener("click", swallow, true);
      // 고스트 클릭은 touchend 직후(고전적으로 ~300ms) 한 번 온다. 그 창을 넘기면
      // 사용자가 새로 누른 것이므로 감시를 거둔다.
      timer = window.setTimeout(release, GHOST_CLICK_WINDOW_MS);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    // 헤더(z-50)가 만드는 쌓임 맥락 안에 두면 z-75가 그 안에서만 유효해 DEV 패널(z-60) 같은
    // 형제에게 덮인다. body로 내보내야 선언한 계층이 실제 계층이 된다.
    // z-[75] — 헤더(50)·탭바(40)는 물론 모달 계열(70)보다도 위. 토스트(80)만 남겨 둔다.
    <div
      ref={rootRef}
      className="fixed inset-0 z-[75]"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
    >
      <div className="absolute inset-0 bg-black/40" onClick={closeFromPointer} aria-hidden="true" />
      <div
        ref={panelRef}
        className={clsx(
          "absolute inset-y-0 right-0 flex w-[min(85vw,360px)] flex-col border-l border-[#d8dee6] bg-white",
          // 그림자는 "떠 있음"을 알리는 기능적 예외 — 모달 계열의 하드코딩 값을 그대로 쓴다.
          "shadow-[0_18px_48px_rgba(0,0,0,0.22)]",
          !prefersReducedMotion && "transition-transform duration-200 ease-out",
          entered ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* 헤더 — 제목이 없어도 닫기 X는 남는다(드로어를 닫을 유일한 확정 조작). */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2">
          {title ? <h2 className="text-[15px] font-semibold text-[#17202c]">{title}</h2> : <span />}
          <button
            type="button"
            onClick={closeFromPointer}
            aria-label="닫기"
            className="grid h-10 w-10 shrink-0 place-items-center text-[#8a94a3] hover:bg-[#f4f5f6]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-[calc(24px+env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
