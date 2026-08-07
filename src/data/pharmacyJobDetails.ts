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

// ---- 현대약국 정본 ----

export const hyundaiPharmacyJobDetail: PharmacyJobDetail = {
  id: "hyundai-pharmacy-308",
  slug: "hyundai-pharmacy-fulltime-pharmacist",
  companyId: "hyundai-pharmacy",

  job: {
    title: "풀타임 근무약사님을 모십니다",
    jobCategoryLabel: "약국 > 근무약사",
    workTypeIds: ["full_time"],
    employmentTypeId: "permanent",
    experienceId: "any",
    educationId: "bachelor",
    headcount: "1명",

    summary: "처방 조제와 복약지도를 안정적으로 담당할 상근 약사를 모십니다.",
    responsibilities: [
      "처방 조제 및 감사",
      "복약지도",
      "의약품 재고·발주 관리 보조",
    ],
    requirements: ["약사 면허 보유", "조제 실무 가능자"],
    preferred: ["약국 근무 경력 1년 이상"],
    workConditionDetail:
      "평일은 09:00~17:20(주 38시간), 토요일은 격주 오전 09:00~12:30 근무입니다. 약사·직원이 함께 근무하며 조제와 복약지도를 나누어 진행합니다.",

    workSchedule: [
      { days: ["월", "화", "수", "목", "금"], time: "09:00–17:20" },
      { days: ["토"], time: "09:00–12:30" },
    ],

    salary: { kind: "면접후결정", amount: "면접 후 결정", note: "" },
    benefits: ["시간 조절 가능", "점심 식사 제공(자체 비용)", "중소기업 취업자 소득세 감면 혜택(해당 시)", "4대 보험"],

    coreKeywords: ["상근", "풀타임", "문전약국", "처방조제", "복약지도"],

    staffPharmacistCount: 6,
    staffSupportCount: 15,
    mainPrescribingHospital: "",

    apply: {
      method: "quick",
      email: "",
      phone: "",
      notice: "간편지원으로 접수해 주세요. 경력과 근무 가능 요일을 함께 남겨 주세요.",
    },
    isRolling: true,
  },

  org: {
    pharmacyName: "현대약국",
    logoText: "현대",
    logoColor: "#111111",
    coverImageUrl: null,

    location: {
      address: "경기 가림시 서천면 방독길 51 (방독리) 현대약국",
      detailAddress: "",
      parkingTransit: "건물 인근 도로변 주차 및 대중교통 이용이 가능합니다.",
    },
    businessHours: "평일 09:00~19:00 · 토 09:00~15:00 · 일요일·공휴일 휴무",

    pharmacyTypeId: "clinic-front",
    pharmacyFeatureId: "mixed",

    shortIntro: "약사 6명이 함께하는 100평 규모 대형 문전약국",
    fullIntro: "체계적으로 분업화된 대형 문전약국에서 조제 실무를 깊이 있게 쌓고 싶은 분께 적합합니다.",
    features: [
      "인근 의원 처방이 많아 처방 흐름이 안정적인 편입니다.",
      "약사와 직원이 함께 근무하며 조제, 검수, 응대를 나누어 진행합니다.",
      "대량 처방을 처리하는 분업 체계를 갖추고 있습니다.",
    ],
    keywords: ["문전약국", "대형약국", "처방조제", "팀 근무"],

    avgDailyPrescriptions: "400건 내외",
    mainDepartments: "내과·정형외과·이비인후과 등 인근 병의원 처방",
    software: "유팜",
    dispensingEquipment: ["전자동 정제 분류기(ATC)", "산제 자동 분포기", "조제 로봇 보조 시스템"],
    mainHospitals: ["인근 내과의원", "인근 정형외과의원", "인근 이비인후과의원"],

    staffPharmacistCount: 6,
    staffSupportCount: 15,
  },
};

// ---- 화곡 기쁨약국 정본 ----

