import { MOCK_TODAY } from "@/config/mockToday";
import type { JobTrack } from "@/types/jobs";

export interface ResumeWorkPreference {
  track: JobTrack;
  experienceId: string | null;
  regionIds: string[];
  salaryId: string | null;
  employmentTypeId: string | null;
}

export interface ResumeEducation {
  school: string;
  degreeId: string | null;
  major: string;
}

export interface ResumeCertificate {
  id: string;
  name: string;
  issuedYear: string;
  issuer: string;
}

export interface ResumeCareerEntry {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface ResumeLanguage {
  id: string;
  name: string;
  level: string;
}

/** 실제 이력서 항목(직접 작성형). 완성·작성 중 여부는 completion으로 판단하고 별도 플래그로 들고 있지 않는다. */
export interface BuiltResume {
  id: string;
  kind: "built";
  title: string;
  isPrimary: boolean;
  proposalEnabled: boolean;
  updatedAt: string;
  jobSubcategoryIds: string[];
  workPreference: ResumeWorkPreference;
  education: ResumeEducation;
  certificates: ResumeCertificate[];
  careers: ResumeCareerEntry[];
  languages: ResumeLanguage[];
  selfIntroduction: string;
}

/** 이력서 "내용" 필드 서브셋. applicantResumes.ts의 ApplicantResume과 구조 1:1 —
 * 읽기 전용 뷰(ResumeContentView)가 양쪽을 받을 수 있게 하는 공통 형태.
 * 필드 변경 시 양쪽 정합 유지할 것 */
export type ResumeContent = Pick<
  BuiltResume,
  "workPreference" | "education" | "certificates" | "jobSubcategoryIds" | "careers" | "languages" | "selfIntroduction"
>;

/** PDF 등 파일로 업로드한 첨부형 이력서. */
export interface AttachmentResume {
  id: string;
  kind: "attachment";
  fileName: string;
  isPrimary: boolean;
  proposalEnabled: boolean;
  updatedAt: string;
  fileSizeLabel: string;
  /**
   * 이번 세션에 업로드한 파일의 브라우저 메모리 참조. 저장소가 없어 새로고침하면 사라지므로
   * 선택 항목이다 — 처음부터 목록에 있던 목데이터에는 없다(파일 실체가 없는 표시용 레코드).
   * 파일 내용을 읽어야 하는 단계(이력서 변환)가 이 자리를 쓴다.
   */
  file?: File;
}

export type ResumeItem = BuiltResume | AttachmentResume;

export const emptyWorkPreference: ResumeWorkPreference = {
  track: "industry",
  experienceId: null,
  regionIds: [],
  salaryId: null,
  employmentTypeId: null,
};

export const emptyEducation: ResumeEducation = {
  school: "",
  degreeId: null,
  major: "",
};

export function createEmptyBuiltResume(id: string): BuiltResume {
  return {
    id,
    kind: "built",
    title: "새 이력서",
    isPrimary: false,
    proposalEnabled: false,
    // 실제 시계를 쓰지 않는다 — 시연 기준일로 고정한다. 카드가 "-"를 "."로 바꿔 그리므로
    // 저장 형식은 기존 목데이터·업로드분과 같은 하이픈 형식으로 맞춘다.
    updatedAt: MOCK_TODAY.replaceAll(".", "-"),
    jobSubcategoryIds: [],
    workPreference: { ...emptyWorkPreference },
    education: { ...emptyEducation },
    certificates: [],
    careers: [],
    languages: [],
    selfIntroduction: "",
  };
}

/**
 * 이력서 7개 영역의 항목 작성 여부. 저장된 값을 믿지 않고 실제 입력 내용에서 매번
 * 계산해, 에디터에서 값을 바꾸는 즉시 배지가 함께 갱신되도록 한다.
 *
 * "항목이 존재하는가"만 본다 — 내용이 비어 있어도 참이다. 매칭에 쓸 수 있는지는
 * 이보다 엄격해야 하므로 getMatchReadiness가 따로 판정한다.
 */
export function getSectionCompletion(resume: BuiltResume) {
  return {
    workPreference: Boolean(resume.workPreference.experienceId && resume.workPreference.regionIds.length > 0),
    education: Boolean(resume.education.school.trim() && resume.education.degreeId && resume.education.major.trim()),
    jobSubcategory: resume.jobSubcategoryIds.length > 0,
    certificates: resume.certificates.length > 0,
    careers: resume.careers.length > 0,
    languages: resume.languages.length > 0,
    selfIntroduction: resume.selfIntroduction.trim().length > 0,
  };
}

/** 이력서를 지원에 쓸 수 있게 하는 필수 3영역. 나머지 4개는 매칭 품질에만 관여한다. */
export const requiredSectionKeys = ["workPreference", "education", "jobSubcategory"] as const;

/** 아직 채워지지 않은 필수 영역. 관문 판정과 "N개 남았어요" 문구가 같은 값을 본다. */
export function getMissingRequiredSections(resume: BuiltResume) {
  const sections = getSectionCompletion(resume);
  return requiredSectionKeys.filter((key) => !sections[key]);
}

/** 관문 — 필수 3영역이 모두 충족되면 지원·간편지원에 쓸 수 있다. */
export function isResumeUsable(resume: BuiltResume) {
  return getMissingRequiredSections(resume).length === 0;
}

export type ResumeMatchReadiness = "basic" | "medium" | "full";

/**
 * 매칭에 실제로 반영되는 3영역(자격·경력·자기소개)이 몇 개나 채워졌는지로 매기는 3단계.
 *
 * getSectionCompletion과 달리 항목 수가 아니라 내용을 본다 — "추가" 버튼만 눌러 만든
 * 빈 행으로는 단계가 오르지 않는다. 어학은 매칭 산정에 쓰이지 않아 세지 않는다.
 */
export function getMatchReadiness(resume: BuiltResume): ResumeMatchReadiness {
  const filled = [
    resume.certificates.some((item) => item.name.trim()),
    resume.careers.some((item) => item.company.trim() || item.role.trim()),
    resume.selfIntroduction.trim().length > 0,
  ].filter(Boolean).length;

  if (filled === 0) return "basic";
  return filled === 3 ? "full" : "medium";
}

export const mockResumes: ResumeItem[] = [
  {
    id: "resume-ra",
    kind: "built",
    title: "RA 이직용 (2026 상반기)",
    isPrimary: true,
    proposalEnabled: true,
    updatedAt: "2026-06-20",
    jobSubcategoryIds: ["ra", "cmc-ra", "regulatory-strategy"],
    workPreference: {
      track: "industry",
      experienceId: "3-5",
      regionIds: ["seoul", "gyeonggi"],
      salaryId: "company-policy",
      employmentTypeId: "permanent",
    },
    education: { school: "서울대학교", degreeId: "master", major: "약학" },
    certificates: [
      { id: "cert-1", name: "약사 면허", issuedYear: "2024", issuer: "보건복지부" },
      { id: "cert-2", name: "RAC (Regulatory Affairs Certification)", issuedYear: "", issuer: "" },
    ],
    careers: [
      {
        id: "career-1",
        company: "더파마제약(주)",
        role: "RA Specialist",
        period: "2022.03 - 재직중",
        description: "품목허가 및 변경허가, CTD 작성·제출, 규제기관 대응 업무를 담당했습니다.",
      },
    ],
    languages: [{ id: "lang-1", name: "영어", level: "비즈니스 회화 가능" }],
    selfIntroduction:
      "제약·바이오 RA 업무를 3년 이상 담당하며 국내외 허가 전략 수립과 CTD 작성 경험을 쌓았습니다. 규제기관과의 커뮤니케이션을 통해 신속한 허가를 이끄는 것에 강점이 있습니다.",
  },
  {
    id: "resume-medical-marketing",
    kind: "built",
    title: "메디컬 마케팅 도전용",
    isPrimary: false,
    proposalEnabled: false,
    updatedAt: "2026-06-10",
    jobSubcategoryIds: ["marketing-pm", "pharma-mr"],
    workPreference: {
      track: "industry",
      experienceId: "1-3",
      regionIds: ["seoul"],
      salaryId: null,
      employmentTypeId: null,
    },
    education: { school: "", degreeId: null, major: "" },
    certificates: [],
    careers: [],
    languages: [],
    selfIntroduction: "",
  },
  {
    id: "resume-attachment-career",
    kind: "attachment",
    fileName: "경력기술서_2026.pdf",
    isPrimary: false,
    proposalEnabled: false,
    updatedAt: "2026-05-30",
    fileSizeLabel: "1.2MB",
  },
];
