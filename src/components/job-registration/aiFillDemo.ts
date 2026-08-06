/**
 * AI 공고 채우기 — 트랙별 patch 타입과 데모 분석기.
 *
 * 실제 AI 호출은 아직 없다. 각 폼은 AiFillModal에 `onAnalyze`를 넘기고, 그 안에서 analyzeDemo를
 * 호출해 고정 fixture를 받는다. 실제 API가 붙으면 analyzeDemo만 진짜 호출로 갈아치우면 되고,
 * 폼·모달 코드는 그대로 둘 수 있다.
 *
 * patch는 "값이 있는 키만 반영한다"가 규칙이다 — undefined인 키는 원문에 없었다는 뜻이므로
 * 폼이 세터를 호출하지 않는다(빈 문자열로 덮어쓰지 않는다). 각 폼의 applyAiDraft가 이 규칙을 지킨다.
 *
 * 셀렉트 값은 라벨이 아니라 옵션 id다 — config/jobFilters의 값과 정확히 같아야 한다.
 */

// ── 트랙별 patch 타입 ──────────────────────────────────────────────────────────

/** 산업 트랙. 자유 텍스트 8종 + 셀렉트 3종. */
export interface IndustryAiFillPatch {
  title?: string;
  summary?: string;
  positionIntro?: string;
  mainDuties?: string;
  requiredQual?: string;
  preferred?: string;
  additionalNotes?: string;
  workCondDetail?: string;
  /** employmentTypeOptions의 id */
  employmentType?: string;
  /** experienceOptions의 id */
  careerType?: string;
  /** educationOptions의 id */
  educationType?: string;
}

/** 연구 트랙. 연구 주제·연구실 소개가 추가되고, 급여는 SegControl 라벨 문자열이다. */
export interface ResearchAiFillPatch {
  title?: string;
  summary?: string;
  researchTopics?: string;
  responsibilities?: string;
  requirements?: string;
  preferred?: string;
  additionalNotes?: string;
  workCondDetail?: string;
  labName?: string;
  labPi?: string;
  labIntro?: string;
  employmentType?: string;
  careerType?: string;
  educationType?: string;
  /** 급여 SegControl의 라벨 문자열(예: "기관 내규") — 폼이 옵션 배열을 라벨로 들고 있다 */
  salary?: string;
}

/** 병원 트랙. 근무 형태·근무 요일은 칩(복수 선택)이라 이 타입에 넣지 않는다. */
export interface HospitalAiFillPatch {
  title?: string;
  summary?: string;
  responsibilities?: string;
  requirements?: string;
  preferred?: string;
  additionalNotes?: string;
  workCondDetail?: string;
  employmentType?: string;
  careerType?: string;
  educationType?: string;
  /** 급여 SegControl의 라벨 문자열(예: "기관 내규") */
  salary?: string;
}

/**
 * 약국 트랙. 급여 방식(salaryKind)은 폼 내부의 로컬 유니온 타입이라 여기서 다루지 않는다 —
 * 유니온을 복제하면 두 곳이 갈라지므로, 금액 계열은 급여 비고(자유 텍스트)만 채운다.
 */
export interface PharmacyAiFillPatch {
  title?: string;
  summary?: string;
  responsibilities?: string;
  requirements?: string;
  preferred?: string;
  additionalNotes?: string;
  workCondDetail?: string;
  salaryNote?: string;
  mainPrescribingHospital?: string;
  employmentType?: string;
  careerType?: string;
  educationType?: string;
}

// ── 트랙별 데모 fixture ────────────────────────────────────────────────────────
//
// 비워 둔 필드는 의도적이다 — "원문에 없는 내용은 채우지 않는다"를 보여주는 동시에,
// 채운 뒤에도 필수 검증이 정상으로 걸리는지 확인하는 용도다.
// 고유명사는 기존 목데이터(더파마제약·분당서울대학교병원·더파마약국 등)와 겹치지 않는 일반 명칭만 쓴다.

