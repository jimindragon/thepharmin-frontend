"use client";

import clsx from "clsx";
import { Bookmark, Building2 } from "lucide-react";
import { useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { JobCard } from "@/components/JobCard";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { ScrapedOrganizationCard } from "@/components/mypage/ScrapedOrganizationCard";
import { ScrapUndoToast } from "@/components/mypage/ScrapUndoToast";
import { jobs } from "@/data/jobs";
import { scrapedJobIds, scrapedOrganizations } from "@/data/scraps";
import type { Job } from "@/types/jobs";

type ScrapTab = "jobs" | "organizations";

type PendingRemoval =
  | { type: "job"; id: number; label: string; index: number }
  | { type: "organization"; id: string; label: string; index: number };

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-[#dfe4ea] bg-white p-10 text-center">
      <p className="text-[14px] font-medium text-[#303946]">{title}</p>
      <p className="mt-2 text-[13px] font-normal leading-[1.6] text-[#8a94a3]">{description}</p>
    </div>
  );
}

export function MyPageScrapsClient() {
  const [activeTab, setActiveTab] = useState<ScrapTab>("jobs");
  const [jobIds, setJobIds] = useState<number[]>(scrapedJobIds);
  const [orgIds, setOrgIds] = useState<string[]>(scrapedOrganizations.map((organization) => organization.id));
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);

  const visibleJobs = useMemo(
    () => jobIds.map((id) => jobs.find((job) => job.id === id)).filter((job): job is Job => Boolean(job)),
    [jobIds],
  );

  const visibleOrganizations = useMemo(
    () => orgIds.map((id) => scrapedOrganizations.find((organization) => organization.id === id)).filter((item): item is (typeof scrapedOrganizations)[number] => Boolean(item)),
    [orgIds],
  );

  const tabs: { id: ScrapTab; label: string; count: number }[] = [
    { id: "jobs", label: "스크랩한 공고", count: jobIds.length },
    { id: "organizations", label: "스크랩한 기업·병원·약국", count: orgIds.length },
  ];

  const removeJob = (jobId: number) => {
    const index = jobIds.indexOf(jobId);
    if (index === -1) return;
    const job = jobs.find((item) => item.id === jobId);
    setJobIds((current) => current.filter((id) => id !== jobId));
    setPendingRemoval({ type: "job", id: jobId, label: job ? `${job.company} · ${job.title}` : "공고", index });
  };

  const removeOrganization = (organizationId: string) => {
    const index = orgIds.indexOf(organizationId);
    if (index === -1) return;
    const organization = scrapedOrganizations.find((item) => item.id === organizationId);
    setOrgIds((current) => current.filter((id) => id !== organizationId));
    setPendingRemoval({ type: "organization", id: organizationId, label: organization?.name ?? "기관", index });
  };

  const undoRemoval = () => {
    if (!pendingRemoval) return;

    if (pendingRemoval.type === "job") {
      setJobIds((current) => {
        const next = [...current];
        next.splice(pendingRemoval.index, 0, pendingRemoval.id);
        return next;
      });
    } else {
      setOrgIds((current) => {
        const next = [...current];
        next.splice(pendingRemoval.index, 0, pendingRemoval.id);
        return next;
      });
    }

    setPendingRemoval(null);
  };

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "스크랩" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">스크랩</h1>
      <p className="mt-2.5 max-w-[640px] text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        관심 있는 채용공고와 기업·병원·약국을 모아 보고, 마감 전에 다시 확인하세요.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-0 overflow-hidden border border-[#e0e5eb] bg-white p-1.5 max-[560px]:grid-cols-1 max-[560px]:gap-1.5">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex h-[48px] items-center justify-center gap-2 text-[15px] font-medium transition",
                active ? "bg-[#1b1f25] text-white shadow-[0_10px_22px_rgba(17,17,17,0.16)]" : "bg-white text-[#4b535f] hover:bg-[#f6f7f8]",
              )}
            >
              {tab.id === "jobs" ? <Bookmark size={16} strokeWidth={1.8} /> : <Building2 size={16} strokeWidth={1.8} />}
              <span>{tab.label}</span>
              <span
                className={clsx(
                  "inline-flex min-w-[24px] items-center justify-center rounded-full px-1.5 py-[2px] text-[12px]",
                  active ? "bg-white/18 text-white" : "bg-[#edf0f3] text-[#8a93a1]",
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {activeTab === "jobs" ? (
          visibleJobs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {visibleJobs.map((job) => (
                <JobCard key={job.id} job={job} isBookmarked onToggleBookmark={() => removeJob(job.id)} showBookmarkLabel />
              ))}
            </div>
          ) : (
            <EmptyState
              title="스크랩한 채용공고가 없습니다."
              description="관심 있는 공고를 스크랩해두면 마감 전에 이곳에서 빠르게 다시 확인할 수 있어요."
            />
          )
        ) : visibleOrganizations.length > 0 ? (
          <div className="flex flex-col gap-3">
            {visibleOrganizations.map((organization) => (
              <ScrapedOrganizationCard key={organization.id} organization={organization} onRemove={removeOrganization} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="스크랩한 기업·병원·약국이 없습니다."
            description="관심 있는 기업, 병원, 약국을 스크랩해두면 새 공고가 올라왔을 때 이곳에서 한눈에 확인할 수 있어요."
          />
        )}
      </div>

      {pendingRemoval ? (
        <ScrapUndoToast
          message={`${pendingRemoval.label} 스크랩을 해제했습니다.`}
          onUndo={undoRemoval}
          onDismiss={() => setPendingRemoval(null)}
        />
      ) : null}
    </MyPageShell>
  );
}
