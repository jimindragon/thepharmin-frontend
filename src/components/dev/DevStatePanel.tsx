"use client";

/**
 * ⚠️ 개발용 임시 장치입니다. 실제 인증이 붙으면 통째로 사라집니다.
 *
 * 삭제 방법 — 두 곳만 지우면 흔적이 남지 않습니다:
 *   1. 이 디렉터리 전체:  rm -rf src/components/dev
 *   2. src/app/layout.tsx 의 import 한 줄과 렌더 한 줄
 * 다른 파일에는 아무것도 넣지 않았습니다.
 *
 * 상태를 바꾸는 방법은 기존 함수 호출뿐입니다 — 판정 로직도, 저장소 키도 여기서 다시 쓰지 않습니다.
 * 기존 개발용 쿼리(?resetMigration·?orgStatus·?resetInterestPrompt·?track)는 그대로 살아 있고,
 * 이 패널은 그 대체가 아니라 자주 오가는 것들을 버튼으로 꺼낸 것입니다.
 *
 * 시각 스타일은 기존 데모 UI(기업 인사이트의 "데모: 상태 전환" 바)가 쓰던 border-dashed를 따라
 * 실제 UI와 확실히 구분되게 했습니다.
 */

import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";
import { clearBusinessMember, markBusinessMember, useBusinessMember } from "@/hooks/useBusinessMember";
import { useMemberMigration } from "@/hooks/useMemberMigration";
import { setOrgVerificationStatus, useOrgVerificationStatus } from "@/hooks/useOrgVerificationStatus";
import { useInterestPromptSeen } from "@/hooks/useInterestPromptSeen";
import { clearAllStoredJobPreferences } from "@/hooks/useJobPreferenceStorage";
import { useReviewAccessDemo } from "@/hooks/useReviewAccessDemo";

/**
 * 임시: Vercel 배포에서도 DEV 패널을 노출한다.
 * 제거 시 false로 변경하거나 이 상수 기준 분기를 삭제할 것.
 */
const DEV_PANEL_ENABLED = true;

/**
 * 모달(z-[70])보다 낮게 둔다 — 개발용 장치가 실제 화면을 가리면 확인하려던 것을 못 본다.
 * 헤더(z-50)보다는 위라 헤더에 가려지지도 않는다.
 */
const PANEL_Z = "z-[60]";

// 모바일에서 하단 탭바(56px+safe-area)를 가리지 않도록 위로 회피
const PANEL_TABBAR_OFFSET = "max-[760px]:bottom-[calc(76px+env(safe-area-inset-bottom))]";

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

/**
 * 켜기/끄기 짝이 아닌 행(선택지가 2개거나 동작이 하나뿐인 행)이 쓰는 버튼.
 * 클래스는 StateRow의 버튼과 같은 값을 쓴다 — 한 패널 안에서 버튼 생김새가 갈라지지 않게 한다.
 */
function RowButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "h-6 px-2 text-[11px] font-medium transition",
        DASHED,
        disabled ? "cursor-not-allowed text-[#c7cdd6]" : "text-[#4f5967] hover:border-[#111111] hover:text-[#111111]",
      )}
    >
      {label}
    </button>
  );
}

/**
 * StateRow와 같은 껍데기(점 + 라벨 + 현재값 + 버튼들). 버튼 구성만 행마다 다르다.
 * valueLabel은 생략할 수 있다 — 선택지가 3개인 행은 현재값 글자까지 넣으면 268px 폭을 넘겨,
 * 대신 고른 값의 버튼을 비활성(회색)으로 두어 현재 상태를 드러낸다.
 */
function Row({
  label,
  on,
  valueLabel,
  children,
}: {
  label: string;
  on: boolean;
  valueLabel?: string;
  children: React.ReactNode;
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
        {valueLabel ? (
          <span className={clsx("mr-1 text-[11px] font-medium", on ? "text-[#16a34a]" : "text-[#a0a9b7]")}>
            {valueLabel}
          </span>
        ) : null}
        {children}
      </span>
    </div>
  );
}

