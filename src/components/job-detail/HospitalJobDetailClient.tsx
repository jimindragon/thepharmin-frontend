"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  MapPin,
  Share2,
  Sparkles,
} from "lucide-react";
import type { Company, HospitalDepartment, Job } from "@/types/jobs";
import { formatHeadcount } from "@/utils/headcount";
import { formatHospitalSalary } from "@/utils/salary";
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

interface HospitalJobDetailClientProps {
  job: Job;
  company: Company | null;
  similarJobs: Job[];
}

interface SectionItem {
  id: string;
  label: string;
  visible: boolean;
}

const HOSPITAL_TYPE_LABELS: Record<string, string> = {
  tertiary_general_hospital: "상급종합병원",
  general_hospital: "종합병원",
  hospital: "병원",
  long_term_care_hospital: "요양병원",
};

function hospitalTypeLabel(id?: string): string {
  return (id && HOSPITAL_TYPE_LABELS[id]) ?? "병원";
}

function shiftSummary(ids?: string[]): string {
  const LABELS: Record<string, string> = {
    day_shift: "주간",
    shift_work: "교대",
    night_on_call: "야간·비직",
    weekend_work: "주말",
  };
  if (!ids?.length) return "주간";
  return ids.map((id) => LABELS[id] ?? id).join(" · ");
}

function applyButtonLabel(job: Job): string {
  if (job.applyMethod === "간편 지원" || job.applyMethod === "더파마 간편지원") return "더파마 리크루트로 지원하기";
  if (job.applyMethod === "기업 홈페이지 지원") return "기관 홈페이지에서 지원하기";
  if (job.applyMethod === "이메일 지원") return "이메일로 지원하기";
  return "지원 안내 확인하기";
}

function applyNotice(job: Job): string {
  if (job.applyMethod === "기업 홈페이지 지원")
    return job.applicationNotice ?? "지원 시 기관 채용 페이지로 이동합니다. 지원 결과와 전형 진행은 해당 기관에서 관리됩니다.";
  if (job.applyMethod === "간편 지원" || job.applyMethod === "더파마 간편지원")
    return "지원서 제출 후 마이페이지에서 지원 현황을 확인할 수 있습니다.";
  if (job.applyMethod === "이메일 지원")
    return "이력서와 제출서류를 첨부해 지정된 이메일로 지원해 주세요.";
  return job.applicationGuide ?? "공고 본문에 안내된 지원 방법을 확인해 주세요.";
}

function applyHref(job: Job): string | undefined {
  if (job.applyMethod === "기업 홈페이지 지원") return job.applicationUrl;
  if (job.applyMethod === "이메일 지원" && job.applicationEmail) return `mailto:${job.applicationEmail}`;
  if (job.applyMethod === "간편 지원" || job.applyMethod === "더파마 간편지원") return `/jobs/${job.slug ?? job.id}/apply`;
  return undefined;
}

