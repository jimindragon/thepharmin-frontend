"use client";

import clsx from "clsx";
import { CalendarDays, FileText, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { myPageUser } from "@/config/myPageMenu";
import { calculateResumeCompletion, mockResumes, type BuiltResume } from "@/data/resumes";
import {
  applicationStages,
  MYPAGE_MOCK_TODAY,
  mockApplications,
  type JobApplication,
} from "@/data/mockApplications";
import { MOCK_PERSONAL_NOTIFICATIONS } from "@/data/notifications";
import { getAllStoredJobPreferences } from "@/hooks/useJobPreferenceStorage";
import { useNotificationReadState } from "@/hooks/useNotificationReadState";
import { formatDday, getDaysUntil, getDdayInfo, toMonthDay, type DdayTier } from "@/utils/dday";

// ─── mock data ─────────────────────────────────────────────────────────────────

const USER_NAME = myPageUser.name;

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function formatKoreanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split(".").map(Number);
  const date = new Date(y, m - 1, d);
  return `${y}년 ${m}월 ${d}일 ${WEEKDAY_LABELS[date.getDay()]}요일`;
}

const DDAY_BADGE_STYLE: Record<DdayTier, { className: string; dotClassName?: string }> = {
  urgent: { className: "text-status-urgent" },
  warning: { className: "text-status-warning" },
  neutral: { className: "text-[#4f5967]" },
};

// 대시보드 "지원 현황" 컴팩트 행 상태 라벨: 단계별 고정 색상(면접=urgent, 서류발표=warning, 그 외=중립)
function getCompactApplicationStatus(app: JobApplication): { label: string; className: string } {
  if (!app.nextEventDate) {
    return { label: app.statusLabel, className: "text-[#4f5967]" };
  }
  const dday = formatDday(getDaysUntil(app.nextEventDate, MYPAGE_MOCK_TODAY));
  if (app.currentStage === "interview") {
    return { label: `면접 ${dday}`, className: "text-status-urgent" };
  }
  if (app.currentStage === "screening") {
    return { label: `서류 발표 ${dday}`, className: "text-status-warning" };
  }
  return { label: `마감 ${dday}`, className: "text-[#4f5967]" };
}

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
  title: string;
  company: string;
  badge: { ddayPrefix: string } | { label: string; className: string; dotClassName?: string };
};

// 다가오는 일정(우측 레일) — 내부 지원(면접·서류발표)만, 임박(=지금 확인할 일에 이미 노출됨)한 건 제외.
function buildUpcomingSchedules(): UpcomingSchedule[] {
  return mockApplications
    .filter(
      (app) =>
        !app.isClosed &&
        app.applyChannel !== "external" &&
        app.nextEventDate &&
        !isApplicationEventImminent(app),
    )
    .map((app) => ({
      id: app.id,
      date: app.nextEventDate as string,
      title: app.currentStage === "interview" ? `${app.jobTitle} · 최종 면접` : `${app.jobTitle} · 서류 발표`,
      company: app.company,
      badge:
        app.currentStage === "interview"
          ? { ddayPrefix: "면접 " }
          : { label: "발표 예정", className: "text-status-warning", dotClassName: "bg-status-warning-dot" },
    }))
    .sort((a, b) => getDaysUntil(a.date, MYPAGE_MOCK_TODAY) - getDaysUntil(b.date, MYPAGE_MOCK_TODAY));
}

// 요약 행 "예정 일정" — 중복 방지 필터 적용 전, 오늘 포함 이후 면접·발표 이벤트 전체 수
const UPCOMING_EVENT_COUNT = mockApplications.filter(
  (app) =>
    !app.isClosed &&
    app.applyChannel !== "external" &&
    app.nextEventDate &&
    getDaysUntil(app.nextEventDate, MYPAGE_MOCK_TODAY) >= 0,
).length;

