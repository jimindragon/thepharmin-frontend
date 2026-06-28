import type { JobTrack } from "@/types/jobs";

// ── 요금제 관리 (부스트 현황) ──────────────────────────────────────────────

export type BoostStatus = "active" | "ending_soon" | "ended";

export interface ActiveBoost {
  id: string;
  jobTitle: string;
  track: JobTrack;
  status: BoostStatus;
  daysLeft: number;
  durationWeeks: number;
  endDate: string;
  amountKrw: number;
}

export interface BillingStats {
  activeBoostCount: number;
  monthlyPaymentKrw: number;
  cumulativeBoostCount: number;
}

export function boostStatusLabel(status: BoostStatus, daysLeft: number): string {
  if (status === "ending_soon") return `D-${daysLeft} 종료 임박`;
  if (status === "active") return `D-${daysLeft} 진행 중`;
  return "종료";
}

export function boostStatusClass(status: BoostStatus): string {
  if (status === "ending_soon") return "text-status-urgent font-semibold";
  if (status === "active") return "text-status-positive font-semibold";
  return "text-[#8a94a3]";
}

export function boostTrackLabel(track: JobTrack): string {
  const labels: Record<JobTrack, string> = {
    industry: "산업",
    research: "연구",
    hospital: "병원",
    pharmacy: "약국",
  };
  return labels[track];
}

export const activeBoosts: ActiveBoost[] = [
  {
    id: "boost-1",
    jobTitle: "임상개발 PM 채용",
    track: "industry",
    status: "ending_soon",
    daysLeft: 2,
    durationWeeks: 4,
    endDate: "2026.07.21",
    amountKrw: 259000,
  },
  {
    id: "boost-2",
    jobTitle: "제제연구 선임연구원 모집",
    track: "research",
    status: "active",
    daysLeft: 9,
    durationWeeks: 2,
    endDate: "2026.07.28",
    amountKrw: 148000,
  },
];

export const billingStats: BillingStats = {
  activeBoostCount: activeBoosts.length,
  monthlyPaymentKrw: activeBoosts.reduce((sum, b) => sum + b.amountKrw, 0),
  cumulativeBoostCount: 5,
};

// ── 결제 내역 ──────────────────────────────────────────────────────────────

export type PaymentStatus = "completed" | "cancelled";
export type PaymentMethod = "신용카드" | "계좌이체" | "간편결제";
export type BillingPeriod = "1month" | "3months" | "6months" | "1year";
export type PaymentStatusFilter = "all" | PaymentStatus;

export interface BillingRecord {
  id: string;
  paidAt: string; // "YYYY.MM.DD"
  productName: string; // e.g. "부스트 4주"
  jobTitle: string;
  track: JobTrack;
  paymentMethod: PaymentMethod;
  amountKrw: number;
  status: PaymentStatus;
}

export function paymentStatusLabel(status: PaymentStatus): string {
  if (status === "completed") return "결제완료";
  return "결제취소";
}

export function paymentStatusClass(status: PaymentStatus): string {
  if (status === "completed") return "border-status-positive-border bg-status-positive-subtle text-status-positive";
  return "border-[#d8dee7] bg-[#f7f8fa] text-[#8a94a3]";
}

export const billingRecords: BillingRecord[] = [
  {
    id: "pay-1",
    paidAt: "2026.06.26",
    productName: "부스트 4주",
    jobTitle: "임상개발 PM 채용",
    track: "industry",
    paymentMethod: "신용카드",
    amountKrw: 259000,
    status: "completed",
  },
  {
    id: "pay-2",
    paidAt: "2026.06.14",
    productName: "부스트 2주",
    jobTitle: "제제연구 선임연구원 모집",
    track: "research",
    paymentMethod: "계좌이체",
    amountKrw: 148000,
    status: "completed",
  },
  {
    id: "pay-3",
    paidAt: "2026.05.05",
    productName: "부스트 1주",
    jobTitle: "QC 분석원 채용",
    track: "industry",
    paymentMethod: "간편결제",
    amountKrw: 84000,
    status: "cancelled",
  },
];

/** "YYYY.MM.DD" 문자열 → Date */
function parseKoDate(s: string): Date {
  const [y, m, d] = s.split(".").map(Number);
  return new Date(y, m - 1, d);
}

export function filterBillingRecords(
  records: BillingRecord[],
  period: BillingPeriod,
  statusFilter: PaymentStatusFilter,
): BillingRecord[] {
  const now = new Date();
  const cutoff = new Date(now);
  if (period === "1month") cutoff.setMonth(cutoff.getMonth() - 1);
  else if (period === "3months") cutoff.setMonth(cutoff.getMonth() - 3);
  else if (period === "6months") cutoff.setMonth(cutoff.getMonth() - 6);
  else cutoff.setFullYear(cutoff.getFullYear() - 1);

  return records.filter((r) => {
    const date = parseKoDate(r.paidAt);
    if (date < cutoff) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });
}

export function calcCompletedTotal(records: BillingRecord[]): number {
  return records.filter((r) => r.status === "completed").reduce((sum, r) => sum + r.amountKrw, 0);
}
