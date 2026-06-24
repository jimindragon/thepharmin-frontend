export interface MyPageMenuItem {
  label: string;
  href: string;
  badge?: number;
}

export interface MyPageMenuGroup {
  title: string;
  items: MyPageMenuItem[];
}

export const myPageMenuGroups: MyPageMenuGroup[] = [
  {
    title: "활동",
    items: [
      { label: "대시보드", href: "/mypage/dashboard" },
      { label: "지원 현황", href: "/mypage/applications", badge: 4 },
      { label: "받은 제안", href: "/mypage/offers", badge: 2 },
    ],
  },
  {
    title: "관심",
    items: [
      { label: "스크랩", href: "/mypage/scraps", badge: 8 },
      { label: "관심 조건", href: "/mypage/preferences" },
    ],
  },
  {
    title: "내 정보",
    items: [
      { label: "이력서 관리", href: "/mypage/resume", badge: 3 },
      { label: "회원정보", href: "/mypage/account" },
      { label: "알림 설정", href: "/mypage/notifications" },
    ],
  },
];

export const myPageUser = {
  name: "김더팜",
  email: "kimdp@thepharma.co.kr",
  tags: ["제안 받기 켜짐", "이력서 1건 공개 중"],
};
