export interface BusinessCenterMenuItem {
  label: string;
  href: string;
}

export interface BusinessCenterMenuGroup {
  title: string;
  items: BusinessCenterMenuItem[];
}

/**
 * 기업센터 좌측 사이드바(BusinessSidebar)와 헤더의 기업 프로필 드롭다운이
 * 공유하는 메뉴 구성. 한 곳에서만 정의해 두 위치의 메뉴/라우트가 항상 일치하도록 한다.
 */
export const businessCenterHomeItem: BusinessCenterMenuItem = { label: "대시보드", href: "/business/dashboard" };

export const businessCenterMenuGroups: BusinessCenterMenuGroup[] = [
  {
    title: "채용관리",
    items: [
      { label: "공고 등록", href: "/business/jobs/new" },
      { label: "공고 관리", href: "/business/jobs" },
      { label: "지원자 관리", href: "/business/applicants" },
    ],
  },
  {
    title: "헤드헌팅",
    items: [
      { label: "의뢰 등록", href: "/business/headhunting/manage/new" },
      { label: "의뢰 관리", href: "/business/headhunting/manage" },
    ],
  },
  {
    title: "기업관리",
    items: [
      { label: "기업정보 관리", href: "/business/company/profile" },
      { label: "브랜드 페이지 미리보기", href: "/business/company/preview" },
    ],
  },
  {
    title: "요금제/결제",
    items: [
      { label: "요금제 관리", href: "/business/billing/plans" },
      { label: "결제 내역", href: "/business/billing/history" },
    ],
  },
];
