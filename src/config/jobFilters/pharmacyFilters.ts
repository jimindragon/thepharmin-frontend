import type { FilterOption, JobCategoryOption, TrackFilterConfig } from "@/types/jobs";
import { domesticRegionOptions, educationOptions, experienceOptions, scheduleOptions } from "./shared";

export const pharmacyJobCategoryOptions: JobCategoryOption[] = [
  {
    id: "pharmacist",
    label: "약사",
    subcategories: [
      { id: "managing_pharmacist", label: "관리약사", categoryId: "pharmacist" },
      { id: "staff_pharmacist", label: "근무약사", categoryId: "pharmacist" },
    ],
  },
  {
    id: "pharmacy-support",
    label: "약국 지원인력",
    subcategories: [
      { id: "pharmacy_assistant", label: "약무보조", categoryId: "pharmacy-support" },
      { id: "pharmacy_computer_staff", label: "약국 전산", categoryId: "pharmacy-support" },
      { id: "pharmacy_computer_and_assistant", label: "전산+약무 겸직", categoryId: "pharmacy-support" },
    ],
  },
];

export const pharmacyWorkTypeOptions: FilterOption[] = [
  { id: "full_time", label: "풀타임" },
  { id: "part_time", label: "파트타임" },
  { id: "temporary_substitute", label: "단기·대체" },
  { id: "weekend_night", label: "주말·야간" },
];

export const hourlyPayRangeOptions: FilterOption[] = [
  { id: "under-25000", label: "세후 ~2.5만원" },
  { id: "25000-30000", label: "세후 2.5~3만원" },
  { id: "30000-35000", label: "세후 3~3.5만원" },
  { id: "35000-40000", label: "세후 3.5~4만원" },
  { id: "40000-plus", label: "세후 4만원~" },
];

export const pharmacyFeatureOptions: FilterOption[] = [
  { id: "prescription_focused", label: "처방조제 중심" },
  { id: "otc_focused", label: "일반약 중심" },
  { id: "clinic_front", label: "병·의원 문전" },
  { id: "tertiary_hospital_front", label: "대형병원 문전" },
  { id: "foreign_customer_focused", label: "외국인 중심" },
];

export const pharmacyFilterConfig: TrackFilterConfig = {
  track: "pharmacy",
  filters: [
    { id: "job", label: "모집 직군", kind: "job", categories: pharmacyJobCategoryOptions },
    {
      id: "pharmacyFeature",
      label: "약국 특성",
      kind: "options",
      stateKey: "pharmacyFeatureIds",
      selection: "multiple",
      options: pharmacyFeatureOptions,
    },
    { id: "region", label: "지역", kind: "options", stateKey: "regionIds", selection: "multiple", options: domesticRegionOptions },
    { id: "workType", label: "근무 형태", kind: "options", stateKey: "workTypeIds", selection: "multiple", options: pharmacyWorkTypeOptions },
    { id: "hourlyPay", label: "시급", kind: "options", stateKey: "hourlyPayRangeId", selection: "single", options: hourlyPayRangeOptions },
    {
      id: "additional",
      label: "추가 조건",
      kind: "group",
      sections: [
        { id: "experience", title: "경력", stateKey: "experienceId", selection: "single", options: experienceOptions },
        { id: "schedule", title: "근무 요일·시간", stateKey: "scheduleIds", selection: "multiple", options: scheduleOptions },
        { id: "education", title: "학력·자격", stateKey: "educationId", selection: "single", options: educationOptions },
      ],
    },
  ],
};
