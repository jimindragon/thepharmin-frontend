import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Shared layout shell for the business marketing pages (pricing,
 * headhunting intro, ...). Keeps container width and section rhythm
 * (vertical padding) identical across pages instead of each page
 * re-typing its own px/py values.
 */
export function BusinessSection({
  tone = "light",
  className,
  children,
}: {
  tone?: "light" | "muted" | "dark";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={clsx(
        tone === "dark" ? "bg-[#050505] text-white" : tone === "muted" ? "bg-[#f5f6f7]" : "bg-white",
        // ≤760px 72px — 기업 랜딩(BusinessPricingClient)이 세운 모바일 세로 리듬에 맞춘다.
        // 데스크톱 80px은 그대로다.
        "px-6 py-20 max-[760px]:py-[72px]",
        className,
      )}
    >
      <div className="app-shell--default">{children}</div>
    </section>
  );
}

/**
 * Full-bleed background-image band used for hero openers and closing CTA
 * sections. `gradient="horizontal"` suits left-aligned hero content (image
 * stays visible on the right), `gradient="vertical"` suits centered content
 * (darker overall, image as ambience). `variant="hero"` clamps the band to
 * the shared `--hero-height` so every page's opening hero reports the same
 * height regardless of how much copy it carries.
 *
 * `mobileFlush`는 ≤760px에서 밴드 자신의 px-6을 접는다. 안쪽 셸(app-shell--default)이
 * 이미 --shell-gutter(≤760px 48px = 좌우 24px씩)를 갖고 있어, 밴드 패딩이 그 위에 겹치면
 * 한쪽 48px씩 물려 390px에서 본문이 294px까지 눌린다. 켜면 24px씩으로 돌아온다.
 * 기본값 false — 기존 소비처(/support)의 렌더를 그대로 두기 위한 것이므로, 옮겨 갈 때
 * 화면마다 켜 준다.
 */
export function BusinessImageBand({
  image,
  gradient,
  align = "left",
  variant = "default",
  mobileFlush = false,
  children,
}: {
  image: string;
  gradient: "horizontal" | "vertical";
  align?: "left" | "center";
  variant?: "default" | "hero";
  mobileFlush?: boolean;
  children: ReactNode;
}) {
  const gradientCss =
    gradient === "horizontal"
      ? "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.4) 62%, rgba(0,0,0,0.15) 100%)"
      : "linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.75) 100%)";

  return (
    <section
      className={clsx(
        // ≤760px 72px — BusinessSection과 같은 모바일 리듬. 데스크톱 96px은 그대로다.
        "relative bg-[#050505] px-6 py-24 text-white max-[760px]:py-[72px]",
        mobileFlush && "max-[760px]:px-0",
        variant === "hero" && "flex items-center min-h-[var(--hero-height)] max-[760px]:min-h-0",
        align === "center" && "text-center",
      )}
      style={{
        backgroundImage: `${gradientCss}, url('${image}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="app-shell--default">{children}</div>
    </section>
  );
}

/**
 * Flat bordered panel — the one card style every info/feature/FAQ card on
 * the business marketing pages should share (no radius/shadow; this family
 * of pages is intentionally flat per the site's "각진 UI" direction).
 */
export function BusinessCard({
  padding = "md",
  className,
  children,
}: {
  padding?: "none" | "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "border border-border bg-white",
        padding === "lg" ? "p-7" : padding === "md" ? "p-6" : undefined,
        className,
      )}
    >
      {children}
    </div>
  );
}
