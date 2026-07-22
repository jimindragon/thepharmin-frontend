import type { JobTrack } from "@/types/jobs";
import { MOCK_TODAY } from "@/config/mockToday";

export type JobPostingStatus = "pending" | "active" | "closed";
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
];

export function filterJobPostings(
  postings: JobPosting[],
  statusFilter: JobPostingStatusFilter,
): JobPosting[] {
  if (statusFilter === "all") return postings;
  return postings.filter((p) => p.status === statusFilter);
}
