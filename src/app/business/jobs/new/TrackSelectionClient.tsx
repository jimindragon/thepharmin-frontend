"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";

const TRACKS = [
  {
    id: "industry",
    label: "산업",
    description: "제약·바이오·헬스케어 기업 채용",
    href: "/business/jobs/new/industry",
    badge: "대표 트랙",
    image: "/images/track-cards/industry.jpg",
  },
  {
    id: "research",
    label: "연구",
    description: "연구실·기관 연구원 채용",
    href: "/business/jobs/new/research",
    image: "/images/track-cards/research.jpg",
  },
  {
    id: "hospital",
    label: "병원약사",
    description: "병원·약제부 채용",
    href: "/business/jobs/new/hospital",
    image: "/images/track-cards/hospital.jpg",
  },
  {
    id: "pharmacy",
    label: "약국",
    description: "약국 약사·약무 채용",
    href: "/business/jobs/new/pharmacy",
    image: "/images/track-cards/pharmacy.jpg",
  },
];

export function TrackSelectionClient() {
  const router = useRouter();

  return (
    <BusinessCenterShell>
      {/* 오버라인 / 타이틀 / 설명 — 기존 폭 유지 */}
      <div className="max-w-[620px]">
        <p className="text-[11px] font-medium tracking-[0.14em] text-[#8a94a3]">
          THE PHARMA · NEW POSTING
        </p>
        <h1 className="mt-2 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">
          공고 등록
        </h1>
        <p className="mt-1.5 text-[13px] text-[#68717e]">
          등록할 채용 트랙을 선택하세요. 어떤 트랙이든 등록은 무료입니다.
        </p>
      </div>

      {/* 트랙 카드 그리드 */}
      <div className="mt-8 grid grid-cols-2 gap-4 min-[760px]:grid-cols-4">
        {TRACKS.map((track) => (
          <button
            key={track.id}
            type="button"
            onClick={() => router.push(track.href)}
            className="track-card"
          >
            {/* 상단 그라데이션 라인 (hover/focus 시 scaleX 0→1) */}
            <div className="track-card-line" />

            {/* 이미지 16:10 */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={track.image}
                alt={track.label}
                fill
                sizes="(max-width: 760px) 50vw, 25vw"
                className="object-cover track-card-img"
              />
              {/* 대표 트랙 배지 — 좌상단, 산업만 */}
              {track.badge && (
                <span className="absolute left-0 top-0 z-10 inline-flex h-5 items-center border border-status-positive-border bg-status-positive-subtle px-1.5 text-[11px] font-medium text-status-positive">
                  {track.badge}
                </span>
              )}
            </div>

            {/* 트랙명 + 설명 */}
            <div className="px-3 py-3">
              <p className="text-[14px] font-semibold text-[#17202c]">{track.label}</p>
              <p className="mt-0.5 text-[12px] text-[#8a94a3]">{track.description}</p>
            </div>

            {/* 우하단 화살표 — hover/focus 시 표시 */}
            <div className="track-card-arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* 부스트 helper — 카드 그리드와 동일 폭 */}
      <div className="mt-6 border-t border-[#e8ecf0] pt-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[13px] font-medium text-[#303946]">
              더 빠른 채용이 필요하신가요?
            </p>
            <p className="mt-0.5 text-[13px] text-[#8a94a3]">
              등록은 무료, 노출을 높이고 싶을 땐 부스트로 상단에 노출하세요.
            </p>
          </div>
          <Link
            href="/business/billing"
            className="shrink-0 text-[13px] font-medium text-[#303946] transition hover:text-[#111111] hover:underline"
          >
            요금제·부스트 보기 →
          </Link>
        </div>
      </div>
    </BusinessCenterShell>
  );
}
