"use client";

import { Lock } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export function ApprovalGatePanel() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
      <Lock size={20} className="text-[#6b7280]" />
      <h2 className="mt-4 text-[17px] font-bold text-[#17202c]">기업 인증 후 이용할 수 있습니다</h2>
      {/* 본문 15px 기준 폭 — 13px 시절의 440px를 그대로 두면 세 줄로 갈라진다. */}
      <p className="mt-2 max-w-[520px] text-[15px] font-normal leading-[1.7] text-[#68717e]">
        제출하신 사업자등록증명원을 운영팀이 검토하고 있습니다. 기업 인증이 승인되면 이 기능을 이용할 수 있습니다. 현재 인증 상태는 기업정보 관리에서 확인할 수 있습니다.
      </p>
      <div className="mt-7 flex gap-2.5">
        <LinkButton href="/business/profile-hub" variant="primary">
          인증 상태 확인하기
        </LinkButton>
        <LinkButton href="/business/support" variant="secondary">
          고객센터
        </LinkButton>
      </div>
    </div>
  );
}