export const hwagokGibeumPharmacyJobDetail: PharmacyJobDetail = {
  id: "hwagok-gibeum-pharmacy-309",
  slug: "hwagok-gibeum-pharmacy-short-term-pharmacist",
  companyId: "hwagok-gibeum-pharmacy",

  job: {
    title: "출산대체 약사님 모십니다",
    jobCategoryLabel: "약국 > 단기·대체약사",
    workTypeIds: ["temporary_substitute"],
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "bachelor",
    headcount: "1명",

    summary: "출산휴가 기간 동안 근무할 대체 약사님을 찾습니다.",
    responsibilities: ["처방 조제 및 감사", "복약지도"],
    requirements: ["약사 면허 보유", "대체 근무 기간 전일 근무 가능자"],
    preferred: ["단기·대체 근무 경험자"],
    workConditionDetail:
      "평일은 12:30~20:30(점심시간 1~2시), 토요일은 09:30~16:30 근무입니다. 출산휴가 대체 기간 동안 전일 근무가 필요합니다.",

    workSchedule: [
      { days: ["월", "화", "수", "목", "금"], time: "12:30–20:30" },
      { days: ["토"], time: "09:30–16:30" },
    ],

    salary: { kind: "월급", amount: "월 630만~680만원", note: "경력에 따라 협의" },
    benefits: ["식대 지원", "4대 보험"],

    coreKeywords: ["단기대체", "출산대체", "처방조제", "복약지도"],

    staffPharmacistCount: 1,
    staffSupportCount: 2,
    mainPrescribingHospital: "",

    apply: {
      method: "quick",
      email: "",
      phone: "",
      notice: "간편지원으로 접수해 주세요. 졸업년도와 경력사항을 함께 남겨 주세요.",
    },
    isRolling: true,
  },

  org: {
    pharmacyName: "화곡 기쁨약국",
    logoText: "기쁨",
    logoColor: "#111111",
    coverImageUrl: null,

    location: {
      address: "서울 강서구 화곡로 지하 168 (화곡동, 화곡역 5호선) 1층 약국",
      detailAddress: "",
      parkingTransit: "화곡역 인근으로 대중교통 접근이 편리하며, 별도 주차 공간은 마련되어 있지 않습니다.",
    },
    businessHours: "평일 09:00~20:00 · 토 09:00~16:00 · 일요일·공휴일 휴무",

    pharmacyTypeId: "local",
    pharmacyFeatureId: "otc_focused",

    shortIntro: "화곡역 인근, 처방과 일반약을 함께 다루는 동네 약국",
    fullIntro: "역세권 약국에서 처방조제와 일반약 상담을 균형 있게 경험하고 싶은 분께 적합합니다.",
    features: [
      "역세권에 위치해 유동인구 처방과 일반의약품 상담이 함께 이뤄집니다.",
      "약사 2인 중심으로 근무하며 접수와 조제 업무를 나누어 진행합니다.",
    ],
    keywords: ["일반약국", "처방조제", "역세권"],

    avgDailyPrescriptions: "150건 내외",
    mainDepartments: "인근 의원 처방 및 일반의약품 상담",
    software: "PM+20",
    dispensingEquipment: ["자동 정제 분류기", "키오스크 접수 시스템"],
    mainHospitals: ["인근 내과의원"],

    staffPharmacistCount: 2,
    staffSupportCount: null,
  },
};

// ---- 불당센트럴약국 정본 ----

export const buldangCentralPharmacyJobDetail: PharmacyJobDetail = {
  id: "buldang-central-pharmacy-316",
  slug: "buldang-central-pharmacy-fulltime",
  companyId: "buldang-central-pharmacy",

  job: {
    title: "천안 불당동 약사님 구합니다 (요일·시간 조정 가능)",
    jobCategoryLabel: "약국 > 근무약사",
    workTypeIds: ["full_time"],
    employmentTypeId: "permanent",
    experienceId: "1-3",
    educationId: "bachelor",
    headcount: "1명",

    summary: "처방 조제 중심의 상근 약사 포지션입니다.",
    responsibilities: [
      "처방 조제 및 감사",
      "복약지도",
      "조제 파트 간 업무 분담 협의",
    ],
    requirements: ["약사 면허 보유", "조제 실무 경력 1년 이상"],
    preferred: ["문전약국 근무 경험자"],
    workConditionDetail:
      "월·화·목·금 09:00~19:00(수요일 휴무), 월 3회 토요일 09:00~14:00 근무이며, 요일·시간은 약간 조정 가능합니다.",

    workSchedule: [
      { days: ["월", "화", "목", "금"], time: "09:00–19:00" },
      { days: ["토"], time: "09:00–14:00" },
    ],

    salary: { kind: "면접후결정", amount: "면접 후 결정", note: "경력에 따라 협의" },
    benefits: ["4대 보험"],

    coreKeywords: ["상근", "문전약국", "처방조제", "복약지도"],

    staffPharmacistCount: 1,
    staffSupportCount: 1,
    mainPrescribingHospital: "",

    apply: {
      method: "quick",
      email: "",
      phone: "",
      notice: "간편지원으로 접수해 주세요. 간단한 이력을 문자로 남겨 주시면 연락드립니다.",
    },
    isRolling: true,

    additionalNotes:
      "근무 시작일은 합격 후 협의 가능합니다. 면접 시 실제 조제 동선과 근무 환경을 함께 안내드립니다.",
    // detailImages/attachments: 없음
  },

  org: {
    pharmacyName: "불당센트럴약국",
    logoText: "센트럴",
    logoColor: "#111111",
    coverImageUrl: null,

    location: {
      address: "충남 천안시 서북구 번영로 100 센트럴프라자 1층",
      detailAddress: "",
      parkingTransit: "센트럴프라자 건물 인근에서 주차 및 대중교통 이용이 가능합니다.",
    },
    businessHours: "평일 08:40~18:40 · 토 08:40~14:00 · 일요일·공휴일 휴무",

    pharmacyTypeId: "local",
    pharmacyFeatureId: "otc_focused",

    shortIntro: "불당동 주민 곁의 동네 일반약국",
    fullIntro: "소규모 약국에서 처방조제부터 일반약 상담까지 두루 경험하고 싶은 분께 적합합니다.",
    features: [
      "소규모 팀으로 처방조제와 일반의약품 상담을 함께 진행합니다.",
      "동네 단골 손님 응대가 많은 편입니다.",
    ],
    keywords: ["일반약국", "처방조제", "소규모"],

    avgDailyPrescriptions: "70건 내외",
    mainDepartments: "인근 의원 처방 및 일반의약품 상담",
    software: "PM+20",
    dispensingEquipment: ["자동 정제 분류기"],
    mainHospitals: ["인근 내과의원"],

    staffPharmacistCount: 1,
    staffSupportCount: 1,
  },
};

