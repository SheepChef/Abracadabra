/*
 * Copyright (C) 2025-2026 SheepChef (a.k.a. Haruka Hokuto)
 *
 * 这是一个源代码公开的软件。
 * 在遵守AIPL-1.2许可证的前提下，
 * 你可以自由复制，修改，分发，使用它。
 *
 * 查阅 Academic Innovation Protection License(AIPL) 来了解更多 .
 * 本作品应随附一份完整的 AIPL-1.2 许可证全文。
 *
 */

/*
 * NOTICE
 *
 * Abracadabra distributes its newly compiled Dilution rule-set collections as
 * part of the AIPL-1.2-licensed project, insofar as copyright protection attaches
 * to its original contributions, selection, arrangement, and other authored
 * material. This does NOT replace the MIT or Apache-2.0 licenses applicable
 * to upstream source materials or components, restrict rights independently
 * granted by those upstream licenses, or claim exclusive rights over underlying
 * public-domain works. Each original license and applicable attribution remains
 * in force for material covered by it.
 *
 */

/*
 * ACKNOWLEDGEMENT
 *
 * 魔曰使用了两个上游语料库来构建稀释规则集文件。
 * 清洗语料库工作实属不易，特此感谢上游语料库的出色工作。
 *
 * Erya-dataset —— © RUCAIBox
 * chinese-poetry —— © 2016 JackeyGao
 *
 */

/**
 * Dilution Std Corpus Prebuild
 *
 * 读取 dilution_corpus 目录下的全部 JSON，
 * 合并、压缩，并生成一个可同步解码的 ESM 模块。
 *
 * Node.js >= 22.15（建议 24）
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { zstdCompressSync, constants } from "node:zlib";

// 路径相对于此脚本，而不是当前工作目录
const ROOT = fileURLToPath(new URL("./", import.meta.url));
const INPUT_DIR = join(ROOT, "dilution_corpus");
const OUTPUT_FILE = join(ROOT, "src/generated/dilution-std-data.js");

const COMPRESSION_LEVEL = 15;

// 必需的四个文件
const REQUIRED = [
  "manifest.json",
  "dilution_templates_B.json",
  "dilution_templates_C.json",
  "dilution_templates_S.json",
];

// 1. 查找所有 JSON
const files = (await readdir(INPUT_DIR, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
  .map((entry) => entry.name)
  .sort();

// 2. 检查必需文件
for (const required of REQUIRED) {
  if (!files.includes(required)) {
    throw new Error(`Missing Dilution Corpus file: ${required}`);
  }
}

// 3. 读取所有文件，保留文件名称作为键
const corpus = Object.create(null);

for (const filename of files) {
  const path = join(INPUT_DIR, filename);
  const key = basename(filename, ".json");

  const source = await readFile(path, "utf8");

  try {
    corpus[key] = JSON.parse(source);
  } catch (error) {
    throw new Error(`Invalid JSON: ${filename}`, { cause: error });
  }
}

// 4. 合并并压缩
const serialized = Buffer.from(JSON.stringify(corpus), "utf8");

const compressed = zstdCompressSync(serialized, {
  params: {
    [constants.ZSTD_c_compressionLevel]: COMPRESSION_LEVEL,
  },
});

const base64 = compressed.toString("base64");

// 5. 生成唯一的 ESM 文件
const generated = `/**
 * Dilution Standard Corpus
 *
 * AUTO-GENERATED FILE. DO NOT EDIT.
 * Codec: Zstandard
 * Original size: ${serialized.length} bytes
 * Compressed size: ${compressed.length} bytes
 * Source files: ${files.length}
 */

import { decompress } from "fzstd";

const DATA = ${JSON.stringify(base64)};

let cache = null;

function decodeBase64(input) {
    if (typeof Uint8Array.fromBase64 === "function") {
        return Uint8Array.fromBase64(input);
    }

    const binary = atob(input);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}

/**
 * 同步获取内置 Dilution Std Corpus。
 * 第一次调用解压和解析，之后直接返回缓存。
 */
export function loadBundledDilutionCorpus() {
    if (cache !== null) {
        return cache;
    }

    const compressed = decodeBase64(DATA);
    const decompressed = decompress(compressed);

    cache = JSON.parse(new TextDecoder().decode(decompressed));

    return cache;
}
`;

// 6. 写入生成文件
await mkdir(dirname(OUTPUT_FILE), { recursive: true });
await writeFile(OUTPUT_FILE, generated, "utf8");

console.log("[Dilution Std] Build complete");
console.log(`  Files:      ${files.length}`);
console.log(`  Original:   ${(serialized.length / 1048576).toFixed(2)} MiB`);
console.log(`  Compressed: ${(compressed.length / 1048576).toFixed(2)} MiB`);
console.log(
  `  ESM Base64: ${(Buffer.byteLength(generated) / 1048576).toFixed(2)} MiB`
);
console.log(
  `  Ratio:      ${((compressed.length / serialized.length) * 100).toFixed(2)}%`
);
console.log(`  Output:     ${OUTPUT_FILE}`);
