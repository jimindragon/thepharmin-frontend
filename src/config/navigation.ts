import type { LucideIcon } from "lucide-react";
import { Briefcase, CalendarDays, Home, MessageCircle, User } from "lucide-react";

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
