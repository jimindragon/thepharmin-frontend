export type ApplicationStage = "applied" | "screening" | "interview" | "result";

export interface JobApplication {
  id: string;
  jobTitle: string;
  jobHref?: string;
  company: string;
  applyChannel: "quick" | "external";
  applyChannelLabel: string;
  resumeUsed?: string;
  appliedDate: string;
  deadlineDate?: string;
  isClosed: boolean;
  currentStage: ApplicationStage;
  statusLabel: string;
  resultLabel?: string;
  resultNote?: string;
}

export const applicationStages: { id: ApplicationStage; label: string }[] = [
  { id: "applied", label: "지원완료" },
  { id: "screening", label: "서류전형" },
  { id: "interview", label: "면접" },
  { id: "result", label: "결과" },
];

export const mockApplications: JobApplication[] = [
  {
    id: "app-1",
    jobTitle: "Regulatory Affairs Associate",
    jobHref: "/jobs/regulatory-affairs-associate",
    company: "바이오넥스(주)",
    applyChannel: "quick",
    applyChannelLabel: "간편지원",
    resumeUsed: "RA 직무용",
    appliedDate: "06.19",
    isClosed: false,
    currentStage: "screening",
    statusLabel: "서류발표 D-4",
  },
  {
    id: "app-2",
    jobTitle: "허가전략 담당자",
    company: "셀트리온",
    applyChannel: "quick",
    applyChannelLabel: "간편지원",
    resumeUsed: "RA 직무용",
    appliedDate: "06.05",
    isClosed: false,
    currentStage: "interview",
    statusLabel: "면접 D-DAY",
  },
  {
    id: "app-3",
    jobTitle: "RA Specialist (제약·바이오 인허가 담당)",
    jobHref: "/jobs/ra-specialist",
    company: "더팜인제약(주)",
    applyChannel: "external",
    applyChannelLabel: "홈페이지 지원",
    appliedDate: "06.16",
    deadlineDate: "07.03",
    isClosed: false,
    currentStage: "applied",
    statusLabel: "D-10",
  },
  {
    id: "app-4",
    jobTitle: "QA Manager",
    jobHref: "/jobs/qa-manager",
    company: "퀄리티웍스(주)",
    applyChannel: "quick",
    applyChannelLabel: "간편지원",
    resumeUsed: "RA 직무용",
    appliedDate: "05.22",
    isClosed: true,
    currentStage: "result",
    statusLabel: "종료",
    resultLabel: "최종 불합격",
    resultNote: "결과 발표 06.18 · 면접 전형까지 진행되었습니다",
  },
];
