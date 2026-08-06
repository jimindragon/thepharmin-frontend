"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 미구현 동작을 눌렀을 때 잠깐 떴다 사라지는 회색 한 줄 안내.
 *
 * 자료실·QNA·기업 인사이트 5곳이 같은 것을 각자 만들고 있었다(로컬 showPlaceholderNotice 2벌 +
 * 인라인 setTimeout 3벌, 크기는 12/13px로 갈림). 마크업·지속시간을 여기 한 곳에 모은다.
 *
 * 새 호출부는 usePlaceholderNotice()를 쓴다. 문구 state를 이미 직접 들고 있는 호출부(QNA)를 위해
 * setter를 받는 showPlaceholderNotice도 남겨 둔다 — 둘 다 아래 상수·마크업을 공유한다.
 */

/** 안내가 화면에 남아 있는 시간(ms). 5곳이 이미 같던 값. */
export const PLACEHOLDER_NOTICE_MS = 2400;

export function PlaceholderNotice({
  message,
  /**
   * 위 요소와의 간격만 바꿀 때 쓴다(기본 mt-3). 기본값을 덮어쓰므로 mt-* 하나만 넘길 것 —
   * 크기·색은 통일 대상이라 열지 않는다.
   */
  className,
}: {
  message: string;
  className?: string;
}) {
  if (!message) return null;
  return <p className={clsx("text-[12px] font-medium text-[#596373]", className ?? "mt-3")}>{message}</p>;
}

/**
 * 문구 state와 타이머를 함께 관리한다. show(문구)를 부르면 PLACEHOLDER_NOTICE_MS 뒤 저절로 사라지고,
 * 연달아 부르면 앞 타이머를 버려 마지막 문구 기준으로 다시 센다. 언마운트 시 타이머를 정리한다.
 */
export function usePlaceholderNotice() {
  const [message, setMessage] = useState("");
  const timerRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback(
    (next: string) => {
      clear();
      setMessage(next);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setMessage("");
      }, PLACEHOLDER_NOTICE_MS);
    },
    [clear],
  );

  useEffect(() => clear, [clear]);

  return { message, show };
}

/**
 * setter 형태 — 문구 state를 호출부가 이미 들고 있을 때 쓴다(QNA의 showQnaNotice가 이걸 감싼다).
 * 언마운트 정리가 없으니 새 코드는 usePlaceholderNotice를 쓸 것.
 */
export function showPlaceholderNotice(setMessage: (message: string) => void, message: string) {
  setMessage(message);
  window.setTimeout(() => setMessage(""), PLACEHOLDER_NOTICE_MS);
}