function DepartmentTable({ departments }: { departments: HospitalDepartment[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-[13px]">
        <thead>
          <tr className="bg-[#f4f6f8]">
            {["모집부문", "모집인원", "근무시간", "담당업무", "자격요건"].map((col) => (
              <th
                key={col}
                className="border border-[#dde3ea] px-3.5 py-2.5 text-left text-[12px] font-semibold text-[#3f4855]"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departments.map((dept, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#fbfcfc]"}>
              <td className="border border-[#dde3ea] px-3.5 py-3 font-semibold text-[#1f2733]">{dept.name}</td>
              <td className="border border-[#dde3ea] px-3.5 py-3 text-[#3f4855]">{dept.headcount}</td>
              <td className="border border-[#dde3ea] px-3.5 py-3 text-[#3f4855]">{dept.schedule}</td>
              <td className="border border-[#dde3ea] px-3.5 py-3 text-[#3f4855]">{dept.duties}</td>
              <td className="border border-[#dde3ea] px-3.5 py-3 text-[#3f4855]">{dept.requirements}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[12px] font-medium text-[#8a95a5]">
        1차 분류만 지원해도 서류 전형에 반영됩니다. 지원 부문은 이력서에 명기해 주세요.
      </p>
    </div>
  );
}

function WorkConditions({ job }: { job: Job }) {
  const items = job.workConditionItems ?? [];
  const [expanded, setExpanded] = useState(false);
  const benefitItems = job.benefits ?? [];
  const visibleBenefits = expanded ? benefitItems : benefitItems.slice(0, 6);

  return (
    <div className="space-y-5">
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
          {items.map((item) => (
            <div key={item.label} className="rounded-[var(--radius)] border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3.5">
              <p className="text-[12px] font-medium text-[#8893a2]">{item.label}</p>
              <p className="mt-1.5 text-[15px] font-normal leading-[1.55] text-[#2f3845]">{item.value}</p>
            </div>
          ))}
        </div>
      )}
      {benefitItems.length > 0 && (
        <div>
          <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#303947]">복리후생</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {visibleBenefits.map((benefit) => (
              <span
                key={benefit}
                className="rounded-[var(--radius)] border border-[#e0e0e0] bg-[#f8f8f8] px-3.5 py-2 text-[13px] font-normal text-[#4f5a66]"
              >
                {benefit}
              </span>
            ))}
            {benefitItems.length > 6 && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="border border-brand bg-white px-3.5 py-2 text-[13px] font-medium text-brand transition hover:bg-brand-soft"
              >
                {expanded ? "접기" : `더 보기 ${benefitItems.length - 6}개`}
              </button>
            )}
          </div>
        </div>
      )}
      {job.workConditionDetail && (
        <div className="rounded-[var(--radius)] border border-[#e2e8ef] bg-white px-4 py-3.5">
          <p className="text-[12px] font-medium text-[#8893a2]">근무조건 상세</p>
          <p className="mt-1.5 text-[14px] font-normal leading-[1.7] text-[#3f4855]">{job.workConditionDetail}</p>
        </div>
      )}
    </div>
  );
}

function HiringDocuments({ job }: { job: Job }) {
  const docs = job.applicationInfo ?? [];
  const hasProcess = Boolean(job.hiringProcess?.length);
  const hasDocs = docs.length > 0;
  const isBlind = job.applicationGuide?.includes("블라인드") ?? false;

  return (
    <div className="space-y-6">
      {hasProcess && (
        <div>
          <h3 className="mb-4 text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">전형 절차</h3>
          <HiringProcess steps={job.hiringProcess} />
        </div>
      )}
      {hasDocs && (
        <div>
          <h3 className="mb-3 text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">제출서류</h3>
          <ul className="space-y-2">
            {docs.map((doc) => (
              <li key={doc} className="flex items-start gap-2.5 text-[14px] font-normal leading-[1.65] text-[#3f4855]">
                <FileText size={16} className="mt-0.5 shrink-0 text-[#8a95a5]" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}
      {isBlind && (
        <div className="rounded-[var(--radius)] border border-[#dfe5ec] bg-[#f8fafb] px-4 py-3.5">
          <p className="text-[13px] font-semibold text-[#2f3845]">블라인드 채용 안내</p>
          <p className="mt-1.5 text-[13px] font-normal leading-[1.65] text-[#596373]">
            {job.applicationGuide}
          </p>
        </div>
      )}
      <p className="text-[12px] font-medium text-[#8a95a5]">
        채용 절차와 제출서류는 기관 사정에 따라 변경될 수 있습니다.
      </p>
    </div>
  );
}

function LocationSection({ job }: { job: Job }) {
  const address = job.locationDetail?.address ?? job.address;

  return (
    <div className="grid gap-4">
      <MapBox address={address} />
      <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
        <OverviewCard label="근무지역" value={job.location} />
        {address ? (
          <OverviewCard label="주소" value={address} />
        ) : (
          <OverviewCard label="상세 주소" value="지원 과정에서 기관을 통해 확인해 주세요." />
        )}
        {job.locationDetail?.nearestStation ? (
          <OverviewCard label="가까운 역" value={job.locationDetail.nearestStation} />
        ) : null}
        {job.locationDetail?.walkingTime ? (
          <OverviewCard label="도보" value={job.locationDetail.walkingTime} />
        ) : null}
      </div>
    </div>
  );
}

function InstitutionInfo({ job }: { job: Job }) {
  const typeLabel = hospitalTypeLabel(job.hospitalTypeId ?? job.hospitalTypeIds?.[0]);

  return (
    <div className="space-y-5">
      <div className="flex gap-4 max-[640px]:flex-col">
        <CompanyLogo name={job.company} logoText={job.logoText} logoUrl={job.logoUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[18px] font-bold text-[#252d39]">{job.company}</h3>
            <VerifiedBadge label="병원 인증" />
          </div>
          {job.companyDescription && (
            <p className="mt-2 text-[14px] font-normal leading-[1.75] text-[#566171]">{job.companyDescription}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
        <OverviewCard label="기관 분류" value={typeLabel} />
        <OverviewCard label="소재지" value={job.location} />
        <OverviewCard label="근무시간" value={shiftSummary(job.shiftTypeIds)} />
        <OverviewCard label="진행 중 공고" value="1개" />
      </div>
    </div>
  );
}

export function HospitalJobDetailClient({ job, company, similarJobs }: HospitalJobDetailClientProps) {
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set());
  const [activeSection, setActiveSection] = useState("intro");
  const [shareMessage, setShareMessage] = useState("");
  const [applyMessage, setApplyMessage] = useState("");

  useEffect(() => {
    setSavedIds(readSavedJobs());
  }, []);

  const saved = savedIds.has(job.id);
  const isClosed = job.isClosed || deadlineLabel(job) === "마감";
  const applyUrl = applyHref(job);
  const canApply = !isClosed && Boolean(applyUrl);
  const coverImage = getCoverImage(job, company);

  const overview = useMemo(
    () => [
      { label: "근무 형태", value: shiftSummary(job.shiftTypeIds) },
      { label: "고용형태", value: job.employmentType },
      { label: "모집인원", value: job.headcount ?? formatHeadcount([]) },
      { label: "경력", value: careerLabel(job) },
      { label: "학력", value: job.education },
      { label: "급여", value: formatHospitalSalary(job.salaryRange, job.salaryNote) },
      { label: "접수마감", value: deadlineDetail(job) },
      { label: "지원방법", value: job.applyMethod },
    ],
    [job],
  );

  const sections: SectionItem[] = [
    { id: "intro", label: "포지션 소개", visible: Boolean(job.introduction || job.oneLineIntro) },
    { id: "departments", label: "모집부문", visible: (job.hospitalDepartments?.length ?? 0) >= 2 },
    {
      id: "qualifications",
      label: "업무·자격",
      visible: Boolean(
        job.responsibilitiesContent?.items.length ||
          job.responsibilities?.length ||
          job.requirementsContent?.items.length ||
          job.requirements?.length ||
          job.preferredContent?.items.length ||
          job.preferredQualifications?.length,
      ),
    },
    { id: "keywords", label: "핵심 키워드", visible: Boolean(job.coreKeywords?.length || job.tags.length) },
    { id: "work", label: "근무조건", visible: Boolean(job.workConditionItems?.length || job.workConditions?.length || job.benefits?.length) },
    {
      id: "process",
      label: "전형·제출서류",
      visible: Boolean(job.hiringProcess?.length || job.applicationInfo?.length),
    },
    { id: "location", label: "근무지", visible: true },
    { id: "institution", label: "기관 정보", visible: true },
    { id: "similar", label: "비슷한 공고", visible: true },
  ].filter((s) => s.visible);

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  useEffect(() => {
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-130px 0px -58% 0px", threshold: [0.16, 0.32, 0.48] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sectionIds]);

  const toggleSave = (jobId: number) => {
    setSavedIds((current) => {
      const next = new Set(current);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
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
    if (isClosed) { setApplyMessage("마감된 공고입니다."); return; }
    if (!applyUrl) { setApplyMessage("지원 방법을 확인 중입니다."); return; }
    setApplyMessage(job.applyMethod === "기업 홈페이지 지원" ? "기관 채용 페이지를 새 탭으로 엽니다." : "지원 화면을 엽니다.");
    window.open(applyUrl, "_blank", "noopener,noreferrer");
  };

  const topTags = Array.from(
    new Set(
      [
        job.jobCategory ?? job.tags[0],
        hospitalTypeLabel(job.hospitalTypeId ?? job.hospitalTypeIds?.[0]),
        careerLabel(job),
        job.education,
        job.employmentType,
        job.location,
      ].filter(Boolean) as string[],
    ),
  ).slice(0, 6);

  const bodyKeywords = (job.coreKeywords?.length ? job.coreKeywords : job.tags).slice(0, 8);

  return (
    <>
      <main className="bg-[#f5f6f7] pb-28 pt-6">
        <div className="app-shell">
          <PageBreadcrumb
            items={[
              { label: "채용공고", href: "/jobs" },
              { label: "병원약사", href: "/jobs/hospital" },
              { label: job.title },
            ]}
          />

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_318px] gap-6 max-[1120px]:grid-cols-1">
            {/* ── 메인 컬럼 ── */}
            <div className="min-w-0 space-y-5">
              {/* 헤더 섹션 */}
              <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-white shadow-[var(--shadow)]">
                <div className="px-7 pb-7 pt-7 max-[720px]:px-5">
                  <div className="flex items-start justify-between gap-5 max-[720px]:flex-col">
                    <div className="flex items-center gap-4">
                      <CompanyLogo name={job.company} logoText={job.logoText} logoUrl={job.logoUrl} />
                      <div className="flex min-w-0 flex-col items-start gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[15px] font-normal text-[#667181]">{job.company}</p>
                          <VerifiedBadge label="병원 인증" />
                          <span className="rounded-[var(--radius)] border border-[#d8e3ed] bg-[#f0f6fc] px-2.5 py-1 text-[11px] font-medium text-[#3b5a7a]">
                            {hospitalTypeLabel(job.hospitalTypeId ?? job.hospitalTypeIds?.[0])}
                          </span>
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

                  <h1 className="mt-5 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#1f2733] max-[720px]:text-[25px]">
                    {job.title}
                  </h1>
                  {job.oneLineIntro && (
                    <p className="mt-3 max-w-[760px] text-[16px] font-normal leading-[1.65] text-[#667181]">{job.oneLineIntro}</p>
                  )}
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

              {/* 공고 한눈에 보기 */}
              <section className="rounded-[var(--radius)] border border-border bg-white px-7 py-6 shadow-[var(--shadow)] max-[720px]:px-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#242b36]">공고 한눈에 보기</h2>
                  <span
                    className={clsx(
                      "rounded-[var(--radius)] px-3 py-1.5 text-[12px] font-medium",
                      isClosed ? "bg-[#fff1f1] text-danger" : "bg-brand-soft text-brand",
                    )}
                  >
                    {deadlineLabel(job)}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-4 gap-3 max-[1020px]:grid-cols-3 max-[720px]:grid-cols-2">
                  {overview.map((item) => (
                    <OverviewCard key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>
              </section>

              {/* 탭 내비게이션 */}
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
                      onClick={() =>
                        document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                      }
                      className={clsx(
                        "h-14 shrink-0 border-r border-[#edf1f5] px-6 text-[13px] font-medium transition",
                        activeSection === section.id
                          ? "text-brand shadow-[inset_0_-2px_0_var(--color-brand)]"
                          : "text-[#4f5967] hover:bg-[#f7f8fa] hover:text-[#111111]",
                      )}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </nav>

              {/* 포지션 소개 */}
              {(job.introduction || job.oneLineIntro) && (
                <SectionShell id="intro" title="포지션 소개">
                  <p className="text-[16px] font-normal leading-[1.85] text-[#3f4855]">
                    {job.introduction ?? job.oneLineIntro}
                  </p>
                </SectionShell>
              )}

              {/* 모집부문 비교 테이블 — 부문이 2개 이상일 때만 노출 */}
              {(job.hospitalDepartments?.length ?? 0) >= 2 ? (
                <SectionShell id="departments" title="모집부문">
                  <DepartmentTable departments={job.hospitalDepartments!} />
                </SectionShell>
              ) : null}

              {/* 업무·자격 */}
              {(job.responsibilities?.length ||
                job.responsibilitiesContent?.items.length ||
                job.requirements?.length ||
                job.requirementsContent?.items.length) && (
                <SectionShell id="qualifications" title="업무·자격">
                  <div className="space-y-7">
                    {(job.responsibilitiesContent?.items.length || job.responsibilities?.length) && (
                      <div>
                        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">주요업무</h3>
                        <div className="mt-3">
                          <FormattedContentView
                            content={job.responsibilitiesContent}
                            fallback={job.responsibilities}
                          />
                        </div>
                      </div>
                    )}
                    {(job.requirementsContent?.items.length || job.requirements?.length) && (
                      <div>
                        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">자격요건</h3>
                        <div className="mt-3">
                          <FormattedContentView
                            content={job.requirementsContent}
                            fallback={job.requirements}
                          />
                        </div>
                      </div>
                    )}
                    {(job.preferredContent?.items.length || job.preferredQualifications?.length) && (
                      <div>
                        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#2f3845]">우대사항</h3>
                        <div className="mt-3">
                          <FormattedContentView
                            content={job.preferredContent}
                            fallback={job.preferredQualifications}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </SectionShell>
              )}

              {/* 핵심 키워드 */}
              {(job.coreKeywords?.length || job.tags.length) ? (
                <SectionShell id="keywords" title="핵심 키워드">
                  <div className="flex flex-wrap gap-2">
                    {bodyKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-[var(--radius)] border border-[#dedede] bg-[#f7f7f7] px-3.5 py-2 text-[13px] font-medium text-[#2f3845]"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-[12px] font-medium text-[#8a95a5]">
                    선택된 키워드를 기준으로 유사 공고와 맞춤 추천이 제공됩니다.
                  </p>
                </SectionShell>
              ) : null}

              {/* 근무조건 */}
              {(job.workConditionItems?.length || job.workConditions?.length || job.benefits?.length) ? (
                <SectionShell id="work" title="근무조건">
                  <WorkConditions job={job} />
                </SectionShell>
              ) : null}

              {/* 전형·제출서류 */}
              {(job.hiringProcess?.length || job.applicationInfo?.length) ? (
                <SectionShell id="process" title="전형·제출서류">
                  <HiringDocuments job={job} />
                </SectionShell>
              ) : null}

              {/* 근무지 */}
              <SectionShell id="location" title="근무지">
                <LocationSection job={job} />
              </SectionShell>

              {/* 기관 정보 */}
              <SectionShell id="institution" title="기관 정보">
                <InstitutionInfo job={job} />
              </SectionShell>

              {/* 비슷한 공고 */}
              <SectionShell id="similar" title="비슷한 공고">
                <p className="-mt-1 mb-5 text-[14px] font-normal leading-[1.7] text-[#667181]">
                  이 공고와 직무, 키워드, 근무 조건이 비슷한 공고입니다.
                </p>
                <SimilarJobs baseJob={job} jobs={similarJobs} savedIds={savedIds} onToggleSave={toggleSave} />
              </SectionShell>
            </div>

            {/* ── 사이드바 ── */}
            <aside className="sticky top-[88px] h-fit self-start space-y-3 max-[1120px]:static max-[720px]:hidden">
              <section className="rounded-[var(--radius)] border border-border bg-white px-5 py-5 shadow-[var(--shadow)]">
                <p className="text-[13px] font-medium text-[#7d8796]">지원 정보</p>
                <h2 className={clsx("mt-2 text-[30px] font-bold", isClosed ? "text-danger" : "text-brand")}>
                  {deadlineLabel(job)}
                </h2>
                <p className="mt-1 text-[13px] font-medium text-[#687382]">{deadlineDetail(job)}</p>

                <div className="mt-5 space-y-3 border-y border-[#e6ecf1] py-4">
                  {[
                    { icon: BriefcaseBusiness, label: "경력", value: careerLabel(job) },
                    { icon: Building2, label: "고용형태", value: job.employmentType },
                    { icon: MapPin, label: "근무지역", value: job.location },
                    { icon: CalendarDays, label: "지원방법", value: job.applyMethod },
                  ].map((item) => {
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

                {canApply && applyUrl ? (
                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      setApplyMessage(
                        job.applyMethod === "기업 홈페이지 지원" ? "기관 채용 페이지를 새 탭으로 엽니다." : "지원 화면을 엽니다.",
                      )
                    }
                    className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-brand text-[15px] font-medium text-white shadow-[0_4px_14px_rgba(17,17,17,0.2)] transition hover:bg-[var(--color-brand-dark)]"
                  >
                    {applyButtonLabel(job)}
                    <ExternalLink size={17} />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled
                    className="mt-5 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 bg-[#b8b8b8] text-[15px] font-medium text-white"
                  >
                    {isClosed ? "마감된 공고입니다" : "지원 방법을 확인 중입니다"}
                  </button>
                )}
                {applyMessage && (
                  <p className="mt-2 text-[12px] font-medium text-danger">{applyMessage}</p>
                )}

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
                {shareMessage && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-brand">
                    <Copy size={13} />
                    {shareMessage}
                  </p>
                )}
                <p className="mt-4 rounded-[var(--radius)] bg-[#f7f7f7] px-3 py-3 text-[12px] font-normal leading-[1.65] text-[#667181]">
                  {applyNotice(job)}
                </p>
              </section>

              <section className="rounded-[var(--radius)] border border-border bg-white px-5 py-5 shadow-[var(--shadow)]">
                <h2 className="flex items-center gap-2 text-[18px] font-bold tracking-[-0.02em] text-[#252d39]">
                  <Sparkles size={18} className="text-[#6b7280]" />
                  더파마 매칭
                </h2>
                <p className="mt-2 text-[13px] font-normal leading-[1.65] text-[#667181]">
                  이 공고의 직무·기관 조건과 최근 본 공고를 바탕으로 유사 공고를 추천합니다.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[
                    hospitalTypeLabel(job.hospitalTypeId ?? job.hospitalTypeIds?.[0]),
                    `${shiftSummary(job.shiftTypeIds)} 근무`,
                    careerLabel(job),
                    `${job.location.split(" ")[0]}권 근무지`,
                  ]
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((reason) => (
                      <span
                        key={reason}
                        className="rounded-[var(--radius)] border border-[#e0e0e0] bg-[#f8f8f8] px-2 py-1 text-[11px] font-medium text-[#596373]"
                      >
                        {reason}
                      </span>
                    ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {/* 모바일 하단 바 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white px-4 py-3 shadow-[0_-8px_20px_rgba(20,32,46,0.08)] md:hidden">
        <div className="mx-auto grid max-w-[560px] grid-cols-[92px_1fr] gap-2">
          <button
            type="button"
            onClick={() => toggleSave(job.id)}
            className={clsx(
              "flex h-12 items-center justify-center gap-1.5 border bg-white text-[13px] font-medium",
              saved ? "border-brand text-brand" : "border-border text-[#4f5a66]",
            )}
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
            저장
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!canApply}
            className="flex h-12 items-center justify-center gap-2 bg-brand text-[14px] font-medium text-white disabled:bg-[#b8b8b8]"
          >
            {isClosed ? "마감된 공고입니다" : canApply ? applyButtonLabel(job) : "지원 방법 확인 중"}
            {canApply ? <ArrowRight size={17} /> : null}
          </button>
        </div>
      </div>
    </>
  );
}
