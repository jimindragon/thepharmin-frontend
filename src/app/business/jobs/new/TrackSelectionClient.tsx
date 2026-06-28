"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { Button } from "@/components/ui/Button";

const TRACKS = [
  {
    id: "industry",
    label: "산업",
    description: "제약·바이오·헬스케어 기업 채용",
    href: "/business/jobs/new/industry",
    badge: "대표 트랙",
  },
  {
    id: "research",
    label: "연구",
    description: "연구실·기관 연구원 채용",
    href: "/business/jobs/new/research",
  },
  {
    id: "hospital",
    label: "병원약사",
    description: "병원·약제부 채용",
    href: "/business/jobs/new/hospital",
  },
  {
    id: "pharmacy",
    label: "약국",
    description: "약국 약사·약무 채용",
    href: "/business/jobs/new/pharmacy",
  },
];

export function TrackSelectionClient() {
  const [selected, setSelected] = useState("industry");
  const router = useRouter();

  const selectedTrack = TRACKS.find((t) => t.id === selected)!;

  return (
    <BusinessCenterShell>
      <div className="max-w-[620px]">
        {/* 오버라인 */}
        <p className="text-[11px] font-medium tracking-[0.14em] text-[#8a94a3]">
          THE PHARMA · NEW POSTING
        </p>

        {/* 타이틀 */}
        <h1 className="mt-2 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">
          공고 등록
        </h1>
        <p className="mt-1.5 text-[13px] text-[#68717e]">
          등록할 채용 트랙을 선택하세요. 어떤 트랙이든 등록은 무료입니다.
        </p>

        {/* 트랙 선택 */}
        <div className="mt-8 flex flex-col gap-2">
          {TRACKS.map((track) => {
            const isSelected = selected === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelected(track.id)}
                className={[
                  "flex w-full items-center gap-4 border px-5 py-4 text-left transition-colors",
                  isSelected
                    ? "border-[#111111] bg-white"
                    : "border-[#dfe4ea] bg-white hover:border-[#111111]",
                ].join(" ")}
              >
                {/* 원형 라디오 마커 */}
                <span
                  className={[
                    "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected
                      ? "border-[#111111] bg-[#111111]"
                      : "border-[#c8d0da] bg-white",
                  ].join(" ")}
                >
                  {isSelected && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path
                        d="M1 3.5L3.4 6L8 1"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>

                {/* 트랙명 + 설명 */}
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[#17202c]">
                      {track.label}
                    </span>
                    {track.badge && (
                      <span className="inline-flex h-5 items-center border border-status-positive-border bg-status-positive-subtle px-1.5 text-[11px] font-medium text-status-positive">
                        {track.badge}
                      </span>
                    )}
                  </span>
                  <span className="text-[13px] text-[#8a94a3]">
                    {track.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* 다음 버튼 */}
        <div className="mt-6">
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push(selectedTrack.href)}
          >
            다음
          </Button>
        </div>

        {/* 구분선 + 부스트 안내 */}
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
      </div>
    </BusinessCenterShell>
  );
}
