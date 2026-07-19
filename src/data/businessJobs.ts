import type { JobTrack } from "@/types/jobs";

export type JobPostingStatus = "pending" | "active" | "closed";
export type JobPostingStatusFilter = "all" | JobPostingStatus;

export interface JobBoostInfo {
  daysLeft: number;
  isUrgent: boolean;
}

export interface JobPosting {
  id: string;
  title: string;
  track: JobTrack;
  registeredAt: string;
  closingDate: string | null;
  status: JobPostingStatus;
  applicantCount: number;
  boost: JobBoostInfo | null;
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
    registeredAt: "2026.07.17",
    closingDate: "2026.08.16",
    status: "pending",
    applicantCount: 0,
    boost: null,
  },
  {
    id: "job-1",
    title: "병원 약제팀 약사 채용",
    track: "hospital",
    registeredAt: "2026.06.20",
    closingDate: "2026.07.20",
    status: "active",
    applicantCount: 7,
    boost: null,
  },
  {
    id: "job-2",
    title: "제제연구 선임연구원 모집",
    track: "research",
    registeredAt: "2026.06.14",
    closingDate: "2026.07.28",
    status: "active",
    applicantCount: 12,
    boost: { daysLeft: 9, isUrgent: false },
  },
  {
    id: "job-3",
    title: "임상개발 PM 채용",
    track: "industry",
    registeredAt: "2026.06.10",
    closingDate: "2026.07.21",
    status: "active",
    applicantCount: 4,
    boost: { daysLeft: 2, isUrgent: true },
  },
  {
    id: "job-4",
    title: "QC 분석원 채용",
    track: "industry",
    registeredAt: "2026.05.30",
    closingDate: null,
    status: "closed",
    applicantCount: 23,
    boost: null,
  },
  {
    id: "job-5",
    title: "주 5일 근무 약사님을 모십니다",
    track: "pharmacy",
    registeredAt: "2026.07.10",
    closingDate: "2026.08.10",
    status: "active",
    applicantCount: 3,
    boost: null,
  },
];

export function filterJobPostings(
  postings: JobPosting[],
  statusFilter: JobPostingStatusFilter,
): JobPosting[] {
  if (statusFilter === "all") return postings;
  return postings.filter((p) => p.status === statusFilter);
}
