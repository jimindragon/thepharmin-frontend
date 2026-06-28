"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bookmark, Copy, FileCheck, ListChecks, Phone, Share2, Sparkles } from "lucide-react";
import type { Company, Job, JobWorkShift } from "@/types/jobs";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import {
  ActionIconButton,
  CompanyLogo,
  DefaultCover,
  FormattedContentView,
  HeaderTag,
  MapBox,
  OverviewCard,
  SectionShell,
  SimilarJobs,
  VerifiedBadge,
  careerLabel,
  deadlineDetail,
  deadlineLabel,
  getCoverImage,
  readSavedJobs,
  writeSavedJobs,
} from "@/components/job-detail/shared";
import { formatWon } from "@/utils/salary";

interface PharmacyJobDetailClientProps {
  job: Job;
  company: Company | null;
  similarJobs: Job[];
}

interface SectionItem {
  id: string;
  label: string;
  visible: boolean;
}

/** 근무 옵션별로 한 줄 요약 + 비고를 풀어서 bullet로 만든다(옵션별 카드/표는 쓰지 않는다). */
function buildScheduleBullets(shifts?: JobWorkShift[]): string[] {
  if (!shifts?.length) {
    return [];
  }

  const groups = new Map<string, JobWorkShift[]>();
  shifts.forEach((shift) => {
    const key = shift.label ?? "근무 일정";
    const list = groups.get(key) ?? [];
    list.push(shift);
    groups.set(key, list);
  });

  const bullets: string[] = [];
  groups.forEach((rows, label) => {
    bullets.push(`${label}: ${rows.map((row) => `${row.days} ${row.time}`).join(", ")}`);
    const notes = rows.flatMap((row) => (row.note ? row.note.split(",").map((part) => part.trim()) : []));
    Array.from(new Set(notes)).forEach((note) => bullets.push(note));
  });

  return bullets;
}

/** 급여 상세·근무 환경 정보를 "공고 한눈에 보기"의 급여 칸과 중복되지 않는 보충 정보로만 bullet화한다. */
function buildWorkEnvBullets(job: Job): string[] {
  const bullets: string[] = [];
  const detail = job.salaryDetail;
  const env = job.pharmacyEnv;

  if (detail?.weekdayNet != null) bullets.push(`평일 시급: 세후 ${formatWon(detail.weekdayNet)}`);
  if (detail?.weekendNet != null) bullets.push(`주말 시급: 세후 ${formatWon(detail.weekendNet)}`);
  if (detail?.note) bullets.push(detail.note);
  if (env?.atc) bullets.push(`자동조제기: ${env.atc}`);
  if (env?.simpyeong) bullets.push(`심평원 등록 ${env.simpyeong}`);
  if (env?.otherDevices?.length) bullets.push(`기타 자동화기기: ${env.otherDevices.join(", ")}`);
  if (env?.software?.length) bullets.push(`전산 소프트웨어: ${env.software.join(", ")}`);
  if (env?.staff?.pharmacist != null || env?.staff?.support != null) {
    bullets.push(
      [env.staff?.pharmacist != null ? `약사 ${env.staff.pharmacist}명` : null, env.staff?.support != null ? `약무지원 ${env.staff.support}명` : null]
        .filter(Boolean)
        .join(" · "),
    );
  }

  return bullets;
}

/** 주소·교통편을 고정된 표 행이 아닌 줄글 bullet로 만든다. 값이 없는 교통편은 줄 자체를 만들지 않는다. */
function buildLocationBullets(job: Job): string[] {
  const bullets: string[] = [];
  if (job.address) bullets.push(`주소: ${job.address}`);
  if (job.commute?.car) bullets.push(job.commute.car);
  job.commute?.bus?.forEach((line) => bullets.push(line));
  job.commute?.subway?.forEach((line) => bullets.push(line));
  if (job.commute?.parking) bullets.push(`주차 ${job.commute.parking}`);
  return bullets;
}

