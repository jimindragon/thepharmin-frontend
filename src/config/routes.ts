/**
 * 개인회원·기업회원 영역에서 공통으로 참조하는 라우트.
 * 고객센터처럼 여러 화면에서 동일한 목적지로 연결돼야 하는 경로는
 * 여기에 한 번만 정의하고 각 화면에서 재사용한다.
 */
export const sharedRoutes = {
  support: "/support",
  myPagePreferences: "/mypage/preferences",
} as const;
