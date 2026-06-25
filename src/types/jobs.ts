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

export type ApplyMethod = "기업 홈페이지 지원" | "간편 지원" | "더파마 간편지원" | "이메일 지원" | "별도 안내";

export type ContentFormat = "bullet" | "numbered" | "paragraph";

export interface FormattedContent {
  format: ContentFormat;
  items: string[];
}

export type DetailBlockType = "text" | "image" | "gallery" | "table" | "process" | "benefit" | "divider" | "file";

export interface JobDetailBlock {
  type: DetailBlockType;
  title?: string;
  content?: string;
  url?: string;
  fileName?: string;
  alt?: string;
  images?: Array<{ url: string; alt: string }>;
  rows?: Array<{ label: string; value: string }>;
  items?: string[];
}

export interface JobAdditionalMaterials {
  images?: Array<{ url: string; alt: string; title?: string }>;
  files?: Array<{ name: string; url: string; description?: string }>;
}

export type CompanyNewsType = "company" | "industry" | "regulatory" | "clinical" | "investment";

export interface CompanyNewsArticle {
  id: string;
  type: CompanyNewsType;
  label: string;
  title: string;
  publishedAt: string;
  source: "더파마뉴스";
  summary: string;
  keywords: string[];
  url: string;
  contentType?: "article" | "press_release" | "sponsored" | "company_provided";
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
  | "leaderOnly"
  | "quickApplyOnly"
  | "headhuntingOnly";

export type SpecialJobFilterKey = "leaderOnly" | "headhuntingOnly" | "quickApplyOnly";

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

/**
 * 분야(트랙)별로 독립적으로 저장되는 관심조건. 필드는 해당 트랙의 `TrackFilterConfig`(`trackFilterConfigs[track]`)가
 * 실제로 사용하는 필터 키와 1:1로 대응한다 — 트랙마다 어떤 필드가 의미 있는지는 `trackFilterConfigs`를 따른다.
 * `track`/`keyword`/`leaderOnly`/`headhuntingOnly`/`quickApplyOnly`는 저장 대상이 아니라 그때그때의 검색 행동이므로 제외한다.
 */
export interface UserJobPreference {
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
  emailAlertEnabled: boolean;
  emailFrequency: EmailFrequency | null;
}

export type TrackPreferences = Partial<Record<JobTrack, UserJobPreference>>;

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
  leaderOnly: boolean;
  headhuntingOnly: boolean;
  quickApplyOnly: boolean;
}

export interface AppliedFilterChip {
  key: string;
  kind: FilterKind;
  id: string;
  label: string;
}

export type SalaryKind = "월급" | "일급" | "시급" | "면접후결정";

/** 원 단위로 정규화된 급여 표시 정보. min/max/note는 kind에 맞는 단위로 화면에서 포맷팅한다. */
export interface SalaryDetail {
  kind: SalaryKind;
  min?: number;
  max?: number;
  note?: string;
  /** 시급제 등에서 평일/주말처럼 요일별 차등이 있는 경우 */
  weekdayNet?: number;
  weekendNet?: number;
}

export interface JobWorkShift {
  label?: string;
  days: string;
  time: string;
  note?: string;
}

/** 근무지 교통편. 항목이 없으면 해당 행을 렌더링하지 않는다. */
export interface JobCommute {
  subway?: string[];
  bus?: string;
  car?: string;
  parking?: "가능" | "불가" | "지원";
}

/** 약국 근무 환경(전산/기기/인력 구성). 값이 없는 필드는 숨긴다. */
export interface PharmacyEnv {
  simpyeong?: "필요" | "불필요";
  atc?: string;
  otherDevices?: string[];
  software?: string[];
  staff?: { pharmacist?: number; support?: number };
  mainDept?: string[];
  mainHospital?: string;
}

export interface PharmacyRecruitRow {
  part: string;
  duty: string;
  qualification: string;
}

export interface JobHrTip {
  question: string;
  answer: string;
}

export type JobApplyChannel = "간편지원" | "전화" | "문자" | "이메일";

/** 지원 채널·전형절차 상세. 기존 applyMethod(단일 라벨)와 별개로 채널이 여러 개인 공고에서 사용한다. */
export interface JobApplyInfo {
  channels: JobApplyChannel[];
  blocked?: string;
  phone?: string;
  email?: string;
  documents?: string[];
  steps: string[];
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
  logoUrl?: string;
  logoColor: string;
  logoAccent?: string;
  title: string;
  role?: string;
  headcount?: string;
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
  applicationGuide?: string;
  applicationEmail?: string;
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
  coverImageMode?: "company" | "upload" | "none";
  coverImageUrl?: string;
  coreKeywords?: string[];
  responsibilitiesContent?: FormattedContent;
  requirementsContent?: FormattedContent;
  preferredContent?: FormattedContent;
  responsibilities?: string[];
  requirements?: string[];
  preferredQualifications?: string[];
  benefits?: string[];
  workType?: string;
  workSchedule?: string;
  workConditionDetail?: string;
  workConditionItems?: WorkConditionItem[];
  workConditions?: string[];
  hiringProcess?: string[];
  detailBlocks?: JobDetailBlock[];
  additionalMaterials?: JobAdditionalMaterials;
  applicationInfo?: string[];
  overview?: Array<{ label: string; value: string }>;
  coverImage?: string;
  deadlineType?: "date" | "untilHired";
  locationDetail?: JobLocationDetail;
  companyDescription?: string;
  companyHighlights?: string[];
  reviewSummary?: string;
  companyNews?: CompanyNewsArticle[];
  similarJobIds?: number[];
  isRecommended?: boolean;
  isClosed?: boolean;
  dateOrder: number;
  deadlineOrder: number;

  /** 약국 등 salary 문자열만으로 표현하기 어려운 공고에서 사용하는 정규화된 급여 상세 */
  salaryDetail?: SalaryDetail;
  /** 근무 옵션이 여러 개인 공고(약국 파트타임 등)에서 사용 */
  workShifts?: JobWorkShift[];
  /** 본문 근무지 교통편. locationDetail(지하철 중심)과 별개로, 지하철이 없는 공고에서 사용 */
  commute?: JobCommute;
  pharmacyEnv?: PharmacyEnv;
  /** 모집부문 및 자격요건 표. 복수 모집부문을 지원한다 */
  recruitTable?: PharmacyRecruitRow[];
  /** 상세 모집 내용(포지션 소개와 별개의 본문) */
  recruitDetails?: FormattedContent;
  hrTips?: JobHrTip[];
  /** 지원 채널이 여러 개이거나 차단 안내가 필요한 공고에서 사용 */
  applyInfo?: JobApplyInfo;
}

export interface Company {
  id: string;
  name: string;
  logoText: string;
  logoUrl?: string;
  logoColor: string;
  logoAccent?: string;
  coverImage?: string;
  defaultImage?: string;
  verified: boolean;
  description: string;
  industry: string;
  employeeCount: string;
  foundedYear: string;
  website: string;
  /** 마스킹된 대표자명(예: "정*래"). 실명 노출이 어려운 업종에서 사용 */
  repName?: string;
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
