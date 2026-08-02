"use client";

/**
 * ⚠️ 개발용 임시 장치입니다. 실제 인증이 붙으면 통째로 사라집니다.
 *
 * 삭제 방법 — 두 곳만 지우면 흔적이 남지 않습니다:
 *   1. 이 디렉터리 전체:  rm -rf src/components/dev
 *   2. src/app/layout.tsx 의 import 한 줄과 렌더 한 줄
 * 다른 파일에는 아무것도 넣지 않았습니다.
 *
 * 상태를 바꾸는 방법은 기존 함수 호출뿐입니다 — 판정 로직을 여기서 다시 쓰지 않습니다.
 * 기존 개발용 쿼리(?resetMigration·?orgStatus·?track)는 그대로 살아 있고, 이 패널은 그 대체가
 * 아니라 자주 오가는 3종(개인 로그인·기업 로그인·계정 전환)만 버튼으로 꺼낸 것입니다.
 *
 * 시각 스타일은 기존 데모 UI(기업 인사이트의 "데모: 상태 전환" 바)가 쓰던 border-dashed를 따라
 * 실제 UI와 확실히 구분되게 했습니다.
 */

import clsx from "clsx";
import { useState } from "react";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";
import { clearBusinessMember, markBusinessMember, useBusinessMember } from "@/hooks/useBusinessMember";
import { useMemberMigration } from "@/hooks/useMemberMigration";

/**
 * 모달(z-[70])보다 낮게 둔다 — 개발용 장치가 실제 화면을 가리면 확인하려던 것을 못 본다.
 * 헤더(z-50)보다는 위라 헤더에 가려지지도 않는다.
 */
const PANEL_Z = "z-[60]";

const DASHED = "border border-dashed border-[#c7cdd6]";

function StateRow({
  label,
  on,
  onTurnOn,
  onTurnOff,
}: {
  label: string;
  on: boolean;
  onTurnOn: () => void;
  onTurnOff: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#4f5967]">
        <span
          aria-hidden
          className={clsx("h-1.5 w-1.5 rounded-full", on ? "bg-[#16a34a]" : "bg-[#c7cdd6]")}
        />
        {label}
      </span>
      <span className="flex items-center gap-1">
        <span className={clsx("mr-1 text-[11px] font-medium", on ? "text-[#16a34a]" : "text-[#a0a9b7]")}>
          {on ? "켜짐" : "꺼짐"}
        </span>
        <button
          type="button"
          onClick={onTurnOn}
          disabled={on}
          aria-label={`${label} 켜기`}
          className={clsx(
            "h-6 px-2 text-[11px] font-medium transition",
            DASHED,
            on ? "cursor-not-allowed text-[#c7cdd6]" : "text-[#4f5967] hover:border-[#111111] hover:text-[#111111]",
          )}
        >
          켜기
        </button>
        <button
          type="button"
          onClick={onTurnOff}
          disabled={!on}
          aria-label={`${label} 끄기`}
          className={clsx(
            "h-6 px-2 text-[11px] font-medium transition",
            DASHED,
            on ? "text-[#4f5967] hover:border-[#111111] hover:text-[#111111]" : "cursor-not-allowed text-[#c7cdd6]",
          )}
        >
          끄기
        </button>
      </span>
    </div>
  );
}

export function DevStatePanel() {
  // 레이아웃에서도 한 번 거르지만, 이 컴포넌트만 어딘가에 잘못 붙어도 프로덕션에 뜨지 않도록 한 겹 더 둔다.
  const isDev = process.env.NODE_ENV === "development";

  const [open, setOpen] = useState(false);
  const { isLoggedIn: personalOn, login: personalLogin, logout: personalLogout } = usePersonalLoginState();
  const businessOn = useBusinessMember();
  const { isMigrated, markMigrated, resetMigration } = useMemberMigration();

  if (!isDev) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="개발용 상태 전환 패널 열기"
        className={clsx(
          "fixed bottom-4 right-4 h-8 bg-white px-3 text-[11px] font-bold tracking-[0.06em] text-[#8a95a5] shadow-[0_2px_8px_rgba(20,32,46,0.12)] transition hover:border-[#111111] hover:text-[#111111]",
          DASHED,
          PANEL_Z,
        )}
      >
        DEV
      </button>
    );
  }

  return (
    <div
      className={clsx("fixed bottom-4 right-4 w-[268px] bg-white shadow-[0_8px_22px_rgba(20,32,46,0.16)]", DASHED, PANEL_Z)}
    >
      <div className="flex items-center justify-between border-b border-dashed border-[#c7cdd6] px-3 py-2">
        <span className="text-[11px] font-bold tracking-[0.06em] text-[#8a95a5]">DEV · 상태 전환</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="개발용 상태 전환 패널 닫기"
          className="text-[11px] font-medium text-[#8a95a5] transition hover:text-[#111111]"
        >
          접기
        </button>
      </div>

      <div className="px-3 py-2">
        <StateRow label="개인 로그인" on={personalOn} onTurnOn={personalLogin} onTurnOff={personalLogout} />
        <StateRow label="기업 로그인" on={businessOn} onTurnOn={markBusinessMember} onTurnOff={clearBusinessMember} />
        <StateRow label="계정 전환" on={isMigrated} onTurnOn={markMigrated} onTurnOff={resetMigration} />
      </div>
    </div>
  );
}
