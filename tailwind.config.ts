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
        "status-complete": "var(--status-complete)",
        "status-warning": "var(--status-warning)",
        "status-warning-subtle": "var(--status-warning-subtle)",
        "status-warning-border": "var(--status-warning-border)",
        "status-error": "var(--status-error)",
        "status-error-subtle": "var(--status-error-subtle)",
        "status-error-border": "var(--status-error-border)",
        "status-urgent": "var(--status-urgent)",
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
