/**
 * 인증 화면(로그인·회원가입·비밀번호 재설정) 전용 최소 헤더.
 *
 * 로고 하나만 둔다 — 네비게이션·알림·계정 메뉴가 없어야 로그인 도중 다른 곳으로 새지 않는다.
 * 껍데기(높이·배경·좌우 여백)와 로고 마크업은 개인 헤더(Header.tsx)의 것을 그대로 쓴다.
 */
export function AuthHeader() {
  return (
    <header className="site-header sticky top-0 z-50 h-[64px] border-b border-[#151515] bg-[#050505] text-white">
      <div className="app-shell flex h-full items-center gap-6 max-[900px]:gap-4 max-[520px]:gap-3">
        <a href="/" className="flex shrink-0 items-center" aria-label="더파마 리크루트 홈으로 이동">
          <img
            src="/images/white_logo_1.svg"
            alt="더파마 리크루트"
            width={254}
            height={25}
            className="h-[25px] w-[254px] object-contain max-[900px]:h-[23px] max-[900px]:w-[234px] max-[520px]:h-[21px] max-[520px]:w-[214px]"
          />
        </a>
      </div>
    </header>
  );
}
