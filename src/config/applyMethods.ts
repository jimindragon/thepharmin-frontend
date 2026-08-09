import type { ApplyMethodId } from "@/types/jobs";

/**
 * 지원 방식 라벨의 정본. 목록 카드와 상세가 같은 문구를 쓰도록 한 곳에서 관리한다 —
 * 예전에는 목록(jobs.ts)이 한글 라벨을 데이터에 직접 들고 있어 상세와 표기가 갈렸다.
 *
 * 컴포넌트(job-detail/shared.tsx)가 아니라 config에 두는 이유는 순환 import다:
 * shared.tsx는 JobCard를 import하고 JobCard는 shared.tsx의 getCompanyDetailHref를
 * import한다. 라벨까지 shared.tsx에서 가져오면 그 순환을 목록 쪽 전반으로 넓히게 된다.
 */
export const APPLY_METHOD_LABELS: Record<ApplyMethodId, string> = {
  quick: "간편지원",
  homepage: "기업 홈페이지 지원",
  email: "이메일 지원",
  phone: "전화 지원",
  sms: "문자 지원",
  guide: "별도 안내",
};

/**
 * 목록·추천 카드용 짧은 라벨. 카드에서는 마감일과 한 줄에 나란히 놓여 폭이 빠듯하므로
 * homepage만 "기업"을 덜어낸다. 나머지는 전체 라벨과 같은 문구다.
 */
export const APPLY_METHOD_SHORT_LABELS: Record<ApplyMethodId, string> = {
  quick: "간편지원",
  homepage: "홈페이지 지원",
  email: "이메일 지원",
  phone: "전화 지원",
  sms: "문자 지원",
  guide: "별도 안내",
};
