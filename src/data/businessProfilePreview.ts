import { companyExampleImages } from "@/config/companyImages";
import { getHospitalCombinedTypeLabel, getPharmacyTypeLabel } from "@/config/companyTypes";
import { getResearchInstitutionTypeLabel } from "@/config/jobFilters/researchFilters";
import {
  companyTypeOptions,
  employeeCountOptions,
  type CompanyProfileMaster,
  type IndustryOrgProfile,
  type OrgAdmin,
} from "@/data/businessCompanyProfile";
import type { HospitalOrgProfile, OrgFeatureItem, PharmacyOrgProfile, ResearchOrgProfile } from "@/data/businessOrgProfile";
import { regionFromAddress } from "@/data/companyDirectory";
import type { CompanyProfile, CompanyProfileFeature } from "@/data/companyProfiles";
import type { Company } from "@/types/jobs";
import { getCompanyInitial } from "@/utils/companyInitial";

/**
 * 기업센터 "브랜드 페이지 미리보기"용 변환기. 기관정보 관리(BusinessCompanyProfileClient/HospitalOrgProfileClient/
 * PharmacyOrgProfileClient)가 편집하는 CompanyProfileMaster/HospitalOrgProfile/PharmacyOrgProfile은 개인 회원용
 * CompanyProfile(companyProfiles.ts)과 필드가 다른 별개 데이터라, 상세 페이지 컴포넌트(CompanyDetailSections.tsx)에
 * 그대로 넣을 수 있게 여기서 매핑한다. 미리보기 id는 실제 companies.ts/companyProfiles.ts의 어떤 id와도 겹치지
 * 않는 값을 써서, 그 컴포넌트들이 내부적으로 하는 id 기반 조회(companies.find 등)가 실데이터를 잘못 끌어오지
 * 않게 한다 — 값을 못 찾으면 각 컴포넌트가 이미 가진 "데이터 없음" 폴백(예: CompanyHero의 tags 폴백)으로 자연히 빠진다.
 */


function employeeCountLabel(range: CompanyProfileMaster["employeeCount"]) {
  return employeeCountOptions.find((option) => option.id === range)?.label ?? "-";
}

function toProfileFeatures(features: OrgFeatureItem[]): CompanyProfileFeature[] {
  return features.filter((item) => item.label.trim() && item.text.trim()).map((item) => ({ label: item.label, text: item.text }));
}

function industryTypeLabel(type: IndustryOrgProfile["orgType"]) {
  return companyTypeOptions.find((option) => option.id === type)?.label ?? "기타";
}

/** 주소 3필드(zipCode/address/detailAddress) 중 우편번호는 화면 표시용이 아니라 검색 보조값이라 제외하고,
 * 주소+상세주소만 한 줄로 합친다. 병원·약국처럼 address 단일 필드였던 트랙과 표시 방식을 맞춘다. */
function combineIndustryAddress(profile: IndustryOrgProfile) {
  return [profile.address, profile.detailAddress].filter((part) => part.trim()).join(" ");
}

/** 기관 정보 청사진 STEP 4-a에서 재설계한 IndustryOrgProfile/OrgAdmin 전용 변환기 — 기관정보 관리(BusinessCompanyProfileClient)가
 * 편집하는 새 타입을 그대로 받는다. 산업 트랙의 유일한 미리보기 변환기다. */
