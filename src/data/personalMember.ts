import { MOCK_TODAY_DATE } from "@/config/mockToday";
import type { MemberAffiliationId, StudentGrade } from "@/config/memberAffiliation";

/**
 * 로그인한 개인 회원 한 명. 개인 가입 폼(PersonalSignupClient)이 STEP1~2에서 받는 값을
 * 그대로 담는 그릇이다 — 회원정보 화면(/mypage/account)이 읽고 쓰는 정본.
 *
 * 소속 유형·2차 선택·학년·직급은 새 유니온을 만들지 않고 memberAffiliation.ts의 정본을 그대로 쓴다.
 * secondaryId·positionId가 문자열인 이유도 그쪽과 같다 — 2차 선택지는 소속마다 목록이 달라
 * (산업 직무 대분류 / 병원 직무 / 전공 계열 …) 하나의 유니온으로 좁힐 수 없다.
 *
 * 회원정보 화면 A회차는 계정·본인확인·수신동의 3개 섹션만 쓰지만, 소속·면허 필드도 지금 함께
 * 정의해 둔다. B회차(13종 분기)에서 데이터 형태가 갈리지 않게 하기 위함이다.
 */
export interface PersonalMember {
  // — 계정 정보 (가입 STEP2 §계정 정보) —
  name: string;
  /** 로그인 식별자. 가입 후 변경 불가라 화면에서도 읽기 전용으로 둔다. */
  accountId: string;
  email: string;

  // — 본인 확인 (가입 STEP2 §본인 확인) —
  /** "-" 없는 숫자만. 가입 폼·PhoneVerificationField가 저장하는 형태와 같다. */
  phone: string;
  phoneVerified: boolean;

  // — 프로필 정보 (가입 STEP2 §프로필 정보). A회차 화면에서는 아직 쓰지 않는다 —
  affiliationId: MemberAffiliationId | "";
  /** 소속 유형별 2차 선택(직무·전공 계열·희망 직무)의 id. 2차 선택이 없는 소속이면 "". */
  secondaryId: string;
  /** 회사명·병원명·학교명 등. 소속명 칸이 없는 소속(구직 중)이면 "". */
  orgName: string;
  /** 학생 전용. 학년은 해마다 올라가므로 기준 연도를 함께 보관한다. */
  studentGrade: StudentGrade | null;
  positionId: string;

  // — 약사 인증 —
  hasPharmacistLicense: boolean;
  /** 숫자만. 면허 칸이 나오지 않는 소속이면 "". */
  licenseNumber: string;
  /** 면허증 파일명. 가입 때는 선택 항목이라 미등록(null)일 수 있다. */
  licenseFileName: string | null;
  /**
   * 예비약사 인증(약대 6학년 재학증명서) 파일명.
   *
   * 가입 폼은 만료일까지 담은 객체(PreliminaryPharmacistVerification)로 들고 있지만
   * 여기서는 파일명만 둔다 — 만료일 표시가 필요해지면 그 타입으로 넓힐 자리다.
   */
  preliminaryPharmacistFileName: string | null;

  // — 광고성 정보 수신 동의 (가입 STEP1). 서비스 알림 설정과는 별개 축이다 —
  marketingEmail: boolean;
  marketingSms: boolean;

  /** 가입일. 실제 시계가 아니라 시연 기준일(MOCK_TODAY_DATE) 이전 날짜다. */
  joinedAt: string;
}

/**
 * 시연용 개인 회원 1건.
 *
 * 이력서 목데이터(data/resumes.ts의 resume-ra)와 같은 인물이라 설정을 맞췄다 —
 * RA 직무, 더팜인제약(주) 재직, 약사 면허 보유. 이름·이메일은 myPageUser(config/myPageMenu.ts)가
 * 이 값을 그대로 파생해 쓰므로 헤더·사이드바 표시와 항상 같다.
 */
export const mockPersonalMember: PersonalMember = {
  name: "김더팜",
  accountId: "kimdp",
  email: "kimdp@thepharma.co.kr",

  phone: "01043215678",
  phoneVerified: true,

  affiliationId: "pharma_bio",
  // industryJobCategoryOptions의 "RA·인허가" 대분류. 이력서의 RA 직무와 같은 축이다.
  secondaryId: "regulatory",
  orgName: "더팜인제약(주)",
  studentGrade: null,
  positionId: "assistant_manager",

  hasPharmacistLicense: true,
  licenseNumber: "48217",
  // 가입 때 "나중에 마이페이지에서 등록"을 고른 상태 — B회차의 면허증 등록 자리가 살아 있다.
  licenseFileName: null,
  preliminaryPharmacistFileName: null,

  marketingEmail: true,
  marketingSms: false,

  joinedAt: `${MOCK_TODAY_DATE.getFullYear() - 1}.11.04`,
};
