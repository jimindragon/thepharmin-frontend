import { companyLogos } from "@/config/companyImages";
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
        target: "https://example.com/careers/yuhan-ra-regulatory-strategy",
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
        target: "https://example.com/careers/medicoa-senior-cra",
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
        target: "https://example.com/careers/celltrionph-ra",
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
        target: "https://example.com/careers/celltrionph-clinical",
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
        target: "https://example.com/careers/celltrionph-bd",
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
        target: "https://example.com/careers/gsk-vaccine-msl-cvmd",
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
        target: "https://example.com/careers/gsk-oncology-msl",
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
        target: "https://example.com/careers/roche-cmc-qa",
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
};

export function getIndustryJobDetail(slug: string): IndustryJobDetail | null {
  return industryJobDetails[slug] ?? null;
}
