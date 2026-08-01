import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/config/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "var(--color-brand)",
        accent: "var(--color-accent)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        danger: "var(--color-danger)",
        // 상태 색 토큰 — globals.css의 --status-* 변수와 1:1 매핑
        "status-positive": "var(--status-positive)",
        "status-positive-subtle": "var(--status-positive-subtle)",
        "status-positive-border": "var(--status-positive-border)",
        "status-pending": "var(--status-pending)",
        "status-pending-subtle": "var(--status-pending-subtle)",
        "status-pending-border": "var(--status-pending-border)",
        "status-error": "var(--status-error)",
        "status-error-subtle": "var(--status-error-subtle)",
        "status-error-border": "var(--status-error-border)",
        "status-urgent": "var(--status-urgent)",
        "status-positive-dot": "var(--status-positive-dot)",
        "status-pending-dot": "var(--status-pending-dot)",
        "status-error-dot": "var(--status-error-dot)",
        "status-neutral-dot": "var(--status-neutral-dot)",
      },
      backgroundImage: {
        "gradient-cta": "var(--gradient-cta)",
      },
      boxShadow: {
        app: "var(--shadow)",
      },
      borderRadius: {
        app: "var(--radius)",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "Noto Sans KR",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
