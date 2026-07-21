export type DdayTier = "urgent" | "warning" | "neutral";

function parseDotDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split(".").map(Number);
  return new Date(y, m - 1, d);
}

/** target - reference 사이의 일수 차이를 계산한다. 두 인자 모두 "YYYY.MM.DD" 형식. */
export function getDaysUntil(targetDate: string, referenceDate: string): number {
  return Math.round(
    (parseDotDate(targetDate).getTime() - parseDotDate(referenceDate).getTime()) / 86400000,
  );
}

/** 일수 차이를 D-DAY / D-n / D+n 라벨로 변환한다. */
export function formatDday(daysLeft: number): string {
  if (daysLeft === 0) return "D-DAY";
  if (daysLeft > 0) return `D-${daysLeft}`;
  return `D+${Math.abs(daysLeft)}`;
}

export function getDdayTier(daysLeft: number): DdayTier {
  if (daysLeft <= 2) return "urgent";
  if (daysLeft <= 7) return "warning";
  return "neutral";
}

/** target 날짜를 reference 날짜 기준으로 파생한 D-day 정보 묶음. */
export function getDdayInfo(targetDate: string, referenceDate: string) {
  const daysLeft = getDaysUntil(targetDate, referenceDate);
  return { daysLeft, label: formatDday(daysLeft), tier: getDdayTier(daysLeft) };
}

/** "YYYY.MM.DD"를 화면 표시용 "MM.DD"로 축약한다. */
export function toMonthDay(dateStr: string): string {
  const [, m, d] = dateStr.split(".");
  return `${m}.${d}`;
}
