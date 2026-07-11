import type { FormattedContent } from "@/types/jobs";

export interface IndustryJobCore {
  main: string;
  sub: string;
}

export interface IndustryJobBlock {
  title: string;
  tags: string[];
  oneLineIntro: string;
  salary: string;
  jobCategory: IndustryJobCore;
  employmentType: string;
  workMode: string;
  isLeadership: boolean;
  career: string;
  headcount: string;
  education: string;
  location: { address: string; workMode: string };
  coreKeywords: string[];
  apply: { method: string; target: string; notice?: string };
  deadline: { date: string | null; label: string; status: "dDay" | "always" };
  postingSource: "direct" | "headhunting";
  introduction?: string;
  responsibilities?: FormattedContent;
  requirements?: FormattedContent;
  preferred?: FormattedContent;
  benefits?: string[];
  workConditionDetail?: string;
  positionIntro?: string;
  additionalNotes?: string;
  detailImages?: string[];
  attachments?: { name: string; url: string }[];
}

export interface IndustryOrgBlock {
  name: string;
  orgType: string;
  employeeCount: string;
  shortIntro: string;
  description?: string;
  keywords?: string[];
  logoUrl?: string; // 기업정보 폼 업로드 이미지. 목업 단계엔 없을 수 있음
}

export interface IndustryBusinessContext {
  businessFields?: string[];
  products?: { name: string; description: string }[];
}

export interface IndustryJobDetail {
  slug: string;
  companyId: string | null;
  job: IndustryJobBlock;
  org: IndustryOrgBlock;
  businessContext?: IndustryBusinessContext;
}

