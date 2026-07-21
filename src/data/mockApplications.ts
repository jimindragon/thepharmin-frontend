import { formatDday, getDaysUntil, toMonthDay } from "@/utils/dday";

export type ApplicationStage = "applied" | "screening" | "interview" | "result";

/**
 * 마이페이지 목데이터의 오늘 날짜 기준일.
 * 기업센터 businessJobs.ts의 MOCK_TODAY와 동일 기준일 — 변경 시 양쪽 함께 갱신할 것.
 */
export const MYPAGE_MOCK_TODAY = "2026.07.19";

/**
 * 마이페이지 전역(대시보드 요약 행 · 지금 확인할 일 · 지원 현황)이 공유하는 실제 이벤트 날짜.
 * 이 파일의 mockApplications 항목들과 대시보드의 파생 UI가 모두 이 상수를 참조해
 * 날짜가 이중으로 하드코딩되지 않도록 한다.
 */
export const INTERVIEW_DATE = "2026.07.19"; // 허가전략 담당자(셀트리온) 면접일 — MYPAGE_MOCK_TODAY와 동일
export const RA_ASSOCIATE_ANNOUNCE_DATE = "2026.07.23"; // Regulatory Affairs Associate(바이오넥스) 서류발표 예정일
export const RA_SPECIALIST_DEADLINE_DATE = "2026.07.29"; // RA Specialist(더팜인제약) 공고 마감일

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
  /** 서류전형/면접 단계에서 다음 일정 예정일 (예: "06.25") — 상태 텍스트 아래 보조 정보로 표시 */
  expectedDate?: string;
  /** 결과 확정일 (예: "06.18") — 종료된 지원 건의 상태 영역에 표시 */
  resultDate?: string;
  resultLabel?: string;
  resultNote?: string;
  /** D-day 계산·정렬용 전체 날짜(YYYY.MM.DD). expectedDate/deadlineDate는 화면 표시용 MM.DD를 그대로 유지한다. */
  nextEventDate?: string;
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
    statusLabel: `서류발표 ${formatDday(getDaysUntil(RA_ASSOCIATE_ANNOUNCE_DATE, MYPAGE_MOCK_TODAY))}`,
    expectedDate: toMonthDay(RA_ASSOCIATE_ANNOUNCE_DATE),
    nextEventDate: RA_ASSOCIATE_ANNOUNCE_DATE,
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
    statusLabel: `면접 ${formatDday(getDaysUntil(INTERVIEW_DATE, MYPAGE_MOCK_TODAY))}`,
    expectedDate: toMonthDay(INTERVIEW_DATE),
    nextEventDate: INTERVIEW_DATE,
  },
  {
    id: "app-3",
    jobTitle: "RA Specialist (제약·바이오 인허가 담당)",
    jobHref: "/jobs/ra-specialist",
    company: "더팜인제약(주)",
    applyChannel: "external",
    applyChannelLabel: "홈페이지 지원",
    appliedDate: "06.16",
    deadlineDate: toMonthDay(RA_SPECIALIST_DEADLINE_DATE),
    isClosed: false,
    currentStage: "applied",
    statusLabel: formatDday(getDaysUntil(RA_SPECIALIST_DEADLINE_DATE, MYPAGE_MOCK_TODAY)),
    nextEventDate: RA_SPECIALIST_DEADLINE_DATE,
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
    resultDate: "06.18",
    resultLabel: "최종 불합격",
    resultNote: "결과 발표 06.18 · 면접 전형까지 진행되었습니다",
  },
];
