import type { FilterOption, JobCategoryOption, TrackFilterConfig } from "@/types/jobs";
import { domesticRegionOptions, educationOptions, employmentTypeOptions, experienceOptions, salaryOptions } from "./shared";

export const hospitalJobCategoryOptions: JobCategoryOption[] = [
  {
    id: "hospital-pharmacist",
    label: "약사 직무",
    subcategories: [
      { id: "hospital_pharmacist", label: "입원·조제 약사", categoryId: "hospital-pharmacist" },
      { id: "clinical_pharmacist", label: "임상·전문약사", categoryId: "hospital-pharmacist" },
      { id: "clinical_trial_pharmacist", label: "임상시험 약사", categoryId: "hospital-pharmacist" },
    ],
  },
  {
    id: "hospital-management",
    label: "관리·행정",
    subcategories: [
      { id: "pharmacy_department_management", label: "약제부 관리", categoryId: "hospital-management" },
      { id: "hospital_pharmacy_administration", label: "약무행정", categoryId: "hospital-management" },
    ],
  },
];

export const hospitalTypeOptions: FilterOption[] = [
  { id: "tertiary_general_hospital", label: "상급종합병원", description: "3차" },
  { id: "general_hospital", label: "종합병원", description: "2차" },
  { id: "hospital", label: "병원" },
  { id: "long_term_care_hospital", label: "요양병원" },
];

export const shiftTypeOptions: FilterOption[] = [
  { id: "day_shift", label: "주간근무" },
  { id: "shift_work", label: "교대근무" },
  { id: "night_on_call", label: "야간·당직" },
  { id: "weekend_work", label: "주말근무" },
];

/** 병원 트랙 급여 셀렉트. "면접 후 결정" 등 미표기 공고는 company-policy 옵션 대신 salaryIncludeUnknown 체크박스로 다룬다 */
export const hospitalSalaryOptions: FilterOption[] = salaryOptions.filter((option) => option.id !== "company-policy");

export const hospitalFilterConfig: TrackFilterConfig = {
  track: "hospital",
  filters: [
    { id: "job", label: "직무", kind: "job", categories: hospitalJobCategoryOptions },
    {
      id: "hospitalType",
      label: "사업장 분류",
      kind: "options",
      stateKey: "hospitalTypeIds",
      selection: "multiple",
      options: hospitalTypeOptions,
    },
    { id: "region", label: "지역", kind: "options", stateKey: "regionIds", selection: "multiple", options: domesticRegionOptions },
    { id: "experience", label: "경력", kind: "options", stateKey: "experienceId", selection: "single", options: experienceOptions },
    { id: "salary", label: "급여", kind: "options", stateKey: "salaryId", selection: "single", options: hospitalSalaryOptions },
    {
      id: "additional",
      label: "추가 조건",
      kind: "group",
      sections: [
        { id: "employment", title: "고용 형태", stateKey: "employmentTypeIds", selection: "multiple", options: employmentTypeOptions },
        { id: "shiftType", title: "근무시간·교대 형태", stateKey: "shiftTypeIds", selection: "multiple", options: shiftTypeOptions },
        { id: "education", title: "학력·자격", stateKey: "educationId", selection: "single", options: educationOptions },
      ],
    },
  ],
};
