"use client";

import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { NotificationList } from "@/components/shared/NotificationList";
import { MOCK_PERSONAL_NOTIFICATIONS } from "@/data/notifications";

export function MyPageNotificationsClient() {
  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "알림" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">알림</h1>
      <p className="mt-2.5 text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        받은 알림을 확인하고 관련 페이지로 이동할 수 있습니다.
      </p>

      <NotificationList notifications={MOCK_PERSONAL_NOTIFICATIONS} scope="personal" />
    </MyPageShell>
  );
}
