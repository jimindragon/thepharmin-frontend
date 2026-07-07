import type { FilterOption, JobCategoryOption, TrackFilterConfig } from "@/types/jobs";
import { researchFieldCategoryOptions } from "@/config/researchFields";
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
      { id: "researcher", label: "연구원", categoryId: "research-position" },
      { id: "senior-researcher", label: "선임·책임연구원", categoryId: "research-position" },
      { id: "postdoc", label: "박사후연구원·포닥", categoryId: "research-position" },
      { id: "research-professor-pi", label: "연구교수·PI", categoryId: "research-position" },
      { id: "technician", label: "테크니션·연구보조", categoryId: "research-position" },
    ],
  },
  {
    id: "research-operations",
    label: "연구지원·운영",
    subcategories: [
      { id: "research-support", label: "연구지원·과제관리", categoryId: "research-operations" },
      { id: "research-admin", label: "연구행정·연구비 관리", categoryId: "research-operations" },
      { id: "lab-management", label: "연구실 운영·장비관리", categoryId: "research-operations" },
    ],
  },
  {
    id: "clinical-research-ops",
    label: "임상연구 운영",
    subcategories: [
      { id: "crc", label: "임상연구 코디네이터", categoryId: "clinical-research-ops" },
      { id: "trial-operations", label: "임상시험 운영", categoryId: "clinical-research-ops" },
      { id: "clinical-dm", label: "임상데이터 관리", categoryId: "clinical-research-ops" },
    ],
  },
  {
    id: "data-analysis",
    label: "데이터·분석",
    subcategories: [
      { id: "data-analyst", label: "데이터 분석 연구원", categoryId: "data-analysis" },
      { id: "bioinformatics-researcher", label: "바이오인포매틱스 연구원", categoryId: "data-analysis" },
      { id: "computational-biology", label: "AI·계산생물학 연구원", categoryId: "data-analysis" },
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

export function getResearchInstitutionTypeLabel(id: string): string {
  return researchInstitutionTypeOptions.find((option) => option.id === id)?.label ?? id;
}

export const researchFilterConfig: TrackFilterConfig = {
  track: "research",
  filters: [
    { id: "job", label: "직무", kind: "job", categories: researchJobCategoryOptions },
    { id: "researchField", label: "연구 분야", kind: "researchField", categories: researchFieldCategoryOptions },
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
