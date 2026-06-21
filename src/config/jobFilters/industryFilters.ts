import type { JobCategoryOption, TrackFilterConfig } from "@/types/jobs";
import {
  companyTypeOptions,
  educationOptions,
  employmentTypeOptions,
  experienceOptions,
  regionOptions,
  salaryOptions,
  workModeOptions,
} from "./shared";

export const industryJobCategoryOptions: JobCategoryOption[] = [
  {
    id: "rd",
    label: "연구개발",
    subcategories: [
      { id: "new-drug", label: "신약개발", categoryId: "rd" },
      { id: "biologics-formulation-analysis", label: "바이오의약품 제제·분석", categoryId: "rd" },
      { id: "pharmacology-toxicology", label: "약리·독성", categoryId: "rd" },
      { id: "preclinical", label: "비임상", categoryId: "rd" },
      { id: "synthesis-cmc", label: "합성·CMC", categoryId: "rd" },
      { id: "medical-device-rd", label: "의료기기 R&D", categoryId: "rd" },
    ],
  },
  {
    id: "sales-marketing",
    label: "영업·마케팅",
    subcategories: [
      { id: "pharma-mr", label: "제약영업·MR", categoryId: "sales-marketing" },
      { id: "medical-device-sales", label: "의료기기 영업", categoryId: "sales-marketing" },
      { id: "marketing-pm", label: "마케팅·PM", categoryId: "sales-marketing" },
      { id: "sales-planning", label: "영업기획·관리", categoryId: "sales-marketing" },
      { id: "digital-marketing", label: "디지털마케팅", categoryId: "sales-marketing" },
      { id: "overseas-sales", label: "해외영업", categoryId: "sales-marketing" },
    ],
  },
  {
    id: "clinical",
    label: "임상",
    subcategories: [
      { id: "clinical-ops", label: "임상운영", categoryId: "clinical" },
      { id: "medical-writing", label: "Medical Writing", categoryId: "clinical" },
      { id: "cra", label: "CRA", categoryId: "clinical" },
      { id: "crc", label: "CRC", categoryId: "clinical" },
      { id: "clinical-qa", label: "임상 QA", categoryId: "clinical" },
      { id: "clinical-pm", label: "임상 PM", categoryId: "clinical" },
      { id: "clinical-dm-statistics", label: "임상 DM·통계", categoryId: "clinical" },
    ],
  },
  {
    id: "regulatory",
    label: "RA·인허가",
    subcategories: [
      { id: "ra", label: "RA", categoryId: "regulatory" },
      { id: "cmc-ra", label: "CMC RA", categoryId: "regulatory" },
      { id: "regulatory-strategy", label: "허가 전략", categoryId: "regulatory" },
      { id: "medical-device-ra", label: "의료기기 RA", categoryId: "regulatory" },
    ],
  },
  {
    id: "medical-market",
    label: "Medical·Market Access",
    subcategories: [
      { id: "medical-affairs", label: "Medical Affairs", categoryId: "medical-market" },
      { id: "msl", label: "MSL", categoryId: "medical-market" },
      { id: "heor-rwe", label: "HEOR·RWE", categoryId: "medical-market" },
      { id: "pricing-reimbursement", label: "약가·보험", categoryId: "medical-market" },
    ],
  },
  {
    id: "production-quality",
    label: "생산·품질",
    subcategories: [
      { id: "manufacturing", label: "생산·제조", categoryId: "production-quality" },
      { id: "scm", label: "SCM", categoryId: "production-quality" },
      { id: "process-tech", label: "공정기술", categoryId: "production-quality" },
      { id: "qc", label: "QC", categoryId: "production-quality" },
      { id: "qa", label: "QA", categoryId: "production-quality" },
      { id: "validation", label: "Validation", categoryId: "production-quality" },
      { id: "gmp-qms", label: "GMP·QMS", categoryId: "production-quality" },
    ],
  },
  {
    id: "pharmacy-safety",
    label: "약무·안전관리",
    subcategories: [
      { id: "pharma-pharmacy", label: "제약 약무", categoryId: "pharmacy-safety" },
      { id: "distribution-pharmacy", label: "유통 약무", categoryId: "pharmacy-safety" },
      { id: "pv-drug-safety", label: "PV·Drug Safety", categoryId: "pharmacy-safety" },
    ],
  },
  {
    id: "strategy-investment",
    label: "전략·투자",
    subcategories: [
      { id: "bd-licensing", label: "BD·Licensing", categoryId: "strategy-investment" },
      { id: "business-strategy", label: "사업전략", categoryId: "strategy-investment" },
      { id: "investment", label: "투자", categoryId: "strategy-investment" },
      { id: "ma", label: "M&A", categoryId: "strategy-investment" },
      { id: "ir", label: "IR", categoryId: "strategy-investment" },
    ],
  },
  {
    id: "data-ai",
    label: "데이터·AI",
    subcategories: [
      { id: "ai-drug-discovery", label: "AI 신약개발", categoryId: "data-ai" },
      { id: "it-software", label: "IT·Software", categoryId: "data-ai" },
      { id: "bioinformatics", label: "Bioinformatics", categoryId: "data-ai" },
      { id: "data-science", label: "Data Science", categoryId: "data-ai" },
      { id: "rwe-data", label: "RWE 데이터", categoryId: "data-ai" },
    ],
  },
  {
    id: "management",
    label: "경영지원",
    subcategories: [
      { id: "hr", label: "HR", categoryId: "management" },
      { id: "finance-accounting", label: "재무·회계", categoryId: "management" },
      { id: "legal-compliance", label: "법무·컴플라이언스", categoryId: "management" },
      { id: "purchasing-admin", label: "구매·총무", categoryId: "management" },
      { id: "pr", label: "홍보·PR", categoryId: "management" },
    ],
  },
];

export const industryFilterConfig: TrackFilterConfig = {
  track: "industry",
  filters: [
    { id: "job", label: "직무", kind: "job", categories: industryJobCategoryOptions },
    { id: "region", label: "지역", kind: "options", stateKey: "regionIds", selection: "multiple", options: regionOptions },
    { id: "experience", label: "경력", kind: "options", stateKey: "experienceId", selection: "single", options: experienceOptions },
    { id: "salary", label: "급여", kind: "options", stateKey: "salaryId", selection: "single", options: salaryOptions },
    {
      id: "companyType",
      label: "기업 유형",
      kind: "options",
      stateKey: "companyTypeIds",
      selection: "multiple",
      options: companyTypeOptions,
    },
    {
      id: "additional",
      label: "추가 조건",
      kind: "group",
      sections: [
        { id: "employment", title: "고용 형태", stateKey: "employmentTypeIds", selection: "multiple", options: employmentTypeOptions },
        { id: "workMode", title: "근무 방식", stateKey: "workModeIds", selection: "multiple", options: workModeOptions },
        { id: "education", title: "학력", stateKey: "educationId", selection: "single", options: educationOptions },
      ],
    },
  ],
};
