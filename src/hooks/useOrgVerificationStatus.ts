"use client";

import { useEffect, useState } from "react";
import type { CompanyVerificationStatus } from "@/data/businessCompanyProfile";

const STORAGE_KEY = "thepharmin_org_verification_status";

function isValidStatus(value: string | null): value is CompanyVerificationStatus {
  return value === "pending" || value === "approved";
}

export function useOrgVerificationStatus(): CompanyVerificationStatus {
  const [status, setStatus] = useState<CompanyVerificationStatus>("approved");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const orgStatus = params.get("orgStatus");
    if (isValidStatus(orgStatus)) {
      window.localStorage.setItem(STORAGE_KEY, orgStatus);
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    setStatus(isValidStatus(stored) ? stored : "approved");
  }, []);

  return status;
}
