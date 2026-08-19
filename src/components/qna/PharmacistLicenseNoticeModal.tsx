"use client";

import Link from "next/link";
import { Lock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePharmacistNoticeSeen } from "@/hooks/usePharmacistNoticeSeen";

/**
 * 약사 미인증 회원에게 면허 등록 동선을 알리는 안내 창.
 *
 * 한때 사이드바 카드 + 목록 상단 한 줄이던 것을 창 하나로 합쳤다 — 약사 QNA는 탭도 데이터도
 * 서버에서 걸러 내 미인증 회원에게는 "잠긴 것"이 아니라 "없는 것"으로 보이는데, 그 사실을
 * 사이드바 맨 아래 카드로 알리면 안내가 화면에 있어도 읽히지 않는다.
 *
 * 안쪽 구성(검은 아이콘 상자 → 제목 → 보조 문구 → 버튼 두 개)은 LoginGateModal의 문법을 그대로
 * 따르되 별도 부품으로 둔다 — 저쪽은 제목이 "로그인이 필요합니다"로 박혀 있어 재사용할 수 없다.
 * 겉틀도 OverlayPanel을 쓰지 않는다: 그림자 없음·z-[70]이 이 화면의 요구인데, OverlayPanel은
 * 그림자와 z-50을 계열의 정체성으로 들고 있어(그 파일 주석) 호출부 사정으로 흔들 자리가 아니다.
 * Escape·스크롤 잠금을 직접 들고 z-[70]에 서는 것은 ConfirmDialog가 이미 쓰는 방식이다.
 */

const NOTICE_PRIMARY = "약사 Q&A는 약사 인증 회원만 이용할 수 있습니다.";
const NOTICE_SECONDARY = "면허를 등록하시면 확인 후 이용 가능합니다.";
const NOTICE_CTA = "면허 등록하러 가기";

/** 회원정보 §4 "약사 인증" 섹션. SectionCard가 id를 그대로 내보내고 scroll-mt까지 들고 있어 앵커가 선다. */
const LICENSE_REGISTER_HREF = "/mypage/account#license";

function PharmacistLicenseNoticeModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/45 px-5"
      role="dialog"
      aria-modal="true"
      aria-label="약사 QNA 인증 안내"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[420px] border border-[#20242b] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="grid h-10 w-10 place-items-center bg-[#111111] text-white">
              <Lock size={18} />
            </div>
            {/* 제목이 문장이라 20px에서도 두 줄이 될 수 있다 — break-keep 없이 두면 단어 중간에서 갈린다 */}
            <h2 className="mt-5 break-keep text-[20px] font-bold leading-tight tracking-[-0.02em] text-[#171b20]">
              {NOTICE_PRIMARY}
            </h2>
            <p className="mt-3 break-keep text-[13px] font-medium leading-6 text-[#7a8490]">{NOTICE_SECONDARY}</p>
          </div>
          <button type="button" className="grid h-8 w-8 shrink-0 place-items-center hover:bg-[#f2f3f5]" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        {/* 이 창에서 할 일은 면허 등록 하나뿐이라 주 버튼이 남는 폭을 전부 가진다(LoginGateModal과 같은 배분).
            검정 solid — 창 안에서는 이것이 유일한 행동이라 사이드바 카드 때의 아웃라인을 이어받지 않는다. */}
        <div className="mt-6 grid grid-cols-[1fr_auto] gap-2">
          <Link
            href={LICENSE_REGISTER_HREF}
            className="inline-flex h-11 items-center justify-center bg-[#111111] px-5 text-[13px] font-medium text-white hover:bg-[#2a2a2a]"
          >
            {NOTICE_CTA}
          </Link>
          <button type="button" className="h-11 border border-[#d9dee5] px-5 text-[13px] font-medium text-[#4b5563]" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 창을 띄울지 판정하는 껍데기. 목록 화면은 이것 한 줄만 놓는다.
 *
 * 노출 대상 자체(canRegisterLicense)는 서버가 가른 값이라 호출부가 조건으로 들고, 여기서는
 * "이미 봤는지"와 "직접 막혀서 왔는지"만 본다.
 *
 * 튕겨 온 직후(cameFromPharmacistOnly)는 봤음 기록을 무시하고 다시 띄운다 — 링크를 눌렀는데
 * 목록으로 돌아온 상황에서 아무 말도 없으면 이동이 실패한 것으로 읽힌다.
 *
 * 그래서 닫힘은 기록만으로 표현할 수 없다(기록해도 튕겨 온 판정은 여전히 참이라 창이 남는다).
 * 이 방문에서 닫았다는 사실을 dismissed가 따로 들고, 기록은 다음 방문을 위해 남긴다.
 */
export function PharmacistLicenseNoticeGate({ cameFromPharmacistOnly = false }: { cameFromPharmacistOnly?: boolean }) {
  const { hasSeen, markSeen } = usePharmacistNoticeSeen();
  const [dismissed, setDismissed] = useState(false);

  const open = !dismissed && (cameFromPharmacistOnly || !hasSeen);
  if (!open) return null;

  return (
    <PharmacistLicenseNoticeModal
      onClose={() => {
        markSeen();
        setDismissed(true);
      }}
    />
  );
}
