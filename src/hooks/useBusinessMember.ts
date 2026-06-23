"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "thepharmin_business_member";

export function markBusinessMember() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, "1");
}

export function useBusinessMember() {
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    setIsMember(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  return isMember;
}
