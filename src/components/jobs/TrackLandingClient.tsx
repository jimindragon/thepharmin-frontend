"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { FeaturedJobsSection } from "@/components/home/FeaturedJobsSection";
import { HomeHeroBanner } from "@/components/home/HomeHeroBanner";
import { HomeJobsSection } from "@/components/home/HomeJobsSection";
import { InterestPromptGate } from "@/components/onboarding/InterestPromptGate";
import { recommendedJobs } from "@/data/recommendedJobs";
import type { JobTrack } from "@/types/jobs";

/**
 * 산업·연구·병원·약국 분야별 랜딩 페이지. 홈 화면과 동일한 히어로·주목할 만한 공고·
 * 공고 둘러보기 컴포넌트를 재사용하되, 분야를 고정해 분야 전환 탭 없이 단일 분야만 보여준다.
 */
export function TrackLandingClient({ track }: { track: JobTrack }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([101]);
  const trackJobs = recommendedJobs.filter((j) => j.track === track);

  const toggleBookmark = (jobId: number) => {
    setBookmarkedIds((current) => (current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId]));
  };

  return (
    <>
      <Header />
      {/* 뉴스에서 공고 링크로 들어오면 목록(/jobs)이 아니라 여기에 먼저 닿는다 — 두 곳 모두에 둔다. */}
      <InterestPromptGate />
      {/* ≤760px 배경은 QNA·캘린더와 같은 회색 — 탭바로 오가는 화면끼리 바탕이 끊기지 않게 한다. 데스크톱은 흰 배경 유지. */}
      <main className="pb-0 max-[760px]:min-h-screen max-[760px]:bg-[#f7f8fa]">
        <div className="app-shell">
          <HomeHeroBanner activeTrack={track} />
          <FeaturedJobsSection jobs={trackJobs} />
        </div>
        <HomeJobsSection bookmarkedIds={bookmarkedIds} onToggleBookmark={toggleBookmark} activeTrack={track} />
      </main>
    </>
  );
}
