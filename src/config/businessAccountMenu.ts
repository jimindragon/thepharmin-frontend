import { businessCenterMenuGroups, type BusinessCenterMenuItem } from "@/config/businessCenterMenu";

/**
 * 헤더 계정 드롭다운에만 노출하는 경로.
 *
 * 기업 드롭다운이 뜨는 화면은 다수가 기업센터 사이드바를 함께 갖고 있어, 사이드바 12항목을
 * 그대로 복제하면 중복이면서 패널만 길어진다(792px). 드롭다운은 이 목록으로 걸러 "계정 메뉴"
 * 크기로 줄이고, 사이드바(businessCenterMenuGroups)는 12항목 전체를 그대로 유지한다.
 *
 * 뺀 7항목은 모두 다른 경로로 도달한다 — 공고/지원자/헤드헌팅은 사이드바·대시보드 "지금 확인할 일"
 * 카드·헤더 CTA(공고 등록), 브랜드 페이지 미리보기는 기관정보 관리 화면, 요금제 관리는 공고 관리 화면.
 */
const ACCOUNT_MENU_HREFS = [
  "/business/profile-hub",
  "/business/billing/history",
  "/business/notifications",
  "/business/notifications/settings",
];

/**
 * 대시보드(businessCenterHomeItem)를 뺀 나머지 4항목. businessCenterMenuGroups의 정의 순서를
 * 그대로 따르므로 사이드바 config가 바뀌어도 목록이 갈라지지 않는다.
 * 현재 실제로 렌더되는 드롭다운은 BusinessHeaders 1벌뿐이다 — SupportHeader의
 * SupportBusinessAccountMenu도 이 목록을 참조하지만, 고객센터 헤더가 개인 세션만 보게 되면서
 * 더 이상 렌더되지 않는다(컴포넌트는 코드에 남아 있음).
 */
export const businessAccountMenuItems: BusinessCenterMenuItem[] = businessCenterMenuGroups
  .flatMap((group) => group.items)
  .filter((item) => ACCOUNT_MENU_HREFS.includes(item.href));
