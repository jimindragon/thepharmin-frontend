// 마이페이지에는 별도 허브 화면이 없다 — 대시보드가 그 자리를 대신한다.
// 앱 안에서 /mypage를 링크하는 곳은 없고(사이드바·계정 메뉴 모두 하위 경로를 직접 가리킨다),
// 주소창 직접 입력·북마크·알림 문구("마이페이지에서 확인해 주세요")로 들어오는 경우를 위한 안전망이다.
import { redirect } from "next/navigation";

export default function MyPagePage() {
  redirect("/mypage/dashboard");
}
