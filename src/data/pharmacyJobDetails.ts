// ============================================================
// 약국 공고 상세 정본 (job/org 이원 구조)
// job = 공고 등록 폼 입력값 / org = 약국 정보 관리 폼 입력값
// 화면 렌더 정책: 중복 개념은 job 우선, job 빈값이면 org fallback
// 정형 선택지 = id 저장 + 라벨 매핑 상수로 표시
// 자유입력 = 입력 문자열 그대로
// ============================================================

export const pharmacyTypeLabelMap: Record<string, string> = {
  local: "로컬 약국",
  "clinic-front": "문전 약국",
  large: "대형 약국",
  beauty: "뷰티 특화 약국",
};

export const pharmacyFeatureLabelMap: Record<string, string> = {
  otc_focused: "매약 중심",
  prescription_focused: "조제 중심",
  mixed: "혼합",
};

export const pharmacyWorkTypeLabelMap: Record<string, string> = {
  full_time: "풀타임",
  part_time: "파트타임",
  temporary_substitute: "단기·대체",
  weekend: "주말",
  night: "야간",
};

export const employmentTypeLabelMap: Record<string, string> = {
  permanent: "정규직",
  contract: "계약직",
  intern: "인턴",
  "part-time": "파트타임",
  freelance: "프리랜서",
};

export const experienceLabelMap: Record<string, string> = {
  any: "경력무관",
  new: "신입",
  "under-1": "1년 미만",
  "1-3": "1~3년",
  "3-5": "3~5년",
  "5-10": "5~10년",
  "10-20": "10~20년",
  "20-plus": "20년 이상",
};

export const educationLabelMap: Record<string, string> = {
  any: "학력무관",
  associate: "전문학사",
  bachelor: "학사 (4년제)",
  pharmacy: "약사 면허",
  master: "석사",
  doctor: "박사",
  professional: "의약학 전문학위 (6년제)",
};

export const applyMethodLabelMap: Record<string, string> = {
  quick: "간편지원",
  phone: "전화 지원",
  email: "이메일 지원",
  homepage: "기업 홈페이지 지원",
};

type PharmacyTypeId = "local" | "clinic-front" | "large" | "beauty";
type PharmacyFeatureId = "otc_focused" | "prescription_focused" | "mixed";

// 근무 시간대 그룹: 같은 시간에 근무하는 요일을 묶음
// 예: 화·목은 오후, 토는 오전 → 두 개의 WorkScheduleBlock
export interface WorkScheduleBlock {
  days: string[];   // ["화","목"] 등
  time: string;     // "14:00–19:00"
}

export interface PharmacyJobPosting {
  title: string;
  jobCategoryLabel: string;
  workTypeIds: string[];
  employmentTypeId: string;
  experienceId: string;
  educationId: string;
  headcount: string;

  summary: string;
  responsibilities: string[];
  requirements: string[];
  preferred: string[];
  workConditionDetail: string;

  // 근무시간: 요일별 시간대 배열 (기존 workDays+workHours 대체)
  workSchedule: WorkScheduleBlock[];

  salary: { kind: string; amount: string; note: string };  // amount는 단일값
  benefits: string[];

  coreKeywords: string[];

  staffPharmacistCount: number | null;
  staffSupportCount: number | null;
  mainPrescribingHospital: string;

  // 지원 정보: method 단일 id. 로그인 잠금은 렌더 단계.
  // 이메일 지원 = email 노출을 로그인 후로 잠금.
  apply: {
    method: string;      // applyMethodLabelMap의 id
    email: string;       // 이메일 지원 시 사용. 없으면 ""
    phone: string;       // 전화 지원 시 사용. 없으면 ""
    notice: string;
  };
  deadlineLabel: string;
  isRolling: boolean;

  additionalNotes?: string;
  detailImages?: string[];
  attachments?: { name: string; url: string }[];
  hiringProcess?: string[];
  requiredDocuments?: string[];
}

export interface PharmacyOrg {
  pharmacyName: string;
  logoText: string;
  logoColor: string;
  coverImageUrl: string | null;   // null이면 약국 트랙 기본 이미지 사용

  location: {
    address: string;
    detailAddress: string;
    parkingTransit: string;       // 주차·교통 통합 자유서술 (기존 parking+transit 대체)
  };
  businessHours: string;

  pharmacyTypeId: string;
  pharmacyFeatureId: string;

  shortIntro: string;
  fullIntro?: string;
  features: string[];
  keywords: string[];

  avgDailyPrescriptions: string;
  mainDepartments: string;
  software: string;
  dispensingEquipment: string[];
  mainHospitals: string[];

  staffPharmacistCount: number | null;
  staffSupportCount: number | null;
}

export interface PharmacyJobDetail {
  id: string;
  slug: string;
  companyId: string;
  job: PharmacyJobPosting;
  org: PharmacyOrg;
}

// ---- 은행약국 정본 ----

