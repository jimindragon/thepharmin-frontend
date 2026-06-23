"use client";

import clsx from "clsx";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export type ButtonVariant = "gradient" | "primary" | "secondary";
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
 */
function getButtonStyle(variant: ButtonVariant, tone: ButtonTone, size: ButtonSize): ButtonStyle {
  const height = size === "lg" ? "h-12" : size === "sm" ? "h-9" : "h-11";
  const paddingAndText = size === "sm" ? "px-4 text-[13px]" : "px-6 text-[14px]";
  const base = clsx(height, paddingAndText, "inline-flex shrink-0 items-center justify-center gap-2 font-medium transition-colors whitespace-nowrap");

  if (variant === "gradient") {
    return {
      className: clsx(base, "text-white hover:brightness-110"),
      style: { backgroundImage: "var(--gradient-cta)" },
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
  ...props
}: ButtonOwnProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const computed = getButtonStyle(variant, tone, size);
  return <button className={clsx(computed.className, className)} style={{ ...computed.style, ...style }} {...props} />;
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
