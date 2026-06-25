import { generatePharmacyLogo, type PharmacyLogoData, type PharmacyLogoOptions, type PharmacyLogoShape } from "@/utils/pharmacyLogo";

/**
 * 약국명 자동 생성 로고. generatePharmacyLogo(순수 함수)가 만든 데이터를 SVG로 그리기만 한다.
 * 사이즈가 달라져도 선명하도록 64x64 내부 좌표계를 쓰고 실제 표시 크기는 width/height로만 조절한다.
 */
const VIEWBOX = 64;
const MONO_BACKGROUND = "#141414";
const MONO_TEXT = "#FFFFFF";
const GEOMETRIC_TEXT = "#0C6E61";
const FONT_FAMILY = 'Pretendard, "Noto Sans KR", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';

interface ShapeDescriptor {
  kind: "circle" | "rect";
  cx: number;
  cy: number;
  size: number;
  rx?: number;
  rotate?: number;
}

/** 도형 종류(해시로 선택)별 배경 장식 2개의 위치·크기. 둘 다 같은 종류, 위치만 다르게 배치한다 */
function getShapeDescriptors(shape: PharmacyLogoShape): [ShapeDescriptor, ShapeDescriptor] {
  switch (shape) {
    case "circle":
      return [
        { kind: "circle", cx: 48, cy: 16, size: 34 },
        { kind: "circle", cx: 14, cy: 50, size: 24 },
      ];
    case "roundedSquare":
      return [
        { kind: "rect", cx: 47, cy: 16, size: 30, rx: 7 },
        { kind: "rect", cx: 15, cy: 49, size: 20, rx: 5 },
      ];
    case "diamond":
      return [
        { kind: "rect", cx: 47, cy: 16, size: 24, rx: 3, rotate: 45 },
        { kind: "rect", cx: 15, cy: 49, size: 16, rx: 2, rotate: 45 },
      ];
  }
}

function getRadiusPx(data: PharmacyLogoData) {
  return (parseFloat(data.radius) / 100) * VIEWBOX;
}

function getFontSize(monogram: string) {
  return monogram.length > 1 ? 22 : 30;
}

function resolveColors(data: PharmacyLogoData) {
  if (data.variant === "mono") {
    return { background: MONO_BACKGROUND, text: MONO_TEXT };
  }

  if (data.variant === "geometric") {
    return { background: data.palette.tint, text: GEOMETRIC_TEXT };
  }

  return { background: data.palette.hex, text: data.palette.text };
}

function ShapeNode({ shape, fill, opacity }: { shape: ShapeDescriptor; fill: string; opacity: number }) {
  if (shape.kind === "circle") {
    return <circle cx={shape.cx} cy={shape.cy} r={shape.size / 2} fill={fill} opacity={opacity} />;
  }

  const half = shape.size / 2;
  const rect = (
    <rect x={shape.cx - half} y={shape.cy - half} width={shape.size} height={shape.size} rx={shape.rx} fill={fill} opacity={opacity} />
  );

  return shape.rotate ? <g transform={`rotate(${shape.rotate} ${shape.cx} ${shape.cy})`}>{rect}</g> : rect;
}

interface PharmacyLogoProps extends PharmacyLogoOptions {
  name: string;
  className?: string;
}

export function PharmacyLogo({ name, variant, size, rounded, className }: PharmacyLogoProps) {
  const data = generatePharmacyLogo(name, { variant, size, rounded });
  const rx = getRadiusPx(data);
  const fontSize = getFontSize(data.monogram);
  const { background, text } = resolveColors(data);
  const clipId = `pharmacy-logo-clip-${data.hash}-${data.rounded}`;

  return (
    <svg
      role="img"
      aria-label={`${name} 로고`}
      width={data.size}
      height={data.size}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      className={className}
    >
      <defs>
        <clipPath id={clipId}>
          <rect width={VIEWBOX} height={VIEWBOX} rx={rx} />
        </clipPath>
      </defs>

      {data.variant === "color" ? (
        <rect width={VIEWBOX} height={VIEWBOX} rx={rx} fill="#04221d" opacity={0.18} transform="translate(0, 1.5)" style={{ filter: "blur(1.4px)" }} />
      ) : null}

      <g clipPath={`url(#${clipId})`}>
        <rect width={VIEWBOX} height={VIEWBOX} fill={background} />

        {data.variant === "geometric"
          ? getShapeDescriptors(data.shape).map((shape, index) => (
              <ShapeNode key={index} shape={shape} fill={data.palette.hex} opacity={index === 0 ? 0.22 : 0.16} />
            ))
          : null}

        {data.variant === "mono" ? (
          <rect
            x={1.5}
            y={1.5}
            width={VIEWBOX - 3}
            height={VIEWBOX - 3}
            rx={Math.max(rx - 1.5, 0)}
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={1}
          />
        ) : null}

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={FONT_FAMILY}
          fontWeight={700}
          fontSize={fontSize}
          letterSpacing={-0.5}
          fill={text}
        >
          {data.monogram}
        </text>
      </g>
    </svg>
  );
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function shapeToSvgString(shape: ShapeDescriptor, fill: string, opacity: number) {
  if (shape.kind === "circle") {
    return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.size / 2}" fill="${fill}" opacity="${opacity}" />`;
  }

  const half = shape.size / 2;
  const rect = `<rect x="${shape.cx - half}" y="${shape.cy - half}" width="${shape.size}" height="${shape.size}" rx="${shape.rx ?? 0}" fill="${fill}" opacity="${opacity}" />`;

  return shape.rotate ? `<g transform="rotate(${shape.rotate} ${shape.cx} ${shape.cy})">${rect}</g>` : rect;
}

/** PharmacyLogo와 동일한 결과를 마크업 문자열로 만든다(예: data URI, 비-React 컨텍스트에서 재사용) */
export function toSVGString(name: string, options?: PharmacyLogoOptions): string {
  const data = generatePharmacyLogo(name, options);
  const rx = getRadiusPx(data);
  const fontSize = getFontSize(data.monogram);
  const { background, text } = resolveColors(data);
  const clipId = `pharmacy-logo-clip-${data.hash}-${data.rounded}`;

  const shadow =
    data.variant === "color"
      ? `<rect width="${VIEWBOX}" height="${VIEWBOX}" rx="${rx}" fill="#04221d" opacity="0.18" transform="translate(0, 1.5)" style="filter:blur(1.4px)" />`
      : "";

  const shapesMarkup =
    data.variant === "geometric"
      ? getShapeDescriptors(data.shape)
          .map((shape, index) => shapeToSvgString(shape, data.palette.hex, index === 0 ? 0.22 : 0.16))
          .join("")
      : "";

  const monoBorder =
    data.variant === "mono"
      ? `<rect x="1.5" y="1.5" width="${VIEWBOX - 3}" height="${VIEWBOX - 3}" rx="${Math.max(rx - 1.5, 0)}" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1" />`
      : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(name)} 로고" width="${data.size}" height="${data.size}" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}">` +
    `<defs><clipPath id="${clipId}"><rect width="${VIEWBOX}" height="${VIEWBOX}" rx="${rx}" /></clipPath></defs>` +
    shadow +
    `<g clip-path="url(#${clipId})">` +
    `<rect width="${VIEWBOX}" height="${VIEWBOX}" fill="${background}" />` +
    shapesMarkup +
    monoBorder +
    `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family='${FONT_FAMILY}' font-weight="700" font-size="${fontSize}" letter-spacing="-0.5" fill="${text}">${escapeXml(data.monogram)}</text>` +
    `</g>` +
    `</svg>`
  );
}
