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

/** PDF 등 파일로 업로드한 첨부형 이력서. */
export interface AttachmentResume {
  id: string;
  kind: "attachment";
  fileName: string;
  isPrimary: boolean;
  proposalEnabled: boolean;
  updatedAt: string;
  fileSizeLabel: string;
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
    updatedAt: new Date().toISOString().slice(0, 10),
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
 * 이력서의 항목 작성 여부를 7개 영역(필수 3 + 선택 4) 동일 비중으로 환산한 완성도.
 * 저장된 숫자를 그대로 믿지 않고 실제 입력 내용에서 매번 계산해, 에디터에서 값을
 * 바꾸는 즉시 완성도·상태 배지가 함께 갱신되도록 한다.
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

export function calculateResumeCompletion(resume: BuiltResume) {
  const sections = getSectionCompletion(resume);
  const values = Object.values(sections);
  const doneCount = values.filter(Boolean).length;
  return Math.round((doneCount / values.length) * 100);
}

export function isResumeComplete(resume: BuiltResume) {
  return calculateResumeCompletion(resume) === 100;
}

export const mockResumes: ResumeItem[] = [
  {
    id: "resume-ra",
    kind: "built",
    title: "RA 직무용",
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
        company: "더팜인제약(주)",
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
    title: "메디컬 마케팅용",
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
