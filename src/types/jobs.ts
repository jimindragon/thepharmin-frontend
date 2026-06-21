export type JobTrack = "industry" | "research" | "pharmacy" | "hospital";

export type Category = "산업" | "연구" | "약국" | "병원";

export type PostingSource = "direct" | "headhunting";

export type OrganizationType =
  | "pharmaceutical_company"
  | "biotech_company"
  | "medical_device_company"
  | "cro"
  | "cdmo"
  | "for_profit_research_lab"
  | "government_research_institute"
  | "university_lab"
  | "hospital_research_institute"
  | "national_research_agency"
  | "nonprofit_research_foundation"
  | "pharmacy"
  | "hospital";

export type PayType = "hourly" | "daily" | "monthly" | "annual";

export interface SalaryRange {
  payType: PayType;
  min: number | null;
  max: number | null;
}

export type SortOption = "추천순" | "최신순" | "마감임박순";

export type ClosingStatus = "dDay" | "today" | "always";

export type ApplyMethod = "기업 홈페이지 지원" | "간편 지원";

export type ContentFormat = "bullet" | "numbered" | "paragraph";

export interface FormattedContent {
  format: ContentFormat;
  items: string[];
}

export type DetailBlockType = "text" | "image" | "gallery" | "table" | "process" | "benefit" | "divider";

export interface JobDetailBlock {
  type: DetailBlockType;
  title?: string;
  content?: string;
  url?: string;
  alt?: string;
  images?: Array<{ url: string; alt: string }>;
  rows?: Array<{ label: string; value: string }>;
  items?: string[];
}

export interface WorkConditionItem {
  label: string;
  value: string;
}

export interface JobLocationDetail {
  address: string;
  building?: string;
  nearestStation?: string;
  walkingTime?: string;
  workMode?: string;
}

export type FilterKind =
  | "keyword"
  | "jobCategory"
  | "jobSubcategory"
  | "experience"
  | "education"
  | "region"
  | "employmentType"
  | "salary"
  | "workMode"
  | "companyType"
  | "institutionType"
  | "contractPeriod"
  | "workType"
  | "hourlyPay"
  | "pharmacyFeature"
  | "schedule"
  | "hospitalType"
  | "shiftType"
  | "headhuntingOnly";

export interface FilterOption {
  id: string;
  label: string;
  description?: string;
}

export interface ExperienceFilterOption extends FilterOption {
  min: number | null;
  max: number | null;
}

export interface SalaryFilterOption extends FilterOption {
  min: number | null;
}

export interface JobSubcategoryOption extends FilterOption {
  categoryId: string;
}

export interface JobCategoryOption extends FilterOption {
  subcategories: JobSubcategoryOption[];
}

export type FilterStateKey =
  | "regionIds"
  | "employmentTypeIds"
  | "companyTypeIds"
  | "workModeIds"
  | "institutionTypeIds"
  | "contractPeriodIds"
  | "workTypeIds"
  | "pharmacyFeatureIds"
  | "scheduleIds"
  | "hospitalTypeIds"
  | "shiftTypeIds";

export type SingleFilterStateKey = "experienceId" | "educationId" | "salaryId" | "hourlyPayRangeId";

export interface FilterSectionDefinition {
  id: string;
  title: string;
  stateKey: FilterStateKey | SingleFilterStateKey;
  selection: "single" | "multiple";
  options: FilterOption[];
}

export type FilterDefinition =
  | {
      id: "job";
      label: string;
      kind: "job";
      categories: JobCategoryOption[];
    }
  | {
      id: string;
      label: string;
      kind: "options";
      stateKey: FilterStateKey | SingleFilterStateKey;
      selection: "single" | "multiple";
      options: FilterOption[];
    }
  | {
      id: "additional";
      label: string;
      kind: "group";
      sections: FilterSectionDefinition[];
    };

export interface TrackFilterConfig {
  track: JobTrack;
  filters: FilterDefinition[];
}

export type EmailFrequency = "daily" | "twice-weekly" | "weekly";

export type PreferenceScenarioId = "unset" | "configured" | "applied";

export interface UserJobPreference {
  jobSubcategoryIds: string[];
  experienceId: string | null;
  educationId: string | null;
  regionIds: string[];
  employmentTypeIds: string[];
  workModeIds: string[];
  emailAlertEnabled: boolean;
  emailFrequency: EmailFrequency | null;
}

