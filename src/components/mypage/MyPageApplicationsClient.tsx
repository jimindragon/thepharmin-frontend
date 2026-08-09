"use client";

import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { ApplicationStepper } from "@/components/ui/ApplicationStepper";
import { EntityLogo } from "@/components/ui/EntityLogo";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { Button, LinkButton } from "@/components/ui/Button";
import { companyLogos } from "@/config/companyImages";
import { sharedRoutes } from "@/config/routes";
import { mockApplications, type JobApplication } from "@/data/mockApplications";

type TabId = "all" | "active" | "closed";

function getStatusDetail(application: JobApplication): string | undefined {
  if (application.isClosed) {
    return application.resultDate ? `결과 발표일 ${application.resultDate}` : undefined;
  }
  if (application.applyChannel === "external") {
    return application.deadlineDate ? `마감 ${application.deadlineDate}` : undefined;
  }
  if (application.currentStage === "screening" && application.expectedDate) {
    return `서류 발표 예정일 ${application.expectedDate}`;
  }
  if (application.currentStage === "interview" && application.expectedDate) {
    return `면접일 ${application.expectedDate}`;
  }
  return undefined;
}

function ApplicationCard({ application }: { application: JobApplication }) {
  const isQuick = application.applyChannel === "quick";
  const statusDetail = getStatusDetail(application);
  const statusText = application.isClosed && application.resultLabel ? application.resultLabel : application.statusLabel;

  const metaItems: { label?: string; value: string }[] = [
    { value: application.company },
    application.resumeUsed ? { label: "사용 이력서", value: application.resumeUsed } : null,
    { label: "지원", value: application.appliedDate },
    !isQuick ? { value: "외부 지원" } : null,
  ].filter((item): item is { label?: string; value: string } => item !== null);

  return (
    <article className="border border-border bg-white">
      {/* 상단 층: 공고 정보 + 상태 */}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 px-6 pt-6 pb-4 max-[640px]:px-5">
        {/* 좌측: 로고 + 공고 정보 */}
        <div className="flex min-w-0 flex-1 basis-[260px] items-center gap-4">
          <EntityLogo name={application.company} logoUrl={companyLogos[application.company]} size={48} />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {application.jobHref ? (
                <Link href={application.jobHref} className="truncate text-[17px] font-bold tracking-[-0.01em] text-[#17202c] hover:underline">
                  {application.jobTitle}
                </Link>
              ) : (
                <p className="truncate text-[17px] font-bold tracking-[-0.01em] text-[#17202c]">{application.jobTitle}</p>
              )}
              <span className="shrink-0 border border-border bg-white px-2 py-0.5 text-[13px] font-medium text-[#596373]">
                {application.applyChannelLabel}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              {metaItems.map((item, index) => (
                <span key={index} className="flex items-center gap-x-3">
                  {index > 0 ? <span aria-hidden="true" className="h-3 w-px bg-[#e5e7eb]" /> : null}
                  <span className="flex items-center gap-x-1.5">
                    {item.label ? <span className="whitespace-nowrap text-[13px] text-[#9ca3af]">{item.label}</span> : null}
                    <span className="whitespace-nowrap text-[13px] text-[#4b5563]">{item.value}</span>
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 우측: 상태 */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <p
            className={clsx(
              "inline-flex items-center gap-[8px] text-[15px] font-semibold tracking-[-0.01em]",
              application.isClosed && application.resultLabel ? "text-status-error" : "text-[#111111]",
            )}
          >
            {application.isClosed && application.resultLabel ? (
              <span className="h-[8px] w-[8px] rounded-full shrink-0 bg-status-error-dot" />
            ) : null}
            {statusText}
          </p>
          {statusDetail ? <p className="text-[13px] font-normal text-[#8a94a3]">{statusDetail}</p> : null}
        </div>
      </div>

      {/* 하단 층: 진행 상태 + 액션 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#eef1f4] px-6 pt-4 pb-5 max-[640px]:px-5">
        {isQuick ? (
          <div className="max-w-[520px] min-w-[280px] flex-1">
            <ApplicationStepper currentStage={application.currentStage} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-status-neutral-dot" />
            <span className="text-[13px] text-[#6b7280]">
              {application.isClosed ? "전형이 종료되었습니다" : "전형 상태는 기업에서 관리됩니다"}
            </span>
          </div>
        )}
        <div className="flex justify-end gap-2">
          {!isQuick ? (
            <Button type="button" variant="secondary" size="sm">
              결과 직접 입력
            </Button>
          ) : null}
          {application.jobHref ? (
            <LinkButton href={application.jobHref} variant="secondary" size="sm">
              공고 보기
            </LinkButton>
          ) : null}
        </div>
      </div>
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
      <PageBreadcrumb keepOnMobile items={[{ label: "마이페이지" }, { label: "지원 현황" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">지원 현황</h1>
      <p className="mt-2.5 text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        지원완료부터 최종 결과까지 진행 상황을 확인합니다. 간편지원은 전형 단계를 실시간으로, 외부 지원은 기업이 관리하는 일정 기준으로 보여드립니다.
      </p>

      <div className="mt-7 flex items-center gap-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "relative flex items-center gap-1.5 pb-3 text-[15px] font-medium transition-colors",
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
          <div className="border border-border bg-white p-10 text-center">
            <p className="text-[15px] font-medium text-[#303946]">해당하는 지원 내역이 없습니다.</p>
            <p className="mt-2 text-[13px] font-normal text-[#8a94a3]">관심 있는 공고에 지원하면 이곳에서 진행 상황을 확인할 수 있습니다.</p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-border bg-white px-5 py-4">
        <p className="flex items-center gap-2 text-[13px] font-normal text-[#68717e]">
          <span aria-hidden="true" className="text-[13px] text-[#9aa3af]">
            ⓘ
          </span>
          지원한 공고가 보이지 않나요? 다른 계정으로 지원했거나, 삭제된 공고일 수 있습니다.
        </p>
        <Link href={sharedRoutes.support} className="shrink-0 text-[13px] font-medium text-[#111111] hover:underline">
          문의하기
        </Link>
      </div>
    </MyPageShell>
  );
}
