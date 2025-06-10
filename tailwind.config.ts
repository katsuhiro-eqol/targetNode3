import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontSize: {
        'xxs': '0.625rem', // 10px
        'xxxs': '0.5rem',  // 8px
      },
      height: {
        '100': '25rem',    // 400px
        '104': '26rem',    // 416px
        '108': '27rem',    // 432px
        '112': '28rem',    // 448px
        '116': '29rem',    // 464px
        '120': '30rem',    // 480px
        'screen-90': '90vh', // ビューポートの90%
        'screen-80': '80vh', // ビューポートの80%
      },
    },
  },
  plugins: [],
} satisfies Config;
