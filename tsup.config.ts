import { defineConfig } from "tsup";

export default defineConfig(({ watch }) => ({
  entry: ["src/index.ts"],
  sourcemap: !watch,
  clean: !watch,
  minify: !watch,
  dts: !watch,
  format: ["cjs", "esm"],
  target: "node18",
  outDir: "dist",
  onSuccess: watch ? "pnpm run start" : undefined,
}));
