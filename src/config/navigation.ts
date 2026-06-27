export const trackNavigationItems = [
  { label: "산업", href: "/jobs/industry" },
  { label: "연구", href: "/jobs/research" },
  { label: "병원", href: "/jobs/hospital" },
  { label: "약국", href: "/jobs/pharmacy" },
];

export const navigationItems = [
  { label: "캘린더", href: "/calendar" },
  { label: "기업정보", href: "/companies" },
  { label: "QNA", href: "/qna" },
  { label: "자료실", href: "/resources" },
  // 헤드헌팅: Header.tsx에서 useBusinessMember()로 href를 분기
  // (개인/비로그인 → /headhunting, 기업 회원 → /business/headhunting)
  { label: "헤드헌팅", href: "/headhunting" },
];