export function buildIndustryPreview(profile: IndustryOrgProfile, admin: OrgAdmin): CompanyProfile {
  const typeLabel = industryTypeLabel(profile.orgType);
  const address = combineIndustryAddress(profile);
  const businessFields = profile.businessFields ?? [];

  return {
    id: profile.id,
    name: profile.name,
    logoText: getCompanyInitial(profile.name),
    logoImage: profile.logoUrl ?? undefined,
    tagline: profile.shortIntro,
    tags: [typeLabel, profile.foundedYear ? `설립 ${profile.foundedYear}년` : null, employeeCountLabel(profile.employeeCount)].filter(
      (value): value is string => Boolean(value),
    ),
    coverImage: profile.coverImageUrl ?? companyExampleImages.hero,
    metrics: [
      { label: "기업 형태", value: typeLabel },
      { label: "사원수", value: employeeCountLabel(profile.employeeCount) },
      { label: "설립", value: profile.foundedYear ? `${profile.foundedYear}년` : "-" },
      { label: "주요 사업분야", value: businessFields.slice(0, 2).join(" · ") || "-" },
    ],
    /** 산업 프로필은 근무 약사 수 같은 별도 요약 통계 필드가 없다 — 사업·제품 분야는 metrics(요약)와
     * details(전체 목록)에서 이미 노출되므로 여기서는 중복해 넣지 않는다. */
    businessSummary: [],
    recruitSummary: profile.fullIntro,
    /** CompanyOverview("기업 소개")가 읽는 자리는 recruitSummary가 아니라 이쪽이다 — 둘 다 채워야
     * 폼의 본문 소개가 미리보기에 실린다. 비어 있으면 종전대로 섹션이 통째로 숨는다. */
    fullIntro: profile.fullIntro,
    /** 라벨 문자열이 곧 조회 키다 — CompanyDetailOverview가 detailValue(profile, "기관 유형" | "직원 수" |
     * "설립 연도" | "사업 분야" | "본사 위치" | "홈페이지")로 꺼내 스탯 카드 4장과 정보 행을 세운다.
     * 종전 표기("기업 형태"·"설립일"·"사업·제품 분야")는 그 키와 어긋나 카드 4장이 항상 숨었고,
     * "직원 수"는 아예 없어 값이 있어도 설 자리가 없었다. companyProfiles.ts의 산업 항목이 쓰는
     * 라벨과 같은 표기로 맞춘다 — 미리보기와 실제 상세가 같은 키를 봐야 한다. */
    details: [
      { label: "대표자", value: admin.representativeName || null },
      { label: "기관 유형", value: typeLabel },
      { label: "직원 수", value: employeeCountLabel(profile.employeeCount) },
      { label: "설립 연도", value: profile.foundedYear ? `${profile.foundedYear}년` : null },
      { label: "사업 분야", value: businessFields.join(" · ") || null },
      { label: "본사 위치", value: address || null },
      { label: "홈페이지", value: profile.homepageUrl || null },
    ],
    keywords: profile.keywords,
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: profile.products,
      address,
    },
  };
}

/** 연구 트랙: 병원·약국과 같은 이유로 kist 등 실데이터를 조회하지 않고 항상 여기서 변환한다.
 * 병원·약국과 달리 { profile, company } 쌍이 아니라 profile만 돌려준다 — 연구 트랙의 구직자 상세
 * 컴포넌트(ResearchSummarySection/ResearchAsidePanel)는 Company를 인자로 받지 않는다. 기관 유형·연구
 * 인력 규모 같은 트랙 전용 값이 Company가 아니라 CompanyProfile에 실려 있기 때문이라, 여기서 Company
 * 목객체를 만들어 봐야 읽는 쪽이 없다. */
