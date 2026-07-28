"use client";

import clsx from "clsx";
import { CalendarDays, FileText, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { JobTagChip } from "@/components/shared/JobTagChip";
import { ResumePrimaryBadge } from "@/components/shared/ResumePrimaryBadge";
import { DashboardMiniCalendar } from "@/components/mypage/DashboardMiniCalendar";
import { myPageUser } from "@/config/myPageMenu";
import { optionLabelMaps } from "@/config/jobFilters/index";
import { calculateResumeCompletion, mockResumes, type BuiltResume } from "@/data/resumes";
import {
  MYPAGE_MOCK_TODAY,
  mockApplications,
  type JobApplication,
} from "@/data/mockApplications";
import { MOCK_PERSONAL_NOTIFICATIONS } from "@/data/notifications";
import { getAllStoredJobPreferences } from "@/hooks/useJobPreferenceStorage";
import { useNotificationReadState } from "@/hooks/useNotificationReadState";
import {
  formatKoreanDate,
  getDaysUntil,
  getDdayInfo,
  toMonthDay,
  type DdayTier,
} from "@/utils/dday";

// ─── mock data ─────────────────────────────────────────────────────────────────

const USER_NAME = myPageUser.name;

const DDAY_BADGE_STYLE: Record<DdayTier, { className: string; dotClassName?: string }> = {
  urgent: { className: "text-status-urgent" },
  warning: { className: "text-status-warning" },
  neutral: { className: "text-[#4f5967]" },
};

/**
 * "지금 확인할 일"에 노출되는 임박 기준의 단일 출처 — 면접은 D-1 이내, 서류발표는 D-4 이내.
 * "지금 확인할 일"은 이 조건을 그대로 쓰고, "다가오는 일정"(우측 레일)은 이 조건의 부정(!)을 써서
 * 같은 이벤트가 두 섹션에 동시에 나타나지 않게 한다.
 */
function isApplicationEventImminent(app: JobApplication): boolean {
  if (!app.nextEventDate) return false;
  const daysLeft = getDaysUntil(app.nextEventDate, MYPAGE_MOCK_TODAY);
  if (app.currentStage === "interview") return daysLeft >= 0 && daysLeft <= 1;
  if (app.currentStage === "screening") return daysLeft >= 0 && daysLeft <= 4;
  return false;
}

type UpcomingSchedule = {
  id: string;
  date: string;
  eventLabel: string;
  jobTitle: string;
  company: string;
  badge: { ddayPrefix: string } | { label: string; className: string; dotClassName?: string };
};

// 다가오는 일정(우측 레일) — 예정 일정 전체(내부·외부, 면접·서류발표·마감). 좌측 "지금 확인할 일"과는
// 관점이 달라(우측=일정 뷰, 좌측=행동 큐) 임박 건도 의도적으로 병존시킨다.
function buildUpcomingSchedules(): UpcomingSchedule[] {
  return mockApplications
    .filter((app) => !app.isClosed && app.nextEventDate)
    .map((app) => ({
      id: app.id,
      date: app.nextEventDate as string,
      eventLabel:
        app.currentStage === "interview"
          ? "최종 면접"
          : app.currentStage === "screening"
            ? "서류 발표"
            : "지원 마감",
      jobTitle: app.jobTitle,
      company: app.company,
      badge:
        app.currentStage === "interview"
          ? { ddayPrefix: "면접 " }
          : app.currentStage === "screening"
            ? { ddayPrefix: "발표 " }
            : { ddayPrefix: "마감 " },
    }))
    .sort((a, b) => getDaysUntil(a.date, MYPAGE_MOCK_TODAY) - getDaysUntil(b.date, MYPAGE_MOCK_TODAY));
}

// ─── "지금 확인할 일" 파생 로직 ─────────────────────────────────────────────────

type ChecklistRow = {
  id: string;
  Icon: LucideIcon;
  title: string;
  meta: string;
  ctaLabel: string;
  href: string;
  isNewBadge: boolean;
  onNavigate?: () => void;
};

// "지금 확인할 일"의 임박 일정 — isApplicationEventImminent를 만족하는 지원 건만
function buildScheduleChecklist(): Array<ChecklistRow & { daysLeft: number }> {
  return mockApplications
    .filter((app) => !app.isClosed && isApplicationEventImminent(app))
    .map((app) => {
      const daysLeft = getDaysUntil(app.nextEventDate as string, MYPAGE_MOCK_TODAY);
      if (app.currentStage === "interview") {
        return {
          id: `check-${app.id}`,
          Icon: CalendarDays,
          title: app.jobTitle,
          meta: `면접 ${daysLeft === 0 ? "오늘" : "내일"} · ${app.company}`,
          ctaLabel: "지원 현황",
          href: "/mypage/applications",
          isNewBadge: false,
          daysLeft,
        };
      }
      return {
        id: `check-${app.id}`,
        Icon: FileText,
        title: app.jobTitle,
        meta: `서류 발표 D-${daysLeft} · ${app.company} · ${toMonthDay(app.nextEventDate as string)}`,
        ctaLabel: "지원 현황",
        href: "/mypage/applications",
        isNewBadge: false,
        daysLeft,
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

function formatScheduleDayParts(dateStr: string) {
  const [, m, d] = dateStr.split(".").map(Number);
  return {
    day: String(d).padStart(2, "0"),
    monthLabel: `${m}월`,
    time: dateStr === MYPAGE_MOCK_TODAY ? "오늘" : "",
  };
}

function resolveScheduleBadge(
  badge: UpcomingSchedule["badge"],
  date: string,
): { label: string; className: string; dotClassName?: string } {
  if ("ddayPrefix" in badge) {
    const dday = getDdayInfo(date, MYPAGE_MOCK_TODAY);
    return { label: `${badge.ddayPrefix}${dday.label}`, ...DDAY_BADGE_STYLE[dday.tier] };
  }
  return badge;
}

// ─── sub-components ────────────────────────────────────────────────────────────

function ChecklistRowCell({ Icon, title, meta, ctaLabel, href, isNewBadge, onNavigate }: ChecklistRow) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-start gap-3 px-5 py-4 transition hover:bg-[#f7f8fa] max-[600px]:flex-wrap"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-[#e5e9ef] bg-[#f7f8fa]">
        <Icon className="h-[15px] w-[15px] text-[#596373]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[16px] font-semibold text-[#17202c]">{title}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-[12px]">
          {isNewBadge ? (
            <span className="inline-flex w-fit items-center gap-[8px]">
              <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-status-positive-dot" />
              <span className="text-[13px] font-medium text-status-positive">신규</span>
            </span>
          ) : null}
          <p className="text-[13px] leading-[1.5] text-[#68717e]">{meta}</p>
        </div>
      </div>
      <span className="inline-flex h-8 shrink-0 items-center border border-[#cfd8e3] bg-white px-3 text-[13px] font-medium text-[#303946] max-[600px]:ml-11">
        {ctaLabel}
      </span>
    </Link>
  );
}

function ScheduleRow({ date, eventLabel, jobTitle, company, badge: badgeInput }: UpcomingSchedule) {
  const { day, monthLabel, time } = formatScheduleDayParts(date);
  const badge = resolveScheduleBadge(badgeInput, date);
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <div className="w-12 shrink-0 text-center">
        <p className="text-[24px] font-black leading-none tracking-[-0.02em] text-[#17202c]">{day}</p>
        <p className="mt-1 text-[13px] text-[#8a94a3]">{monthLabel}</p>
        {time ? (
          <p className="mt-1 text-[13px] font-semibold text-status-urgent">{time}</p>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[17px] font-semibold leading-tight text-[#17202c]">{eventLabel}</p>
        <p className="mt-1.5 text-[15px] text-[#8a94a3]">{jobTitle} · {company}</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="inline-flex w-fit items-center gap-[8px]">
            {badge.dotClassName ? (
              <span className={`h-[8px] w-[8px] rounded-full shrink-0 ${badge.dotClassName}`} />
            ) : null}
            <span className={clsx("text-[13px] font-medium", badge.className)}>
              {badge.label}
            </span>
          </span>
          <Link
            href="/mypage/applications"
            className="inline-flex h-8 shrink-0 items-center border border-[#cfd8e3] bg-white px-3 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
          >
            지원 보기
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────────

export function MyPageDashboardClient() {
  const builtResumes = mockResumes.filter((r): r is BuiltResume => r.kind === "built");
  const [hasPreferences, setHasPreferences] = useState(false);

  useEffect(() => {
    const stored = getAllStoredJobPreferences();
    setHasPreferences(Object.keys(stored).length > 0);
  }, []);

  const { isRead, markRead, isLoaded } = useNotificationReadState("personal");

  const unreadProposals = isLoaded
    ? MOCK_PERSONAL_NOTIFICATIONS.filter(
        (notification) => notification.kind === "proposal" && !isRead(notification.id),
      ).sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
    : [];

  const proposalChecklist: ChecklistRow[] = unreadProposals.map((notification) => ({
    id: notification.id,
    Icon: MessageSquare,
    title: notification.subjectLabel ?? notification.title,
    meta: `받은 날짜 ${notification.createdAt.split(" ")[0]}`,
    ctaLabel: "받은 제안",
    href: notification.href,
    isNewBadge: true,
    onNavigate: () => markRead(notification.id),
  }));

  const checklistRows: ChecklistRow[] = [...buildScheduleChecklist(), ...proposalChecklist].slice(0, 4);
  const upcomingSchedules = buildUpcomingSchedules();

  return (
    <MyPageShell>
      <div className="space-y-6">

        {/* 브레드크럼 + 인사 영역 */}
        <div>
          <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "대시보드" }]} />
          <div className="mt-5 flex flex-wrap items-start justify-between gap-y-3">
            <div>
              <h1 className="text-[28px] font-bold leading-[1.35] tracking-[-0.02em] text-[#17202c] max-[760px]:text-[24px]">
                안녕하세요,{" "}
                <span className="text-gradient-cta">{USER_NAME}</span>님
                <br />
                진행 중인 지원과 예정된 일정을 확인해 보세요.
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[13px] text-[#8a94a3]">{formatKoreanDate(MYPAGE_MOCK_TODAY)}</p>
              <p className="mt-0.5 text-[13px] font-medium text-[#4f5967]">
                제안 받기 켜짐 · 공개 이력서 1건
              </p>
            </div>
          </div>
        </div>

        {/* 메인 2컬럼 레이아웃 */}
        <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4 max-[900px]:grid-cols-1">

          {/* 좌측: 지금 확인할 일 + 내 이력서 + 관심 조건 */}
          <div className="space-y-4">

            {/* 지금 확인할 일 — 임박 일정(날짜 파생) + 미열람 제안(알림 읽음 상태 파생) */}
            <section className="border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[17px] font-bold text-[#17202c]">
                  지금 확인할 일
                  <span className="ml-2 text-status-positive">{checklistRows.length}</span>
                </h2>
                <Link
                  href="/mypage/notifications"
                  className="text-[13px] text-[#8a94a3] transition hover:text-[#111111]"
                >
                  알림 전체 보기 ›
                </Link>
              </div>
              {checklistRows.length > 0 ? (
                <div className="divide-y divide-[#e5e9ef]">
                  {checklistRows.map((row) => (
                    <ChecklistRowCell key={row.id} {...row} />
                  ))}
                </div>
              ) : (
                <p className="px-5 py-4 text-[13px] text-[#8a94a3]">지금 확인할 항목이 없습니다</p>
              )}
            </section>

            {/* 내 이력서 — 작성형 이력서 전체를 행으로 상시 표시(첨부형 pdf 제외) */}
            <section className="border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[17px] font-bold text-[#17202c]">내 이력서</h2>
                <Link
                  href="/mypage/resume"
                  className="text-[13px] text-[#8a94a3] transition hover:text-[#111111]"
                >
                  전체 보기 ›
                </Link>
              </div>
              <div className="divide-y divide-[#e5e9ef]">
                {builtResumes.map((resume) => {
                  const completion = calculateResumeCompletion(resume);
                  const isComplete = completion === 100;
                  const tagLabels = resume.jobSubcategoryIds
                    .map((id) => optionLabelMaps.jobSubcategory?.get(id) ?? id)
                    .slice(0, 3);
                  return (
                    <div key={resume.id} className="grid grid-cols-[minmax(0,1fr)_120px] items-center gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[16px] font-semibold text-[#17202c]">{resume.title}</span>
                          {resume.isPrimary ? <ResumePrimaryBadge /> : null}
                        </div>
                        {tagLabels.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {tagLabels.map((label) => (
                              <JobTagChip key={label}>{label}</JobTagChip>
                            ))}
                          </div>
                        ) : null}
                        <span className="mt-3 inline-flex items-center gap-[8px]">
                          <span
                            className={clsx(
                              "h-[8px] w-[8px] shrink-0 rounded-full",
                              isComplete ? "bg-status-positive-dot" : "bg-status-warning-dot",
                            )}
                          />
                          <span
                            className={clsx(
                              "text-[13px] font-medium",
                              isComplete ? "text-status-positive" : "text-status-warning",
                            )}
                          >
                            {isComplete ? "작성 완료" : `작성 중 · ${completion}%`}
                          </span>
                        </span>
                      </div>
                      <Link
                        href="/mypage/resume"
                        className="inline-flex h-8 w-full items-center justify-center border border-[#cfd8e3] bg-white px-3 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
                      >
                        {isComplete ? "보기" : "이어 작성하기"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 관심 조건 — 설정 여부에 따라 요약/설정 유도, 상시 표시 */}
            <section className="border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[17px] font-bold text-[#17202c]">관심 조건</h2>
                <Link
                  href="/mypage/preferences"
                  className="text-[13px] text-[#8a94a3] transition hover:text-[#111111]"
                >
                  수정 ›
                </Link>
              </div>
              <div className="px-5 py-4">
                {hasPreferences ? (
                  <p className="text-[15px] leading-[1.7] text-[#68717e]">
                    RA 외 2개 / 3~5년 · 서울·경기
                    <br />
                    이메일 알림 꺼짐{" "}
                    <Link href="/mypage/preferences" className="text-[13px] text-[#8a94a3] transition hover:text-[#111111]">
                      알림 켜기
                    </Link>
                  </p>
                ) : (
                  <p className="text-[15px] leading-[1.7] text-[#68717e]">
                    아직 설정한 관심 조건이 없습니다.
                    <br />
                    <Link href="/mypage/preferences" className="text-[13px] text-[#8a94a3] transition hover:text-[#111111]">
                      관심 조건 설정 ›
                    </Link>
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* 우측: 미니 캘린더 + 다가오는 일정 */}
          <div className="space-y-4">

            {/* 이번 달 미니 캘린더 — 표시 전용(월 이동·선택 없음), 전체 캘린더 보기만 /calendar 연결 */}
            <DashboardMiniCalendar />

            {/* 다가오는 일정 — 예정 일정 전체(내부·외부, 면접·서류발표·마감) */}
            <section className="border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[17px] font-bold text-[#17202c]">다가오는 일정</h2>
                <Link
                  href="/calendar"
                  className="text-[13px] text-[#8a94a3] transition hover:text-[#111111]"
                >
                  캘린더 ›
                </Link>
              </div>
              {upcomingSchedules.length > 0 ? (
                <div className="divide-y divide-[#e5e9ef]">
                  {upcomingSchedules.map((item) => (
                    <ScheduleRow key={item.id} {...item} />
                  ))}
                </div>
              ) : (
                <p className="px-5 py-4 text-[13px] text-[#8a94a3]">예정된 일정이 없습니다</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </MyPageShell>
  );
}
