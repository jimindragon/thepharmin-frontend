"use client";

import clsx from "clsx";
import { CalendarDays, FileText, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { ApplicationStepper } from "@/components/mypage/ApplicationStepper";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { BusinessStatCard, BusinessStatGrid } from "@/components/business/BusinessStatCard";
import { myPageUser } from "@/config/myPageMenu";
import { calculateResumeCompletion, mockResumes, type BuiltResume } from "@/data/resumes";
import type { ApplicationStage } from "@/data/mockApplications";

// ─── mock data ─────────────────────────────────────────────────────────────────

const USER_NAME = myPageUser.name;

const ALERTS: Array<{
  id: string;
  Icon: LucideIcon;
  title: string;
  badge: { label: string; className: string };
  desc: string;
  action: { label: string; href: string };
  isNew: boolean;
}> = [
  {
    id: "al1",
    Icon: MessageSquare,
    title: "의학부 학술영업 담당자 (MSL) 입사 제안",
    badge: { label: "신규", className: "border-status-positive-border bg-status-positive-subtle text-status-positive" },
    desc: "한독 · 받은 날짜 2026.06.25 · 미열람",
    action: { label: "제안 확인", href: "/mypage/offers" },
    isNew: true,
  },
  {
    id: "al2",
    Icon: MessageSquare,
    title: "제약 R&D PM (대리~과장급) 헤드헌팅 제안",
    badge: { label: "신규", className: "border-status-positive-border bg-status-positive-subtle text-status-positive" },
    desc: "더파마 헤드헌터 · 받은 날짜 2026.06.24 · 미열람",
    action: { label: "제안 확인", href: "/mypage/offers" },
    isNew: true,
  },
  {
    id: "al3",
    Icon: CalendarDays,
    title: "허가전략 담당자 · 면접",
    badge: { label: "D-DAY", className: "border-status-error-border bg-status-error-subtle text-status-urgent" },
    desc: "셀트리온 · 오늘 면접 일정 · 사용 이력서: RA 직무용",
    action: { label: "일정 보기", href: "/mypage/applications" },
    isNew: false,
  },
  {
    id: "al4",
    Icon: FileText,
    title: "Regulatory Affairs Associate · 서류 발표",
    badge: { label: "D-4", className: "border-status-warning-border bg-status-warning-subtle text-status-warning" },
    desc: "바이오넥스(주) · 07.03 발표 예정",
    action: { label: "지원 보기", href: "/mypage/applications" },
    isNew: false,
  },
];

const DASHBOARD_APPLICATIONS: Array<{
  id: string;
  jobTitle: string;
  company: string;
  applyMethod: string;
  statusLabel: string;
  statusUrgent: boolean;
  currentStage: ApplicationStage;
}> = [
  {
    id: "dapp1",
    jobTitle: "허가전략 담당자",
    company: "셀트리온",
    applyMethod: "간편지원",
    statusLabel: "면접 D-DAY",
    statusUrgent: true,
    currentStage: "interview",
  },
  {
    id: "dapp2",
    jobTitle: "Regulatory Affairs Associate",
    company: "바이오넥스(주)",
    applyMethod: "간편지원",
    statusLabel: "서류발표 D-4",
    statusUrgent: false,
    currentStage: "screening",
  },
  {
    id: "dapp3",
    jobTitle: "RA Specialist (제약·바이오 인허가 담당)",
    company: "더팜인제약(주)",
    applyMethod: "홈페이지 지원",
    statusLabel: "외부 지원 · D-10",
    statusUrgent: false,
    currentStage: "applied",
  },
];

const UPCOMING_SCHEDULES = [
  {
    id: "sch1",
    day: "28",
    monthLabel: "6월 일",
    time: "오늘",
    title: "허가전략 담당자 · 최종 면접",
    company: "셀트리온",
    badge: { label: "면접 D-DAY", className: "border-status-error-border bg-status-error-subtle text-status-urgent" },
  },
  {
    id: "sch2",
    day: "03",
    monthLabel: "7월 금",
    time: "",
    title: "Regulatory Affairs Associate · 서류 발표",
    company: "바이오넥스(주)",
    badge: { label: "발표 예정", className: "border-status-warning-border bg-status-warning-subtle text-status-warning" },
  },
];

// ─── sub-components ────────────────────────────────────────────────────────────

function AlertRow({ Icon, title, badge, desc, action, isNew }: (typeof ALERTS)[0]) {
  return (
    <div
      className={clsx(
        "flex items-start gap-3 px-5 py-4 max-[600px]:flex-wrap",
        isNew && "bg-status-positive-subtle",
      )}
    >
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

function ScheduleRow({
  day,
  monthLabel,
  time,
  title,
  company,
  badge,
}: (typeof UPCOMING_SCHEDULES)[0]) {
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

// ─── main component ────────────────────────────────────────────────────────────

export function MyPageDashboardClient() {
  const builtResumes = mockResumes.filter((r): r is BuiltResume => r.kind === "built");
  const incompleteResume = builtResumes.find((r) => calculateResumeCompletion(r) < 100);

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
                오늘 확인할 알림이 있어요.
              </h1>
              <p className="mt-2 text-[13px] text-[#68717e]">
                <span className="font-semibold text-[#17202c]">신규 제안 2건</span>
                <span className="mx-1 text-[#c0c8d2]">·</span>
                일정 2건{" "}
                <span className="text-[#c0c8d2]">·</span>
                {" "}진행 중 지원 3건
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] text-[#8a94a3]">2026년 6월 28일 일요일</p>
              <p className="mt-0.5 text-[13px] font-medium text-[#4f5967]">
                제안 받기 켜짐 · 공개 이력서 1건
              </p>
            </div>
          </div>
        </div>

        {/* 통계 4분할 — ① 카드1(받은 제안)에 브랜드 그라데이션 상단 강조 */}
        <BusinessStatGrid cols={4}>
          <div className="relative">
            <BusinessStatCard
              label="받은 제안"
              value="2"
              unit="건"
              sub="신규 2건 · 미열람"
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-cta" />
          </div>
          <BusinessStatCard
            label="진행 중 지원"
            value="3"
            unit="건"
            subEmphasis="면접 D-DAY 1"
            emphasisVariant="urgent"
            sub="서류 1"
          />
          <BusinessStatCard
            label="스크랩"
            value="8"
            unit="건"
            sub="공고 5 · 기관 4 · 마감임박 1"
          />
          <BusinessStatCard
            label="이력서"
            value="3"
            unit="건"
            sub="대표 1 · 작성중 1 · 첨부 1"
          />
        </BusinessStatGrid>

        {/* 메인 2컬럼 레이아웃 */}
        <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-4 max-[900px]:grid-cols-1">

          {/* 좌측: 놓치지 마세요 + 지원 현황 */}
          <div className="space-y-4">

            {/* 놓치지 마세요 — ② 신규 제안 행(1·2)에만 mint 배경 강조 */}
            <section className="border border-[#dfe4ea] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e9ef] px-5 py-4">
                <h2 className="text-[14px] font-bold text-[#17202c]">
                  놓치지 마세요
                  <span className="ml-2 text-status-positive">4</span>
                </h2>
                <Link
                  href="/mypage/notifications"
                  className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]"
                >
                  알림 설정 ›
                </Link>
              </div>
              <div className="divide-y divide-[#e5e9ef]">
                {ALERTS.map((alert) => (
                  <AlertRow key={alert.id} {...alert} />
                ))}
              </div>
            </section>

            {/* 지원 현황 — ③ 지원 현황 페이지의 ApplicationStepper 재사용 */}
            <section className="border border-[#dfe4ea] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e9ef] px-5 py-4">
                <h2 className="text-[14px] font-bold text-[#17202c]">지원 현황</h2>
                <Link
                  href="/mypage/applications"
                  className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]"
                >
                  전체 보기 ›
                </Link>
              </div>
              <div className="divide-y divide-[#e5e9ef]">
                {DASHBOARD_APPLICATIONS.map((app) => (
                  <div key={app.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#17202c]">{app.jobTitle}</p>
                        <p className="mt-0.5 text-[12px] text-[#8a94a3]">
                          {app.company} · {app.applyMethod}
                        </p>
                      </div>
                      <p
                        className={clsx(
                          "shrink-0 text-[13px] font-bold",
                          app.statusUrgent ? "text-status-urgent" : "text-[#4f5967]",
                        )}
                      >
                        {app.statusLabel}
                      </p>
                    </div>
                    <ApplicationStepper currentStage={app.currentStage} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* 우측: 다가오는 일정 + 내 이력서 + 관심 조건 */}
          <div className="space-y-4">

            {/* 다가오는 일정 */}
            <section className="border border-[#dfe4ea] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e9ef] px-5 py-4">
                <h2 className="text-[14px] font-bold text-[#17202c]">다가오는 일정</h2>
                <span className="cursor-default text-[12px] text-[#c0c8d2]">캘린더 ›</span>
              </div>
              <div className="divide-y divide-[#e5e9ef]">
                {UPCOMING_SCHEDULES.map((item) => (
                  <ScheduleRow key={item.id} {...item} />
                ))}
              </div>
            </section>

            {/* 내 이력서 */}
            <section className="border border-[#dfe4ea] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e9ef] px-5 py-4">
                <h2 className="text-[14px] font-bold text-[#17202c]">내 이력서</h2>
                <Link
                  href="/mypage/resume"
                  className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]"
                >
                  전체 보기 ›
                </Link>
              </div>
              <div className="divide-y divide-[#e5e9ef]">
                {builtResumes.map((resume) => {
                  const completion = calculateResumeCompletion(resume);
                  return (
                    <div key={resume.id} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-[13px] font-semibold text-[#17202c]">
                            {resume.title}
                          </span>
                          {resume.isPrimary && (
                            <span className="shrink-0 bg-[#111111] px-1.5 py-0.5 text-[10px] font-medium text-white">
                              대표
                            </span>
                          )}
                        </div>
                        <span className="shrink-0 text-[12px] font-semibold text-[#4f5967]">
                          {completion}%
                        </span>
                      </div>
                      <div className="mt-2.5 h-1.5 overflow-hidden bg-[#edf0f3]">
                        <span
                          className="block h-full bg-[#111111]"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {incompleteResume ? (
                <div className="border-t border-[#e5e9ef] px-5 py-4">
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
              ) : null}
            </section>

            {/* 관심 조건 */}
            <section className="border border-[#dfe4ea] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e9ef] px-5 py-4">
                <h2 className="text-[14px] font-bold text-[#17202c]">관심 조건</h2>
                <Link
                  href="/mypage/preferences"
                  className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]"
                >
                  수정 ›
                </Link>
              </div>
              <div className="px-5 py-4">
                <p className="text-[13px] leading-[1.7] text-[#68717e]">
                  RA 외 2개 / 3~5년 · 서울·경기
                  <br />
                  이메일 알림 사용 중
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MyPageShell>
  );
}
