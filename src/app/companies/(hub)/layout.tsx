import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Eyebrow } from "@/components/ui/Typography";

export default function CompaniesHubLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="bg-[#f7f8fa] pb-20">
        <div className="app-shell pt-8">
          <PageBreadcrumb className="mb-5" items={[{ label: "기업 인사이트" }]} />
          <Eyebrow>THE PHARMA COMPANIES</Eyebrow>
          <h1 className="mt-4 whitespace-nowrap text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#171d26] max-[760px]:text-[26px]">
            기업 인사이트
          </h1>
          <p className="mt-3 text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">기업 정보부터 기업 리뷰와 면접 후기까지</p>
          {children}
        </div>
      </main>
    </>
  );
}