/** 산업 — 모집 직무·급여·근무지·마감일·지원 방식은 비움 */
export const INDUSTRY_AI_FILL_DEMO: IndustryAiFillPatch = {
  title: "품질관리(QC) 분석 담당자 채용",
  summary: "완제·원료 의약품 시험과 밸리데이션을 담당할 QC 인력을 채용합니다.",
  mainDuties: "완제·원료 의약품 품질 분석\n시험법 밸리데이션 수행\n시험 기록서 작성 및 관리",
  requiredQual: "화학·생명과학 계열 학사 이상\nHPLC 등 분석 장비 사용 경험",
  preferred: "GMP 환경 근무 경험\n의약품 QC 실무 경험",
  employmentType: "permanent", // 정규직
  careerType: "1-3", // 1~3년
  educationType: "bachelor", // 학사 (4년제)
};

/** 연구 — 연구실 정보 섹션·연구 분야 2단 선택·계약 기간은 비움 */
export const RESEARCH_AI_FILL_DEMO: ResearchAiFillPatch = {
  title: "암 오가노이드 기반 약효평가 연구원 모집",
  summary: "암 오가노이드 모델로 신약 후보물질의 약효를 평가할 연구원을 모십니다.",
  researchTopics:
    "환자 유래 암 오가노이드 배양 및 특성 분석\n오가노이드 기반 약효·독성 평가 플랫폼 구축\n항암 후보물질의 반응성 바이오마커 탐색",
  responsibilities:
    "오가노이드 배양·유지 및 실험 설계\n약효평가 실험 수행과 데이터 분석\n연구 결과 정리 및 논문·보고서 작성",
  requirements: "생명과학 계열 석사 이상\n세포배양 및 분자생물학 실험 경험",
  preferred: "오가노이드·3D 배양 경험\n유세포분석·이미징 데이터 분석 경험",
  employmentType: "contract", // 계약직
  careerType: "1-3", // 1~3년
  educationType: "master", // 석사
};

/** 병원 — 근무 형태·근무 요일 칩·급여는 비움 */
export const HOSPITAL_AI_FILL_DEMO: HospitalAiFillPatch = {
  title: "약제부 병동 담당 약사 채용",
  summary: "병동 약제 업무를 담당할 약사를 모십니다.",
  responsibilities: "입원 환자 조제 및 감사\n병동 복약지도 및 약물 상담\n처방 검토와 약물 상호작용 확인",
  requirements: "약사 면허 소지자",
  preferred: "병원 약제부 근무 경험\n전산 처방 시스템 사용 경험",
  employmentType: "permanent", // 정규직
  educationType: "pharmacy", // 약사 면허
};

/** 약국 — 근무 형태·시간대 블록·급여 방식·모집인원은 비움 */
export const PHARMACY_AI_FILL_DEMO: PharmacyAiFillPatch = {
  title: "주중 오후 근무 약사 모집",
  summary: "주중 오후 시간대 근무할 약사를 모십니다.",
  responsibilities: "처방전 검토 및 조제\n복약상담 및 일반의약품 안내\n재고 관리 및 발주 지원",
  requirements: "약사 면허 소지자",
  preferred: "약국 근무 경험\n처방 조제 경험",
  workCondDetail: "주중 오후 시간대 근무, 요일은 협의 가능합니다.",
};

// ── 데모 분석기 ────────────────────────────────────────────────────────────────

/** 분석 흉내 시간(ms). 실제 호출이 붙으면 이 상수와 setTimeout이 함께 사라진다. */
const FAKE_ANALYZE_MS = 1200;

/**
 * 개발용 실패 트리거. 붙여넣은 원문이 이 접두어로 시작하면 분석이 실패한다 —
 * 실제 API 없이도 모달의 오류 상태를 눈으로 확인할 수 있게 두었다.
 */
export const DEMO_ERROR_PREFIX = "!error";

/**
 * 고정 fixture를 돌려주는 가짜 분석기. 실제 호출처럼 지연과 실패가 있다.
 * 취소 처리(로딩 중 모달 닫기)는 호출부가 맡는다 — 여기서는 타이머를 중단하지 않는다.
 */
export function analyzeDemo<T>(fixture: T, sourceText: string): Promise<T> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (sourceText.trimStart().startsWith(DEMO_ERROR_PREFIX)) {
        reject(new Error("AI 분석 실패(데모 트리거)"));
        return;
      }
      resolve(fixture);
    }, FAKE_ANALYZE_MS);
  });
}