export function buildResearchPreview(org: ResearchOrgProfile): CompanyProfile {
  const id = "business-preview-research";
  const typeLabel = org.institutionType ? getResearchInstitutionTypeLabel(org.institutionType) : "";
  const fullAddress = [org.address, org.detailAddress].filter((part) => part.trim()).join(" ");
  const region = regionFromAddress(org.address);

  return {
    id,
    name: org.institutionName,
    logoText: getCompanyInitial(org.institutionName),
    logoImage: org.logoUrl ?? undefined,
    tagline: org.shortIntro,
    /** CompanyHero의 institutionHeroBadges는 companies.ts 조회에 실패하면 이 tags로 폴백한다.
     * 실제 연구 기관 상세가 세우는 배지(기관 유형 + 지역)와 같은 두 칸을 여기서 만든다. */
    tags: [typeLabel, region].filter((value) => Boolean(value)),
    coverImage: org.coverImageUrl ?? companyExampleImages.research,
    /** ResearchInfoCard는 metrics를 읽지 않는다(병원의 "병상 수"처럼 metricValue로 꺼내 쓰는 값이 없다) */
    metrics: [],
    businessSummary: [],
    recruitSummary: org.shortIntro,
    fullIntro: org.fullIntro,
    /** 라벨 문자열이 곧 조회 키다 — ResearchInfoCard가 detailValue(profile, "설립 연도" | "본사 위치" | "홈페이지")로
     * 꺼내므로 산업 변환기의 "설립일" 같은 표기를 복제하면 그 행이 통째로 사라진다. */
    details: [
      { label: "설립 연도", value: org.foundedYear ? `${org.foundedYear}년` : null },
      { label: "본사 위치", value: fullAddress || null },
      { label: "홈페이지", value: org.homepageUrl || null },
    ],
    keywords: org.keywords,
    news: [],
    features: toProfileFeatures(org.features),
    phone: org.phone || undefined,
    email: org.email || undefined,
    institutionTypeId: org.institutionType || undefined,
    staffScaleId: org.staffScale || undefined,
    researchFields: org.researchFieldIds,
    equipmentInfra: org.equipmentInfra || undefined,
    achievements: org.achievements || undefined,
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: fullAddress,
    },
  };
}

/** 병원 트랙: initialHospitalOrgProfile은 실제 companyProfiles.ts의 snubh 항목과 값이 겹치도록 만들어졌지만,
 * "기관정보 관리가 편집하는 그 프로필 객체를 그대로 사용"하라는 요구 때문에 snubh를 조회하지 않고 항상 여기서 변환한다. */
export function buildHospitalPreview(org: HospitalOrgProfile): { profile: CompanyProfile; company: Company } {
  const id = "business-preview-hospital";
  const typeLabel = getHospitalCombinedTypeLabel(org.hospitalType, org.hospitalOperator, org.specialtyLabel);
  const region = regionFromAddress(org.address);
  const fullAddress = [org.address, org.detailAddress].filter(Boolean).join(" ");

  const company: Company = {
    id,
    name: org.institutionName,
    logoText: getCompanyInitial(org.institutionName),
    logoUrl: org.logoUrl ?? undefined,
    logoColor: "#111111",
    verified: true,
    description: org.shortIntro,
    industry: typeLabel,
    employeeCount: "-",
    foundedYear: org.foundedYear,
    website: org.homepageUrl,
    address: fullAddress,
    hospitalType: org.hospitalType,
    hospitalOperator: org.hospitalOperator,
    specialtyLabel: org.specialtyLabel || undefined,
  };

  const profile: CompanyProfile = {
    id,
    name: org.institutionName,
    logoText: getCompanyInitial(org.institutionName),
    logoImage: org.logoUrl ?? undefined,
    tagline: org.shortIntro,
    tags: [typeLabel, region, org.bedCount ? `병상 ${org.bedCount}` : null].filter((value): value is string => Boolean(value)),
    coverImage: org.coverImageUrl ?? companyExampleImages.hero,
    metrics: [
      { label: "병상 수", value: org.bedCount ? `${org.bedCount}병상` : "-" },
      { label: "전문약사 보유", value: org.specialistPharmacists.length ? `${org.specialistPharmacists.length}개 분야` : "-" },
      { label: "약제부 인력", value: org.pharmacyStaffCount || "-" },
      { label: "주요 분야", value: typeLabel },
    ],
    businessSummary: [],
    recruitSummary: org.shortIntro,
    /** HospitalOverviewCard("병원 소개")가 읽는 자리 — 산업과 같은 이유로 별도 전달이 필요하다.
     * HospitalOrgProfile.fullIntro는 선택 입력이라 빈 문자열을 undefined로 눕혀 넘긴다. */
    fullIntro: org.fullIntro || undefined,
    details: [
      { label: "대표자", value: org.representativeName ? `병원장 ${org.representativeName}` : null },
      { label: "설립일", value: org.foundedYear || null },
      { label: "본사 위치", value: fullAddress || null },
      { label: "홈페이지", value: org.homepageUrl || null },
    ],
    /** STEP 5-c부터 병원 프로필도 기관 키워드를 입력받는다(§3 공개 프로필, 산업과 동일 필드).
     * HospitalAsidePanel이 병원 트랙에서 SidebarKeywordsCard를 렌더하지 않아 사이드바엔 아직 노출되지 않는다. */
    keywords: org.keywords,
    news: [],
    features: toProfileFeatures(org.features),
    dutySystem: org.dutySystem || undefined,
    medicalDepartments: org.medicalDepartments.length ? org.medicalDepartments : undefined,
    specialistPharmacists: org.specialistPharmacists.length ? org.specialistPharmacists : undefined,
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: fullAddress,
    },
  };

  return { profile, company };
}

