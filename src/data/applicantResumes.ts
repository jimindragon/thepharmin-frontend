import type {
  ResumeCareerEntry,
  ResumeCertificate,
  ResumeEducation,
  ResumeLanguage,
  ResumeWorkPreference,
} from "@/data/resumes";

export interface ApplicantResumeAttachment {
  fileName: string;
  fileSizeLabel: string;
}

export interface ApplicantResume {
  applicantId: string;
  workPreference: ResumeWorkPreference;
  education: ResumeEducation;
  certificates: ResumeCertificate[];
  jobSubcategoryIds: string[];
  careers: ResumeCareerEntry[];
  languages: ResumeLanguage[];
  selfIntroduction: string;
  attachments: ApplicantResumeAttachment[];
}

export const applicantResumes: ApplicantResume[] = [
  {
    applicantId: "ap-1",
    workPreference: {
      track: "industry",
      experienceId: "5-10",
      regionIds: ["seoul", "gyeonggi"],
      salaryId: "7000",
      employmentTypeId: "permanent",
    },
    education: { school: "서울대학교", degreeId: "master", major: "약학" },
    certificates: [{ id: "ap1-cert-1", name: "생물공학기사", issuedYear: "2016", issuer: "한국산업인력공단" }],
    jobSubcategoryIds: ["biologics-formulation-analysis", "process-tech"],
    careers: [
      {
        id: "ap1-career-1",
        company: "한미약품(주)",
        role: "제제연구팀 선임연구원",
        period: "2018.03 - 재직중",
        description: "고형제 및 주사제 제형 개발과 파일럿 스케일업 공정을 주도했습니다.",
      },
      {
        id: "ap1-career-2",
        company: "(주)유한양행",
        role: "제제연구원",
        period: "2016.01 - 2018.02",
        description: "신약 후보물질의 초기 제형 스크리닝과 안정성 평가를 담당했습니다.",
      },
    ],
    languages: [{ id: "ap1-lang-1", name: "영어", level: "비즈니스 회화 가능" }],
    selfIntroduction:
      "9년간 고형제·주사제 제형 개발과 상업화 스케일업 프로젝트를 다수 수행했습니다. 위탁생산처 기술이전 과정에서 공정 검증과 품질 이슈 대응을 주도한 경험이 있습니다. 신약 파이프라인의 제형 설계 단계부터 참여하고 싶습니다.",
    attachments: [{ fileName: "경력기술서_2026.pdf", fileSizeLabel: "1.3MB" }],
  },
  {
    applicantId: "ap-2",
    workPreference: {
      track: "industry",
      experienceId: "5-10",
      regionIds: ["seoul"],
      salaryId: "5000",
      employmentTypeId: "permanent",
    },
    education: { school: "연세대학교", degreeId: "master", major: "제약학" },
    certificates: [],
    jobSubcategoryIds: ["synthesis-cmc", "biologics-formulation-analysis"],
    careers: [
      {
        id: "ap2-career-1",
        company: "(주)종근당",
        role: "CMC팀 연구원",
        period: "2020.02 - 재직중",
        description: "원료의약품 및 완제의약품의 CMC 자료 작성과 공정 분석법 검증을 수행했습니다.",
      },
      {
        id: "ap2-career-2",
        company: "부광약품",
        role: "제제연구원",
        period: "2019.01 - 2020.01",
        description: "제네릭 의약품 처방 설계 및 예비 안정성 시험을 진행했습니다.",
      },
    ],
    languages: [],
    selfIntroduction:
      "7년간 CMC 자료 작성과 제형 분석 업무를 함께 수행하며 인허가팀과의 협업 경험을 쌓았습니다. 분석법 밸리데이션과 안정성 시험 설계에 강점이 있습니다. 신약 개발 초기 단계의 CMC 전략 수립에 기여하고 싶습니다.",
    attachments: [],
  },
  {
    applicantId: "ap-3",
    workPreference: {
      track: "industry",
      experienceId: "5-10",
      regionIds: ["gyeonggi", "seoul"],
      salaryId: null,
      employmentTypeId: "permanent",
    },
    education: { school: "성균관대학교", degreeId: "bachelor", major: "화학공학" },
    certificates: [{ id: "ap3-cert-1", name: "품질경영기사", issuedYear: "2019", issuer: "한국산업인력공단" }],
    jobSubcategoryIds: ["cmc-ra", "synthesis-cmc"],
    careers: [
      {
        id: "ap3-career-1",
        company: "셀트리온제약",
        role: "CMC RA 대리",
        period: "2021.03 - 재직중",
        description: "완제의약품 변경허가 및 CMC 파트 인허가 문서를 작성·검토했습니다.",
      },
      {
        id: "ap3-career-2",
        company: "유유제약",
        role: "품질보증팀 사원",
        period: "2020.01 - 2021.02",
        description: "GMP 문서 관리와 제조기록서 검토 업무를 담당했습니다.",
      },
    ],
    languages: [],
    selfIntroduction:
      "인허가 문서 작성과 CMC 파트 대응 업무를 중심으로 6년간 경력을 쌓았습니다. 변경허가 및 해외 등록 자료 준비 과정에서 규제기관 커뮤니케이션을 다수 경험했습니다. 꼼꼼한 문서·일정 관리를 강점으로 생각합니다.",
    attachments: [],
  },
  {
    applicantId: "ap-4",
    workPreference: {
      track: "industry",
      experienceId: "10-20",
      regionIds: ["seoul"],
      salaryId: "9000",
      employmentTypeId: "permanent",
    },
    education: { school: "서울대학교", degreeId: "doctor", major: "약학" },
    certificates: [],
    jobSubcategoryIds: ["biologics-formulation-analysis", "process-tech"],
    careers: [
      {
        id: "ap4-career-1",
        company: "삼성바이오로직스(주)",
        role: "제제연구팀 수석연구원",
        period: "2019.05 - 재직중",
        description: "바이오의약품 제형 개발 프로젝트를 총괄하고 위탁생산처 기술이전을 주도했습니다.",
      },
      {
        id: "ap4-career-2",
        company: "GSK(글락소스미스클라인)",
        role: "제제연구원",
        period: "2015.02 - 2019.04",
        description: "국내외 파트너사와 협업하여 완제의약품 제형 최적화 과제를 수행했습니다.",
      },
    ],
    languages: [{ id: "ap4-lang-1", name: "영어", level: "업무상 원활한 의사소통 가능" }],
    selfIntroduction:
      "11년간 바이오의약품 및 합성의약품 제형 개발 프로젝트를 리드해왔습니다. 다수의 기술이전·스케일업 프로젝트를 매니징하며 일정·품질·비용을 동시에 관리한 경험이 있습니다. 조직 내 제형 개발 로드맵 수립에도 참여하고 싶습니다.",
    attachments: [{ fileName: "경력기술서_2026.pdf", fileSizeLabel: "1.5MB" }],
  },
  {
    applicantId: "ap-5",
    workPreference: {
      track: "industry",
      experienceId: "3-5",
      regionIds: ["gyeonggi"],
      salaryId: "3000",
      employmentTypeId: "permanent",
    },
    education: { school: "충북대학교", degreeId: "bachelor", major: "제약공학" },
    certificates: [{ id: "ap5-cert-1", name: "위험물산업기사", issuedYear: "2020", issuer: "한국산업인력공단" }],
    jobSubcategoryIds: ["gmp-qms", "manufacturing"],
    careers: [
      {
        id: "ap5-career-1",
        company: "아주약품",
        role: "생산품질팀 대리",
        period: "2021.06 - 재직중",
        description: "고형제 생산라인의 GMP 밸리데이션과 공정 이탈 대응 업무를 담당했습니다.",
      },
    ],
    languages: [],
    selfIntroduction:
      "고형제 생산 현장에서 GMP 기준에 맞춘 품질관리 업무를 5년째 수행하고 있습니다. 공정 밸리데이션과 이탈 조사 경험을 바탕으로 안정적인 생산 품질을 유지해왔습니다.",
    attachments: [],
  },
  {
    applicantId: "ap-6",
    workPreference: {
      track: "industry",
      experienceId: "1-3",
      regionIds: ["incheon", "seoul"],
      salaryId: null,
      employmentTypeId: "permanent",
    },
    education: { school: "인하대학교", degreeId: "bachelor", major: "화학공학" },
    certificates: [],
    jobSubcategoryIds: ["biologics-formulation-analysis"],
    careers: [
      {
        id: "ap6-career-1",
        company: "코오롱바이오텍",
        role: "제제연구원",
        period: "2023.02 - 재직중",
        description: "주사제 완제의약품의 처방 설계와 예비 안정성 시험을 수행했습니다.",
      },
    ],
    languages: [],
    selfIntroduction:
      "주사제 제형 설계 업무를 3년째 담당하며 처방 스크리닝부터 안정성 평가까지 전 과정에 참여했습니다. 세심한 실험 설계와 데이터 정리 역량을 갖추고 있습니다.",
    attachments: [],
  },
  {
    applicantId: "ap-7",
    workPreference: {
      track: "industry",
      experienceId: "3-5",
      regionIds: ["seoul"],
      salaryId: null,
      employmentTypeId: "permanent",
    },
    education: { school: "이화여자대학교", degreeId: "bachelor", major: "약학" },
    certificates: [],
    jobSubcategoryIds: ["biologics-formulation-analysis", "manufacturing"],
    careers: [
      {
        id: "ap7-career-1",
        company: "(주)삼오제약",
        role: "제제연구원",
        period: "2022.01 - 재직중",
        description: "고형제 신제형 개발 및 처방 최적화 실험을 진행했습니다.",
      },
    ],
    languages: [],
    selfIntroduction:
      "고형제 제형 개발 업무를 4년째 수행하며 처방 최적화와 시제품 제조 경험을 쌓았습니다. 새로운 제형 플랫폼에 대한 학습 의지가 강합니다.",
    attachments: [],
  },
  {
    applicantId: "ap-8",
    workPreference: {
      track: "industry",
      experienceId: "1-3",
      regionIds: ["seoul"],
      salaryId: null,
      employmentTypeId: null,
    },
    education: { school: "숙명여자대학교", degreeId: "bachelor", major: "화학" },
    certificates: [{ id: "ap8-cert-1", name: "화학분석기사", issuedYear: "2022", issuer: "한국산업인력공단" }],
    jobSubcategoryIds: ["qc"],
    careers: [
      {
        id: "ap8-career-1",
        company: "(주)오래온",
        role: "품질관리팀 사원",
        period: "2024.03 - 재직중",
        description: "HPLC를 이용한 원료 및 완제의약품 함량·순도 분석을 담당했습니다.",
      },
    ],
    languages: [],
    selfIntroduction:
      "HPLC 기반 분석법을 활용해 원료의약품과 완제의약품의 품질관리 업무를 2년째 수행하고 있습니다. 분석 데이터의 정확성과 일관성을 중요하게 생각합니다.",
    attachments: [],
  },
  {
    applicantId: "ap-9",
    workPreference: {
      track: "industry",
      experienceId: "3-5",
      regionIds: ["gyeonggi"],
      salaryId: "5000",
      employmentTypeId: "permanent",
    },
    education: { school: "아주대학교", degreeId: "bachelor", major: "생명공학" },
    certificates: [{ id: "ap9-cert-1", name: "무균제조관리자 교육 이수", issuedYear: "2021", issuer: "식품의약품안전처" }],
    jobSubcategoryIds: ["manufacturing", "qa"],
    careers: [
      {
        id: "ap9-career-1",
        company: "(주)녹십자",
        role: "생산팀 대리",
        period: "2021.01 - 재직중",
        description: "주사제 무균 생산라인 운영과 품질 이슈 대응 업무를 담당했습니다.",
      },
    ],
    languages: [],
    selfIntroduction:
      "주사제 무균 생산라인에서 5년간 근무하며 GMP 기준 준수와 품질 이슈 대응 경험을 쌓았습니다. 생산 현장과 품질부서 간 커뮤니케이션에 익숙합니다.",
    attachments: [{ fileName: "경력기술서_2026.pdf", fileSizeLabel: "0.9MB" }],
  },
  {
    applicantId: "ap-10",
    workPreference: {
      track: "industry",
      experienceId: "3-5",
      regionIds: ["seoul"],
      salaryId: null,
      employmentTypeId: "permanent",
    },
    education: { school: "서울대학교", degreeId: "master", major: "약학" },
    certificates: [],
    jobSubcategoryIds: ["clinical-dm-statistics", "clinical-ops"],
    careers: [
      {
        id: "ap10-career-1",
        company: "메디코아CRO(주)",
        role: "임상약리팀 연구원",
        period: "2022.05 - 재직중",
        description: "임상시험 약동학 데이터 분석과 PK/PD 모델링 보고서 작성을 담당했습니다.",
      },
    ],
    languages: [{ id: "ap10-lang-1", name: "영어", level: "논문 및 보고서 작성 가능" }],
    selfIntroduction:
      "CRO에서 4년간 임상약리 데이터 분석과 PK/PD 모델링 업무를 수행했습니다. 임상시험 결과 보고서 작성과 통계 분석 툴 활용에 익숙합니다. 임상약리 전문성을 살려 신약 개발 초기 단계에 기여하고 싶습니다.",
    attachments: [],
  },
  {
    applicantId: "ap-11",
    workPreference: {
      track: "industry",
      experienceId: "1-3",
      regionIds: ["seoul"],
      salaryId: null,
      employmentTypeId: null,
    },
    education: { school: "고려대학교", degreeId: "bachelor", major: "통계학" },
    certificates: [],
    jobSubcategoryIds: ["clinical-dm-statistics"],
    careers: [
      {
        id: "ap11-career-1",
        company: "한국오츠카제약",
        role: "임상개발팀 사원",
        period: "2024.06 - 재직중",
        description: "임상시험 데이터 정리와 통계 분석 보조 업무를 수행했습니다.",
      },
    ],
    languages: [],
    selfIntroduction:
      "임상시험 데이터 관리와 통계 분석 보조 업무를 2년째 담당하고 있습니다. 통계학 전공을 바탕으로 데이터 정합성 검토에 강점이 있습니다.",
    attachments: [],
  },
];

export function getApplicantResume(applicantId: string): ApplicantResume | undefined {
  return applicantResumes.find((resume) => resume.applicantId === applicantId);
}
