import Link from "next/link";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { BusinessHeader } from "@/components/business/BusinessHeaders";
import { Eyebrow } from "@/components/ui/Typography";

/**
 * 삭제된 BusinessLandingPage(구 /business 랜딩, 2026-06-30 교체)의
 * 카피 기록 — 리포 내 다른 곳에 없는 문구라 참고용으로 남긴다.
 *
 *   제목: 기업 계정으로 시작하세요
 *   본문: 공고 등록과 기업정보 관리는 기업 계정 로그인 후 이용할 수 있습니다.
 *   기능 칩: 기업정보 관리 / 공고 등록 / 지원자 관리
 *
 * 화면 자체는 git 히스토리(e0668fc 이전)에 있다.
 */

export function BusinessPublicMockPage({ title, description }: { title: string; description: string }) {
  return (
    <>
      <BusinessHeader />
      <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] px-11 py-16 max-[760px]:px-7">
        <section className="mx-auto max-w-[880px] border border-border bg-white p-10">
          <Eyebrow>기업 서비스</Eyebrow>
          <h1 className="mt-3 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">{title}</h1>
          <p className="mt-4 text-[15px] font-normal leading-[1.75] text-[#68717e]">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/business/signup" className="inline-flex h-11 items-center border border-[#111111] bg-[#111111] px-5 text-[13px] font-medium text-white">
              기업 계정 신청
            </Link>
            <Link href="/business/login" className="inline-flex h-11 items-center border border-border bg-white px-5 text-[13px] font-medium text-[#303946]">
              로그인
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export function BusinessCenterMockPage({ title, description }: { title: string; description: string }) {
  return (
    <BusinessCenterShell>
      <section className="border border-border bg-white p-10">
        <Eyebrow>기업센터</Eyebrow>
        <h1 className="mt-3 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">{title}</h1>
        <p className="mt-4 max-w-[720px] text-[15px] font-normal leading-[1.75] text-[#68717e]">{description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/business/company/profile" className="inline-flex h-11 items-center border border-[#111111] bg-[#111111] px-5 text-[13px] font-medium text-white">
            기업정보 관리로 이동
          </Link>
          <Link href="/business/jobs/new" className="inline-flex h-11 items-center border border-border bg-white px-5 text-[13px] font-medium text-[#303946]">
            공고 등록하기
          </Link>
        </div>
      </section>
    </BusinessCenterShell>
  );
}
