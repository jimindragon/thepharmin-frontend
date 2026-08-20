"use client";

import { Check } from "lucide-react";
import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";
import type { OrgTrack } from "@/data/businessCompanyProfile";
import { trackProfilePath } from "@/config/businessSignup";
import { markBusinessMember } from "@/hooks/useBusinessMember";
import { setOrgVerificationStatus } from "@/hooks/useOrgVerificationStatus";
import { setPharmacyClaimState } from "@/hooks/usePharmacyClaimDemo";
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
    // 가입을 마치면 곧바로 기업 세션을 연다 — 두 트랙(기업·약국) 폼이 공유하는 유일한 도착 지점이라
    // 여기 한 곳이면 "기관 정보 입력하러 가기"로 나가든 "나중에 하기"로 나가든 로그인 상태로 도착한다.
    markBusinessMember();

    /**
     * 기관 인증은 "검토 중"으로 열린다 — STEP1이 사업자등록증명원(약국은 약사면허증)을 받으며
     * "운영팀 검토 후 승인됩니다"라고 안내해 놓고 곧바로 승인 완료로 들어가면, 화면이 한 말과
     * 계정 상태가 어긋난다. 이 값이 pending인 동안 공고 등록·지원자 관리 등은 승인 게이트가 받는다
     * (approvalGatedPathPrefixes). 두 트랙 공통이다.
     *
     * **훅의 기본값(approved)은 그대로 둔다.** 그쪽은 가입을 거치지 않고 들어온 방문자(DEV 데모)가
     * 보는 값이라, 기본값까지 pending으로 내리면 목업을 둘러보는 사람이 기업센터를 볼 수 없다.
     * 여기서 상태를 "가입을 통과한 계정"에만 찍는 것이 그 구분이다.
     */
    setOrgVerificationStatus("pending");

    if (orgTrack === "pharmacy") {
      /**
       * 약국 트랙은 가입 STEP1에서 이미 약국을 지목했으므로 claim은 끝난 것으로 둔다 — 후기 관리가
       * 묻는 것은 "어느 약국인가"이고, 그 답은 이 시점에 정해져 있다. 그래서 가입을 마친 계정은
       * 약국 인증 게이트(PharmacyClaimGate)를 다시 만나지 않는다. 그 게이트는 가입 때 건너뛴
       * 계정을 위한 예외 경로로 남는다.
       *
       * 직접 입력 경로로 들어온 약국도 claimed다. 등록부에 없는 이름이 실재하는지 확인하는 일은
       * 이 축이 아니라 orgStatus pending의 서류 검토가 맡는다 — 두 축이 같은 서류를 두 번 묻지 않게.
       */
      setPharmacyClaimState("claimed");
    }

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
        {/* 본문보다 한 단 낮은 13px 회색 — 축하 문구를 밀어내지 않으면서, 방금 열린 계정이
            아직 검토 중(orgStatus pending)이라는 사실을 여기서 한 번 알린다. 이 줄이 없으면
            기업센터에서 승인 게이트를 처음 만났을 때 이유를 알 수 없다. */}
        <p className="mt-3 text-[13px] font-normal leading-[1.7] text-[#8a95a5]">
          제출하신 서류는 운영팀이 검토 중이며, 승인 후 공고 등록 등 모든 기능을 이용할 수 있습니다.
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
