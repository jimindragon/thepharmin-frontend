"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";

const hubTabs = [
  { href: "/companies", label: "기업정보" },
  { href: "/companies/interviews", label: "면접 후기" },
  { href: "/companies/reviews", label: "기업 리뷰" },
];

function CompaniesHubTabs() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex h-11 w-fit overflow-hidden border border-[#dfe4ea] bg-white" role="tablist" aria-label="기업정보 메뉴">
      {hubTabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={clsx(
              "flex h-full min-w-[104px] items-center justify-center px-5 text-[14px] font-medium transition-colors",
              active ? "bg-[#111111] text-white" : "text-[#596373] hover:text-[#111111]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function CompaniesHubLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="bg-[#f7f8fa] pb-20">
        <div className="app-shell pt-8">
          <PageHeader
            breadcrumbLabel="기업정보"
            eyebrow="THE PHARMA COMPANIES"
            title="기업정보"
            description="현직자·전직자가 남긴 기업 리뷰와 면접 후기를 살펴보세요."
          />
          <CompaniesHubTabs />
          {children}
        </div>
      </main>
    </>
  );
}
