"use client";

import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { PageTitle } from "@/components/ui/Typography";
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
          <PageTitle className="max-[760px]:mt-0">알림</PageTitle>
          <p className="mt-2 text-[15px] font-normal leading-[1.7] text-[#68717e]">받은 알림을 확인하고 관련 페이지로 이동할 수 있습니다.</p>
        </div>

        <NotificationList notifications={MOCK_BUSINESS_NOTIFICATIONS} scope="business" />
      </div>
    </BusinessCenterShell>
  );
}
