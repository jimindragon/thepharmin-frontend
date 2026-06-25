"use client";

import clsx from "clsx";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { Button, LinkButton } from "@/components/ui/Button";
import { applicationStages, mockApplications, type ApplicationStage, type JobApplication } from "@/data/mockApplications";

type TabId = "all" | "active" | "closed";

function ApplicationStepper({ currentStage }: { currentStage: ApplicationStage }) {
  const currentIndex = applicationStages.findIndex((stage) => stage.id === currentStage);

  return (
    <div className="mt-5 flex items-start">
      {applicationStages.map((stage, index) => {
        const reached = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === applicationStages.length - 1;

        return (
          <div key={stage.id} className={clsx("flex items-start", isLast ? "shrink-0" : "flex-1")}>
            <div className="flex shrink-0 flex-col items-center">
              <span
                className={clsx(
                  "h-3 w-3 shrink-0",
                  reached ? "bg-[#111111]" : "border-2 border-[#d8dee7] bg-white",
                  isCurrent && "ring-4 ring-[#111111]/12",
                )}
              />
              <span
                className={clsx(
                  "mt-2.5 whitespace-nowrap text-[12px]",
                  isCurrent ? "font-bold text-[#111111]" : reached ? "font-medium text-[#4f5967]" : "font-normal text-[#a0a9b7]",
                )}
              >
                {stage.label}
              </span>
            </div>
            {!isLast ? <div className={clsx("mt-[5px] h-[2px] flex-1", index < currentIndex ? "bg-[#111111]" : "bg-[#e5e9ef]")} /> : null}
          </div>
        );
      })}
    </div>
  );
}

function ApplicationCard({ application }: { application: JobApplication }) {
  return (
    <article className="border border-[#dfe4ea] bg-white p-6 max-[640px]:p-5">
      <div className="flex items-start justify-between gap-4 max-[520px]:flex-col max-[520px]:gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          {application.jobHref ? (
            <Link href={application.jobHref} className="truncate text-[17px] font-bold tracking-[-0.01em] text-[#17202c] hover:underline">
              {application.jobTitle}
            </Link>
          ) : (
            <p className="truncate text-[17px] font-bold tracking-[-0.01em] text-[#17202c]">{application.jobTitle}</p>
          )}
          <span className="shrink-0 border border-[#dfe4ea] bg-[#f7f8fa] px-2 py-1 text-[11px] font-medium text-[#596373]">
            {application.applyChannelLabel}
          </span>
        </div>
        <p className={clsx("shrink-0 text-[13px] font-bold tracking-[-0.01em]", application.isClosed ? "text-[#a0a9b7]" : "text-[#111111]")}>
          {application.statusLabel}
        </p>
      </div>

      <p className="mt-2 text-[13px] font-normal leading-[1.6] text-[#68717e]">
        {application.company}
        {application.resumeUsed ? ` · 사용 이력서: ${application.resumeUsed}` : ""}
        {` · 지원 ${application.appliedDate}`}
        {application.deadlineDate ? ` · 마감 ${application.deadlineDate}` : ""}
      </p>

      {application.applyChannel === "quick" ? (
        <ApplicationStepper currentStage={application.currentStage} />
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1f5] pt-4">
          <p className="inline-flex items-center gap-1.5 text-[12px] font-normal text-[#8a94a3]">
            <ExternalLink size={13} />
            외부 지원 · 전형 상태는 기업에서 관리됩니다
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm">
              결과 직접 입력
            </Button>
            {application.jobHref ? (
              <LinkButton href={application.jobHref} variant="secondary" size="sm">
                공고 보기
              </LinkButton>
            ) : null}
          </div>
        </div>
      )}

      {application.isClosed && application.resultLabel ? (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#edf1f5] pt-4">
          <span className="border border-[#f0d8d4] bg-[#fdf6f5] px-2.5 py-1 text-[12px] font-medium text-danger">{application.resultLabel}</span>
          <p className="text-[12px] font-normal text-[#8a94a3]">{application.resultNote}</p>
        </div>
      ) : null}
    </article>
  );
}

export function MyPageApplicationsClient() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const counts = useMemo(
    () => ({
      all: mockApplications.length,
      active: mockApplications.filter((application) => !application.isClosed).length,
      closed: mockApplications.filter((application) => application.isClosed).length,
    }),
    [],
  );

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "all", label: "전체", count: counts.all },
    { id: "active", label: "진행중", count: counts.active },
    { id: "closed", label: "종료", count: counts.closed },
  ];

  const visibleApplications = useMemo(() => {
    if (activeTab === "active") return mockApplications.filter((application) => !application.isClosed);
    if (activeTab === "closed") return mockApplications.filter((application) => application.isClosed);
    return mockApplications;
  }, [activeTab]);

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "지원한 공고" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">지원한 공고</h1>
      <p className="mt-2.5 text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        지원완료부터 최종 결과까지 진행 상황을 확인합니다. 간편지원은 전형 단계를 실시간으로, 외부 지원은 기업이 관리하는 일정 기준으로 보여드립니다.
      </p>

      <div className="mt-7 flex items-center gap-6 border-b border-[#e5e9ef]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "relative flex items-center gap-1.5 pb-3 text-[14px] font-medium transition-colors",
              activeTab === tab.id
                ? "text-[#111111] after:absolute after:-bottom-px after:left-0 after:h-[2px] after:w-full after:bg-[#111111]"
                : "text-[#8a94a3] hover:text-[#111111]",
            )}
          >
            {tab.label}
            <span className={clsx("text-[13px]", activeTab === tab.id ? "font-bold text-[#111111]" : "font-normal text-[#a0a9b7]")}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {visibleApplications.length > 0 ? (
          visibleApplications.map((application) => <ApplicationCard key={application.id} application={application} />)
        ) : (
          <div className="border border-[#dfe4ea] bg-white p-10 text-center">
            <p className="text-[14px] font-medium text-[#303946]">해당하는 지원 내역이 없습니다.</p>
            <p className="mt-2 text-[13px] font-normal text-[#8a94a3]">관심 있는 공고에 지원하면 이곳에서 진행 상황을 확인할 수 있습니다.</p>
          </div>
        )}
      </div>
    </MyPageShell>
  );
}
