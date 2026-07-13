"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * 공고 열람 이력을 기록하는 로컬스토리지 키. 최신순으로 최대 MAX_RECENT_JOBS개만 유지한다.
 */
const RECENT_JOBS_STORAGE_KEY = "thepharmin:recent-jobs";
const MAX_RECENT_JOBS = 20;

export interface RecentJobEntry {
  id: number;
  viewedAt: number;
}

function readRecentJobs(): RecentJobEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(RECENT_JOBS_STORAGE_KEY);
    return value ? (JSON.parse(value) as RecentJobEntry[]) : [];
  } catch {
    return [];
  }
}

function writeRecentJobs(entries: RecentJobEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(RECENT_JOBS_STORAGE_KEY, JSON.stringify(entries));
}

/** 공고 상세 마운트 시 호출하는 기록 함수. 이미 있던 항목은 지우고 맨 앞(최신)으로 다시 넣는다. */
export function recordRecentJobView(jobId: number) {
  const withoutCurrent = readRecentJobs().filter((entry) => entry.id !== jobId);
  const next = [{ id: jobId, viewedAt: Date.now() }, ...withoutCurrent].slice(0, MAX_RECENT_JOBS);
  writeRecentJobs(next);
}

export function clearRecentJobs() {
  writeRecentJobs([]);
}

/** 마이페이지 "최근 본 공고" 목록이 읽는 훅. 최신순으로 정렬된 항목과 전체 삭제 함수를 제공한다. */
export function useRecentJobs() {
  const [entries, setEntries] = useState<RecentJobEntry[]>([]);

  useEffect(() => {
    setEntries(readRecentJobs());
  }, []);

  const clear = useCallback(() => {
    clearRecentJobs();
    setEntries([]);
  }, []);

  return { entries, clear };
}
