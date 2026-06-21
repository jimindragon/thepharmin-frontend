import type { JobTrack, OrganizationType } from "@/types/jobs";

const organizationTypeToTrack: Record<OrganizationType, JobTrack> = {
  pharmaceutical_company: "industry",
  biotech_company: "industry",
  medical_device_company: "industry",
  cro: "industry",
  cdmo: "industry",
  for_profit_research_lab: "industry",
  government_research_institute: "research",
  university_lab: "research",
  hospital_research_institute: "research",
  national_research_agency: "research",
  nonprofit_research_foundation: "research",
  pharmacy: "pharmacy",
  hospital: "hospital",
};

export function deriveJobTrack(
  organizationType: OrganizationType,
  adminTrackOverride?: JobTrack | null,
): JobTrack {
  // 추후 백엔드 연동 시 일반 기업 사용자는 override를 보낼 수 없고, 관리자 도구에서만 예외 수정하도록 연결합니다.
  return adminTrackOverride ?? organizationTypeToTrack[organizationType];
}

export const organizationTypeLabels: Record<OrganizationType, string> = {
  pharmaceutical_company: "제약사",
  biotech_company: "바이오기업",
  medical_device_company: "의료기기사",
  cro: "CRO",
  cdmo: "CDMO",
  for_profit_research_lab: "제약사 부설연구소",
  government_research_institute: "정부출연연구기관",
  university_lab: "대학·의과대학 연구실",
  hospital_research_institute: "병원 연구소",
  national_research_agency: "국가기관·산하 연구기관",
  nonprofit_research_foundation: "비영리 연구재단",
  pharmacy: "약국",
  hospital: "병원·의료기관",
};
