"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Building2,
  Clock,
  Copy,
  MapPin,
  Phone,
  Share2,
  WalletCards,
} from "lucide-react";
import type { Company, Job, JobWorkShift } from "@/types/jobs";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import {
  ActionIconButton,
  CompanyLogo,
  DefaultCover,
  FormattedContentView,
  HeaderTag,
  HiringProcess,
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
import { formatSalaryDetail } from "@/utils/salary";

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

function groupShifts(shifts: JobWorkShift[]) {
  const groups = new Map<string, JobWorkShift[]>();

  shifts.forEach((shift) => {
    const key = shift.label ?? "근무 일정";
    const list = groups.get(key) ?? [];
    list.push(shift);
    groups.set(key, list);
  });

  return Array.from(groups.entries()).map(([label, rows]) => ({ label, rows }));
}

function summarizeShifts(shifts?: JobWorkShift[]) {
  if (!shifts?.length) {
    return [];
  }

  return groupShifts(shifts).map((group) => `${group.label} · ${group.rows.map((row) => `${row.days} ${row.time}`).join(" / ")}`);
}

/**
 * 근무 일정을 근무조건 섹션 안에서 줄글/bullet로 보여주기 위한 문장 목록.
 * 옵션별 요일·시간을 한 줄로, 조정 가능 여부·휴무 같은 비고는 마지막에 모아 한 줄로 둔다.
 */
function buildScheduleLines(shifts?: JobWorkShift[]) {
  if (!shifts?.length) {
    return [];
  }

  const groups = groupShifts(shifts);
  const lines = groups.map((group) => `${group.label}: ${group.rows.map((row) => `${row.days} ${row.time}`).join(", ")}`);
  const notes = Array.from(new Set(shifts.map((shift) => shift.note).filter(Boolean)));
  if (notes.length) {
    lines.push(notes.join(" · "));
  }

  return lines;
}

/** 모집부문 및 자격요건. 복수 모집부문을 지원할 수 있는 표 구조(이번 예시는 1행). */
function RecruitTable({ rows }: { rows: { part: string; duty: string; qualification: string }[] }) {
  return (
    <div className="overflow-hidden border border-[#e2e8ef]">
      <div className="grid grid-cols-[140px_1fr_1fr] bg-[#f8fafb] text-[12px] font-medium text-[#7d8796] max-[720px]:hidden">
        <span className="px-4 py-3">모집부문</span>
        <span className="border-l border-[#e2e8ef] px-4 py-3">담당업무</span>
        <span className="border-l border-[#e2e8ef] px-4 py-3">자격요건</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.part}
          className="grid grid-cols-[140px_1fr_1fr] border-t border-[#e2e8ef] text-[14px] text-[#2f3845] max-[720px]:grid-cols-1 max-[720px]:gap-2 max-[720px]:border-t-2 max-[720px]:p-4 first:border-t-0 max-[720px]:first:border-t-2"
        >
          <span className="px-4 py-3 font-bold max-[720px]:px-0 max-[720px]:py-0">{row.part}</span>
          <span className="border-l border-[#e2e8ef] px-4 py-3 max-[720px]:border-l-0 max-[720px]:px-0 max-[720px]:py-0">
            <span className="mb-1 hidden text-[11px] font-medium text-[#8a95a5] max-[720px]:block">담당업무</span>
            {row.duty}
          </span>
          <span className="border-l border-[#e2e8ef] px-4 py-3 max-[720px]:border-l-0 max-[720px]:px-0 max-[720px]:py-0">
            <span className="mb-1 hidden text-[11px] font-medium text-[#8a95a5] max-[720px]:block">자격요건</span>
            {row.qualification}
          </span>
        </div>
      ))}
    </div>
  );
}

interface WorkConditionRow {
  label: string;
  value: React.ReactNode;
  emphasize?: boolean;
}