export interface JobFilters {
  track: JobTrack;
  keyword: string;
  jobCategoryIds: string[];
  jobSubcategoryIds: string[];
  experienceId: string | null;
  educationId: string | null;
  regionIds: string[];
  employmentTypeIds: string[];
  salaryId: string | null;
  workModeIds: string[];
  companyTypeIds: string[];
  institutionTypeIds: string[];
  contractPeriodIds: string[];
  workTypeIds: string[];
  hourlyPayRangeId: string | null;
  pharmacyFeatureIds: string[];
  scheduleIds: string[];
  hospitalTypeIds: string[];
  shiftTypeIds: string[];
  headhuntingOnly: boolean;
}

export interface AppliedFilterChip {
  key: string;
  kind: FilterKind;
  id: string;
  label: string;
}

export interface Job {
  id: number;
  slug?: string;
  organizationId: string;
  organizationType: OrganizationType;
  track: JobTrack;
  postingSource: PostingSource;
  companyId?: string;
  company: string;
  logoText: string;
  logoColor: string;
  logoAccent?: string;
  title: string;
  jobCategory?: string;
  career: string;
  education: string;
  employmentType: string;
  location: string;
  address?: string;
  salary: string;
  tags: string[];
  deadline?: string;
  deadlineLabel: string;
  deadlineDate: string;
  closingStatus: ClosingStatus;
  applyMethod: ApplyMethod;
  applicationUrl?: string;
  applicationNotice?: string;
  category: Category;
  jobSubcategoryIds: string[];
  employmentTypeIds?: string[];
  experienceMin: number;
  experienceMax: number | null;
  educationId: string;
  regionId: string;
  employmentTypeId: string;
  salaryRange?: SalaryRange | null;
  salaryMin: number | null;
  salaryMax: number | null;
  workModeIds: string[];
  companyTypeId: string;
  researchInstitutionTypeIds?: string[];
  researchFieldIds?: string[];
  contractPeriodIds?: string[];
  pharmacyWorkTypeIds?: string[];
  pharmacyFeatureIds?: string[];
  scheduleIds?: string[];
  hospitalTypeId?: string;
  hospitalTypeIds?: string[];
  shiftTypeIds?: string[];
  searchKeywords: string[];
  industry?: string;
  introduction?: string;
  oneLineIntro?: string;
  coreKeywords?: string[];
  responsibilitiesContent?: FormattedContent;
  requirementsContent?: FormattedContent;
  preferredContent?: FormattedContent;
  responsibilities?: string[];
  requirements?: string[];
  preferredQualifications?: string[];
  benefits?: string[];
  workConditionItems?: WorkConditionItem[];
  workConditions?: string[];
  hiringProcess?: string[];
  detailBlocks?: JobDetailBlock[];
  applicationInfo?: string[];
  overview?: Array<{ label: string; value: string }>;
  coverImage?: string;
  locationDetail?: JobLocationDetail;
  companyDescription?: string;
  companyHighlights?: string[];
  reviewSummary?: string;
  similarJobIds?: number[];
  isRecommended?: boolean;
  isClosed?: boolean;
  dateOrder: number;
  deadlineOrder: number;
}

export interface Company {
  id: string;
  name: string;
  logoText: string;
  logoColor: string;
  logoAccent?: string;
  verified: boolean;
  description: string;
  industry: string;
  employeeCount: string;
  foundedYear: string;
  website: string;
  activeJobCount: number;
  address: string;
}

export type CompanyReviewType = "interview" | "company";

export interface CompanyReview {
  id: string;
  companyId: string;
  type: CompanyReviewType;
  tags: string[];
  content: string;
  jobRole: string;
  authorStatus: string;
  writtenAt: string;
  helpfulCount: number;
  isRead?: boolean;
}

export interface ReviewAccessState {
  remainingPasses: number;
  canRead: boolean;
  statusText: string;
}

export interface RecommendedJob {
  id: number;
  jobSlug?: string;
  company: string;
  title: string;
  condition: string;
  tags: string[];
  dDay: string;
  applyMethod: ApplyMethod;
  image: string;
  track: JobTrack;
  postingSource?: PostingSource;
}
