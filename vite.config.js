/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

let outDir = "";
let configStore;

export default defineConfig({
  // 配置选项
  test: {
    coverage: {
      exclude: [
        "vite.config.js",
        "dist",
        "JavyInputAppendix.js",
        "src/javascript/unishox2.js",
        "src/javascript/otplib.d.ts",
        "docs",
        "src/javascript/main.d.ts",
        "src/javascript/utils.js",
        "src/javascript/utils_next.js",
      ],
    },
  },
  build: {
    outDir: "dist", // 将打包后的文件输出到 dist 目录
    minify: "eslint", // 使用 terser 进行压缩
    lib: {
      entry: "./src/javascript/main.js",
      name: "abracadabra-cn",
      fileName: "abracadabra-cn",
    },
  },
  plugins: [
    {
      name: "Abracadabra-Javy-Artifact",
      apply: "build", // 只在生产构建时生效
      configResolved(config) {
        // 保存最终输出目录路径
        outDir = path.resolve(config.root, config.build.outDir);
        configStore = config;
      },
      async writeBundle() {
        // 自定义内容（这里可以修改为你需要追加的内容）
        const AppendContentPath = path.join(
          configStore.root,
          "JavyInputAppendix.js"
        );
        const appendContent = fs.readFileSync(AppendContentPath, "utf8");

        const TargetContentPath = path.join(outDir, "abracadabra-cn.js");
        const TargetContent = fs.readFileSync(TargetContentPath, "utf8");
        //创建全新文件
        const newFilePath = path.join(outDir, "abracadabra-cn-javy.js");
        fs.writeFileSync(newFilePath, `${TargetContent}${appendContent}`);

        // 复制 TypeScript 声明文件到输出目录
        const dtsSourcePath = path.join(
          configStore.root,
          "src/javascript/main.d.ts"
        );
        const dtsTargetPath = path.join(outDir, "abracadabra-cn.d.ts");
        fs.copyFileSync(dtsSourcePath, dtsTargetPath);
      },
    },
  ],
});
