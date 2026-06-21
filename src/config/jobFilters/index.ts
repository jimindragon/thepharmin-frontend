import type { FilterOption, JobTrack, TrackFilterConfig } from "@/types/jobs";
import { hospitalFilterConfig, hospitalJobCategoryOptions, hospitalTypeOptions, shiftTypeOptions } from "./hospitalFilters";
import { industryFilterConfig, industryJobCategoryOptions } from "./industryFilters";
import { hourlyPayRangeOptions, pharmacyFeatureOptions, pharmacyFilterConfig, pharmacyJobCategoryOptions, pharmacyWorkTypeOptions } from "./pharmacyFilters";
import { researchFilterConfig, researchInstitutionTypeOptions, researchJobCategoryOptions } from "./researchFilters";
import {
  companyTypeOptions,
  contractPeriodOptions,
  domesticRegionOptions,
  educationOptions,
  educationRank,
  employmentTypeOptions,
  experienceOptions,
  regionOptions,
  salaryOptions,
  scheduleOptions,
  workModeOptions,
} from "./shared";

export {
  companyTypeOptions,
  contractPeriodOptions,
  domesticRegionOptions,
  educationOptions,
  educationRank,
  employmentTypeOptions,
  experienceOptions,
  hospitalJobCategoryOptions,
  hospitalTypeOptions,
  hourlyPayRangeOptions,
  industryJobCategoryOptions,
  pharmacyFeatureOptions,
  pharmacyJobCategoryOptions,
  pharmacyWorkTypeOptions,
  regionOptions,
  researchInstitutionTypeOptions,
  researchJobCategoryOptions,
  salaryOptions,
  scheduleOptions,
  shiftTypeOptions,
  workModeOptions,
};

export const trackFilterConfigs: Record<JobTrack, TrackFilterConfig> = {
  industry: industryFilterConfig,
  research: researchFilterConfig,
  pharmacy: pharmacyFilterConfig,
  hospital: hospitalFilterConfig,
};

export const jobCategoryOptions = industryJobCategoryOptions;

export const allJobCategoryOptions = [
  ...industryJobCategoryOptions,
  ...researchJobCategoryOptions,
  ...pharmacyJobCategoryOptions,
  ...hospitalJobCategoryOptions,
];

export const jobSubcategoryOptions = allJobCategoryOptions.flatMap((category) => category.subcategories);

export const allFilterOptions: Record<string, FilterOption[]> = {
  jobCategory: allJobCategoryOptions,
  jobSubcategory: jobSubcategoryOptions,
  region: regionOptions,
  experience: experienceOptions,
  education: educationOptions,
  employmentType: employmentTypeOptions,
  salary: salaryOptions,
  workMode: workModeOptions,
  companyType: companyTypeOptions,
  institutionType: researchInstitutionTypeOptions,
  contractPeriod: contractPeriodOptions,
  workType: pharmacyWorkTypeOptions,
  hourlyPay: hourlyPayRangeOptions,
  pharmacyFeature: pharmacyFeatureOptions,
  schedule: scheduleOptions,
  hospitalType: hospitalTypeOptions,
  shiftType: shiftTypeOptions,
};

export const optionLabelMaps = Object.fromEntries(
  Object.entries(allFilterOptions).map(([key, options]) => [key, new Map(options.map((option) => [option.id, option.label]))]),
) as Record<string, Map<string, string>>;
