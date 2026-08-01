import type { StatusTone } from "@/config/statusTone";
import { industryJobCategoryOptions } from "@/config/jobFilters";

export type HeadhuntingRequestStatus = "consulting" | "sourcing" | "interviewing" | "completed" | "on_hold";

export interface HeadhuntingRequest {
  id: string;
  positionTitle: string;
  jobCategoryId: string;
  jobSubcategoryId: string;
  status: HeadhuntingRequestStatus;
  requestedAt: string;
  manager: string;
  headcount: number;
  recommendedCandidateCount: number;
}

export function headhuntingJobCategoryLabel(jobCategoryId: string): string {
  return industryJobCategoryOptions.find((category) => category.id === jobCategoryId)?.label ?? jobCategoryId;
}

export function headhuntingJobSubcategoryLabel(jobCategoryId: string, jobSubcategoryId: string): string {
  const category = industryJobCategoryOptions.find((c) => c.id === jobCategoryId);
  return category?.subcategories.find((sub) => sub.id === jobSubcategoryId)?.label ?? jobSubcategoryId;
}

export const headhuntingRequests: HeadhuntingRequest[] = [
  {
    id: "hh-1",
    positionTitle: "임상개발 PM (CRA 총괄)",
    jobCategoryId: "clinical",
    jobSubcategoryId: "cra",
    status: "interviewing",
    requestedAt: "2026.05.20",
    manager: "이수진",
    headcount: 1,
    recommendedCandidateCount: 3,
  },
  {
    id: "hh-2",
    positionTitle: "RA 팀장급 (허가 전략)",
    jobCategoryId: "regulatory",
    jobSubcategoryId: "ra",
    status: "sourcing",
    requestedAt: "2026.06.02",
    manager: "박준혁",
    headcount: 1,
    recommendedCandidateCount: 2,
  },
  {
    id: "hh-3",
    positionTitle: "생산 QA 책임자",
    jobCategoryId: "production-quality",
    jobSubcategoryId: "qa",
    status: "consulting",
    requestedAt: "2026.06.15",
    manager: "이수진",
    headcount: 1,
    recommendedCandidateCount: 0,
  },
  {
    id: "hh-4",
    positionTitle: "PV 담당 시니어",
    jobCategoryId: "pharmacy-safety",
    jobSubcategoryId: "pv-drug-safety",
    status: "completed",
    requestedAt: "2026.04.10",
    manager: "박준혁",
    headcount: 1,
    recommendedCandidateCount: 1,
  },
  {
    id: "hh-5",
    positionTitle: "R&D 신약개발 책임연구원",
    jobCategoryId: "rd",
    jobSubcategoryId: "new-drug",
    status: "on_hold",
    requestedAt: "2026.03.28",
    manager: "이수진",
    headcount: 1,
    recommendedCandidateCount: 0,
  },
];

export type HeadhuntingCandidateStatus = "recommended" | "interview_proposed" | "interview_scheduled" | "offer" | "hired" | "declined";

export interface HeadhuntingCandidate {
  id: string;
  code: string;
  matchedRequestId: string;
  experienceSummary: string;
  fitScore: number;
  fitMet: number;
  fitTotal: number;
  status: HeadhuntingCandidateStatus;
  recommendedAt: string;
}

export const headhuntingCandidates: HeadhuntingCandidate[] = [
  { id: "cand-1", code: "CAND-014", matchedRequestId: "hh-1", experienceSummary: "임상CRO 9년 · CRA 팀 리드 경력", fitScore: 90, fitMet: 4, fitTotal: 5, status: "interview_scheduled", recommendedAt: "2026.06.10" },
  { id: "cand-2", code: "CAND-021", matchedRequestId: "hh-1", experienceSummary: "글로벌 제약사 임상운영 7년", fitScore: 82, fitMet: 4, fitTotal: 5, status: "interview_proposed", recommendedAt: "2026.06.12" },
  { id: "cand-3", code: "CAND-030", matchedRequestId: "hh-1", experienceSummary: "바이오텍 임상개발 PM 6년", fitScore: 74, fitMet: 3, fitTotal: 5, status: "recommended", recommendedAt: "2026.06.18" },
  { id: "cand-4", code: "CAND-008", matchedRequestId: "hh-2", experienceSummary: "RA 11년 · 식약처 허가 다수 경험", fitScore: 88, fitMet: 4, fitTotal: 5, status: "recommended", recommendedAt: "2026.06.05" },
  { id: "cand-5", code: "CAND-009", matchedRequestId: "hh-2", experienceSummary: "글로벌 RA 8년 · 해외 허가 전문", fitScore: 85, fitMet: 4, fitTotal: 5, status: "offer", recommendedAt: "2026.06.08" },
  { id: "cand-6", code: "CAND-045", matchedRequestId: "hh-4", experienceSummary: "PV 시니어 10년", fitScore: 91, fitMet: 4, fitTotal: 5, status: "hired", recommendedAt: "2026.04.22" },
];

export function headhuntingStatusLabel(status: HeadhuntingRequestStatus): string {
  if (status === "consulting") return "상담중";
  if (status === "sourcing") return "후보자 탐색중";
  if (status === "interviewing") return "면접 진행중";
  if (status === "completed") return "채용 완료";
  return "보류";
}

/**
 * 상태색 3단 원칙 — 회색(idle) = 진행 안 함, 파랑(progress) = 진행 중,
 * 초록(success) = 완료·긍정 결과. 아래 후보자 맵도 같은 원칙을 따른다.
 * 진행 상태에 초록을 쓰면 완료가 묻히고, 멈춘 상태에 파랑을 쓰면 진행 중과 섞인다.
 *
 * 실제 색 문자열은 statusTone.ts의 STATUS_TONE에만 있다 — 여기는 "성격" 매핑만 든다.
 */
export const HEADHUNTING_REQUEST_TONE: Record<HeadhuntingRequestStatus, StatusTone> = {
  consulting: "idle",
  sourcing: "progress",
  interviewing: "progress",
  completed: "success",
  on_hold: "idle", // 보류 — 진행이 멈춘 상태라 중립
};

export function candidateStatusLabel(status: HeadhuntingCandidateStatus): string {
  if (status === "recommended") return "추천됨";
  if (status === "interview_proposed") return "면접 제안";
  if (status === "interview_scheduled") return "면접 확정";
  if (status === "offer") return "처우 협의";
  if (status === "hired") return "입사 확정";
  return "보류";
}

export const HEADHUNTING_CANDIDATE_TONE: Record<HeadhuntingCandidateStatus, StatusTone> = {
  recommended: "idle",
  interview_proposed: "progress",
  interview_scheduled: "progress",
  offer: "progress",
  hired: "success",
  declined: "idle",
};
