import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { Eyebrow } from "@/components/ui/Typography";

export function MyPageMockPage({ title, description }: { title: string; description: string }) {
  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: title }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">{title}</h1>
      <p className="mt-2.5 max-w-[560px] text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">{description}</p>

      <section className="mt-8 border border-[#dfe4ea] bg-white p-10 text-center">
        <Eyebrow align="center">준비 중</Eyebrow>
        <p className="mt-3 text-[15px] font-medium text-[#303946]">이 화면은 곧 만나보실 수 있습니다.</p>
        <p className="mt-2 text-[13px] font-normal leading-[1.7] text-[#8a94a3]">더 나은 경험을 위해 준비하고 있습니다. 빠르게 찾아오겠습니다.</p>
      </section>
    </MyPageShell>
  );
}
