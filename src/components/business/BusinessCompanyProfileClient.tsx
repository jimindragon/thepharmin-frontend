"use client";

import clsx from "clsx";
import {
  AlertTriangle,
  Check,
  Clock3,
  ExternalLink,
  FileCheck2,
  HelpCircle,
  History,
  Info,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { FieldLabel, SectionCard, TextInput } from "@/components/business/BusinessFormControls";
import {
  businessAreaOptions,
  businessCompanyManager,
  businessCompanyStats,
  businessCompanyVerification,
  companyTypeOptions,
  employeeCountOptions,
  getMissingRequiredCompanyFields,
  initialBusinessCompanyProfile,
  jobCategoryOptions,
  keywordOptions,
  type CompanyProfileMaster,
  type CompanyType,
  type EmployeeCountRange,
  type FileStatus,
} from "@/data/businessCompanyProfile";

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={clsx(
            "h-10 border px-4 text-[13px] font-medium transition",
            value === option.id
              ? "border-[#111111] bg-[#f7f8fa] text-[#111111]"
              : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111] hover:text-[#111111]",
          )}
          aria-pressed={value === option.id}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ToggleChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "h-9 border px-3 text-[12px] font-medium transition",
        selected ? "border-[#111111] bg-[#f7f8fa] text-[#111111]" : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
      )}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

function statusLabel(status: FileStatus | null) {
  if (!status) return "해당 없음";
  if (status === "approved") return "승인 완료";
  if (status === "pending") return "검토 중";
  if (status === "rejected") return "반려";
  return "변경 요청 필요";
}

