"use client";

import {
  ExternalLink,
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { FieldLabel, FormActionButton, PROFILE_TEXT_FIELD_WIDTH, SectionCard, Segmented, TextInput, ToggleChip } from "@/components/business/BusinessFormControls";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import {
  businessFieldOptions,
  companyTypeOptions,
  employeeCountOptions,
  initialIndustryOrgAdmin,
  initialIndustryOrgManager,
  initialIndustryOrgProfile,
  saveIndustryOrgProfileDraft,
  type CompanyType,
  type EmployeeCountRange,
  type IndustryOrgProduct,
  type IndustryOrgProfile,
  type OrgAdmin,
  type OrgManager,
} from "@/data/businessCompanyProfile";

const MAX_KEYWORDS = 8;
const MAX_PRODUCTS = 5;

/** 카드 내부 필드 그룹 간 세로 간격 — 6개 SectionCard 전체에서 하나의 값으로 통일 */
const FIELD_GROUP_GAP = "space-y-6";
/** 2열 필드(기관명/설립연도, 대표 전화/대표 이메일, 담당자명/부서, 직책/이메일)의 공통 grid 규칙 */
const FIELD_GRID_2COL = "grid grid-cols-2 gap-4 max-[640px]:grid-cols-1";
/** 로고·상단 대표 이미지 "이미지 변경/등록" 버튼 전용 — 입력칸과 같은 행이 아니라서 CONTROL_HEIGHT를 따르지 않는다.
 * 위계는 FormActionButton과 동일하게 가는 테두리+배경 없음+작은 폰트로 표현하되, 라벨 옆 보조 액션이라 높이는 더 작게 둔다. */
const IMAGE_ACTION_BUTTON = "h-8 shrink-0 whitespace-nowrap border border-[#e2e8ef] bg-white px-3 text-[11.5px] font-medium text-[#4f5967] transition hover:border-[#111111] hover:text-[#111111]";
/** 텍스트 버튼(삭제 등) — 테두리 없이 텍스트만, 가장 낮은 위계 */
const TEXT_BUTTON = "text-[12px] font-medium text-[#8a94a3] underline-offset-2 hover:text-[#111111] hover:underline";

function statusLabel(status: OrgAdmin["businessLicenseFile"]["status"]) {
  if (status === "approved") return "등록완료";
  if (status === "pending") return "검토 중";
  if (status === "rejected") return "반려";
  return "변경 요청 필요";
}

function ImageMark({ url, alt, fallback }: { url: string | null; alt: string; fallback: string }) {
  if (url) {
    return <img src={url} alt={alt} className="h-full w-full object-contain p-[12%]" />;
  }

  return (
    <div className="grid h-full w-full place-items-center bg-[#f7f8fa] text-[13px] font-bold text-[#4f5968]">
      {fallback.slice(0, 2)}
    </div>
  );
}

/** 로고·대표 이미지 변경 버튼 — 파일 선택 후 FileReader로 로컬 미리보기를 state에 반영한다(서버 업로드 없음) */
function useImageUpload(onSelect: (dataUrl: string) => void) {
  const inputRef = useRef<HTMLInputElement>(null);

  const trigger = () => inputRef.current?.click();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onSelect(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return { inputRef, trigger, handleChange };
}

export function BusinessCompanyProfileClient() {
  const [profile, setProfile] = useState<IndustryOrgProfile>(initialIndustryOrgProfile);
  const [admin] = useState<OrgAdmin>(initialIndustryOrgAdmin);
  const [manager, setManager] = useState<OrgManager>(initialIndustryOrgManager);

  const [newProductName, setNewProductName] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [saved, setSaved] = useState(false);

  const logoUpload = useImageUpload((dataUrl) => updateProfile("logoUrl", dataUrl));
  const coverUpload = useImageUpload((dataUrl) => updateProfile("coverImageUrl", dataUrl));

  const updateProfile = <K extends keyof IndustryOrgProfile>(key: K, value: IndustryOrgProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const updateManager = <K extends keyof OrgManager>(key: K, value: OrgManager[K]) => {
    setManager((current) => ({ ...current, [key]: value }));
  };

  const updateVisibility = (key: keyof IndustryOrgProfile["visibilitySettings"], value: boolean) => {
    setProfile((current) => ({ ...current, visibilitySettings: { ...current.visibilitySettings, [key]: value } }));
  };

  const toggleBusinessField = (value: string) => {
    setProfile((current) => {
      const existing = current.businessFields ?? [];
      return {
        ...current,
        businessFields: existing.includes(value) ? existing.filter((item) => item !== value) : [...existing, value],
      };
    });
  };

  const addProduct = () => {
    const name = newProductName.trim();
    if (!name) return;
    const product: IndustryOrgProduct = { name, description: newProductDescription.trim() };
    updateProfile("products", [...profile.products, product]);
    setNewProductName("");
    setNewProductDescription("");
  };

  const removeProduct = (name: string) => {
    updateProfile("products", profile.products.filter((product) => product.name !== name));
  };

  const addKeyword = () => {
    const value = newKeyword.trim();
    if (!value || profile.keywords.includes(value) || profile.keywords.length >= MAX_KEYWORDS) return;
    updateProfile("keywords", [...profile.keywords, value]);
    setNewKeyword("");
  };

  const removeKeyword = (value: string) => {
    updateProfile("keywords", profile.keywords.filter((item) => item !== value));
  };

  const handleChangePassword = () => {
    // TODO: 비밀번호 변경 모달/로직은 이번 범위 아님 — 버튼 자리만 마련
  };

  const saveProfile = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  // 미리보기는 별도 라우트(/business/company/preview)라 props를 직접 넘길 수 없다 — 이동 직전 sessionStorage에
  // 편집 중인 state를 남겨 미리보기 화면이 읽어가게 한다(서버 저장 아님, 클라이언트 내에서만).
  const goToPreview = () => {
    saveIndustryOrgProfileDraft(profile);
  };

  return (
    <div>
      {saved ? (
        <div className="fixed right-6 top-[84px] z-[80] border border-border bg-white px-5 py-3 text-[13px] font-medium text-[#303946] shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
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
          <Link href="/business/company/preview?track=industry" onClick={goToPreview} className="inline-flex h-11 items-center justify-center gap-2 border border-[#cfd8e3] bg-white px-4 text-[13px] font-medium text-[#303946] hover:border-[#111111] max-[760px]:flex-1">
            브랜드 페이지 미리보기
            <ExternalLink size={15} />
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {/* §1 인증 정보 */}
        <SectionCard
          id="verification"
          title={
            <span className="inline-flex items-center gap-2">
              인증 정보
              <InfoTooltip text="인증 정보는 승인 상태와 인증 배지에 사용됩니다. 변경이 필요한 경우 변경 요청을 보내주시면 운영팀 검토 후 반영됩니다." />
            </span>
          }
          action={<span className="inline-flex h-7 items-center border border-[#cfd8e3] bg-[#f7f8fa] px-2.5 text-[12px] font-medium text-[#303946]">기업 인증 완료</span>}
        >
          <div className="grid grid-cols-4 border border-border max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            {[
              ["사업자등록번호", admin.businessNumber],
              ["대표자명", admin.representativeName],
              ["기관명", profile.name],
              ["사업자등록증", statusLabel(admin.businessLicenseFile.status)],
            ].map(([label, value]) => (
              <div key={label} className="border-r border-border px-4 py-4 last:border-r-0 max-[900px]:border-b">
                <p className="text-[11px] font-medium text-[#8a94a3]">{label}</p>
                <p className="mt-2 text-[13px] font-medium text-[#17202c]">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/support" className="inline-flex h-10 items-center gap-1.5 border border-[#d8e0e8] bg-white px-3.5 text-[12px] font-medium text-[#303946] hover:border-[#111111]">
              기업 정보 변경 요청
              <ExternalLink size={13} />
            </Link>
          </div>
        </SectionCard>

        {/* §2 기본 정보 */}
        <SectionCard id="basic" title="기본 정보">
          <div className={FIELD_GROUP_GAP}>
            <div className="space-y-2">
              <FieldLabel required>기관 유형</FieldLabel>
              {/* orgType은 미선택("") 상태를 가질 수 있어 CompanyType으로 단언 — ""는 어떤 옵션과도 일치하지 않아 미선택으로 자연히 렌더된다 */}
              <Segmented value={profile.orgType as CompanyType} options={companyTypeOptions} onChange={(value: CompanyType) => updateProfile("orgType", value)} />
            </div>

            <div className={FIELD_GRID_2COL}>
              <div className="space-y-2">
                <FieldLabel required>기관명</FieldLabel>
                <TextInput value={profile.name} onChange={(value) => updateProfile("name", value)} />
              </div>
              <div className="space-y-2">
                <FieldLabel>설립연도</FieldLabel>
                <TextInput
                  value={profile.foundedYear}
                  onChange={(value) => updateProfile("foundedYear", value)}
                  placeholder="예: 2019"
                  right={<span className="grid h-11 w-10 shrink-0 place-items-center border-y border-r border-[#d8e0e8] bg-white text-[12px] font-medium text-[#7b8491]">년</span>}
                />
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel required>직원수</FieldLabel>
              <Segmented value={profile.employeeCount} options={employeeCountOptions} onChange={(value: EmployeeCountRange) => updateProfile("employeeCount", value)} />
            </div>

            <div className="space-y-2">
              <FieldLabel required>주소</FieldLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="w-[160px] shrink-0">
                    <TextInput value={profile.zipCode} onChange={(value) => updateProfile("zipCode", value)} placeholder="예: 06234" />
                  </div>
                  <FormActionButton>우편번호 찾기</FormActionButton>
                </div>
                <TextInput value={profile.address} onChange={(value) => updateProfile("address", value)} placeholder="예: 서울 강남구 테헤란로 123" />
                <TextInput value={profile.detailAddress} onChange={(value) => updateProfile("detailAddress", value)} placeholder="예: 8층 인사팀" />
              </div>
            </div>

            <div className={FIELD_GRID_2COL}>
              <div className="space-y-2">
                <FieldLabel>대표 전화</FieldLabel>
                <TextInput value={profile.phone} onChange={(value) => updateProfile("phone", value)} placeholder="예: 02-1234-5678" />
              </div>
              <div className="space-y-2">
                <FieldLabel>대표 이메일</FieldLabel>
                <TextInput value={profile.email} onChange={(value) => updateProfile("email", value)} placeholder="예: contact@company.co.kr" />
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>홈페이지</FieldLabel>
              <TextInput value={profile.homepageUrl} onChange={(value) => updateProfile("homepageUrl", value)} placeholder="예: https://www.company.co.kr" />
            </div>
          </div>
        </SectionCard>

        {/* §3 공개 프로필 */}
        <SectionCard id="profile" title="공개 프로필">
          <div>
            <div className="flex items-start gap-4">
              <div className="h-[118px] w-[118px] shrink-0 border border-[#dfe4ea] bg-[#fbfcfd] p-3">
                <ImageMark url={profile.logoUrl} alt={`${profile.name} 로고`} fallback={profile.name} />
              </div>
              <div className="flex-1 pt-0.5">
                <FieldLabel required>로고</FieldLabel>
                <p className="mt-1.5 text-[12px] font-normal leading-[1.55] text-[#7b8491]">
                  공고 카드와 기관 목록에 표시됩니다.
                  <br />
                  정사각형 권장 / JPG, PNG · 2MB 이하
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button type="button" onClick={logoUpload.trigger} className={IMAGE_ACTION_BUTTON}>{profile.logoUrl ? "이미지 변경" : "이미지 등록"}</button>
                  {profile.logoUrl ? (
                    <button type="button" onClick={() => updateProfile("logoUrl", null)} className={TEXT_BUTTON}>삭제</button>
                  ) : null}
                </div>
              </div>
            </div>
            <input ref={logoUpload.inputRef} type="file" accept="image/*" onChange={logoUpload.handleChange} className="hidden" />
          </div>

          <div className="my-6 border-t border-[#f0f2f5]" />

          <div>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel>상단 대표 이미지</FieldLabel>
              <div className="flex items-center gap-3">
                <button type="button" onClick={coverUpload.trigger} className={IMAGE_ACTION_BUTTON}>{profile.coverImageUrl ? "이미지 변경" : "이미지 등록"}</button>
                {profile.coverImageUrl ? (
                  <button type="button" onClick={() => updateProfile("coverImageUrl", null)} className={TEXT_BUTTON}>삭제</button>
                ) : null}
              </div>
            </div>
            <p className="mt-1.5 text-[12px] font-normal leading-[1.55] text-[#7b8491]">
              공고 상세 상단과 기관 페이지 상단에 표시됩니다.
              <br />
              3:1 비율 권장 / JPG, PNG · 5MB 이하
            </p>
            <div className="mt-3 aspect-[3/1] w-full border border-[#dfe4ea] bg-[#fbfcfd]">
              {profile.coverImageUrl ? (
                <img src={profile.coverImageUrl} alt={`${profile.name} 상단 대표 이미지`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-[#a7afba]">
                  <ImageIcon size={22} />
                  <span className="text-[12px] font-medium">상단 대표 이미지를 등록해 주세요</span>
                </div>
              )}
            </div>
            <input ref={coverUpload.inputRef} type="file" accept="image/*" onChange={coverUpload.handleChange} className="hidden" />
          </div>

          <div className={`mt-6 ${FIELD_GROUP_GAP} border-t border-[#f0f2f5] pt-6`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <FieldLabel required>한 줄 소개</FieldLabel>
                <span className="shrink-0 text-[11px] font-medium text-[#8a94a3]">{profile.shortIntro.length} / 60</span>
              </div>
              <TextInput value={profile.shortIntro} onChange={(value) => updateProfile("shortIntro", value.slice(0, 60))} placeholder="국내 신약개발을 선도하는 제약·바이오 기업" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <FieldLabel required>본문 소개</FieldLabel>
                <span className="shrink-0 text-[11px] font-medium text-[#8a94a3]">{profile.fullIntro.length} / 2000</span>
              </div>
              <textarea
                value={profile.fullIntro}
                onChange={(event) => updateProfile("fullIntro", event.target.value)}
                maxLength={2000}
                placeholder="주요 사업, 성장 방향, 조직 문화와 일하는 방식을 자유롭게 소개해 주세요."
                className="min-h-[148px] w-full resize-y border border-[#d8e0e8] bg-white px-3.5 py-3 text-[13px] font-normal leading-[1.7] text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>기관 키워드</FieldLabel>
              {profile.keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.keywords.map((keyword) => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      aria-label={`${keyword} 키워드 삭제`}
                      className="inline-flex h-9 items-center gap-1.5 border border-[#111111] bg-[#111111] px-3.5 text-[12px] font-medium text-white"
                    >
                      {keyword}
                      <X size={12} className="opacity-70" aria-hidden />
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <input
                  value={newKeyword}
                  onChange={(event) => setNewKeyword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addKeyword();
                    }
                  }}
                  disabled={profile.keywords.length >= MAX_KEYWORDS}
                  placeholder="키워드 입력"
                  className="h-11 min-w-0 flex-1 border border-[#d8e0e8] px-3 text-[13px] font-medium outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8 disabled:bg-[#f5f6f7] disabled:text-[#a4adba]"
                />
                <FormActionButton onClick={addKeyword} disabled={profile.keywords.length >= MAX_KEYWORDS}>
                  <Plus size={14} />
                  키워드 추가
                </FormActionButton>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">기관을 잘 설명하는 키워드를 선택해 주세요. 검색과 추천에 활용됩니다.</p>
                {profile.keywords.length > 0 ? (
                  <span className="shrink-0 text-[11px] font-medium text-[#8a94a3]">{profile.keywords.length} / {MAX_KEYWORDS}</span>
                ) : null}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* §4 사업 정보 */}
        <SectionCard id="business" title="사업 정보">
          <div className="space-y-6">
            <div>
              <FieldLabel>사업·제품 분야</FieldLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {businessFieldOptions.map((item) => (
                  <ToggleChip key={item} label={item} selected={(profile.businessFields ?? []).includes(item)} onClick={() => toggleBusinessField(item)} />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>대표 제품</FieldLabel>
              {profile.products.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {profile.products.map((product) => (
                    <div key={product.name} className="flex items-start justify-between gap-3 border border-[#d8e0e8] bg-white px-3.5 py-3">
                      <div>
                        <p className="text-[13px] font-medium text-[#303946]">{product.name}</p>
                        {product.description ? <p className="mt-1 text-[12px] font-normal leading-[1.55] text-[#7b8491]">{product.description}</p> : null}
                      </div>
                      <button type="button" onClick={() => removeProduct(product.name)} aria-label={`${product.name} 삭제`} className="shrink-0 text-[#8a94a3] hover:text-[#111111]">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              {profile.products.length < MAX_PRODUCTS ? (
                <div className="mt-3 border border-[#d8e0e8] bg-[#fbfcfd] p-3">
                  <div className="grid grid-cols-[1fr_2fr_auto] items-end gap-x-3 gap-y-1.5 max-[560px]:grid-cols-1">
                    <p className="text-[11px] font-medium text-[#8a94a3]">제품명</p>
                    <p className="text-[11px] font-medium text-[#8a94a3]">한 줄 설명</p>
                    <div className="max-[560px]:hidden" aria-hidden />
                    <input
                      value={newProductName}
                      onChange={(event) => setNewProductName(event.target.value)}
                      placeholder="아토젯정"
                      className="h-11 w-full min-w-0 border border-[#d8e0e8] bg-white px-3 text-[13px] font-medium outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
                    />
                    <input
                      value={newProductDescription}
                      onChange={(event) => setNewProductDescription(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addProduct();
                        }
                      }}
                      placeholder="이상지질혈증 치료제"
                      className="h-11 w-full min-w-0 border border-[#d8e0e8] bg-white px-3 text-[13px] font-medium outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
                    />
                    <FormActionButton onClick={addProduct}>
                      <Plus size={14} />
                      추가
                    </FormActionButton>
                  </div>
                </div>
              ) : null}
              <p className="mt-2 text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">기관 페이지 사이드바에 표시됩니다. 최대 5개</p>
            </div>
          </div>
        </SectionCard>

        {/* §5 담당자 정보 */}
        <SectionCard id="manager" title="담당자 정보">
          <div className={FIELD_GRID_2COL}>
            <div className="space-y-2">
              <FieldLabel required>담당자명</FieldLabel>
              <TextInput value={manager.managerName} onChange={(value) => updateManager("managerName", value)} placeholder="예: 홍길동" />
            </div>
            <div className="space-y-2">
              <FieldLabel>부서</FieldLabel>
              <TextInput value={manager.department} onChange={(value) => updateManager("department", value)} placeholder="예: 인사팀" />
            </div>
            <div className="space-y-2">
              <FieldLabel>직책</FieldLabel>
              <TextInput value={manager.position} onChange={(value) => updateManager("position", value)} placeholder="예: 매니저" />
            </div>
            <div className="space-y-2">
              <FieldLabel required>이메일</FieldLabel>
              <TextInput value={manager.email} onChange={(value) => updateManager("email", value)} placeholder="예: manager@company.co.kr" />
            </div>
            <div className="space-y-2 col-span-2 max-[640px]:col-span-1">
              <FieldLabel required>연락처</FieldLabel>
              <TextInput value={manager.phone} onChange={(value) => updateManager("phone", value)} placeholder="예: 010-1234-5678" />
            </div>
          </div>
        </SectionCard>

        {/* §6 계정·노출 설정 */}
        <SectionCard id="account" title="계정·노출 설정">
          <div className={`${PROFILE_TEXT_FIELD_WIDTH} space-y-4`}>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 max-[480px]:grid-cols-1 max-[480px]:items-start max-[480px]:gap-2">
              <FieldLabel>계정 ID</FieldLabel>
              <TextInput value={manager.accountId} disabled />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 max-[480px]:grid-cols-1 max-[480px]:items-start max-[480px]:gap-2">
              <FieldLabel>비밀번호</FieldLabel>
              <div className="flex items-center gap-2">
                <TextInput value="••••••••" disabled />
                <FormActionButton onClick={handleChangePassword}>비밀번호 변경</FormActionButton>
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-[#f0f2f5]" />

          <div>
            <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#303946]">노출 설정</h3>
            <div className="mt-3 space-y-2.5">
              <label className="flex items-center gap-2 text-[13px] font-medium text-[#3c4654]">
                <input
                  type="checkbox"
                  checked={profile.visibilitySettings.publicPage}
                  onChange={(event) => updateVisibility("publicPage", event.target.checked)}
                  className="h-4 w-4 accent-[#111111]"
                />
                기관 페이지 공개
              </label>
              <label className="flex items-center gap-2 text-[13px] font-medium text-[#3c4654]">
                <input
                  type="checkbox"
                  checked={profile.visibilitySettings.exposeOnJobs}
                  onChange={(event) => updateVisibility("exposeOnJobs", event.target.checked)}
                  className="h-4 w-4 accent-[#111111]"
                />
                채용공고에 기관 프로필 표시
              </label>
              <label className="flex items-center gap-2 text-[13px] font-medium text-[#3c4654]">
                <input
                  type="checkbox"
                  checked={profile.visibilitySettings.exposeOnSearch}
                  onChange={(event) => updateVisibility("exposeOnSearch", event.target.checked)}
                  className="h-4 w-4 accent-[#111111]"
                />
                검색 결과에 표시
              </label>
            </div>
          </div>
        </SectionCard>

        <div className="sticky bottom-0 z-30 min-h-[64px] border-t border-border bg-white/95 px-6 py-4 shadow-[0_-4px_16px_rgba(20,32,46,0.08)] backdrop-blur max-[760px]:px-4">
          <div className="flex items-center justify-between gap-4 max-[640px]:flex-col">
            <p className="text-[12px] font-normal text-[#7b8491]">저장되지 않은 변경사항이 있습니다</p>
            <div className="flex gap-2 max-[640px]:w-full">
              <Link href="/business/company/preview?track=industry" onClick={goToPreview} className="inline-flex h-11 items-center justify-center border border-[#cfd8e3] bg-white px-7 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] max-[640px]:flex-1">
                미리보기
              </Link>
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
