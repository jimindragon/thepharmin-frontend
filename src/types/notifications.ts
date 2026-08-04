// 알림 이벤트 종류 — 매트릭스 확정본 기준
export type PersonalNotificationType =
  | "application_submitted" // P1 지원 접수
  | "application_screening" // P2 지원서 검토 시작
  | "interview_confirmed" // P3 면접 확정
  | "final_result" // P4/P5 최종 결과 (합·불 공통)
  | "offer_received" // P6 제안 수신
  | "preference_new_jobs" // P7 관심 조건 신규 공고
  | "scrap_deadline" // P8 스크랩 마감 임박
  | "review_pass_granted"; // P9 열람권 지급

export type BusinessNotificationType =
  | "new_applicant" // B1 새 지원자
  | "job_deadline_soon" // B2 공고 마감 임박
  | "job_closed" // B3 공고 마감 처리
  | "boost_ending_soon" // B4 부스트 종료 임박
  | "boost_ended" // B5 부스트 종료
  | "payment_completed" // B6 결제 완료
  | "payment_cancelled" // B7 결제 취소·환불
  | "tax_invoice_issued" // B8 세금계산서 발행
  | "headhunting_candidates" // B9 후보자 추천 도착
  | "offer_accepted"; // B10 제안 수락됨

/**
 * 알림 목록 행 좌측에 붙는 유형 라벨.
 * 값은 알림 설정 화면의 그룹명(PERSONAL_NOTIFICATION_SETTINGS·BUSINESS_NOTIFICATION_SETTINGS)과
 * 맞춘 확정본이라 임의로 다듬지 않는다 — 바꾸면 설정 화면과 어긋난다.
 * Record로 선언해 유형이 늘어나면 컴파일러가 누락을 잡게 한다.
 */
export const PERSONAL_NOTIFICATION_TYPE_LABELS: Record<PersonalNotificationType, string> = {
  application_submitted: "지원·전형",
  application_screening: "지원·전형",
  interview_confirmed: "지원·전형",
  final_result: "지원·전형",
  offer_received: "제안",
  preference_new_jobs: "관심 조건",
  scrap_deadline: "마감",
  review_pass_granted: "제안",
};

export const BUSINESS_NOTIFICATION_TYPE_LABELS: Record<BusinessNotificationType, string> = {
  new_applicant: "지원자",
  job_deadline_soon: "공고·부스트",
  job_closed: "공고·부스트",
  boost_ending_soon: "공고·부스트",
  boost_ended: "공고·부스트",
  payment_completed: "결제",
  payment_cancelled: "결제",
  tax_invoice_issued: "결제",
  headhunting_candidates: "헤드헌팅",
  offer_accepted: "제안",
};

/**
 * 목록 컴포넌트는 개인·기업 알림을 함께 받아 Notification<string>으로 다루므로,
 * 여기서 scope로 표를 고르고 좁은 유형으로 단언한다 — 두 표의 키는 서로 겹치지 않는다.
 */
export function getNotificationTypeLabel(scope: "personal" | "business", type: string): string {
  return scope === "personal"
    ? PERSONAL_NOTIFICATION_TYPE_LABELS[type as PersonalNotificationType]
    : BUSINESS_NOTIFICATION_TYPE_LABELS[type as BusinessNotificationType];
}

export type NotificationChannel = "site" | "email" | "alimtalk";

/** 대시보드 "지금 확인할 일" 등에서 알림을 종류별로 분류할 때 쓰는 선택 태그. */
export type NotificationKind = "proposal" | "schedule" | "result" | "info";

export interface Notification<T extends string = string> {
  id: string;
  type: T;
  title: string;
  body: string;
  createdAt: string; // "2026.07.20 14:30" 형식 — 기존 목데이터 날짜 관례 따름
  read: boolean;
  href: string; // 클릭 시 이동 경로
  channels: NotificationChannel[]; // 이 알림이 발송된(될) 채널 기록
  kind?: NotificationKind;
  /**
   * 알림 대상(공고·직무명)만 담은 짧은 라벨 — title에서 이벤트 문구를 뺀 앞부분.
   * 대시보드 "지금 확인할 일"처럼 제목 줄에 문장이 아닌 대상만 보여야 하는 곳에서 쓴다.
   * 알림 목록·헤더 벨은 계속 title을 그대로 읽는다.
   */
  subjectLabel?: string;
}

export type PersonalNotification = Notification<PersonalNotificationType>;
export type BusinessNotification = Notification<BusinessNotificationType>;

