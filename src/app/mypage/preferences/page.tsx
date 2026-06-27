import { Suspense } from "react";
import { MyPagePreferencesClient } from "@/components/mypage/MyPagePreferencesClient";

function PreferencesLoading() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f5f6f7]">
      <div className="sidebar-shell grid grid-cols-[260px_minmax(0,1fr)] max-[1040px]:grid-cols-1">
        <div className="border-r border-[#dfe4ea] bg-white px-6 py-7" />
        <div className="px-8 py-8 max-[760px]:px-4 max-[760px]:py-6">
          <div className="h-5 w-40 animate-pulse rounded bg-[#e5e9ef]" />
          <div className="mt-5 h-8 w-56 animate-pulse rounded bg-[#e5e9ef]" />
          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-[#e5e9ef]" />
        </div>
      </div>
    </div>
  );
}

export default function MyPagePreferencesPage() {
  return (
    <Suspense fallback={<PreferencesLoading />}>
      <MyPagePreferencesClient />
    </Suspense>
  );
}
