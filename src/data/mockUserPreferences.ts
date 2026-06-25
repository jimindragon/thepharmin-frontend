import type { TrackPreferences, UserJobPreference } from "@/types/jobs";

export const emptyUserPreference: UserJobPreference = {
  jobCategoryIds: [],
  jobSubcategoryIds: [],
  experienceId: null,
  educationId: null,
  regionIds: [],
  employmentTypeIds: [],
  salaryId: null,
  workModeIds: [],
  companyTypeIds: [],
  institutionTypeIds: [],
  contractPeriodIds: [],
  workTypeIds: [],
  hourlyPayRangeId: null,
  pharmacyFeatureIds: [],
  scheduleIds: [],
  hospitalTypeIds: [],
  shiftTypeIds: [],
  emailAlertEnabled: false,
  emailFrequency: null,
};

/**
 * "관심 조건 설정하기" 버튼이 미리 채워 보여주는 예시값. 트랙별로 독립이라 산업 외 트랙은
 * 아직 예시가 없으면 비워두고(임의로 채우지 않음), 해당 트랙은 관심조건 설정 페이지에서 직접 구성한다.
 */
export const mockUserPreferences: TrackPreferences = {
  industry: {
    ...emptyUserPreference,
    jobSubcategoryIds: ["ra", "cmc-ra", "clinical-pm"],
    experienceId: "3-5",
    educationId: "bachelor",
    regionIds: ["seoul", "gyeonggi"],
    employmentTypeIds: ["permanent"],
    workModeIds: ["onsite", "hybrid"],
    emailAlertEnabled: true,
    emailFrequency: "daily",
  },
};
