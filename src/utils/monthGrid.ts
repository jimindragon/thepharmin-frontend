/**
 * 월간 캘린더 그리드용 순수 날짜 유틸.
 * RecruitmentCalendarClient.tsx에 인라인돼 있던 로직을 공용 유틸로 추출한 것으로,
 * 채용 캘린더와 대시보드 미니 캘린더가 동일한 월 계산을 공유하도록 한다.
 */

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function buildMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const start = new Date(year, month, 1 - firstDay.getDay());
  const end = new Date(year, month + 1, lastDay.getDay() === 6 ? 0 : 6 - lastDay.getDay());
  const days: Date[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}
