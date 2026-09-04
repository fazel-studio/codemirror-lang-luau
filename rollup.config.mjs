import { nodeResolve } from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "es"
    },
    {
      file: "dist/index.cjs",
      format: "cjs",
      exports: "named"
    }
  ],
  external: id => {
    if (id.startsWith(".") || id.startsWith("/")) return false
    if (/^[A-Z]:/.test(id)) return false
    if (id.startsWith("src")) return false
    return true
  },
  plugins: [
    nodeResolve(),
    typescript({
      declaration: true,
      declarationDir: "dist",
      exclude: ["test/**/*", "src/parser*"],
      allowJs: true
    })
  ]
}