/** 알림톡 템플릿 심사 신청서에 그대로 옮길 수 있는 구조. */
export interface AlimtalkTemplate {
  code: string; // 예: "TP_APPLY_DONE"
  name: string; // 관리용 한글명
  variables: string[]; // 치환 변수명 목록, 예: ["공고명"]
  content: string; // 심사 제출 문안 원문. 변수는 #{변수명} 표기
  note?: string; // 발송 조건 등 운영 메모
}

export const ALIMTALK_TEMPLATES: AlimtalkTemplate[] = [
  {
    code: "TP_APPLY_DONE",
    name: "지원 접수 완료",
    variables: ["공고명"],
    content: "[더파마 리크루트] #{공고명} 지원이 정상 접수되었습니다. 전형 진행 상황은 마이페이지에서 확인할 수 있습니다.",
  },
  {
    code: "TP_INTERVIEW_SET",
    name: "면접 확정",
    variables: ["기업명", "공고명"],
    content: "[더파마 리크루트] #{기업명} #{공고명} 면접 전형이 확정되었습니다. 상세 일정은 마이페이지 지원 현황에서 확인해 주세요.",
  },
  {
    code: "TP_FINAL_RESULT",
    name: "최종 결과 등록",
    variables: ["공고명"],
    content: "[더파마 리크루트] #{공고명} 최종 결과가 등록되었습니다. 마이페이지에서 확인해 주세요.",
    note: "합격 건에만 발송. 불합격은 사이트·이메일까지만.",
  },
  {
    code: "TP_OFFER_RECEIVED",
    name: "제안 수신",
    variables: [],
    content: "[더파마 리크루트] 회원님께 새로운 포지션 제안이 도착했습니다. 마이페이지 받은 제안에서 확인해 주세요.",
  },
  {
    code: "TP_PAYMENT_DONE",
    name: "결제 완료",
    variables: ["금액"],
    content: "[더파마 리크루트] 결제가 완료되었습니다. 결제금액 #{금액}원. 상세 내역은 기업센터 결제 내역에서 확인할 수 있습니다.",
  },
  {
    code: "TP_PAYMENT_CANCEL",
    name: "결제 취소",
    variables: ["금액"],
    content: "[더파마 리크루트] 결제 취소가 완료되었습니다. 환불 예정 금액 #{금액}원. 상세 내역은 기업센터 결제 내역에서 확인할 수 있습니다.",
  },
];

export interface NotificationSettingGroup {
  id: string;
  label: string;
  description: string;
  emailEnabled: boolean;
  locked?: boolean; // true면 필수 안내 — 토글 대신 안내 표시
  lockedNote?: string; // locked일 때 설정 화면에 보여줄 설명문
}

export const PERSONAL_NOTIFICATION_SETTINGS: NotificationSettingGroup[] = [
  {
    id: "apply",
    label: "지원·전형 알림",
    description: "지원 접수, 서류 검토, 면접 확정, 최종 결과 등 전형 진행 상황을 알려드립니다.",
    emailEnabled: true,
  },
  {
    id: "offer",
    label: "제안 알림",
    description: "기업·헤드헌터로부터 받은 입사 제안 소식을 알려드립니다.",
    emailEnabled: true,
  },
  {
    id: "preference",
    label: "관심 조건 신규 공고",
    description: "저장한 관심 조건과 일치하는 신규 공고를 알려드립니다. 관심 조건 페이지의 이메일 알림 설정과 연동됩니다.",
    emailEnabled: true,
  },
  {
    id: "deadline",
    label: "마감 임박 알림",
    description: "스크랩한 공고의 지원 마감이 다가오면 알려드립니다.",
    emailEnabled: true,
  },
];

export const BUSINESS_NOTIFICATION_SETTINGS: NotificationSettingGroup[] = [
  {
    id: "applicant",
    label: "지원자 알림",
    description: "새 지원자 도착, 제안 수락 등 지원자 관리 관련 소식을 알려드립니다. 이메일은 1일 1회 요약으로 발송됩니다.",
    emailEnabled: true,
  },
  {
    id: "job_boost",
    label: "공고·부스트 알림",
    description: "공고 마감·마감 처리, 부스트 노출 종료 임박·종료 소식을 알려드립니다.",
    emailEnabled: true,
  },
  {
    id: "payment",
    label: "결제 알림",
    description: "결제 완료·취소, 세금계산서 발행 등 결제 관련 소식을 알려드립니다.",
    emailEnabled: true,
    locked: true,
    lockedNote: "결제 완료·취소 안내는 필수 거래 안내로, 사이트·이메일·카카오톡으로 항상 발송됩니다.",
  },
  {
    id: "headhunting",
    label: "헤드헌팅 알림",
    description: "헤드헌팅 의뢰에 새 후보자가 추천되면 알려드립니다.",
    emailEnabled: true,
  },
];
