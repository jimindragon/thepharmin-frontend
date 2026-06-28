"use client";

import clsx from "clsx";
import Link from "next/link";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { featuredPackageId, popularResourceIds, resourceCategories, resources, type ResourceCategory, type ResourceFile } from "@/data/resources";
import { formatResourcePrice } from "@/utils/resourcePrice";

function PriceBadge({ file, size = "sm" }: { file: ResourceFile; size?: "sm" | "md" }) {
  return (
    <span
      className={clsx(
        "absolute left-2 top-2 z-10 bg-[#111111] font-medium text-white",
        size === "md" ? "px-2.5 py-1 text-[12px]" : "px-2 py-0.5 text-[11px]",
      )}
    >
      {file.isFree ? "무료" : "유료"}
    </span>
  );
}

function showPlaceholderNotice(setNotice: (message: string) => void, message: string) {
  setNotice(message);
  window.setTimeout(() => setNotice(""), 2400);
}

function FeaturedPackagePanel({ pkg, onPurchaseClick }: { pkg: ResourceFile; onPurchaseClick: () => void }) {
  return (
    <section className="border border-[#e5e9ef] bg-white">
      <div className="grid grid-cols-[320px_1fr] gap-8 p-8 max-[860px]:grid-cols-1 max-[860px]:gap-5 max-[860px]:p-5">
        <div className="relative aspect-[4/3] overflow-hidden border border-[#e5e9ef]">
          <PriceBadge file={pkg} size="md" />
          <img src={pkg.coverImage} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="inline-flex h-6 w-fit items-center border border-[#cfd8e3] bg-[#f7f8fa] px-2.5 text-[11px] font-medium text-[#596373]">
            BEST PACKAGE
          </span>
          <Link href={`/resources/${pkg.slug}`} className="mt-3 inline-block">
            <h2 className="text-[24px] font-bold tracking-[-0.02em] text-[#17202c] transition hover:text-[#111111] max-[640px]:text-[20px]">
              {pkg.title}
            </h2>
          </Link>
          <p className="mt-2 text-[14px] font-normal leading-[1.7] text-[#596373]">{pkg.shortDescription}</p>

          {pkg.packageContents ? (
            <div className="mt-5 grid grid-cols-2 gap-y-2 gap-x-4 text-[13px] font-normal text-[#4f5967] max-[480px]:grid-cols-1">
              {pkg.packageContents.map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <Check size={13} className="shrink-0 text-[#111111]" />
                  {item}
                </div>
              ))}
            </div>
          ) : null}

          <div className="min-h-[28px] flex-1" />

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#edf1f5] pt-5 max-[640px]:flex-col max-[640px]:items-start">
            <div>
              {pkg.originalPrice ? (
                <span className="mr-2 text-[14px] font-normal text-[#b6bec9] line-through">{pkg.originalPrice.toLocaleString("ko-KR")}원</span>
              ) : null}
              <span className="text-[26px] font-bold tracking-[-0.02em] text-[#17202c]">{formatResourcePrice(pkg)}</span>
            </div>
            <LinkButton
              href="#"
              variant="gradient"
              size="lg"
              onClick={(event) => {
                event.preventDefault();
                onPurchaseClick();
              }}
            >
              패키지 구매하기
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryTabsRow({ active, onChange }: { active: ResourceCategory; onChange: (category: ResourceCategory) => void }) {
  return (
    <nav className="mt-8 flex gap-2 overflow-x-auto border-b border-[#eceff1] pb-3.5" aria-label="자료실 카테고리">
      {resourceCategories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={clsx(
            "h-[40px] shrink-0 whitespace-nowrap border px-5 text-[14px] font-medium transition-colors max-[520px]:px-4",
            active === category
              ? "border-[#111111] bg-[#111111] text-white"
              : "border-[#dddddd] bg-[#f4f4f4] text-[#555555] hover:border-[#bdbdbd] hover:bg-[#eeeeee] hover:text-[#111111]",
          )}
        >
          {category}
        </button>
      ))}
    </nav>
  );
}

