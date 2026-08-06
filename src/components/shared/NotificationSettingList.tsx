"use client";

import type { ReactNode } from "react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { NotificationSettingGroup } from "@/types/notifications";

interface NotificationSettingListProps {
  groups: NotificationSettingGroup[];
  /** 그룹 id → 이메일 수신 여부. 상태는 페이지가 들고 있고 여기선 표시만 한다. */
  emailEnabled: Record<string, boolean>;
  onToggle: (id: string) => void;
  /**
   * 특정 그룹만 토글 대신 다른 우측 요소를 쓸 때의 탈출구.
   * undefined를 돌려주면 기본 처리(locked면 안내, 아니면 토글)로 넘어간다.
   * 현재는 개인 "관심 조건" 한 그룹만 쓴다 — 이걸 행 종류 enum으로 세우면
   * 값이 하나뿐인 분기를 타입으로 굳히는 셈이라 두지 않았다.
   */
  renderControl?: (group: NotificationSettingGroup) => ReactNode | undefined;
}

/**
 * 개인·기업 알림 "설정" 화면의 공용 리스트 — 카드 컨테이너 + 그룹 행(제목/설명/우측 슬롯).
 * 두 페이지가 각자 들고 있던 같은 마크업을 그대로 옮겼다(클래스 문자열 무변경).
 * locked/lockedNote는 NotificationSettingGroup이 이미 들고 있는 필드라 기업 전용 prop이 아니라
 * 데이터 기반 기본 동작으로 흡수했다 — 기업 화면은 추가 prop 없이 그대로 그려진다.
 * 브레드크럼·h1·설명문은 페이지마다 값이 달라 호출부에 남긴다(NotificationList와 같은 선).
 * 컨테이너 상단 마진은 mt-6으로 통일했다(개인이 쓰던 mt-7에서 4px 줄어든다) — 목록 쪽
 * NotificationList에서 이미 같은 값으로 맞춘 전례를 따랐다.
 */
export function NotificationSettingList({ groups, emailEnabled, onToggle, renderControl }: NotificationSettingListProps) {
  return (
    <div className="mt-6 divide-y divide-[#e5e9ef] border border-border bg-white">
      {groups.map((group) => {
        const control = renderControl?.(group);

        return (
          <div key={group.id} className="px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[16px] font-semibold text-[#17202c]">{group.label}</p>
                <p className="mt-1 text-[13px] leading-[1.6] text-[#68717e]">{group.description}</p>
              </div>
              {control !== undefined ? (
                control
              ) : group.locked ? (
                <span className="shrink-0 text-[13px] font-medium text-[#303946]">항상 발송</span>
              ) : (
                <ToggleSwitch checked={Boolean(emailEnabled[group.id])} onChange={() => onToggle(group.id)} label={group.label} />
              )}
            </div>
            {group.locked && group.lockedNote ? (
              <p className="mt-3 text-[12px] leading-[1.6] text-[#8a94a3]">{group.lockedNote}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
