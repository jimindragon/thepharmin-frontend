import { MOCK_TODAY_DATE } from "@/config/mockToday";
import type { Job } from "@/types/jobs";

export type DdayTier = "urgent" | "warning" | "neutral";

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function parseDotDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split(".").map(Number);
  return new Date(y, m - 1, d);
}

/** "YYYY-MM-DD"(jobs.ts의 Job.deadline 형식)를 로컬 Date로 변환한다. parseDotDate와 달리 대시 구분자용. */
function parseIsoDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * jobs.ts 일부 레코드(주로 연구 트랙)는 closingStatus가 "dDay"인데도 구조화된 deadline 필드가 비어 있고
 * deadlineDate 자유 텍스트("2026년 7월 30일 마감" 등)에만 실제 날짜가 있다. 이 텍스트에서 날짜를 뽑아낸다.
 * 매치 실패(예: "채용 시 마감"처럼 날짜가 아예 없는 경우)면 null.
 */
function parseDeadlineDateText(text: string): Date | null {
  const match = text.match(/(\d{4})[.년]\s*(\d{1,2})[.월]\s*(\d{1,2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

/** "YYYY.MM.DD"를 "YYYY년 M월 D일 X요일"로 변환한다. */
export function formatKoreanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split(".").map(Number);
  const date = parseDotDate(dateStr);
  return `${y}년 ${m}월 ${d}일 ${WEEKDAY_LABELS[date.getDay()]}요일`;
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

/**
 * MOCK_TODAY_DATE 기준으로 Job의 남은 일수를 계산한다.
 * "always"(상시채용)거나 deadline이 없으면 D-day 개념이 없으므로 null.
 * 음수는 이미 마감 지난 일수(예: -3 = 3일 전 마감).
 */
export function getJobDaysLeft(job: Job): number | null {
  if (job.closingStatus === "always") return null;

  const deadlineDate = job.deadline ? parseIsoDate(job.deadline) : parseDeadlineDateText(job.deadlineDate);
  if (!deadlineDate) return null;

  return Math.round((deadlineDate.getTime() - MOCK_TODAY_DATE.getTime()) / 86400000);
}

/**
 * jobs.ts의 손입력 deadlineLabel(기준일이 항목마다 제각각이라 신뢰 불가) 대신
 * raw deadline + closingStatus에서 MOCK_TODAY_DATE 기준으로 파생한 표시 문구.
 * "마감 " 접두어 없이 뱃지에 바로 쓸 수 있는 형태를 반환한다.
 */
export function formatJobDeadlineLabel(job: Job): string {
  if (job.closingStatus === "always") return "상시채용";

  const daysLeft = getJobDaysLeft(job);
  if (daysLeft === null) return "상시채용";
  if (job.closingStatus === "today" || daysLeft === 0) return "오늘 마감";
  if (daysLeft < 0) return "마감";
  return `D-${daysLeft}`;
}

/** JobCard의 긴급(빨강) 표시 조건: 오늘 마감이거나 마감 7일 이내(이미 지난 건 제외). 기존 `deadlineOrder <= 7` 조건과 동일한 의미를 실제 날짜로 재현한다. */
export function isJobDeadlineUrgent(job: Job): boolean {
  if (job.closingStatus === "today") return true;
  const daysLeft = getJobDaysLeft(job);
  return daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
}

/**
 * 목록 정렬용 비교자. 기존 deadlineOrder 오름차순 정렬(작을수록 우선)의 의미를 그대로 재현하되,
 * 이미 마감 지난 공고를 맨 뒤로 보내는 3단계 우선순위를 추가한다:
 * 0) 마감 임박 오름차순(D-day 작은 순) → 1) 상시채용 → 2) 이미 마감(최근 마감분 우선)
 */
export function compareJobsByDeadline(a: Job, b: Job): number {
  const tierOf = (job: Job): [number, number] => {
    const daysLeft = getJobDaysLeft(job);
    if (daysLeft === null) return [1, 0];
    if (daysLeft < 0) return [2, -daysLeft];
    return [0, daysLeft];
  };

  const [tierA, orderA] = tierOf(a);
  const [tierB, orderB] = tierOf(b);
  if (tierA !== tierB) return tierA - tierB;
  return orderA - orderB;
}
