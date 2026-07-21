"use client";

import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
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
          <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">알림 설정</h1>
          <p className="mt-2 text-[13px] font-normal text-[#68717e]">알림을 받을 항목과 방식을 설정할 수 있습니다.</p>
          <p className="mt-2 text-[13px] font-normal leading-[1.6] text-[#8a94a3]">
            사이트 내 알림은 항상 제공되며, 아래 설정은 이메일 수신 여부에 적용됩니다.
          </p>
        </div>

        <div className="mt-6 divide-y divide-[#e5e9ef] border border-border bg-white">
          {BUSINESS_NOTIFICATION_SETTINGS.map((group) => (
            <div key={group.id} className="px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#17202c]">{group.label}</p>
                  <p className="mt-1 text-[13px] leading-[1.6] text-[#68717e]">{group.description}</p>
                </div>
                {group.locked ? (
                  <span className="shrink-0 text-[13px] font-semibold text-[#303946]">항상 발송</span>
                ) : (
                  <ToggleSwitch checked={Boolean(emailEnabled[group.id])} onChange={() => toggle(group.id)} label={group.label} />
                )}
              </div>
              {group.locked && group.lockedNote ? (
                <p className="mt-3 text-[12px] leading-[1.6] text-[#8a94a3]">{group.lockedNote}</p>
              ) : null}
            </div>
          ))}
        </div>

        <p className="mt-4 text-[12px] leading-[1.6] text-[#8a94a3]">
          결제 완료·취소 등 주요 안내는 카카오톡으로도 발송됩니다.
        </p>
      </div>
    </BusinessCenterShell>
  );
}
