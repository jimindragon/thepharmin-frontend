"use client";

import clsx from "clsx";
import {
  Check,
  ExternalLink,
  Info,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { FieldLabel, SectionCard, Segmented, TextInput, ToggleChip } from "@/components/business/BusinessFormControls";
import {
  businessAreaOptions,
  businessCompanyManager,
  businessCompanyVerification,
  companyTypeOptions,
  employeeCountOptions,
  initialBusinessCompanyProfile,
  jobCategoryOptions,
  keywordOptions,
  type CompanyProfileMaster,
  type CompanyType,
  type EmployeeCountRange,
  type FileStatus,
} from "@/data/businessCompanyProfile";

function statusLabel(status: FileStatus) {
  if (status === "approved") return "제출 완료 · 검토 승인";
  if (status === "pending") return "검토 중";
  if (status === "rejected") return "반려";
  return "변경 요청 필요";
}

function LogoMark({ profile }: { profile: CompanyProfileMaster }) {
  if (profile.logoUrl && profile.logoUrl !== "mock-logo") {
    return <img src={profile.logoUrl} alt={`${profile.displayName} 로고`} className="h-full w-full object-contain p-[12%]" />;
  }

  return (
    <div className="grid h-full w-full place-items-center bg-[#f7f8fa] text-[13px] font-bold text-[#4f5968]">
      {profile.displayName.slice(0, 2)}
    </div>
  );
}

export function BusinessCompanyProfileClient() {
  const [profile, setProfile] = useState<CompanyProfileMaster>(initialBusinessCompanyProfile);
  const [newProduct, setNewProduct] = useState("");
  const [saved, setSaved] = useState(false);

  const completionItems = [
    { label: "기업 정보", done: true },
    { label: "공개 프로필", done: Boolean(profile.shortIntro && profile.fullIntro && profile.logoUrl) },
    { label: "사업·채용 정보", done: profile.mainBusinessAreas.length > 0 && profile.mainJobCategories.length > 0 },
    { label: "담당자 정보", done: Boolean(businessCompanyManager.email && businessCompanyManager.phone) },
    { label: "계정 정보", done: false },
  ];
  const accountVerificationItems = [
    { label: "이메일 인증", detail: businessCompanyManager.email, done: true },
    { label: "담당자 인증", detail: `${businessCompanyManager.managerName} · ${businessCompanyManager.phone}`, done: true },
    { label: "사업자 인증", detail: "기업 인증 완료", done: businessCompanyVerification.verificationStatus === "approved" },
  ];
  const sectionStatus = (label: string) => completionItems.find((i) => i.label === label)?.done ? "완료" : "작성 중";

  const updateProfile = <K extends keyof CompanyProfileMaster>(key: K, value: CompanyProfileMaster[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const toggleArrayValue = (key: "mainBusinessAreas" | "mainJobCategories" | "keywords", value: string) => {
    setProfile((current) => {
      const exists = current[key].includes(value);
      return {
        ...current,
        [key]: exists ? current[key].filter((item) => item !== value) : [...current[key], value],
      };
    });
  };

  const addProduct = () => {
    const value = newProduct.trim();
    if (!value || profile.products.includes(value)) return;
    updateProfile("products", [...profile.products, value]);
    setNewProduct("");
  };

  const saveProfile = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div>
      {saved ? (
        <div className="fixed right-6 top-[84px] z-[80] border border-[#cfd8e3] bg-white px-5 py-3 text-[13px] font-medium text-[#303946] shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
          기업 정보가 저장되었습니다.
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-5 max-[760px]:flex-col">
        <div>
          <PageBreadcrumb items={[{ label: "기업센터", href: "/business/dashboard" }, { label: "기업관리" }, { label: "기업정보 관리" }]} />
          <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">기업 정보 관리</h1>
          <p className="mt-2 text-[13px] font-normal text-[#68717e]">채용공고와 기업 상세 페이지에 표시되는 회사 정보를 관리합니다.</p>
        </div>
        <div className="flex shrink-0 gap-2 max-[760px]:w-full">
          <Link href="/business/company/preview" className="inline-flex h-11 items-center justify-center gap-2 border border-[#cfd8e3] bg-white px-4 text-[13px] font-medium text-[#303946] hover:border-[#111111] max-[760px]:flex-1">
            브랜드 페이지 미리보기
            <ExternalLink size={15} />
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        <SectionCard id="verification" title="인증 정보" description="인증 정보는 승인 상태와 인증 배지에 사용되며, 변경 시 운영팀 검토 후 반영됩니다." status="완료">
          <span className="inline-flex h-7 items-center border border-[#cfd8e3] bg-[#f7f8fa] px-2.5 text-[12px] font-medium text-[#303946]">기업 인증 완료</span>
          <div className="mt-5 grid grid-cols-4 border border-[#dfe4ea] max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            {[
              ["사업자등록번호", profile.businessNumber],
              ["법인명", profile.legalName],
              ["대표자명", profile.representativeName],
              ["승인일", profile.approvedAt],
            ].map(([label, value]) => (
              <div key={label} className="border-r border-[#dfe4ea] px-4 py-4 last:border-r-0 max-[900px]:border-b">
                <p className="text-[11px] font-medium text-[#8a94a3]">{label}</p>
                <p className="mt-2 text-[13px] font-medium text-[#17202c]">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border border-t-0 border-[#dfe4ea] px-4 py-4">
            <div>
              <p className="text-[11px] font-medium text-[#8a94a3]">사업자등록증명원</p>
              <p className="mt-2 text-[13px] font-medium text-[#17202c]">{statusLabel(businessCompanyVerification.businessLicenseFile.status)}</p>
            </div>
            <button type="button" className="h-9 shrink-0 border border-[#d8e0e8] bg-white px-3 text-[12px] font-medium text-[#303946] hover:border-[#111111]">
              서류 변경 요청
            </button>
          </div>
          <div className="mt-4 flex gap-2 border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3 text-[12px] font-normal leading-[1.6] text-[#6f7783]">
            <Info size={15} className="mt-0.5 shrink-0 text-[#7b8491]" />
            인증 정보 또는 제출 서류 변경이 필요한 경우 변경 요청을 보내주세요. 운영팀 검토 후 반영됩니다.
          </div>
        </SectionCard>

        <SectionCard id="basic" title="기업 정보" description="기업의 공식 정보와 연락처를 관리합니다." status={sectionStatus("기업 정보")}>
          <div>
            <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#303946]">기업 유형</h3>
            <div className="mt-4 space-y-2">
              <FieldLabel required>기업 유형</FieldLabel>
              <Segmented value={profile.companyType} options={companyTypeOptions} onChange={(value: CompanyType) => updateProfile("companyType", value)} />
              <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">가입 시 선택한 기업 유형과 동일한 기준이며, 공고 등록 시 산업 분류 기본값으로 활용됩니다.</p>
            </div>
          </div>

          <div className="mt-6 space-y-5 border-t border-[#f0f2f5] pt-6">
            <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#303946]">기본 사항·연락처</h3>
            <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div className="space-y-2">
                <FieldLabel required>회사명</FieldLabel>
                <TextInput value={profile.displayName} onChange={(value) => updateProfile("displayName", value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel>법인등록번호</FieldLabel>
                <TextInput value={profile.corporateRegistrationNumber} onChange={(value) => updateProfile("corporateRegistrationNumber", value)} />
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel required>사업자등록번호</FieldLabel>
              <TextInput
                value={profile.businessNumber}
                disabled
                right={
                  <button type="button" className="grid h-11 w-11 place-items-center border-y border-r border-[#d8e0e8] bg-[#f5f6f7] text-[#8a94a3]" aria-label="사업자등록번호 잠김">
                    <Lock size={15} />
                  </button>
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div className="space-y-2">
                <FieldLabel required>대표 주소</FieldLabel>
                <div className="grid grid-cols-[1fr_112px] gap-2">
                  <TextInput value={profile.zipCode} onChange={(value) => updateProfile("zipCode", value)} />
                  <button type="button" className="h-11 border border-[#d8e0e8] bg-white text-[12px] font-medium text-[#303946] hover:border-[#111111]">우편번호 찾기</button>
                </div>
                <TextInput value={profile.address} onChange={(value) => updateProfile("address", value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel>상세 주소</FieldLabel>
                <TextInput value={profile.detailAddress} onChange={(value) => updateProfile("detailAddress", value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div className="space-y-2">
                <FieldLabel>홈페이지</FieldLabel>
                <TextInput value={profile.homepageUrl} onChange={(value) => updateProfile("homepageUrl", value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel required>설립 연도</FieldLabel>
                <TextInput value={profile.foundedYear} onChange={(value) => updateProfile("foundedYear", value)} right={<span className="grid h-11 w-10 place-items-center border-y border-r border-[#d8e0e8] bg-white text-[12px] font-medium text-[#7b8491]">년</span>} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <div className="space-y-2">
                <FieldLabel required>직원 수</FieldLabel>
                <Segmented value={profile.employeeCount} options={employeeCountOptions} onChange={(value: EmployeeCountRange) => updateProfile("employeeCount", value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel required>회사 전화번호</FieldLabel>
                <TextInput value={profile.phone} onChange={(value) => updateProfile("phone", value)} />
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel required>회사 이메일</FieldLabel>
              <TextInput value={profile.email} onChange={(value) => updateProfile("email", value)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard id="profile" title="공개 프로필" description="구직자에게 공개되는 기업 소개 정보입니다." status={sectionStatus("공개 프로필")}>
          <div className="grid grid-cols-[230px_minmax(0,1fr)] gap-6 max-[820px]:grid-cols-1">
            <div>
              <FieldLabel required>기업 로고</FieldLabel>
              <div className="mt-2 grid h-[128px] w-full max-w-[230px] place-items-center border border-[#dfe4ea] bg-[#fbfcfd] p-4">
                <div className="h-[76px] w-[154px]">
                  <LogoMark profile={profile} />
                </div>
              </div>
              <p className="mt-2 text-[11px] font-normal text-[#8a94a3]">권장 사이즈: 240x60px / JPG, PNG (2MB 이하)</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button type="button" className="h-9 border border-[#d8e0e8] bg-white text-[12px] font-medium text-[#303946] hover:border-[#111111]">변경</button>
                <button type="button" onClick={() => updateProfile("logoUrl", null)} className="h-9 border border-[#d8e0e8] bg-white text-[12px] font-medium text-[#303946] hover:border-[#111111]">삭제</button>
                <button type="button" className="h-9 border border-[#d8e0e8] bg-white text-[12px] font-medium text-[#303946] hover:border-[#111111]">미리보기</button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <FieldLabel required>한 줄 소개</FieldLabel>
                <TextInput value={profile.shortIntro} onChange={(value) => updateProfile("shortIntro", value)} placeholder="예: 제약·바이오 산업 전문 채용 플랫폼" />
                <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">구직자가 확인할 수 있는 사실 중심으로 작성해 주세요.</p>
              </div>
              <div className="space-y-2">
                <FieldLabel>기업 소개 본문</FieldLabel>
                <textarea
                  value={profile.fullIntro}
                  onChange={(event) => updateProfile("fullIntro", event.target.value)}
                  maxLength={1000}
                  className="min-h-[148px] w-full resize-y border border-[#d8e0e8] bg-white px-3.5 py-3 text-[13px] font-normal leading-[1.7] text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
                />
                <p className="text-right text-[11px] font-medium text-[#8a94a3]">{profile.fullIntro.length} / 1000</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard id="business" title="사업·채용 정보" description="구직자 검색과 공고 추천에 활용되는 기업 정보입니다." status={sectionStatus("사업·채용 정보")}>
          <div className="space-y-6">
            <div>
              <FieldLabel>주요 사업 영역</FieldLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {businessAreaOptions.map((item) => (
                  <ToggleChip key={item} label={item} selected={profile.mainBusinessAreas.includes(item)} onClick={() => toggleArrayValue("mainBusinessAreas", item)} />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>주요 채용 직무</FieldLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {jobCategoryOptions.map((item) => (
                  <ToggleChip key={item} label={item} selected={profile.mainJobCategories.includes(item)} onClick={() => toggleArrayValue("mainJobCategories", item)} />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>대표 제품/서비스</FieldLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.products.map((product) => (
                  <span key={product} className="inline-flex h-9 items-center gap-2 border border-[#d8e0e8] bg-white px-3 text-[12px] font-medium text-[#3c4654]">
                    {product}
                    <button type="button" onClick={() => updateProfile("products", profile.products.filter((item) => item !== product))} aria-label={`${product} 삭제`}>
                      <Trash2 size={13} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-3 flex max-w-[420px]">
                <input
                  value={newProduct}
                  onChange={(event) => setNewProduct(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addProduct();
                    }
                  }}
                  placeholder="대표 제품/서비스 입력"
                  className="h-11 min-w-0 flex-1 border border-[#d8e0e8] px-3 text-[13px] font-medium outline-none transition hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
                />
                <button type="button" onClick={addProduct} className="inline-flex h-11 items-center gap-1 border-y border-r border-[#d8e0e8] px-3 text-[12px] font-medium text-[#303946]">
                  <Plus size={14} />
                  추가
                </button>
              </div>
            </div>
            <div>
              <FieldLabel>기업 핵심 키워드</FieldLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {keywordOptions.map((item) => (
                  <ToggleChip key={item} label={item} selected={profile.keywords.includes(item)} onClick={() => toggleArrayValue("keywords", item)} />
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard id="manager" title="담당자 정보" description="채용 관련 문의와 서비스 안내를 받을 담당자 정보입니다." status={sectionStatus("담당자 정보")}>
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

        <SectionCard id="account" title="계정 정보" description="계정 인증 상태를 관리합니다." status={sectionStatus("계정 정보")}>
          <div>
            <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#303946]">계정 인증 상태</h3>
            <div className="mt-3 space-y-2">
              {accountVerificationItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3 border border-[#dfe4ea] bg-white px-4 py-3">
                  <span
                    className={clsx(
                      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center border text-[11px]",
                      item.done ? "border-[#111111] bg-[#111111] text-white" : "border-[#cbd5e1] bg-white text-[#8a94a3]",
                    )}
                  >
                    {item.done ? <Check size={13} /> : null}
                  </span>
                  <span>
                    <span className="block text-[13px] font-medium text-[#303946]">{item.label}</span>
                    <span className="mt-1 block text-[12px] font-normal text-[#7b8491]">{item.detail}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          {businessCompanyVerification.additionalFiles.length > 0 ? (
            <div className="mt-5 border-t border-[#f0f2f5] pt-4">
              <p className="text-[12px] font-medium text-[#7b8491]">기타 인증 서류</p>
              <div className="mt-2 space-y-1.5">
                {businessCompanyVerification.additionalFiles.map((file) => (
                  <div key={file.name} className="flex items-center justify-between gap-3 border border-[#dfe4ea] bg-white px-3 py-2">
                    <span className="text-[12.5px] font-normal text-[#68717e]">{file.name}</span>
                    <span className="text-[11.5px] font-medium text-[#8a94a3]">{statusLabel(file.status)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
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