/** 근무조건. 값이 있는 행만 보여주고, software 등 배열은 일정 개수 이후 +N으로 줄인다. */
function PharmacyWorkConditions({ job }: { job: Job }) {
  const env = job.pharmacyEnv;
  const softwareVisible = env?.software?.slice(0, 3) ?? [];
  const softwareRest = (env?.software?.length ?? 0) - softwareVisible.length;

  const rows: WorkConditionRow[] = [];
  rows.push({ label: "급여", value: job.salary });
  rows.push({ label: "고용형태", value: job.employmentType });
  if (job.workType) rows.push({ label: "근무형태", value: job.workType });
  if (env?.simpyeong) rows.push({ label: "심평원 등록", value: env.simpyeong, emphasize: true });
  if (env?.atc) rows.push({ label: "자동조제기", value: env.atc, emphasize: true });
  if (env?.software?.length) {
    rows.push({
      label: "전산 소프트웨어",
      value: (
        <>
          {softwareVisible.join(", ")}
          {softwareRest > 0 ? <span className="ml-1 text-[#8a95a5]">+{softwareRest}</span> : null}
        </>
      ),
      emphasize: true,
    });
  }
  if (env?.otherDevices?.length) rows.push({ label: "기타 자동화기기", value: env.otherDevices.join(", "), emphasize: true });
  if (env?.staff?.pharmacist != null || env?.staff?.support != null) {
    rows.push({
      label: "근무자 구성",
      value: [env?.staff?.pharmacist != null ? `약사 ${env.staff.pharmacist}명` : null, env?.staff?.support != null ? `약무지원 ${env.staff.support}명` : null]
        .filter(Boolean)
        .join(" · "),
    });
  }
  if (env?.mainHospital) rows.push({ label: "주처방 병원", value: env.mainHospital });
  if (env?.mainDept?.length) rows.push({ label: "주처방 진료과", value: env.mainDept.join(", ") });

  const scheduleLines = buildScheduleLines(job.workShifts);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
        {rows.map((row) => (
          <OverviewCard key={row.label} label={row.label} value={row.value} emphasize={row.emphasize} />
        ))}
      </div>
      {scheduleLines.length ? (
        <div>
          <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#303947]">근무 일정</h3>
          <ul className="mt-3 space-y-2 text-[15px] font-normal leading-[1.75] text-[#3f4855]">
            {scheduleLines.map((line) => (
              <li key={line} className="flex gap-2.5">
                <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#111111]" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** 주소. 지도 자리표시자 + 주소·교통편을 고정 행이 아닌 줄글/bullet로 보여준다. 값이 없는 교통편은 줄 자체를 만들지 않는다. */
function AddressPanel({ job }: { job: Job }) {
  const commute = job.commute;
  const lines = [
    job.address ? `주소: ${job.address}` : null,
    commute?.subway?.length ? `지하철 ${commute.subway.join(", ")}` : null,
    commute?.bus ?? null,
    commute?.car ?? null,
    commute?.parking ? `주차 ${commute.parking}` : null,
  ].filter((line): line is string => Boolean(line));

  return (
    <div className="grid gap-4">
      <MapBox address={job.address} />
      <ul className="space-y-2 text-[15px] font-normal leading-[1.75] text-[#3f4855]">
        {lines.map((line) => (
          <li key={line} className="flex gap-2.5">
            <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#111111]" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 접수방법 및 채용절차. 채널 칩 + 차단 안내 + 전형절차(가변 단계)로 구성한다.
 * 연락처는 로그인/지원 전이라는 가정의 데모 상태이므로 항상 마스킹된 값과 "로그인 후 확인" 안내만 보여준다.
 */
function ApplySection({ job }: { job: Job }) {
  const info = job.applyInfo;

  if (!info) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">지원 채널</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {info.channels.map((channel) => (
            <span
              key={channel}
              className={clsx(
                "inline-flex h-9 items-center rounded-[var(--radius)] border px-3.5 text-[13px] font-medium",
                channel === "간편지원" ? "border-brand text-brand bg-brand-soft" : "border-[#dfe5ec] bg-white text-[#4f5a66]",
              )}
            >
              {channel}
            </span>
          ))}
        </div>
        {info.blocked ? (
          <p className="mt-3 border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3 text-[13px] font-normal leading-[1.65] text-[#596373]">{info.blocked}</p>
        ) : null}
        {info.phone ? (
          <div className="mt-3 flex items-center gap-2.5 text-[14px] text-[#2f3845]">
            <Phone size={16} className="shrink-0 text-[#6b7280]" />
            <span className="font-medium">{info.phone}</span>
            <span className="text-[12px] font-medium text-[#8a95a5]">로그인 후 확인</span>
          </div>
        ) : null}
        {info.documents?.length ? (
          <div className="mt-3">
            <p className="text-[12px] font-medium text-[#8893a2]">제출서류</p>
            <p className="mt-1 text-[14px] font-normal text-[#2f3845]">{info.documents.join(", ")}</p>
          </div>
        ) : null}
      </div>

      {info.steps.length ? (
        <div>
          <h3 className="mb-3 text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">전형절차</h3>
          <HiringProcess steps={info.steps} />
        </div>
      ) : null}
    </div>
  );
}

/** 인사담당자 Tip. 값이 있는 Q&A만 렌더링하고, 하나도 없으면 호출부에서 섹션 자체를 숨긴다. */
function HrTipSection({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="divide-y divide-[#edf1f4]">
      {items.map((item) => (
        <div key={item.question} className="py-4 first:pt-0 last:pb-0">
          <p className="text-[14px] font-bold text-[#242b36]">Q. {item.question}</p>
          <p className="mt-1.5 text-[14px] font-normal leading-[1.7] text-[#566171]">A. {item.answer}</p>
        </div>
      ))}
    </div>
  );
}

export function PharmacyJobDetailClient({ job, company, similarJobs }: PharmacyJobDetailClientProps) {
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set());
  const [activeSection, setActiveSection] = useState("recruit");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    setSavedIds(readSavedJobs());
  }, []);

  const saved = savedIds.has(job.id);
  const coverImage = getCoverImage(job, company);
  const shiftSummary = useMemo(() => summarizeShifts(job.workShifts), [job.workShifts]);
  const salaryView = job.salaryDetail ? formatSalaryDetail(job.salaryDetail) : null;

  const overview = useMemo(() => {
    const items: { label: string; value: string; emphasize?: boolean }[] = [
      { label: "직종", value: job.role ?? job.jobCategory ?? "직종 정보 없음" },
      { label: "급여", value: job.salary },
      { label: "고용형태", value: job.employmentType },
    ];
    if (job.workType) items.push({ label: "근무형태", value: job.workType });
    if (job.headcount) items.push({ label: "모집인원", value: job.headcount });
    items.push({ label: "경력", value: careerLabel(job) });
    items.push({ label: "학력", value: job.education });
    if (shiftSummary.length) items.push({ label: "근무요일·시간", value: shiftSummary.join(" · ") });
    items.push({ label: "주소", value: job.address ?? job.location });
    items.push({ label: "접수마감", value: deadlineDetail(job) });
    if (job.pharmacyEnv?.simpyeong) items.push({ label: "심평원 등록", value: job.pharmacyEnv.simpyeong, emphasize: true });
    if (job.pharmacyEnv?.atc) items.push({ label: "자동조제기", value: job.pharmacyEnv.atc, emphasize: true });
    return items;
  }, [job, shiftSummary]);

  const sections: SectionItem[] = [
    { id: "recruit", label: "모집부문 및 자격요건", visible: Boolean(job.recruitTable?.length) },
    { id: "intro", label: "포지션 소개", visible: Boolean(job.introduction || job.oneLineIntro || job.recruitDetails?.items.length) },
    { id: "preferred", label: "우대사항", visible: Boolean(job.preferredQualifications?.length || job.preferredContent?.items.length) },
    { id: "work", label: "근무조건", visible: true },
    { id: "address", label: "주소", visible: true },
    { id: "benefits", label: "복리후생", visible: Boolean(job.benefits?.length) },
    { id: "apply", label: "접수방법·채용절차", visible: Boolean(job.applyInfo) },
    { id: "hrtip", label: "인사담당자 Tip", visible: Boolean(job.hrTips?.length) },
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
                      <CompanyLogo name={job.company} logoText={job.logoText} logoColor={job.logoColor} logoAccent={job.logoAccent} />
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
                    <OverviewCard key={item.label} label={item.label} value={item.value} emphasize={item.emphasize} />
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
                        activeSection === section.id ? "text-brand shadow-[inset_0_-2px_0_#00746C]" : "text-[#4f5967] hover:bg-[#f7f8fa] hover:text-[#111111]",
                      )}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </nav>

              {job.recruitTable?.length ? (
                <SectionShell id="recruit" title="모집부문 및 자격요건">
                  <RecruitTable rows={job.recruitTable} />
                </SectionShell>
              ) : null}

              {job.introduction || job.oneLineIntro || job.recruitDetails?.items.length ? (
                <SectionShell id="intro" title="포지션 소개">
                  <div className="space-y-4">
                    {job.introduction || job.oneLineIntro ? (
                      <p className="text-[16px] font-normal leading-[1.85] text-[#3f4855]">{job.introduction ?? job.oneLineIntro}</p>
                    ) : null}
                    {job.recruitDetails?.items.length ? <FormattedContentView content={job.recruitDetails} /> : null}
                  </div>
                </SectionShell>
              ) : null}

              {job.preferredQualifications?.length || job.preferredContent?.items.length ? (
                <SectionShell id="preferred" title="우대사항">
                  <FormattedContentView content={job.preferredContent} fallback={job.preferredQualifications} />
                </SectionShell>
              ) : null}

              <SectionShell id="work" title="근무조건">
                <PharmacyWorkConditions job={job} />
              </SectionShell>

              <SectionShell id="address" title="주소">
                <AddressPanel job={job} />
              </SectionShell>

              {job.benefits?.length ? (
                <SectionShell id="benefits" title="복리후생">
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit) => (
                      <span key={benefit} className="rounded-[var(--radius)] border border-[#e0e0e0] bg-[#f8f8f8] px-3.5 py-2 text-[13px] font-normal text-[#4f5a66]">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </SectionShell>
              ) : null}

              {job.applyInfo ? (
                <SectionShell id="apply" title="접수방법 및 채용절차">
                  <ApplySection job={job} />
                </SectionShell>
              ) : null}

              {job.hrTips?.length ? (
                <SectionShell id="hrtip" title="인사담당자 Tip">
                  <HrTipSection items={job.hrTips} />
                </SectionShell>
              ) : null}

              <SectionShell id="company" title="기업정보">
                <div className="flex gap-4 max-[640px]:flex-col">
                  <CompanyLogo name={company?.name ?? job.company} logoText={company?.logoText ?? job.logoText} logoUrl={company?.logoUrl ?? job.logoUrl} logoColor={company?.logoColor ?? job.logoColor} logoAccent={company?.logoAccent ?? job.logoAccent} size="sm" />
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

                <div className="mt-5 space-y-3 border-y border-[#e6ecf1] py-4">
                  {[
                    { icon: WalletCards, label: "급여", value: salaryView?.primary ?? job.salary, diff: salaryView?.diff },
                    { icon: MapPin, label: "주소", value: job.address ?? job.location },
                    { icon: Building2, label: "고용형태", value: job.employmentType },
                    shiftSummary.length ? { icon: Clock, label: "근무 일정", value: shiftSummary.join(" / ") } : null,
                  ]
                    .filter((item): item is { icon: typeof WalletCards; label: string; value: string; diff?: string } => Boolean(item))
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-start gap-2.5 text-[13px]">
                          <Icon size={16} className="mt-0.5 shrink-0 text-[#6b7280]" />
                          <div>
                            <p className="font-medium text-[#8993a1]">{item.label}</p>
                            <p className="mt-0.5 font-normal text-[#3f4855]">{item.value}</p>
                            {item.diff ? <p className="mt-0.5 text-[12px] font-normal text-[#8a95a5]">{item.diff}</p> : null}
                          </div>
                        </div>
                      );
                    })}
                </div>

                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-brand text-[15px] font-medium text-white shadow-[0_4px_14px_rgba(17,17,17,0.2)] transition hover:bg-[var(--color-brand-dark)]"
                >
                  간편지원으로 지원하기
                </a>
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
                  <p className="mt-4 rounded-[var(--radius)] bg-[#f7f7f7] px-3 py-3 text-[12px] font-normal leading-[1.65] text-[#667181]">{job.applyInfo.blocked}</p>
                ) : null}
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