function ResourceCard({ file }: { file: ResourceFile }) {
  return (
    <Link
      href={`/resources/${file.slug}`}
      className="group flex flex-col border border-[#e5e9ef] bg-white transition hover:border-[#111111]"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-[#e5e9ef]">
        <PriceBadge file={file} />
        <img src={file.coverImage} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#a0a9b7]">{file.englishLabel}</span>
        <h3 className="mt-1.5 text-[16px] font-bold tracking-[-0.01em] text-[#17202c] transition group-hover:text-[#111111]">{file.title}</h3>
        <p className="mt-1 text-[12px] font-normal text-[#8a94a3]">
          {file.category} · {file.pageCount}p · PDF
        </p>
        <p className="mt-2.5 line-clamp-2 flex-1 text-[13px] font-normal leading-[1.6] text-[#596373]">{file.shortDescription}</p>
        <div className="mt-3 flex items-end justify-between gap-2 border-t border-[#edf1f5] pt-3">
          <span className={clsx("text-[16px] font-bold", file.isFree ? "text-[#111111]" : "text-[#17202c]")}>{formatResourcePrice(file)}</span>
          {file.downloadCount != null ? <span className="text-[12px] font-normal text-[#a0a9b7]">{file.downloadCount.toLocaleString("ko-KR")}명 받음</span> : null}
        </div>
      </div>
    </Link>
  );
}

function PopularResourcesPanel({ items }: { items: ResourceFile[] }) {
  return (
    <section className="border border-[#e5e9ef] bg-white p-5">
      <h2 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] text-[#17202c]">
        <span className="inline-block h-3.5 w-[3px] bg-[#111111]" aria-hidden="true" />
        인기 자료
      </h2>
      <ol className="mt-4 space-y-3.5">
        {items.map((item, index) => (
          <li key={item.id}>
            <Link href={`/resources/${item.slug}`} className="flex items-start gap-3 transition hover:opacity-70">
              <span className="text-[15px] font-bold text-[#a0a9b7]">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#8a94a3]">
                  {item.category}
                  <span className={clsx("px-1 py-px text-[9px] font-medium", item.isFree ? "bg-[#f0f1f3] text-[#4a5261]" : "bg-[#e2e5e9] text-[#6b7280]")}>
                    {item.isFree ? "무료" : "유료"}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[13px] font-medium text-[#303946]">{item.title}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function MembershipPanel({ onCtaClick }: { onCtaClick: () => void }) {
  return (
    <section className="border border-[#dfe4ea] bg-[#050505] p-5 text-white">
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/55">MEMBERSHIP</span>
      <h2 className="mt-2 text-[17px] font-bold leading-[1.4] tracking-[-0.01em] text-white">더파마 멤버십으로 모든 유료 자료 무제한</h2>
      <p className="mt-2 text-[13px] font-normal leading-[1.65] text-white/68">기업분석·면접후기·직무가이드 전 자료를 월 구독으로 자유롭게 보세요.</p>
      <button
        type="button"
        onClick={onCtaClick}
        className="mt-4 inline-flex h-10 w-full items-center justify-center bg-white text-[13px] font-medium text-[#111111] transition hover:bg-[#f0f0f0]"
      >
        멤버십 알아보기
      </button>
    </section>
  );
}

export function ResourcesHomeClient() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>("전체");
  const [notice, setNotice] = useState("");

  const pkg = useMemo(() => resources.find((item) => item.id === featuredPackageId), []);
  const individualResources = useMemo(() => resources.filter((item) => !item.isPackage), []);
  const filteredResources = useMemo(
    () => (activeCategory === "전체" ? individualResources : individualResources.filter((item) => item.category === activeCategory)),
    [individualResources, activeCategory],
  );
  const popularResources = useMemo(
    () => popularResourceIds.map((id) => resources.find((item) => item.id === id)).filter((item): item is ResourceFile => Boolean(item)),
    [],
  );

  return (
    <main className="bg-[#f7f8fa] pb-20">
      <div className="app-shell pt-8">
        <PageHeader
          breadcrumbLabel="자료실"
          eyebrow="THE PHARMA LIBRARY"
          title="자료실"
          description="제약·바이오 취업을 위한 기업분석·면접후기·직무가이드 전자책. 더파마가 직접 만들어 제공합니다."
        />

        {pkg ? (
          <div className="mt-8">
            <FeaturedPackagePanel pkg={pkg} onPurchaseClick={() => showPlaceholderNotice(setNotice, "패키지 구매 화면은 추후 연결될 예정입니다.")} />
          </div>
        ) : null}

        <CategoryTabsRow active={activeCategory} onChange={setActiveCategory} />

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_280px] gap-8 max-[1024px]:grid-cols-1">
          <div>
            {filteredResources.length ? (
              <div className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">
                {filteredResources.map((file) => (
                  <ResourceCard key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <div className="flex h-[160px] flex-col items-center justify-center gap-1.5 border border-[#e5e9ef] bg-white text-center">
                <p className="text-[14px] font-semibold text-[#3d4653]">아직 등록된 자료가 없습니다.</p>
                <p className="text-[13px] font-normal text-[#8791a0]">다른 카테고리를 선택해보세요.</p>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <PopularResourcesPanel items={popularResources} />
            <MembershipPanel onCtaClick={() => showPlaceholderNotice(setNotice, "멤버십 안내 화면은 추후 연결될 예정입니다.")} />
          </aside>
        </div>

        {notice ? <p className="mt-4 text-[12px] font-medium text-[#596373]">{notice}</p> : null}
      </div>
    </main>
  );
}