// ---- 365열린영동약국 정본 — org는 companyProfiles.ts의 프로필 값을 재사용한다 ----

export const yeongdong365PharmacyJobDetail: PharmacyJobDetail = {
  id: "yeongdong-365-pharmacy-311",
  slug: "yeongdong-365-pharmacy-wed-parttime",
  companyId: "yeongdong-365-pharmacy",

  job: {
    title: "주 1회 수요일 약사님 구합니다",
    jobCategoryLabel: "약국 > 파트타임약사",
    workTypeIds: ["part_time"],
    employmentTypeId: "part-time",
    experienceId: "1-3",
    educationId: "bachelor",
    headcount: "1명",

    summary: "주 1회 수요일 근무하실 파트타임 약사님을 모십니다.",
    responsibilities: [
      "처방 조제 및 검수",
      "복약지도 및 투약 상담",
      "일반의약품·동물의약품 판매 상담",
      "약품 재고 확인과 조제실 정리",
    ],
    requirements: ["약사 면허 소지자", "약국 조제 경력 1년 이상"],
    preferred: ["이팜 사용 경험자", "자동조제기(ATC) 사용 경험자"],
    workConditionDetail:
      "매주 수요일 하루 근무입니다. 연중무휴로 운영하는 약국이라 근무일 변경이 필요한 경우 사전 협의로 조정합니다.",

    workSchedule: [{ days: ["수"], time: "08:30–20:30" }],

    salary: { kind: "일급", amount: "일급 500,000원", note: "식대 별도 지원" },
    benefits: ["중식 제공", "석식 제공(필요 시)"],

    coreKeywords: ["조제 검수", "복약지도", "일반약 판매", "이팜", "JVM ATC", "이비인후과", "파트타임"],

    staffPharmacistCount: null,
    staffSupportCount: null,
    mainPrescribingHospital: "",

    apply: {
      method: "quick",
      email: "",
      phone: "",
      notice: "간편 지원 후 근무 가능 여부를 확인해 연락드립니다.",
    },
    isRolling: true,
  },

  org: {
    pharmacyName: "365열린영동약국",
    logoText: "영동",
    logoColor: "#111111",
    coverImageUrl: null,

    location: {
      address: "충북 영동군 영동읍 중앙로 29",
      detailAddress: "1층 102호",
      parkingTransit: "영동읍 중앙로 대로변 1층으로 도보 접근이 쉽습니다.",
    },
    businessHours: "매일 08:30–20:30, 일요일 09:00–20:00",

    pharmacyTypeId: "local",
    pharmacyFeatureId: "mixed",

    shortIntro: "연중무휴로 운영하는 영동읍 중심가 약국입니다.",
    fullIntro:
      "영동읍 중심가 중앙로 대로변 건물 1층에 자리한 약국입니다. 평일과 주말, 공휴일까지 연중 운영하며 처방 조제와 일반의약품 판매를 함께 합니다. 동물약국으로 정식 등록되어 동물용의약품도 취급합니다.",
    features: [
      "평일·주말·공휴일 연중 운영으로 근무 요일 협의 폭이 넓습니다.",
      "정식 등록된 동물용의약품 취급 약국입니다.",
    ],
    keywords: ["연중무휴", "동물약국", "영동읍 중심가"],

    avgDailyPrescriptions: "",
    mainDepartments: "",
    software: "이팜",
    dispensingEquipment: ["자동조제기(JVM ATC)"],
    mainHospitals: [],

    staffPharmacistCount: null,
    staffSupportCount: null,
  },
};

