"use client";

import { Check, ExternalLink, Info, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { FieldLabel, SectionCard, Segmented, TextInput, ToggleChip } from "@/components/business/BusinessFormControls";
import { getPharmacyTypeLabel, pharmacyTypeLabels } from "@/config/companyTypes";
import { readSignupPharmacyFeatureId, readSignupPharmacyType } from "@/config/businessSignup";
import { pharmacyFeatureOptions } from "@/config/jobFilters/pharmacyFilters";
import { businessCompanyManager, type FileStatus } from "@/data/businessCompanyProfile";
import {
  dispensingEquipmentOptions,
  initialPharmacyOrgProfile,
  pharmacySoftwareOptions,
  type OrgFeatureItem,
  type PharmacyOrgProfile,
} from "@/data/businessOrgProfile";
import type { PharmacyType } from "@/types/jobs";

function statusLabel(status: FileStatus) {
  if (status === "approved") return "제출 완료 · 검토 승인";
  if (status === "pending") return "검토 중";
  if (status === "rejected") return "반려";
  return "변경 요청 필요";
}

function newFeatureId() {
  return `feature-${Math.random().toString(36).slice(2, 9)}`;
}

export function PharmacyOrgProfileClient() {
  const [profile, setProfile] = useState<PharmacyOrgProfile>(initialPharmacyOrgProfile);
  const [saved, setSaved] = useState(false);

  const updateProfile = <K extends keyof PharmacyOrgProfile>(key: K, value: PharmacyOrgProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const handleTypeChange = (nextType: PharmacyType) => {
    updateProfile("pharmacyType", nextType);
  };

  useEffect(() => {
    const fromSignup = readSignupPharmacyType();
    if (fromSignup) handleTypeChange(fromSignup);
    const featureFromSignup = readSignupPharmacyFeatureId();
    if (featureFromSignup) updateProfile("pharmacyFeatureIds", featureFromSignup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectFeatureId = (id: string) => {
    setProfile((current) => ({
      ...current,
      pharmacyFeatureIds: current.pharmacyFeatureIds === id ? undefined : id,
    }));
  };

  const toggleDispensingEquipment = (item: string) => {
    setProfile((current) => ({
      ...current,
      dispensingEquipment: current.dispensingEquipment.includes(item)
        ? current.dispensingEquipment.filter((x) => x !== item)
        : [...current.dispensingEquipment, item],
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

  const basicComplete = Boolean(profile.address && profile.foundedYear && profile.phone && profile.email);
  const profileComplete = Boolean(profile.shortIntro && profile.features.length > 0);
  const accountVerificationItems = [
    { label: "이메일 인증", detail: businessCompanyManager.email, done: true },
    { label: "담당자 인증", detail: `${businessCompanyManager.managerName} · ${businessCompanyManager.phone}`, done: true },
    { label: "사업자 인증", detail: "약국 인증 완료", done: true },
  ];

  return (
    <div>
      {saved ? (
        <div className="fixed right-6 top-[84px] z-[80] border border-[#cfd8e3] bg-white px-5 py-3 text-[13px] font-medium text-[#303946] shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
          약국 정보가 저장되었습니다.
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-5 max-[760px]:flex-col">
        <div>
          <PageBreadcrumb items={[{ label: "기업센터", href: "/business/dashboard" }, { label: "기업관리" }, { label: "약국 정보 관리" }]} />
          <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">약국 정보 관리</h1>
          <p className="mt-2 text-[13px] font-normal text-[#68717e]">채용공고와 약국 상세 페이지에 표시되는 약국 정보를 관리합니다.</p>
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
          <span className="inline-flex h-7 items-center border border-[#cfd8e3] bg-[#f7f8fa] px-2.5 text-[12px] font-medium text-[#303946]">약국 인증 완료</span>
          <div className="mt-5 grid grid-cols-4 border border-[#dfe4ea] max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            {[
              ["사업자등록번호", profile.businessNumber],
              ["약국명", profile.pharmacyName],
              ["사업자 대표자명", profile.representativeName],
              ["승인일", profile.approvedAt],
            ].map(([label, value]) => (
              <div key={label} className="border-r border-[#dfe4ea] px-4 py-4 last:border-r-0 max-[900px]:border-b">
                <p className="text-[11px] font-medium text-[#8a94a3]">{label}</p>
                <p className="mt-2 text-[13px] font-medium text-[#17202c]">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 border border-t-0 border-[#dfe4ea] max-[900px]:grid-cols-1">
            {[
              ["약사면허번호", profile.pharmacistLicenseNumber],
              ["요양기관번호", profile.institutionCode],
            ].map(([label, value]) => (
              <div key={label} className="border-r border-[#dfe4ea] px-4 py-4 last:border-r-0 max-[900px]:border-b">
                <p className="text-[11px] font-medium text-[#8a94a3]">{label}</p>
                <p className="mt-2 text-[13px] font-medium text-[#17202c]">{value}</p>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <div>
                <p className="text-[11px] font-medium text-[#8a94a3]">약사면허증</p>
                <p className="mt-2 text-[13px] font-medium text-[#17202c]">{statusLabel(profile.pharmacistLicenseFile.status)}</p>
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
          id="pharmacy-info"
          title="약국 정보"
          description="약국의 기본 사항입니다. 유형과 특성은 리스트·상세 표기와 구직자의 공고 검색 필터에 연결됩니다."
          status={basicComplete ? "완료" : "작성 중"}
        >
          <div>
            <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#303946]">약국 유형·특성</h3>
            <div className="mt-4 space-y-2">
              <FieldLabel required>약국 유형</FieldLabel>
              <Segmented
                value={profile.pharmacyType}
                options={(Object.keys(pharmacyTypeLabels) as PharmacyType[]).map((id) => ({ id, label: getPharmacyTypeLabel(id) }))}
                onChange={handleTypeChange}
              />
            </div>
            <div className="mt-5 space-y-2">
              <FieldLabel>
                약국 특성 <span className="font-normal text-[#9aa3af]">(선택, 미선택 가능)</span>
              </FieldLabel>
              <div className="flex flex-wrap gap-2">
                {pharmacyFeatureOptions.map((option) => (
                  <ToggleChip
                    key={option.id}
                    label={option.label}
                    selected={profile.pharmacyFeatureIds === option.id}
                    onClick={() => selectFeatureId(option.id)}
                  />
                ))}
              </div>
            </div>
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
                  <FieldLabel required>개국 연도</FieldLabel>
                  <TextInput value={profile.foundedYear} onChange={(value) => updateProfile("foundedYear", value)} />
                </div>
                <div className="space-y-2">
                  <FieldLabel>대표 약사명</FieldLabel>
                  <TextInput value={profile.headPharmacistName} onChange={(value) => updateProfile("headPharmacistName", value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                <div className="space-y-2">
                  <FieldLabel required>약국 전화번호</FieldLabel>
                  <TextInput value={profile.phone} onChange={(value) => updateProfile("phone", value)} />
                </div>
                <div className="space-y-2">
                  <FieldLabel required>이메일</FieldLabel>
                  <TextInput value={profile.email} onChange={(value) => updateProfile("email", value)} />
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel>영업시간</FieldLabel>
                <TextInput value={profile.businessHours} onChange={(value) => updateProfile("businessHours", value)} placeholder="예: 평일 09:00~19:00 · 토요일 격주" />
                <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">약국 운영시간 기준입니다. 채용 근무시간은 공고 등록 시 별도로 입력합니다.</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard id="profile" title="공개 프로필" description="구직자에게 직접 노출되는 소개 정보입니다." status={profileComplete ? "완료" : "작성 중"}>
          <div className="grid grid-cols-[230px_minmax(0,1fr)] gap-6 max-[820px]:grid-cols-1">
            <div>
              <FieldLabel>약국 로고</FieldLabel>
              <div className="mt-2 grid h-[128px] w-full max-w-[230px] place-items-center border border-[#dfe4ea] bg-[#fbfcfd] p-4">
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt={`${profile.pharmacyName} 로고`} className="h-full w-full object-contain" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[13px] font-bold text-[#4f5968]">{profile.pharmacyName.slice(0, 2)}</div>
                )}
              </div>
              <p className="mt-2 text-[11px] font-normal text-[#8a94a3]">권장 사이즈: 240x60px / JPG, PNG (2MB 이하) · 미등록 시 약국명 두 글자로 표시</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" className="h-9 border border-[#d8e0e8] bg-white text-[12px] font-medium text-[#303946] hover:border-[#111111]">변경</button>
                <button type="button" onClick={() => updateProfile("logoUrl", null)} className="h-9 border border-[#d8e0e8] bg-white text-[12px] font-medium text-[#303946] hover:border-[#111111]">삭제</button>
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel required>한 줄 소개</FieldLabel>
              <TextInput value={profile.shortIntro} onChange={(value) => updateProfile("shortIntro", value)} placeholder="예: 내과·이비인후과 의원 처방을 주로 조제하는 의원층 약국" />
              <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">구직자가 확인할 수 있는 사실 중심으로 작성해 주세요.</p>
            </div>
          </div>

          <div className="mt-6">
            <FieldLabel>약국 특징</FieldLabel>
            <div className="mt-3 space-y-2.5">
              {profile.features.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[170px_minmax(0,1fr)_44px] gap-2.5 max-[640px]:grid-cols-1">
                  <input
                    value={item.label}
                    onChange={(event) => updateFeatureItem(item.id, "label", event.target.value)}
                    placeholder="제목 (예: 근무 형태)"
                    aria-label={`약국 특징 ${index + 1} 제목`}
                    className="h-11 min-w-0 border border-[#d8e0e8] bg-white px-3 text-[13px] font-medium outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
                  />
                  <input
                    value={item.text}
                    onChange={(event) => updateFeatureItem(item.id, "text", event.target.value)}
                    placeholder="내용"
                    aria-label={`약국 특징 ${index + 1} 내용`}
                    className="h-11 min-w-0 border border-[#d8e0e8] bg-white px-3 text-[13px] font-normal outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeatureItem(item.id)}
                    aria-label={`약국 특징 ${index + 1} 삭제`}
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
            <p className="mt-2 text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">[제목 + 내용] 자유 구성 (예: 근무 형태 / 교육 루틴 / 주차·교통). 상세 페이지 &apos;약국 특징&apos;에 그대로 노출됩니다.</p>
          </div>
        </SectionCard>

        <SectionCard id="work-environment" title="근무·조제 환경" description="약국 상세 요약 표에 노출되고, 공고 등록 시 &apos;약국 근무 환경&apos; 섹션에 기본값으로 채워집니다." status="선택 사항">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div className="space-y-2">
                <FieldLabel>근무자 구성</FieldLabel>
                <div className="flex items-center gap-2">
                  <input
                    value={profile.staffPharmacistCount}
                    onChange={(event) => updateProfile("staffPharmacistCount", event.target.value)}
                    aria-label="약사 인원"
                    className="h-11 w-20 border border-[#d8e0e8] bg-white px-3 text-[13px] font-medium outline-none focus:border-[#111111]"
                  />
                  <span className="text-[13px] font-medium text-[#68717e]">약사(명)</span>
                  <input
                    value={profile.staffSupportCount}
                    onChange={(event) => updateProfile("staffSupportCount", event.target.value)}
                    aria-label="약무지원 인원"
                    className="h-11 w-20 border border-[#d8e0e8] bg-white px-3 text-[13px] font-medium outline-none focus:border-[#111111]"
                  />
                  <span className="text-[13px] font-medium text-[#68717e]">약무지원(명)</span>
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel>일평균 처방</FieldLabel>
                <div className="flex items-center gap-2">
                  <input
                    value={profile.avgDailyPrescriptions}
                    onChange={(event) => updateProfile("avgDailyPrescriptions", event.target.value)}
                    aria-label="일평균 처방 건수"
                    className="h-11 w-24 border border-[#d8e0e8] bg-white px-3 text-[13px] font-medium outline-none focus:border-[#111111]"
                  />
                  <span className="text-[13px] font-medium text-[#68717e]">건 내외</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>주처방 진료과</FieldLabel>
              <TextInput value={profile.mainDepartments} onChange={(value) => updateProfile("mainDepartments", value)} placeholder="예: 내과 · 이비인후과 · 정형외과" />
            </div>
            <div className="space-y-2">
              <FieldLabel>전산 소프트웨어</FieldLabel>
              <Segmented value={profile.software} options={pharmacySoftwareOptions.map((label) => ({ id: label, label }))} onChange={(value) => updateProfile("software", value)} />
            </div>
            <div className="space-y-2">
              <FieldLabel>조제 환경·장비</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {dispensingEquipmentOptions.map((item) => (
                  <ToggleChip key={item} label={item} selected={profile.dispensingEquipment.includes(item)} onClick={() => toggleDispensingEquipment(item)} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>주차·교통</FieldLabel>
              <TextInput value={profile.parkingTransit} onChange={(value) => updateProfile("parkingTransit", value)} placeholder="예: 건물 주차 2시간 무료 · 양지IC 5분" />
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

        <SectionCard id="account" title="계정 정보" description="계정 인증 상태를 관리합니다." status="작성 중">
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
