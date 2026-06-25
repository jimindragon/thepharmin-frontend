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
 * 데모 사용자가 분야별로 이미 저장해둔 관심조건. 실제 백엔드/계정이 없는 목업이라 이 값이
 * "저장된 관심조건"의 기준이 된다(저장 전이라면 `getStoredJobPreference`의 실제 localStorage
 * 값이 우선한다). 산업·약국만 간단히 채우고, 연구·병원은 의도적으로 비워 "설정된 조건 없음"
 * 상태를 보여준다 — 트랙마다 일부러 균일하게 채우지 않는다.
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
  pharmacy: {
    ...emptyUserPreference,
    jobSubcategoryIds: ["staff_pharmacist"],
    regionIds: ["seoul"],
    workTypeIds: ["full_time"],
  },
};
