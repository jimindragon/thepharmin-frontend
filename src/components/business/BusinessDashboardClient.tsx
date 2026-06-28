"use client";

import Link from "next/link";
import clsx from "clsx";
import { User, Clock, MessageSquare, CalendarDays, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { BusinessStatCard, BusinessStatGrid } from "@/components/business/BusinessStatCard";
import { jobPostings, jobTrackLabel } from "@/data/businessJobs";
import { initialBusinessCompanyProfile } from "@/data/businessCompanyProfile";

// ─── derived from existing mock data ──────────────────────────────────────────

const COMPANY_NAME = initialBusinessCompanyProfile.displayName;

const activeJobs = jobPostings.filter((j) => j.status === "active");

function getJobDday(job: (typeof jobPostings)[0]): { value: number; isUrgent: boolean } {
  if (job.boost) return { value: job.boost.daysLeft, isUrgent: job.boost.isUrgent };
  if (!job.closingDate) return { value: 0, isUrgent: false };
  const [y, m, d] = job.closingDate.split(".");
  const diff = Math.round(
    (new Date(+y, +m - 1, +d).getTime() - new Date(2026, 5, 27).getTime()) /
      86400000,
  );
  return { value: diff, isUrgent: diff <= 3 };
}

// ─── dashboard-only mock data ─────────────────────────────────────────────────

const TASKS: Array<{
  id: string;
  Icon: LucideIcon;
  title: string;
  badge: { label: string; className: string };
  desc: string;
  action: { label: string; href: string };
}> = [
  {
    id: "t1",
    Icon: User,
    title: "신규 지원자 3명이 검토를 기다려요",
    badge: { label: "미검토", className: "border-status-error-border bg-status-error-subtle text-status-error" },
    desc: "제제연구 선임연구원 모집 · 가장 오래된 지원 3일 경과",
    action: { label: "지원자 검토", href: "/business/applicants" },
  },
  {
    id: "t2",
    Icon: Clock,
    title: "임상개발 PM 채용 공고가 곧 마감돼요",
    badge: { label: "D-2", className: "border-status-error-border bg-status-error-subtle text-status-error" },
    desc: "2026.07.21 마감 · 현재 지원자 4명 · 연장하거나 마감 처리하세요",
    action: { label: "공고 연장", href: "/business/jobs" },
  },
  {
    id: "t3",
    Icon: MessageSquare,
    title: "헤드헌팅 후보자 CAND-008이 검토를 기다려요",
    badge: { label: "검토 대기", className: "border-status-warning-border bg-status-warning-subtle text-status-warning" },
    desc: "RA 팀장급 (허가 전략) · 적합도 88% · 6월 5일 추천됨",
    action: { label: "후보자 확인", href: "/business/headhunting/manage" },
  },
  {
    id: "t4",
    Icon: CalendarDays,
    title: "정수민님 최종 면접 일정을 확정하세요",
    badge: { label: "D-2", className: "border-status-error-border bg-status-error-subtle text-status-error" },
    desc: "제제연구 선임연구원 · 6월 29일(일) 14:00 제안됨",
    action: { label: "일정 확정", href: "/business/applicants" },
  },
  {
    id: "t5",
    Icon: FileText,
    title: "CAND-009 처우 협의가 진행 중이에요",
    badge: { label: "처우 협의", className: "border-status-positive-border bg-status-positive-subtle text-status-positive" },
    desc: "RA 팀장급 (허가 전략) · 헤드헌터 회신 필요",
    action: { label: "협의 보기", href: "/business/headhunting/manage" },
  },
];

const UPCOMING_INTERVIEWS = [
  {
    id: "i1",
    day: "29",
    monthLabel: "6월 일",
    time: "14:00",
    candidate: "정수민",
    stage: "최종 면접",
    posting: "제제연구 선임연구원 모집",
    badge: { label: "일정 확정 대기", className: "border-status-warning-border bg-status-warning-subtle text-status-warning" },
  },
  {
    id: "i2",
    day: "02",
    monthLabel: "7월 수",
    time: "10:30",
    candidate: "CAND-014",
    stage: "1차 면접",
    posting: "임상개발 PM (CRA 총괄) · 헤드헌팅",
    badge: { label: "확정", className: "border-status-positive-border bg-status-positive-subtle text-status-positive" },
  },
];

const RECENT_ACTIVITIES = [
  { id: "a1", text: "윤가람님이 제제연구 선임연구원 모집에 지원했어요", time: "방금 전" },
  { id: "a2", text: "서나윤님이 지원해 서류 검토 단계로 이동했어요", time: "2시간 전" },
  { id: "a3", text: "헤드헌터가 CAND-008 후보자를 추천했어요", time: "어제" },
  { id: "a4", text: "배기태님에게 합격 제안을 보냈어요", time: "2일 전" },
  { id: "a5", text: "임상개발 PM 채용 공고를 게시했어요", time: "3일 전" },
];

// ─── sub-components ───────────────────────────────────────────────────────────

function TaskRow({
  Icon,
  title,
  badge,
  desc,
  action,
}: (typeof TASKS)[0]) {
  return (
    <div className="flex items-start gap-3 px-5 py-4 max-[600px]:flex-wrap">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-[#e5e9ef] bg-[#f7f8fa]">
        <Icon className="h-[15px] w-[15px] text-[#596373]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[#17202c]">{title}</span>
          <span
            className={clsx(
              "inline-flex h-5 items-center border px-1.5 text-[11px] font-medium",
              badge.className,
            )}
          >
            {badge.label}
          </span>
        </div>
        <p className="mt-0.5 text-[12px] leading-[1.5] text-[#68717e]">{desc}</p>
      </div>
      <Link
        href={action.href}
        className="inline-flex h-8 shrink-0 items-center border border-[#cfd8e3] bg-white px-3 text-[12px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111] max-[600px]:ml-11"
      >
        {action.label}
      </Link>
    </div>
  );
}

function InterviewRow({
  day,
  monthLabel,
  time,
  candidate,
  stage,
  posting,
  badge,
}: (typeof UPCOMING_INTERVIEWS)[0]) {
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <div className="w-12 shrink-0 text-center">
        <p className="text-[22px] font-black leading-none tracking-[-0.02em] text-[#17202c]">
          {day}
        </p>
        <p className="mt-1 text-[11px] text-[#8a94a3]">{monthLabel}</p>
        <p className="mt-1 text-[12px] font-semibold text-[#4f5967]">{time}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#17202c]">
          {candidate}
          <span className="ml-1.5 font-normal text-[#68717e]">· {stage}</span>
        </p>
        <p className="mt-0.5 text-[12px] text-[#8a94a3]">{posting}</p>
        <div className="mt-2">
          <span
            className={clsx(
              "inline-flex h-5 items-center border px-1.5 text-[11px] font-medium",
              badge.className,
            )}
          >
            {badge.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function BusinessDashboardClient() {
  return (
    <BusinessCenterShell>
      <div className="space-y-6">

        {/* 브레드크럼 + 인사 영역 */}
        <div>
          <PageBreadcrumb
            items={[
              { label: "기업센터" },
              { label: "대시보드" },
            ]}
          />
          <div className="mt-5 flex flex-wrap items-start justify-between gap-y-3">
          <div>
            <h1 className="text-[26px] font-bold leading-[1.35] tracking-[-0.02em] text-[#17202c] max-[760px]:text-[22px]">
              안녕하세요,{" "}
              <span className="text-status-positive">{COMPANY_NAME}</span>님
              <br />
              오늘 처리할 항목이 있어요.
            </h1>
            <p className="mt-2 text-[13px] text-[#68717e]">
              <span className="font-semibold text-[#17202c]">처리 대기 5건</span>
              <span className="mx-1 text-[#c0c8d2]">·</span>
              신규 지원 3{" "}
              <span className="text-[#c0c8d2]">·</span>
              {" "}마감 임박 1{" "}
              <span className="text-[#c0c8d2]">·</span>
              {" "}후보자 회신 1
            </p>
          </div>
          <div className="text-right">
            <p className="text-[13px] text-[#8a94a3]">2026년 6월 27일 금요일</p>
            <p className="mt-0.5 text-[13px] font-medium text-[#4f5967]">
              채용 진행 중 {activeJobs.length}개 공고
            </p>
          </div>
          </div>
        </div>

        {/* 통계 4분할 */}
        <BusinessStatGrid cols={4}>
          <BusinessStatCard
            label="진행 중 공고"
            value={String(activeJobs.length)}
            unit="개"
            sub={`전체 등록 공고 ${jobPostings.length}개 중 게시 중`}
          />
          <BusinessStatCard
            label="신규 지원자"
            value="3"
            unit="명"
            sub="최근 7일 · 미검토 3명"
          />
          <BusinessStatCard
            label="면접 예정"
            value="2"
            unit="건"
            subEmphasis="D-2 이내 1건"
            emphasisVariant="urgent"
          />
          <BusinessStatCard
            label="진행 중 헤드헌팅"
            value="3"
            unit="건"
            sub="추천 후보자 6명 · 검토 대기 2명"
          />
        </BusinessStatGrid>

        {/* 메인 2컬럼 레이아웃 */}
        <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-4 max-[900px]:grid-cols-1">

          {/* 좌측: 처리할 항목 + 공고별 지원 현황 */}
          <div className="space-y-4">

            {/* 처리할 항목 */}
            <section className="border border-[#dfe4ea] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e9ef] px-5 py-4">
                <h2 className="text-[14px] font-bold text-[#17202c]">
                  처리할 항목
                  <span className="ml-2 text-status-positive">5</span>
                </h2>
                <Link
                  href="/business/applicants"
                  className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]"
                >
                  전체 보기 ›
                </Link>
              </div>
              <div className="divide-y divide-[#e5e9ef]">
                {TASKS.map((task) => (
                  <TaskRow key={task.id} {...task} />
                ))}
              </div>
            </section>

            {/* 공고별 지원 현황 */}
            <section className="border border-[#dfe4ea] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e9ef] px-5 py-4">
                <h2 className="text-[14px] font-bold text-[#17202c]">공고별 지원 현황</h2>
                <Link
                  href="/business/jobs"
                  className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]"
                >
                  공고 관리 ›
                </Link>
              </div>
              <div className="divide-y divide-[#e5e9ef]">
                {activeJobs.map((job) => {
                  const dday = getJobDday(job);
                  return (
                    <div
                      key={job.id}
                      className="grid grid-cols-[minmax(0,1fr)_56px_56px] items-center gap-3 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[13px] font-semibold text-[#17202c]">
                            {job.title}
                          </span>
                          <span className="inline-flex h-5 items-center border border-[#d8e0e8] px-1.5 text-[11px] font-medium text-[#596373]">
                            {jobTrackLabel(job.track)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[12px] text-[#8a94a3]">
                          {job.registeredAt} 등록 · 게시 중
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-bold text-[#17202c]">
                          {job.applicantCount}
                        </p>
                        <p className="text-[11px] text-[#8a94a3]">지원자</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={clsx(
                            "text-[13px] font-bold",
                            dday.isUrgent ? "text-status-urgent" : "text-[#4f5967]",
                          )}
                        >
                          D-{dday.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* 우측: 다가오는 면접 + 최근 활동 */}
          <div className="space-y-4">

            {/* 다가오는 면접 */}
            <section className="border border-[#dfe4ea] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e9ef] px-5 py-4">
                <h2 className="text-[14px] font-bold text-[#17202c]">다가오는 면접</h2>
                <span className="cursor-default text-[12px] text-[#c0c8d2]">캘린더 ›</span>
              </div>
              <div className="divide-y divide-[#e5e9ef]">
                {UPCOMING_INTERVIEWS.map((item) => (
                  <InterviewRow key={item.id} {...item} />
                ))}
              </div>
            </section>

            {/* 최근 활동 */}
            <section className="border border-[#dfe4ea] bg-white">
              <div className="border-b border-[#e5e9ef] px-5 py-4">
                <h2 className="text-[14px] font-bold text-[#17202c]">최근 활동</h2>
              </div>
              <div className="divide-y divide-[#e5e9ef]">
                {RECENT_ACTIVITIES.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 px-5 py-3">
                    <div className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-status-positive" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-[1.5] text-[#17202c]">{act.text}</p>
                      <p className="mt-0.5 text-[12px] text-[#8a94a3]">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </BusinessCenterShell>
  );
}
