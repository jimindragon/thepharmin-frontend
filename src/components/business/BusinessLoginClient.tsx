"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BusinessHeader } from "@/components/business/BusinessHeaders";
import { Eyebrow } from "@/components/ui/Typography";
import { markBusinessMember } from "@/hooks/useBusinessMember";

export function BusinessLoginClient({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  const handleLogin = () => {
    markBusinessMember();
    router.push(redirectTo);
  };

  return (
    <>
      <BusinessHeader />
      <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] px-11 py-16 max-[760px]:px-7">
        <section className="mx-auto max-w-[880px] border border-[#dfe4ea] bg-white p-10">
          <Eyebrow>기업 서비스</Eyebrow>
          <h1 className="mt-3 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">기업 로그인</h1>
          <p className="mt-4 text-[15px] font-normal leading-[1.75] text-[#68717e]">
            MVP에서는 실제 인증 없이 기업센터 화면을 확인할 수 있습니다. 실제 로그인 플로우는 추후 연결합니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleLogin}
              className="inline-flex h-11 items-center border border-[#111111] bg-[#111111] px-5 text-[13px] font-medium text-white"
            >
              기업센터로 로그인
            </button>
            <Link href="/business/signup" className="inline-flex h-11 items-center border border-[#cfd8e3] bg-white px-5 text-[13px] font-medium text-[#303946]">
              기업 계정 신청
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
