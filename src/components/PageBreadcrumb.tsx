import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function PageBreadcrumb({ items, className = "" }: PageBreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-3 text-[13px] font-bold text-[#a0a9b7] ${className}`} aria-label="breadcrumb">
      <Home size={16} strokeWidth={2.1} className="shrink-0" />
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="inline-flex min-w-0 items-center gap-3">
            <ChevronRight size={15} strokeWidth={2.1} className="shrink-0 text-[#c4cbd5]" />
            {item.href && !isLast ? (
              <Link href={item.href} className="truncate transition hover:text-[#111111]">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "truncate text-[#6c7684]" : "truncate"}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
