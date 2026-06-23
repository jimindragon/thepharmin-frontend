import Link from "next/link";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { BusinessPublicHeader } from "@/components/business/BusinessHeaders";
import { Eyebrow } from "@/components/ui/Typography";

export function BusinessLandingPage() {
  return (
    <>
      <BusinessPublicHeader />
      <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7]">
        <section className="app-shell py-16">
          <div className="grid grid-cols-[minmax(0,1fr)_360px] border border-[#dfe4ea] bg-white max-[900px]:grid-cols-1">
            <div className="p-10 max-[760px]:p-6">
              <Eyebrow>기업 서비스</Eyebrow>
              <h1 className="mt-3 text-[34px] font-bold tracking-[-0.02em] text-[#17202c] max-[760px]:text-[26px]">기업 계정으로 시작하세요</h1>
              <p className="mt-4 max-w-[560px] text-[15px] font-normal leading-[1.75] text-[#68717e]">
                공고 등록과 기업정보 관리는 기업 계정 로그인 후 이용할 수 있습니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/business/login" className="inline-flex h-11 items-center border border-[#111111] bg-[#111111] px-6 text-[13px] font-medium text-white hover:bg-[#2a2a2a]">
                  기업 로그인
                </Link>
                <Link href="/business/signup" className="inline-flex h-11 items-center border border-[#cfd8e3] bg-white px-6 text-[13px] font-medium text-[#303946] hover:border-[#111111]">
                  기업 계정 신청
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 max-[760px]:grid-cols-1">
                {["기업정보 관리", "공고 등록", "지원자 관리"].map((item) => (
                  <div key={item} className="border border-[#e3e7ed] bg-[#fbfcfd] px-4 py-3 text-[13px] font-medium text-[#303946]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="min-h-[320px] border-l border-[#dfe4ea] bg-cover bg-center max-[900px]:hidden"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(5,5,5,0.12), rgba(5,5,5,0.36)), url('/images/company/company_pic_example_2.jpg')",
              }}
              aria-hidden="true"
            />
          </div>
        </section>
      </main>
    </>
  );
}

export function BusinessPublicMockPage({ title, description }: { title: string; description: string }) {
  return (
    <>
      <BusinessPublicHeader />
      <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] px-11 py-16 max-[760px]:px-7">
        <section className="mx-auto max-w-[880px] border border-[#dfe4ea] bg-white p-10">
          <Eyebrow>기업 서비스</Eyebrow>
          <h1 className="mt-3 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">{title}</h1>
          <p className="mt-4 text-[15px] font-normal leading-[1.75] text-[#68717e]">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/business/signup" className="inline-flex h-11 items-center border border-[#111111] bg-[#111111] px-5 text-[13px] font-medium text-white">
              기업 계정 신청
            </Link>
            <Link href="/business/login" className="inline-flex h-11 items-center border border-[#cfd8e3] bg-white px-5 text-[13px] font-medium text-[#303946]">
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
      <section className="border border-[#dfe4ea] bg-white p-10">
        <Eyebrow>기업센터</Eyebrow>
        <h1 className="mt-3 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">{title}</h1>
        <p className="mt-4 max-w-[720px] text-[15px] font-normal leading-[1.75] text-[#68717e]">{description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/business/company/profile" className="inline-flex h-11 items-center border border-[#111111] bg-[#111111] px-5 text-[13px] font-medium text-white">
            기업정보 관리로 이동
          </Link>
          <Link href="/business/jobs/new" className="inline-flex h-11 items-center border border-[#cfd8e3] bg-white px-5 text-[13px] font-medium text-[#303946]">
            공고 등록하기
          </Link>
        </div>
      </section>
    </BusinessCenterShell>
  );
}
