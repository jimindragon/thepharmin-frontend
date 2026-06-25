import type { ResearchSalaryInfo, SalaryDetail } from "@/types/jobs";

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
