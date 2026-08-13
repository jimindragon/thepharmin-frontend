import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  /** 모바일: 공개 페이지는 탭바·뒤로가기가 위치를 제공 — 깊이 표시가 필요한 마이페이지만 유지 */
  keepOnMobile?: boolean;
  /** dark: 어두운 사진 위(기업 인사이트 허브 히어로). 회색 3색을 흰색 알파로 바꾼다 —
   *  특히 마지막 항목의 #6c7684는 검은 사진 위에서 대비가 3.5:1로 미달이라 전환이 필수다. */
  tone?: "light" | "dark";
}

export function PageBreadcrumb({ items, className = "", keepOnMobile = false, tone = "light" }: PageBreadcrumbProps) {
  return (
    <nav
      className={`flex items-center gap-3 text-[13px] font-medium ${tone === "dark" ? "text-white/60" : "text-[#a0a9b7]"} ${keepOnMobile ? "" : "max-[760px]:hidden"} ${className}`}
      aria-label="breadcrumb"
    >
      <Home size={16} strokeWidth={2.1} className="shrink-0" />
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="inline-flex min-w-0 items-center gap-3">
            <ChevronRight size={15} strokeWidth={2.1} className={`shrink-0 ${tone === "dark" ? "text-white/40" : "text-[#c4cbd5]"}`} />
            {item.href && !isLast ? (
              <Link href={item.href} className="truncate transition hover:text-[#111111]">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? (tone === "dark" ? "truncate text-white/85" : "truncate text-[#6c7684]") : "truncate"}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