/** 약국 트랙: 병원과 동일한 이유로 eunhaeng-pharmacy를 조회하지 않고 항상 여기서 변환한다.
 * 약국 정보 관리 폼에는 병원의 "핵심 키워드" 선택 UI에 대응하는 항목이 없어 keywords는 항상 빈 배열이다
 * — 사이드바 "핵심 키워드" 카드는 값이 없으면 스스로 숨는 기존 규칙(SidebarKeywordsCard)을 그대로 따른다. */
export function buildPharmacyPreview(org: PharmacyOrgProfile): { profile: CompanyProfile; company: Company } {
  const id = "business-preview-pharmacy";
  const typeLabel = getPharmacyTypeLabel(org.pharmacyType);
  const region = regionFromAddress(org.address);

  const company: Company = {
    id,
    name: org.pharmacyName,
    logoText: getCompanyInitial(org.pharmacyName),
    logoUrl: org.logoUrl ?? undefined,
    logoColor: "#111111",
    verified: true,
    description: org.shortIntro,
    industry: typeLabel,
    employeeCount: "-",
    foundedYear: org.foundedYear,
    website: "",
    address: org.address,
    pharmacyType: org.pharmacyType,
  };

  const profile: CompanyProfile = {
    id,
    name: org.pharmacyName,
    logoText: getCompanyInitial(org.pharmacyName),
    logoImage: org.logoUrl ?? undefined,
    tagline: org.shortIntro,
    tags: [typeLabel, region].filter((value): value is string => Boolean(value)),
    coverImage: companyExampleImages.hero,
    metrics: [
      { label: "일평균 처방", value: org.avgDailyPrescriptions ? `${org.avgDailyPrescriptions}건 내외` : "-" },
      { label: "주요 처방과", value: org.mainDepartments || "-" },
      { label: "근무 형태", value: org.businessHours || "-" },
      { label: "문전 여부", value: typeLabel },
    ],
    businessSummary: [
      org.staffPharmacistCount ? { label: "근무 약사", value: org.staffPharmacistCount } : null,
      org.staffSupportCount ? { label: "직원", value: org.staffSupportCount } : null,
    ].filter((item): item is { label: string; value: string } => Boolean(item)),
    recruitSummary: org.shortIntro,
    details: [
      { label: "대표자", value: org.representativeName || null },
      { label: "설립일", value: org.foundedYear || null },
      { label: "본사 위치", value: org.address || null },
    ],
    keywords: [],
    news: [],
    features: toProfileFeatures(org.features),
    pharmacySoftware: org.software || undefined,
    businessHours: org.businessHours || undefined,
    dispensingEquipment: org.dispensingEquipment.length ? org.dispensingEquipment : undefined,
    pharmacyFeatures: org.pharmacyFeatureIds,
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: org.address,
    },
  };

  return { profile, company };
}
