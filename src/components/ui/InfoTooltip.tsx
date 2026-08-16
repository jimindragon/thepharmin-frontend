"use client";

import clsx from "clsx";
import { useCallback, useRef, useState } from "react";

interface InfoTooltipProps {
  /** 툴팁 상단에 굵게 표시할 제목. 미지정 시 제목 없이 불릿 목록만 렌더한다. (대형 모드) */
  title?: string;
  /** 안내문을 줄 단위 배열로 받는다 — 각 항목이 불릿과 함께 한 줄로 렌더된다. (대형 모드) */
  lines?: string[];
  /** 단문 안내. 지정 시 소형 패널로 렌더된다 — title/lines와 함께 쓰지 않는다. (소형 모드) */
  text?: string;
  /**
   * 패널 펼침 방향. 기본 "top"(트리거 위). 트리거가 overflow 클리핑 컨테이너의 상단 가장자리에
   * 있어 위로 펼치면 잘리는 경우에만 "bottom"으로 지정한다 (예: 지원자 관리 테이블 헤더).
   */
  placement?: "top" | "bottom";
  className?: string;
}

/** 패널이 뷰포트 좌우에서 반드시 비워 두는 여백 */
const VIEWPORT_MARGIN = 16;

/**
 * 플랫폼 공용 (i) 툴팁. hover/focus 시에만 표시된다(클릭 토글 없음).
 * 두 가지 모드:
 *  - 대형: title(선택) + lines[] 불릿 — 여러 줄 정책 안내 (열람권 이용 안내 등)
 *  - 소형: text — 한 줄 용어/규칙 설명 (인증 정보, 적합도 산정 등)
 * 이전에 별도로 있던 BusinessFormControls의 CSS-only InfoTooltip을 이 컴포넌트로 흡수했다.
 *
 * 표시 자체는 종전 그대로 CSS(opacity + group-hover/group-focus-within)이고, 아래 훅은 **위치 보정**만
 * 맡는다 — 패널은 언제나 DOM에 있고 불투명도만 바뀌므로, 훅이 없어도 툴팁은 뜬다.
 */
export function InfoTooltip({ title, lines, text, placement = "top", className }: InfoTooltipProps) {
  const isCompact = text != null;

  /**
   * 패널은 트리거 중심에 걸린다(left-1/2 + -translate-x-1/2). 트리거가 화면 가장자리 쪽에 설수록
   * 패널이 그만큼 밖으로 밀려 잘린다 — 좁은 화면의 열람권 상태 카드에서 실측으로 오른쪽 6px이 잘렸고,
   * 같은 카드의 라벨이 왼쪽으로 옮겨 가자 이번엔 왼쪽으로 76px이 나갔다. max-w-[calc(100vw-32px)]는
   * 폭만 제한할 뿐 위치를 되돌리지 못해(340px < 358px) 한 번도 발동하지 않았다.
   *
   * **CSS만으로는 닫히지 않는 자리다.** 뷰포트를 기준으로 잡으려면 position:fixed여야 하는데, 그러면
   * 세로가 트리거에서 떨어진다(top/bottom을 auto로 둔 fixed 박스의 정적 위치는 문서 좌표라 스크롤한
   * 만큼 어긋난다 — 실측 확인). 앵커 포지셔닝(position-try)은 브라우저 지원이 아직 고르지 않다.
   * 그래서 트리거의 화면상 위치를 재는 이 한 줄만 JS로 남긴다.
   *
   * 재는 시점은 "뜨기 직전"뿐이다(pointerenter·focus). 스크롤·리사이즈를 계속 따라다니지 않는 것은,
   * 이 값이 가로 위치만 정하는데 세로 스크롤로는 변하지 않고, 뜬 상태로 창을 리사이즈하는 경우는
   * 다음 hover에서 곧바로 교정되기 때문이다.
   *
   * 보정이 필요 없을 때는 0이다 — 잘릴 상황이 아니면 마진이 걸리지 않아 종전 표시 위치와 완전히 같다.
   * 넓은 화면은 사실상 언제나 이쪽이라 데스크톱 렌더가 달라지지 않는다.
   */
  const panelRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  const alignToViewport = useCallback(() => {
    const panel = panelRef.current;
    const trigger = panel?.previousElementSibling;
    if (!panel || !trigger) return;

    /* 폭은 보정값과 무관하므로(마진은 위치만 옮긴다) 지금 걸린 shift를 빼고 다시 잴 필요가 없다 */
    const triggerRect = trigger.getBoundingClientRect();
    const half = panel.getBoundingClientRect().width / 2;
    const center = triggerRect.left + triggerRect.width / 2;

    const overflowLeft = VIEWPORT_MARGIN - (center - half);
    const overflowRight = center + half - (window.innerWidth - VIEWPORT_MARGIN);

    /* 양쪽이 동시에 넘치는 경우(패널이 화면보다 넓다)는 왼쪽을 살린다 — 글이 시작되는 쪽이다 */
    const next = overflowLeft > 0 ? overflowLeft : overflowRight > 0 ? -overflowRight : 0;
    setShift((current) => (current === next ? current : next));
  }, []);

  return (
    <span className={clsx("group relative inline-flex", className)} onPointerEnter={alignToViewport} onFocus={alignToViewport}>
      <button
        type="button"
        aria-label="안내 보기"
        className="inline-flex h-4 w-4 cursor-help select-none items-center justify-center text-[12px] font-normal leading-none text-[#9aa3af] outline-none transition hover:text-[#4f5967] focus-visible:text-[#4f5967]"
      >
        ⓘ
      </button>
      <span
        ref={panelRef}
        role="tooltip"
        /* 보정은 transform이 아니라 margin-left로 준다 — -translate-x-1/2와 같은 축(--tw-translate-x)을
           다투지 않고, left:50%에 얹히는 마진이라 계산도 그대로 읽힌다. 0이면 아예 걸지 않는다. */
        style={shift ? { marginLeft: `${shift}px` } : undefined}
        className={clsx(
          // 트리거·다크 배경·모바일 클램프·전환은 두 모드 공통. hover/focus로만 노출.
          // 툴팁은 떠 있는 오버레이 — 그림자 기능 예외 (no-shadow 원칙 예외).
          "pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 border border-[#17202c] bg-[#17202c] text-left font-normal text-white opacity-0 shadow-[0_8px_20px_rgba(17,24,39,0.18)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
          placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
          isCompact
            ? "w-max max-w-[240px] px-3 py-2 text-[12px] leading-[1.5]"
            : "w-[340px] max-w-[calc(100vw-32px)] px-4 py-4 text-[13px] leading-[1.6]",
        )}
      >
        {isCompact ? (
          text
        ) : (
          <>
            {title ? <span className="mb-2 block font-semibold">{title}</span> : null}
            <span className="block space-y-1">
              {(lines ?? []).map((line, index) => (
                <span key={index} className="flex gap-1.5">
                  <span aria-hidden="true">•</span>
                  <span>{line}</span>
                </span>
              ))}
            </span>
          </>
        )}
      </span>
    </span>
  );
}
