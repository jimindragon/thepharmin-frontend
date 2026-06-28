import Link from "next/link";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";

export const metadata = {
  title: "공고 등록 · THE PHARMA Recruit",
};

const TRACKS = [
  {
    label: "산업",
    description: "제약·바이오·헬스케어 기업 채용",
    href: "/business/jobs/new/industry",
  },
  {
    label: "연구",
    description: "연구실·기관 연구원 채용",
    href: "/business/jobs/new/research",
  },
  {
    label: "병원약사",
    description: "병원·약제부 채용",
    href: "/business/jobs/new/hospital",
  },
  {
    label: "약국",
    description: "약국 약사·약무 채용",
    href: "/business/jobs/new/pharmacy",
  },
];

export default function BusinessNewJobPage() {
  return (
    <BusinessCenterShell>
      <div>
        <PageBreadcrumb
          items={[
            { label: "기업센터", href: "/business/dashboard" },
            { label: "채용관리" },
            { label: "공고 등록" },
          ]}
        />
        <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">공고 등록</h1>
        <p className="mt-2 text-[13px] font-normal text-[#68717e]">등록할 채용 트랙을 선택하세요.</p>

        <div className="mt-8 grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
          {TRACKS.map((track) => (
            <Link
              key={track.href}
              href={track.href}
              className="group flex flex-col gap-2 border border-[#dfe4ea] bg-white px-6 py-6 transition hover:border-[#111111]"
            >
              <span className="text-[16px] font-bold text-[#17202c] group-hover:text-[#111111]">
                {track.label}
              </span>
              <span className="text-[13px] text-[#8a94a3]">{track.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </BusinessCenterShell>
  );
}