// ---- 신중앙약국 정본 — org는 companyProfiles.ts의 프로필 값을 재사용한다 ----

export const shinJungangPharmacyJobDetail: PharmacyJobDetail = {
  id: "shin-jungang-pharmacy-314",
  slug: "shin-jungang-pharmacy-saturday-parttime",
  companyId: "shin-jungang-pharmacy",

  job: {
    title: "토요일 오후 약사님 구합니다",
    jobCategoryLabel: "약국 > 파트타임약사",
    workTypeIds: ["part_time", "weekend"],
    employmentTypeId: "freelance",
    experienceId: "1-3",
    educationId: "bachelor",
    headcount: "1명",

    summary: "토요일 오후 근무하실 약사님을 모십니다.",
    responsibilities: ["처방 조제·검수 및 투약", "복약지도", "일반의약품·동물의약품 판매"],
    requirements: ["약사 면허 소지자", "약국 조제 경력 1년 이상"],
    preferred: ["팜IT3000 사용 경험자", "병원 문전 약국 근무 경험자"],
    workConditionDetail:
      "토요일 오후 시간대 근무입니다. 중앙대학교병원 처방과 일반의약품 판매가 함께 있는 환경입니다.",

    // jobs.ts 314에 토요일 구체 근무 시각이 없어(oneLineIntro·introduction의 "오후 5시까지 타 약사 동시 근무",
    // responsibilitiesContent의 "13~14시 위주"는 시간대 범위가 아니다) 시각을 창작하지 않고 협의 표기로 둔다.
    workSchedule: [{ days: ["토"], time: "오후 시간대(협의)" }],

    salary: { kind: "시급", amount: "시급 32,000~35,000원", note: "평일 32,000원·주말 35,000원 기준" },
    benefits: [],

    coreKeywords: ["소량 검수·투약", "일반의약품 판매", "토요일 파트타임", "팜IT 3000", "흑석역", "중앙대학교병원"],

    staffPharmacistCount: null,
    staffSupportCount: null,
    mainPrescribingHospital: "중앙대학교병원",

    apply: {
      method: "quick",
      email: "",
      phone: "",
      notice: "간편 지원 후 근무 가능 여부를 확인해 연락드립니다.",
    },
    isRolling: true,
  },

  org: {
    pharmacyName: "신중앙약국",
    logoText: "신중앙",
    logoColor: "#111111",
    coverImageUrl: null,

    location: {
      address: "서울 동작구 흑석로 103",
      detailAddress: "",
      parkingTransit: "흑석역 도보 5분 거리입니다.",
    },
    businessHours: "월–토 08:30–24:00, 일·공휴일 13:00–24:00",

    pharmacyTypeId: "clinic-front",
    pharmacyFeatureId: "prescription_focused",

    shortIntro: "중앙대학교병원 정문 앞에서 자정까지 운영하는 문전 약국입니다.",
    fullIntro:
      "2013년 개국해 중앙대학교병원 정문 앞에서 운영 중인 약국입니다. 흑석역에서 도보 5분 거리로, 병원 처방 환자와 인근 대학생·직장인이 주로 찾습니다. 자정까지 운영하며 처방 조제와 일반의약품, 동물용의약품을 취급합니다.",
    features: [
      "평일·토요일 자정까지 문을 엽니다.",
      "중앙대학교병원 정문 앞, 흑석역 도보 5분입니다.",
    ],
    keywords: ["병원 문전", "심야 운영", "동물약국"],

    avgDailyPrescriptions: "",
    mainDepartments: "",
    software: "팜IT3000",
    dispensingEquipment: [],
    mainHospitals: ["중앙대학교병원"],

    staffPharmacistCount: null,
    staffSupportCount: null,
  },
};

export const pharmacyJobDetails: PharmacyJobDetail[] = [
  eunhaengPharmacyJobDetail,
  hyundaiPharmacyJobDetail,
  hwagokGibeumPharmacyJobDetail,
  buldangCentralPharmacyJobDetail,
  yeongdong365PharmacyJobDetail,
  shinJungangPharmacyJobDetail,
];

export function getPharmacyJobDetail(slug: string): PharmacyJobDetail | undefined {
  return pharmacyJobDetails.find((d) => d.slug === slug);
}