/**
 * 약사 QNA 접근 데모의 세 상태. 값과 쿼리의 대응은 qnaAccess.ts의 판정을 그대로 따른다 —
 * 판정을 여기서 다시 쓰지 않고, 그 판정이 읽는 주소를 만들기만 한다.
 */
type QnaDemoState = "verified" | "unverified" | "ineligible";

const QNA_DEMO_HREF: Record<QnaDemoState, string> = {
  verified: "/qna",
  unverified: "/qna?pharmacist=false",
  ineligible: "/qna?pharmacist=false&licenseEligible=false",
};

/** 쿼리를 소비하는 라우트(/qna, /qna/[id], /qna/activity) 위에 있을 때만 현재 상태를 읽을 수 있다. */
function isQnaRoute(pathname: string) {
  return pathname === "/qna" || pathname.startsWith("/qna/");
}

/** 판정 순서는 resolveQnaViewerState와 같다 — pharmacist가 먼저고 licenseEligible은 그 아래에 걸린다. */
function readQnaDemoState(): QnaDemoState {
  const params = new URLSearchParams(window.location.search);
  if (params.get("pharmacist") !== "false") return "verified";
  return params.get("licenseEligible") === "false" ? "ineligible" : "unverified";
}

export function DevStatePanel() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn: personalOn, login: personalLogin, logout: personalLogout } = usePersonalLoginState();
  const businessOn = useBusinessMember();
  const { isMigrated, markMigrated, resetMigration } = useMemberMigration();
  const orgStatus = useOrgVerificationStatus();
  const { hasSeen: interestPromptSeen, resetSeen: resetInterestPrompt } = useInterestPromptSeen();
  const { demoState: reviewAccessDemo, setDemoState: setReviewAccessDemo } = useReviewAccessDemo();

  /**
   * 후기 목록이 프리셋을 정하는 규칙(패널이 고른 값 없으면 로그인 여부)을 그대로 따라 계산한다 —
   * 패널이 보여주는 "지금 고른 값"과 실제 화면이 어긋나지 않게 한다.
   */
  const reviewAccessState = reviewAccessDemo ?? (personalOn ? "hasCredits" : "loggedOut");

  /**
   * 온보딩 창의 노출 조건은 "로그인 && 안내 안 봄 && 저장된 관심조건 없음"(InterestPromptGate)이라,
   * 안내 기록만 지우면 조건을 이미 저장해 둔 상태에서는 눌러도 창이 뜨지 않는다. 둘을 함께 지운다.
   */
  const resetInterestOnboarding = () => {
    resetInterestPrompt();
    clearAllStoredJobPreferences();
  };

  /**
   * 인증 상태를 읽는 화면(사이드바 잠금·헤더 드롭다운·대시보드 안내)은 모두 마운트 때 한 번만
   * localStorage를 읽는다. 값만 바꾸면 지금 보고 있는 화면이 그대로라 리로드로 반영한다 —
   * ?orgStatus= 쿼리로 이동했을 때와 같은 상태가 된다.
   */
  const applyOrgStatus = (status: "pending" | "approved") => {
    setOrgVerificationStatus(status);
    window.location.reload();
  };

  /**
   * QNA 밖에서는 null이다 — 읽을 쿼리가 없어 "지금 어느 상태인지"를 말할 수 없고,
   * 그때는 세 버튼이 모두 활성이라 어느 것을 눌러도 그 상태로 QNA에 들어간다.
   * 서버에서는 주소 쿼리를 알 수 없어 마운트 후에 읽는다(useOrgVerificationStatus와 같은 자리).
   * useSearchParams를 쓰지 않는 이유는 MigrationGuard와 같다 — 루트 레이아웃에서 그 훅을 쓰면
   * 앱 전체가 Suspense 경계를 요구하게 된다.
   */
  const [qnaState, setQnaState] = useState<QnaDemoState | null>(null);

  useEffect(() => {
    setQnaState(isQnaRoute(pathname) ? readQnaDemoState() : null);
  }, [pathname]);

  /**
   * 고른 값을 먼저 반영하고 이동한다 — /qna?pharmacist=false에서 "인증됨"을 누르면 경로가 그대로라
   * 위 이펙트가 다시 돌지 않는다. 주소만 바뀌고 버튼은 이전 상태로 남는 것을 막는다.
   */
  const applyQnaState = (next: QnaDemoState) => {
    setQnaState(next);
    router.push(QNA_DEMO_HREF[next]);
  };

  if (!DEV_PANEL_ENABLED) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="개발용 상태 전환 패널 열기"
        className={clsx(
          "fixed bottom-4 left-4 h-8 bg-white px-3 text-[11px] font-bold tracking-[0.06em] text-[#8a95a5] shadow-[0_2px_8px_rgba(20,32,46,0.12)] transition hover:border-[#111111] hover:text-[#111111]",
          DASHED,
          PANEL_Z,
          PANEL_TABBAR_OFFSET,
        )}
      >
        DEV
      </button>
    );
  }

  return (
    <div
      className={clsx(
        "fixed bottom-4 left-4 w-[268px] bg-white shadow-[0_8px_22px_rgba(20,32,46,0.16)]",
        DASHED,
        PANEL_Z,
        PANEL_TABBAR_OFFSET,
      )}
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

        <Row label="기업 인증" on={orgStatus === "approved"} valueLabel={orgStatus === "approved" ? "승인 완료" : "검토 중"}>
          <RowButton label="검토중" onClick={() => applyOrgStatus("pending")} disabled={orgStatus === "pending"} />
          <RowButton label="승인" onClick={() => applyOrgStatus("approved")} disabled={orgStatus === "approved"} />
        </Row>

        {/* 다시 보기는 안내 노출 기록과 저장된 관심조건을 모두 초기화한다 — 온보딩을 처음 상태부터
            재현하기 위해. 데모 저장값이라 삭제 부담 없음.
            초기화만 하고 리로드하지 않는다 — 안내 창(InterestPromptGate)도, 관심조건을 읽는 화면들도
            모두 마운트 때 읽으므로 지금 보고 있는 화면을 날릴 이유가 없다. */}
        <Row label="관심조건 안내" on={interestPromptSeen} valueLabel={interestPromptSeen ? "봤음" : "안 봤음"}>
          <RowButton label="다시 보기" onClick={resetInterestOnboarding} disabled={!interestPromptSeen} />
        </Row>

        {/* 리로드하지 않는다 — 훅이 발행하는 이벤트로 후기 목록이 같은 탭에서 즉시 따라온다. */}
        <Row label="면접후기 열람" on={reviewAccessState === "hasCredits"}>
          <RowButton
            label="비로그인"
            onClick={() => setReviewAccessDemo("loggedOut")}
            disabled={reviewAccessState === "loggedOut"}
          />
          <RowButton label="0장" onClick={() => setReviewAccessDemo("noCredits")} disabled={reviewAccessState === "noCredits"} />
          <RowButton label="2장" onClick={() => setReviewAccessDemo("hasCredits")} disabled={reviewAccessState === "hasCredits"} />
        </Row>

        {/* QNA 접근 상태는 서버 판정(쿼리 기반)이라 저장소가 아닌 URL로 전환한다.
            패널에서 유일하게 화면을 이동시키는 행 — 쿼리가 QNA 라우트에서만 소비되므로
            QNA로 데려가는 것까지가 전환이다. 헤더로 QNA를 벗어나면 상태가 풀린다(의도된 데모 한계). */}
        <Row label="약사 QNA" on={qnaState === "verified"}>
          <RowButton label="인증됨" onClick={() => applyQnaState("verified")} disabled={qnaState === "verified"} />
          <RowButton label="미인증" onClick={() => applyQnaState("unverified")} disabled={qnaState === "unverified"} />
          <RowButton label="자격없음" onClick={() => applyQnaState("ineligible")} disabled={qnaState === "ineligible"} />
        </Row>
      </div>
    </div>
  );
}