export function PharmacyJobDetailClient({ job, company, similarJobs }: PharmacyJobDetailClientProps) {
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set());
  const [activeSection, setActiveSection] = useState("intro");
  const [shareMessage, setShareMessage] = useState("");
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);

  useEffect(() => {
    setSavedIds(readSavedJobs());
  }, []);

  const saved = savedIds.has(job.id);
  const coverImage = getCoverImage(job, company);
  const scheduleBullets = useMemo(() => buildScheduleBullets(job.workShifts), [job.workShifts]);
  const workEnvBullets = useMemo(() => buildWorkEnvBullets(job), [job]);
  const locationBullets = useMemo(() => buildLocationBullets(job), [job]);
  const bodyKeywords = (job.coreKeywords?.length ? job.coreKeywords : job.tags).slice(0, 8);

  const overview = useMemo(
    () => [
      { label: "경력", value: careerLabel(job) },
      { label: "학력", value: job.education },
      { label: "모집인원", value: job.headcount ?? "1명" },
      { label: "고용형태", value: job.employmentType },
      { label: "급여", value: job.salary },
      { label: "근무지역", value: job.location },
      { label: "접수마감", value: deadlineDetail(job) },
      { label: "지원방법", value: job.applyInfo?.channels.length ? job.applyInfo.channels.join(" · ") : job.applyMethod },
    ],
    [job],
  );

  const sections: SectionItem[] = [
    { id: "intro", label: "포지션 소개", visible: Boolean(job.introduction || job.oneLineIntro) },
    { id: "details", label: "상세 모집 내용", visible: Boolean(job.details) },
    {
      id: "qualifications",
      label: "업무·자격",
      visible: Boolean(
        job.responsibilitiesContent?.items.length || job.requirementsContent?.items.length || job.preferredContent?.items.length || job.preferredQualifications?.length || job.benefits?.length,
      ),
    },
    { id: "keywords", label: "핵심 키워드", visible: Boolean(bodyKeywords.length) },
    { id: "work", label: "근무조건", visible: true },
    { id: "workenv", label: "근무 환경 안내", visible: Boolean(job.hrTips?.some((qa) => qa.answer)) },
    { id: "company", label: "기업정보", visible: true },
    { id: "similar", label: "비슷한 공고", visible: true },
  ].filter((section) => section.visible);

  useEffect(() => {
    const nodes = sections.map((section) => document.getElementById(section.id)).filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visibleEntry?.target.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      { rootMargin: "-130px 0px -58% 0px", threshold: [0.16, 0.32, 0.48] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  const toggleSave = (jobId: number) => {
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      writeSavedJobs(next);
      return next;
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: job.title, text: `${job.company} ${job.title}`, url });
        setShareMessage("공유를 완료했습니다.");
      } else {
        await navigator.clipboard.writeText(url);
        setShareMessage("공고 링크를 복사했습니다.");
      }
    } catch {
      setShareMessage("공유를 완료하지 못했습니다.");
    }
    window.setTimeout(() => setShareMessage(""), 2200);
  };

  const topTags = [job.role, job.company === company?.name ? company?.industry : job.industry, careerLabel(job), job.education, job.location]
    .filter((tag): tag is string => Boolean(tag))
    .slice(0, 6);

  const applyUrl = `/jobs/${job.slug ?? job.id}/apply`;

  const matchReasons = [
    "직무 일치",
    `${job.location.split(" ")[0]}권 근무지`,
    job.pharmacyWorkTypeIds?.includes("part_time") ? "파트타임 일치" : null,
    job.pharmacyFeatureIds?.includes("prescription_focused") || job.tags.includes("처방조제") ? "처방 조제" : null,
  ]
    .filter((reason): reason is string => Boolean(reason))
    .slice(0, 4);

  return (
    <>
      <main className="bg-[#f5f6f7] pb-28 pt-6">
        <div className="app-shell">
          <PageBreadcrumb items={[{ label: "채용공고", href: "/jobs" }, { label: job.role ?? "공고 상세" }]} />

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_318px] gap-6 max-[1120px]:grid-cols-1">
            <div className="min-w-0 space-y-5">
              <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-white shadow-[var(--shadow)]">
                <div className="px-7 pb-7 pt-7 max-[720px]:px-5">
                  <div className="flex items-start justify-between gap-5 max-[720px]:flex-col">
                    <div className="flex items-center gap-4">
                      <CompanyLogo name={job.company} logoText={job.logoText} logoUrl={company?.logoUrl ?? job.logoUrl} />
                      <div className="flex min-w-0 flex-col items-start gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[15px] font-normal text-[#667181]">{job.company}</p>
                          {company?.verified ? <VerifiedBadge label="약사 인증" /> : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <ActionIconButton label={saved ? "공고 저장 해제" : "공고 저장"} onClick={() => toggleSave(job.id)} active={saved}>
                        <Bookmark size={23} fill={saved ? "currentColor" : "none"} />
                      </ActionIconButton>
                      <ActionIconButton label="공고 공유" onClick={handleShare}>
                        <Share2 size={22} />
                      </ActionIconButton>
                    </div>
                  </div>

                  <h1 className="mt-5 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#1f2733] max-[720px]:text-[25px]">{job.title}</h1>
                  {job.oneLineIntro ? <p className="mt-3 max-w-[760px] text-[16px] font-normal leading-[1.65] text-[#667181]">{job.oneLineIntro}</p> : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {topTags.map((tag) => (
                      <HeaderTag key={tag}>{tag}</HeaderTag>
                    ))}
                  </div>

                  <div className="mt-5">{coverImage ? (
                    <img src={coverImage} alt={`${job.company} 대표 이미지`} className="h-[286px] w-full rounded-[var(--radius)] border border-border object-cover max-[720px]:h-[210px]" />
                  ) : (
                    <DefaultCover job={job} />
                  )}</div>
                </div>
              </section>

              <section className="rounded-[var(--radius)] border border-border bg-white px-7 py-6 shadow-[var(--shadow)] max-[720px]:px-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#242b36]">공고 한눈에 보기</h2>
                  <span className="rounded-[var(--radius)] bg-brand-soft px-3 py-1.5 text-[12px] font-medium text-brand">{deadlineLabel(job)}</span>
                </div>
                <div className="mt-5 grid grid-cols-4 gap-3 max-[1020px]:grid-cols-3 max-[720px]:grid-cols-2">
                  {overview.map((item) => (
                    <OverviewCard key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>
              </section>

              <nav
                data-job-detail-tabs="true"
                className="sticky top-[64px] z-40 overflow-x-auto border-x border-b border-border bg-white/[0.98] backdrop-blur"
                aria-label="공고 섹션 이동"
              >
                <div className="flex min-w-max">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className={clsx(
                        "h-14 shrink-0 border-r border-[#edf1f5] px-6 text-[13px] font-medium transition",
                        activeSection === section.id ? "text-brand shadow-[inset_0_-2px_0_var(--status-positive)]" : "text-[#4f5967] hover:bg-[#f7f8fa] hover:text-[#111111]",
                      )}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </nav>

              {job.introduction || job.oneLineIntro ? (
                <SectionShell id="intro" title="포지션 소개">
                  <p className="max-w-[760px] text-[16px] font-normal leading-[1.85] text-[#3f4855]">{job.introduction ?? job.oneLineIntro}</p>
                </SectionShell>
              ) : null}

              {job.details ? (
                <SectionShell id="details" title="상세 모집 내용">
                  <div className="max-w-[760px] space-y-4 text-[16px] font-normal leading-[1.85] text-[#3f4855]">
                    {job.details.split("\n").map((paragraph, index) =>
                      paragraph ? <p key={index}>{paragraph}</p> : null,
                    )}
                  </div>
                </SectionShell>
              ) : null}

              {job.responsibilitiesContent?.items.length || job.requirementsContent?.items.length || job.preferredContent?.items.length || job.preferredQualifications?.length || job.benefits?.length ? (
                <SectionShell id="qualifications" title="업무·자격">
                  <div className="space-y-7">
                    {job.responsibilitiesContent?.items.length ? (
                      <div>
                        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">주요업무</h3>
                        <div className="mt-3">
                          <FormattedContentView content={job.responsibilitiesContent} />
                        </div>
                      </div>
                    ) : null}
                    {job.requirementsContent?.items.length ? (
                      <div>
                        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">자격요건</h3>
                        <div className="mt-3">
                          <FormattedContentView content={job.requirementsContent} />
                        </div>
                      </div>
                    ) : null}
                    {job.preferredContent?.items.length || job.preferredQualifications?.length ? (
                      <div>
                        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">우대사항</h3>
                        <div className="mt-3">
                          <FormattedContentView content={job.preferredContent} fallback={job.preferredQualifications} />
                        </div>
                      </div>
                    ) : null}
                    {job.benefits?.length ? (
                      <div>
                        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">복리후생</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(benefitsExpanded ? job.benefits : job.benefits.slice(0, 5)).map((benefit) => (
                            <span key={benefit} className="rounded-[var(--radius)] border border-[#e0e0e0] bg-[#f8f8f8] px-3.5 py-2 text-[13px] font-normal text-[#4f5a66]">
                              {benefit}
                            </span>
                          ))}
                          {job.benefits.length > 5 ? (
                            <button
                              type="button"
                              onClick={() => setBenefitsExpanded((v) => !v)}
                              className="border border-brand bg-white px-3.5 py-2 text-[13px] font-medium text-brand transition hover:bg-brand-soft"
                            >
                              {benefitsExpanded ? "접기" : `더 보기 ${job.benefits.length - 5}개`}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </SectionShell>
              ) : null}

              {bodyKeywords.length ? (
                <SectionShell id="keywords" title="핵심 키워드">
                  <div className="flex flex-wrap gap-2">
                    {bodyKeywords.map((keyword) => (
                      <span key={keyword} className="rounded-[var(--radius)] border border-[#dedede] bg-[#f7f7f7] px-3.5 py-2 text-[13px] font-medium text-[#2f3845]">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-[12px] font-medium text-[#8a95a5]">선택된 키워드를 기준으로 유사 공고와 맞춤 추천이 제공됩니다.</p>
                </SectionShell>
              ) : null}

              <SectionShell id="work" title="근무조건">
                <div className="space-y-7">
                  {scheduleBullets.length ? (
                    <div>
                      <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">근무 일정</h3>
                      <div className="mt-3">
                        <FormattedContentView content={{ format: "bullet", items: scheduleBullets }} />
                      </div>
                    </div>
                  ) : null}
                  {workEnvBullets.length ? (
                    <div>
                      <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">처우·근무 환경</h3>
                      <div className="mt-3">
                        <FormattedContentView content={{ format: "bullet", items: workEnvBullets }} />
                      </div>
                    </div>
                  ) : null}
                  <div className="border-t border-[#edf1f4] pt-6">
                    <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">근무지</h3>
                    <div className="mt-3 grid gap-4">
                      <MapBox address={job.address} />
                      {locationBullets.length ? <FormattedContentView content={{ format: "bullet", items: locationBullets }} /> : null}
                    </div>
                  </div>
                </div>
              </SectionShell>

              {job.hrTips?.some((qa) => qa.answer) ? (
                <SectionShell id="workenv" title="근무 환경 안내">
                  <div className="space-y-5">
                    {job.hrTips.filter((qa) => qa.answer).map((qa) => (
                      <div key={qa.question}>
                        <p className="text-[15px] font-bold text-[#2f3845]">{qa.question}</p>
                        <p className="mt-1.5 text-[15px] font-normal leading-[1.75] text-[#3f4855]">{qa.answer}</p>
                      </div>
                    ))}
                  </div>
                </SectionShell>
              ) : null}

              <SectionShell id="company" title="기업정보">
                <div className="flex gap-4 max-[640px]:flex-col">
                  <CompanyLogo
                    name={company?.name ?? job.company}
                    logoText={company?.logoText ?? job.logoText}
                    logoUrl={company?.logoUrl ?? job.logoUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[18px] font-bold text-[#252d39]">{company?.name ?? job.company}</h3>
                      {company?.verified ? <VerifiedBadge label="약사 인증" /> : null}
                    </div>
                    <p className="mt-2 text-[14px] font-normal leading-[1.75] text-[#566171]">{company?.description}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
                  <OverviewCard label="약국 유형" value={company?.industry ?? "정보 없음"} />
                  {company?.repName ? <OverviewCard label="대표자" value={company.repName} /> : null}
                  {company?.foundedYear ? <OverviewCard label="설립일" value={company.foundedYear} /> : null}
                  <OverviewCard label="사원 수" value={company?.employeeCount && company.employeeCount.trim().length > 0 ? company.employeeCount : "-"} />
                  {company?.address ? <OverviewCard label="주소" value={company.address} /> : null}
                </div>
              </SectionShell>

              <SectionShell id="similar" title="비슷한 공고">
                <p className="-mt-1 mb-5 text-[14px] font-normal leading-[1.7] text-[#667181]">같은 약국 직종, 유사 지역의 공고입니다.</p>
                <SimilarJobs baseJob={job} jobs={similarJobs} savedIds={savedIds} onToggleSave={toggleSave} />
              </SectionShell>
            </div>

            <aside className="sticky top-[88px] self-start h-fit space-y-3 max-[1120px]:static max-[720px]:hidden">
              <section className="rounded-[var(--radius)] border border-border bg-white px-5 py-5 shadow-[var(--shadow)]">
                <p className="text-[13px] font-medium text-[#7d8796]">지원 정보</p>
                <h2 className="mt-2 text-[30px] font-bold text-brand">{deadlineLabel(job)}</h2>
                <p className="mt-1 text-[13px] font-medium text-[#687382]">{deadlineDetail(job)}</p>

                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-brand text-[15px] font-medium text-white shadow-[0_4px_14px_rgba(17,17,17,0.2)] transition hover:bg-[var(--color-brand-dark)]"
                >
                  간편지원으로 지원하기
                </a>

                {job.applyInfo ? (
                  <div className="mt-5 space-y-3 border-y border-[#e6ecf1] py-4">
                    {job.applyInfo.channels.length ? (
                      <div className="flex items-start gap-2.5 text-[13px]">
                        <FileCheck size={16} className="mt-0.5 shrink-0 text-[#6b7280]" />
                        <div>
                          <p className="font-medium text-[#8993a1]">지원 방법</p>
                          <p className="mt-0.5 font-normal text-[#3f4855]">{job.applyInfo.channels.join(" · ")}</p>
                        </div>
                      </div>
                    ) : null}
                    {job.applyInfo.steps.length ? (
                      <div className="flex items-start gap-2.5 text-[13px]">
                        <ListChecks size={16} className="mt-0.5 shrink-0 text-[#6b7280]" />
                        <div>
                          <p className="font-medium text-[#8993a1]">전형절차</p>
                          <p className="mt-0.5 font-normal text-[#3f4855]">{job.applyInfo.steps.join(" → ")}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {job.applyInfo?.channels.includes("전화") ? (
                  <div className="mt-2 flex items-center justify-center gap-2 border border-[#dfe5ec] bg-white px-3 py-2.5 text-[13px] font-medium text-[#596373]">
                    <Phone size={14} />
                    {job.applyInfo.phone ?? "전화 문의"}
                    <span className="text-[11px] font-medium text-[#a0a9b7]">· 로그인 후 확인</span>
                  </div>
                ) : null}

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSave(job.id)}
                    className={clsx(
                      "flex h-11 items-center justify-center gap-2 border bg-white text-[14px] font-medium transition",
                      saved ? "border-brand text-brand" : "border-border text-[#4f5a66] hover:border-brand hover:text-brand",
                    )}
                  >
                    <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex h-11 items-center justify-center gap-2 border border-border bg-white text-[14px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
                  >
                    <Share2 size={17} />
                    공유
                  </button>
                </div>
                {shareMessage ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-brand">
                    <Copy size={13} />
                    {shareMessage}
                  </p>
                ) : null}
                {job.applyInfo?.blocked ? (
                  <p className="mt-4 rounded-[var(--radius)] bg-[#f7f7f7] px-3 py-3 text-[12px] font-normal leading-[1.65] text-[#667181]">
                    {job.applyInfo.blocked} 면접 및 합격 여부는 대상자에게 개별 안내드립니다.
                  </p>
                ) : null}
              </section>

              <section className="rounded-[var(--radius)] border border-border bg-white px-5 py-5 shadow-[var(--shadow)]">
                <h2 className="flex items-center gap-2 text-[18px] font-bold tracking-[-0.02em] text-[#252d39]">
                  <Sparkles size={18} className="text-[#6b7280]" />
                  더파마 매칭
                </h2>
                <p className="mt-2 text-[13px] font-normal leading-[1.65] text-[#667181]">
                  이 공고의 직무·근무 조건과 최근 본 공고를 바탕으로 유사 공고를 추천합니다.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {matchReasons.map((reason) => (
                    <span key={reason} className="rounded-[var(--radius)] border border-[#e0e0e0] bg-[#f8f8f8] px-2 py-1 text-[11px] font-medium text-[#596373]">
                      {reason}
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
            onClick={() => toggleSave(job.id)}
            className={clsx("flex h-12 items-center justify-center gap-1.5 border bg-white text-[13px] font-medium", saved ? "border-brand text-brand" : "border-border text-[#4f5a66]")}
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
            저장
          </button>
          <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 bg-brand text-[14px] font-medium text-white">
            간편지원으로 지원하기
            <ArrowRight size={17} />
          </a>
        </div>
      </div>
    </>
  );
}
