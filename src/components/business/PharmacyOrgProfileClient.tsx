"use client";

import { AlertCircle, ExternalLink, Image as ImageIcon, Info, Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { FieldLabel, FormActionButton, PROFILE_TEXT_FIELD_WIDTH, SectionCard, Segmented, TextInput, ToggleChip } from "@/components/business/BusinessFormControls";
import { getPharmacyTypeLabel, pharmacyTypeLabels } from "@/config/companyTypes";
import { readSignupPharmacyFeatureId, readSignupPharmacyType } from "@/config/businessSignup";
import { pharmacyFeatureOptions } from "@/config/jobFilters/pharmacyFilters";
import { type FileStatus, type OrgManager } from "@/data/businessCompanyProfile";
import {
  dispensingEquipmentOptions,
  initialPharmacyOrgManager,
  initialPharmacyOrgProfile,
  pharmacySoftwareOptions,
  savePharmacyOrgProfileDraft,
  type PharmacyOrgProfile,
} from "@/data/businessOrgProfile";
import type { PharmacyType } from "@/types/jobs";

/** 카드 내부 필드 그룹 간 세로 간격 — 산업/병원과 동일(STEP 4-c 기준) */
const FIELD_GROUP_GAP = "space-y-6";
/** 2열 필드(개국 연도 옆 대표 약사명 등)의 공통 grid 규칙 — 산업/병원과 동일 */
const FIELD_GRID_2COL = "grid grid-cols-2 gap-4 max-[640px]:grid-cols-1";
/** 기관 키워드 최대 개수 — 산업/병원(HospitalOrgProfileClient)과 동일 */
const MAX_KEYWORDS = 8;
/** 주요 처방 병원 태그 최대 개수 */
const MAX_HOSPITALS = 10;
/** 로고·상단 대표 이미지 "이미지 변경/등록" 버튼 전용 — 산업/병원과 동일 스타일 복제 */
const IMAGE_ACTION_BUTTON = "h-8 shrink-0 whitespace-nowrap border border-[#e2e8ef] bg-white px-3 text-[11.5px] font-medium text-[#4f5967] transition hover:border-[#111111] hover:text-[#111111]";
/** 텍스트 버튼(삭제 등) — 산업/병원과 동일 스타일 복제 */
const TEXT_BUTTON = "text-[12px] font-medium text-[#8a94a3] underline-offset-2 hover:text-[#111111] hover:underline";

function statusLabel(status: FileStatus) {
  if (status === "approved") return "제출 완료 · 검토 승인";
  if (status === "pending") return "검토 중";
  if (status === "rejected") return "반려";
  return "변경 요청 필요";
}

/** 필수 필드 에러 메시지 — job-registration 폼(PharmacyJobPostingForm 등)의 FieldError와 동일 스타일 */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1 text-[12px] text-danger">
      <AlertCircle size={12} aria-hidden />
      {message}
    </p>
  );
}

/** 로고 박스 표시 — 산업/병원과 동일 구현 복제 */
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

/** 로고·상단 대표 이미지 변경 버튼 — 산업/병원과 동일 구현 복제 */
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

