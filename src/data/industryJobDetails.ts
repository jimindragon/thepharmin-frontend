import { companyLogos } from "@/config/companyImages";
import type { FormattedContent, JobApply } from "@/types/jobs";

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
  /** 4트랙 공통 형태. 어떤 필드를 읽을지는 shared.tsx의 getApplyValue 한 곳에서만 판단한다. */
  apply: JobApply;
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
  hiringProcess?: string[];
  requiredDocuments?: string[];
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
  "ra-specialist": {
    slug: "ra-specialist",
    companyId: "thepharmin-pharma",
    job: {
      title: "RA Specialist (제약·바이오 인허가 담당)",
      tags: ["전문의약품 제조업", "RA·인허가", "정규직", "경력"],
      oneLineIntro: "의약품 허가 및 규제 대응을 담당할 RA Specialist를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "RA·인허가", sub: "RA" },
      employmentType: "정규직",
      workMode: "사무실 근무",
      isLeadership: false,
      career: "경력 3~5년",
      headcount: "1명",
      education: "학사 이상",
      location: {
        // jobs.ts locationDetail의 건물명(더파마타워 8층)·역세권(2호선 역삼역 도보 약 6분)은
        // IndustryJobBlock.location에 대응 필드가 없어 옮기지 않는다.
        address: "서울 강남구 테헤란로 123, 8층",
        workMode: "사무실 근무",
      },
      coreKeywords: ["CTD", "규제기관 대응", "약사 면허", "영어 커뮤니케이션", "IND/NDA", "FDA", "EMA", "글로벌 인허가"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/ra-specialist",
        notice: "기업 채용 홈페이지에서 지원서를 제출합니다. 이력서와 경력기술서를 함께 첨부해 주세요.",
      },
      deadline: { date: "2026-09-08", label: "마감 D-51", status: "dDay" },
      postingSource: "direct",
      introduction: "의약품 허가 및 규제 대응을 담당할 RA Specialist를 찾습니다.",
      // 주요업무·자격요건·우대사항은 jobs.ts 101의 4항목 배열(responsibilities/requirements/
      // preferredQualifications)을 옮긴 것이다. 3항목짜리 *Content 필드는 같은 내용의 축약본이라 쓰지 않는다.
      responsibilities: {
        format: "bullet",
        items: [
          "의약품 품목 허가, 변경 허가 및 관련 인허가 업무 총괄",
          "CTD 작성 및 제출, 허가심사 대응",
          "규제기관 질의 대응 및 문서 관리",
          "국내외 법규 및 규제 동향 모니터링",
        ],
      },
      requirements: {
        format: "bullet",
        items: [
          "관련 전공 학사 이상",
          "RA 유관 경력 3년 이상",
          "의약품 인허가 업무 경험 보유",
          "문서 작성 및 커뮤니케이션 역량 우수",
        ],
      },
      preferred: {
        format: "bullet",
        items: [
          "약사 면허 보유자",
          "영어 커뮤니케이션 가능자",
          "CTD 작성 경험 보유자",
          "글로벌 허가 경험 보유자",
        ],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "4대 보험, 연차, 교육비 지원, 성과급 제도를 운영합니다.",
      // positionIntro/additionalNotes/hiringProcess/requiredDocuments: 없음 — jobs.ts 101에 대응 원본이 없다
    },
    org: {
      name: "더파마제약(주)",
      orgType: "전문의약품 제조업",
      employeeCount: "320명",
      shortIntro: "전문의약품과 바이오 의약품을 개발·제조하는 제약 기업입니다.",
      description:
        "품질 중심의 연구개발 문화와 규제 대응 역량을 바탕으로 국내외 허가 전략을 고도화하고 있습니다.",
      keywords: ["신약개발", "글로벌 진출", "R&D 중심", "도전과 혁신", "환자 중심", "전문성 존중"],
      // logoUrl: companyLogos에 "더파마제약(주)" 키가 없어 생략한다. CompanyLogo가 이름 기반 텍스트로 폴백한다.
    },
    // companyProfiles.ts thepharmin-pharma의 businessSummary("주요 사업"·"주요 제품")가 근거다.
    businessContext: {
      businessFields: ["전문의약품", "일반의약품", "바이오의약품"],
      products: [
        { name: "파마정", description: "전문의약품 제품입니다." },
        { name: "바이오신", description: "바이오의약품 제품입니다." },
        { name: "헬스인", description: "일반의약품 제품입니다." },
      ],
    },
  },

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
        url: "https://example.com/careers/dentium-device-ra",
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
      logoUrl: companyLogos["(주)덴티움"],
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
        url: "https://example.com/careers/samsungbio-bioprocess",
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
      logoUrl: companyLogos["삼성바이오로직스"],
    },
    businessContext: {
      businessFields: ["바이오의약품", "CDMO", "생산공정"],
      // companyProfiles.ts(samsung-biologics)의 sidebar.products와 동일 값 — 공고 상세와 인사이트가 같은 제품 목록을 보여주도록 동기화(STEP 정합성 파일럿)
      products: [
        { name: "CDMO", description: "항체의약품 위탁개발생산" },
        { name: "CDO 플랫폼", description: "S-Cellerate · S-DUAL 등" },
        { name: "ADC", description: "항체약물접합체 생산" },
      ],
    },
  },

  "yuhan-ra-regulatory-strategy": {
    slug: "yuhan-ra-regulatory-strategy",
    companyId: "yuhan",
    job: {
      title: "RA 허가전략 담당 경력직 채용",
      tags: ["제약사", "RA·인허가", "정규직", "경력"],
      oneLineIntro: "국내외 신약 허가 전략 수립과 규제기관 대응을 함께할 RA 경력직 포지션입니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "RA·인허가", sub: "허가 전략" },
      employmentType: "정규직",
      workMode: "하이브리드",
      isLeadership: false,
      career: "경력 5년 이상",
      headcount: "0명",
      education: "학사 이상",
      location: {
        address: "서울 동작구 노량진로 74 (유한양행빌딩)",
        workMode: "하이브리드",
      },
      coreKeywords: ["RA", "허가전략", "규제대응", "신약허가", "글로벌인허가"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/yuhan-ra-regulatory-strategy",
      },
      deadline: { date: "2026-08-09", label: "마감 D-28", status: "dDay" },
      postingSource: "direct",
      introduction:
        "유한양행은 렉라자를 중심으로 항암·면역 분야 신약 개발과 글로벌 허가를 확대해 온 제약기업입니다. 이번 포지션은 국내외 의약품 허가 전략을 수립하고 식약처 등 규제기관과의 대응을 담당하는 RA 경력직입니다. 품목허가와 변경허가 실무를 총괄하며, 글로벌 허가 프로젝트의 국내 인허가 일정을 관리하는 역할을 맡게 됩니다. 허가심사 대응 경험을 바탕으로 신약 허가 전략을 폭넓게 경험할 수 있는 자리입니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "의약품 품목허가·변경허가 전략 수립 및 실행",
          "식약처 등 규제기관 질의 대응 및 심사 자료 관리",
          "글로벌 허가 프로젝트의 국내 인허가 일정 관리",
        ],
      },
      requirements: {
        format: "bullet",
        items: [
          "제약·바이오 RA 경력 5년 이상",
          "허가심사 대응 실무 경험 보유",
          "학사 이상",
        ],
      },
      preferred: {
        format: "bullet",
        items: [
          "약사 면허 보유자",
          "신약 허가 프로젝트 경험자",
          "영어 문서 작성 가능자",
        ],
      },
      workConditionDetail:
        "하이브리드 근무로 운영되며, 규제기관 대응 일정에 따라 사무실 출근과 재택 근무를 병행합니다.",
      positionIntro:
        "허가전략 담당자는 개발·품질·해외법인과 협업하며 허가 전략 수립부터 자료 검토, 규제기관 대응까지 폭넓은 인허가 업무를 경험할 수 있는 포지션입니다.",
      // additionalNotes/attachments/detailImages: 없음
    },
    org: {
      name: "(주)유한양행",
      orgType: "제약사",
      employeeCount: "501명 이상",
      shortIntro: "좋은 상품을 만들어 국가와 동포에게 도움을 주는 기업",
      description:
        "비소세포폐암 표적항암제 렉라자를 중심으로 글로벌 허가를 잇달아 획득하며 항암·면역 분야 R&D와 해외 인허가 역량을 빠르게 확장하고 있습니다.",
      keywords: ["신약개발", "글로벌 진출", "R&D 중심", "항암·면역"],
      logoUrl: companyLogos["유한양행"],
    },
  },

  "medicoa-senior-cra": {
    slug: "medicoa-senior-cra",
    companyId: "medicoa-cro",
    job: {
      title: "임상시험 모니터링 CRA 경력직 채용",
      tags: ["CRO·CDMO", "임상", "정규직", "경력"],
      oneLineIntro: "국내 임상시험 기관 모니터링을 담당할 경력 CRA 포지션입니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "임상", sub: "CRA" },
      employmentType: "정규직",
      workMode: "외근·출장",
      isLeadership: false,
      career: "경력 3년 이상",
      headcount: "0명",
      education: "학사 이상",
      location: {
        address: "서울 구로구 디지털로 300",
        workMode: "외근·출장",
      },
      coreKeywords: ["CRA", "임상시험 모니터링", "임상시험기관", "CRO"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/medicoa-senior-cra",
      },
      deadline: { date: "2026-07-31", label: "마감 D-19", status: "dDay" },
      postingSource: "direct",
      introduction:
        "메디코아CRO는 국내 제약사와 바이오벤처의 임상시험을 폭넓게 수탁하며 다국가 임상 비중을 늘려가고 있는 CRO입니다. 이번 포지션은 담당 임상시험 기관을 정기적으로 모니터링하고 진행 상황과 이슈를 관리하는 CRA 경력직입니다. 시험기관 및 의뢰사와의 커뮤니케이션을 통해 임상시험이 계획대로 진행되도록 지원하는 역할을 맡게 됩니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "담당 임상시험 기관 정기 모니터링 방문 수행",
          "모니터링 보고서 작성 및 이슈 관리",
          "시험기관·의뢰사 커뮤니케이션",
        ],
      },
      requirements: {
        format: "bullet",
        items: [
          "CRA 경력 3년 이상",
          "국내 임상시험 모니터링 수행 경험",
          "학사 이상",
        ],
      },
      preferred: {
        format: "bullet",
        items: [
          "글로벌 임상 과제 참여 경험자",
          "종양학 임상 경험자",
        ],
      },
      workConditionDetail: "담당 임상시험 기관 방문을 위한 출장이 잦은 외근·출장 중심 근무입니다.",
      positionIntro:
        "CRA는 임상시험 기관 방문과 모니터링 보고서 작성을 중심으로 임상시험의 품질과 일정을 관리하며, 다양한 치료영역의 임상 과제를 경험할 수 있는 포지션입니다.",
      // detailImages/attachments/additionalNotes: 3종 모두 없음
    },
    org: {
      name: "메디코아CRO(주)",
      orgType: "CRO·CDMO",
      employeeCount: "101~500명",
      shortIntro: "국내 임상부터 글로벌 다국가 임상까지, 풀서비스 CRO",
      description:
        "국내 제약사와 바이오벤처의 임상을 폭넓게 수탁하며, 다국가 임상 비중을 늘려가는 성장기 CRO입니다. CRA·DM·통계 직군의 채용이 꾸준합니다.",
      keywords: ["풀서비스 CRO", "CRA 채용", "다국가 임상", "성장기"],
      logoUrl: companyLogos["메디코아"],
    },
  },

  "celltrionph-ra": {
    slug: "celltrionph-ra",
    companyId: "celltrion-pharm",
    job: {
      title: "허가(RA) 경력 채용",
      tags: ["제약사", "RA·인허가", "정규직", "경력"],
      oneLineIntro: "국내 제네릭 의약품의 허가·개발 전 주기 업무와 품목 사후관리, 영문 CTD 작성을 담당할 RA 인재를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "RA·인허가", sub: "RA" },
      employmentType: "정규직",
      workMode: "사무실 근무",
      isLeadership: false,
      career: "경력",
      headcount: "0명(채용 시 마감)",
      education: "학사 이상",
      location: {
        address: "경기 과천시",
        workMode: "사무실 근무",
      },
      coreKeywords: ["RA", "CTD", "IND", "품목갱신", "사후관리"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/celltrionph-ra",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "direct",
      introduction:
        "이번 포지션은 국내 제네릭 의약품의 허가·개발 전 주기 업무를 맡는 RA 경력직입니다. 품목 사후관리(품목갱신·재허가)와 해외 허가 품목갱신, 영문 CTD 작성까지 인허가 실무 전반을 폭넓게 경험할 수 있습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "의약품 인허가 및 임상시험계획(IND) 승인 업무",
          "품목갱신·재허가 등 품목 사후관리 및 해외 허가 품목갱신",
          "RMP·PMS 관리",
          "영문 CTD 작성 및 유관 부서 협업",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["약학·화학·생명과학·의약학 등 관련 전공 학사 이상", "의약품 허가·개발 업무 경력 보유자"],
      },
      preferred: {
        format: "bullet",
        items: ["국내외 허가 제출 또는 영문 CTD 작성 경험자", "영어 문서 작성 및 커뮤니케이션 능력 우수자"],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "경기 과천시에서 주 5일 사무실 근무로 진행되며, 상세 근무시간은 회사 규정에 따릅니다.",
      positionIntro:
        "허가 전략과 제출 문서의 완성도를 높여 제품 출시와 품목 유지에 기여하는 포지션입니다.",
      hiringProcess: ["서류 전형", "실무 면접", "최종 합격"],
    },
    org: {
      name: "셀트리온제약",
      orgType: "제약사",
      employeeCount: "501명 이상",
      shortIntro: "바이오시밀러 국내 유통과 케미컬의약품 개발·생산을 담당하는 셀트리온 그룹 계열사입니다.",
      description:
        "셀트리온제약은 바이오시밀러의 국내 유통과 케미컬의약품의 개발·생산을 함께 담당하는 제약기업입니다.",
      keywords: ["바이오시밀러", "케미컬의약품", "의약품 제조", "셀트리온 그룹"],
      logoUrl: companyLogos["셀트리온제약"],
    },
    businessContext: {
      businessFields: ["바이오시밀러 국내 유통", "케미컬의약품 개발", "의약품 생산"],
      products: [
        { name: "바이오시밀러 제품군", description: "셀트리온 그룹이 개발한 바이오시밀러 제품의 국내 유통을 담당합니다." },
        { name: "케미컬의약품 제품군", description: "제네릭을 포함한 케미컬의약품을 개발·생산합니다." },
      ],
    },
  },

  "celltrionph-clinical": {
    slug: "celltrionph-clinical",
    companyId: "celltrion-pharm",
    job: {
      title: "임상 신입·경력 채용",
      tags: ["제약사", "임상", "정규직", "신입·경력"],
      oneLineIntro: "임상시험의 기획과 운영·관리, 개발 목표에 맞는 임상 전략 수립을 담당할 인재를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "임상", sub: "임상운영" },
      employmentType: "정규직",
      workMode: "사무실 근무",
      isLeadership: false,
      career: "신입·경력(경력 2년 이상)",
      headcount: "0명(채용 시 마감)",
      education: "학사 이상",
      location: {
        address: "경기 과천시",
        workMode: "사무실 근무",
      },
      coreKeywords: ["임상운영", "GCP", "CRA", "IIT", "임상시험전략"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/celltrionph-clinical",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "direct",
      introduction:
        "이번 포지션은 임상시험의 기획과 과제 운영·관리를 담당하는 임상 포지션으로, 신입부터 경력자까지 지원할 수 있습니다. 벤더 및 예산 관리와 연구자주도임상(IIT) 관리를 포함해 임상 전략 수립까지 폭넓은 임상 실무를 경험할 수 있습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "임상시험 기획 및 과제 운영·관리",
          "벤더 및 예산 관리",
          "연구자주도임상(IIT) 운영·관리",
          "개발 목표에 맞는 임상시험 전략 수립",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["의·약학, 자연과학(약학·간호·생물·화학 등) 관련 전공 학사 이상", "신입 지원 가능하며, 경력 지원자는 임상시험 관련 업무 2년 이상"],
      },
      preferred: {
        format: "bullet",
        items: ["프로젝트 매니저(PM) 또는 Lead CRA 경험자", "제약사 임상 업무 경험자", "영어 커뮤니케이션 능력 우수자"],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "경기 과천시에서 주 5일 사무실 근무로 진행되며, 상세 근무시간은 회사 규정에 따릅니다.",
      positionIntro:
        "임상 과제의 일정·품질·예산을 조율하며 개발 의사결정을 지원하는 포지션입니다.",
      hiringProcess: ["서류 전형", "실무 면접", "최종 합격"],
    },
    org: {
      name: "셀트리온제약",
      orgType: "제약사",
      employeeCount: "501명 이상",
      shortIntro: "바이오시밀러 국내 유통과 케미컬의약품 개발·생산을 담당하는 셀트리온 그룹 계열사입니다.",
      description:
        "셀트리온제약은 바이오시밀러의 국내 유통과 케미컬의약품의 개발·생산을 함께 담당하는 제약기업입니다.",
      keywords: ["바이오시밀러", "케미컬의약품", "의약품 제조", "셀트리온 그룹"],
      logoUrl: companyLogos["셀트리온제약"],
    },
    businessContext: {
      businessFields: ["바이오시밀러 국내 유통", "케미컬의약품 개발", "의약품 생산"],
      products: [
        { name: "바이오시밀러 제품군", description: "셀트리온 그룹이 개발한 바이오시밀러 제품의 국내 유통을 담당합니다." },
        { name: "케미컬의약품 제품군", description: "제네릭을 포함한 케미컬의약품을 개발·생산합니다." },
      ],
    },
  },

  "celltrionph-bd": {
    slug: "celltrionph-bd",
    companyId: "celltrion-pharm",
    job: {
      title: "사업개발(BD·라이선싱) 경력 채용",
      tags: ["제약사", "BD·Licensing", "정규직", "경력"],
      oneLineIntro: "국내외 제품의 라이선스 인(License-in) 발굴부터 판매계약·코프로모션까지 사업개발을 담당할 인재를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "전략·투자", sub: "BD·Licensing" },
      employmentType: "정규직",
      workMode: "사무실 근무",
      isLeadership: false,
      career: "경력 3년 이상",
      headcount: "0명(채용 시 마감)",
      education: "학사 이상",
      location: {
        address: "경기 과천시",
        workMode: "사무실 근무",
      },
      coreKeywords: ["BD", "License-in", "코프로모션", "파트너링", "사업개발"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/celltrionph-bd",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "direct",
      introduction:
        "이번 포지션은 국내외 제품의 License-in 기회 발굴부터 계약 협상, 판매계약(코프로모션) 체결까지 사업개발 전반을 담당하는 경력직입니다. 해외 파트너사와 직접 커뮤니케이션하며 계약 조건 협상과 파트너십 관리를 폭넓게 경험할 수 있습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "국내외 제품 License-in 기회 발굴 및 사업성 평가",
          "계약 조건 협상·체결 및 파트너십 관리",
          "판매계약과 코프로모션 기회 발굴 및 사업성 검토",
        ],
      },
      requirements: {
        format: "bullet",
        items: [
          "약학·생명과학·화학 등 관련 전공 학사 이상",
          "제품 도입·라이선싱·코프로모션 관련 업무 경력 3년 이상",
          "해외 파트너사와 원활하게 소통할 수 있는 비즈니스 영어 역량",
        ],
      },
      preferred: {
        format: "bullet",
        items: ["제약·바이오 업계 BD·라이선싱 경험자", "약사 면허 소지자", "관련 전공 석사 이상"],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "경기 과천시에서 주 5일 사무실 근무로 진행되며, 상세 근무시간은 회사 규정에 따릅니다.",
      positionIntro:
        "유망한 제품 도입 기회를 실제 계약과 사업 성과로 연결하는 포지션입니다.",
      hiringProcess: ["서류 전형", "실무 면접", "최종 합격"],
    },
    org: {
      name: "셀트리온제약",
      orgType: "제약사",
      employeeCount: "501명 이상",
      shortIntro: "바이오시밀러 국내 유통과 케미컬의약품 개발·생산을 담당하는 셀트리온 그룹 계열사입니다.",
      description:
        "셀트리온제약은 바이오시밀러의 국내 유통과 케미컬의약품의 개발·생산을 함께 담당하는 제약기업입니다.",
      keywords: ["바이오시밀러", "케미컬의약품", "의약품 제조", "셀트리온 그룹"],
      logoUrl: companyLogos["셀트리온제약"],
    },
    businessContext: {
      businessFields: ["바이오시밀러 국내 유통", "케미컬의약품 개발", "의약품 생산"],
      products: [
        { name: "바이오시밀러 제품군", description: "셀트리온 그룹이 개발한 바이오시밀러 제품의 국내 유통을 담당합니다." },
        { name: "케미컬의약품 제품군", description: "제네릭을 포함한 케미컬의약품을 개발·생산합니다." },
      ],
    },
  },

  "gsk-vaccine-msl-cvmd": {
    slug: "gsk-vaccine-msl-cvmd",
    companyId: "gsk-korea",
    job: {
      title: "Vaccine Medical Science Liaison, CVMD",
      tags: ["제약사", "MSL", "정규직", "경력"],
      oneLineIntro: "백신·CVMD 영역에서 과학적 교류와 인사이트 수집을 담당할 MSL을 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "Medical·Market Access", sub: "MSL" },
      employmentType: "정규직",
      workMode: "사무실 근무",
      isLeadership: false,
      career: "경력 2년 이상",
      headcount: "0명(채용 시 마감)",
      education: "학사 이상",
      location: {
        address: "서울 용산구 한강대로 92, LS용산타워 9층",
        workMode: "사무실 근무",
      },
      coreKeywords: ["MSL", "Medical Affairs", "백신", "CVMD", "과학적 교류", "RWE"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/gsk-vaccine-msl-cvmd",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "direct",
      introduction:
        "이번 포지션은 GSK 메디컬과 외부 의료진 사이의 과학적 인터페이스로서, 백신·CVMD 영역에서 외부 전문가와 과학적 교류를 이어가며 의학적 인사이트를 수집하는 MSL 포지션입니다. 학회·심포지엄 참여와 과학적 발표를 통해 RWE·임상 활동을 지원하는 역할까지 폭넓게 경험할 수 있습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "외부 전문가(KOL)·의료진과 과학적 파트너십 구축 및 최신 정보 교류",
          "의학적 인사이트(mVOC)·미충족 수요 수집 및 메디컬 전략 반영",
          "학회·심포지엄 참여 및 과학적 발표, RWE·임상 활동 지원",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["의학·생명과학 관련 학위", "제약·바이오 유관 경력 2년 이상(메디컬·임상·백신 업무 등)"],
      },
      preferred: {
        format: "bullet",
        items: ["백신·감염질환 영역 경험자", "영어 커뮤니케이션 및 과학적 발표 역량 보유자", "약학·간호·생물학 등 라이프사이언스 백그라운드"],
      },
      benefits: ["4대 보험", "연차", "글로벌 교육", "성과급", "유연근무"],
      workConditionDetail: "글로벌 빅파마 표준 복리후생 및 유연근무 문화를 운영합니다.",
      positionIntro:
        "MSL은 임상 근거와 과학적 데이터를 바탕으로 의료진과 신뢰를 쌓으며, 메디컬 전략에 필요한 인사이트를 조직에 전달하는 역할입니다.",
      hiringProcess: ["서류 전형", "실무 면접", "최종 합격"],
    },
    org: {
      name: "GSK(글락소스미스클라인)",
      orgType: "제약사",
      employeeCount: "101~500명",
      shortIntro: "호흡기·면역·항암·HIV·감염질환 영역에 집중하는 글로벌 바이오제약 기업의 한국법인입니다.",
      description:
        "호흡기·면역·항암·HIV·감염질환 영역에 집중하는 글로벌 바이오제약 기업 GSK의 한국법인입니다.",
      keywords: ["글로벌 바이오제약", "백신", "항암", "면역질환"],
      logoUrl: companyLogos["GSK(글락소스미스클라인)"],
    },
    businessContext: {
      businessFields: ["백신", "호흡기·면역 전문의약품", "항암 전문의약품"],
      products: [
        { name: "백신", description: "감염질환 예방을 위한 백신 제품군을 국내에 공급합니다." },
        { name: "전문의약품", description: "호흡기·면역·항암·HIV·감염질환 영역의 전문의약품을 공급합니다." },
      ],
    },
  },

  "gsk-oncology-msl": {
    slug: "gsk-oncology-msl",
    companyId: "gsk-korea",
    job: {
      title: "Oncology MSL",
      tags: ["제약사", "MSL", "정규직", "경력무관"],
      oneLineIntro: "항암(Oncology) 영역에서 의료진과 과학적 교류를 담당할 MSL을 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "Medical·Market Access", sub: "MSL" },
      employmentType: "정규직",
      workMode: "사무실 근무",
      isLeadership: false,
      career: "경력무관",
      headcount: "0명(채용 시 마감)",
      education: "학사 이상",
      location: {
        address: "서울 용산구 한강대로 92, LS용산타워 9층",
        workMode: "사무실 근무",
      },
      coreKeywords: ["MSL", "Oncology", "항암", "Medical Affairs", "과학적 교류", "KOL"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/gsk-oncology-msl",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "direct",
      introduction:
        "이번 포지션은 항암 영역의 치료 전반에서 의료진과 장기적 파트너십을 구축하고, 과학적 근거를 교류하며 인사이트를 수집하는 항암(Oncology) MSL 포지션입니다. 현재와 미래의 치료 패러다임, 환자 미충족 수요, 경쟁 동향에 대한 인사이트를 조직에 전달하는 역할까지 폭넓게 경험할 수 있습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "현재·미래 치료 패러다임, 환자 미충족 수요, 경쟁동향 인사이트 수집",
          "과학적 근거 커뮤니케이션 및 신규 의료 패러다임 이해·확산",
          "학회 참여, 메디컬 부스·자문위원회 지원, 의학정보 요청 대응",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["의학·생명과학 관련 학위", "임상·의학·제약 과학에 대한 견고한 이해"],
      },
      preferred: {
        format: "bullet",
        items: ["항암 치료 영역 제약 경력자", "통계 지식 및 항암 기초 이해 보유자", "멀티채널 커뮤니케이션 역량 보유자"],
      },
      benefits: ["4대 보험", "연차", "글로벌 교육", "성과급", "유연근무"],
      workConditionDetail: "글로벌 빅파마 표준 복리후생 및 유연근무 문화를 운영합니다.",
      positionIntro:
        "항암 영역의 최신 임상 근거와 치료 패러다임 변화를 의료진에게 전달하며, 미충족 수요와 인사이트를 메디컬 전략에 반영하는 역할입니다.",
      hiringProcess: ["서류 전형", "실무 면접", "최종 합격"],
    },
    org: {
      name: "GSK(글락소스미스클라인)",
      orgType: "제약사",
      employeeCount: "101~500명",
      shortIntro: "호흡기·면역·항암·HIV·감염질환 영역에 집중하는 글로벌 바이오제약 기업의 한국법인입니다.",
      description:
        "호흡기·면역·항암·HIV·감염질환 영역에 집중하는 글로벌 바이오제약 기업 GSK의 한국법인입니다.",
      keywords: ["글로벌 바이오제약", "백신", "항암", "면역질환"],
      logoUrl: companyLogos["GSK(글락소스미스클라인)"],
    },
    businessContext: {
      businessFields: ["백신", "호흡기·면역 전문의약품", "항암 전문의약품"],
      products: [
        { name: "백신", description: "감염질환 예방을 위한 백신 제품군을 국내에 공급합니다." },
        { name: "전문의약품", description: "호흡기·면역·항암·HIV·감염질환 영역의 전문의약품을 공급합니다." },
      ],
    },
  },

  "roche-cmc-qa": {
    slug: "roche-cmc-qa",
    companyId: "roche-korea",
    job: {
      title: "생산·품질(QA) 정규직 채용",
      tags: ["제약사", "QA", "정규직", "경력"],
      oneLineIntro: "글로벌 제약사 한국로슈에서 의약품 품질보증(QA) 시스템을 운영·관리할 인재를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "생산·품질", sub: "QA" },
      employmentType: "정규직",
      workMode: "사무실 근무",
      isLeadership: false,
      career: "경력 2년 이상",
      headcount: "0명(채용 시 마감)",
      education: "학사 이상",
      location: {
        address: "서울 서초구 서초대로 411, GT타워 17층",
        workMode: "사무실 근무",
      },
      coreKeywords: ["QA", "GMP", "품질보증", "CAPA", "글로벌 규제", "SOP"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/roche-cmc-qa",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "direct",
      introduction:
        "이번 포지션은 한국로슈에서 의약품 품질보증(QA) 시스템을 운영·관리하는 QA 포지션입니다. GMP 기준에 따른 품질 관련 SOP 작성·개선과 일탈/CAPA 관리를 담당하며, 글로벌 본사 품질 정책 대응과 규제 변경사항 모니터링까지 폭넓게 경험할 수 있습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "의약품 품질보증(QA) 시스템 운영 및 문서 관리",
          "GMP 기준에 따른 품질 관련 SOP 작성·개선 및 일탈/CAPA 관리",
          "글로벌 본사 품질 정책 대응 및 규제 변경사항 모니터링",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["관련 전공 학사 이상", "제약·바이오 QA 유관 경력 2년 이상", "GMP 규정에 대한 이해"],
      },
      preferred: {
        format: "bullet",
        items: ["영어 커뮤니케이션 가능자", "다국적 제약사 품질 시스템 경험자", "글로벌 규제(FDA/EMA) 대응 경험자"],
      },
      benefits: ["4대 보험", "연차", "글로벌 교육", "성과급"],
      workConditionDetail: "글로벌 제약사 표준 복리후생 및 성과 보상 제도를 운영합니다.",
      positionIntro:
        "QA 담당자는 GMP 기준에 따른 품질 시스템을 운영하며, 글로벌 본사와 국내 규제기관 사이에서 품질 정책과 규제 대응을 조율하는 역할입니다.",
      hiringProcess: ["서류 전형", "실무 면접", "최종 합격"],
    },
    org: {
      name: "한국로슈",
      orgType: "제약사",
      employeeCount: "101~500명",
      shortIntro: "항암·면역질환 영역의 전문의약품을 국내에 공급하는 글로벌 제약사 로슈의 한국법인입니다.",
      description:
        "한국로슈는 다국적 제약사 로슈의 한국법인으로, 항암·면역질환 영역의 전문의약품을 국내에 공급합니다.",
      keywords: ["글로벌 제약사", "항암", "면역질환", "GMP"],
      logoUrl: companyLogos["한국로슈"],
    },
    businessContext: {
      businessFields: ["항암 전문의약품", "면역질환 전문의약품"],
      products: [
        { name: "항암 전문의약품", description: "항암 영역의 전문의약품을 국내에 공급합니다." },
        { name: "면역질환 전문의약품", description: "면역질환 영역의 전문의약품을 국내에 공급합니다." },
      ],
    },
  },

  "otsuka-mi-pv": {
    slug: "otsuka-mi-pv",
    companyId: "otsuka-korea",
    job: {
      title: "정규직 MI/PV 채용",
      tags: ["다국적제약", "PV·Drug Safety", "정규직", "경력무관"],
      oneLineIntro: "의학정보(MI) 및 약물감시(PV)를 담당할 메디컬 인재를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "약무·안전관리", sub: "PV·Drug Safety" },
      employmentType: "정규직",
      workMode: "사무실 근무",
      isLeadership: false,
      career: "경력무관",
      headcount: "○명",
      education: "학사 이상",
      location: {
        address: "서울 강남구 역삼로 226, 오츠카제약빌딩",
        workMode: "사무실 근무",
      },
      coreKeywords: ["Medical Information", "Pharmacovigilance", "약물감시", "안전성", "의학정보", "약사 면허"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/otsuka-mi-pv",
      },
      deadline: { date: "2026-08-21", label: "마감 D-33", status: "dDay" },
      postingSource: "direct",
      introduction:
        "의약품 의학정보(Medical Information) 제공 및 약물감시(Pharmacovigilance) 업무를 담당할 인재를 찾습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "의약품 의학정보(MI) 문의 대응 및 자료 관리",
          "약물 이상사례(PV) 수집·평가·보고 및 안전성 자료 관리",
          "규제기관 보고 및 안전성 문서 작성",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["약학·생명과학 관련 전공 학사 이상", "경력 무관 (신입 지원 가능)", "의학·약학 용어에 대한 이해"],
      },
      preferred: {
        format: "bullet",
        items: ["약사 면허 보유자", "영어 커뮤니케이션 가능자", "MI·PV 유관 경험자"],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "다국적 제약사 표준 복리후생 제도를 운영합니다.",
      positionIntro:
        "의약품 의학정보(Medical Information) 제공 및 약물감시(Pharmacovigilance) 업무를 담당할 인재를 찾습니다.",
      // hiringProcess/requiredDocuments/additionalNotes: 없음 — 원본과 jobs.ts 모두 전형 절차 정보가 없다
    },
    org: {
      name: "한국오츠카제약",
      orgType: "다국적제약",
      employeeCount: "비공개",
      shortIntro: "중추신경계·순환기 등 전문의약품을 공급하는 일본 오츠카제약의 한국법인입니다.",
      description:
        "일본 오츠카제약의 한국법인으로 중추신경계·순환기 등 전문의약품을 공급합니다.",
      keywords: ["다국적 제약사", "중추신경계", "순환기", "메디컬"],
      logoUrl: companyLogos["한국오츠카제약"],
    },
    businessContext: {
      businessFields: ["중추신경계 전문의약품", "순환기 전문의약품"],
    },
  },

  "bukwang-bd-lead": {
    slug: "bukwang-bd-lead",
    companyId: "bukwang",
    job: {
      title: "본사 사업개발(BD) 팀장 채용 (경력 8년~)",
      tags: ["전문의약품 제조업", "BD·Licensing", "정규직", "경력"],
      oneLineIntro: "신약 라이선싱·기술이전을 주도할 사업개발 팀장을 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "전략·투자", sub: "BD·Licensing" },
      employmentType: "정규직",
      workMode: "사무실 근무",
      isLeadership: true,
      career: "경력 8년 이상",
      headcount: "1명",
      education: "학사 이상",
      location: {
        address: "서울 동작구",
        workMode: "사무실 근무",
      },
      coreKeywords: ["BD", "라이선싱", "기술이전", "파트너십", "신약 파이프라인", "계약 협상"],
      apply: {
        method: "quick",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "direct",
      introduction: "신약 파이프라인의 사업개발(BD)과 라이선싱·기술이전을 총괄할 팀장급 인재를 찾습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "신약·파이프라인 라이선스 인/아웃 및 기술이전 전략 수립",
          "국내외 파트너십·제휴 발굴 및 계약 협상",
          "사업개발 프로젝트 총괄 및 경영진 보고",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["관련 전공 학사 이상", "제약·바이오 BD·라이선싱 경력 8년 이상", "계약·협상 실무 경험"],
      },
      preferred: {
        format: "bullet",
        items: ["영어 협상·계약 가능자", "글로벌 라이선싱 딜 경험자", "약학·이공계 + 경영 백그라운드"],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "4대 보험, 연차, 교육비 지원, 성과급 제도를 운영합니다.",
      positionIntro: "신약 파이프라인의 사업개발(BD)과 라이선싱·기술이전을 총괄할 팀장급 인재를 찾습니다.",
      // hiringProcess/requiredDocuments/additionalNotes: 없음 — 원본과 jobs.ts 모두 전형 절차 정보가 없다
    },
    org: {
      name: "부광약품",
      orgType: "전문의약품 제조업",
      employeeCount: "비공개",
      shortIntro: "중추신경계·항암 등에 강점을 가진 국내 중견 제약사입니다.",
      description:
        "중추신경계·항암 등에 강점을 가진 국내 중견 제약사로 신약개발과 오픈이노베이션을 추진합니다.",
      keywords: ["국내 제약사", "중추신경계", "항암", "오픈이노베이션"],
      logoUrl: companyLogos["부광약품"],
    },
    businessContext: {
      businessFields: ["중추신경계 전문의약품", "항암 전문의약품", "신약개발·오픈이노베이션"],
    },
  },

  "lgchem-mfg-pharmacist": {
    slug: "lgchem-mfg-pharmacist",
    companyId: "lgchem-life-science",
    job: {
      title: "생명과학사업본부 온산공장 제조관리약사 모집",
      tags: ["제약·바이오(대기업)", "제약 약무", "정규직", "경력무관"],
      oneLineIntro: "의약품 제조 공정의 제조관리약사를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "약무·안전관리", sub: "제약 약무" },
      employmentType: "정규직",
      workMode: "사무실·현장",
      isLeadership: false,
      career: "경력무관(졸업예정자 가능)",
      headcount: "○명",
      education: "학사 이상(졸업예정자 가능)",
      location: {
        address: "울산 울주군 온산읍 이진로 19-2, LG화학 온산공장",
        workMode: "사무실·현장",
      },
      coreKeywords: ["제조관리약사", "GMP", "의약품 생산", "약사 면허", "품질"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/lgchem-mfg-pharmacist",
      },
      deadline: { date: "2026-08-25", label: "마감 D-37", status: "dDay" },
      postingSource: "direct",
      introduction: "의약품 제조 공정의 품질과 적법성을 책임질 제조관리약사를 찾습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "의약품 제조 공정 관리 및 제조 기록 검토",
          "GMP 기준 준수 및 제조 관련 문서 관리",
          "제조소 품질 이슈 대응",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["약학 전공 학사 이상 (졸업예정자 가능)", "약사 면허 보유(예정) 자", "경력 무관"],
      },
      preferred: {
        format: "bullet",
        items: ["제조관리약사 경험자", "GMP 이해 보유자", "의약품 생산 현장 이해"],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "대기업 계열 표준 복리후생 및 성과 보상 제도를 운영합니다.",
      positionIntro: "의약품 제조 공정의 품질과 적법성을 책임질 제조관리약사를 찾습니다.",
      // hiringProcess/requiredDocuments/additionalNotes: 없음 — 원본과 jobs.ts 모두 전형 절차 정보가 없다
    },
    org: {
      name: "LG화학 생명과학본부",
      orgType: "제약·바이오(대기업)",
      employeeCount: "비공개",
      shortIntro: "당뇨·성장호르몬·백신 등 바이오의약품을 개발·생산하는 LG화학 생명과학사업본부입니다.",
      description: "LG화학 생명과학사업본부로 당뇨·성장호르몬·백신 등 바이오의약품을 개발·생산합니다.",
      keywords: ["대기업", "바이오의약품", "GMP", "생산 현장"],
      logoUrl: companyLogos["LG화학 생명과학본부"],
    },
    businessContext: {
      businessFields: ["당뇨 치료제", "성장호르몬", "백신"],
      products: [
        { name: "당뇨 치료제", description: "당뇨 영역의 바이오의약품을 개발·생산합니다." },
        { name: "성장호르몬", description: "성장호르몬 바이오의약품을 개발·생산합니다." },
        { name: "백신", description: "백신 바이오의약품을 개발·생산합니다." },
      ],
    },
  },

  "yuyu-ma-formulation": {
    slug: "yuyu-ma-formulation",
    companyId: "yuyu-pharm",
    job: {
      title: "MA/제제연구 부문별 경력 채용",
      tags: ["전문의약품 제조업", "바이오의약품 제제·분석", "정규직", "경력"],
      oneLineIntro: "제제연구 및 학술(MA) 부문 경력 인재를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "연구개발", sub: "바이오의약품 제제·분석" },
      employmentType: "정규직",
      workMode: "사무실 근무",
      isLeadership: false,
      career: "경력 4년 이상",
      headcount: "1명",
      education: "학사 이상",
      location: {
        address: "서울 중구 남대문로 197, 유유제약",
        workMode: "사무실 근무",
      },
      coreKeywords: ["제제연구", "Medical Affairs", "학술", "제품 개발", "처방 설계"],
      apply: {
        method: "quick",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "direct",
      introduction:
        "제제연구 및 학술(Medical Affairs) 부문에서 제품 개발과 학술 활동을 담당할 경력 인재를 찾습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "제제 연구·개발 및 처방 설계",
          "학술 자료 작성 및 제품 관련 의학·약학 정보 관리",
          "유관 부서(개발·RA·마케팅) 협업",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["약학·화학·생명과학 관련 전공 학사 이상", "제제연구 또는 학술(MA) 경력 4년 이상"],
      },
      preferred: {
        format: "bullet",
        items: ["제제 개발 프로젝트 경험자", "약사 면허 보유자"],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "4대 보험, 연차, 교육비 지원, 성과급 제도를 운영합니다.",
      positionIntro:
        "제제연구 및 학술(Medical Affairs) 부문에서 제품 개발과 학술 활동을 담당할 경력 인재를 찾습니다.",
      // hiringProcess/requiredDocuments/additionalNotes: 없음 — 원본과 jobs.ts 모두 전형 절차 정보가 없다
    },
    org: {
      name: "유유제약",
      orgType: "전문의약품 제조업",
      employeeCount: "비공개",
      shortIntro: "순환기·비뇨기 등에 강점을 가진 국내 중견 제약사입니다.",
      description: "순환기·비뇨기 등에 강점을 가진 국내 중견 제약사입니다.",
      keywords: ["국내 제약사", "순환기", "비뇨기", "제제연구"],
      logoUrl: companyLogos["유유제약"],
    },
    businessContext: {
      businessFields: ["순환기 전문의약품", "비뇨기 전문의약품"],
    },
  },

  "cellbion-qaqc": {
    slug: "cellbion-qaqc",
    companyId: "cellbion",
    job: {
      title: "생산본부 QA·QC 신입/경력 채용",
      tags: ["바이오 신약개발", "QA", "정규직", "신입·경력"],
      oneLineIntro: "방사성의약품 생산본부의 QA·QC 인재를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "생산·품질", sub: "QA" },
      employmentType: "정규직",
      workMode: "사무실·현장",
      isLeadership: false,
      career: "신입·경력 2년 이상",
      headcount: "○명",
      education: "학사 이상",
      location: {
        address: "서울 종로구",
        workMode: "사무실·현장",
      },
      coreKeywords: ["QA", "QC", "GMP", "품질관리", "CAPA", "방사성의약품"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/cellbion-qaqc",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "direct",
      introduction:
        "방사성의약품 신약을 개발하는 바이오텍 생산본부에서 품질보증(QA)·품질관리(QC)를 담당할 인재를 찾습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "생산 공정 품질보증(QA) 및 품질관리(QC) 업무",
          "GMP 기준 품질 문서 작성·관리 및 시험 데이터 관리",
          "일탈·부적합 관리 및 시정·예방조치(CAPA)",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["약학·화학·생명과학 관련 전공 학사 이상", "신입 또는 QA·QC 경력 2년 이상"],
      },
      preferred: {
        format: "bullet",
        items: ["GMP·QMS 이해 보유자", "바이오의약품 품질 경험자"],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "4대 보험, 연차, 교육비 지원, 성과급 제도를 운영합니다.",
      positionIntro:
        "방사성의약품 신약을 개발하는 바이오텍 생산본부에서 품질보증(QA)·품질관리(QC)를 담당할 인재를 찾습니다.",
      // hiringProcess/requiredDocuments/additionalNotes: 없음 — 원본과 jobs.ts 모두 전형 절차 정보가 없다
    },
    org: {
      name: "셀비온",
      orgType: "바이오 신약개발",
      employeeCount: "비공개",
      shortIntro: "방사성의약품(RPT) 신약을 개발하는 혁신 바이오텍입니다.",
      description: "방사성의약품(RPT) 신약을 개발하는 혁신 바이오텍입니다.",
      keywords: ["혁신 바이오벤처", "방사성의약품", "RPT", "GMP"],
      logoUrl: companyLogos["셀비온"],
    },
    businessContext: {
      businessFields: ["방사성의약품(RPT) 신약개발"],
    },
  },

  "samsung-pharma-qc": {
    slug: "samsung-pharma-qc",
    companyId: "samsung-pharm",
    job: {
      title: "QC 경력 채용 (9년 이상)",
      tags: ["전문의약품 제조업", "QC", "정규직", "경력"],
      oneLineIntro: "의약품 품질관리(QC) 경력 팀원을 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "생산·품질", sub: "QC" },
      employmentType: "정규직",
      workMode: "사무실·현장",
      isLeadership: false,
      career: "경력 9년 이상",
      headcount: "○명",
      education: "학사 이상",
      location: {
        address: "경기 화성시",
        workMode: "사무실·현장",
      },
      coreKeywords: ["QC", "품질관리", "시험·분석", "HPLC", "GMP"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/samsung-pharma-qc",
      },
      deadline: { date: "2026-08-28", label: "마감 D-40", status: "dDay" },
      postingSource: "direct",
      introduction: "의약품 품질관리(QC) 부문에서 시험·분석과 품질 데이터를 책임질 시니어 인재를 찾습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "원부자재·완제품 시험 및 분석",
          "품질관리(QC) 데이터 관리 및 시험기기 관리",
          "부적합 원인 분석 및 품질 문서 관리",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["화학·약학·생명과학 관련 전공 학사 이상", "QC 경력 9년 이상"],
      },
      preferred: {
        format: "bullet",
        items: ["HPLC·GC 등 분석기기 운용 경험자", "GMP 품질 시스템 경험자"],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "4대 보험, 연차, 교육비 지원, 성과급 제도를 운영합니다.",
      positionIntro: "의약품 품질관리(QC) 부문에서 시험·분석과 품질 데이터를 책임질 시니어 인재를 찾습니다.",
      // hiringProcess/requiredDocuments/additionalNotes: 없음 — 원본과 jobs.ts 모두 전형 절차 정보가 없다
    },
    org: {
      name: "삼성제약",
      orgType: "전문의약품 제조업",
      employeeCount: "비공개",
      shortIntro: "의약품·건강기능식품을 제조하는 국내 제약사입니다.",
      description: "의약품·건강기능식품을 제조하는 국내 제약사입니다.",
      keywords: ["국내 제약사", "품질관리", "GMP", "건강기능식품"],
      logoUrl: companyLogos["삼성제약"],
    },
    businessContext: {
      businessFields: ["전문의약품 제조", "건강기능식품"],
    },
  },

  "oreon-raqaqc": {
    slug: "oreon-raqaqc",
    companyId: "oreon",
    job: {
      title: "메디컬에스테틱 품질경영본부 RA/QA/QC 인재 채용",
      tags: ["의료기기·메디컬에스테틱", "의료기기 RA", "정규직", "경력무관"],
      oneLineIntro: "미용 의료기기 인허가(RA)·품질(QA/QC) 인재를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "RA·인허가", sub: "의료기기 RA" },
      employmentType: "정규직(수습 3개월)",
      workMode: "사무실·현장",
      isLeadership: false,
      career: "경력무관(수습 3개월)",
      headcount: "○명",
      education: "초대졸 이상",
      location: {
        address: "경기 성남시 중원구 사기막골로 99, 일성테크비즈 2차",
        workMode: "사무실·현장",
      },
      coreKeywords: ["RA", "QA", "QC", "ISO13485", "CE MDR", "FDA", "GC/LC"],
      apply: {
        method: "quick",
      },
      deadline: { date: "2026-09-01", label: "마감 D-44", status: "dDay" },
      postingSource: "direct",
      introduction:
        "보톡스·필러 등 미용 의료제품을 70여 개국에 수출하는 기업의 품질경영본부에서 인허가(RA)·품질(QA/QC)을 담당할 인재를 찾습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "(RA) 식약처·CE·FDA 등 국내외 의료기기 인허가 전략 수립 및 기술문서 작성",
          "(QA) ISO 13485·GMP 기반 QMS 운영 및 심사 대응, 내부 품질 감사·CAPA",
          "(QC) 원부자재·제품 검사, 함량 분석(GC/LC), 품질 문서 관리",
        ],
      },
      requirements: {
        format: "bullet",
        items: [
          "의공학·생명공학·화학 등 유관 전공 (초대졸 이상)",
          "(RA) 인허가 경력 1~5년 / (QA) 경력 3년 이상 / (QC) 경력 무관",
        ],
      },
      preferred: {
        format: "bullet",
        items: ["의료기기 RA 1·2급 자격증 취득자", "CE MDR·FDA·해외 화장품 인허가 경력자", "비즈니스 영어 가능자"],
      },
      benefits: ["4대 보험", "자율복장", "식대 지원", "성과급", "생일 상품권"],
      workConditionDetail: "자율복장, 식대 지원, 자유로운 연차 사용, 성과급 등을 운영합니다(포괄임금제).",
      positionIntro:
        "보톡스·필러 등 미용 의료제품을 70여 개국에 수출하는 기업의 품질경영본부에서 인허가(RA)·품질(QA/QC)을 담당할 인재를 찾습니다.",
      // hiringProcess/requiredDocuments/additionalNotes: 없음 — 원본과 jobs.ts 모두 전형 절차 정보가 없다
    },
    org: {
      // 원본 파일의 기업명은 "(주)에지앙"이지만 목록(jobs.ts 118)의 기업명이 "오래온"이라 목록 값을 따른다.
      name: "오래온",
      orgType: "의료기기·메디컬에스테틱",
      employeeCount: "비공개",
      shortIntro: "보톡스·필러·미용 봉합사 등 메디컬 에스테틱 제품을 70여 개국에 수출하는 전문 기업입니다.",
      description:
        "보톡스·필러·미용 봉합사 등 메디컬 에스테틱 제품을 70여 개국에 수출하는 전문 기업입니다.",
      keywords: ["의료기기", "메디컬 에스테틱", "글로벌 수출", "RA"],
      logoUrl: companyLogos["오래온"],
    },
    businessContext: {
      businessFields: ["보톡스", "필러", "미용 봉합사"],
      products: [
        { name: "보톡스", description: "메디컬 에스테틱 제품으로 70여 개국에 수출합니다." },
        { name: "필러", description: "메디컬 에스테틱 제품으로 70여 개국에 수출합니다." },
        { name: "미용 봉합사", description: "메디컬 에스테틱 제품으로 70여 개국에 수출합니다." },
      ],
    },
  },

  "aju-clinical-pm": {
    slug: "aju-clinical-pm",
    companyId: "aju-pharm",
    job: {
      title: "임상PM/제제개발/건기식개발 담당 채용",
      tags: ["전문의약품 제조업", "임상 PM", "정규직", "경력"],
      oneLineIntro: "임상 프로젝트 관리(PM) 및 개발 담당 인재를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "임상", sub: "임상 PM" },
      employmentType: "정규직",
      workMode: "사무실 근무",
      isLeadership: false,
      career: "경력 3년 이상",
      headcount: "○명",
      education: "학사 이상",
      location: {
        address: "서울 구로구 경인로 600",
        workMode: "사무실 근무(포지션별 상이)",
      },
      coreKeywords: ["임상PM", "GCP", "임상시험", "제제개선", "건강기능식품"],
      apply: {
        method: "quick",
      },
      deadline: { date: "2026-09-04", label: "마감 D-47", status: "dDay" },
      postingSource: "direct",
      introduction: "임상 프로젝트 관리(PM)와 제제개선·건강기능식품 개발을 담당할 경력 인재를 찾습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "임상시험 프로젝트 기획 및 운영 관리(PM)",
          "제제 개선 및 건강기능식품 개발 업무",
          "유관 부서·기관 협업 및 일정 관리",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["약학·생명과학 관련 전공 학사 이상", "임상·개발 유관 경력 3년 이상"],
      },
      preferred: {
        format: "bullet",
        items: ["GCP 이해 보유자", "임상시험 운영 경험자", "약사 면허 보유자"],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "4대 보험, 연차, 교육비 지원, 성과급 제도를 운영합니다.",
      positionIntro: "임상 프로젝트 관리(PM)와 제제개선·건강기능식품 개발을 담당할 경력 인재를 찾습니다.",
      // hiringProcess/requiredDocuments/additionalNotes: 없음 — 원본과 jobs.ts 모두 전형 절차 정보가 없다
    },
    org: {
      name: "아주약품",
      orgType: "전문의약품 제조업",
      employeeCount: "비공개",
      shortIntro: "순환기·소화기 등 전문의약품과 건강기능식품을 보유한 국내 제약사입니다.",
      description: "순환기·소화기 등 전문의약품과 건강기능식품을 보유한 국내 제약사입니다.",
      keywords: ["국내 제약사", "순환기", "소화기", "건강기능식품"],
      logoUrl: companyLogos["아주약품"],
    },
    businessContext: {
      businessFields: ["순환기 전문의약품", "소화기 전문의약품", "건강기능식품"],
    },
  },

  "samo-bd": {
    slug: "samo-bd",
    companyId: "samo-pharm",
    job: {
      title: "개발부(BD) 경력 모집 (7년 이상)",
      tags: ["전문의약품 제조업", "BD·Licensing", "정규직", "경력"],
      oneLineIntro: "신약 개발·사업개발(BD) 경력 인재를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "전략·투자", sub: "BD·Licensing" },
      employmentType: "정규직",
      workMode: "사무실 근무",
      isLeadership: false,
      career: "경력 7년 이상",
      headcount: "○명",
      education: "학사 이상",
      location: {
        address: "서울",
        workMode: "사무실 근무",
      },
      coreKeywords: ["BD", "개발", "라이선싱", "사업개발", "파트너십"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/samo-bd",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "direct",
      introduction: "신약·제품 개발과 사업개발(BD)을 담당할 경력 인재를 찾습니다.",
      responsibilities: {
        format: "bullet",
        items: ["신약·제품 개발 기획 및 사업개발(BD)", "라이선싱·제휴 검토 및 파트너십 발굴", "개발 프로젝트 관리"],
      },
      requirements: {
        format: "bullet",
        items: ["관련 전공 학사 이상", "개발·BD 유관 경력 7년 이상"],
      },
      preferred: {
        format: "bullet",
        items: ["라이선싱·기술이전 경험자", "영어 가능자"],
      },
      benefits: ["4대 보험", "연차", "성과급"],
      workConditionDetail: "4대 보험, 연차, 성과급 제도를 운영합니다.",
      positionIntro: "신약·제품 개발과 사업개발(BD)을 담당할 경력 인재를 찾습니다.",
      // hiringProcess/requiredDocuments/additionalNotes: 없음 — 원본과 jobs.ts 모두 전형 절차 정보가 없다
    },
    org: {
      name: "(주)삼오제약",
      orgType: "전문의약품 제조업",
      employeeCount: "비공개",
      shortIntro: "전문의약품을 제조하는 국내 제약사입니다.",
      description: "전문의약품을 제조하는 국내 제약사입니다.",
      keywords: ["국내 제약사", "전문의약품", "사업개발"],
      logoUrl: companyLogos["(주)삼오제약"],
    },
    businessContext: {
      businessFields: ["전문의약품 제조"],
    },
  },

  "kolonbiotech-qaqc": {
    slug: "kolonbiotech-qaqc",
    companyId: "kolon-biotech",
    job: {
      title: "품질부문(QC/QA) 신입/경력(초대졸) 채용",
      tags: ["바이오·제약 제조", "QC", "정규직", "신입·경력"],
      oneLineIntro: "바이오·제약 생산의 품질부문(QC/QA) 인재를 찾습니다.",
      salary: "회사 내규에 따름",
      jobCategory: { main: "생산·품질", sub: "QC" },
      employmentType: "정규직",
      workMode: "사무실·현장",
      isLeadership: false,
      career: "신입·경력 3년 이하",
      headcount: "○명",
      education: "초대졸(2·3년제) 이상",
      location: {
        address: "충북 충주시",
        workMode: "사무실·현장",
      },
      coreKeywords: ["QC", "QA", "GMP", "밸리데이션", "환경모니터링", "무균제제"],
      apply: {
        method: "homepage",
        url: "https://example.com/careers/kolonbiotech-qaqc",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "direct",
      introduction:
        "바이오·제약 의약품 생산의 품질부문(QC/QA)에서 시험·밸리데이션·문서관리를 담당할 인재를 찾습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "(QC) 이화학·미생물 시험 및 환경모니터링(EM)",
          "(QA) 적격성 평가 및 밸리데이션 수행",
          "GMP 문서(계획서·보고서·SOP) 작성 및 관리",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["2·3년제 전문대학 학위(화학·미생물·생명공학 관련)", "(경력) 제약회사 품질관리/보증 경력 3년 이하"],
      },
      preferred: {
        format: "bullet",
        items: ["GMP 환경 근무 경험자", "생물학적 제제·무균제제 QA 경험자", "외국어 능력 우수자"],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "4대 보험, 연차, 교육비 지원 등 복리후생을 운영합니다.",
      positionIntro:
        "바이오·제약 의약품 생산의 품질부문(QC/QA)에서 시험·밸리데이션·문서관리를 담당할 인재를 찾습니다.",
      // hiringProcess/requiredDocuments/additionalNotes: 없음 — 원본과 jobs.ts 모두 전형 절차 정보가 없다
    },
    org: {
      name: "코오롱바이오텍",
      orgType: "바이오·제약 제조",
      employeeCount: "비공개",
      shortIntro: "코오롱 계열의 바이오·제약 의약품 제조 기업입니다.",
      description: "코오롱 계열의 바이오·제약 의약품 제조 기업입니다.",
      keywords: ["바이오 생산", "GMP", "품질부문", "무균제제"],
      logoUrl: companyLogos["코오롱바이오텍"],
    },
    businessContext: {
      businessFields: ["바이오의약품 제조", "제약 의약품 제조"],
    },
  },

  "antibody-biotech-aoc": {
    slug: "antibody-biotech-aoc",
    // companyId: 없음 — 헤드헌팅 공고로 기업명이 비공개라 companies.ts에 대응 엔티티가 없다
    companyId: null,
    job: {
      title: "항체 바이오텍 AOC 연구원 (Antibody-Oligonucleotide Conjugate)",
      tags: ["바이오 신약개발(코스닥)", "신약개발", "정규직", "박사"],
      oneLineIntro: "차세대 모달리티 AOC를 설계·제작할 박사급 연구원을 찾습니다.",
      salary: "면접 후 결정",
      jobCategory: { main: "연구개발", sub: "신약개발" },
      employmentType: "정규직",
      workMode: "연구·사무",
      isLeadership: false,
      career: "박사 이상(졸업예정자 가능)",
      headcount: "1명",
      education: "박사 이상(취득 예정 포함)",
      location: {
        address: "서울 강남구 (역삼·강남 인근)",
        workMode: "연구·사무",
      },
      coreKeywords: ["AOC", "항체", "Oligonucleotide", "Conjugation", "신약연구", "차세대 모달리티"],
      apply: {
        method: "quick",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "headhunting",
      introduction:
        "글로벌 빅파마와 협업하는 코스닥 상장 항체 바이오텍에서 차세대 모달리티 AOC(Antibody-Oligonucleotide Conjugate)를 설계·제작할 박사급 연구원을 찾습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "AOC 설계 및 제작, Conjugation 반응 수행 및 공정 조건 최적화",
          "항체 공학 및 siRNA/oligonucleotide 기반 치료물질 설계",
          "In vitro 효능 평가·후보물질 스크리닝 및 CRO 협업",
        ],
      },
      requirements: {
        format: "bullet",
        items: [
          "화학·생명공학·약학·생물학 등 관련 분야 박사 학위(취득 예정 포함)",
          "Antibody-Oligonucleotide Conjugation 또는 Oligonucleotide 연구 경험",
        ],
      },
      preferred: {
        format: "bullet",
        items: ["제약사·바이오텍 연구개발 경험자", "Neuroscience 연구 경험자", "영어 기반 연구 커뮤니케이션 가능자"],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "상세 처우는 면접 후 결정됩니다.",
      positionIntro:
        "글로벌 빅파마와 협업하는 코스닥 상장 항체 바이오텍에서 차세대 모달리티 AOC(Antibody-Oligonucleotide Conjugate)를 설계·제작할 박사급 연구원을 찾습니다.",
      // hiringProcess/requiredDocuments/additionalNotes: 없음 — 원본과 jobs.ts 모두 전형 절차 정보가 없다
    },
    org: {
      // 헤드헌팅 공고 — jobs.ts 128의 company 문자열을 그대로 쓴다(기업명 비공개 관례).
      name: "코스닥 상장 항체 바이오텍 (기업명 비공개)",
      orgType: "바이오 신약개발(코스닥)",
      employeeCount: "비공개",
      shortIntro: "글로벌 빅파마와 협업하는 코스닥 상장 항체 신약 바이오텍입니다.",
      description: "글로벌 빅파마와 협업하는 코스닥 상장 항체 신약 바이오텍입니다.",
      keywords: ["혁신 바이오벤처", "항체 신약", "AOC", "코스닥 상장"],
      // logoUrl: 없음 — 기업명 비공개 공고라 로고 자산을 연결하지 않는다
    },
    businessContext: {
      businessFields: ["항체 신약개발"],
    },
  },

  "biotech-nonclinical-tox": {
    slug: "biotech-nonclinical-tox",
    // companyId: 없음 — 헤드헌팅 공고로 기업명이 비공개라 companies.ts에 대응 엔티티가 없다
    companyId: null,
    job: {
      title: "비임상약리독성 연구원 (박사급)",
      tags: ["바이오 신약개발(상장)", "비임상", "정규직", "경력"],
      oneLineIntro: "ADC 후보물질의 비임상 PK/PD·독성을 책임질 박사급 연구원을 찾습니다.",
      salary: "면접 후 결정",
      jobCategory: { main: "연구개발", sub: "비임상" },
      employmentType: "정규직",
      workMode: "연구·사무",
      isLeadership: false,
      career: "경력 10~15년",
      headcount: "1명",
      education: "박사 이상",
      location: {
        address: "대전",
        workMode: "연구·사무",
      },
      coreKeywords: ["비임상", "독성", "ADME/T", "PK/PD", "ADC", "Pharmacology"],
      apply: {
        method: "quick",
      },
      deadline: { date: null, label: "상시 채용", status: "always" },
      postingSource: "headhunting",
      introduction:
        "상장 바이오텍의 비임상약리팀에서 ADC 후보물질의 비임상시험(ADME/T)과 PK/PD 모델 확립, 독성시험을 총괄할 박사급 연구원을 찾습니다.",
      responsibilities: {
        format: "bullet",
        items: [
          "후보물질 비임상시험(ADME/T) 계획 및 실행",
          "PK 기반 동물 약효모델 설계 및 PK/PD 모델 확립",
          "ADC 후보물질 독성시험 디자인·평가 및 CRO management",
        ],
      },
      requirements: {
        format: "bullet",
        items: ["신약개발 관련 전공 박사 이상", "Pharmacology 중 ADME·Toxicology 경험 10년 이상"],
      },
      preferred: {
        format: "bullet",
        items: ["ADC PK, PK/PD 전문가", "ADC 독성 전문가"],
      },
      benefits: ["4대 보험", "연차", "교육비 지원", "성과급"],
      workConditionDetail: "상세 처우는 면접 후 결정됩니다.",
      positionIntro:
        "상장 바이오텍의 비임상약리팀에서 ADC 후보물질의 비임상시험(ADME/T)과 PK/PD 모델 확립, 독성시험을 총괄할 박사급 연구원을 찾습니다.",
      // hiringProcess/requiredDocuments/additionalNotes: 없음 — 원본과 jobs.ts 모두 전형 절차 정보가 없다
    },
    org: {
      // 헤드헌팅 공고 — jobs.ts 129의 company 문자열을 그대로 쓴다(기업명 비공개 관례).
      name: "상장 바이오텍 (기업명 비공개)",
      orgType: "바이오 신약개발(상장)",
      employeeCount: "비공개",
      shortIntro: "ADC 등 차세대 모달리티를 개발하는 상장 바이오텍입니다.",
      description: "ADC 등 차세대 모달리티를 개발하는 상장 바이오텍입니다.",
      keywords: ["혁신 바이오벤처", "ADC", "차세대 모달리티", "비임상"],
      // logoUrl: 없음 — 기업명 비공개 공고라 로고 자산을 연결하지 않는다
    },
    businessContext: {
      businessFields: ["ADC 신약개발", "차세대 모달리티"],
    },
  },
};

export function getIndustryJobDetail(slug: string): IndustryJobDetail | null {
  return industryJobDetails[slug] ?? null;
}
