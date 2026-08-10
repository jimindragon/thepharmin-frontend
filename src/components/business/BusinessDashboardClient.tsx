"use client";

import Link from "next/link";
import clsx from "clsx";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { BusinessStatCard, BusinessStatGrid } from "@/components/business/BusinessStatCard";
import { StatusPill } from "@/components/business/table/StatusPill";
import { TrackBadge } from "@/components/business/table/TrackBadge";
import type { StatusTone } from "@/config/statusTone";
import { InfoNoticeBox } from "@/components/shared/InfoNoticeBox";
import { applicants } from "@/data/applicants";
import { getClosingDday, jobPostings, jobTrackLabel, MOCK_TODAY } from "@/data/businessJobs";
import { LOGIN_COMPANY } from "@/data/businessCompanyProfile";
import { headhuntingCandidates, headhuntingRequests } from "@/data/headhunting";
import { useOrgVerificationStatus } from "@/hooks/useOrgVerificationStatus";
import { formatKoreanDate } from "@/utils/dday";

// ─── derived from existing mock data ──────────────────────────────────────────

const COMPANY_NAME = LOGIN_COMPANY.displayName;

const activeJobs = jobPostings.filter((j) => j.status === "active");

function getJobDday(job: (typeof jobPostings)[0]): { value: number; isUrgent: boolean } {
  if (!job.closingDate) return { value: 0, isUrgent: false };
  const { daysLeft, isUrgent } = getClosingDday(job.closingDate);
  return { value: daysLeft, isUrgent };
}

/**
 * 상단 통계 카드는 각 관리 화면과 같은 계산식을 쓴다 — 같은 라벨이 화면마다 다른 값을
 * 말하지 않게 하는 것이 요점이다. 기준을 바꿀 일이 생기면 아래 원본과 함께 고쳐야 한다.
 * 면접: BusinessApplicantsClient / 헤드헌팅: BusinessHeadhuntingManageClient.
 */
/**
 * "신규"의 정의는 stage === "new"(미처리) 하나로 고정한다 — 지원자 관리의 탭·NEW 배지·표 '현재 단계'가
 * 이미 쓰는 기준이고, 그 화면의 통계 카드도 같은 기준을 쓴다. isNew(최근 지원) 축과 섞지 않는다.
 */
const newApplicantCount = applicants.filter((a) => a.stage === "new").length;

const interviewApplicants = applicants.filter((a) => a.interviewDate != null);
const interviewCount = interviewApplicants.length;
const nearInterviewCount = interviewApplicants.filter(
  (a) => (a.daysUntilInterview ?? Infinity) <= 2,
).length;

const activeHeadhuntingCount = headhuntingRequests.filter(
  (r) => r.status !== "completed" && r.status !== "on_hold",
).length;
const totalCandidateCount = headhuntingCandidates.length;
const pendingCandidateCount = headhuntingCandidates.filter((c) => c.status === "recommended").length;

// ─── dashboard-only mock data ─────────────────────────────────────────────────

/**
 * 처리할 항목 — 한 행이 [D-day][대상 · 무슨 일][버튼] 세 칸으로만 읽히게 필드를 나눠 둔다.
 * 대상과 사건을 한 문장에 섞어 쓰던 때는 행마다 어디가 대상인지 눈으로 찾아야 했다.
 * 배열 순서가 곧 표시 순서다(렌더에 정렬 없음) — 급한 순으로, D-day 있는 건을 위에 둔다.
 */
const TASKS: Array<{
  id: string;
  /** 시간 압박이 있는 건만 채운다. 없으면 좌측 칸을 같은 폭의 빈 칸으로 비워 대상 열의 x를 맞춘다. */
  dday?: string;
  target: string;
  what: string;
  action: { label: string; href: string };
}> = [
  {
    id: "t2",
    dday: "D-2",
    target: "임상개발 PM 채용",
    what: "공고 마감",
    action: { label: "공고 연장", href: "/business/jobs" },
  },
  {
    id: "t4",
    dday: "D-2",
    target: "정수민",
    what: "면접 일정 확정",
    action: { label: "일정 확정", href: "/business/applicants" },
  },
  {
    id: "t1",
    target: "신규 지원자 2명",
    what: "검토 대기",
    action: { label: "지원자 검토", href: "/business/applicants" },
  },
  {
    id: "t3",
    target: "CAND-008",
    what: "후보자 검토 대기",
    action: { label: "후보자 확인", href: "/business/headhunting/manage" },
  },
  {
    id: "t5",
    target: "CAND-009",
    what: "처우 협의 중",
    action: { label: "협의 보기", href: "/business/headhunting/manage" },
  },
];

