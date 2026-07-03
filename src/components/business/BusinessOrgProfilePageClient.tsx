"use client";

import { useEffect, useState } from "react";
import { BusinessCompanyProfileClient } from "@/components/business/BusinessCompanyProfileClient";
import { HospitalOrgProfileClient } from "@/components/business/HospitalOrgProfileClient";
import { PharmacyOrgProfileClient } from "@/components/business/PharmacyOrgProfileClient";
import { initialBusinessCompanyProfile, type OrgTrack } from "@/data/businessCompanyProfile";
import { readSignupOrgTrack } from "@/config/businessSignup";

/** 데모용 트랙 오버라이드(개발 확인용): ?track=pharmacy | hospital | industry */
function readTrackOverride(): OrgTrack | null {
  const params = new URLSearchParams(window.location.search);
  const track = params.get("track");
  if (track === "pharmacy" || track === "hospital" || track === "industry") return track;
  return null;
}

export function BusinessOrgProfilePageClient() {
  const [track, setTrack] = useState<OrgTrack>(initialBusinessCompanyProfile.orgTrack);

  useEffect(() => {
    const fromSignup = readSignupOrgTrack();
    if (fromSignup) setTrack(fromSignup);
    // ?track= 쿼리 오버라이드는 개발 확인용으로 가입 결과보다 우선한다.
    const override = readTrackOverride();
    if (override) setTrack(override);
  }, []);

  if (track === "pharmacy") return <PharmacyOrgProfileClient />;
  if (track === "hospital") return <HospitalOrgProfileClient />;
  return <BusinessCompanyProfileClient />;
}
