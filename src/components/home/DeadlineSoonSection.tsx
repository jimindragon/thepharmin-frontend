"use client";

import clsx from "clsx";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { hasJobDetail } from "@/data/jobDetailIndex";
import { jobs } from "@/data/jobs";
import type { Job } from "@/types/jobs";
import { compareJobsByDeadline, formatJobDeadlineLabel, isJobDeadlineUrgent } from "@/utils/dday";

const DEADLINE_SOON_LIMIT = 6;

/**
 * 마감이 가까운 순으로 앞에서 여섯 건.
 *
 * "D-7 이내" 같은 임계값으로 거르지 않는다 — 목데이터에서 그 조건을 넘기는 공고가 한 건뿐이라
 * 섹션이 카드 한 장짜리로 쪼그라든다. 대신 정렬만으로 자른다. compareJobsByDeadline이
 * 마감 임박 → 상시채용 → 이미 마감 순의 3단계라, 급한 게 없으면 자연히 덜 급한 공고가 올라오고
 * 상시채용·마감 완료는 알아서 뒤로 밀린다. 그래서 여기 여섯 장이 전부 빨간 D-day는 아니다.
 *
 * 기준일은 compareJobsByDeadline 안쪽의 getJobDaysLeft가 MOCK_TODAY_DATE로 잡는다 —
 * 이 파일에서 new Date()를 직접 부르면 목데이터 기준일과 어긋나므로 부르지 않는다.
 *
 * 모듈 최상단에서 한 번만 계산한다(HomePageClient의 homeFeaturedJobs와 같은 방식).
 * jobs를 펼쳐 복사한 뒤 정렬하는 건 sort가 제자리 정렬이라 원본 배열 순서를 망가뜨리기 때문이다.
 */
const deadlineSoonJobs: Job[] = [...jobs].sort(compareJobsByDeadline).slice(0, DEADLINE_SOON_LIMIT);

function DeadlineSoonCard({ job }: { job: Job }) {
  return (
    <Link
      href={job.slug && hasJobDetail(job.slug) ? `/jobs/${job.slug}` : "/jobs"}
      className="flex h-full flex-col border border-[#e5e5e5] bg-white p-5 transition-colors duration-[180ms] hover:border-[#dcdcdc]"
    >
      <p className="truncate text-[13px] font-medium text-[#6b7280]">{job.company}</p>
      {/* 카드가 좁아(≤760px 2열이면 안쪽 폭이 130px대) 제목이 자주 두 줄을 넘긴다.
          line-clamp-2로 끊어 카드 높이가 제목 길이에 딸려가지 않게 한다. */}
      <p className="mt-1 line-clamp-2 text-[15px] font-medium leading-[1.45] text-[#111111]">{job.title}</p>
      {/* 라벨과 색을 같은 판정에서 뽑는다 — JobCard·추천 공고 카드와 같은 규칙이라
          "상시채용"·"마감"이 빨갛게 나오지 않는다. */}
      <strong className={clsx("mt-auto pt-3 text-[13px] font-medium", isJobDeadlineUrgent(job) ? "text-danger" : "text-[#6b7280]")}>
        {formatJobDeadlineLabel(job)}
      </strong>
    </Link>
  );
}

/**
 * 홈 히어로 바로 아래에 서는 "마감 임박 공고". 첫 화면에서 가장 먼저 만나는 목록이라
 * 카드 한 장에 [기업명 / 제목 / D-day]만 남긴 컴팩트 판이다.
 *
 * 2열은 모든 폭에서 유지한다. 좁은 화면에서 1열로 풀면 여섯 장이 세로로 길게 늘어져
 * 바로 아래 "업계를 이끄는 기업"까지 내려가는 길이 멀어진다.
 *
 * 칸을 맞대어 선을 하나로 합치는 문법(컨테이너 border-l/border-t + 셀 -ml-px/-mt-px)은
 * 같은 홈의 추천 공고 그리드에서 그대로 가져왔다.
 */
export function DeadlineSoonSection() {
  if (!deadlineSoonJobs.length) return null;

  return (
    <section className="mt-14" aria-label="마감 임박 공고">
      <SectionHeader title="마감 임박 공고" viewAll={{ href: "/jobs" }} />
      <div className="grid grid-cols-2 border-l border-t border-[#dddddd]">
        {deadlineSoonJobs.map((job) => (
          <div key={job.id} className="-ml-px -mt-px h-full">
            <DeadlineSoonCard job={job} />
          </div>
        ))}
      </div>
    </section>
  );
}
