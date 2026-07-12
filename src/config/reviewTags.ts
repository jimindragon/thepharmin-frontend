// src/config/reviewTags.ts
// 기업 리뷰 / 면접 후기 작성 시 선택하는 태그 풀.
// 카테고리는 작성 UI에서 그룹 헤더로만 사용하며, 저장 데이터(CompanyReview.tags)는 평면 string[]이다.
// 트랙(JobTrack) × 리뷰 타입(CompanyReviewType)별로 태그가 다르다.
// industry/hospital/pharmacy/research 4개 트랙 전부를 정의한다.

import type { JobTrack, CompanyReviewType } from "@/types/jobs";

export interface ReviewTagGroup {
  /** 작성 UI에서 칩 위에 표시할 카테고리 헤더 */
  category: string;
  tags: string[];
}

/** 작성 UI에서 선택 가능한 최대 태그 개수 */
export const REVIEW_TAG_MAX = 3;

type ReviewTagPool = Partial<Record<JobTrack, Record<CompanyReviewType, ReviewTagGroup[]>>>;

export const reviewTagPool: ReviewTagPool = {
  industry: {
    company: [
      { category: "근무 환경", tags: ["업무 프로세스가 체계적이에요", "업무 범위가 명확해요", "협업 분위기가 좋아요", "워라밸이 좋은 편이에요"] },
      { category: "보상·복지", tags: ["복지가 잘 갖춰져 있어요", "보상 수준이 만족스러워요"] },
      { category: "성장·전문성", tags: ["직무 전문성을 키우기 좋아요", "교육·온보딩이 잘 되어 있어요", "커리어 성장 기회가 있어요", "글로벌 과제를 경험할 수 있어요", "규제 대응 경험을 쌓기 좋아요"] },
      { category: "산업 특화", tags: ["R&D 투자가 활발한 편이에요", "전문 직무 경험을 쌓기 좋아요", "SOP와 문서 체계가 잘 갖춰져 있어요", "데이터·근거 중심으로 일해요"] },
      { category: "그 외", tags: ["업무량이 많은 편이에요", "조직 규모가 커서 절차가 많은 편이에요"] },
    ],
    interview: [
      { category: "면접 분위기", tags: ["면접 분위기가 편안했어요"] },
      { category: "질문 유형", tags: ["질문이 구체적이었어요", "과제·케이스 질문이 있었어요", "산업 이해도를 확인했어요", "영어·글로벌 업무 역량을 확인했어요"] },
      { category: "직무 검증", tags: ["직무 전문성을 깊게 물어봤어요", "실무 경험을 중심으로 평가했어요"] },
      { category: "전형 안내", tags: ["전형 안내가 명확했어요", "처우·근무조건 설명이 명확했어요"] },
      { category: "결과 통보", tags: ["결과 통보가 빨랐어요"] },
      { category: "그 외", tags: ["전형 기간이 긴 편이었어요", "질문 난이도가 높은 편이었어요"] },
    ],
  },
  hospital: {
    company: [
      { category: "근무 환경", tags: ["당직 체계가 명확해요", "근무 스케줄이 예측 가능한 편이에요", "휴게시간이 보장되는 편이에요", "조직이 안정적이에요"] },
      { category: "보상·복지", tags: ["복지가 잘 갖춰져 있어요"] },
      { category: "업무·성장", tags: ["현장 경험을 쌓기 좋아요", "교육·인수인계가 잘 되어 있어요", "부서 간 협업이 원활해요", "업무 매뉴얼이 잘 갖춰져 있어요"] },
      { category: "병원 특화", tags: ["환자 응대 부담이 과하지 않아요", "부서 배치 기준이 명확해요", "업무 시스템이 편리해요", "직원 간 소통이 원활해요"] },
      { category: "그 외", tags: ["업무량이 많은 편이에요", "당직·스케줄 변동이 있는 편이에요"] },
    ],
    interview: [
      { category: "면접 분위기", tags: ["면접 분위기가 편안했어요"] },
      { category: "질문 유형", tags: ["질문이 실무적이었어요", "현장 경험을 구체적으로 물어봤어요"] },
      { category: "직무 검증", tags: ["실무 역량을 중점적으로 봤어요", "인성·협업 태도를 중요하게 봤어요"] },
      { category: "전형 안내", tags: ["전형 절차가 명확했어요", "근무표·당직 조건을 설명해줬어요", "부서 배치 기준을 안내해줬어요"] },
      { category: "결과 통보", tags: ["결과 통보가 빨랐어요"] },
      { category: "그 외", tags: ["전형 기간이 긴 편이었어요"] },
    ],
  },
  pharmacy: {
    company: [
      { category: "근무 조건", tags: ["근무 시간이 규칙적이에요", "주말·야간 근무 조건이 명확해요", "휴게시간이 보장되는 편이에요", "근무 조건 협의가 합리적이에요"] },
      { category: "보상", tags: ["급여 지급이 안정적이에요"] },
      { category: "업무 환경", tags: ["조제 동선이 효율적이에요", "업무 분담이 명확해요", "조제 장비가 잘 갖춰져 있어요", "근무 환경이 쾌적해요"] },
      { category: "약국 문화", tags: ["원장님과 소통이 원활해요", "직원 간 협업이 좋아요", "복약지도에 집중할 수 있어요", "신규 직원 적응을 잘 도와줘요"] },
      { category: "그 외", tags: ["처방량이 많은 편이에요", "고객 응대가 많은 편이에요"] },
    ],
    interview: [
      { category: "면접 분위기", tags: ["면접 분위기가 편안했어요"] },
      { category: "질문 유형", tags: ["실무 경험을 물어봤어요", "조제 경험을 구체적으로 봤어요", "복약지도 경험을 확인했어요"] },
      { category: "직무 검증", tags: ["근무 가능 요일·시간을 확인했어요"] },
      { category: "전형 안내", tags: ["근무 조건을 명확히 안내했어요", "급여·근무시간 설명이 명확했어요", "주요 처방과와 업무 방식을 설명해줬어요"] },
      { category: "결과 통보", tags: ["채용 과정이 간결했어요"] },
    ],
  },
  research: {
    company: [
      { category: "연구 환경", tags: ["연구 주제가 명확해요", "실험 장비·인프라가 잘 갖춰져 있어요", "연구 자율성이 있는 편이에요", "연구 몰입 환경이 잘 갖춰져 있어요"] },
      { category: "성장·전문성", tags: ["연구 역량을 키우기 좋아요", "논문·학회 활동을 지원해줘요", "다양한 연구 과제를 경험할 수 있어요", "전문 분야를 깊게 다루기 좋아요"] },
      { category: "소통·조직", tags: ["연구책임자·PI와 소통이 원활해요", "팀 내 협업 분위기가 좋아요", "연구 방향 공유가 잘 되는 편이에요"] },
      { category: "근무 조건", tags: ["근무 시간이 유연한 편이에요", "과제 일정이 예측 가능한 편이에요", "계약 조건 안내가 명확한 편이에요"] },
      { category: "그 외", tags: ["과제 업무가 많은 편이에요", "행정 업무 비중이 있는 편이에요", "성과 압박이 있는 편이에요"] },
    ],
    interview: [
      { category: "면접 분위기", tags: ["면접 분위기가 편안했어요"] },
      { category: "질문 유형", tags: ["연구 경험을 구체적으로 물어봤어요", "논문·실적 중심으로 평가했어요", "실험 기법 이해도를 확인했어요", "연구 주제 이해도를 확인했어요"] },
      { category: "직무 검증", tags: ["연구 계획을 구체적으로 물어봤어요", "데이터 해석 경험을 확인했어요", "협업 경험을 중요하게 봤어요"] },
      { category: "전형 안내", tags: ["계약 조건을 명확히 안내했어요", "연구 환경을 소개해줬어요", "담당 과제와 역할을 설명해줬어요"] },
      { category: "결과 통보", tags: ["결과 통보가 빨랐어요"] },
    ],
  },
};

/** 면접 유형(interviewFormat) 선택지 7종 */
export const interviewFormatOptions = [
  "대면 면접",
  "화상 면접",
  "전화 면접",
  "실무진 면접",
  "임원 면접",
  "실무진·임원 순차 면접",
  "직무 과제 후 면접",
] as const;

/** 면접 난이도(interviewDifficulty) 선택지 */
export const interviewDifficultyOptions = ["상", "중", "하"] as const;

/** 트랙 + 타입으로 태그 그룹을 꺼낸다. 없으면 빈 배열. */
export function getReviewTagGroups(track: JobTrack, type: CompanyReviewType): ReviewTagGroup[] {
  return reviewTagPool[track]?.[type] ?? [];
}
