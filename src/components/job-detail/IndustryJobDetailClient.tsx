"use client";

import clsx from "clsx";
import {
  Award,
  BadgeCheck,
  Bookmark,
  Briefcase,
  Building2,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  ExternalLink,
  Factory,
  FileText,
  GraduationCap,
  Heart,
  Info,
  Layers,
  Newspaper,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import {
  ActionIconButton,
  ApplyCard,
  type ApplyMethodId,
  CompanyLogo,
  firstWords,
  FormattedContentView,
  HeaderTag,
  IconSectionShell,
  JobDetailActionRow,
  MapPlaceholder,
  SummaryStatCell,
  SummaryStatGrid,
  useStickySidebarTop,
} from "@/components/job-detail/shared";
import type { IndustryJobDetail } from "@/data/industryJobDetails";
import { getIndustryNews, hasDirectCompanyNews } from "@/data/industryNews";
import { getIndustryJobCoverImage } from "@/utils/industryImage";

// ── Main component ─────────────────────────────────────────────────────────────

export function IndustryJobDetailClient({ data }: { data: IndustryJobDetail }) {
  const { job, org, businessContext } = data;

  // 검증용 mock 로그인 토글 — 실제 세션 연결은 추후 처리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [interested, setInterested] = useState(false);
  const { ref: sidebarRef, top: sidebarTop } = useStickySidebarTop();

  const heroImage = getIndustryJobCoverImage(data.slug);

  const heroTags = job.tags;
  const heroSubline = `${firstWords(job.location.address, 2)} · ${job.employmentType} · ${job.workMode}`;
  const workModeDisplay = job.workMode;

  const headcountDisplay = job.deadline.status === "always" ? "상시 모집" : job.headcount;

  const hasPositionIntro = Boolean(job.positionIntro);
  const hasResponsibilities = Boolean(job.responsibilities && job.responsibilities.items.length > 0);
  const hasRequirements = Boolean(job.requirements && job.requirements.items.length > 0);
  const hasPreferred = Boolean(job.preferred && job.preferred.items.length > 0);
  const hasQualificationsSection = hasRequirements || hasPreferred;

  const businessFieldsLabel = businessContext?.businessFields?.length ? businessContext.businessFields.join(" · ") : "";
  const hasProducts = Boolean(businessContext?.products && businessContext.products.length > 0);

  const hasBenefits = Boolean(job.benefits && job.benefits.length > 0);
  const hasWorkConditionDetail = Boolean(job.workConditionDetail);
  const hasWorkConditionsSection =
    Boolean(job.workMode) || hasBenefits || hasWorkConditionDetail || Boolean(job.location.address);

  const hasDetailImages = Boolean(job.detailImages && job.detailImages.length > 0);
  const hasAttachments = Boolean(job.attachments && job.attachments.length > 0);
  const hasAdditionalNotes = Boolean(job.additionalNotes);
  const hasAdditionalInfoSection = hasDetailImages || hasAttachments || hasAdditionalNotes;

  const hasOrgDescription = Boolean(org.description);
  const hasKeywords = Boolean(org.keywords && org.keywords.length > 0);
  const hasCompanyCards = Boolean(org.orgType) || Boolean(org.employeeCount) || Boolean(businessFieldsLabel);

  const newsItems = getIndustryNews(data.companyId);
  const hasDirectNews = hasDirectCompanyNews(data.companyId);

  return (
    <>
      {/* 검증용 로그인 토글 (실 서비스에는 없음) */}
      <button
        type="button"
        onClick={() => setIsLoggedIn((v) => !v)}
        className="fixed right-4 top-4 z-50 border border-[#d7dce2] bg-white px-3 py-1.5 text-[12px] font-medium text-[#4f5967] shadow-[var(--shadow)] hover:border-brand"
      >
        {isLoggedIn ? "로그인됨 (클릭: 로그아웃 보기)" : "비로그인 (클릭: 로그인 보기)"}
      </button>

      <main className="bg-[#f5f6f7] pb-28 pt-6">
        <div className="app-shell">
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_318px] gap-6 max-[1120px]:grid-cols-1">
            {/* ── 본문 ──────────────────────────────────────────────────── */}
            <div className="min-w-0 space-y-5">
              {/* 히어로 */}
              <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-white shadow-[var(--shadow)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt=""
                  className="h-[286px] w-full object-cover max-[720px]:h-[210px]"
                />
                <div className="px-7 pb-7 pt-6 max-[720px]:px-5">
                  <JobDetailActionRow
                    orgName={org.name}
                    showLogo
                    logoUrl={org.logoUrl}
                    saved={saved}
                    onToggleSave={() => setSaved((v) => !v)}
                    interested={interested}
                    onToggleInterest={() => setInterested((v) => !v)}
                    onShare={() => {}}
                  />
                  <p className="mt-3 text-[15px] font-normal text-[#667181]">{heroSubline}</p>
                  <h1 className="mt-2 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#1f2733] max-[720px]:text-[25px]">
                    {job.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {heroTags.map((tag) => (
                      <HeaderTag key={tag}>{tag}</HeaderTag>
                    ))}
                  </div>
                  <p className="mt-4 max-w-[760px] text-[16px] font-normal leading-[1.65] text-[#667181]">
                    {job.oneLineIntro}
                  </p>
                </div>
              </section>

              {/* 포지션 소개 */}
              {hasPositionIntro ? (
                <IconSectionShell id="position-intro" icon={FileText} title="포지션 소개">
                  <FormattedContentView content={{ format: "paragraph", items: [job.positionIntro as string] }} />
                </IconSectionShell>
              ) : null}

              {/* 공고 상세 */}
              <IconSectionShell id="summary" icon={ClipboardList} title="공고 상세">
                <SummaryStatGrid>
                  <SummaryStatCell
                    icon={Layers}
                    label="모집 직무"
                    value={`${job.jobCategory.main} · ${job.jobCategory.sub}`}
                  />
                  <SummaryStatCell icon={Users} label="모집 인원" value={headcountDisplay} />
                  <SummaryStatCell icon={Wallet} label="급여" value={job.salary} />
                  <SummaryStatCell
                    icon={Briefcase}
                    label="고용형태"
                    value={
                      <span className="inline-flex items-center gap-2">
                        {job.employmentType}
                        {job.isLeadership ? (
                          <span className="inline-flex items-center border border-[#d7dce2] bg-[#f7f8fa] px-1.5 py-0.5 text-[11px] font-medium text-[#667181]">
                            리더급
                          </span>
                        ) : null}
                      </span>
                    }
                  />
                  <SummaryStatCell icon={Award} label="경력조건" value={job.career} />
                  <SummaryStatCell icon={GraduationCap} label="학력조건" value={job.education} />
                </SummaryStatGrid>
              </IconSectionShell>

              {/* 주요 업무 */}
              {hasResponsibilities ? (
                <IconSectionShell id="duties" icon={ClipboardCheck} title="주요 업무">
                  <FormattedContentView content={job.responsibilities} />
                </IconSectionShell>
              ) : null}

              {/* 자격 요건 및 우대사항 */}
              {hasQualificationsSection ? (
                <IconSectionShell id="qualifications" icon={BadgeCheck} title="자격 요건 및 우대사항">
                  <div className="space-y-7">
                    {hasRequirements ? (
                      <div>
                        <h3 className="text-[15px] font-bold text-[#2f3845]">필수 요건</h3>
                        <div className="mt-3">
                          <FormattedContentView content={job.requirements} />
                        </div>
                      </div>
                    ) : null}
                    {hasPreferred ? (
                      <div>
                        <h3 className="text-[15px] font-bold text-[#2f3845]">우대사항</h3>
                        <div className="mt-3">
                          <FormattedContentView content={job.preferred} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </IconSectionShell>
              ) : null}

              {/* 근무 조건 (상세 근무조건 + 위치·교통 통합) */}
              {hasWorkConditionsSection ? (
                <IconSectionShell id="conditions" icon={CalendarClock} title="근무 조건">
                  <div className="space-y-7">
                    <div>
                      <h3 className="text-[15px] font-bold text-[#2f3845]">근무방식</h3>
                      <p className="mt-2.5 text-[16px] font-normal leading-[1.85] text-[#3f4855]">
                        {workModeDisplay}
                      </p>
                    </div>
                    {hasBenefits ? (
                      <div className="border-t border-[#edf1f4] pt-6">
                        <h3 className="text-[15px] font-bold text-[#2f3845]">복리후생</h3>
                        <p className="mt-2.5 text-[16px] font-normal leading-[1.85] text-[#3f4855]">
                          {job.benefits!.join(" · ")}
                        </p>
                      </div>
                    ) : null}
                    {hasWorkConditionDetail ? (
                      <div className="border-t border-[#edf1f4] pt-6">
                        <h3 className="text-[15px] font-bold text-[#2f3845]">근무 안내</h3>
                        <div className="mt-3">
                          <FormattedContentView content={{ format: "paragraph", items: [job.workConditionDetail as string] }} />
                        </div>
                      </div>
                    ) : null}
                    <div className="border-t border-[#edf1f4] pt-6">
                      <h3 className="text-[15px] font-bold text-[#2f3845]">근무지역</h3>
                      <div className="mt-3 space-y-4">
                        <p className="text-[15px] font-bold text-[#2f3845]">{job.location.address}</p>
                        <MapPlaceholder address={job.location.address} orgName={org.name} />
                      </div>
                    </div>
                  </div>
                </IconSectionShell>
              ) : null}

              {/* 추가 안내 */}
              {hasAdditionalInfoSection ? (
                <IconSectionShell id="additional-info" icon={Info} title="추가 안내">
                  <div className="space-y-7">
                    {hasDetailImages ? (
                      <div>
                        <h3 className="text-[15px] font-bold text-[#2f3845]">상세 이미지</h3>
                        <div className="mt-3 space-y-3">
                          {job.detailImages!.map((url) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={url} src={url} alt="" className="w-full border border-[#e2e8ef] object-cover" />
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {hasAttachments ? (
                      <div className={clsx(hasDetailImages && "border-t border-[#edf1f4] pt-6")}>
                        <h3 className="text-[15px] font-bold text-[#2f3845]">첨부파일</h3>
                        <div className="mt-3 space-y-2">
                          {job.attachments!.map((file) => (
                            <a
                              key={file.url}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3 text-[13px] font-medium text-[#4f5967] transition hover:border-brand hover:text-brand"
                            >
                              <FileText size={14} aria-hidden />
                              {file.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {hasAdditionalNotes ? (
                      <div className={clsx((hasDetailImages || hasAttachments) && "border-t border-[#edf1f4] pt-6")}>
                        <FormattedContentView content={{ format: "paragraph", items: [job.additionalNotes as string] }} />
                      </div>
                    ) : null}
                  </div>
                </IconSectionShell>
              ) : null}

              {/* 기업 정보 */}
              <IconSectionShell id="company" icon={Building2} title="기업 정보">
                {/* A. 기업 요약 + 관심기업 */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <CompanyLogo name={org.name} logoText="" logoUrl={org.logoUrl} size="lg" />
                    <div>
                      <p className="text-[17px] font-bold text-[#1f2733]">{org.name}</p>
                      <p className="mt-1.5 text-[15px] font-medium leading-[1.5] text-[#2f3845]">{org.shortIntro}</p>
                      {hasOrgDescription ? (
                        <p className="mt-2 text-[14px] font-normal leading-relaxed text-[#3f4855]">{org.description}</p>
                      ) : null}
                    </div>
                  </div>
                  <ActionIconButton
                    label="관심기업 저장"
                    onClick={() => setInterested((v) => !v)}
                    active={interested}
                  >
                    <Heart size={17} fill={interested ? "currentColor" : "none"} />
                  </ActionIconButton>
                </div>

                {/* B. 기관 키워드 — 요약 바로 아래, 구분선 없음 */}
                {hasKeywords ? (
                  <div className="mt-3 flex flex-wrap gap-x-2.5 gap-y-1.5">
                    {org.keywords!.map((keyword) => (
                      <span key={keyword} className="text-[13px] font-medium text-[#667181]">
                        #{keyword}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* D. 기업 유형 · 직원 수 · 사업·제품 분야 */}
                {hasCompanyCards ? (
                  <div className="mt-9">
                    <SummaryStatGrid>
                      {org.orgType ? <SummaryStatCell icon={Building2} label="기업 유형" value={org.orgType} /> : null}
                      {org.employeeCount ? <SummaryStatCell icon={Users} label="직원 수" value={org.employeeCount} /> : null}
                      {businessFieldsLabel ? (
                        <SummaryStatCell icon={Factory} label="사업·제품 분야" value={businessFieldsLabel} />
                      ) : null}
                    </SummaryStatGrid>
                  </div>
                ) : null}

                {/* E. 대표 제품·서비스 */}
                {hasProducts ? (
                  <div className="mt-9">
                    <h3 className="text-[15px] font-bold text-[#2f3845]">대표 제품·서비스</h3>
                    <div className="mt-3 space-y-3">
                      {businessContext!.products!.map((product) => (
                        <div key={product.name} className="rounded-[var(--radius)] border border-[#e2e8ef] bg-[#fbfcfd] px-5 py-4">
                          <p className="text-[15px] font-bold text-[#2f3845]">{product.name}</p>
                          <p className="mt-1.5 text-[14px] font-normal leading-relaxed text-[#3f4855]">{product.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* C. CTA 버튼 3개 — 섹션 맨 아래, 이번 단계에서는 링크 연결 없음 */}
                <div className="mt-9 flex flex-wrap gap-2 max-[640px]:flex-col">
                  <button
                    type="button"
                    className="inline-flex h-11 flex-1 items-center justify-center bg-brand px-5 text-[14px] font-semibold text-white transition hover:bg-[var(--color-brand-dark)]"
                  >
                    기업 정보 더보기
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-11 flex-1 items-center justify-center border border-border bg-white px-5 text-[14px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
                  >
                    기업 리뷰 보기
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-11 flex-1 items-center justify-center border border-border bg-white px-5 text-[14px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
                  >
                    면접 후기 보기
                  </button>
                </div>
              </IconSectionShell>

              {/* 관련 뉴스 */}
              {newsItems.length > 0 ? (
                <IconSectionShell id="news" icon={Newspaper} title="관련 뉴스">
                  {hasDirectNews ? (
                    <p className="text-[14px] font-normal leading-[1.7] text-[#667181]">
                      더파마뉴스에 보도된 기업 관련 기사와 산업 뉴스를 확인해 보세요.
                    </p>
                  ) : (
                    <div className="flex items-start gap-1.5">
                      <Info size={14} className="mt-0.5 shrink-0 text-[#8993a1]" />
                      <p className="text-[13px] font-normal leading-[1.6] text-[#8993a1]">
                        아직 이 기업과 직접 관련된 기사가 없습니다. 관련된 제약·바이오 산업 뉴스를 확인해 보세요.
                      </p>
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
                    {newsItems.map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block border border-[#e2e8ef] bg-white transition hover:border-brand"
                      >
                        <div className="relative h-[140px] w-full bg-[#f0f2f5]">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : null}
                          <span className="absolute left-2.5 top-2.5 bg-white/90 px-2 py-1 text-[11px] font-medium text-[#566171]">
                            {item.category}
                          </span>
                        </div>
                        <div className="px-4 py-4">
                          <p className="text-[12px] font-medium text-[#8993a1]">
                            {item.date} · {item.source}
                          </p>
                          <h3 className="mt-2 line-clamp-2 min-h-[42px] text-[15px] font-bold leading-[1.4] text-[#2f3845]">
                            {item.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-[13px] font-normal leading-[1.6] text-[#667181]">
                            {item.summary}
                          </p>
                          <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[#566171] group-hover:text-brand">
                            기사 보기
                            <ExternalLink size={13} />
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </IconSectionShell>
              ) : null}
            </div>

            {/* ── 사이드바 ──────────────────────────────────────────────── */}
            <aside
              ref={sidebarRef}
              style={{ top: sidebarTop }}
              className="sticky self-start h-fit space-y-3 max-[1120px]:static max-[720px]:hidden"
            >
              <ApplyCard
                deadlineLabel={job.deadline.label}
                method={job.apply.method as ApplyMethodId}
                target={job.apply.target}
                notice={job.apply.notice}
                isLoggedIn={isLoggedIn}
              />

              <section className="rounded-[var(--radius)] border border-border bg-white px-5 py-5 shadow-[var(--shadow)]">
                <div className="space-y-2.5">
                  {[
                    ["급여", job.salary],
                    ["근무", workModeDisplay],
                    ["지역", firstWords(job.location.address, 2)],
                    ["고용형태", job.employmentType],
                    ["직무", job.jobCategory.sub],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <span className="text-[13px] font-medium text-[#8993a1]">{label}</span>
                      <span className="text-[14px] font-normal text-[#3f4855]">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 border-t border-[#f0f2f5] pt-3">
                  {job.coreKeywords.slice(0, 6).map((keyword) => (
                    <span key={keyword} className="text-[12px] font-medium text-[#667181]">
                      #{keyword}
                    </span>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white px-4 py-3 shadow-[0_-8px_20px_rgba(20,32,46,0.08)] md:hidden">
        <div className="mx-auto grid max-w-[560px] grid-cols-[92px_1fr] gap-2">
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            className={clsx(
              "flex h-12 items-center justify-center gap-1.5 border bg-white text-[13px] font-medium",
              saved ? "border-brand text-brand" : "border-border text-[#4f5a66]",
            )}
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
            저장
          </button>
          <button type="button" className="flex h-12 items-center justify-center gap-2 bg-brand text-[14px] font-medium text-white">
            지원하기
          </button>
        </div>
      </div>
    </>
  );
}
