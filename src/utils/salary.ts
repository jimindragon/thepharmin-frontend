import type { JobWorkShift, ResearchSalaryInfo, SalaryDetail } from "@/types/jobs";

/**
 * 원 단위 숫자를 화면 표시용 문자열로 변환한다.
 * 만원 단위로 나누어지는 금액(예: 2,400,000)은 "240만원"으로, 그렇지 않은 금액(예: 32,000)은
 * "32,000원"으로 표시해 시급처럼 작은 단위의 금액이 "3만원"으로 뭉개지지 않도록 한다.
 */
export function formatWon(amount: number): string {
  if (amount > 0 && amount % 10000 === 0) {
    return `${(amount / 10000).toLocaleString("ko-KR")}만원`;
  }

  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatRange(min?: number, max?: number) {
  if (min != null && max != null && min !== max) {
    return `${formatWon(min)}~${formatWon(max)}`;
  }

  const single = min ?? max;
  return single != null ? formatWon(single) : undefined;
}

export interface FormattedSalary {
  /** "시급 32,000~37,000원" 형태의 기본 급여 줄 */
  primary: string;
  /** 평일/주말 차등처럼 기본 급여 아래 별도 줄로 보여줄 안내 */
  diff?: string;
  /** 명절 상여 없음 등 비고 */
  note?: string;
}

export function formatSalaryDetail(detail: SalaryDetail): FormattedSalary {
  if (detail.kind === "면접후결정") {
    return { primary: "면접 후 결정", note: detail.note };
  }

  const range = formatRange(detail.min, detail.max);
  const primary = range ? `${detail.kind} ${range}` : detail.kind;

  const diffParts: string[] = [];
  if (detail.weekdayNet != null) {
    diffParts.push(`평일 세후 ${formatWon(detail.weekdayNet)}`);
  }
  if (detail.weekendNet != null) {
    diffParts.push(`주말 세후 ${formatWon(detail.weekendNet)}`);
  }

  return {
    primary,
    diff: diffParts.length ? diffParts.join(" · ") : undefined,
    note: detail.note,
  };
}

function formatManwonRange(min?: number, max?: number) {
  if (min != null && max != null && min !== max) {
    return `${min.toLocaleString("ko-KR")}만~${max.toLocaleString("ko-KR")}만원`;
  }

  const single = min ?? max;
  return single != null ? `${single.toLocaleString("ko-KR")}만원` : undefined;
}

/** 시급 환산 결과의 신뢰 수준 */
export type HourlyStatus =
  | "exact"       // 이미 시급 — 그대로 사용
  | "estimated"   // weeklyHours 기반 환산 — "약 시급 ○○원(추정)" 표시 권장
  | "unavailable"; // 환산 불가 — 금액 없음 또는 필요 데이터 부족

export interface HourlyResult {
  status: HourlyStatus;
  /** 환산된 최소 시급 (원 단위) */
  min?: number;
  /** 환산된 최대 시급 (원 단위) */
  max?: number;
  /** kind=시급인 경우 평일 세후 시급 */
  weekday?: number;
  /** kind=시급인 경우 주말 세후 시급 */
  weekend?: number;
}

/**
 * 임의 급여 형태를 시급으로 환산한다.
 * - 시급 → exact, 그대로 반환
 * - 월급/연봉 + weeklyHours → estimated, 공식으로 환산
 * - 일급은 1일 근무시간이 필요하므로 weeklyHours만으로는 환산 불가
 * - 면접후결정 또는 weeklyHours 없음 → unavailable
 *
 * @param _shifts 향후 1일 근무시간 자동 추출 확장용 (현재 미사용)
 */
export function convertToHourly(salary: SalaryDetail, _shifts?: JobWorkShift[]): HourlyResult {
  if (salary.kind === "시급") {
    return {
      status: "exact",
      min: salary.min,
      max: salary.max,
      weekday: salary.weekdayNet,
      weekend: salary.weekendNet,
    };
  }

  if (salary.kind === "면접후결정" || !salary.weeklyHours) {
    return { status: "unavailable" };
  }

  const wh = salary.weeklyHours;

  if (salary.kind === "월급") {
    return {
      status: "estimated",
      min: salary.min != null ? Math.round(salary.min / (wh * 4.345)) : undefined,
      max: salary.max != null ? Math.round(salary.max / (wh * 4.345)) : undefined,
    };
  }

  if (salary.kind === "연봉") {
    return {
      status: "estimated",
      min: salary.min != null ? Math.round(salary.min / (wh * 52)) : undefined,
      max: salary.max != null ? Math.round(salary.max / (wh * 52)) : undefined,
    };
  }

  // 일급: 1일 근무시간을 shifts 자유 텍스트에서 신뢰성 있게 추출 불가 → 환산 생략
  return { status: "unavailable" };
}

/**
 * 연구직 급여(만원 단위로 저장된 연봉 구간 또는 면접 후 협의)를 화면 표시용 문자열로 변환한다.
 * 연구비·과제 지원 정보(funding)는 급여와 별도 정보이므로 이 함수에서는 다루지 않는다.
 */
export function formatResearchSalaryInfo(info: ResearchSalaryInfo): FormattedSalary {
  if (info.kind === "협의") {
    return { primary: "면접 시 협의", note: info.note };
  }

  const range = formatManwonRange(info.min, info.max);

  return {
    primary: range ? `연봉 ${range}` : "연봉 협의",
    note: info.note,
  };
}
