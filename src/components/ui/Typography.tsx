import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Shared type scale tokens. Use these className strings directly on the
 * relevant heading/text element instead of re-typing size/weight/leading/
 * tracking ad hoc — keeps the 4-tier hierarchy (hero / section / card /
 * body+meta) consistent across pages.
 */
export const typeScale = {
  heroTitle: "text-[46px] font-bold leading-[1.25] tracking-[-0.03em] max-[760px]:text-[30px]",
  pageTitle: "text-[34px] font-bold leading-[1.2] tracking-[-0.02em] max-[760px]:text-[26px]",
  sectionTitle: "text-[31px] font-bold leading-[1.3] tracking-[-0.02em] max-[760px]:text-[24px]",
  cardTitle: "text-[19px] font-bold tracking-[-0.02em]",
  body: "text-[15px] font-normal leading-[1.65] tracking-[-0.01em]",
  meta: "text-[13px] font-normal leading-[1.65] tracking-[-0.01em] text-[#8a94a3]",
} as const;

/**
 * Shared top-level page heading (breadcrumb 아래 첫 h1) — 채용공고/채용 캘린더처럼
 * 같은 위계의 페이지 제목은 크기·자간·상하 여백을 맞추기 위해 이 컴포넌트를 사용.
 */
export function PageTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={clsx("mt-5", typeScale.pageTitle, "text-[#242b36]", className)}>{children}</h1>;
}

export function Eyebrow({ children, tone = "light", align = "left" }: { children: ReactNode; tone?: "light" | "dark"; align?: "left" | "center" }) {
  return (
    <p
      className={clsx(
        "text-[12px] font-medium uppercase tracking-[0.08em]",
        tone === "dark" ? "text-white/55" : "text-[#8a94a3]",
        align === "center" && "text-center",
      )}
    >
      {children}
    </p>
  );
}

/**
 * Shared "section header" composition: eyebrow label + h2 + optional intro
 * paragraph. Use for marketing-style page sections (business intro/pricing
 * pages) so every section opener shares the same hierarchy and spacing —
 * align defaults to "center" since that's the convention for section
 * intros on these pages; leave content grids/cards below it left-aligned.
 */
export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  return (
    <div className={align === "center" ? "text-center" : undefined}>
      <Eyebrow tone={tone} align={align}>
        {eyebrow}
      </Eyebrow>
      <h2 className={clsx("mt-3", tone === "dark" ? "text-white" : "text-[#17202c]", typeScale.sectionTitle)}>{title}</h2>
      {description ? (
        <p
          className={clsx(
            "mt-3 text-[14px] font-normal leading-[1.75] tracking-[-0.01em]",
            tone === "dark" ? "text-white/72" : "text-[#68717e]",
            align === "center" && "mx-auto max-w-[640px]",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
