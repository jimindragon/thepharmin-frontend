"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ModalShell } from "@/components/ui/ModalShell";

/**
 * 헤드헌팅 소개 랜딩의 "서비스 소개자료 받기" 이메일 수집창.
 *
 * 겉틀은 공용 ModalShell을 그대로 쓴다 — sheetBreakpoint 760이면 ≤760px에서 하단 드로어,
 * 그 위에서 중앙 팝업이 된다. 백드롭 탭·Escape·배경 스크롤 잠금·오버레이 그림자도 셸의 것이다
 * (그림자는 오버레이라 그림자 금지의 기능 예외에 해당한다).
 *
 * 열림 상태는 이 컴포넌트가 갖지 않는다 — 호출부가 조건부로 마운트한다. 셸의 Escape·스크롤 잠금이
 * 마운트 시점에만 걸리는 구조이기도 하고, 다시 열 때 입력·동의·오류가 초기화되어야 하기 때문이다.
 *
 * 회원·비회원을 가르지 않는다 — 소개자료는 로그인 여부와 무관하게 받는 것이라
 * 종전 보조 CTA의 isMember 분기(회원=의뢰 목록, 비회원=고객센터)를 여기서 걷어냈다.
 */

/**
 * 형식 검증만 한다(로컬@도메인.TLD). 실제 수신 가능 여부는 발송해 봐야 알 수 있는 것이고,
 * 지금은 발송 자체가 없다 — 오타를 잡아 주는 선에서 멈춘다.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FIELD_LABEL = "text-[13px] font-semibold text-[#17202c]";

export function HeadhuntingBrochureModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("이메일 주소를 확인해 주세요.");
      return;
    }
    setError(null);
    // TODO(backend): 소개자료 발송 파이프라인 — 입력한 이메일을 수신자 목록에 넣고 자료를 보낸다.
    // 지금은 목업이라 값을 저장하지도, 어디로 보내지도 않는다(성공 화면만 보여 준다).
    setSubmitted(true);
  };

  return (
    <ModalShell
      title="서비스 소개자료 받기"
      description={submitted ? undefined : "이메일을 남겨주시면 더파마 리크루트 소개자료를 보내드립니다."}
      headerVariant={submitted ? "plain" : "emphasis"}
      onClose={onClose}
      maxWidth="max-w-[440px]"
      sheetBreakpoint={760}
    >
      {/* ModalShell 바텀시트에는 safe-area 보정이 없다 — 호출부가 준다(AddToCalendarSheet와 같은 처리).
          ≤760px에서 패널이 화면 하단에 붙어 마지막 버튼이 홈 인디케이터에 걸린다. */}
      <div className="px-6 py-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        {submitted ? (
          <>
            <p className="text-[14px] font-normal leading-[1.7] text-[#404040]">
              신청이 완료되었습니다. 입력하신 이메일로 소개자료를 보내드릴게요.
            </p>
            <Button type="button" variant="primary" size="lg" onClick={onClose} className="mt-6 w-full">
              닫기
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="brochure-email" className={FIELD_LABEL}>
              이메일
            </label>
            {/* h-12(48px) — 터치 타깃 44px을 상자 자체로 채운다. noValidate로 브라우저 기본 말풍선을
                끄고 아래 오류 문구 한 곳으로 모은다(문구를 우리가 정한 것으로 통일). */}
            <input
              id="brochure-email"
              type="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="recruit@example.com"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "brochure-email-error" : undefined}
              className="mt-2 h-12 w-full border border-border bg-white px-3 text-[14px] text-[#17202c] outline-none placeholder:text-[#a3a3a3] focus:border-[#111111]"
            />
            {error ? (
              <p id="brochure-email-error" role="alert" className="mt-2 text-[12px] font-medium text-danger">
                {error}
              </p>
            ) : null}

            {/* 행 전체를 44px로 세워 체크박스 바깥을 눌러도 토글되게 한다(label이 input을 감싼다). */}
            <label className="mt-4 flex min-h-[44px] cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="h-[18px] w-[18px] shrink-0 accent-[#111111]"
              />
              <span className="text-[13px] font-normal text-[#404040]">개인정보 수집·이용에 동의합니다.</span>
            </label>

            {/* 검정 솔리드 — 그라데이션은 페이지 대표 CTA("인재추천 의뢰하기")의 것이라
                보조 흐름인 이 제출에는 쓰지 않는다. 동의 전에는 제출이 막힌다. */}
            <Button type="submit" variant="primary" size="lg" disabled={!agreed} className="mt-4 w-full">
              소개자료 신청하기
            </Button>
          </form>
        )}
      </div>
    </ModalShell>
  );
}
