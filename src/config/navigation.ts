import type { LucideIcon } from "lucide-react";
import { Bell, Briefcase, CalendarDays, Home, MessageCircle, User, Users } from "lucide-react";

export const trackNavigationItems = [
  { label: "산업", href: "/jobs/industry" },
  { label: "연구", href: "/jobs/research" },
  { label: "병원", href: "/jobs/hospital" },
  { label: "약국", href: "/jobs/pharmacy" },
];

export const navigationItems = [
  { label: "캘린더", href: "/calendar" },
  { label: "기업 인사이트", href: "/companies" },
  { label: "QNA", href: "/qna" },
  { label: "자료실", href: "/resources" },
  { label: "헤드헌팅", href: "/headhunting/select" },
];

/**
 * ≤760px 하단 탭바 항목. 위 두 배열(데스크톱 헤더 nav 9개)과 목적이 달라 따로 둔다 —
 * 탭바는 5칸이 상한이라 전체 메뉴가 아니라 1차 이동 경로만 고른다.
 * 아이콘을 데이터로 넘기는 방식은 job-detail/shared.tsx의 LucideIcon 선례를 따랐다.
 */
export interface MobileTabItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** 이 prefix 중 하나로 시작하면 활성. 홈은 정확히 "/"만. */
  activePrefixes: string[];
}

export const mobileTabItems: MobileTabItem[] = [
  { label: "홈", href: "/", icon: Home, activePrefixes: [] },
  { label: "공고", href: "/jobs", icon: Briefcase, activePrefixes: ["/jobs"] },
  { label: "QNA", href: "/qna", icon: MessageCircle, activePrefixes: ["/qna"] },
  { label: "캘린더", href: "/calendar", icon: CalendarDays, activePrefixes: ["/calendar"] },
  { label: "MY", href: "/mypage/dashboard", icon: User, activePrefixes: ["/mypage"] },
];

/**
 * 기업센터(/business/*) 하단 탭바 항목. 개인 mobileTabItems와 같은 타입을 쓰되 배열은 나눈다 —
 * 두 영역은 세션도(개인/기업 쿠키) 목적지도 겹치지 않아 한 배열로 합칠 수 있는 지점이 없다.
 *
 * 5칸 구성 근거: 기업센터 사이드바가 ≤1040px에서 가로 스트립으로 무너지면 6개 그룹 중
 * 1~2개만 노출되고("계정" 그룹은 전 폭 0%), 헤더 nav는 1279px 아래로 통째로 사라진다.
 * 그래서 탭바가 실질적인 1차 동선이 된다.
 *
 * 헤드헌팅은 6순위로 뺐다 — 대시보드 "지금 확인할 일" 카드에 진입 링크가 이미 있고,
 * 5칸을 넘기면 ≤360px에서 라벨이 두 줄로 깨진다.
 *
 * MY의 activePrefixes가 긴 이유 — 기업정보 관리는 트랙별로 라우트가 갈라져 있어
 * (company/industry/hospital/pharmacy/research) 어디에 있든 MY가 켜져 있어야 한다.
 */
export const businessTabItems: MobileTabItem[] = [
  { label: "홈", href: "/business/dashboard", icon: Home, activePrefixes: ["/business/dashboard"] },
  { label: "공고", href: "/business/jobs", icon: Briefcase, activePrefixes: ["/business/jobs"] },
  { label: "지원자", href: "/business/applicants", icon: Users, activePrefixes: ["/business/applicants"] },
  { label: "알림", href: "/business/notifications", icon: Bell, activePrefixes: ["/business/notifications"] },
  {
    label: "MY",
    href: "/business/profile-hub",
    icon: User,
    activePrefixes: [
      "/business/profile-hub",
      "/business/billing",
      "/business/company",
      "/business/industry",
      "/business/hospital",
      "/business/pharmacy",
      "/business/research",
    ],
  },
];
