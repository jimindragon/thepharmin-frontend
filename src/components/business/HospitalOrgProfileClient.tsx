"use client";

import { Check, ExternalLink, Info, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { ExposurePreview, FieldLabel, SectionCard, Segmented, TextInput, ToggleChip } from "@/components/business/BusinessFormControls";
import { getHospitalCombinedTypeLabel, getHospitalOperatorLabel, getHospitalTypeLabel, hospitalOperatorLabels, hospitalTypeLabels } from "@/config/companyTypes";
import { businessCompanyManager, type FileStatus } from "@/data/businessCompanyProfile";
import { hospitalKeywordOptions, initialHospitalOrgProfile, specialistPharmacistOptions, type HospitalOrgProfile, type OrgFeatureItem } from "@/data/businessOrgProfile";
import type { HospitalOperator, HospitalType } from "@/types/jobs";

const MAX_KEYWORDS = 6;

function statusLabel(status: FileStatus) {
  if (status === "approved") return "제출 완료 · 검토 승인";
  if (status === "pending") return "검토 중";
  if (status === "rejected") return "반려";
  return "변경 요청 필요";
}

function newFeatureId() {
  return `feature-${Math.random().toString(36).slice(2, 9)}`;
}

export function HospitalOrgProfileClient() {
  const [profile, setProfile] = useState<HospitalOrgProfile>(initialHospitalOrgProfile);
  const [saved, setSaved] = useState(false);

  const updateProfile = <K extends keyof HospitalOrgProfile>(key: K, value: HospitalOrgProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const toggleKeyword = (item: string) => {
    setProfile((current) => {
      if (current.keywords.includes(item)) return { ...current, keywords: current.keywords.filter((x) => x !== item) };
      if (current.keywords.length >= MAX_KEYWORDS) return current;
      return { ...current, keywords: [...current.keywords, item] };
    });
  };

  const toggleSpecialistPharmacist = (item: string) => {
    setProfile((current) => ({
      ...current,
      specialistPharmacists: current.specialistPharmacists.includes(item)
        ? current.specialistPharmacists.filter((x) => x !== item)
        : [...current.specialistPharmacists, item],
    }));
  };

  const updateFeatureItem = (id: string, key: "label" | "text", value: string) => {
    setProfile((current) => ({
      ...current,
      features: current.features.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  };

  const addFeatureItem = () => {
    setProfile((current) => ({ ...current, features: [...current.features, { id: newFeatureId(), label: "", text: "" } as OrgFeatureItem] }));
  };

  const removeFeatureItem = (id: string) => {
    setProfile((current) => ({ ...current, features: current.features.filter((item) => item.id !== id) }));
  };

  const saveProfile = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const isSpecialty = profile.hospitalType === "specialty";
  const basicComplete = Boolean(
    profile.address && profile.foundedYear && profile.phone && profile.email && (!isSpecialty || profile.specialtyLabel),
  );
  const profileComplete = Boolean(profile.shortIntro && profile.features.length > 0);
  const accountVerificationItems = [
    { label: "이메일 인증", detail: businessCompanyManager.email, done: true },
    { label: "담당자 인증", detail: `${businessCompanyManager.managerName} · ${businessCompanyManager.phone}`, done: true },
    { label: "사업자 인증", detail: "기관 인증 완료", done: true },
  ];

  return (
    <div>
      {saved ? (
        <div className="fixed right-6 top-[84px] z-[80] border border-[#cfd8e3] bg-white px-5 py-3 text-[13px] font-medium text-[#303946] shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
          병원 정보가 저장되었습니다.
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-5 max-[760px]:flex-col">
        <div>
          <PageBreadcrumb items={[{ label: "기업센터", href: "/business/dashboard" }, { label: "기업관리" }, { label: "병원 정보 관리" }]} />
          <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">병원 정보 관리</h1>
          <p className="mt-2 text-[13px] font-normal text-[#68717e]">채용공고와 병원 상세 페이지에 표시되는 기관 정보를 관리합니다.</p>
        </div>
        <div className="flex shrink-0 gap-2 max-[760px]:w-full">
          <Link href="/business/company/preview" className="inline-flex h-11 items-center justify-center gap-2 border border-[#cfd8e3] bg-white px-4 text-[13px] font-medium text-[#303946] hover:border-[#111111] max-[760px]:flex-1">
            브랜드 페이지 미리보기
            <ExternalLink size={15} />
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        <SectionCard id="verification" title="인증 정보" description="인증 정보는 승인 상태와 인증 배지에 사용됩니다. 변경은 운영팀 검토 후 반영됩니다." status="완료">
          <span className="inline-flex h-7 items-center border border-[#cfd8e3] bg-[#f7f8fa] px-2.5 text-[12px] font-medium text-[#303946]">기관 인증 완료</span>
          <div className="mt-5 grid grid-cols-4 border border-[#dfe4ea] max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            {[
              ["사업자등록번호", profile.businessNumber],
              ["기관명", profile.institutionName],
              ["사업자 대표자명", profile.representativeName],
              ["승인일", profile.approvedAt],
            ].map(([label, value]) => (
              <div key={label} className="border-r border-[#dfe4ea] px-4 py-4 last:border-r-0 max-[900px]:border-b">
                <p className="text-[11px] font-medium text-[#8a94a3]">{label}</p>
                <p className="mt-2 text-[13px] font-medium text-[#17202c]">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_2fr] border border-t-0 border-[#dfe4ea] max-[900px]:grid-cols-1">
            <div className="border-r border-[#dfe4ea] px-4 py-4 max-[900px]:border-b max-[900px]:border-r-0">
              <p className="text-[11px] font-medium text-[#8a94a3]">요양기관번호</p>
              <p className="mt-2 text-[13px] font-medium text-[#17202c]">{profile.institutionCode}</p>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <div>
                <p className="text-[11px] font-medium text-[#8a94a3]">사업자등록증명원</p>
                <p className="mt-2 text-[13px] font-medium text-[#17202c]">{statusLabel(profile.businessLicenseFile.status)}</p>
              </div>
              <button type="button" className="h-9 shrink-0 border border-[#d8e0e8] bg-white px-3 text-[12px] font-medium text-[#303946] hover:border-[#111111]">
                서류 변경 요청
              </button>
            </div>
          </div>
          <div className="mt-4 flex gap-2 border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3 text-[12px] font-normal leading-[1.6] text-[#6f7783]">
            <Info size={15} className="mt-0.5 shrink-0 text-[#7b8491]" />
            인증 정보 또는 제출 서류 변경이 필요한 경우 변경 요청을 보내주세요. 운영팀 검토 후 반영됩니다.
          </div>
        </SectionCard>

        <SectionCard
          id="hospital-info"
          title="병원 정보"
          description="기관의 기본 사항입니다. 병원 유형은 리스트·상세 표기와 공고 등록의 사업장 분류 기본값에 반영됩니다."
          status={basicComplete ? "완료" : "작성 중"}
        >
          <div>
            <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#303946]">병원 유형</h3>
            <div className="mt-4 space-y-2">
              <FieldLabel required>유형</FieldLabel>
              <Segmented
                value={profile.hospitalType}
                options={(Object.keys(hospitalTypeLabels) as HospitalType[]).map((id) => ({ id, label: getHospitalTypeLabel(id) }))}
                onChange={(value) => updateProfile("hospitalType", value)}
              />
            </div>
            <div className="mt-5 space-y-2">
              <FieldLabel>운영 구분</FieldLabel>
              <Segmented
                value={profile.hospitalOperator}
                options={(Object.keys(hospitalOperatorLabels) as HospitalOperator[]).map((id) => ({ id, label: getHospitalOperatorLabel(id) }))}
                onChange={(value) => updateProfile("hospitalOperator", value)}
              />
            </div>
            {isSpecialty ? (
              <div className="mt-5 max-w-[320px] space-y-2 border-l-2 border-[#111111] pl-4">
                <FieldLabel required>전문 분야</FieldLabel>
                <TextInput value={profile.specialtyLabel} onChange={(value) => updateProfile("specialtyLabel", value)} placeholder="예: 정형외과" />
                <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">보건복지부 지정 전문병원인 경우에만 선택해 주세요.</p>
              </div>
            ) : null}
          </div>

          <div className="mt-6 border-t border-[#f0f2f5] pt-6">
            <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#303946]">기본 사항·연락처</h3>
            <div className="mt-4 space-y-5">
              <div className="space-y-2">
                <FieldLabel required>대표 주소</FieldLabel>
                <TextInput value={profile.address} onChange={(value) => updateProfile("address", value)} />
              </div>
              <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                <div className="space-y-2">
                  <FieldLabel required>설립 연도</FieldLabel>
                  <TextInput value={profile.foundedYear} onChange={(value) => updateProfile("foundedYear", value)} />
                </div>
                <div className="space-y-2">
                  <FieldLabel>병상 수</FieldLabel>
                  <TextInput value={profile.bedCount} onChange={(value) => updateProfile("bedCount", value)} placeholder="예: 1,335" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                <div className="space-y-2">
                  <FieldLabel>진료과</FieldLabel>
                  <TextInput value={profile.departments} onChange={(value) => updateProfile("departments", value)} placeholder="예: 40개+ · 주요 센터 12" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>홈페이지</FieldLabel>
                  <TextInput value={profile.homepageUrl} onChange={(value) => updateProfile("homepageUrl", value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                <div className="space-y-2">
                  <FieldLabel required>대표 전화번호</FieldLabel>
                  <TextInput value={profile.phone} onChange={(value) => updateProfile("phone", value)} />
                </div>
                <div className="space-y-2">
                  <FieldLabel required>이메일</FieldLabel>
                  <TextInput value={profile.email} onChange={(value) => updateProfile("email", value)} />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard id="profile" title="공개 프로필" description="구직자에게 직접 노출되는 소개 정보입니다." status={profileComplete ? "완료" : "작성 중"}>
          <div className="grid grid-cols-[230px_minmax(0,1fr)] gap-6 max-[820px]:grid-cols-1">
            <div>
              <FieldLabel>기관 로고</FieldLabel>
              <div className="mt-2 grid h-[128px] w-full max-w-[230px] place-items-center border border-[#dfe4ea] bg-[#fbfcfd] p-4">
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt={`${profile.institutionName} 로고`} className="h-full w-full object-contain" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[13px] font-bold text-[#4f5968]">{profile.institutionName.slice(0, 2)}</div>
                )}
              </div>
              <p className="mt-2 text-[11px] font-normal text-[#8a94a3]">권장 사이즈: 240x60px / JPG, PNG (2MB 이하)</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" className="h-9 border border-[#d8e0e8] bg-white text-[12px] font-medium text-[#303946] hover:border-[#111111]">변경</button>
                <button type="button" onClick={() => updateProfile("logoUrl", null)} className="h-9 border border-[#d8e0e8] bg-white text-[12px] font-medium text-[#303946] hover:border-[#111111]">삭제</button>
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel required>한 줄 소개</FieldLabel>
              <TextInput value={profile.shortIntro} onChange={(value) => updateProfile("shortIntro", value)} placeholder="예: 진료와 임상연구를 함께 운영하는 상급종합병원" />
              <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">구직자가 확인할 수 있는 사실 중심으로 작성해 주세요.</p>
            </div>
          </div>

          <div className="mt-6">
            <FieldLabel>기관 특징</FieldLabel>
            <div className="mt-3 space-y-2.5">
              {profile.features.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[170px_minmax(0,1fr)_44px] gap-2.5 max-[640px]:grid-cols-1">
                  <input
                    value={item.label}
                    onChange={(event) => updateFeatureItem(item.id, "label", event.target.value)}
                    placeholder="제목 (예: 신입 교육)"
                    aria-label={`기관 특징 ${index + 1} 제목`}
                    className="h-11 min-w-0 border border-[#d8e0e8] bg-white px-3 text-[13px] font-medium outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
                  />
                  <input
                    value={item.text}
                    onChange={(event) => updateFeatureItem(item.id, "text", event.target.value)}
                    placeholder="내용"
                    aria-label={`기관 특징 ${index + 1} 내용`}
                    className="h-11 min-w-0 border border-[#d8e0e8] bg-white px-3 text-[13px] font-normal outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeatureItem(item.id)}
                    aria-label={`기관 특징 ${index + 1} 삭제`}
                    className="grid h-11 w-11 place-items-center border border-[#dfe4ea] bg-white text-[#a0a9b7] hover:border-danger/30 hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addFeatureItem} className="mt-3 inline-flex h-9 items-center gap-1.5 border border-dashed border-[#d8e0e8] bg-white px-3 text-[12.5px] font-medium text-[#4f5967] hover:border-[#111111] hover:text-[#111111]">
              <Plus size={14} /> 항목 추가
            </button>
          </div>

          <div className="mt-6 space-y-2">
            <FieldLabel>
              핵심 키워드 <span className="font-normal text-[#9aa3af]">(최대 {MAX_KEYWORDS}개)</span>
            </FieldLabel>
            <div className="flex flex-wrap gap-2">
              {hospitalKeywordOptions.map((item) => (
                <ToggleChip key={item} label={item} selected={profile.keywords.includes(item)} onClick={() => toggleKeyword(item)} />
              ))}
            </div>
            <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">상세 페이지 사이드바와 검색에 활용됩니다.</p>
          </div>

          <ExposurePreview
            name={profile.institutionName}
            shortIntro={profile.shortIntro}
            metaLine={`${getHospitalCombinedTypeLabel(profile.hospitalType, profile.hospitalOperator, profile.specialtyLabel)} · ${profile.foundedYear}년 설립`}
            logo={
              profile.logoUrl ? (
                <img src={profile.logoUrl} alt="" className="h-full w-full object-contain p-1" />
              ) : (
                <span className="text-[13px] font-bold text-[#4f5968]">{profile.institutionName.slice(0, 2)}</span>
              )
            }
          />
        </SectionCard>

        <SectionCard id="pharmacy-environment" title="약제부 근무 환경" description="병원 상세 요약 표에 노출되고, 공고 등록 시 관련 항목의 기본값으로 채워집니다." status="선택 사항">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div className="space-y-2">
                <FieldLabel>약제부 인력</FieldLabel>
                <TextInput value={profile.pharmacyStaffCount} onChange={(value) => updateProfile("pharmacyStaffCount", value)} placeholder="예: 110명+" />
              </div>
              <div className="space-y-2">
                <FieldLabel>당직 체계</FieldLabel>
                <TextInput value={profile.dutySystem} onChange={(value) => updateProfile("dutySystem", value)} placeholder="예: 야간 당직 월 2~3회" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div className="space-y-2">
                <FieldLabel>연간 임상시험</FieldLabel>
                <TextInput value={profile.annualClinicalTrials} onChange={(value) => updateProfile("annualClinicalTrials", value)} placeholder="예: 600건+" />
              </div>
              <div className="space-y-2">
                <FieldLabel>임상시험센터</FieldLabel>
                <Segmented
                  value={profile.clinicalTrialCenterOperating ? "operating" : "not-operating"}
                  options={[
                    { id: "operating", label: "운영" },
                    { id: "not-operating", label: "미운영" },
                  ]}
                  onChange={(value) => updateProfile("clinicalTrialCenterOperating", value === "operating")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>
                전문약사 보유 <span className="font-normal text-[#9aa3af]">(복수 선택)</span>
              </FieldLabel>
              <div className="flex flex-wrap gap-2">
                {specialistPharmacistOptions.map((item) => (
                  <ToggleChip key={item} label={item} selected={profile.specialistPharmacists.includes(item)} onClick={() => toggleSpecialistPharmacist(item)} />
                ))}
              </div>
              <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">미선택 시 상세 페이지 블록이 노출되지 않습니다.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard id="manager" title="담당자 정보" description="채용 관련 문의와 서비스 안내를 받을 담당자 정보입니다." status="완료">
          <div className="grid grid-cols-2 gap-5 max-[820px]:grid-cols-1">
            {[
              ["담당자명", businessCompanyManager.managerName],
              ["부서", businessCompanyManager.department],
              ["직책", businessCompanyManager.position],
              ["이메일", businessCompanyManager.email],
              ["연락처", businessCompanyManager.phone],
              ["계정 ID", businessCompanyManager.accountId],
            ].map(([label, value]) => (
              <div key={label} className="space-y-2">
                <FieldLabel>{label}</FieldLabel>
                <TextInput value={value} disabled={label === "계정 ID"} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard id="account" title="계정 정보" description="계정 인증 상태와 공개 설정을 관리합니다." status="작성 중">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 max-[900px]:grid-cols-1">
            <div>
              <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#303946]">계정 인증 상태</h3>
              <div className="mt-3 space-y-2">
                {accountVerificationItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-3 border border-[#dfe4ea] bg-white px-4 py-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border border-[#111111] bg-[#111111] text-[11px] text-white">
                      <Check size={13} />
                    </span>
                    <span>
                      <span className="block text-[13px] font-medium text-[#303946]">{item.label}</span>
                      <span className="mt-1 block text-[12px] font-normal text-[#7b8491]">{item.detail}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#303946]">공개 설정</h3>
              <div className="mt-3 space-y-2">
                {[
                  ["병원 페이지를 공개합니다.", profile.visibilitySettings.publicCompanyPage],
                  ["공고에 병원 정보를 함께 노출합니다.", profile.visibilitySettings.exposeOnJobs],
                  ["검색 결과에 병원 프로필을 노출합니다.", profile.visibilitySettings.exposeOnSearch],
                ].map(([label, checked]) => (
                  <label key={String(label)} className="flex min-h-[48px] items-center gap-3 border border-[#dfe4ea] bg-white px-4">
                    <input type="checkbox" defaultChecked={Boolean(checked)} className="h-4 w-4 accent-[#111111]" />
                    <span className="text-[13px] font-medium text-[#303946]">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="sticky bottom-0 z-30 min-h-[64px] border-t border-[#dfe4ea] bg-white/95 px-6 py-4 shadow-[0_-4px_16px_rgba(20,32,46,0.08)] backdrop-blur max-[760px]:px-4">
          <div className="flex items-center justify-between gap-4 max-[640px]:flex-col">
            <p className="text-[12px] font-normal text-[#7b8491]">저장되지 않은 변경사항이 있습니다</p>
            <div className="flex gap-2 max-[640px]:w-full">
              <Link href="/business/company/preview" className="inline-flex h-11 items-center justify-center border border-[#cfd8e3] bg-white px-7 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] max-[640px]:flex-1">
                미리보기
              </Link>
              <button type="button" className="inline-flex h-11 items-center justify-center border border-[#111111] bg-white px-7 text-[13px] font-medium text-[#111111] hover:bg-[#f7f8fa] max-[640px]:flex-1">
                임시 저장
              </button>
              <button type="button" onClick={saveProfile} className="inline-flex h-11 items-center justify-center px-9 text-[13px] font-bold text-white transition max-[640px]:flex-1" style={{ backgroundImage: "var(--gradient-cta)", textShadow: "0 1px 3px rgba(5,60,55,0.28)" }}>
                저장하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
