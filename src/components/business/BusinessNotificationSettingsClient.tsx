"use client";

import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { PageTitle } from "@/components/ui/Typography";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { NotificationSettingList } from "@/components/shared/NotificationSettingList";
import { BUSINESS_NOTIFICATION_SETTINGS } from "@/types/notifications";

export function BusinessNotificationSettingsClient() {
  const [emailEnabled, setEmailEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(BUSINESS_NOTIFICATION_SETTINGS.map((group) => [group.id, group.emailEnabled])),
  );

  const toggle = (id: string) => {
    setEmailEnabled((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <BusinessCenterShell>
      <div>
        {/* 헤더 */}
        <div>
          <PageBreadcrumb
            items={[
              { label: "기업센터", href: "/business/dashboard" },
              { label: "계정" },
              { label: "알림 설정" },
            ]}
          />
          <PageTitle className="max-[760px]:mt-0">알림 설정</PageTitle>
          <p className="mt-2 text-[15px] font-normal leading-[1.7] text-[#68717e]">
            사이트 내 알림은 항상 제공되며, 아래 설정은 이메일 수신 여부에 적용됩니다.
            <br />
            결제 완료·취소 등 주요 안내는 카카오톡으로도 발송됩니다.
          </p>
        </div>

        <NotificationSettingList groups={BUSINESS_NOTIFICATION_SETTINGS} emailEnabled={emailEnabled} onToggle={toggle} />
      </div>
    </BusinessCenterShell>
  );
}
