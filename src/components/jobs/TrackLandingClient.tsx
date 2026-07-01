"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { FeaturedJobsSection } from "@/components/home/FeaturedJobsSection";
import { HomeHeroBanner } from "@/components/home/HomeHeroBanner";
import { HomeJobsSection } from "@/components/home/HomeJobsSection";
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
      <main className="pb-0">
        <div className="app-shell">
          <HomeHeroBanner activeTrack={track} />
          <FeaturedJobsSection jobs={trackJobs} />
        </div>
        <HomeJobsSection bookmarkedIds={bookmarkedIds} onToggleBookmark={toggleBookmark} activeTrack={track} />
      </main>
    </>
  );
}
