import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // --- AQUI ESTÁ A NOSSA MUDANÇA ---
      colors: {
        'avine-yellow': '#fcc908', // O amarelo-gema principal
        'avine-green': '#006838',  // O verde-escuro principal
        'avine-orange': '#f58220', // O laranja dos detalhes
      },
      // --- FIM DA MUDANÇA ---

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;