function statusClass(status: FileStatus | null) {
  if (status === "approved") return "border-[#cfd8e3] bg-[#f7f8fa] text-[#303946]";
  if (status === "pending") return "border-[#dfe4ea] bg-[#f7f8fa] text-[#596373]";
  if (status === "rejected") return "border-[#ead8d3] bg-[#fffafa] text-[#a43f31]";
  if (status === "change_requested") return "border-[#f1dcb7] bg-[#fff9ef] text-[#9a6500]";
  return "border-[#e3e7ed] bg-[#f7f8fa] text-[#9aa3af]";
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

  const missingItems = useMemo(() => getMissingRequiredCompanyFields(profile), [profile]);
  const completionItems = [
    { label: "기본 정보", done: true },
    { label: "공개 프로필", done: Boolean(profile.shortIntro && profile.fullIntro && profile.logoUrl) },
    { label: "사업·채용 정보", done: profile.mainBusinessAreas.length > 0 && profile.mainJobCategories.length > 0 },
    { label: "첨부 파일", done: businessCompanyVerification.businessLicenseFile.status === "approved" },
    { label: "담당자 정보", done: Boolean(businessCompanyManager.email && businessCompanyManager.phone) },
    { label: "계정 정보", done: false },
  ];
  const accountVerificationItems = [
    { label: "이메일 인증", detail: businessCompanyManager.email, done: true },
    { label: "담당자 인증", detail: `${businessCompanyManager.managerName} · ${businessCompanyManager.phone}`, done: true },
    { label: "사업자 인증", detail: "인증기업 · 승인 완료", done: businessCompanyVerification.verificationStatus === "approved" },
  ];
  const sectionStatus = (label: string) => completionItems.find((i) => i.label === label)?.done ? "완료" : "작성 중";
  const completedItems = completionItems.filter((item) => item.done);
  const remainingItems = completionItems.filter((item) => !item.done);
  const computedCompletion = Math.round((completedItems.length / completionItems.length) * 100);
  const progressMessage =
    remainingItems.length === 0 ? "공고 등록 요건을 충족했습니다." : `공고 등록 가능까지 ${remainingItems.length}단계 남음`;
  const verificationFiles: Array<{ label: string; name: string; status: FileStatus | null }> = [
    {
      label: "사업자등록증명원",
      name: businessCompanyVerification.businessLicenseFile.name,
      status: businessCompanyVerification.businessLicenseFile.status,
    },
    {
      label: "약사면허증",
      name: businessCompanyVerification.pharmacistLicenseFile.name,
      status: businessCompanyVerification.pharmacistLicenseFile.status,
    },
    {
      label: "약국 개설 등록증",
      name: businessCompanyVerification.pharmacyRegistrationFile.name,
      status: businessCompanyVerification.pharmacyRegistrationFile.status,
    },
    ...businessCompanyVerification.additionalFiles.map((file) => ({
      label: "기타 인증 서류",
      name: file.name,
      status: file.status,
    })),
  ];

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
          <p className="mt-2 text-[13px] font-normal text-[#68717e]">공고 상세와 기업 상세 페이지에 노출되는 회사 정보를 관리합니다.</p>
        </div>
        <div className="flex shrink-0 gap-2 max-[760px]:w-full">
          <Link href="/business/company/preview" className="inline-flex h-11 items-center justify-center gap-2 border border-[#cfd8e3] bg-white px-4 text-[13px] font-medium text-[#303946] hover:border-[#111111] max-[760px]:flex-1">
            브랜드 페이지 미리보기
            <ExternalLink size={15} />
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)_292px] gap-6 max-[1180px]:grid-cols-1">
        <div className="space-y-5">
          <SectionCard id="verification" title="인증 정보" description="인증 정보는 운영팀 검토 후 변경됩니다. 공고 신뢰도와 인증 배지에 영향을 줄 수 있습니다." status="완료">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 items-center border border-[#cfd8e3] bg-[#f7f8fa] px-2.5 text-[12px] font-medium text-[#303946]">
                인증기업 · 승인 완료
              </span>
              <button type="button" className="ml-auto h-9 border border-[#cfd8e3] bg-white px-4 text-[12px] font-medium text-[#303946] hover:border-[#111111]">
                변경 요청
              </button>
            </div>
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
            <div className="mt-4 flex gap-2 border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3 text-[12px] font-normal leading-[1.6] text-[#6f7783]">
              <Info size={15} className="mt-0.5 shrink-0 text-[#7b8491]" />
              사업자등록번호, 법인명, 대표자명은 직접 수정할 수 없으며 변경 요청 후 운영팀 검토가 필요합니다.
            </div>
          </SectionCard>

          <SectionCard id="basic" title="기본 정보" description="기업의 공식 정보와 연락처를 관리합니다." status={sectionStatus("기본 정보")}>
            <div className="grid grid-cols-2 gap-x-5 gap-y-5 max-[820px]:grid-cols-1">
              <div className="space-y-2">
                <FieldLabel required>회사(법인) 이름</FieldLabel>
                <TextInput value={profile.displayName} onChange={(value) => updateProfile("displayName", value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel required>기업 형태</FieldLabel>
                <Segmented value={profile.companyType} options={companyTypeOptions} onChange={(value: CompanyType) => updateProfile("companyType", value)} />
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
              <div className="space-y-2">
                <FieldLabel>법인등록번호</FieldLabel>
                <TextInput value={profile.corporateRegistrationNumber} onChange={(value) => updateProfile("corporateRegistrationNumber", value)} />
              </div>
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
              <div className="space-y-2">
                <FieldLabel>홈페이지 주소</FieldLabel>
                <TextInput value={profile.homepageUrl} onChange={(value) => updateProfile("homepageUrl", value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel required>설립연도</FieldLabel>
                <TextInput value={profile.foundedYear} onChange={(value) => updateProfile("foundedYear", value)} right={<span className="grid h-11 w-10 place-items-center border-y border-r border-[#d8e0e8] bg-white text-[12px] font-medium text-[#7b8491]">년</span>} />
              </div>
              <div className="space-y-2">
                <FieldLabel required>직원 수</FieldLabel>
                <Segmented value={profile.employeeCount} options={employeeCountOptions} onChange={(value: EmployeeCountRange) => updateProfile("employeeCount", value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel required>회사 전화번호</FieldLabel>
                <TextInput value={profile.phone} onChange={(value) => updateProfile("phone", value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel>회사 팩스</FieldLabel>
                <TextInput value={profile.fax} onChange={(value) => updateProfile("fax", value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel required>회사 이메일</FieldLabel>
                <TextInput value={profile.email} onChange={(value) => updateProfile("email", value)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard id="profile" title="공개 프로필" description="개인 사용자에게 직접 노출되는 기업 소개 정보입니다." status={sectionStatus("공개 프로필")}>
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

            <div className="mt-6 border border-[#e2e8ef] bg-[#fbfcfd] p-4">
              <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#303946]">노출 미리보기</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 max-[820px]:grid-cols-1">
                <div className="border border-[#dfe4ea] bg-white p-4">
                  <p className="text-[11px] font-medium text-[#8a94a3]">공고 상세 · 기업 정보 카드</p>
                  <div className="mt-4 flex gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center border border-[#dfe4ea] bg-white p-1">
                      <LogoMark profile={profile} />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#17202c]">{profile.displayName}</p>
                      <p className="mt-1 text-[12px] font-normal text-[#6f7783]">{profile.shortIntro}</p>
                      <p className="mt-2 text-[11px] font-medium text-[#8a94a3]">{profile.foundedYear}년 설립 · {employeeCountOptions.find((item) => item.id === profile.employeeCount)?.label}</p>
                    </div>
                  </div>
                </div>
                <div
                  className="border border-[#dfe4ea] bg-cover bg-center p-4 text-white"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, rgba(5,5,5,0.78), rgba(5,5,5,0.32)), url('/images/company/company_pic_example.jpg')",
                  }}
                >
                  <p className="text-[11px] font-medium text-white/62">기업 상세 페이지 · hero 영역</p>
                  <div className="mt-5 flex items-center gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center bg-white p-1.5">
                      <LogoMark profile={profile} />
                    </div>
                    <div>
                      <p className="text-[16px] font-medium">{profile.displayName}</p>
                      <p className="mt-1 text-[12px] font-normal text-white/78">{profile.shortIntro}</p>
                      <p className="mt-3 text-[11px] font-medium text-white/65">{profile.foundedYear}년 설립 · 서울 강남구</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="business" title="사업·채용 정보" description="더파마 리크루트의 전문 검색과 추천에 활용되는 기업 데이터입니다." status={sectionStatus("사업·채용 정보")}>
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

          <SectionCard id="files" title="첨부 파일" description="인증 서류는 운영팀 검토 후 상태가 변경됩니다." status={sectionStatus("첨부 파일")}>
            <div className="divide-y divide-[#e5e9ef] border border-[#dfe4ea]">
              {verificationFiles.map(({ label, name, status }) => (
                <div key={`${label}-${name}`} className="grid grid-cols-[180px_minmax(0,1fr)_120px_100px] items-center gap-4 px-4 py-4 max-[760px]:grid-cols-1">
                  <p className="text-[13px] font-medium text-[#303946]">{label}</p>
                  <p className="text-[13px] font-normal text-[#68717e]">{name}</p>
                  <span className={clsx("inline-flex h-7 items-center justify-center border px-2 text-[11px] font-medium", statusClass(status))}>{statusLabel(status)}</span>
                  <button type="button" className="h-9 border border-[#d8e0e8] bg-white text-[12px] font-medium text-[#303946] hover:border-[#111111]">파일 변경</button>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard id="manager" title="담당자 정보" description="지원자 문의와 운영팀 안내를 받을 담당자 정보입니다." status={sectionStatus("담당자 정보")}>
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

          <SectionCard id="account" title="계정 정보" description="계정 권한과 보안 설정은 추후 확장 예정입니다." status={sectionStatus("계정 정보")}>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 max-[900px]:grid-cols-1">
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
              <div>
                <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#303946]">공개 설정</h3>
                <div className="mt-3 space-y-2">
                  {[
                    ["기업 페이지를 공개합니다.", profile.visibilitySettings.publicCompanyPage],
                    ["공고에 기업정보를 함께 노출합니다.", profile.visibilitySettings.exposeOnJobs],
                    ["검색 결과에 기업 프로필을 노출합니다.", profile.visibilitySettings.exposeOnSearch],
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
              <p className="text-[12px] font-normal text-[#7b8491]">저장 시 개인 사용자에게 표시될 기업 정보에 반영됩니다.</p>
              <div className="flex gap-2 max-[640px]:w-full">
                <Link href="/business/company/preview" className="inline-flex h-11 items-center justify-center border border-[#cfd8e3] bg-white px-7 text-[13px] font-medium text-[#303946] hover:border-[#111111] max-[640px]:flex-1">
                  미리보기
                </Link>
                <button type="button" onClick={saveProfile} className="inline-flex h-11 items-center justify-center border border-[#111111] bg-[#111111] px-9 text-[13px] font-medium text-white hover:bg-[#2a2a2a] max-[640px]:flex-1">
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="sticky top-[88px] self-start space-y-5 max-[1180px]:static">
            <section className="border border-[#dfe4ea] bg-white p-5">
              <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">기업 정보 등록 현황</h2>
              <div className="mt-4">
                <div className="flex items-end justify-between gap-3">
                  <p className="text-[34px] font-medium leading-none tracking-[0] text-[#111111]">{computedCompletion}%</p>
                  <p className="pb-1 text-right text-[12px] font-medium text-[#68717e]">
                    완료 {completedItems.length} / {completionItems.length}
                  </p>
                </div>
                <div className="mt-3 h-2.5 w-full border border-[#dfe4ea] bg-[#f3f5f7]">
                  <div className="h-full bg-[#111111] transition-[width]" style={{ width: `${computedCompletion}%` }} />
                </div>
                <p className="mt-3 text-[13px] font-medium text-[#303946]">{progressMessage}</p>
                <p className="mt-1 text-[12px] font-normal leading-[1.55] text-[#7b8491]">
                  남은 항목을 완료하면 기업 프로필과 공고 노출 준비가 마무리됩니다.
                </p>
              </div>

              <div className="mt-5 border-t border-[#edf1f5] pt-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a94a3]">완료</p>
                <div className="mt-3 space-y-2">
                  {completedItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-[13px] font-medium text-[#303946]">
                      <span className="grid h-5 w-5 shrink-0 place-items-center border border-[#111111] bg-[#111111] text-white">
                        <Check size={13} />
                      </span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-[#edf1f5] pt-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a94a3]">남은 항목</p>
                <div className="mt-3 space-y-2">
                  {remainingItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-[13px] font-medium text-[#9b3a2d]">
                      <span className="h-5 w-5 shrink-0 border border-[#f1c9bf] bg-[#fff3f0]" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                  {remainingItems.length === 0 ? (
                    <div className="flex items-center gap-2 text-[13px] font-medium text-[#303946]">
                      <span className="grid h-5 w-5 shrink-0 place-items-center border border-[#111111] bg-[#111111] text-white">
                        <Check size={13} />
                      </span>
                      <span>남은 항목 없음</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {remainingItems.length ? (
                <div className="mt-5 border border-[#dfe4ea] bg-[#fbfcfd] p-3">
                  <p className="text-[12px] font-medium text-[#303946]">다음 작업</p>
                  <p className="mt-1 text-[12px] font-normal leading-[1.6] text-[#68717e]">{remainingItems[0].label} 항목을 확인해 주세요.</p>
                </div>
              ) : null}

              {missingItems.length ? (
                <div className="mt-3 border border-[#ead8d3] bg-[#fffafa] p-3">
                  <p className="text-[12px] font-medium text-[#a43f31]">부족한 필수 항목</p>
                  <p className="mt-1 text-[12px] font-medium leading-[1.6] text-[#7d5960]">{missingItems.join(", ")}</p>
                </div>
              ) : null}
            </section>

            <section className="border border-[#dfe4ea] bg-white p-5">
              <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">공고 등록 전 체크</h2>
              <div className="mt-4 space-y-3">
                {[
                  { label: "한 줄 소개 입력", done: Boolean(profile.shortIntro) },
                  { label: "설립연도 입력", done: Boolean(profile.foundedYear) },
                  { label: "대표 제품/서비스 권장", done: profile.products.length > 0, warn: true },
                  { label: "주요 채용 직무 입력", done: profile.mainJobCategories.length > 0, warn: true },
                  { label: "핵심 키워드 입력", done: profile.keywords.length > 0, warn: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-[13px] font-medium text-[#4f5967]">
                    <span>{item.label}</span>
                    {item.done ? <Check size={16} className="text-[#111111]" /> : item.warn ? <AlertTriangle size={16} className="text-[#8f98a5]" /> : <span className="h-4 w-4 border border-[#cbd5e1]" />}
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-[#dfe4ea] bg-white p-5">
              <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">도움말</h2>
              <div className="mt-4 space-y-3">
                {[
                  ["기업 정보 관리 가이드", HelpCircle],
                  ["브랜드 페이지 미리보기", ExternalLink],
                  ["고객센터 문의하기", FileCheck2],
                ].map(([label, Icon]) => (
                  <Link
                    key={String(label)}
                    href={label === "고객센터 문의하기" ? "/support/contact" : "/business/support/inquiries"}
                    className="flex items-center gap-3 text-[13px] font-medium text-[#4f5967] hover:text-[#111111]"
                  >
                    <Icon size={16} />
                    {String(label)}
                  </Link>
                ))}
              </div>
            </section>

            <section className="border border-[#dfe4ea] bg-white p-5">
              <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">최근 저장</h2>
              <div className="mt-4 space-y-2 text-[13px] font-medium text-[#4f5967]">
                <p className="flex items-center gap-2">
                  <Clock3 size={15} />
                  2026.06.22 14:30
                </p>
                <p>이길동 ({businessCompanyManager.department})</p>
              </div>
              <button type="button" className="mt-4 inline-flex h-9 items-center gap-2 border border-[#d8e0e8] px-3 text-[12px] font-medium text-[#303946] hover:border-[#111111]">
                <History size={14} />
                변경 이력 보기
              </button>
            </section>

            <section className="border border-[#dfe4ea] bg-[#fbfcfd] p-5">
              <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">시스템 집계 정보</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                {[
                  ["진행 중 공고", `${businessCompanyStats.activeJobCount}건`],
                  ["관심기업", businessCompanyStats.favoriteCount.toLocaleString("ko-KR")],
                  ["응답률", businessCompanyStats.responseRate],
                  ["평균 응답", businessCompanyStats.averageResponseTime],
                ].map(([label, value]) => (
                  <div key={label} className="border border-[#e2e8ef] bg-white p-3">
                    <p className="font-medium text-[#8a94a3]">{label}</p>
                    <p className="mt-1 text-[15px] font-medium text-[#17202c]">{value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] font-normal leading-[1.6] text-[#8a94a3]">관심기업 수, 후기, 뉴스, 진행 중 공고 수는 기업이 직접 입력하는 값이 아닙니다.</p>
            </section>
        </aside>
      </div>
    </div>
  );
}
