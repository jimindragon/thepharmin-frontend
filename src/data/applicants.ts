import type { StatusTone } from "@/config/statusTone";

export type ApplicantStage = "new" | "screening" | "first_interview" | "final_interview" | "offer" | "rejected";
export type ApplicantStageFilter = "all" | ApplicantStage;

export interface ApplicantJobPosting {
  id: string;
  title: string;
  category: string;
}

export interface Applicant {
  id: string;
  name: string;
  isNew: boolean;
  age: number;
  experienceYears: number;
  location: string;
  skills: string[];
  fitScore: number;
  fitMet: number;
  fitTotal: number;
  stage: ApplicantStage;
  appliedAt: string;
  daysAgo: number;
  postingId: string;
  interviewDate?: string;
  daysUntilInterview?: number;
}

export const STAGE_TABS: Array<{ id: ApplicantStageFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "new", label: "신규 지원" },
  { id: "screening", label: "서류 검토" },
  { id: "first_interview", label: "1차 면접" },
  { id: "final_interview", label: "최종 면접" },
  { id: "offer", label: "합격 제안" },
  { id: "rejected", label: "불합격" },
];

export const applicantJobPostings: ApplicantJobPosting[] = [
  { id: "ajob-1", title: "제제연구 선임연구원 모집", category: "연구" },
  { id: "ajob-2", title: "임상약리 연구원 채용", category: "임상" },
];

export const applicants: Applicant[] = [
  {
    id: "ap-1",
    name: "배기태",
    isNew: false,
    age: 36,
    experienceYears: 9,
    location: "서울",
    skills: ["제제연구", "스케일업", "이전기술"],
    fitScore: 100,
    fitMet: 5,
    fitTotal: 5,
    stage: "offer",
    appliedAt: "2026.06.18",
    daysAgo: 9,
    postingId: "ajob-1",
  },
  {
    id: "ap-2",
    name: "정수민",
    isNew: false,
    age: 34,
    experienceYears: 7,
    location: "서울",
    skills: ["제제연구", "CMC", "분석"],
    fitScore: 90,
    fitMet: 4,
    fitTotal: 5,
    stage: "final_interview",
    appliedAt: "2026.06.22",
    daysAgo: 5,
    postingId: "ajob-1",
    interviewDate: "2026.06.29",
    daysUntilInterview: 2,
  },
  {
    id: "ap-3",
    name: "문대호",
    isNew: false,
    age: 33,
    experienceYears: 6,
    location: "경기",
    skills: ["제제", "CMC", "문서"],
    fitScore: 85,
    fitMet: 4,
    fitTotal: 5,
    stage: "first_interview",
    appliedAt: "2026.06.20",
    daysAgo: 7,
    postingId: "ajob-1",
    interviewDate: "2026.06.28",
    daysUntilInterview: 1,
  },
  {
    id: "ap-4",
    name: "임소연",
    isNew: false,
    age: 38,
    experienceYears: 11,
    location: "서울",
    skills: ["제제연구", "PM", "이전기술"],
    fitScore: 80,
    fitMet: 4,
    fitTotal: 5,
    stage: "final_interview",
    appliedAt: "2026.06.17",
    daysAgo: 10,
    postingId: "ajob-1",
    interviewDate: "2026.07.02",
    daysUntilInterview: 5,
  },
  {
    id: "ap-5",
    name: "오재현",
    isNew: false,
    age: 31,
    experienceYears: 5,
    location: "경기",
    skills: ["고형제", "품질", "GMP"],
    fitScore: 70,
    fitMet: 3,
    fitTotal: 5,
    stage: "first_interview",
    appliedAt: "2026.06.21",
    daysAgo: 6,
    postingId: "ajob-1",
    interviewDate: "2026.07.01",
    daysUntilInterview: 4,
  },
  {
    id: "ap-6",
    name: "한지영",
    isNew: true,
    age: 29,
    experienceYears: 3,
    location: "인천",
    skills: ["주사제", "제제설계"],
    fitScore: 70,
    fitMet: 3,
    fitTotal: 5,
    stage: "screening",
    appliedAt: "2026.06.24",
    daysAgo: 3,
    postingId: "ajob-1",
  },
  {
    id: "ap-7",
    name: "윤가람",
    isNew: true,
    age: 30,
    experienceYears: 4,
    location: "서울",
    skills: ["고형제", "제제설계"],
    fitScore: 55,
    fitMet: 2,
    fitTotal: 5,
    stage: "new",
    appliedAt: "2026.06.26",
    daysAgo: 1,
    postingId: "ajob-1",
  },
  {
    id: "ap-8",
    name: "서나윤",
    isNew: true,
    age: 27,
    experienceYears: 2,
    location: "서울",
    skills: ["분석", "HPLC"],
    fitScore: 45,
    fitMet: 3,
    fitTotal: 5,
    stage: "screening",
    appliedAt: "2026.06.25",
    daysAgo: 2,
    postingId: "ajob-1",
  },
  {
    id: "ap-9",
    name: "조민혁",
    isNew: false,
    age: 32,
    experienceYears: 5,
    location: "경기",
    skills: ["주사제", "무균", "품질"],
    fitScore: 35,
    fitMet: 2,
    fitTotal: 5,
    stage: "rejected",
    appliedAt: "2026.06.15",
    daysAgo: 12,
    postingId: "ajob-1",
  },
  {
    id: "ap-10",
    name: "박민준",
    isNew: false,
    age: 30,
    experienceYears: 4,
    location: "서울",
    skills: ["약동학", "PK/PD", "임상"],
    fitScore: 85,
    fitMet: 4,
    fitTotal: 5,
    stage: "screening",
    appliedAt: "2026.06.23",
    daysAgo: 4,
    postingId: "ajob-2",
  },
  {
    id: "ap-11",
    name: "이지현",
    isNew: true,
    age: 28,
    experienceYears: 2,
    location: "서울",
    skills: ["임상약리", "통계"],
    fitScore: 60,
    fitMet: 3,
    fitTotal: 5,
    stage: "new",
    appliedAt: "2026.06.26",
    daysAgo: 1,
    postingId: "ajob-2",
  },
];

export function applicantStageLabel(stage: ApplicantStage): string {
  if (stage === "new") return "신규";
  if (stage === "screening") return "서류 검토";
  if (stage === "first_interview") return "1차 면접";
  if (stage === "final_interview") return "최종 면접";
  if (stage === "offer") return "합격 제안";
  return "불합격";
}

/**
 * 상태색 3단 원칙 — 회색(idle) = 진행 안 함, 파랑(progress) = 진행 중,
 * 초록(success) = 완료·긍정 결과, 빨강(danger) = 부정 결과.
 * 결과 축에서 빨강의 반대는 초록이므로 합격 제안은 초록, 불합격은 빨강으로 짝을 이룬다.
 *
 * 실제 색 문자열은 statusTone.ts의 STATUS_TONE에만 있다 — 여기는 "성격" 매핑만 든다.
 */
export const APPLICANT_STAGE_TONE: Record<ApplicantStage, StatusTone> = {
  new: "idle",
  screening: "progress",
  first_interview: "progress",
  final_interview: "progress",
  offer: "success",
  rejected: "danger",
};