export const eunhaengPharmacyJobDetail: PharmacyJobDetail = {
  id: "eunhaeng-pharmacy-307",
  slug: "eunhaeng-pharmacy-part-time-pharmacist",
  companyId: "eunhaeng-pharmacy",

  job: {
    title: "주 3일 파트타임 근무약사 채용",
    jobCategoryLabel: "약국 > 파트타임약사",
    workTypeIds: ["part_time", "weekend"],
    employmentTypeId: "part-time",
    experienceId: "any",
    educationId: "bachelor",
    headcount: "1명",

    summary: "인근 의원 처방 중심의 안정적인 환경에서 주 3일 근무하실 파트타임 약사님을 모십니다.",
    responsibilities: [
      "일반의원 처방 조제 및 검수",
      "복약지도 및 투약 상담",
      "일반의약품 및 건강기능식품 상담",
      "조제실 정리와 약품 재고 확인",
    ],
    requirements: [
      "약사 면허 소지자",
      "약국 조제 및 복약지도 업무 가능자",
      "전산 프로그램 사용에 거부감이 없는 분",
      "책임감 있게 정해진 근무시간을 지킬 수 있는 분",
    ],
    preferred: [
      "의원층 약국 근무 경험자",
      "유팜 사용 경험자",
      "ATC 자동조제기 사용 경험자",
    ],
    workConditionDetail: "화·목·토 주 3일 근무이며, 평일은 오후 시간대 중심으로 근무합니다. 토요일은 오전 진료 처방이 집중되는 시간대라 약무지원 직원과 함께 근무합니다. 처방 패턴이 비교적 안정적이고, 신규 입사 시 전산·조제 동선을 먼저 안내드립니다.",

    workSchedule: [
      { days: ["화", "목"], time: "14:00–19:00" },
      { days: ["토"], time: "09:00–14:00" },
    ],

    salary: {
      kind: "시급",
      amount: "시급 36,000원",
      note: "경력과 근무 가능 요일에 따라 협의",
    },
    benefits: ["4대보험", "식대 지원", "주차 지원", "명절 상여"],

    coreKeywords: ["파트타임", "주 3일", "조제 중심", "복약지도", "의원층 약국", "유팜", "ATC", "주차 지원"],

    staffPharmacistCount: 1,
    staffSupportCount: 2,
    mainPrescribingHospital: "",

    apply: {
      method: "email",
      email: "recruit@eunhaeng-pharmacy.example",
      phone: "",
      notice: "이메일 지원을 우선 확인합니다. 경력과 근무 가능 요일을 함께 남겨 주세요.",
    },
    deadlineLabel: "채용 시 마감",
    isRolling: true,
  },

  org: {
    pharmacyName: "은행약국",
    logoText: "은행약국",
    logoColor: "#111111",
    coverImageUrl: null,

    location: {
      address: "경기 용인시 처인구 양지면 양지로 138",
      detailAddress: "은행메디컬빌딩 1층",
      parkingTransit: "건물 지하주차장 2시간 무료 지원. 양지IC에서 차량 5분 거리이며, 양지사거리 정류장에서 도보 3분 내 접근 가능합니다.",
    },
    businessHours: "평일 09:00–19:00, 토요일 09:00–14:00, 일요일·공휴일 휴무",

    pharmacyTypeId: "local",
    pharmacyFeatureId: "prescription_focused",

    shortIntro: "인근 내과·이비인후과 처방을 중심으로 운영하는 지역 밀착형 조제 약국입니다.",
    fullIntro:
      "인근 의원 처방이 많아 처방 흐름이 안정적인 편입니다. 약사와 직원이 함께 근무하며 조제, 검수, 응대를 나누어 진행합니다. 신규 약사님께는 전산 입력, 조제 검수, 복약지도 흐름을 차근차근 안내드립니다.",
    features: [
      "인근 의원 처방이 많아 처방 흐름이 비교적 안정적인 편입니다.",
      "약사와 약무지원 직원이 함께 근무하며 조제, 검수, 응대를 나누어 진행합니다.",
      "신규 입사 시 전산 입력, 조제 검수, 복약지도 흐름을 차근차근 안내드립니다.",
    ],
    keywords: ["의원층 약국", "안정적 처방", "조제 중심", "교육 루틴", "주차 가능"],

    avgDailyPrescriptions: "170건 내외",
    mainDepartments: "내과·이비인후과·정형외과",
    software: "유팜",
    dispensingEquipment: ["자동조제기", "산제포장기"],
    mainHospitals: ["양지내과의원", "양지이비인후과의원", "인근 정형외과 의원"],

    staffPharmacistCount: 3,
    staffSupportCount: 2,
  },
};

export const pharmacyJobDetails: PharmacyJobDetail[] = [
  eunhaengPharmacyJobDetail,
];

export function getPharmacyJobDetail(slug: string): PharmacyJobDetail | undefined {
  return pharmacyJobDetails.find((d) => d.slug === slug);
}
