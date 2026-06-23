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
  sectionTitle: "text-[31px] font-bold leading-[1.3] tracking-[-0.02em] max-[760px]:text-[24px]",
  cardTitle: "text-[19px] font-bold tracking-[-0.02em]",
  body: "text-[15px] font-normal leading-[1.65] tracking-[-0.01em]",
  meta: "text-[13px] font-normal leading-[1.65] tracking-[-0.01em] text-[#8a94a3]",
} as const;

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
