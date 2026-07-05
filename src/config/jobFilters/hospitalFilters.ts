import type { FilterOption, HospitalType, JobCategoryOption, TrackFilterConfig } from "@/types/jobs";
import { hospitalTypeLabels } from "@/config/companyTypes";
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

/** Company.hospitalType/hospitalTypeLabels와 동일한 6종 slug를 그대로 필터 id로 쓴다(더 이상 별도 id 체계 없음) */
const hospitalTypeDescriptions: Partial<Record<HospitalType, string>> = {
  tertiary: "3차",
  general: "2차",
};

export const hospitalTypeOptions: FilterOption[] = (Object.keys(hospitalTypeLabels) as HospitalType[]).map((id) => ({
  id,
  label: hospitalTypeLabels[id],
  description: hospitalTypeDescriptions[id],
}));

/** 병원 프로필의 "약제부 업무 영역"(선택, 다중선택). 공고 등록/필터엔 노출하지 않는다 — 병원 프로필 입력과 구직자 상세 조회 전용 */
export const pharmacyDutyAreaOptions: FilterOption[] = [
  { id: "inpatient_dispensing", label: "입원환자 조제" },
  { id: "outpatient_dispensing", label: "외래 조제" },
  { id: "injection_dispensing", label: "주사제 조제" },
  { id: "sterile_compounding", label: "무균조제" },
  { id: "chemo_compounding", label: "항암조제" },
  { id: "clinical_pharmacy", label: "임상약료" },
  { id: "medication_counseling", label: "복약상담" },
  { id: "drug_inventory_management", label: "의약품 관리" },
  { id: "investigational_drug_management", label: "임상시험약 관리" },
  { id: "narcotics_management", label: "마약류 관리" },
  { id: "tpn_compounding", label: "TPN 조제" },
  { id: "nst_participation", label: "NST 참여" },
  { id: "tdm_participation", label: "TDM 참여" },
  { id: "infection_control_participation", label: "감염관리 참여" },
];

/** 병원 프로필의 "진료과목"(필수, 다중선택). 공고 등록/필터엔 노출하지 않는다 — 병원 프로필 입력과 구직자 상세 조회 전용 */
export const medicalDepartmentOptions: FilterOption[] = [
  { id: "family_medicine", label: "가정의학과" },
  { id: "tuberculosis", label: "결핵과" },
  { id: "internal_medicine", label: "내과" },
  { id: "anesthesiology_pain_medicine", label: "마취통증의학과" },
  { id: "radiation_oncology", label: "방사선종양학과" },
  { id: "pathology", label: "병리과" },
  { id: "urology", label: "비뇨의학과" },
  { id: "obstetrics_gynecology", label: "산부인과" },
  { id: "plastic_surgery", label: "성형외과" },
  { id: "pediatrics", label: "소아청소년과" },
  { id: "neurology", label: "신경과" },
  { id: "neurosurgery", label: "신경외과" },
  { id: "ophthalmology", label: "안과" },
  { id: "radiology", label: "영상의학과" },
  { id: "preventive_medicine", label: "예방의학과" },
  { id: "surgery", label: "외과" },
  { id: "emergency_medicine", label: "응급의학과" },
  { id: "otolaryngology", label: "이비인후과" },
  { id: "rehabilitation_medicine", label: "재활의학과" },
  { id: "psychiatry", label: "정신건강의학과" },
  { id: "orthopedics", label: "정형외과" },
  { id: "occupational_environmental_medicine", label: "직업환경의학과" },
  { id: "laboratory_medicine", label: "진단검사의학과" },
  { id: "dermatology", label: "피부과" },
  { id: "nuclear_medicine", label: "핵의학과" },
  { id: "thoracic_surgery", label: "흉부외과" },
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
