import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import replace from "@rollup/plugin-replace";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    replace({
      preventAssignment: true,
      include: ["src/**/*.ts", "src/**/*.svelte"],
      values: {
        __SERVER_URL__: JSON.stringify(
          process.env.SERVER_URL || "http://127.0.0.1:3000"
        ),
      },
    }),
  ],
});
