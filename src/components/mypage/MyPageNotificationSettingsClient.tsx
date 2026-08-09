"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { NotificationSettingList } from "@/components/shared/NotificationSettingList";
import { PERSONAL_NOTIFICATION_SETTINGS } from "@/types/notifications";
import { getAllStoredJobPreferences } from "@/hooks/useJobPreferenceStorage";

export function MyPageNotificationSettingsClient() {
  const [emailEnabled, setEmailEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PERSONAL_NOTIFICATION_SETTINGS.map((group) => [group.id, group.emailEnabled])),
  );
  const [preferenceTrackCount, setPreferenceTrackCount] = useState(0);

  useEffect(() => {
    const stored = getAllStoredJobPreferences();
    setPreferenceTrackCount(Object.values(stored).filter((preference) => preference?.emailAlertEnabled).length);
  }, []);

  const toggle = (id: string) => {
    setEmailEnabled((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <MyPageShell>
      <PageBreadcrumb keepOnMobile items={[{ label: "마이페이지" }, { label: "알림 설정" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">알림 설정</h1>
      <p className="mt-2.5 text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        사이트 내 알림은 항상 제공되며, 아래 설정은 이메일 수신 여부에 적용됩니다.
        <br />
        면접 확정·최종 결과·제안 수신 등 주요 알림은 카카오톡으로도 발송됩니다.
      </p>

      <NotificationSettingList
        groups={PERSONAL_NOTIFICATION_SETTINGS}
        emailEnabled={emailEnabled}
        onToggle={toggle}
        renderControl={(group) =>
          group.id === "preference" ? (
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <p className="text-[13px] font-medium text-[#303946]">{preferenceTrackCount}개 트랙에서 사용 중</p>
              <Link href="/mypage/preferences" className="text-[13px] font-medium text-[#111111] underline underline-offset-2">
                관심 조건에서 관리
              </Link>
            </div>
          ) : undefined
        }
      />
    </MyPageShell>
  );
}