export function PharmacyOrgProfileClient() {
  const [profile, setProfile] = useState<PharmacyOrgProfile>(initialPharmacyOrgProfile);
  const [manager, setManager] = useState<OrgManager>(initialPharmacyOrgManager);
  const [saved, setSaved] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newHospital, setNewHospital] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateProfile = <K extends keyof PharmacyOrgProfile>(key: K, value: PharmacyOrgProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const updateManager = <K extends keyof OrgManager>(key: K, value: OrgManager[K]) => {
    setManager((current) => ({ ...current, [key]: value }));
  };

  const updateVisibility = (key: keyof PharmacyOrgProfile["visibilitySettings"], value: boolean) => {
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

  const addHospital = () => {
    const value = newHospital.trim();
    if (!value || profile.mainHospitals.includes(value) || profile.mainHospitals.length >= MAX_HOSPITALS) return;
    updateProfile("mainHospitals", [...profile.mainHospitals, value]);
    setNewHospital("");
  };

  const removeHospital = (value: string) => {
    updateProfile("mainHospitals", profile.mainHospitals.filter((item) => item !== value));
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

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!profile.pharmacyFeatureIds) next.pharmacyFeatureIds = "약국 특성을 선택해 주세요.";
    if (!profile.software.trim()) next.software = "전산 프로그램을 입력해 주세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const saveProfile = () => {
    if (!validate()) return;
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  // 미리보기는 별도 라우트(/business/company/preview)라 props를 직접 넘길 수 없다 — 이동 직전 sessionStorage에
  // 편집 중인 state를 남겨 미리보기 화면이 읽어가게 한다(서버 저장 아님, 클라이언트 내에서만).
  const goToPreview = () => {
    savePharmacyOrgProfileDraft(profile);
  };

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
          <Link href="/business/company/preview?track=pharmacy" onClick={goToPreview} className="inline-flex h-11 items-center justify-center gap-2 border border-[#cfd8e3] bg-white px-4 text-[13px] font-medium text-[#303946] hover:border-[#111111] max-[760px]:flex-1">
            브랜드 페이지 미리보기
            <ExternalLink size={15} />
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        <SectionCard
          id="verification"
          title="인증 정보"
          action={<span className="inline-flex h-7 items-center border border-[#cfd8e3] bg-[#f7f8fa] px-2.5 text-[12px] font-medium text-[#303946]">약국 인증 완료</span>}
        >
          <div className="grid grid-cols-3 border border-[#dfe4ea] max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            {[
              ["사업자등록번호", profile.businessNumber],
              ["약국명", profile.pharmacyName],
              ["대표자명", profile.representativeName],
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
              ["약사면허증", statusLabel(profile.pharmacistLicenseFile.status)],
            ].map(([label, value]) => (
              <div key={label} className="border-r border-[#dfe4ea] px-4 py-4 last:border-r-0 max-[900px]:border-b">
                <p className="text-[11px] font-medium text-[#8a94a3]">{label}</p>
                <p className="mt-2 text-[13px] font-medium text-[#17202c]">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/support" className="inline-flex h-10 items-center gap-1.5 border border-[#d8e0e8] bg-white px-3.5 text-[12px] font-medium text-[#303946] hover:border-[#111111]">
              약국 정보 변경 요청
              <ExternalLink size={13} />
            </Link>
          </div>
        </SectionCard>

        <SectionCard id="pharmacy-info" title="약국 정보">
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
              <FieldLabel required>약국 특성</FieldLabel>
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
              <FieldError message={errors.pharmacyFeatureIds} />
            </div>
          </div>

          <div className="mt-6 border-t border-[#f0f2f5] pt-6">
            <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#303946]">기본 사항·연락처</h3>
            <div className="mt-4 space-y-5">
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
              <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                <div className="space-y-2">
                  <FieldLabel>개국 연도</FieldLabel>
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

        <SectionCard id="profile" title="공개 프로필">
          <div>
            <div className="flex items-start gap-4">
              <div className="h-[118px] w-[118px] shrink-0 border border-[#dfe4ea] bg-[#fbfcfd] p-3">
                <ImageMark url={profile.logoUrl} alt={`${profile.pharmacyName} 로고`} fallback={profile.pharmacyName} />
              </div>
              <div className="flex-1 pt-0.5">
                <FieldLabel>로고</FieldLabel>
                <p className="mt-1.5 flex items-center gap-1 text-[12px] font-normal leading-[1.55] text-[#9aa3af]">
                  <Info size={12} className="shrink-0" aria-hidden />
                  등록하지 않으실 경우, 첫 두 글자로 로고가 자동생성됩니다.
                </p>
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
                <img src={profile.coverImageUrl} alt={`${profile.pharmacyName} 상단 대표 이미지`} className="h-full w-full object-cover" />
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
            <TextInput value={profile.shortIntro} onChange={(value) => updateProfile("shortIntro", value.slice(0, 60))} placeholder="예: 내과·이비인후과 의원 처방을 주로 조제하는 의원층 약국" />
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <FieldLabel>본문 소개</FieldLabel>
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

        <SectionCard id="work-environment" title="조제 환경">
          <div className={FIELD_GROUP_GAP}>
            <div className={FIELD_GRID_2COL}>
              <div className="space-y-2">
                <FieldLabel>일 평균 처방</FieldLabel>
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
              <div className="space-y-2">
                <FieldLabel>주요 처방과</FieldLabel>
                <TextInput value={profile.mainDepartments} onChange={(value) => updateProfile("mainDepartments", value)} placeholder="예: 내과 · 이비인후과 · 정형외과" />
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel required>전산 프로그램</FieldLabel>
              <Segmented value={profile.software} options={pharmacySoftwareOptions.map((label) => ({ id: label, label }))} onChange={(value) => updateProfile("software", value)} />
              <FieldError message={errors.software} />
            </div>
            <div className="space-y-2">
              <FieldLabel>조제 장비</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {dispensingEquipmentOptions.map((item) => (
                  <ToggleChip key={item} label={item} selected={profile.dispensingEquipment.includes(item)} onClick={() => toggleDispensingEquipment(item)} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>주요 처방 병원</FieldLabel>
              {profile.mainHospitals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.mainHospitals.map((hospital) => (
                    <button
                      key={hospital}
                      type="button"
                      onClick={() => removeHospital(hospital)}
                      aria-label={`${hospital} 삭제`}
                      className="inline-flex h-9 items-center gap-1.5 border border-[#111111] bg-[#111111] px-3.5 text-[12px] font-medium text-white"
                    >
                      {hospital}
                      <X size={12} className="opacity-70" aria-hidden />
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <input
                  value={newHospital}
                  onChange={(event) => setNewHospital(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addHospital();
                    }
                  }}
                  disabled={profile.mainHospitals.length >= MAX_HOSPITALS}
                  placeholder="예: 삼성서울병원"
                  className="h-11 min-w-0 flex-1 border border-[#d8e0e8] px-3 text-[13px] font-medium outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8 disabled:bg-[#f5f6f7] disabled:text-[#a4adba]"
                />
                <FormActionButton onClick={addHospital} disabled={profile.mainHospitals.length >= MAX_HOSPITALS}>
                  <Plus size={14} />
                  추가
                </FormActionButton>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">주로 처방전을 받는 병원을 추가해 주세요. 최대 10개</p>
                {profile.mainHospitals.length > 0 ? (
                  <span className="shrink-0 text-[11px] font-medium text-[#8a94a3]">{profile.mainHospitals.length} / {MAX_HOSPITALS}</span>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>주차·교통</FieldLabel>
              <TextInput value={profile.parkingTransit} onChange={(value) => updateProfile("parkingTransit", value)} placeholder="예: 건물 주차 2시간 무료 · 양지IC 5분" />
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
              <Link href="/business/company/preview?track=pharmacy" onClick={goToPreview} className="inline-flex h-11 items-center justify-center border border-[#cfd8e3] bg-white px-7 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] max-[640px]:flex-1">
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
