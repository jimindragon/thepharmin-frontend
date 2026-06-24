"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 헤더 프로필 드롭다운(개인회원 AccountMenu, 기업회원 프로필 메뉴)이 공유하는
 * 열림 상태 + 바깥 클릭/Esc 닫힘 로직. 메뉴 내용은 각자 다르게 구성한다.
 */
export function useDropdownMenu<T extends HTMLElement = HTMLDivElement>() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return { open, setOpen, containerRef };
}
