import { companyExampleImages } from "@/config/companyImages";
import { getHospitalCombinedTypeLabel, getPharmacyTypeLabel } from "@/config/companyTypes";
import { companyTypeOptions, employeeCountOptions, type CompanyProfileMaster } from "@/data/businessCompanyProfile";
import type { HospitalOrgProfile, OrgFeatureItem, PharmacyOrgProfile } from "@/data/businessOrgProfile";
import { regionFromAddress } from "@/data/companyDirectory";
import type { CompanyProfile, CompanyProfileFeature } from "@/data/companyProfiles";
import type { Company } from "@/types/jobs";

/**
 * 기업센터 "브랜드 페이지 미리보기"용 변환기. 기관정보 관리(BusinessCompanyProfileClient/HospitalOrgProfileClient/
 * PharmacyOrgProfileClient)가 편집하는 CompanyProfileMaster/HospitalOrgProfile/PharmacyOrgProfile은 개인 회원용
 * CompanyProfile(companyProfiles.ts)과 필드가 다른 별개 데이터라, 상세 페이지 컴포넌트(CompanyDetailSections.tsx)에
 * 그대로 넣을 수 있게 여기서 매핑한다. 미리보기 id는 실제 companies.ts/companyProfiles.ts의 어떤 id와도 겹치지
 * 않는 값을 써서, 그 컴포넌트들이 내부적으로 하는 id 기반 조회(companies.find 등)가 실데이터를 잘못 끌어오지
 * 않게 한다 — 값을 못 찾으면 각 컴포넌트가 이미 가진 "데이터 없음" 폴백(예: CompanyHero의 tags 폴백)으로 자연히 빠진다.
 */

const PREVIEW_VERIFIED_LABEL = "운영팀 확인 기업";
const PREVIEW_PREMIUM_LABEL = "프리미엄 기업";

function companyTypeLabel(type: CompanyProfileMaster["companyType"]) {
  return companyTypeOptions.find((option) => option.id === type)?.label ?? "기타";
}

function employeeCountLabel(range: CompanyProfileMaster["employeeCount"]) {
  return employeeCountOptions.find((option) => option.id === range)?.label ?? "-";
}

function toProfileFeatures(features: OrgFeatureItem[]): CompanyProfileFeature[] {
  return features.filter((item) => item.label.trim() && item.text.trim()).map((item) => ({ label: item.label, text: item.text }));
}

/** 산업 트랙: companyProfiles.ts에 대응하는 실데이터가 없어(더파마뉴스 mock) 항상 이 변환을 거친다. */
export function buildIndustryPreviewProfile(master: CompanyProfileMaster): CompanyProfile {
  const typeLabel = companyTypeLabel(master.companyType);

  return {
    id: master.id,
    name: master.displayName,
    logoText: master.displayName,
    logoImage: master.logoUrl && master.logoUrl !== "mock-logo" ? master.logoUrl : undefined,
    verifiedLabel: PREVIEW_VERIFIED_LABEL,
    premiumLabel: PREVIEW_PREMIUM_LABEL,
    tagline: master.shortIntro,
    tags: [typeLabel, master.foundedYear ? `설립 ${master.foundedYear}년` : null, employeeCountLabel(master.employeeCount)].filter(
      (value): value is string => Boolean(value),
    ),
    coverImage: companyExampleImages.hero,
    metrics: [
      { label: "기업 형태", value: typeLabel },
      { label: "사원수", value: employeeCountLabel(master.employeeCount) },
      { label: "설립", value: master.foundedYear ? `${master.foundedYear}년` : "-" },
      { label: "주요 사업분야", value: master.mainBusinessAreas.slice(0, 2).join(" · ") || "-" },
    ],
    businessSummary: master.mainJobCategories.length ? [{ label: "주요 직무", value: master.mainJobCategories.join(" · ") }] : [],
    recruitSummary: master.fullIntro,
    details: [
      { label: "대표자", value: master.representativeName || null },
      { label: "설립일", value: master.foundedYear ? `${master.foundedYear}년` : null },
      { label: "본사 위치", value: master.address || null },
      { label: "홈페이지", value: master.homepageUrl || null },
      { label: "기업 형태", value: typeLabel },
      { label: "업종", value: master.industry || null },
    ],
    keywords: master.keywords,
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: master.address,
    },
  };
}

/** 병원 트랙: initialHospitalOrgProfile은 실제 companyProfiles.ts의 snubh 항목과 값이 겹치도록 만들어졌지만,
 * "기관정보 관리가 편집하는 그 프로필 객체를 그대로 사용"하라는 요구 때문에 snubh를 조회하지 않고 항상 여기서 변환한다. */
export function buildHospitalPreview(org: HospitalOrgProfile): { profile: CompanyProfile; company: Company } {
  const id = "business-preview-hospital";
  const typeLabel = getHospitalCombinedTypeLabel(org.hospitalType, org.hospitalOperator, org.specialtyLabel);
  const region = regionFromAddress(org.address);

  const company: Company = {
    id,
    name: org.institutionName,
    logoText: org.institutionName,
    logoUrl: org.logoUrl ?? undefined,
    logoColor: "#111111",
    verified: true,
    description: org.shortIntro,
    industry: typeLabel,
    employeeCount: "-",
    foundedYear: org.foundedYear,
    website: org.homepageUrl,
    address: org.address,
    hospitalType: org.hospitalType,
    hospitalOperator: org.hospitalOperator,
    specialtyLabel: org.specialtyLabel || undefined,
  };

  const profile: CompanyProfile = {
    id,
    name: org.institutionName,
    logoText: org.institutionName,
    logoImage: org.logoUrl ?? undefined,
    verifiedLabel: PREVIEW_VERIFIED_LABEL,
    premiumLabel: PREVIEW_PREMIUM_LABEL,
    tagline: org.shortIntro,
    tags: [typeLabel, region, org.bedCount ? `병상 ${org.bedCount}` : null].filter((value): value is string => Boolean(value)),
    coverImage: companyExampleImages.hero,
    metrics: [
      { label: "병상 수", value: org.bedCount ? `${org.bedCount}병상` : "-" },
      { label: "연간 임상시험", value: org.annualClinicalTrials || "-" },
      { label: "약제부 인력", value: org.pharmacyStaffCount || "-" },
      { label: "주요 분야", value: typeLabel },
    ],
    businessSummary: [],
    recruitSummary: org.shortIntro,
    details: [
      { label: "대표자", value: org.representativeName ? `병원장 ${org.representativeName}` : null },
      { label: "설립일", value: org.foundedYear || null },
      { label: "본사 위치", value: org.address || null },
      { label: "홈페이지", value: org.homepageUrl || null },
    ],
    keywords: org.keywords,
    news: [],
    features: toProfileFeatures(org.features),
    dutySystem: org.dutySystem || undefined,
    departments: org.departments || undefined,
    specialistPharmacists: org.specialistPharmacists.length ? org.specialistPharmacists : undefined,
    pharmacyDutyAreas: org.pharmacyDutyAreas.length ? org.pharmacyDutyAreas : undefined,
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: org.address,
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
    logoText: org.pharmacyName,
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
    logoText: org.pharmacyName,
    logoImage: org.logoUrl ?? undefined,
    verifiedLabel: PREVIEW_VERIFIED_LABEL,
    premiumLabel: PREVIEW_PREMIUM_LABEL,
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
    pharmacyFeatures: org.pharmacyFeatureIds.length ? org.pharmacyFeatureIds : undefined,
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: org.address,
    },
  };

  return { profile, company };
}
