import type { Category, JobTrack } from "@/types/jobs";

export const jobTracks: Array<{
  id: JobTrack;
  label: string;
  description: string;
}> = [
  {
    id: "industry",
    label: "산업",
    description: "제약사, 바이오기업, 의료기기사, CRO, CDMO 등 영리기업 공고",
  },
  {
    id: "research",
    label: "연구",
    description: "비영리·공공·학술 연구기관 공고",
  },
  {
    id: "pharmacy",
    label: "약국",
    description: "약국의 약사 및 약국 지원인력 공고",
  },
  {
    id: "hospital",
    label: "병원",
    description: "병원·의료기관의 약제 관련 공고",
  },
];

export const jobTrackLabels = Object.fromEntries(jobTracks.map((track) => [track.id, track.label])) as Record<JobTrack, Category>;
