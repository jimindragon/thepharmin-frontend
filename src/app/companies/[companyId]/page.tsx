import Link from "next/link";
import { ChevronLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { companies } from "@/data/companies";
import { jobs } from "@/data/jobs";

interface CompanyPageProps {
  params: Promise<{ companyId: string }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { companyId } = await params;
  const company = companies.find((item) => item.id === companyId);
  const companyJobs = jobs.filter((job) => job.companyId === companyId);

  return (
    <>
      <Header />
      <main className="bg-[#f8fafb] pb-24 pt-6">
        <div className="app-shell">
          <Link href="/jobs/ra-specialist" className="inline-flex items-center gap-1 text-[13px] font-black text-[#7d8796] hover:text-brand">
            <ChevronLeft size={16} />
            공고 상세로 돌아가기
          </Link>

          <section className="mt-5 rounded-[var(--radius)] border border-border bg-white p-7 shadow-[var(--shadow)]">
            {company ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[30px] font-black text-[#202734]">{company.name}</h1>
                  {company.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-black text-brand">
                      <ShieldCheck size={13} />
                      인증기업
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 max-w-[760px] text-[15px] font-semibold leading-[1.8] text-[#566171]">{company.description}</p>
                <div className="mt-6 grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
                  {[
                    ["업종", company.industry],
                    ["사원 수", company.employeeCount],
                    ["설립연도", company.foundedYear],
                    ["진행 중 공고", `${companyJobs.length || company.activeJobCount}개`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[var(--radius)] border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3.5">
                      <p className="text-[12px] font-black text-[#8893a2]">{label}</p>
                      <p className="mt-1.5 text-[15px] font-extrabold text-[#2f3845]">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link href={`/companies/${company.id}/reviews`} className="inline-flex h-11 items-center rounded-[var(--radius)] bg-brand px-4 text-[14px] font-black text-white">
                    기업 후기 보기
                  </Link>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-[var(--radius)] border border-[#dfe5ec] bg-white px-4 text-[14px] font-black text-[#4f5a66] hover:border-brand hover:text-brand"
                  >
                    홈페이지
                    <ExternalLink size={15} />
                  </a>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-[28px] font-black text-[#202734]">기업 정보를 찾을 수 없습니다.</h1>
                <p className="mt-3 text-[15px] font-semibold text-[#667181]">등록되지 않은 기업 페이지입니다.</p>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
