export type HeadhuntingRequestStatus = "consulting" | "sourcing" | "interviewing" | "completed" | "on_hold";

export interface HeadhuntingRequest {
  id: string;
  positionTitle: string;
  jobCategory: string;
  status: HeadhuntingRequestStatus;
  requestedAt: string;
  manager: string;
  headcount: number;
  recommendedCandidateCount: number;
}

export const headhuntingRequests: HeadhuntingRequest[] = [
  {
    id: "hh-1",
    positionTitle: "임상개발 PM (CRA 총괄)",
    jobCategory: "임상·CRA",
    status: "interviewing",
    requestedAt: "2026.05.20",
    manager: "이수진",
    headcount: 1,
    recommendedCandidateCount: 3,
  },
  {
    id: "hh-2",
    positionTitle: "RA 팀장급 (허가 전략)",
    jobCategory: "RA·허가",
    status: "sourcing",
    requestedAt: "2026.06.02",
    manager: "박준혁",
    headcount: 1,
    recommendedCandidateCount: 2,
  },
  {
    id: "hh-3",
    positionTitle: "생산 QA 책임자",
    jobCategory: "QA·QC",
    status: "consulting",
    requestedAt: "2026.06.15",
    manager: "이수진",
    headcount: 1,
    recommendedCandidateCount: 0,
  },
  {
    id: "hh-4",
    positionTitle: "PV 담당 시니어",
    jobCategory: "PV·안전성",
    status: "completed",
    requestedAt: "2026.04.10",
    manager: "박준혁",
    headcount: 1,
    recommendedCandidateCount: 1,
  },
  {
    id: "hh-5",
    positionTitle: "R&D 신약개발 책임연구원",
    jobCategory: "R&D",
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
  status: HeadhuntingCandidateStatus;
  recommendedAt: string;
}

export const headhuntingCandidates: HeadhuntingCandidate[] = [
  { id: "cand-1", code: "CAND-014", matchedRequestId: "hh-1", experienceSummary: "임상CRO 9년 · CRA 팀 리드 경력", status: "interview_scheduled", recommendedAt: "2026.06.10" },
  { id: "cand-2", code: "CAND-021", matchedRequestId: "hh-1", experienceSummary: "글로벌 제약사 임상운영 7년", status: "interview_proposed", recommendedAt: "2026.06.12" },
  { id: "cand-3", code: "CAND-030", matchedRequestId: "hh-1", experienceSummary: "바이오텍 임상개발 PM 6년", status: "recommended", recommendedAt: "2026.06.18" },
  { id: "cand-4", code: "CAND-008", matchedRequestId: "hh-2", experienceSummary: "RA 11년 · 식약처 허가 다수 경험", status: "recommended", recommendedAt: "2026.06.05" },
  { id: "cand-5", code: "CAND-009", matchedRequestId: "hh-2", experienceSummary: "글로벌 RA 8년 · 해외 허가 전문", status: "offer", recommendedAt: "2026.06.08" },
  { id: "cand-6", code: "CAND-045", matchedRequestId: "hh-4", experienceSummary: "PV 시니어 10년", status: "hired", recommendedAt: "2026.04.22" },
];

export function headhuntingStatusLabel(status: HeadhuntingRequestStatus) {
  if (status === "consulting") return "상담중";
  if (status === "sourcing") return "후보자 탐색중";
  if (status === "interviewing") return "면접 진행중";
  if (status === "completed") return "채용 완료";
  return "보류";
}

export function headhuntingStatusClass(status: HeadhuntingRequestStatus) {
  if (status === "consulting") return "border-[#dfe4ea] bg-[#f7f8fa] text-[#596373]";
  if (status === "sourcing") return "border-[#bfe7e2] bg-[#eafbf8] text-[#00746c]";
  if (status === "interviewing") return "border-[#bfe7e2] bg-[#eafbf8] text-[#00746c]";
  if (status === "completed") return "border-[#cfd8e3] bg-[#f7f8fa] text-[#303946]";
  return "border-[#f1dcb7] bg-[#fff9ef] text-[#9a6500]";
}

export function candidateStatusLabel(status: HeadhuntingCandidateStatus) {
  if (status === "recommended") return "추천됨";
  if (status === "interview_proposed") return "면접 제안";
  if (status === "interview_scheduled") return "면접 확정";
  if (status === "offer") return "처우 협의";
  if (status === "hired") return "입사 확정";
  return "보류";
}

export function candidateStatusClass(status: HeadhuntingCandidateStatus) {
  if (status === "recommended") return "border-[#dfe4ea] bg-[#f7f8fa] text-[#596373]";
  if (status === "interview_proposed") return "border-[#bfe7e2] bg-[#eafbf8] text-[#00746c]";
  if (status === "interview_scheduled") return "border-[#bfe7e2] bg-[#eafbf8] text-[#00746c]";
  if (status === "offer") return "border-[#f1dcb7] bg-[#fff9ef] text-[#9a6500]";
  if (status === "hired") return "border-[#111111] bg-[#111111] text-white";
  return "border-[#ead8d3] bg-[#fffafa] text-[#a43f31]";
}
