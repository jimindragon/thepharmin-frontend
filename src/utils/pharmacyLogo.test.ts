import { describe, expect, it } from "vitest";
import {
  PHARMACY_LOGO_PALETTE,
  generatePharmacyLogo,
  getPharmacyMonogram,
  hashName,
  normalizePharmacyName,
} from "@/utils/pharmacyLogo";

describe("normalizePharmacyName", () => {
  it("은행약국 → 은행", () => {
    expect(normalizePharmacyName("은행약국")).toBe("은행");
  });

  it("365 열린약국 → 365열린", () => {
    expect(normalizePharmacyName("365 열린약국")).toBe("365열린");
  });

  it("strips the 약방 suffix", () => {
    expect(normalizePharmacyName("정성약방")).toBe("정성");
  });

  it("strips the 팜 suffix", () => {
    expect(normalizePharmacyName("그린팜")).toBe("그린");
  });

  it("strips the english pharmacy suffix case-insensitively", () => {
    expect(normalizePharmacyName("Green Pharmacy")).toBe("Green");
    expect(normalizePharmacyName("Green PHARMACY")).toBe("Green");
  });

  it("falls back to the whitespace-stripped original name when stripping the suffix leaves nothing", () => {
    expect(normalizePharmacyName("약국")).toBe("약국");
    expect(normalizePharmacyName("  pharmacy  ")).toBe("pharmacy");
  });
});

describe("getPharmacyMonogram", () => {
  it("uses the first two characters of the normalized name", () => {
    expect(getPharmacyMonogram("은행")).toBe("은행");
    expect(getPharmacyMonogram("365열린")).toBe("36");
  });

  it("shows a single character when only one is available", () => {
    expect(getPharmacyMonogram("은")).toBe("은");
  });
});

describe("hashName", () => {
  it("is deterministic for the same input", () => {
    expect(hashName("은행약국")).toBe(hashName("은행약국"));
  });

  it("returns an unsigned 32-bit integer", () => {
    const hash = hashName("은행약국");
    expect(Number.isInteger(hash)).toBe(true);
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(hash).toBeLessThanOrEqual(0xffffffff);
  });
});

describe("generatePharmacyLogo", () => {
  it("returns identical hash, color and monogram for the same name every time", () => {
    const first = generatePharmacyLogo("은행약국");
    const second = generatePharmacyLogo("은행약국");

    expect(second.hash).toBe(first.hash);
    expect(second.colorIndex).toBe(first.colorIndex);
    expect(second.palette).toEqual(first.palette);
    expect(second.monogram).toBe(first.monogram);
    expect(second.shape).toBe(first.shape);
  });

  it("normalizes 은행약국 to 은행 and uses it as the monogram", () => {
    const result = generatePharmacyLogo("은행약국");
    expect(result.normalizedName).toBe("은행");
    expect(result.monogram).toBe("은행");
  });

  it("normalizes 365 열린약국 to 365열린", () => {
    const result = generatePharmacyLogo("365 열린약국");
    expect(result.normalizedName).toBe("365열린");
    expect(result.monogram).toBe("36");
  });

  it("defaults to the color variant, size 64 and medium rounding", () => {
    const result = generatePharmacyLogo("은행약국");
    expect(result.variant).toBe("color");
    expect(result.size).toBe(64);
    expect(result.rounded).toBe("medium");
    expect(result.radius).toBe("16%");
  });

  it("applies the deep-green text color for bright palette entries, white for dark ones", () => {
    // 팔레트 인덱스 0,1은 어두운 색(흰 글자), 2,3은 밝은 색(딥그린 글자)
    expect(PHARMACY_LOGO_PALETTE[0].text).toBe("#FFFFFF");
    expect(PHARMACY_LOGO_PALETTE[1].text).toBe("#FFFFFF");
    expect(PHARMACY_LOGO_PALETTE[2].text).toBe("#063B34");
    expect(PHARMACY_LOGO_PALETTE[3].text).toBe("#063B34");

    // generatePharmacyLogo가 고른 palette는 항상 colorIndex에 대응하는 실제 팔레트 항목과 같아야 한다
    ["은행약국", "그린약국", "센트럴약국", "365 열린약국", "케어플러스약국"].forEach((name) => {
      const result = generatePharmacyLogo(name);
      expect(result.palette).toEqual(PHARMACY_LOGO_PALETTE[result.colorIndex]);
    });
  });

  it("maps each rounded option to its radius percentage", () => {
    expect(generatePharmacyLogo("은행약국", { rounded: "soft" }).radius).toBe("22%");
    expect(generatePharmacyLogo("은행약국", { rounded: "medium" }).radius).toBe("16%");
    expect(generatePharmacyLogo("은행약국", { rounded: "sharp" }).radius).toBe("9%");
    expect(generatePharmacyLogo("은행약국", { rounded: "circle" }).radius).toBe("50%");
  });

  it("hashes the full original name, not the normalized one", () => {
    // "은행약국"과 "은행"은 정규화 결과가 같은 "은행"이지만, 해시는 원본 전체 문자열 기준이라 서로 달라야 한다
    const withSuffix = generatePharmacyLogo("은행약국");
    const withoutSuffix = generatePharmacyLogo("은행");
    expect(withSuffix.normalizedName).toBe(withoutSuffix.normalizedName);
    expect(withSuffix.hash).not.toBe(withoutSuffix.hash);
  });
});
