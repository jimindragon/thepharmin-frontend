import type { StatusTone } from "@/config/statusTone";
import type { JobTrack } from "@/types/jobs";
import { MOCK_TODAY } from "@/config/mockToday";

export type JobPostingStatus = "pending" | "active" | "closed";

/**
 * 상태색 3단 원칙 — 검토 대기(운영팀 심사 중)와 게시 중은 둘 다 "프로세스가 도는" 상태라
 * 같은 progress를 쓴다. 이 표에는 결과 상태가 없어 초록이 나오지 않는다.
 * 마감은 ended — 종료 행 전체 흐려짐과 같은 층의 회색이다.
 */
export const JOB_POSTING_TONE: Record<JobPostingStatus, StatusTone> = {
  pending: "progress",
  active: "progress",
  closed: "ended",
};
export type JobPostingStatusFilter = "all" | JobPostingStatus;

/** 목데이터의 D-day가 재현되는 기준일. src/config/mockToday.ts의 값을 재수출한다. */
export { MOCK_TODAY };

export interface JobPosting {
  id: string;
  title: string;
  track: JobTrack;
  registeredAt: string;
  closingDate: string | null;
  status: JobPostingStatus;
  applicantCount: number;
  boost: boolean;
}

function parseDotDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split(".").map(Number);
  return new Date(y, m - 1, d);
}

/** closingDate와 MOCK_TODAY의 날짜 차이로 D-day를 파생 계산한다. */
export function getClosingDday(closingDate: string): { daysLeft: number; isUrgent: boolean } {
  const diff = Math.round(
    (parseDotDate(closingDate).getTime() - parseDotDate(MOCK_TODAY).getTime()) / 86400000,
  );
  return { daysLeft: diff, isUrgent: diff <= 2 };
}

export function jobTrackLabel(track: JobTrack): string {
  const labels: Record<JobTrack, string> = {
    industry: "산업",
    research: "연구",
    hospital: "병원",
    pharmacy: "약국",
  };
  return labels[track];
}

export const jobPostings: JobPosting[] = [
  {
    id: "job-6",
    title: "RA Specialist (제약·바이오 인허가 담당)",
    track: "industry",
    registeredAt: "2026.06.05",
    closingDate: "2026.07.03",
    status: "closed",
    applicantCount: 0,
    boost: false,
  },
  {
    id: "job-1",
    title: "병원 약제팀 약사 채용",
    track: "hospital",
    registeredAt: "2026.06.20",
    closingDate: "2026.07.20",
    status: "active",
    applicantCount: 7,
    boost: false,
  },
  {
    id: "job-2",
    title: "제제연구 선임연구원 모집",
    track: "research",
    registeredAt: "2026.06.14",
    closingDate: "2026.07.28",
    status: "active",
    applicantCount: 12,
    boost: true,
  },
  {
    id: "job-3",
    title: "임상개발 PM 채용",
    track: "industry",
    registeredAt: "2026.06.10",
    closingDate: "2026.07.21",
    status: "active",
    applicantCount: 4,
    boost: true,
  },
  {
    id: "job-4",
    title: "QC 분석원 채용",
    track: "industry",
    registeredAt: "2026.05.30",
    closingDate: null,
    status: "closed",
    applicantCount: 23,
    boost: false,
  },
  {
    id: "job-5",
    title: "주 5일 근무 약사님을 모십니다",
    track: "pharmacy",
    registeredAt: "2026.07.10",
    closingDate: "2026.08.10",
    status: "active",
    applicantCount: 3,
    boost: false,
  },
  // 검수 흐름(제출 → 검토 대기 → 게시) 데모용 1건. registeredAt은 MOCK_TODAY 이전,
  // closingDate는 이후여야 게시 후 D-day가 정상 계산된다.
  {
    id: "job-7",
    title: "품질보증(QA) 담당자 채용",
    track: "industry",
    registeredAt: "2026.07.18",
    closingDate: "2026.08.14",
    status: "pending",
    applicantCount: 0,
    boost: false,
  },
];

export function filterJobPostings(
  postings: JobPosting[],
  statusFilter: JobPostingStatusFilter,
): JobPosting[] {
  if (statusFilter === "all") return postings;
  return postings.filter((p) => p.status === statusFilter);
}