const UPCOMING_INTERVIEWS: Array<{
  id: string;
  day: string;
  monthLabel: string;
  time: string;
  candidate: string;
  stage: string;
  posting: string;
  badge: { label: string; tone: StatusTone };
}> = [
  {
    id: "i1",
    day: "21",
    monthLabel: "7월",
    time: "14:00",
    candidate: "정수민",
    stage: "최종 면접",
    posting: "제제연구 선임연구원 모집",
    badge: { label: "일정 확정 대기", tone: "progress" },
  },
  {
    id: "i2",
    day: "24",
    monthLabel: "7월",
    time: "10:30",
    candidate: "CAND-014",
    stage: "1차 면접",
    posting: "임상개발 PM (CRA 총괄) · 헤드헌팅",
    badge: { label: "확정", tone: "success" },
  },
];

// ─── sub-components ───────────────────────────────────────────────────────────

function TaskRow({ dday, target, what, action }: (typeof TASKS)[0]) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 max-[760px]:px-4">
      {/* D-day가 없는 행도 같은 폭을 차지한다 — 비우면 대상 열이 행마다 좌우로 흔들린다. */}
      <span className="w-[42px] shrink-0 text-[13px] font-medium text-status-urgent">{dday}</span>
      <p className="min-w-0 flex-1 text-[15px] text-[#17202c]">
        {target}
        <span className="text-[#68717e]"> · {what}</span>
      </p>
      <Link
        href={action.href}
        className="inline-flex h-8 shrink-0 items-center border border-[#cfd8e3] bg-white px-3 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
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
    // 좌측 날짜 칸과 우측 본문을 3줄 격자로 묶는다 — 2칼럼 flex로 각자 쌓던 때는 폰트·마진이 달라
    // 줄이 아래로 갈수록 어긋났다(실측 baseline 차 2→4→12px, 메타가 2줄이면 33px).
    // items-baseline이 줄마다 좌우 baseline을 맞추고, 세로 간격은 gap-y-1.5로 일원화한다(개인 ScheduleRow와 동일 구조).
    <div className="grid grid-cols-[48px_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1.5 px-6 py-4 max-[760px]:px-4">
      <p className="text-center text-[24px] font-bold leading-none tracking-[-0.02em] text-[#17202c]">{day}</p>
      <p className="text-[16px] font-semibold leading-tight text-[#17202c]">
        {candidate}
        <span className="ml-1.5 font-normal text-[#68717e]">· {stage}</span>
      </p>

      <p className="text-center text-[13px] text-[#8a94a3]">{monthLabel}</p>
      <p className="text-[13px] text-[#8a94a3]">{posting}</p>

      <p className="text-center text-[13px] font-semibold text-[#4f5967]">{time}</p>
      <StatusPill tone={badge.tone} label={badge.label} size="sm" />
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function BusinessDashboardClient() {
  const orgVerificationStatus = useOrgVerificationStatus();

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
          {/* h1이 아니라 인사말+날짜 행이 mt-5를 소유한다 — ≤760px에서는 셸 pt-8이 여백을
              대신 잡으므로 0으로 접는다. 제목 크기는 이미 28→24로 내려가 있다. */}
          <div className="mt-5 flex flex-wrap items-start justify-between gap-y-3 max-[760px]:mt-0">
          <div>
            <h1 className="text-[28px] font-bold leading-[1.35] tracking-[-0.02em] text-[#17202c] max-[760px]:text-[24px]">
              안녕하세요,{" "}
              <span className="text-gradient-cta">{COMPANY_NAME}</span>님
              <br />
              오늘 처리할 항목이 있어요.
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[13px] text-[#8a94a3]">{formatKoreanDate(MOCK_TODAY)}</p>
          </div>
          </div>
        </div>

        {orgVerificationStatus === "pending" ? (
          <InfoNoticeBox>
            <p className="font-semibold text-[#17202c]">기업 인증 검토 중입니다</p>
            <p className="mt-0.5">제출하신 사업자등록증명원을 운영팀이 검토하고 있습니다. 승인이 완료되면 공고 등록 등 주요 기능을 이용할 수 있습니다.</p>
          </InfoNoticeBox>
        ) : null}

        {/* 통계 4분할 */}
        <BusinessStatGrid cols={4}>
          <BusinessStatCard
            label="진행 중 공고"
            value={String(activeJobs.length)}
            unit="개"
            sub={`전체 등록 공고 ${jobPostings.length}개 중 게시 중`}
            href="/business/jobs"
          />
          <BusinessStatCard
            label="신규 지원자"
            value={String(newApplicantCount)}
            unit="명"
            href="/business/applicants"
          />
          <BusinessStatCard
            label="면접 예정"
            value={String(interviewCount)}
            unit="건"
            subEmphasis={nearInterviewCount > 0 ? `D-2 이내 ${nearInterviewCount}건` : undefined}
            emphasisVariant="urgent"
            href="/business/applicants"
          />
          <BusinessStatCard
            label="진행 중 헤드헌팅"
            value={String(activeHeadhuntingCount)}
            unit="건"
            sub={`추천 후보자 ${totalCandidateCount}명 · 검토 대기 ${pendingCandidateCount}명`}
            href="/business/headhunting/manage"
          />
        </BusinessStatGrid>

        {/* 메인 2컬럼 레이아웃 */}
        <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-4 max-[900px]:grid-cols-1">

          {/* 좌측: 처리할 항목 + 공고별 지원 현황 */}
          <div className="space-y-4">

            {/* 처리할 항목 */}
            <section className="border border-border bg-white">
              <div className="border-b border-border px-6 py-4 max-[760px]:px-4">
                <h2 className="text-[17px] font-bold text-[#17202c]">
                  처리할 항목
                  {/* 남은 할 일 개수라 완료색(초록)을 쓰지 않는다 — 다 처리한 상태와 헷갈린다. */}
                  <span className="ml-2 text-[#68717e]">{TASKS.length}</span>
                </h2>
              </div>
              <div className="divide-y divide-[#e5e9ef]">
                {TASKS.map((task) => (
                  <TaskRow key={task.id} {...task} />
                ))}
              </div>
            </section>

            {/* 공고별 지원 현황 */}
            <section className="border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border px-6 py-4 max-[760px]:px-4">
                <h2 className="text-[17px] font-bold text-[#17202c]">공고별 지원 현황</h2>
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
                      // 우측 두 열 40px — 실측 필요폭은 "지원자" 캡션 28px, "D-22" 29.9px다.
                      // 56px은 2배 과대라 390에서 제목 열을 124px까지 밀어냈다.
                      // auto로 열지 않는 이유: 행마다 별개 grid라 D-day 폭(20.6~29.9)이 행마다
                      // 달라지고, 그만큼 지원자 열의 x가 행마다 어긋난다.
                      className="grid grid-cols-[minmax(0,1fr)_40px_40px] items-center gap-3 px-6 py-4 max-[760px]:px-4"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* break-keep: 390에서 제목 열이 156px라 긴 공고명은 2줄이 되는데,
                              기본 word-break는 CJK를 아무 데서나 끊어 "제제연구 선임연구 / 원 모집"이 된다.
                              어절 경계로 옮기는 것뿐이라 줄 수·행 높이는 그대로다. */}
                          <span className="break-keep text-[16px] font-semibold text-[#17202c]">
                            {job.title}
                          </span>
                          <TrackBadge label={jobTrackLabel(job.track)} />
                        </div>
                        <p className="mt-0.5 text-[13px] text-[#68717e]">
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
                            // 비긴급 초록은 공고 관리 표(BusinessJobsClient closingDate 열)와 같은 규칙이다 —
                            // 같은 getClosingDday() 값을 두 곳이 보여주므로 색 분기도 같이 간다.
                            dday.isUrgent ? "text-status-urgent" : "text-status-positive",
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

          {/* 우측: 다가오는 면접 */}
          <div className="space-y-4">

            {/* 다가오는 면접 */}
            <section className="border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border px-6 py-4 max-[760px]:px-4">
                <h2 className="text-[17px] font-bold text-[#17202c]">다가오는 면접</h2>
                <Link
                  href="/business/applicants"
                  className="text-[12px] text-[#8a94a3] transition hover:text-[#111111]"
                >
                  지원자 관리 ›
                </Link>
              </div>
              {UPCOMING_INTERVIEWS.length > 0 ? (
                <div className="divide-y divide-[#e5e9ef]">
                  {UPCOMING_INTERVIEWS.map((item) => (
                    <InterviewRow key={item.id} {...item} />
                  ))}
                </div>
              ) : (
                <p className="px-6 py-4 max-[760px]:px-4 text-[13px] text-[#8a94a3]">예정된 면접이 없습니다</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </BusinessCenterShell>
  );
}
