"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { PageTitle } from "@/components/ui/Typography";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";

const TRACKS = [
  {
    id: "industry",
    label: "산업",
    description: "제약·바이오·헬스케어 기업 정보",
    href: "/business/industry/profile",
    image: "/images/track-cards/industry.jpg",
  },
  {
    id: "research",
    label: "연구",
    description: "연구실·연구기관 정보",
    href: "/business/research/profile",
    image: "/images/track-cards/research.jpg",
  },
  {
    id: "hospital",
    label: "병원",
    description: "병원·약제부 정보",
    href: "/business/hospital/profile",
    image: "/images/track-cards/hospital.jpg",
  },
  {
    id: "pharmacy",
    label: "약국",
    description: "약국 정보",
    href: "/business/pharmacy/profile",
    image: "/images/track-cards/pharmacy.jpg",
  },
];

export function ProfileHubClient() {
  const router = useRouter();

  return (
    <BusinessCenterShell>
      <div className="flex items-start justify-between gap-4">
        {/* 오버라인 / 타이틀 / 설명 — 공고 등록 허브와 동일 폭 */}
        <div className="max-w-[620px]">
          <PageBreadcrumb
            items={[
              { label: "기업센터", href: "/business/dashboard" },
              { label: "기업관리" },
              { label: "기업정보 관리" },
            ]}
          />
          <PageTitle className="max-[760px]:mt-0">기업 정보 관리</PageTitle>
          <p className="mt-2 text-[15px] font-normal leading-[1.7] text-[#68717e]">
            관리할 기업/기관 정보 트랙을 선택하세요.
          </p>
        </div>

        {/* 개발용 배지 — 실서비스에서는 계정 트랙 분기로 대체될 예정인 검토용 임시 허브임을 표시 */}
        {/* leading-4: body의 line-height 1.65가 배지 안까지 상속되는 것을 끊은 국소 예외(자료실 사이드바 배지·모달 할인율 배지·트랙 배지에 이미 같은 처방). h-5(18px)로는 13px 라인박스 21.45px를 못 담아 잘렸으므로 h-6까지 함께 올린다. */}
        <span className="mt-1 inline-flex h-6 shrink-0 items-center rounded-full border border-[#dfe4ea] bg-[#f5f6f7] px-2 text-[13px] font-medium leading-4 text-[#9aa3af]">
          개발용
        </span>
      </div>

      {/* 트랙 카드 그리드 — 공고 등록 허브와 동일 컴포넌트(.track-card) 재사용 */}
      <div className="mt-8 grid grid-cols-2 gap-4 min-[760px]:grid-cols-4">
        {TRACKS.map((track) => (
          <button
            key={track.id}
            type="button"
            onClick={() => router.push(track.href)}
            className="track-card"
          >
            {/* 이미지 16:10 — shrink-0: 설명문이 길어져도 사진이 눌리지 않게 한다 */}
            <div className="relative aspect-[16/10] shrink-0 overflow-hidden">
              <Image
                src={track.image}
                alt={track.label}
                fill
                sizes="(max-width: 760px) 50vw, 25vw"
                className="object-cover track-card-img"
              />
            </div>

            {/* 트랙명 + 설명 */}
            <div className="px-3 py-3">
              <p className="text-[16px] font-semibold text-[#17202c]">{track.label}</p>
              <p className="mt-0.5 text-[13px] font-normal text-[#8a94a3]">{track.description}</p>
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
    </BusinessCenterShell>
  );
}
