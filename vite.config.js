import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
        process.env.STRIPE_PUBLISHABLE_KEY ||
        ""
    ),
  },
  build: {
    sourcemap: true, // Enable source maps for production
  },
});
