"use client";

import clsx from "clsx";
import Link from "next/link";
import { Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { LinkButton } from "@/components/ui/Button";
import type { ResourceFile } from "@/data/resources";
import { formatResourcePrice } from "@/utils/resourcePrice";

interface ResourceDetailClientProps {
  resource: ResourceFile;
  relatedResources: ResourceFile[];
}

function showPlaceholderNotice(setNotice: (message: string) => void, message: string) {
  setNotice(message);
  window.setTimeout(() => setNotice(""), 2400);
}

function InfoBadge({ children }: { children: string }) {
  return <span className="inline-flex h-7 items-center border border-[#dfe4ea] bg-[#f7f8fa] px-3 text-[12px] font-medium text-[#596373]">{children}</span>;
}

function SectionShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-[#e5e9ef] bg-white p-6 max-[640px]:p-5">
      <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#17202c]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function RelatedResourceCard({ file }: { file: ResourceFile }) {
  return (
    <Link href={`/resources/${file.slug}`} className="flex flex-col border border-[#e5e9ef] bg-white transition hover:border-[#111111]">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-[#e5e9ef]">
        <span className="absolute left-2 top-2 z-10 bg-[#111111] px-2 py-0.5 text-[11px] font-medium text-white">{file.isFree ? "무료" : "유료"}</span>
        <img src={file.coverImage} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#a0a9b7]">{file.category}</span>
        <h3 className="mt-1 line-clamp-2 text-[14px] font-bold tracking-[-0.01em] text-[#17202c]">{file.title}</h3>
        <span className="mt-2 text-[15px] font-bold text-[#17202c]">{formatResourcePrice(file)}</span>
      </div>
    </Link>
  );
}

function PurchasePanel({
  resource,
  onPurchaseClick,
  onPreviewClick,
}: {
  resource: ResourceFile;
  onPurchaseClick: () => void;
  onPreviewClick: () => void;
}) {
  return (
    <aside className="sticky top-[88px] h-fit space-y-3 self-start max-[1024px]:static">
      <section className="border border-[#e5e9ef] bg-white p-5">
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#a0a9b7]">{resource.isPackage ? "올인원 패키지" : "전자책"}</span>
        <h2 className="mt-1.5 text-[17px] font-bold leading-[1.4] tracking-[-0.01em] text-[#17202c]">{resource.title}</h2>
        <div className="mt-3">
          {resource.originalPrice ? (
            <span className="mr-2 block text-[13px] font-normal text-[#b6bec9] line-through">{resource.originalPrice.toLocaleString("ko-KR")}원</span>
          ) : null}
          <span className="text-[24px] font-bold tracking-[-0.02em] text-[#17202c]">{formatResourcePrice(resource)}</span>
        </div>

        <LinkButton href="#" variant="gradient" className="mt-5 w-full" onClick={(event) => { event.preventDefault(); onPurchaseClick(); }}>
          {resource.isPackage ? "패키지 구매하기" : "구매하기"}
        </LinkButton>
        <button
          type="button"
          onClick={onPreviewClick}
          className="mt-2 inline-flex h-11 w-full items-center justify-center border border-[#cfd8e3] bg-white text-[14px] font-medium text-[#303946] transition hover:border-[#111111]"
        >
          미리보기
        </button>

        <div className="mt-5 space-y-2 border-t border-[#edf1f5] pt-4">
          {["결제 후 즉시 다운로드", "PDF · 모바일/PC 열람", "업데이트 무료 제공"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-[13px] font-normal text-[#4f5967]">
              <Check size={14} className="shrink-0 text-[#111111]" />
              {item}
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

export function ResourceDetailClient({ resource, relatedResources }: ResourceDetailClientProps) {
  const [notice, setNotice] = useState("");
  const ebookCount = resource.isPackage ? resource.packageContents?.length ?? 1 : 1;

  const handlePurchaseClick = () =>
    showPlaceholderNotice(setNotice, resource.isPackage ? "패키지 구매 화면은 추후 연결될 예정입니다." : "구매 화면은 추후 연결될 예정입니다.");
  const handlePreviewClick = () => showPlaceholderNotice(setNotice, "미리보기 화면은 추후 연결될 예정입니다.");

  return (
    <main className="bg-[#f7f8fa] pb-20">
      <div className="app-shell--default pt-8">
        <PageBreadcrumb items={[{ label: "자료실", href: "/resources" }, { label: resource.category }, { label: resource.title }]} />

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_320px] gap-8 max-[1024px]:grid-cols-1">
          <div className="min-w-0 space-y-5">
            {/* 상단 상품 정보 */}
            <section className="border border-[#e5e9ef] bg-white p-7 max-[640px]:p-5">
              <div className="grid grid-cols-[260px_1fr] gap-7 max-[720px]:grid-cols-1">
                <div className="relative aspect-[4/3] overflow-hidden border border-[#e5e9ef]">
                  <span className="absolute left-2 top-2 z-10 bg-[#111111] px-2.5 py-1 text-[12px] font-medium text-white">{resource.isFree ? "무료" : "유료"}</span>
                  <img src={resource.coverImage} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="inline-flex h-6 w-fit items-center border border-[#cfd8e3] bg-[#f7f8fa] px-2.5 text-[11px] font-medium text-[#596373]">
                    {resource.isPackage ? "올인원 패키지" : resource.englishLabel}
                  </span>
                  <p className="mt-2 text-[12px] font-normal text-[#8a94a3]">
                    전자책 {ebookCount}종 · PDF
                  </p>
                  <h1 className="mt-2 text-[26px] font-bold leading-[1.3] tracking-[-0.02em] text-[#171d26] max-[640px]:text-[21px]">{resource.title}</h1>
                  <p className="mt-3 text-[14px] font-normal leading-[1.75] text-[#596373]">{resource.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <InfoBadge>{`전자책 ${ebookCount}종`}</InfoBadge>
                    <InfoBadge>PDF</InfoBadge>
                    <InfoBadge>즉시 다운로드</InfoBadge>
                    <InfoBadge>모바일·PC</InfoBadge>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#edf1f5] pt-5">
                    <div>
                      {resource.originalPrice ? (
                        <span className="mr-2 text-[14px] font-normal text-[#b6bec9] line-through">{resource.originalPrice.toLocaleString("ko-KR")}원</span>
                      ) : null}
                      <span className="text-[24px] font-bold tracking-[-0.02em] text-[#17202c]">{formatResourcePrice(resource)}</span>
                    </div>
                    <LinkButton href="#" variant="gradient" size="lg" onClick={(event) => { event.preventDefault(); handlePurchaseClick(); }}>
                      {resource.isPackage ? "패키지 구매하기" : "구매하기"}
                    </LinkButton>
                  </div>
                </div>
              </div>
            </section>

            {resource.packageContents ? (
              <SectionShell title={`패키지 구성 (전자책 ${resource.packageContents.length}종)`}>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[14px] font-normal text-[#3d4653] max-[480px]:grid-cols-1">
                  {resource.packageContents.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Check size={14} className="shrink-0 text-[#111111]" />
                      {item}
                    </div>
                  ))}
                </div>
              </SectionShell>
            ) : null}

            {resource.tableOfContents ? (
              <SectionShell title="목차">
                <div className="divide-y divide-[#edf1f5]">
                  {resource.tableOfContents.map((entry, index) => (
                    <div key={entry.label} className="flex items-center gap-4 py-3">
                      <span className="text-[13px] font-bold text-[#a0a9b7]">{String(index + 1).padStart(2, "0")}</span>
                      <span className="flex-1 text-[14px] font-medium text-[#303946]">{entry.label}</span>
                      <span className="text-[13px] font-normal text-[#8a94a3]">{entry.pageCount}p</span>
                    </div>
                  ))}
                </div>
              </SectionShell>
            ) : null}

            {resource.recommendedFor ? (
              <SectionShell title="이런 분께 추천해요">
                <div className="space-y-2.5">
                  {resource.recommendedFor.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[14px] font-normal text-[#3d4653]">
                      <Check size={14} className="shrink-0 text-[#111111]" />
                      {item}
                    </div>
                  ))}
                </div>
              </SectionShell>
            ) : null}

            {resource.introImageUrl ? (
              <section className="border border-[#e5e9ef] bg-white p-6 max-[640px]:p-5">
                <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#17202c]">자료 소개</h2>
                <img src={resource.introImageUrl} alt={`${resource.title} 상세 소개`} className="mt-4 h-auto w-full" />
              </section>
            ) : null}

            {relatedResources.length ? (
              <SectionShell title="함께 보면 좋은 자료">
                <div className="grid grid-cols-4 gap-3.5 max-[860px]:grid-cols-2">
                  {relatedResources.map((file) => (
                    <RelatedResourceCard key={file.id} file={file} />
                  ))}
                </div>
              </SectionShell>
            ) : null}
          </div>

          <PurchasePanel resource={resource} onPurchaseClick={handlePurchaseClick} onPreviewClick={handlePreviewClick} />
        </div>

        {notice ? <p className="mt-4 text-[12px] font-medium text-[#596373]">{notice}</p> : null}
      </div>
    </main>
  );
}
