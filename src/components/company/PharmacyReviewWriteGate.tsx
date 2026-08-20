import Link from "next/link";
import { Lock } from "lucide-react";
import {
  PHARMACIST_LICENSE_CTA,
  PHARMACIST_LICENSE_REGISTER_HREF,
  PHARMACY_REVIEW_WRITE_GATE_LOGIN_CTA,
  PHARMACY_REVIEW_WRITE_GATE_LOGIN_HREF,
  PHARMACY_REVIEW_WRITE_GATE_LOGIN_PRIMARY,
  PHARMACY_REVIEW_WRITE_GATE_PRIMARY,
  PHARMACY_REVIEW_WRITE_GATE_SECONDARY,
  type PharmacyReviewWriteAccess,
} from "@/config/pharmacistLicenseGate";

/**
 * 약국 재직 후기 작성 폼 대신 서는 자격 안내.
 *
 * 안쪽 구성(검은 자물쇠 상자 → 제목 → 보조 문구 → 버튼)은 약사 QNA 안내 창
 * (PharmacistLicenseNoticeModal)을 그대로 따른다 — 같은 인증 축이 막는 자리라 같은 얼굴이어야 한다.
 * 창이 아니라 카드인 것은 여기가 화면 전체이기 때문이다: 뒤에 남아 있을 목록이 없어 레이어로 띄우면
 * 빈 페이지 위에 창 하나만 뜬다. 겉틀은 이 폼의 섹션 카드(ReviewFormSection)와 같은 한 벌이다.
 *
 * 자격 무관 회원(notEligible)에게는 버튼을 달지 않는다 — 약사 QNA가 그 회원에게 안내 자체를 띄우지
 * 않는 것과 같은 규칙이고, 약사가 아닌 사람에게 "면허를 등록하세요"는 안내가 아니라 잘못된 권유가
 * 된다(qnaAccess.ts). 화면을 떠날 길은 히어로의 탭 행이 이미 들고 있다.
 */
export function PharmacyReviewWriteGate({ access }: { access: Exclude<PharmacyReviewWriteAccess, "allowed"> }) {
  const isLogin = access === "needsLogin";
  const primary = isLogin ? PHARMACY_REVIEW_WRITE_GATE_LOGIN_PRIMARY : PHARMACY_REVIEW_WRITE_GATE_PRIMARY;
  /** 자격 무관 회원에게는 "면허를 등록하면 풀린다"는 둘째 줄도 사실이 아니라 붙이지 않는다. */
  const secondary = isLogin ? undefined : access === "needsLicense" ? PHARMACY_REVIEW_WRITE_GATE_SECONDARY : undefined;
  const cta = isLogin
    ? { label: PHARMACY_REVIEW_WRITE_GATE_LOGIN_CTA, href: PHARMACY_REVIEW_WRITE_GATE_LOGIN_HREF }
    : access === "needsLicense"
      ? { label: PHARMACIST_LICENSE_CTA, href: PHARMACIST_LICENSE_REGISTER_HREF }
      : null;

  return (
    <section className="border border-border bg-white p-8 shadow-[var(--shadow)] max-[760px]:p-6">
      <div className="grid h-10 w-10 place-items-center bg-[#111111] text-white">
        <Lock size={18} aria-hidden />
      </div>
      {/* break-keep — 390px에서 이 문장이 두 줄로 갈릴 때 어절 경계에 묶는다(안내 창과 같은 처리) */}
      <h1 className="mt-5 break-keep text-[18px] font-bold leading-tight tracking-[-0.02em] text-[#171b20]">{primary}</h1>
      {secondary ? <p className="mt-3 break-keep text-[13px] font-medium leading-6 text-[#7a8490]">{secondary}</p> : null}
      {cta ? (
        <Link
          href={cta.href}
          className="mt-6 inline-flex h-11 items-center justify-center bg-[#111111] px-5 text-[13px] font-medium text-white hover:bg-[#2a2a2a]"
        >
          {cta.label}
        </Link>
      ) : null}
    </section>
  );
}
