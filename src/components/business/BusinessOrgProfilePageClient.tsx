"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { initialBusinessCompanyProfile, type OrgTrack } from "@/data/businessCompanyProfile";
import { readSignupOrgTrack } from "@/config/businessSignup";

type ProfileTrack = OrgTrack | "research";

const trackProfilePath: Record<ProfileTrack, string> = {
  industry: "/business/industry/profile",
  hospital: "/business/hospital/profile",
  pharmacy: "/business/pharmacy/profile",
  research: "/business/research/profile",
};

/** 데모용 트랙 오버라이드(개발 확인용): ?track=pharmacy | hospital | industry | research */
function readTrackOverride(): ProfileTrack | null {
  const params = new URLSearchParams(window.location.search);
  const track = params.get("track");
  if (track === "pharmacy" || track === "hospital" || track === "industry" || track === "research") return track;
  return null;
}

/**
 * 트랙별 폼을 더 이상 이 컴포넌트가 직접 그리지 않는다 — 계정의 orgTrack을 읽어
 * 해당 트랙 전용 정보관리 페이지(/business/{track}/profile)로 리다이렉트만 한다.
 */
export function BusinessOrgProfilePageClient() {
  useEffect(() => {
    const override = readTrackOverride();
    // ?track= 쿼리 오버라이드는 개발 확인용으로 가입 결과보다 우선한다.
    const fromSignup = readSignupOrgTrack();
    const track: ProfileTrack = override ?? fromSignup ?? initialBusinessCompanyProfile.orgTrack;
    redirect(trackProfilePath[track]);
  }, []);

  return null;
}
