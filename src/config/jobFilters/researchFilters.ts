import type { FilterOption, JobCategoryOption, TrackFilterConfig } from "@/types/jobs";
import {
  contractPeriodOptions,
  educationOptions,
  employmentTypeOptions,
  experienceOptions,
  regionOptions,
  salaryOptions,
  workModeOptions,
} from "./shared";

export const researchJobCategoryOptions: JobCategoryOption[] = [
  {
    id: "research-position",
    label: "연구직",
    subcategories: [
      { id: "research_scientist", label: "연구원", categoryId: "research-position" },
      { id: "postdoctoral_researcher", label: "박사후연구원·포닥", categoryId: "research-position" },
      { id: "research_professor_pi", label: "연구교수·연구책임자·PI", categoryId: "research-position" },
    ],
  },
  {
    id: "research-operations",
    label: "연구운영",
    subcategories: [
      {
        id: "research_administration",
        label: "연구지원·과제관리",
        description: "연구행정, 연구비 관리, 과제 운영",
        categoryId: "research-operations",
      },
    ],
  },
  {
    id: "clinical-translational",
    label: "임상·중개연구",
    subcategories: [
      {
        id: "clinical_translational_research",
        label: "임상연구",
        description: "병원 기반 중개연구, 임상연구, 연구 코디네이션",
        categoryId: "clinical-translational",
      },
    ],
  },
];

export const researchInstitutionTypeOptions: FilterOption[] = [
  { id: "government_research_institute", label: "정부출연연구기관" },
  { id: "university_lab", label: "대학·의과대학 연구실" },
  { id: "hospital_research_institute", label: "병원 연구소" },
  { id: "national_research_agency", label: "국가기관·산하 연구기관" },
  { id: "nonprofit_research_foundation", label: "비영리 연구재단" },
];

export const researchFilterConfig: TrackFilterConfig = {
  track: "research",
  filters: [
    { id: "job", label: "직무", kind: "job", categories: researchJobCategoryOptions },
    {
      id: "institutionType",
      label: "기관 유형",
      kind: "options",
      stateKey: "institutionTypeIds",
      selection: "multiple",
      options: researchInstitutionTypeOptions,
    },
    { id: "region", label: "지역", kind: "options", stateKey: "regionIds", selection: "multiple", options: regionOptions },
    { id: "education", label: "학력", kind: "options", stateKey: "educationId", selection: "single", options: educationOptions },
    { id: "experience", label: "경력", kind: "options", stateKey: "experienceId", selection: "single", options: experienceOptions },
    { id: "salary", label: "급여", kind: "options", stateKey: "salaryId", selection: "single", options: salaryOptions },
    {
      id: "additional",
      label: "추가 조건",
      kind: "group",
      sections: [
        { id: "employment", title: "고용 형태", stateKey: "employmentTypeIds", selection: "multiple", options: employmentTypeOptions },
        { id: "contractPeriod", title: "계약 기간", stateKey: "contractPeriodIds", selection: "multiple", options: contractPeriodOptions },
        { id: "workMode", title: "근무 방식", stateKey: "workModeIds", selection: "multiple", options: workModeOptions },
      ],
    },
  ],
};
