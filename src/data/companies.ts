import { companyExampleImages } from "@/config/companyImages";
import type { Company, CompanyReview, ReviewAccessState } from "@/types/jobs";

export const companies: Company[] = [
  {
    id: "thepharmin-pharma",
    name: "더팜인제약(주)",
    logoText: "더팜인제약",
    logoColor: "#111111",
    logoAccent: "#5a5a5a",
    coverImage: companyExampleImages.hero,
    defaultImage: companyExampleImages.primary,
    verified: true,
    description:
      "더팜인제약은 전문의약품과 바이오 의약품을 개발·제조하는 제약 기업입니다. 품질 중심의 연구개발 문화와 규제 대응 역량을 바탕으로 국내외 허가 전략을 고도화하고 있습니다.",
    industry: "전문의약품 제조업",
    employeeCount: "320명",
    foundedYear: "2012년",
    website: "https://www.thepharmin.com",
    activeJobCount: 4,
    address: "서울 강남구 테헤란로 123, 8층",
  },
];

export const companyReviews: CompanyReview[] = [
  {
    id: "review-interview-1",
    companyId: "thepharmin-pharma",
    type: "interview",
    tags: ["면접 분위기가 좋아요", "질문이 구체적이에요", "전형이 체계적이에요"],
    content: "RA 직무 경험을 중심으로 구체적인 사례를 물어봤고, 제출 문서 작성 방식에 대한 질문이 인상적이었습니다.",
    jobRole: "RA",
    authorStatus: "면접자",
    writtenAt: "2026.05",
    helpfulCount: 18,
    isRead: true,
  },
  {
    id: "review-company-1",
    companyId: "thepharmin-pharma",
    type: "company",
    tags: ["업무가 체계적이에요", "성장 기회가 많아요", "회사 분위기가 좋아요"],
    content: "허가 자료 검토 프로세스가 명확하고, 규제기관 대응 경험을 쌓기 좋은 환경이라는 점이 장점입니다.",
    jobRole: "Regulatory Affairs",
    authorStatus: "현직자",
    writtenAt: "2026.04",
    helpfulCount: 26,
    isRead: true,
  },
  {
    id: "review-interview-2",
    companyId: "thepharmin-pharma",
    type: "interview",
    tags: ["결과 안내가 빨라요", "질문이 구체적이에요"],
    content: "1차 면접에서 CTD 작성 경험과 영어 커뮤니케이션 상황을 자세히 확인했습니다.",
    jobRole: "RA",
    authorStatus: "면접자",
    writtenAt: "2026.03",
    helpfulCount: 11,
  },
  {
    id: "review-company-2",
    companyId: "thepharmin-pharma",
    type: "company",
    tags: ["복지가 좋아요", "워라밸이 좋아요"],
    content: "팀 단위로 업무를 공유하는 편이고, 품목별 일정 관리가 안정적으로 운영됩니다.",
    jobRole: "품질·인허가",
    authorStatus: "전직자",
    writtenAt: "2025.12",
    helpfulCount: 9,
  },
];

export const reviewAccessMock: ReviewAccessState = {
  remainingPasses: 2,
  canRead: true,
  statusText: "후기 열람권 2장 남음",
};
