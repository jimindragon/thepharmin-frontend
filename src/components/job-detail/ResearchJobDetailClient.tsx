"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Copy,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Microscope,
  Share2,
  WalletCards,
} from "lucide-react";
import type { Job } from "@/types/jobs";
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
  deadlineDetail,
  deadlineLabel,
  getCoverImage,
  readSavedJobs,
  writeSavedJobs,
} from "@/components/job-detail/shared";
import { getResearchFieldLabel, getResearchFieldShortLabel } from "@/config/researchFields";
import { formatResearchSalaryInfo } from "@/utils/salary";

interface ResearchJobDetailClientProps {
  job: Job;
  similarJobs: Job[];
  /** 같은 기관(researchLab.institution)에 등록된 다른 공고 수. Company 엔티티가 없는 연구 공고용 집계라 서버에서 계산해 전달받는다. */
  otherLabJobsCount: number;
}

interface SectionItem {
  id: string;
  label: string;
  visible: boolean;
}

/** 평면 문자열 목록(연구 키워드·복리후생)을 칩으로 보여주고, max를 넘으면 "+N"으로 줄인다. */
function OverflowChips({ items, max }: { items: string[]; max: number }) {
  const visible = items.slice(0, max);
  const rest = items.length - visible.length;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((item) => (
        <span key={item} className="rounded-[var(--radius)] border border-[#dedede] bg-[#f7f7f7] px-3.5 py-2 text-[13px] font-medium text-[#2f3845]">
          {item}
        </span>
      ))}
      {rest > 0 ? (
        <span className="rounded-[var(--radius)] border border-[#e0e0e0] bg-white px-3.5 py-2 text-[13px] font-medium text-[#8a95a5]">+{rest}</span>
      ) : null}
    </div>
  );
}

/** 전공분야(상위 > 하위) 칩. 대표 항목만 보여주고 나머지는 "+N"으로 줄인다. */
function ResearchFieldChips({ fieldIds, max = 4 }: { fieldIds: string[]; max?: number }) {
  const labels = fieldIds.map((id) => getResearchFieldLabel(id)).filter((label): label is string => Boolean(label));

  if (!labels.length) {
    return null;
  }

  const visible = labels.slice(0, max);
  const rest = labels.length - visible.length;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((label) => (
        <span key={label} className="rounded-[var(--radius)] border border-[#dedede] bg-[#f7f7f7] px-3.5 py-2 text-[13px] font-medium text-[#2f3845]">
          {label}
        </span>
      ))}
      {rest > 0 ? (
        <span className="rounded-[var(--radius)] border border-[#e0e0e0] bg-white px-3.5 py-2 text-[13px] font-medium text-[#8a95a5]">+{rest}</span>
      ) : null}
    </div>
  );
}

/** 근무지. 국내/해외 분기에 따라 노출 필드가 달라지고, 주소가 없으면 지도도 함께 숨긴다. */
function ResearchLocationSection({ job }: { job: Job }) {
  const info = job.researchLocationInfo;

  if (!info) {
    return null;
  }

  const isDomestic = info.scope === "국내";

  return (
    <div className="grid gap-4">
      <MapBox address={info.address} />
      <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
        <OverviewCard label="근무 범위" value={info.scope} />
        {isDomestic ? (
          <>
            {info.region ? <OverviewCard label="시·도" value={info.region} /> : null}
            {info.address ? <OverviewCard label="기관 주소" value={info.address} /> : null}
            {info.detail ? <OverviewCard label="캠퍼스·건물" value={info.detail} /> : null}
          </>
        ) : (
          <>
            {info.country ? <OverviewCard label="국가" value={info.country} /> : null}
            {info.address ? <OverviewCard label="주소" value={info.address} /> : null}
            {info.detail ? <OverviewCard label="캠퍼스·건물" value={info.detail} /> : null}
            {info.secondment ? <OverviewCard label="비자·이주 안내" value={info.secondment} /> : null}
          </>
        )}
      </div>
    </div>
  );
}

/** 급여 및 연구비·과제. 연봉 구간/면접 후 협의를 모두 지원하고, 연구비·과제는 급여와 분리해 표시한다. */
function ResearchSalarySection({ job }: { job: Job }) {
  const info = job.researchSalaryInfo;

  if (!info) {
    return <p className="text-[15px] font-normal leading-[1.7] text-[#3f4855]">{job.salary}</p>;
  }

  const formatted = formatResearchSalaryInfo(info);

  return (
    <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
      <div className="rounded-[var(--radius)] border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3.5">
        <p className="text-[12px] font-medium text-[#8893a2]">급여</p>
        <p className="mt-1.5 text-[17px] font-bold text-[#2f3845]">{formatted.primary}</p>
        {formatted.note ? <p className="mt-1 text-[13px] font-normal leading-[1.55] text-[#667181]">{formatted.note}</p> : null}
      </div>
      {info.funding?.length ? (
        <div className="rounded-[var(--radius)] border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3.5">
          <p className="text-[12px] font-medium text-[#8893a2]">연구비·과제</p>
          <p className="mt-1.5 text-[15px] font-normal leading-[1.55] text-[#2f3845]">{info.funding.join(", ")}</p>
        </div>
      ) : null}
    </div>
  );
}

