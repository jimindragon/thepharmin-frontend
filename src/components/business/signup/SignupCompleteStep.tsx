"use client";

import { Check } from "lucide-react";
import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";
import type { OrgTrack } from "@/data/businessCompanyProfile";
import { trackProfilePath } from "@/config/businessSignup";
import { useRouter } from "next/navigation";

const orgTrackCompleteLabel: Record<OrgTrack, string> = {
  industry: "기업·기관 회원",
  hospital: "병원 회원",
  pharmacy: "약국 회원",
  research: "연구기관 회원",
};

/** STEP C — 가입 완료 화면. 목데이터 단계라 실제 계정 생성 대신 배정된 orgTrack을 안내하고 기관정보 입력으로 유도한다. */
export function SignupCompleteStep({ orgTrack, institutionName }: { orgTrack: OrgTrack; institutionName: string }) {
  const router = useRouter();
  const infoLabel = orgTrack === "pharmacy" ? "약국 정보" : "기관 정보";

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[signup] orgTrack assigned:", orgTrack);
  }, [orgTrack]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] px-11 py-16 max-[760px]:px-5 max-[760px]:py-10">
      <div className="mx-auto max-w-[560px] border border-border bg-white p-12 text-center max-[560px]:p-7">
        <span className="mx-auto grid h-14 w-14 place-items-center bg-[#111111] text-white">
          <Check size={26} />
        </span>
        <div className="mt-6">
          <Eyebrow align="center">기업회원 가입</Eyebrow>
        </div>
        <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">가입이 완료되었습니다</h1>
        <p className="mt-3 text-[15px] font-normal leading-[1.7] text-[#68717e]">
          {institutionName ? `${institutionName}, ` : ""}
          {orgTrackCompleteLabel[orgTrack]}으로 가입되었습니다.
          <br />
          상세 정보는 {infoLabel}에서 입력할 수 있습니다.
        </p>
        <div className="mt-8 flex flex-col gap-2.5">
          <LinkButton href={trackProfilePath[orgTrack]} variant="gradient" className="w-full">
            {infoLabel} 입력하러 가기
          </LinkButton>
          <Button type="button" variant="secondary" className="w-full" onClick={() => router.push("/business/dashboard")}>
            나중에 하기
          </Button>
        </div>
      </div>
    </main>
  );
}