function DashboardSummaryCell({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="block px-4 py-4 text-center transition hover:bg-[#f7f8fa]">
      <p className="text-[13px] text-[#8a94a3]">{label}</p>
      <p className="mt-1 text-[20px] font-bold text-[#17202c]">{value}</p>
    </Link>
  );
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
          title: `${app.jobTitle} 면접이 ${daysLeft === 0 ? "오늘" : "내일"} 예정되어 있습니다`,
          meta: app.company,
          ctaLabel: "일정 보기",
          href: "/mypage/applications",
          isNewBadge: false,
          daysLeft,
        };
      }
      return {
        id: `check-${app.id}`,
        Icon: FileText,
        title: `${app.jobTitle} 서류 발표가 D-${daysLeft} 남았습니다`,
        meta: `${app.company} · ${toMonthDay(app.nextEventDate as string)} 발표 예정`,
        ctaLabel: "지원 보기",
        href: "/mypage/applications",
        isNewBadge: false,
        daysLeft,
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

function formatScheduleDayParts(dateStr: string) {
  const [y, m, d] = dateStr.split(".").map(Number);
  const date = new Date(y, m - 1, d);
  return {
    day: String(d).padStart(2, "0"),
    monthLabel: `${m}월 ${WEEKDAY_LABELS[date.getDay()]}`,
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
          <span className="text-[13px] font-semibold text-[#17202c]">{title}</span>
          {isNewBadge ? (
            <span className="inline-flex w-fit items-center gap-[8px]">
              <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-status-positive-dot" />
              <span className="text-[12px] font-medium text-status-positive">신규</span>
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-[12px] leading-[1.5] text-[#68717e]">{meta}</p>
      </div>
      <span className="inline-flex h-8 shrink-0 items-center border border-[#cfd8e3] bg-white px-3 text-[12px] font-medium text-[#303946] max-[600px]:ml-11">
        {ctaLabel}
      </span>
    </Link>
  );
}

function ScheduleRow({ date, title, company, badge: badgeInput }: UpcomingSchedule) {
  const { day, monthLabel, time } = formatScheduleDayParts(date);
  const badge = resolveScheduleBadge(badgeInput, date);
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <div className="w-12 shrink-0 text-center">
        <p className="text-[22px] font-black leading-none tracking-[-0.02em] text-[#17202c]">{day}</p>
        <p className="mt-1 text-[11px] text-[#8a94a3]">{monthLabel}</p>
        {time ? (
          <p className="mt-1 text-[12px] font-semibold text-status-urgent">{time}</p>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#17202c]">{title}</p>
        <p className="mt-0.5 text-[12px] text-[#8a94a3]">{company}</p>
        <div className="mt-2">
          <span className="inline-flex w-fit items-center gap-[8px]">
            {badge.dotClassName ? (
              <span className={`h-[8px] w-[8px] rounded-full shrink-0 ${badge.dotClassName}`} />
            ) : null}
            <span className={clsx("text-[12px] font-medium", badge.className)}>
              {badge.label}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────────

export function MyPageDashboardClient() {
  const builtResumes = mockResumes.filter((r): r is BuiltResume => r.kind === "built");
  const incompleteResume = builtResumes.find((r) => calculateResumeCompletion(r) < 100);
  const [emailAlertOn, setEmailAlertOn] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);

  useEffect(() => {
    const stored = getAllStoredJobPreferences();
    setHasPreferences(Object.keys(stored).length > 0);
    setEmailAlertOn(Object.values(stored).some((preference) => preference?.emailAlertEnabled));
  }, []);

  const { isRead, markRead } = useNotificationReadState("personal");

  const unreadProposals = MOCK_PERSONAL_NOTIFICATIONS.filter(
    (notification) => notification.kind === "proposal" && !isRead(notification.id),
  ).sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

  const proposalChecklist: ChecklistRow[] = unreadProposals.map((notification) => ({
    id: notification.id,
    Icon: MessageSquare,
    title: notification.title,
    meta: `받은 날짜 ${notification.createdAt.split(" ")[0]}`,
    ctaLabel: "제안 확인",
    href: notification.href,
    isNewBadge: true,
    onNavigate: () => markRead(notification.id),
  }));

  const checklistRows: ChecklistRow[] = [...buildScheduleChecklist(), ...proposalChecklist].slice(0, 4);
  const upcomingSchedules = buildUpcomingSchedules();

  // 지원 현황 — 진행 중(비종료) 건만, 다음 일정이 가까운 순으로. 외부 지원(일정 없음 취급)은 항상 마지막.
  const inProgressApplications = mockApplications.filter((app) => !app.isClosed);
  const dashboardApplications = [...inProgressApplications]
    .sort((a, b) => {
      const aExternal = a.applyChannel === "external";
      const bExternal = b.applyChannel === "external";
      if (aExternal !== bExternal) return aExternal ? 1 : -1;
      if (a.nextEventDate && b.nextEventDate) {
        return getDaysUntil(a.nextEventDate, MYPAGE_MOCK_TODAY) - getDaysUntil(b.nextEventDate, MYPAGE_MOCK_TODAY);
      }
      return 0;
    })
    .slice(0, 3);

  const SUMMARY_STATS: Array<{ label: string; value: number; href: string }> = [
    { label: "미확인 제안", value: unreadProposals.length, href: "/mypage/offers" },
    { label: "진행 중 지원", value: inProgressApplications.length, href: "/mypage/applications" },
    { label: "예정 일정", value: UPCOMING_EVENT_COUNT, href: "/calendar" },
  ];

  // 관심 조건 카드 — 조건 미설정 또는 이메일 알림 꺼짐일 때만 노출(정상 설정 시 사이드바 메뉴로 충분)
  const showPreferencesCard = !hasPreferences || !emailAlertOn;

  return (
    <MyPageShell>
      <div className="space-y-6">

        {/* 브레드크럼 + 인사 영역 */}
        <div>
          <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "대시보드" }]} />
          <div className="mt-5 flex flex-wrap items-start justify-between gap-y-3">
            <div>
              <h1 className="text-[26px] font-bold leading-[1.35] tracking-[-0.02em] text-[#17202c] max-[760px]:text-[22px]">
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

        {/* 요약 행 — 미확인 제안 / 진행 중 지원 / 예정 일정 (구분선+타이포, IndustryDividerStatCell과 동일 계열) */}
        <div className="grid grid-cols-3 divide-x divide-[#e5e9ef] border border-border bg-white">
          {SUMMARY_STATS.map((stat) => (
            <DashboardSummaryCell key={stat.label} {...stat} />
          ))}
        </div>

        {/* 메인 2컬럼 레이아웃 */}
        <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-4 max-[900px]:grid-cols-1">

          {/* 좌측: 지금 확인할 일 + 지원 현황 */}
          <div className="space-y-4">

            {/* 지금 확인할 일 — 임박 일정(날짜 파생) + 미열람 제안(알림 읽음 상태 파생) */}
            <section className="border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[14px] font-bold text-[#17202c]">
                  지금 확인할 일
                  <span className="ml-2 text-status-positive">{checklistRows.length}</span>
                </h2>
                <Link
                  href="/mypage/notifications"
                  className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]"
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

            {/* 지원 현황 — 컴팩트 행(풀 스텝퍼는 /mypage/applications 전용) */}
            <section className="border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[14px] font-bold text-[#17202c]">지원 현황</h2>
                <Link
                  href="/mypage/applications"
                  className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]"
                >
                  전체 보기 ›
                </Link>
              </div>
              <div className="divide-y divide-[#e5e9ef]">
                {dashboardApplications.map((app) => {
                  const status = getCompactApplicationStatus(app);
                  const stageLabel = applicationStages.find((s) => s.id === app.currentStage)?.label ?? app.currentStage;
                  const isExternal = app.applyChannel === "external";
                  const isDone = app.currentStage === "result";
                  return (
                    <div key={app.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 text-[13px] font-semibold text-[#17202c]">{app.jobTitle}</p>
                        <p className={clsx("shrink-0 text-[13px] font-bold", status.className)}>{status.label}</p>
                      </div>
                      <p className="mt-0.5 text-[12px] text-[#8a94a3]">
                        {app.company} · {app.applyChannelLabel}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="inline-flex w-fit items-center gap-[8px]">
                          <span
                            className={clsx(
                              "h-[8px] w-[8px] shrink-0 rounded-full",
                              isDone ? "bg-status-positive-dot" : "bg-status-warning-dot",
                            )}
                          />
                          <span
                            className={clsx(
                              "text-[12px] font-medium",
                              isDone ? "text-status-positive" : "text-status-warning",
                            )}
                          >
                            {stageLabel}
                          </span>
                        </span>
                        <Link
                          href={isExternal ? (app.jobHref ?? "/mypage/applications") : "/mypage/applications"}
                          className="inline-flex h-8 shrink-0 items-center border border-[#cfd8e3] bg-white px-3 text-[12px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
                        >
                          {isExternal ? "공고 보기" : "지원 보기"}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* 우측: 다가오는 일정 + 내 이력서 + 관심 조건 */}
          <div className="space-y-4">

            {/* 다가오는 일정 — 지금 확인할 일과 중복되지 않는(임박하지 않은) 내부 지원 일정만 */}
            <section className="border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[14px] font-bold text-[#17202c]">다가오는 일정</h2>
                <Link
                  href="/calendar"
                  className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]"
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

            {/* 내 이력서 — 작성 중(완성도 100% 미만) 이력서가 있을 때만 노출 */}
            {incompleteResume ? (
              <section className="border border-border bg-white">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <h2 className="text-[14px] font-bold text-[#17202c]">내 이력서</h2>
                  <Link
                    href="/mypage/resume"
                    className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]"
                  >
                    전체 보기 ›
                  </Link>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold text-[#17202c]">
                      {incompleteResume.title}
                    </span>
                    <span className="shrink-0 text-[12px] font-semibold text-[#4f5967]">
                      {calculateResumeCompletion(incompleteResume)}%
                    </span>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden bg-[#edf0f3]">
                    <span
                      className="block h-full bg-[#111111]"
                      style={{ width: `${calculateResumeCompletion(incompleteResume)}%` }}
                    />
                  </div>
                </div>
                <div className="border-t border-border px-5 py-4">
                  <p className="text-[12px] leading-[1.6] text-[#68717e]">
                    {incompleteResume.title}을 완성하면 해당 직무 공고에 간편지원이 가능해요.
                  </p>
                  <Link
                    href="/mypage/resume"
                    className="mt-2.5 inline-flex h-8 items-center border border-[#cfd8e3] bg-white px-3 text-[12px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
                  >
                    이어 작성하기 →
                  </Link>
                </div>
              </section>
            ) : null}

            {/* 관심 조건 — 미설정이거나 이메일 알림이 꺼져 있을 때만 노출 */}
            {showPreferencesCard ? (
              <section className="border border-border bg-white">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <h2 className="text-[14px] font-bold text-[#17202c]">관심 조건</h2>
                  <Link
                    href="/mypage/preferences"
                    className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]"
                  >
                    수정 ›
                  </Link>
                </div>
                <div className="px-5 py-4">
                  {hasPreferences ? (
                    <p className="text-[13px] leading-[1.7] text-[#68717e]">
                      RA 외 2개 / 3~5년 · 서울·경기
                      <br />
                      이메일 알림 꺼짐{" "}
                      <Link href="/mypage/preferences" className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]">
                        알림 켜기
                      </Link>
                    </p>
                  ) : (
                    <p className="text-[13px] leading-[1.7] text-[#68717e]">
                      아직 설정한 관심 조건이 없습니다.
                      <br />
                      <Link href="/mypage/preferences" className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]">
                        관심 조건 설정 ›
                      </Link>
                    </p>
                  )}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </MyPageShell>
  );
}