/** 지원 방법. 실제 연락처는 절대 노출하지 않고 "지원 시 공개" 안내만 보여준다. */
function ResearchApplySection({ job }: { job: Job }) {
  return (
    <div className="space-y-3">
      {job.researchApplyVia ? (
        <div className="flex items-center gap-2.5 text-[14px] text-[#2f3845]">
          <Mail size={16} className="shrink-0 text-[#6b7280]" />
          <span className="font-medium">{job.researchApplyVia} 지원</span>
        </div>
      ) : null}
      <p className="border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3 text-[13px] font-normal leading-[1.65] text-[#596373]">
        지원 담당자 연락처는 지원 시 공개됩니다. 데모 페이지에서는 실제 연락처를 표시하지 않습니다.
      </p>
    </div>
  );
}

/** 연구실 및 PI 소개 + 기관·연구실 정보(주소·홈페이지·다른 공고 수). URL·소개 문구가 없으면 해당 행/버튼을 만들지 않는다. */
function ResearchLabSection({ job, otherLabJobsCount }: { job: Job; otherLabJobsCount: number }) {
  const lab = job.researchLab;

  if (!lab) {
    return null;
  }

  const subtitle = [lab.labName, `PI ${lab.pi}`].filter(Boolean).join(" · ");
  const hasLinks = Boolean(lab.homepage || lab.careerPage);

  return (
    <div>
      <div className="flex gap-4 max-[640px]:flex-col">
        <CompanyLogo name={lab.institution} logoText={job.logoText} logoUrl={job.logoUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[18px] font-bold text-[#252d39]">{lab.institution}</h3>
          <p className="mt-1 text-[14px] font-medium text-[#667181]">{subtitle}</p>
          {lab.institutionIntro ? <p className="mt-3 text-[14px] font-normal leading-[1.75] text-[#566171]">{lab.institutionIntro}</p> : null}
          {lab.labIntro ? <p className="mt-2 text-[14px] font-normal leading-[1.75] text-[#566171]">{lab.labIntro}</p> : null}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
        <OverviewCard label="기관 분류" value={lab.institutionType} />
        {lab.labName ? <OverviewCard label="연구실·소속 조직" value={lab.labName} /> : null}
        <OverviewCard label="PI" value={lab.pi} />
        {lab.address ? <OverviewCard label="주소" value={lab.address} /> : null}
        <OverviewCard label="현재 등록된 다른 공고" value={`${otherLabJobsCount}개`} />
      </div>
      {hasLinks ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {lab.homepage ? (
            <a
              href={lab.homepage}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 border border-[#dfe5ec] bg-white px-4 text-[14px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
            >
              연구실 홈페이지
              <ExternalLink size={15} />
            </a>
          ) : null}
          {lab.careerPage ? (
            <a
              href={lab.careerPage}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 border border-[#dfe5ec] bg-white px-4 text-[14px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
            >
              채용 웹페이지
              <ExternalLink size={15} />
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ResearchJobDetailClient({ job, similarJobs, otherLabJobsCount }: ResearchJobDetailClientProps) {
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set());
  const [activeSection, setActiveSection] = useState("intro");
  const [shareMessage, setShareMessage] = useState("");
  const [applyMessage, setApplyMessage] = useState("");

  useEffect(() => {
    setSavedIds(readSavedJobs());
  }, []);

  const saved = savedIds.has(job.id);
  const coverImage = getCoverImage(job, null);
  const lab = job.researchLab;
  const salaryView = job.researchSalaryInfo ? formatResearchSalaryInfo(job.researchSalaryInfo) : null;

  const fieldLabels = useMemo(
    () => (job.researchFieldIds ?? []).map((id) => getResearchFieldShortLabel(id)).filter((label): label is string => Boolean(label)),
    [job.researchFieldIds],
  );

  const overview = useMemo(() => {
    const items: { label: string; value: React.ReactNode }[] = [];

    if (fieldLabels.length) {
      items.push({
        label: "전공분야",
        value: (
          <>
            {fieldLabels[0]}
            {fieldLabels.length > 1 ? <span className="ml-1 text-[#8a95a5]">+{fieldLabels.length - 1}</span> : null}
          </>
        ),
      });
    }
    if (job.researchRecruitType) items.push({ label: "채용 형태", value: job.researchRecruitType });
    if (job.researchApplyVia) items.push({ label: "채용 방식", value: job.researchApplyVia });
    items.push({ label: "최종학력", value: job.researchDegree ?? job.education });
    if (job.headcount) items.push({ label: "채용 인원", value: job.headcount });
    if (job.researchLocationInfo) {
      items.push({ label: "근무 범위", value: job.researchLocationInfo.scope });
      const regionValue = job.researchLocationInfo.scope === "해외" ? job.researchLocationInfo.country : job.researchLocationInfo.region;
      if (regionValue) {
        items.push({ label: job.researchLocationInfo.scope === "해외" ? "근무 국가" : "근무지역", value: regionValue });
      }
    }
    items.push({ label: "급여", value: job.salary });
    if (lab) {
      items.push({ label: "기관 분류", value: lab.institutionType });
      if (lab.labName) items.push({ label: "연구실·소속 조직", value: lab.labName });
      items.push({ label: "PI", value: lab.pi });
    }
    items.push({ label: "마감일", value: deadlineDetail(job) });

    return items;
  }, [job, lab, fieldLabels]);

  const sections: SectionItem[] = [
    { id: "intro", label: "포지션 소개", visible: Boolean(job.introduction || job.oneLineIntro) },
    {
      id: "content",
      label: "연구 내용",
      visible: Boolean(job.researchTopicContent?.items.length || job.responsibilitiesContent?.items.length || job.coreKeywords?.length),
    },
    {
      id: "qualification",
      label: "지원 자격",
      visible: Boolean(job.requirementsContent?.items.length || job.preferredContent?.items.length),
    },
    { id: "workApply", label: "근무·지원", visible: true },
    { id: "lab", label: "연구실 정보", visible: Boolean(lab) },
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

  const handleApply = () => {
    setApplyMessage("지원 담당자 연락처는 지원 시 공개됩니다. (데모 페이지)");
  };

  const topTags = [job.researchRecruitType, job.researchDegree ?? job.education, job.researchLocationInfo?.scope, job.location]
    .filter((tag): tag is string => Boolean(tag))
    .slice(0, 6);

  return (
    <>
      <main className="bg-[#f5f6f7] pb-28 pt-6">
        <div className="app-shell">
          <PageBreadcrumb items={[{ label: "채용공고", href: "/jobs" }, { label: "연구", href: "/jobs/research" }, { label: job.role ?? "공고 상세" }]} />

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_318px] gap-6 max-[1120px]:grid-cols-1">
            <div className="min-w-0 space-y-5">
              <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-white shadow-[var(--shadow)]">
                <div className="px-7 pb-7 pt-7 max-[720px]:px-5">
                  <div className="flex items-start justify-between gap-5 max-[720px]:flex-col">
                    <div className="flex items-center gap-4">
                      <CompanyLogo name={lab?.institution ?? job.company} logoText={job.logoText} logoUrl={job.logoUrl} />
                      <div className="flex min-w-0 flex-col items-start gap-1.5">
                        <p className="text-[15px] font-normal text-[#667181]">{lab ? `${lab.institution} · ${lab.institutionType}` : job.company}</p>
                        {lab?.labName || lab?.pi ? (
                          <p className="text-[13px] font-medium text-[#8a95a5]">
                            {[lab?.labName, lab?.pi ? `PI ${lab.pi}` : null].filter(Boolean).join(" · ")}
                          </p>
                        ) : null}
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

                  {job.researchFieldIds?.length ? (
                    <div className="mt-4">
                      <p className="text-[12px] font-medium text-[#8893a2]">전공분야</p>
                      <div className="mt-2">
                        <ResearchFieldChips fieldIds={job.researchFieldIds} max={4} />
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {topTags.map((tag) => (
                      <HeaderTag key={tag}>{tag}</HeaderTag>
                    ))}
                  </div>

                  <div className="mt-5">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={`${job.company} 대표 이미지`}
                        className="h-[286px] w-full rounded-[var(--radius)] border border-border object-cover max-[720px]:h-[210px]"
                      />
                    ) : (
                      <DefaultCover job={job} />
                    )}
                  </div>
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

              {job.researchTopicContent?.items.length || job.responsibilitiesContent?.items.length || job.coreKeywords?.length ? (
                <SectionShell id="content" title="연구 내용">
                  <div className="space-y-7">
                    {job.researchTopicContent?.items.length ? (
                      <div>
                        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">연구 주제</h3>
                        <div className="mt-3 max-w-[760px]">
                          <FormattedContentView content={job.researchTopicContent} />
                        </div>
                      </div>
                    ) : null}
                    {job.responsibilitiesContent?.items.length ? (
                      <div>
                        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">담당 업무</h3>
                        <div className="mt-3 max-w-[760px]">
                          <FormattedContentView content={job.responsibilitiesContent} />
                        </div>
                      </div>
                    ) : null}
                    {job.coreKeywords?.length ? (
                      <div>
                        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">연구 키워드</h3>
                        <div className="mt-3">
                          <OverflowChips items={job.coreKeywords} max={8} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </SectionShell>
              ) : null}

              {job.requirementsContent?.items.length || job.preferredContent?.items.length ? (
                <SectionShell id="qualification" title="지원 자격">
                  <div className="space-y-7">
                    {job.requirementsContent?.items.length ? (
                      <div>
                        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">지원 자격</h3>
                        <div className="mt-3 max-w-[760px]">
                          <FormattedContentView content={job.requirementsContent} />
                        </div>
                      </div>
                    ) : null}
                    {job.preferredContent?.items.length ? (
                      <div>
                        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">우대 사항</h3>
                        <div className="mt-3 max-w-[760px]">
                          <FormattedContentView content={job.preferredContent} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </SectionShell>
              ) : null}

              <SectionShell id="workApply" title="근무·지원">
                <div className="space-y-7">
                  <div className="border-t border-[#edf1f4] pt-6 first:border-t-0 first:pt-0">
                    <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">근무지</h3>
                    <div className="mt-3">
                      <ResearchLocationSection job={job} />
                    </div>
                  </div>

                  <div className="border-t border-[#edf1f4] pt-6">
                    <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">급여 및 연구비·과제</h3>
                    <div className="mt-3">
                      <ResearchSalarySection job={job} />
                    </div>
                  </div>

                  {job.benefits?.length ? (
                    <div className="border-t border-[#edf1f4] pt-6">
                      <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">복리후생</h3>
                      <div className="mt-3">
                        <OverflowChips items={job.benefits} max={10} />
                      </div>
                    </div>
                  ) : null}

                  {job.hiringProcess?.length ? (
                    <div className="border-t border-[#edf1f4] pt-6">
                      <h3 className="mb-3 text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">전형절차 및 제출서류</h3>
                      <HiringProcess steps={job.hiringProcess} />
                      {job.researchDocuments?.length ? (
                        <div className="mt-4">
                          <p className="text-[12px] font-medium text-[#8893a2]">제출서류</p>
                          <p className="mt-1 text-[14px] font-normal text-[#2f3845]">{job.researchDocuments.join(", ")}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="border-t border-[#edf1f4] pt-6">
                    <h3 className="mb-3 text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">지원 방법</h3>
                    <ResearchApplySection job={job} />
                  </div>
                </div>
              </SectionShell>

              {lab ? (
                <SectionShell id="lab" title="연구실 정보">
                  <ResearchLabSection job={job} otherLabJobsCount={otherLabJobsCount} />
                </SectionShell>
              ) : null}

              <SectionShell id="similar" title="비슷한 공고">
                <p className="-mt-1 mb-5 text-[14px] font-normal leading-[1.7] text-[#667181]">같은 전공분야, 같은 채용 형태, 유사 근무지역의 공고입니다.</p>
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
                    job.researchRecruitType ? { icon: Microscope, label: "채용 형태", value: job.researchRecruitType } : null,
                    { icon: WalletCards, label: "급여", value: salaryView?.primary ?? job.salary },
                    { icon: MapPin, label: "근무지역", value: job.location },
                    { icon: GraduationCap, label: "최종학력", value: job.researchDegree ?? job.education },
                    job.researchApplyVia ? { icon: Mail, label: "지원 방식", value: `${job.researchApplyVia} 지원` } : null,
                  ]
                    .filter((item): item is { icon: typeof WalletCards; label: string; value: string } => Boolean(item))
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-start gap-2.5 text-[13px]">
                          <Icon size={16} className="mt-0.5 shrink-0 text-[#6b7280]" />
                          <div>
                            <p className="font-medium text-[#8993a1]">{item.label}</p>
                            <p className="mt-0.5 font-normal text-[#3f4855]">{item.value}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <button
                  type="button"
                  onClick={handleApply}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-brand text-[15px] font-medium text-white shadow-[0_4px_14px_rgba(17,17,17,0.2)] transition hover:bg-[var(--color-brand-dark)]"
                >
                  지원 문의하기
                </button>
                {applyMessage ? <p className="mt-2 text-[12px] font-medium text-brand">{applyMessage}</p> : null}

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

                <p className="mt-4 rounded-[var(--radius)] bg-[#f7f7f7] px-3 py-3 text-[12px] font-normal leading-[1.65] text-[#667181]">
                  지원 담당자 연락처는 지원 시 공개됩니다.
                </p>
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
          <button type="button" onClick={handleApply} className="flex h-12 items-center justify-center gap-2 bg-brand text-[14px] font-medium text-white">
            지원 문의하기
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </>
  );
}
