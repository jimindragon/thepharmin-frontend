"use client";

/**
 * 소셜 로그인 버튼 묶음. 지금은 목업 — 눌러도 아무 일도 하지 않는다.
 *
 * 연동할 때 붙일 자리는 각 버튼의 onClick 하나뿐이다(아래 TODO 참고).
 * 인가 URL로 보내는 일만 하고 콜백은 서버 라우트가 받게 될 자리라, 이 컴포넌트는 상태를 갖지 않는다.
 *
 * 가입 화면에도 쓸 수 있게 shared에 둔다. 다만 소셜 가입은 약관 동의보다 소셜 인증이 앞서는 흐름이라
 * 지금의 3단계 가입 구조와 맞물리는 방식을 따로 설계해야 한다 — 그래서 이번엔 로그인에만 붙였다.
 */

/** 입력칸(h-11)과 같은 44px 정사각. 전역 radius 0 원칙 — 원형은 사람 아바타에만 허용된 예외다. */
const BUTTON = "flex h-11 w-11 shrink-0 items-center justify-center transition hover:opacity-80";

/**
 * 로고 파일의 생김새가 서로 달라 표시 크기를 따로 잡는다.
 *
 * 구글 파일은 G 글리프가 캔버스를 꽉 채운 투명 배경 이미지라 22px이 그대로 마크 크기가 된다.
 * 카카오 파일은 노란 판이 캔버스를 덮고 그 안에 말풍선이 가로 76.7%로 들어앉은 형태다. 같은 22px을
 * 주면 말풍선이 17px로 작아져 구글 G보다 눈에 띄게 작다. 30px으로 키워야 말풍선이 23px이 되어
 * 두 마크가 같은 크기로 읽힌다.
 *
 * 카카오 판의 노랑(#FAE300)과 버튼 배경(#FEE500)은 RGB로 (4,2,0) 차이라 경계가 보이지 않는다.
 * 판이 버튼 가운데를 덮고 바깥 7px만 배경색이 드러나는 구조다.
 */
const KAKAO_LOGO_SIZE = "h-[30px] w-[30px]";
const GOOGLE_LOGO_SIZE = "h-[22px] w-[22px]";

export function SocialLoginButtons({ label = "간편 로그인" }: { label?: string }) {
  return (
    <div className="mt-8 border-t border-border pt-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] text-[#68717e]">{label}</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="카카오로 로그인"
            // TODO: 연동 시 카카오 인가 URL로 이동시킨다.
            onClick={() => {}}
            className={`${BUTTON} bg-[#FEE500]`}
          >
            {/* alt는 빈 문자열 — 버튼의 aria-label과 중복되지 않게 한다. */}
            {/* next/image를 쓰지 않는다 — 코드베이스가 아직 전환 전이고, 전환하면 width/height가 필수라 별도 작업이 된다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kakao-logo.png" alt="" className={KAKAO_LOGO_SIZE} />
          </button>

          <button
            type="button"
            aria-label="구글로 로그인"
            // TODO: 연동 시 구글 인가 URL로 이동시킨다.
            onClick={() => {}}
            className={`${BUTTON} border border-border bg-white`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/google-logo.png" alt="" className={GOOGLE_LOGO_SIZE} />
          </button>
        </div>
      </div>
    </div>
  );
}
