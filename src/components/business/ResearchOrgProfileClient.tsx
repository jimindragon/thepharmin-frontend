"use client";

import { ExternalLink, Image as ImageIcon, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { FieldLabel, FormActionButton, InfoTooltip, PROFILE_TEXT_FIELD_WIDTH, SectionCard, TextInput, ToggleChip } from "@/components/business/BusinessFormControls";
import { researchInstitutionTypeOptions, researchStaffScaleOptions } from "@/config/jobFilters/researchFilters";
import { researchFieldCategoryOptions } from "@/config/researchFields";
import { type FileStatus, type OrgManager } from "@/data/businessCompanyProfile";
import { initialResearchOrgManager, initialResearchOrgProfile, type OrgFeatureItem, type ResearchOrgProfile } from "@/data/businessOrgProfile";
import type { LabInstitutionType, ResearchStaffScale } from "@/types/jobs";

/** 카드 내부 필드 그룹 간 세로 간격 — 산업/병원/약국과 동일(STEP 4-c 기준) */
const FIELD_GROUP_GAP = "space-y-6";
/** 2열 필드(주소 우편번호 옆 등)의 공통 grid 규칙 — 산업/병원/약국과 동일 */
const FIELD_GRID_2COL = "grid grid-cols-2 gap-4 max-[640px]:grid-cols-1";
/** 기관 키워드 최대 개수 — 산업/병원/약국과 동일 */
const MAX_KEYWORDS = 8;
/** 기관 특징 최대 개수 — 병원/약국(HospitalOrgProfileClient/PharmacyOrgProfileClient)과 동일 */
const MAX_FEATURES = 6;
/** 로고·상단 대표 이미지 "이미지 변경/등록" 버튼 전용 — 산업/병원/약국과 동일 스타일 복제 */
const IMAGE_ACTION_BUTTON = "h-8 shrink-0 whitespace-nowrap border border-[#e2e8ef] bg-white px-3 text-[11.5px] font-medium text-[#4f5967] transition hover:border-[#111111] hover:text-[#111111]";
/** 텍스트 버튼(삭제 등) — 산업/병원/약국과 동일 스타일 복제 */
const TEXT_BUTTON = "text-[12px] font-medium text-[#8a94a3] underline-offset-2 hover:text-[#111111] hover:underline";

function statusLabel(status: FileStatus) {
  if (status === "approved") return "제출 완료 · 검토 승인";
  if (status === "pending") return "검토 중";
  if (status === "rejected") return "반려";
  return "변경 요청 필요";
}

function newFeatureId() {
  return `feature-${Math.random().toString(36).slice(2, 9)}`;
}

/** 로고 박스 표시 — 산업/병원/약국과 동일 구현 복제 */
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

/** 로고·상단 대표 이미지 변경 버튼 — 산업/병원/약국과 동일 구현 복제 */
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

export function ResearchOrgProfileClient() {
  const [profile, setProfile] = useState<ResearchOrgProfile>(initialResearchOrgProfile);
  const [manager, setManager] = useState<OrgManager>(initialResearchOrgManager);
  const [saved, setSaved] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  const updateProfile = <K extends keyof ResearchOrgProfile>(key: K, value: ResearchOrgProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const updateManager = <K extends keyof OrgManager>(key: K, value: OrgManager[K]) => {
    setManager((current) => ({ ...current, [key]: value }));
  };

  const updateVisibility = (key: keyof ResearchOrgProfile["visibilitySettings"], value: boolean) => {
    setProfile((current) => ({ ...current, visibilitySettings: { ...current.visibilitySettings, [key]: value } }));
  };

  const handleChangePassword = () => {
    // TODO: 비밀번호 변경 모달/로직은 이번 범위 아님 — 버튼 자리만 마련
  };

  const logoUpload = useImageUpload((dataUrl) => updateProfile("logoUrl", dataUrl));
  const coverUpload = useImageUpload((dataUrl) => updateProfile("coverImageUrl", dataUrl));

  const addKeyword = () => {
    const value = newKeyword.trim();
    if (!value || profile.keywords.includes(value) || profile.keywords.length >= MAX_KEYWORDS) return;
    updateProfile("keywords", [...profile.keywords, value]);
    setNewKeyword("");
  };

  const removeKeyword = (value: string) => {
    updateProfile("keywords", profile.keywords.filter((item) => item !== value));
  };

  const updateFeatureItem = (id: string, key: "label" | "text", value: string) => {
    setProfile((current) => ({
      ...current,
      features: current.features.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  };

  const addFeatureItem = () => {
    setProfile((current) => {
      if (current.features.length >= MAX_FEATURES) return current;
      return { ...current, features: [...current.features, { id: newFeatureId(), label: "", text: "" } as OrgFeatureItem] };
    });
  };

  const removeFeatureItem = (id: string) => {
    setProfile((current) => ({ ...current, features: current.features.filter((item) => item.id !== id) }));
  };

  const selectInstitutionType = (id: LabInstitutionType) => {
    updateProfile("institutionType", id);
  };

  const toggleResearchField = (id: string) => {
    setProfile((current) => ({
      ...current,
      researchFieldIds: current.researchFieldIds.includes(id)
        ? current.researchFieldIds.filter((x) => x !== id)
        : [...current.researchFieldIds, id],
    }));
  };

  const selectStaffScale = (id: ResearchStaffScale) => {
    updateProfile("staffScale", profile.staffScale === id ? "" : id);
  };

  const saveProfile = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div>
      {saved ? (
        <div className="fixed right-6 top-[84px] z-[80] border border-[#cfd8e3] bg-white px-5 py-3 text-[13px] font-medium text-[#303946] shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
          연구기관 정보가 저장되었습니다.
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-5 max-[760px]:flex-col">
        <div>
          <PageBreadcrumb items={[{ label: "기업센터", href: "/business/dashboard" }, { label: "기업관리" }, { label: "연구기관 정보 관리" }]} />
          <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">연구기관 정보 관리</h1>
          <p className="mt-2 text-[13px] font-normal text-[#68717e]">채용공고와 연구기관 상세 페이지에 표시되는 기관 정보를 관리합니다.</p>
        </div>
        <div className="flex shrink-0 gap-2 max-[760px]:w-full">
          <span className="inline-flex h-11 items-center justify-center gap-2 border border-[#e2e8ef] bg-[#f7f8fa] px-4 text-[13px] font-medium text-[#a4adba] cursor-not-allowed max-[760px]:flex-1">
            브랜드 페이지 미리보기 준비 중
            <ExternalLink size={15} />
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        <SectionCard
          id="verification"
          title={
            <span className="inline-flex items-center gap-2">
              인증 정보
              <InfoTooltip text="인증 정보는 승인 상태와 인증 배지에 사용됩니다. 변경이 필요한 경우 변경 요청을 보내주시면 운영팀 검토 후 반영됩니다." />
            </span>
          }
          action={<span className="inline-flex h-7 items-center border border-[#cfd8e3] bg-[#f7f8fa] px-2.5 text-[12px] font-medium text-[#303946]">기관 인증 완료</span>}
        >
          <div className="grid grid-cols-3 border border-[#dfe4ea] max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            {[
              ["사업자등록번호", profile.businessNumber],
              ["기관명", profile.institutionName],
              ["대표자명", profile.representativeName],
            ].map(([label, value]) => (
              <div key={label} className="border-r border-[#dfe4ea] px-4 py-4 last:border-r-0 max-[900px]:border-b">
                <p className="text-[11px] font-medium text-[#8a94a3]">{label}</p>
                <p className="mt-2 text-[13px] font-medium text-[#17202c]">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_2fr] border border-t-0 border-[#dfe4ea] max-[900px]:grid-cols-1">
            <div className="border-r border-[#dfe4ea] px-4 py-4 max-[900px]:border-b max-[900px]:border-r-0">
              <p className="text-[11px] font-medium text-[#8a94a3]">기관 고유번호</p>
              <p className="mt-2 text-[13px] font-medium text-[#17202c]">{profile.institutionCode}</p>
            </div>
            <div className="px-4 py-4">
              <p className="text-[11px] font-medium text-[#8a94a3]">사업자등록증명원</p>
              <p className="mt-2 text-[13px] font-medium text-[#17202c]">{statusLabel(profile.businessLicenseFile.status)}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/support" className="inline-flex h-10 items-center gap-1.5 border border-[#d8e0e8] bg-white px-3.5 text-[12px] font-medium text-[#303946] hover:border-[#111111]">
              기관 정보 변경 요청
              <ExternalLink size={13} />
            </Link>
          </div>
        </SectionCard>

        <SectionCard id="basic-info" title="기본 정보">
          <div className={FIELD_GROUP_GAP}>
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
            <div className="space-y-2">
              <FieldLabel required>설립 연도</FieldLabel>
              <TextInput value={profile.foundedYear} onChange={(value) => updateProfile("foundedYear", value)} />
            </div>
            <div className="space-y-2">
              <FieldLabel>홈페이지</FieldLabel>
              <TextInput value={profile.homepageUrl} onChange={(value) => updateProfile("homepageUrl", value)} />
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
        </SectionCard>

        <SectionCard id="research-environment" title="연구 환경">
          <div className={FIELD_GROUP_GAP}>
            <div className="space-y-2">
              <FieldLabel required>기관 유형</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {researchInstitutionTypeOptions.map((option) => (
                  <ToggleChip
                    key={option.id}
                    label={option.label}
                    selected={profile.institutionType === option.id}
                    onClick={() => selectInstitutionType(option.id as LabInstitutionType)}
                  />
                ))}
              </div>
              {profile.institutionType === "" ? (
                <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">기관 유형을 선택해 주세요. 연구 분류와 검색에 사용됩니다.</p>
              ) : null}
            </div>

            <div className="space-y-3">
              <FieldLabel>
                연구 분야 <span className="font-normal text-[#9aa3af]">(복수 선택)</span>
              </FieldLabel>
              <div className="space-y-4">
                {researchFieldCategoryOptions.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <p className="text-[11.5px] font-medium text-[#8a94a3]">{category.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub) => (
                        <ToggleChip
                          key={sub.id}
                          label={sub.label}
                          selected={profile.researchFieldIds.includes(sub.id)}
                          onClick={() => toggleResearchField(sub.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">미선택 시 상세 페이지 블록이 노출되지 않습니다.</p>
            </div>

            <div className="space-y-2">
              <FieldLabel>연구 인력 규모</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {researchStaffScaleOptions.map((option) => (
                  <ToggleChip
                    key={option.id}
                    label={option.label}
                    selected={profile.staffScale === option.id}
                    onClick={() => selectStaffScale(option.id)}
                  />
                ))}
              </div>
              {profile.staffScale === "" ? (
                <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">인력 규모를 선택해 주세요. 선택하지 않아도 저장할 수 있습니다.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <FieldLabel>주요 연구 장비·인프라</FieldLabel>
              <textarea
                value={profile.equipmentInfra}
                onChange={(event) => updateProfile("equipmentInfra", event.target.value.slice(0, 2000))}
                maxLength={2000}
                placeholder="보유 장비, 연구시설, 분석 인프라 등을 자유롭게 소개해 주세요."
                className="min-h-[148px] w-full resize-y border border-[#d8e0e8] bg-white px-3.5 py-3 text-[13px] font-normal leading-[1.7] text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
              />
              <div className="flex justify-end">
                <span className="text-[11px] font-medium text-[#8a94a3]">{profile.equipmentInfra.length} / 2000</span>
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>주요 연구 성과</FieldLabel>
              <textarea
                value={profile.achievements}
                onChange={(event) => updateProfile("achievements", event.target.value.slice(0, 2000))}
                maxLength={2000}
                placeholder="논문, 특허, 기술이전, 주요 과제 수행 경험 등을 자유롭게 소개해 주세요."
                className="min-h-[148px] w-full resize-y border border-[#d8e0e8] bg-white px-3.5 py-3 text-[13px] font-normal leading-[1.7] text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
              />
              <div className="flex justify-end">
                <span className="text-[11px] font-medium text-[#8a94a3]">{profile.achievements.length} / 2000</span>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard id="profile" title="공개 프로필">
          <div>
            <div className="flex items-start gap-4">
              <div className="h-[118px] w-[118px] shrink-0 border border-[#dfe4ea] bg-[#fbfcfd] p-3">
                <ImageMark url={profile.logoUrl} alt={`${profile.institutionName} 로고`} fallback={profile.institutionName} />
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
                <img src={profile.coverImageUrl} alt={`${profile.institutionName} 상단 대표 이미지`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-[#a7afba]">
                  <ImageIcon size={22} />
                  <span className="text-[12px] font-medium">상단 대표 이미지를 등록해 주세요</span>
                </div>
              )}
            </div>
            <input ref={coverUpload.inputRef} type="file" accept="image/*" onChange={coverUpload.handleChange} className="hidden" />
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <FieldLabel required>한 줄 소개</FieldLabel>
              <span className="shrink-0 text-[11px] font-medium text-[#8a94a3]">{profile.shortIntro.length} / 60</span>
            </div>
            <TextInput value={profile.shortIntro} onChange={(value) => updateProfile("shortIntro", value.slice(0, 60))} placeholder="예: 신약 타깃 발굴부터 중개연구까지 수행하는 연구기관" />
          </div>

          <div className="mt-6">
            <FieldLabel>기관 특징</FieldLabel>
            <div className="mt-3 space-y-2.5">
              {profile.features.length > 0 ? (
                <div className="grid grid-cols-[1fr_2fr_44px] items-end gap-x-3 gap-y-1.5 max-[560px]:hidden">
                  <p className="text-[11px] font-medium text-[#8a94a3]">제목</p>
                  <p className="text-[11px] font-medium text-[#8a94a3]">내용</p>
                  <div aria-hidden />
                </div>
              ) : null}
              {profile.features.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[1fr_2fr_44px] items-end gap-x-3 gap-y-1.5 max-[560px]:grid-cols-1">
                  <input
                    value={item.label}
                    onChange={(event) => updateFeatureItem(item.id, "label", event.target.value)}
                    placeholder="핵심 인프라"
                    aria-label={`기관 특징 ${index + 1} 제목`}
                    className="h-11 min-w-0 border border-[#d8e0e8] bg-white px-3 text-[13px] font-medium outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
                  />
                  <input
                    value={item.text}
                    onChange={(event) => updateFeatureItem(item.id, "text", event.target.value)}
                    placeholder="차세대 시퀀싱·이미징 코어 시설 보유"
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
            {profile.features.length < MAX_FEATURES ? (
              <div className="mt-3">
                <FormActionButton onClick={addFeatureItem}>
                  <Plus size={14} />
                  항목 추가
                </FormActionButton>
              </div>
            ) : null}
            <p className="mt-2 text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">기관 상세 페이지에 표시됩니다. 최대 6개</p>
          </div>

          <div className="mt-6 space-y-2">
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
        </SectionCard>

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

        <div className="sticky bottom-0 z-30 min-h-[64px] border-t border-[#dfe4ea] bg-white/95 px-6 py-4 shadow-[0_-4px_16px_rgba(20,32,46,0.08)] backdrop-blur max-[760px]:px-4">
          <div className="flex items-center justify-between gap-4 max-[640px]:flex-col">
            <p className="text-[12px] font-normal text-[#7b8491]">저장되지 않은 변경사항이 있습니다</p>
            <div className="flex gap-2 max-[640px]:w-full">
              <span className="inline-flex h-11 items-center justify-center border border-[#e2e8ef] bg-[#f7f8fa] px-7 text-[13px] font-medium text-[#a4adba] cursor-not-allowed max-[640px]:flex-1">
                미리보기 준비 중
              </span>
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
