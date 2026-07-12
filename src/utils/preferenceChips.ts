import { optionLabelMaps } from "@/config/jobFilters/index";
import type { UserJobPreference } from "@/types/jobs";

/** 저장된 관심조건의 각 필드를 칩으로 나열하기 위한 라벨 목록. 순서는 직무 > 지역 > 근무 조건 > 그 외. */
export function buildPreferenceChips(preference: UserJobPreference): string[] {
  const groups: Array<[string[], string]> = [
    [preference.jobSubcategoryIds, "jobSubcategory"],
    [preference.regionIds, "region"],
    [preference.experienceId ? [preference.experienceId] : [], "experience"],
    [preference.educationId ? [preference.educationId] : [], "education"],
    [preference.employmentTypeIds, "employmentType"],
    [preference.workTypeIds, "workType"],
    [preference.workModeIds, "workMode"],
    [preference.scheduleIds, "schedule"],
    [preference.hospitalTypeIds, "hospitalType"],
    [preference.shiftTypeIds, "shiftType"],
    [preference.contractPeriodIds, "contractPeriod"],
    [preference.salaryId ? [preference.salaryId] : [], "salary"],
    [preference.hourlyPayRangeId ? [preference.hourlyPayRangeId] : [], "hourlyPay"],
    [preference.companyTypeIds, "companyType"],
    [preference.institutionTypeIds, "institutionType"],
    [preference.pharmacyFeatureIds, "pharmacyFeature"],
  ];

  return groups.flatMap(([ids, mapKey]) =>
    ids.map((id) => optionLabelMaps[mapKey]?.get(id)).filter((label): label is string => Boolean(label)),
  );
}
