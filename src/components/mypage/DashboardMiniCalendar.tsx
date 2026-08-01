import clsx from "clsx";
import Link from "next/link";
import { mockApplications, MYPAGE_MOCK_TODAY } from "@/data/mockApplications";
import { jobs } from "@/data/jobs";
import { scrapedJobIds } from "@/data/scraps";
import { buildMonthDays, dateKey } from "@/utils/monthGrid";
import { WEEKDAY_LABELS } from "@/utils/dday";

/**
 * 대시보드 우측 레일 상단의 표시 전용 월간 미니 캘린더.
 * MYPAGE_MOCK_TODAY 당월 고정 — 월 이동·날짜 선택·hover 인터랙션 없음.
 * "전체 캘린더 보기"만 /calendar로 연결한다.
 */

// 내 지원 일정(청색 점) — 진행 중(!isClosed)이고 다음 일정 날짜가 있는 지원 건.
// 외부 지원(홈페이지 지원)도 일정 자체는 실재하므로 포함한다.
// nextEventDate는 "YYYY.MM.DD" 형식이라 dateKey의 "YYYY-MM-DD"와 맞추려 구분자를 치환한다.
const scheduleDateKeys = new Set(
  mockApplications
    .filter((app) => !app.isClosed && app.nextEventDate)
    .map((app) => (app.nextEventDate as string).replace(/\./g, "-")),
);

// 스크랩 공고 마감일(적색 점) — scrapedJobIds를 jobs와 조인해 파싱 가능한 ISO deadline만 사용한다.
// "채용 시 마감" 같은 텍스트 마감(파싱 불가)은 점을 찍지 않는다.
const scrapDeadlineKeys = new Set(
  jobs
    .filter((job) => scrapedJobIds.includes(job.id) && job.deadline)
    .map((job) => job.deadline as string),
);

// MYPAGE_MOCK_TODAY("YYYY.MM.DD") 파싱 — 표시 월과 오늘 강조의 단일 기준.
const [TODAY_YEAR, TODAY_MONTH_1, TODAY_DAY] = MYPAGE_MOCK_TODAY.split(".").map(Number);
const TODAY_KEY = `${TODAY_YEAR}-${String(TODAY_MONTH_1).padStart(2, "0")}-${String(TODAY_DAY).padStart(2, "0")}`;
const VISIBLE_MONTH_INDEX = TODAY_MONTH_1 - 1; // Date의 월은 0-index

export function DashboardMiniCalendar() {
  const days = buildMonthDays(TODAY_YEAR, VISIBLE_MONTH_INDEX);

  return (
    <section className="border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-[17px] font-bold text-[#17202c]">
          {TODAY_YEAR}년 {TODAY_MONTH_1}월
        </h2>
        <Link
          href="/calendar"
          className="text-[13px] text-[#8a94a3] transition hover:text-[#111111]"
        >
          전체 캘린더 보기 ›
        </Link>
      </div>

      <div className="px-4 py-4">
        {/* 요일 행 — 일요일 빨강 / 토요일 파랑(채용 캘린더 관례) */}
        <div className="grid grid-cols-7">
          {WEEKDAY_LABELS.map((label, index) => (
            <div
              key={label}
              className={clsx(
                "py-1 text-center text-[12px] font-medium",
                index === 0 ? "text-[#e95544]" : index === 6 ? "text-[#337ddf]" : "text-[#8a94a3]",
              )}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 7열 날짜 그리드 */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = dateKey(day);
            const inCurrentMonth = day.getMonth() === VISIBLE_MONTH_INDEX;
            const isToday = key === TODAY_KEY;
            const hasSchedule = scheduleDateKeys.has(key);
            const hasScrap = scrapDeadlineKeys.has(key);

            return (
              <div key={key} className="flex flex-col items-center py-1">
                <span
                  className={clsx(
                    "grid h-6 w-6 place-items-center rounded-full text-[13px] font-medium",
                    isToday
                      ? "bg-[#1b1f25] text-white"
                      : !inCurrentMonth
                        ? "text-[#c4cad3]"
                        : "text-[#3d4652]",
                  )}
                >
                  {day.getDate()}
                </span>
                {/* 점 — 셀 하단, 최대 2개(청색=내 일정, 적색=스크랩 마감), gap 2px */}
                <span className="mt-1 flex h-1 items-center gap-[2px]">
                  {hasSchedule ? <span className="h-1 w-1 rounded-full bg-status-pending-dot" /> : null}
                  {hasScrap ? <span className="h-1 w-1 rounded-full bg-status-error-dot" /> : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
