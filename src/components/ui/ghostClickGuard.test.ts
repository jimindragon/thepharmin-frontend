import { describe, expect, it } from "vitest";
import { isInsideGhostGuardRegion } from "@/components/ui/ghostClickGuard";

/**
 * 390×664 실측 좌표(42f2af2 커밋의 계측 그대로).
 * 패널은 w-[min(85vw,360px)]라 390px에서 331.5px → 좌측 58.5, 우측 390. 세로는 inset-y-0라 0~664.
 */
const PANEL_RECT = { left: 58.5, right: 390, top: 0, bottom: 664 };

const guard = (point: { x: number; y: number } | null) => ({ rect: PANEL_RECT, point });

describe("isInsideGhostGuardRegion", () => {
  it("X 아래에 있던 계정 트리거 자리(354,28)로 오는 고스트는 삼킨다", () => {
    expect(isInsideGhostGuardRegion(guard({ x: 354, y: 28 }), 354, 28)).toBe(true);
  });

  it("패널이 덮고 있던 하단 탭바 캘린더 칸(273,640)도 패널 rect 안이라 삼킨다", () => {
    expect(isInsideGhostGuardRegion(guard(null), 273, 640)).toBe(true);
  });

  it("딤(패널 밖)을 탭해 닫았을 때 그 자리로 오는 고스트는 탭 좌표로 잡는다", () => {
    expect(isInsideGhostGuardRegion(guard({ x: 30, y: 400 }), 30, 400)).toBe(true);
  });

  it("딤으로 닫은 뒤 전혀 다른 곳을 새로 누르면 통과시킨다", () => {
    expect(isInsideGhostGuardRegion(guard({ x: 30, y: 400 }), 30, 120)).toBe(false);
  });

  it("패널 밖 좌측(x<58.5)은 닫힘 지점과 무관하면 통과시킨다", () => {
    expect(isInsideGhostGuardRegion(guard(null), 20, 300)).toBe(false);
  });

  it("탭 좌표에서 손가락이 조금 밀린 고스트(≤24px)까지는 같은 탭으로 본다", () => {
    expect(isInsideGhostGuardRegion(guard({ x: 30, y: 400 }), 45, 415)).toBe(true);
    expect(isInsideGhostGuardRegion(guard({ x: 30, y: 400 }), 30, 430)).toBe(false);
  });

  it("rect도 point도 없으면(=잴 것이 없던 닫힘) 아무것도 삼키지 않는다", () => {
    expect(isInsideGhostGuardRegion({ rect: null, point: null }, 354, 28)).toBe(false);
  });
});
