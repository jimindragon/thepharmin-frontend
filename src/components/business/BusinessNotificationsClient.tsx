"use client";

import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { NotificationList } from "@/components/shared/NotificationList";
import { MOCK_BUSINESS_NOTIFICATIONS } from "@/data/notifications";

export function BusinessNotificationsClient() {
  return (
    <BusinessCenterShell>
      <div>
        <div>
          <PageBreadcrumb
            items={[
              { label: "기업센터", href: "/business/dashboard" },
              { label: "계정" },
              { label: "알림" },
            ]}
          />
          <h1 className="mt-5 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">알림</h1>
          <p className="mt-2 text-[15px] font-normal leading-[1.7] text-[#68717e]">받은 알림을 확인하고 관련 페이지로 이동할 수 있습니다.</p>
        </div>

        <NotificationList notifications={MOCK_BUSINESS_NOTIFICATIONS} scope="business" />
      </div>
    </BusinessCenterShell>
  );
}