export const industryJobDetails: Record<string, IndustryJobDetail> = {
  "dentium-device-ra": {
    slug: "dentium-device-ra",
    companyId: "dentium",
    job: {
      title: "장비인허가팀 의료장비 인허가 RA",
      tags: ["의료기기 회사", "의료기기 RA", "정규직", "신입·경력"],
      oneLineIntro: "글로벌 의료기기 인허가를 함께 이끌 RA 담당자를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "RA·인허가", sub: "의료기기 RA" },
      employmentType: "정규직",
      workMode: "사무실 근무",
      isLeadership: false,
      career: "신입·경력",
      headcount: "2명",
      education: "대졸 이상",
      location: {
        address: "경기 용인시 처인구 양지읍 양지로138번길 14",
        workMode: "사무실 근무",
      },
      coreKeywords: ["RA", "FDA", "CE", "MDR", "ISO13485", "의료기기 인허가"],
      apply: {
        method: "homepage",
        target: "https://example.com/careers/dentium-device-ra",
      },
      deadline: { date: "2026-07-08", label: "마감 D-12", status: "dDay" },
      postingSource: "direct",
      introduction:
        "덴티움은 치과용 의료기기와 의료장비를 개발·제조하는 기업입니다. 이번 포지션은 치과용 의료기기의 신규·갱신·변경 허가를 맡아 국가별 법규와 인증 기준에 맞춰 인허가 일정을 관리하는 역할입니다. 한국·중국·유럽·미국 등 주요 국가의 인허가 자료를 준비하면서, 임상평가 문서와 CER 업데이트, 연차보고 같은 의료기기 RA 실무를 폭넓게 경험할 수 있습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "치과용 의료기기 신규·갱신·변경 허가 및 임상평가 대응",
          "한국·중국·유럽·미국 등 국가별 인허가 일정 관리",
          "국가별 법규·가이드라인 변경사항 모니터링",
          "연차보고 및 CER 업데이트",
          "품질·연구개발·생산 부서와 인허가 자료 협업",
        ],
      },
      requirements: {
        format: "bullet",
        items: [
          "대졸 이상",
          "의료기기 인허가 업무에 관심이 있는 분",
          "법규·인증·기술문서를 꼼꼼하게 확인할 수 있는 분",
          "유관부서와 원활하게 커뮤니케이션할 수 있는 분",
        ],
      },
      preferred: {
        format: "bullet",
        items: [
          "이공계열 전공자",
          "의료기기 인허가 실무 경험자",
          "FDA·CE·MDR·ISO13485·GMP 등 주요 인증 실무 경험자",
          "영어 또는 외국어 문서 검토 가능자",
        ],
      },
      benefits: ["4대 보험", "퇴직연금", "사내식당", "기숙사", "건강검진", "성과급"],
      workConditionDetail:
        "장비인허가팀 소속으로 근무하며, 국가별 인허가 일정과 인증 문서를 관리합니다. 입사 후에는 주요 제품군과 국가별 허가 프로세스를 먼저 안내받고, 담당 제품의 문서 관리와 인증 대응 업무를 단계적으로 맡게 됩니다. 근무는 주간 근무 기준으로 운영됩니다.",
      positionIntro:
        "덴티움의 RA 포지션은 국내외 의료기기 인허가와 규제 대응을 통해 제품의 글로벌 시장 진입을 지원하는 역할입니다. 제품 개발, 품질, 임상, 해외 법인과 협업하며 허가 전략 수립부터 문서 검토, 보완 대응까지 전 과정을 경험할 수 있습니다. 의료기기 RA 커리어를 체계적으로 쌓고 싶은 분에게 적합한 포지션입니다.",
      additionalNotes:
        "입사 후 제품군과 국가별 인허가 프로세스에 대한 온보딩이 제공됩니다. 일부 해외 인허가 프로젝트의 경우 영문 문서 검토와 유관부서 협업이 포함될 수 있습니다.",
    },
    org: {
      name: "(주)덴티움",
      orgType: "의료기기 회사",
      employeeCount: "501명 이상",
      shortIntro: "치과용 의료기기와 의료장비를 개발·제조하는 기업입니다.",
      description:
        "덴티움은 치과용 임플란트를 중심으로 다양한 의료기기와 의료장비를 만들며, 국내외 인증과 인허가 대응 경험을 쌓아 왔습니다.",
      keywords: ["의료기기", "치과용 임플란트", "글로벌 인증", "RA"],
    },
    businessContext: {
      businessFields: ["치과용 의료기기", "의료장비", "글로벌 인증"],
      products: [
        {
          name: "치과용 임플란트",
          description: "국내외 치과 시장을 대상으로 임플란트 제품을 개발하고 제조합니다.",
        },
        {
          name: "의료장비",
          description: "국가별 인증과 품질 기준에 맞춰 의료장비를 개발하고 인허가를 진행합니다.",
        },
      ],
    },
  },

  "samsungbio-bioprocess": {
    slug: "samsungbio-bioprocess",
    companyId: "samsung-biologics",
    job: {
      title: "바이오공정 직무지원 5급 정규사원 채용",
      tags: ["CDMO", "생산·제조", "정규직", "상시채용"],
      oneLineIntro: "바이오의약품 생산 공정과 현장 운영을 지원할 정규직 직원을 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "생산·품질", sub: "생산·제조" },
      employmentType: "정규직",
      workMode: "현장 근무",
      isLeadership: false,
      career: "신입",
      headcount: "0명",
      education: "고졸 이상",
      location: {
        address: "인천 연수구 송도바이오대로 300",
        workMode: "현장 근무",
      },
      coreKeywords: ["바이오공정", "CDMO", "바이오의약품", "생산공정"],
      apply: {
        method: "homepage",
        target: "https://example.com/careers/samsungbio-bioprocess",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "direct",
      introduction:
        "삼성바이오로직스는 바이오의약품 위탁개발생산을 수행하는 CDMO 기업입니다. 이번 포지션은 바이오의약품 생산 공정을 지원하고 현장 운영과 관리 업무를 함께 맡는 역할입니다. 신입도 지원할 수 있으며, 입사 후에는 생산 공정과 현장 기준, 문서 작성 방식, 안전·품질 기준을 차근차근 익히게 됩니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "바이오의약품 생산 공정 업무 지원",
          "생산 공정 운영 보조 및 현장 관리",
          "생산 관련 기록과 문서 작성 지원",
          "현장 안전·품질 기준 준수",
          "공정 운영에 필요한 준비 및 정리 업무",
        ],
      },
      requirements: {
        format: "bullet",
        items: [
          "고등학교 졸업 또는 동등 학력 이상",
          "신입 지원 가능",
          "해외여행에 결격사유가 없는 분",
          "병역 관련 결격사유가 없는 분",
          "생산 현장 기준과 안전수칙을 준수할 수 있는 분",
        ],
      },
      preferred: {
        format: "bullet",
        items: [
          "바이오 계열 전공 또는 관련 과목 이수자",
          "제약·바이오 생산공정에 관심이 있는 분",
          "OPIc·TOEIC 등 영어 공인 성적 보유자",
          "제조·생산 현장 근무 경험자",
          "교대근무 또는 현장근무에 적응 가능한 분",
        ],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail:
        "송도 사업장 내 바이오의약품 생산공정 관련 부서에서 근무합니다. 생산 일정과 공정 운영 기준에 따라 현장 지원 업무를 수행하며, 입사 후에는 안전교육과 공정 이해 교육을 먼저 진행합니다. 교대 근무 가능 여부는 배치 부서에 따라 달라질 수 있습니다.",
    },
    org: {
      name: "삼성바이오로직스",
      orgType: "CDMO",
      employeeCount: "501명 이상",
      shortIntro: "바이오의약품 위탁개발생산을 수행하는 CDMO 기업입니다.",
      description:
        "삼성바이오로직스는 글로벌 제약·바이오 기업의 바이오의약품 생산을 맡는 CDMO로, 생산 공정과 품질·안전 기준에 맞춘 현장 운영 체계를 갖추고 있습니다.",
      keywords: ["CDMO", "바이오의약품", "생산공정", "송도"],
    },
    businessContext: {
      businessFields: ["바이오의약품", "CDMO", "생산공정"],
      products: [
        {
          name: "바이오의약품 CDMO",
          description: "글로벌 제약·바이오 기업의 바이오의약품 생산을 위탁받아 수행합니다.",
        },
        {
          name: "생산 공정 운영",
          description: "바이오의약품 생산 공정과 현장 운영 체계를 바탕으로 품질 기준에 맞는 생산을 진행합니다.",
        },
      ],
    },
  },
};

export function getIndustryJobDetail(slug: string): IndustryJobDetail | null {
  return industryJobDetails[slug] ?? null;
}
