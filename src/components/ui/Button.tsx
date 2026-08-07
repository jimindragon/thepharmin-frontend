"use client";

import clsx from "clsx";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export type ButtonVariant = "gradient" | "gradient-dark" | "primary" | "secondary";
export type ButtonTone = "light" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonStyle {
  className: string;
  style?: CSSProperties;
}

/**
 * variant="gradient" is reserved for the single primary conversion CTA per
 * page (see design plan) — never use it for more than one button at a time
 * on the same screen.
 *
 * variant="gradient-dark"는 같은 규칙의 어두운 변형 — 사진 히어로 위 CTA와
 * 페이지 대표 진입 CTA에 쓴다. 폼 제출·본문 CTA는 "gradient"를 유지한다.
 */
function getButtonStyle(variant: ButtonVariant, tone: ButtonTone, size: ButtonSize, disabled?: boolean): ButtonStyle {
  const height = size === "lg" ? "h-12" : size === "sm" ? "h-9" : "h-11";
  const paddingAndText = size === "sm" ? "px-4 text-[13px]" : "px-6 text-[14px]";
  const base = clsx(height, paddingAndText, "inline-flex shrink-0 items-center justify-center gap-2 font-medium transition-colors whitespace-nowrap");

  // gradient-dark는 배경 그라데이션만 다른 변형이라 분기를 공유한다 — 따로 두면
  // hover/transition/text-shadow가 시간이 지나며 어긋난다.
  if (variant === "gradient" || variant === "gradient-dark") {
    if (disabled) {
      return {
        className: clsx(base, "cursor-not-allowed"),
        style: { background: "var(--color-disabled-bg)", color: "var(--color-disabled-text)" },
      };
    }
    return {
      // hover: brightness(1.1) — 그라데이션 색 순서/흐름 유지하며 밝기만 조정
      // active: brightness(0.9) — 눌림 피드백, 단일 녹색으로 치환하지 않음
      // text-shadow: 우측 끝 #23D9A5 대비(≈1.7:1) 보완용 미세 그림자
      className: clsx(base, "text-white hover:brightness-110 active:brightness-90"),
      style: {
        backgroundImage: variant === "gradient-dark" ? "var(--gradient-hero-cta)" : "var(--gradient-cta)",
        transition: "filter 160ms ease",
        textShadow: "0 1px 3px rgba(5,60,55,0.28)",
      },
    };
  }

  // primary/secondary의 비활성도 gradient와 같은 처리를 쓴다 — 활성 클래스를 아예 걸지 않고
  // 토큰 두 개를 style로 주입해, 활성 배경/hover가 비활성 위에 남지 않도록 한다.
  if (disabled) {
    return {
      className: clsx(base, "cursor-not-allowed"),
      style: { background: "var(--color-disabled-bg)", color: "var(--color-disabled-text)" },
    };
  }

  if (variant === "primary") {
    return {
      className: clsx(
        base,
        tone === "dark" ? "bg-white text-[#111111] hover:bg-[#f3f3f3]" : "bg-[#111111] text-white hover:bg-[#2a2a2a]",
      ),
    };
  }

  return {
    className: clsx(
      base,
      tone === "dark"
        ? "border border-white/30 bg-transparent text-white hover:border-white/55"
        : "border border-[#cfd8e3] bg-white text-[#303946] hover:border-[#111111]",
    ),
  };
}

interface ButtonOwnProps {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  tone = "light",
  size = "md",
  className,
  style,
  disabled,
  ...props
}: ButtonOwnProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const computed = getButtonStyle(variant, tone, size, disabled);
  return <button disabled={disabled} className={clsx(computed.className, className)} style={{ ...computed.style, ...style }} {...props} />;
}

export function LinkButton({
  variant = "primary",
  tone = "light",
  size = "md",
  className,
  style,
  href,
  children,
  ...props
}: ButtonOwnProps & { href: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const computed = getButtonStyle(variant, tone, size);
  return (
    <Link href={href} className={clsx(computed.className, className)} style={{ ...computed.style, ...style }} {...props}>
      {children}
    </Link>
  );
}
