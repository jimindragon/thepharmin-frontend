export type PharmacyLogoVariant = "color" | "mono" | "geometric";
export type PharmacyLogoRounded = "soft" | "medium" | "sharp" | "circle";
export type PharmacyLogoShape = "circle" | "roundedSquare" | "diamond";

export interface PharmacyLogoOptions {
  variant?: PharmacyLogoVariant;
  size?: number;
  rounded?: PharmacyLogoRounded;
}

export interface PharmacyPaletteColor {
  hex: string;
  text: string;
  tint: string;
}

/** generatePharmacyLogo가 반환하는, 렌더링에 필요한 모든 값을 담은 순수 데이터 */
export interface PharmacyLogoData {
  /** 원본 약국명(정규화 전) */
  name: string;
  normalizedName: string;
  monogram: string;
  hash: number;
  variant: PharmacyLogoVariant;
  size: number;
  rounded: PharmacyLogoRounded;
  /** rounded 옵션에 대응하는 CSS 비율 문자열 (예: "16%") */
  radius: string;
  palette: PharmacyPaletteColor;
  colorIndex: number;
  shape: PharmacyLogoShape;
}

/** 다른 색상군은 추가하지 않는다 — 고정 브랜드 팔레트 */
export const PHARMACY_LOGO_PALETTE: readonly PharmacyPaletteColor[] = [
  { hex: "#0D7369", text: "#FFFFFF", tint: "#E3F1EE" },
  { hex: "#17A68C", text: "#FFFFFF", tint: "#E6F5EF" },
  { hex: "#1FBF92", text: "#063B34", tint: "#E8F9F1" },
  { hex: "#23D9A5", text: "#063B34", tint: "#E9FCF4" },
];

export const PHARMACY_LOGO_RADIUS_MAP: Record<PharmacyLogoRounded, string> = {
  soft: "22%",
  medium: "16%",
  sharp: "9%",
  circle: "50%",
};

const PHARMACY_LOGO_SHAPES: readonly PharmacyLogoShape[] = ["circle", "roundedSquare", "diamond"];

const DEFAULT_PHARMACY_LOGO_OPTIONS: Required<PharmacyLogoOptions> = {
  variant: "color",
  size: 64,
  rounded: "medium",
};

/** 약국명 끝에서 1회만 제거하는 접미사. 영문 pharmacy는 대소문자 구분 없이 매칭한다 */
const PHARMACY_SUFFIX_PATTERN = /(약국|약방|팜|pharmacy)$/i;

export function hashName(value: string): number {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

/**
 * 약국명 끝의 약국/약방/팜/pharmacy 접미사를 1회 제거하고 모든 공백을 없앤다.
 * 접미사 제거 후 결과가 비면(예: 이름이 "약국" 그 자체) 공백만 제거한 원본 이름을 사용한다.
 */
export function normalizePharmacyName(rawName: string): string {
  const trimmed = rawName.trim();
  const withoutSuffix = trimmed.replace(PHARMACY_SUFFIX_PATTERN, "");
  const collapsed = withoutSuffix.replace(/\s+/g, "");

  return collapsed.length > 0 ? collapsed : rawName.replace(/\s+/g, "");
}

/** 정규화된 이름의 앞 두 글자(한 글자뿐이면 한 글자)를 모노그램으로 사용한다 */
export function getPharmacyMonogram(normalizedName: string): string {
  return Array.from(normalizedName).slice(0, 2).join("");
}

/** 약국명 문자열만으로 결정론적인 로고 데이터를 만드는 순수 함수. 렌더링은 하지 않는다 */
export function generatePharmacyLogo(name: string, options?: PharmacyLogoOptions): PharmacyLogoData {
  const variant = options?.variant ?? DEFAULT_PHARMACY_LOGO_OPTIONS.variant;
  const size = options?.size ?? DEFAULT_PHARMACY_LOGO_OPTIONS.size;
  const rounded = options?.rounded ?? DEFAULT_PHARMACY_LOGO_OPTIONS.rounded;

  const normalizedName = normalizePharmacyName(name);
  const monogram = getPharmacyMonogram(normalizedName);
  const hash = hashName(name);
  const colorIndex = hash % PHARMACY_LOGO_PALETTE.length;
  const shapeIndex = (hash >>> 3) % PHARMACY_LOGO_SHAPES.length;

  return {
    name,
    normalizedName,
    monogram,
    hash,
    variant,
    size,
    rounded,
    radius: PHARMACY_LOGO_RADIUS_MAP[rounded],
    palette: PHARMACY_LOGO_PALETTE[colorIndex],
    colorIndex,
    shape: PHARMACY_LOGO_SHAPES[shapeIndex],
  };
}
