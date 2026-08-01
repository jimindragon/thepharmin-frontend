"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SESSION_CHANGED_EVENT,
  clearClientSession,
  readClientSession,
  writeClientSession,
} from "@/lib/session";

export interface SessionContextValue {
  isPersonalLoggedIn: boolean;
  isBusinessLoggedIn: boolean;
  loginPersonal: () => void;
  logoutPersonal: () => void;
  loginBusiness: () => void;
  logoutBusiness: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession은 SessionProvider(app/layout.tsx) 안에서만 쓸 수 있습니다.");
  }
  return value;
}

interface SessionProviderProps {
  /** 서버(app/layout.tsx)에서 쿠키를 읽어 내려준 초기값 — 첫 렌더 깜빡임을 막는다. */
  isPersonalLoggedIn: boolean;
  isBusinessLoggedIn: boolean;
  children: React.ReactNode;
}

export function SessionProvider({
  isPersonalLoggedIn: initialPersonal,
  isBusinessLoggedIn: initialBusiness,
  children,
}: SessionProviderProps) {
  const router = useRouter();
  const [personal, setPersonal] = useState(initialPersonal);
  const [business, setBusiness] = useState(initialBusiness);

  // router.refresh() 이후 서버가 다시 내려준 값과 맞춘다.
  useEffect(() => {
    setPersonal(initialPersonal);
  }, [initialPersonal]);

  useEffect(() => {
    setBusiness(initialBusiness);
  }, [initialBusiness]);

  // 쿠키를 바꾸는 모든 경로를 여기 한곳에서 받는다 — 아래 액션들뿐 아니라
  // markBusinessMember/clearBusinessMember처럼 훅 바깥에서 호출되는 모듈 함수도 포함된다.
  // router.refresh()가 없으면 서버 컴포넌트(qna, companies 라우트)가 갱신되지 않는다.
  useEffect(() => {
    const handleSessionChanged = () => {
      setPersonal(readClientSession("PERSONAL"));
      setBusiness(readClientSession("BUSINESS"));
      router.refresh();
    };

    window.addEventListener(SESSION_CHANGED_EVENT, handleSessionChanged);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, handleSessionChanged);
  }, [router]);

  const loginPersonal = useCallback(() => writeClientSession("PERSONAL"), []);
  const logoutPersonal = useCallback(() => clearClientSession("PERSONAL"), []);
  const loginBusiness = useCallback(() => writeClientSession("BUSINESS"), []);
  const logoutBusiness = useCallback(() => clearClientSession("BUSINESS"), []);

  const value = useMemo<SessionContextValue>(
    () => ({
      isPersonalLoggedIn: personal,
      isBusinessLoggedIn: business,
      loginPersonal,
      logoutPersonal,
      loginBusiness,
      logoutBusiness,
    }),
    [personal, business, loginPersonal, logoutPersonal, loginBusiness, logoutBusiness],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
