import type { StatusTone } from "@/config/statusTone";
import type { JobTrack } from "@/types/jobs";
import type { BoostGrade } from "@/data/boostPricing";
import { MOCK_TODAY_DATE } from "@/config/mockToday";

// ── 요금제 관리 (부스트 현황) ──────────────────────────────────────────────

export type BoostStatus = "active" | "ending_soon" | "ended";

export interface ActiveBoost {
  id: string;
  jobId: string;
  jobTitle: string;
  track: JobTrack;
  grade: BoostGrade;
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

/**
 * 상태색 3단 원칙 — 회색(ended) = 종료, 파랑(progress) = 진행 중, 초록 = 완료·결과.
 * 이 표에는 결과 상태가 없어 초록이 나오지 않는다.
 * 종료 임박(urgent)만 3단 밖 — 진행 축이 아니라 시간 압박 축이라 D-day 계열과 같은 성격이다.
 *
 * 이 표는 점을 렌더하지 않으므로 StatusPill이 아니라 STATUS_TONE의 text만 쓴다.
 * 굵기(font-medium)는 호출부가 정한다 — 색 매핑에 굵기를 섞지 않는다.
 */
export const BOOST_TONE: Record<BoostStatus, StatusTone> = {
  active: "progress",
  ending_soon: "urgent",
  ended: "ended",
};

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
    jobId: "job-3",
    jobTitle: "임상개발 PM 채용",
    track: "industry",
    grade: "standard",
    status: "ending_soon",
    daysLeft: 2,
    durationWeeks: 4,
    endDate: "2026.07.21",
    amountKrw: 700000,
  },
  {
    id: "boost-2",
    jobId: "job-2",
    jobTitle: "제제연구 선임연구원 모집",
    track: "research",
    grade: "standard",
    status: "active",
    daysLeft: 9,
    durationWeeks: 2,
    endDate: "2026.07.28",
    amountKrw: 490000,
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

export interface BillingCardInfo {
  issuer: string;
  maskedNo: string; // "**** 1234"
  installment: string; // "일시불" 등
}

export interface BillingServicePeriod {
  from: string;
  to: string;
}

export interface BillingRecord {
  id: string;
  paymentNo: string; // "PAY-YYYYMMDD-NNNN"
  paidAt: string; // "YYYY.MM.DD"
  paidAtTime: string; // "HH:MM"
  productName: string; // e.g. "부스트 4주"
  jobTitle: string;
  track: JobTrack;
  paymentMethod: PaymentMethod;
  amountKrw: number; // 공급가액(VAT 별도)
  status: PaymentStatus;
  /** 신용카드 결제 건만 존재. */
  cardInfo?: BillingCardInfo;
  /** 부스트 노출은 공고 마감일을 초과하지 않음 (마감일 캡). */
  servicePeriod: BillingServicePeriod;
  /** 취소 건만 존재. */
  canceledAt?: string;
  /** 취소 건만 존재. */
  refundMethod?: string;
}

export function paymentStatusLabel(status: PaymentStatus): string {
  if (status === "completed") return "결제완료";
  return "결제취소";
}

/** 결제완료는 결과(success), 결제취소는 끝난 행(ended). 이 표도 점을 렌더하지 않는다. */
export const PAYMENT_TONE: Record<PaymentStatus, StatusTone> = {
  completed: "success",
  cancelled: "ended",
};

export const billingRecords: BillingRecord[] = [
  {
    id: "pay-1",
    paymentNo: "PAY-20260626-0142",
    paidAt: "2026.06.26",
    paidAtTime: "14:32",
    productName: "부스트 4주",
    jobTitle: "임상개발 PM 채용",
    track: "industry",
    paymentMethod: "신용카드",
    amountKrw: 700000,
    status: "completed",
    cardInfo: { issuer: "신한카드", maskedNo: "**** 7743", installment: "일시불" },
    servicePeriod: { from: "2026.06.26", to: "2026.07.21" },
  },
  {
    id: "pay-2",
    paymentNo: "PAY-20260614-0089",
    paidAt: "2026.06.14",
    paidAtTime: "10:05",
    productName: "부스트 2주",
    jobTitle: "제제연구 선임연구원 모집",
    track: "research",
    paymentMethod: "계좌이체",
    amountKrw: 490000,
    status: "completed",
    servicePeriod: { from: "2026.06.14", to: "2026.07.28" },
  },
  {
    id: "pay-3",
    paymentNo: "PAY-20260505-0031",
    paidAt: "2026.05.05",
    paidAtTime: "19:47",
    productName: "부스트 1주",
    jobTitle: "QC 분석원 채용",
    track: "industry",
    paymentMethod: "간편결제",
    amountKrw: 350000,
    status: "cancelled",
    servicePeriod: { from: "2026.05.05", to: "2026.05.12" },
    canceledAt: "2026.05.07",
    refundMethod: "간편결제 승인 취소",
  },
];

/** "YYYY.MM.DD" 문자열 → Date */
export function parseKoDate(s: string): Date {
  const [y, m, d] = s.split(".").map(Number);
  return new Date(y, m - 1, d);
}

export function filterBillingRecords(
  records: BillingRecord[],
  period: BillingPeriod,
  statusFilter: PaymentStatusFilter,
): BillingRecord[] {
  const now = MOCK_TODAY_DATE;
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
