import type { JobWorkShift, PayType, SalaryDetail, SalaryRange } from "@/types/jobs";

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
 * 시급 환산이 가능한 급여 종류.
 * SalaryDetail.kind("면접후결정")와 공고 등록 폼의 SalaryKind("면접 후 결정")는 리터럴이 서로 달라
 * 직접 공유할 수 없다. 환산 계산에 실제로 필요한 4종만 따로 정의해 양쪽이 이 타입으로 좁혀 넘긴다.
 */
export type HourlyConvertibleKind = "시급" | "일급" | "월급" | "연봉";

/** 월 환산 계수 — 1개월 평균 주수 */
const WEEKS_PER_MONTH = 4.345;
/** 연 환산 계수 — 1년 주수 */
const WEEKS_PER_YEAR = 52;

/**
 * 급여 금액을 시급(원 단위)으로 환산하는 순수 계산 함수. 환산식과 계수는 여기에만 존재한다.
 * 문자열 파싱과 만원→원 단위 변환은 호출부 책임이므로 amount에는 원 단위 숫자만 넘긴다.
 *
 * @param kind 급여 종류
 * @param amount 원 단위 금액
 * @param hours 일급이면 1일 근무시간, 월급·연봉이면 주당 근무시간. 시급은 불필요
 * @returns 환산 시급(원 단위). 환산 불가면 null
 */
export function hourlyFromAmount(kind: HourlyConvertibleKind, amount: number, hours?: number): number | null {
  if (kind === "시급") return amount;
  if (hours == null || hours <= 0) return null;

  if (kind === "일급") return Math.round(amount / hours);
  if (kind === "월급") return Math.round(amount / (hours * WEEKS_PER_MONTH));
  if (kind === "연봉") return Math.round(amount / (hours * WEEKS_PER_YEAR));

  return null;
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
      min: salary.min != null ? (hourlyFromAmount("월급", salary.min, wh) ?? undefined) : undefined,
      max: salary.max != null ? (hourlyFromAmount("월급", salary.max, wh) ?? undefined) : undefined,
    };
  }

  if (salary.kind === "연봉") {
    return {
      status: "estimated",
      min: salary.min != null ? (hourlyFromAmount("연봉", salary.min, wh) ?? undefined) : undefined,
      max: salary.max != null ? (hourlyFromAmount("연봉", salary.max, wh) ?? undefined) : undefined,
    };
  }

  // 일급: 1일 근무시간을 shifts 자유 텍스트에서 신뢰성 있게 추출 불가 → 환산 생략
  return { status: "unavailable" };
}

const HOSPITAL_PAY_TYPE_LABELS: Record<PayType, string> = {
  annual: "연봉",
  monthly: "월급",
  hourly: "시급",
  daily: "일급",
};

/**
 * 병원 트랙 급여 표시용 문자열.
 * salaryRange가 없으면(또는 min/max가 모두 비어 있으면) salaryNote를 접두어 없이 단독 표기하고,
 * salaryNote도 없으면 "면접 후 결정"으로 표시한다. salaryRange가 있으면 금액 표기 뒤에 salaryNote를 " · "로 병기한다.
 */
export function formatHospitalSalary(salaryRange: SalaryRange | null | undefined, salaryNote?: string): string {
  const label = salaryRange ? HOSPITAL_PAY_TYPE_LABELS[salaryRange.payType] : undefined;
  const { min, max } = salaryRange ?? {};

  if (!label || (min == null && max == null)) {
    return salaryNote ?? "면접 후 결정";
  }

  let base: string;
  if (min != null && max != null && min !== max) {
    base = `${label} ${min.toLocaleString("ko-KR")}~${max.toLocaleString("ko-KR")}만원`;
  } else if (min != null) {
    base = max != null ? `${label} ${min.toLocaleString("ko-KR")}만원` : `${label} ${min.toLocaleString("ko-KR")}만원 이상`;
  } else {
    base = `${label} ${max!.toLocaleString("ko-KR")}만원 이하`;
  }

  return salaryNote ? `${base} · ${salaryNote}` : base;
}
