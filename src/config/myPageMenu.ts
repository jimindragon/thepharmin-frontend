import { mockPersonalMember } from "@/data/personalMember";

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
      { label: "후기 열람권", href: "/mypage/review-credits" },
      { label: "알림", href: "/mypage/notifications" },
    ],
  },
  {
    title: "관심",
    items: [
      { label: "스크랩", href: "/mypage/scraps", badge: 9 },
      { label: "최근 본 공고", href: "/mypage/recent-jobs" },
      { label: "관심 조건", href: "/mypage/preferences" },
    ],
  },
  {
    title: "내 정보",
    items: [
      { label: "이력서 관리", href: "/mypage/resume", badge: 3 },
      { label: "회원정보", href: "/mypage/account" },
      { label: "알림 설정", href: "/mypage/notifications/settings" },
    ],
  },
];

/** 헤더·사이드바 등이 쓰는 표시용 요약. 이름·이메일은 회원 정본에서 파생해 회원정보 화면과 어긋나지 않게 한다.
 * tags는 표시 전용 배지라 아직 정본이 없다(제안 받기·이력서 공개는 이력서 관리 화면이 소유). */
export const myPageUser = {
  name: mockPersonalMember.name,
  email: mockPersonalMember.email,
  tags: ["제안 받기 켜짐", "이력서 1건 공개 중"],
};
