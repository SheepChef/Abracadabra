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

/**
 * Homepage Presets Prebuild
 *
 * 调用本地 Abracadabra 引擎为官网首页生成经过双向校验的静态预设密文，
 * 避免首屏打开时执行同步 PBKDF2 与大语料解压造成主线程阻塞。
 */

import { access, mkdir, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DILUTION_DATA_FILE = resolve(ROOT, "src/generated/dilution-std-data.js");
const OUTPUT_FILE = resolve(ROOT, "docs/.vitepress/components/homePresets.js");

const RUNNER_SOURCE = `
  import { Abracadabra } from "./src/javascript/main.js";
  import {
    WenyanConfig,
    AdvancedEncConfig,
    FlexibleTransferConfig,
    DilutionConfig,
  } from "./src/javascript/CoreHandler.js";
  import { WenyanSimulator } from "./src/javascript/ChineseMappingHelper.js";
  import { Compress } from "./src/javascript/CompressionHelper.js";
  import { GetLuhnBit, RemovePadding } from "./src/javascript/Misc.js";
  import { Encrypt } from "./src/javascript/EncryptHelper.js";
  import { Base64 } from "js-base64";

  export function generatePresets() {
    const key = "ABRACADABRA-HOMEPAGE-DEMO";
    const alphabet = new WenyanSimulator(key).PayloadLetter;
    const corpus = new Abracadabra.DilutionCorpus();

    // 1. Hero 试墨初始样例（不启用高级加密以保持演示篇幅紧凑）
    const heroInput = "今晚七点，老地方见。";
    const heroAbra = new Abracadabra();
    heroAbra.WenyanInput(
      heroInput,
      Abracadabra.ENCRYPT,
      key,
      Object.assign(new WenyanConfig(), {
        PunctuationMark: true,
        RandomIndex: 50,
        RandomParagraphing: [20, 80],
      }),
      new AdvancedEncConfig()
    );
    const heroCipher = heroAbra.Output();
    heroAbra.WenyanInput(heroCipher, Abracadabra.DECRYPT, key);
    if (heroAbra.Output() !== heroInput) {
      throw new Error("Hero preset verification failed");
    }

    // 2. Banner 背景词体稀释语料（0.2 目标载荷率）
    const bannerSample =
      "山川异域，风月同天。夜深灯火未歇，写几句寻常话语封进诗文里。远方收到的人凭同一句口令拆封，字里行间还是原来的模样。";
    const bannerAbra = new Abracadabra();
    bannerAbra.WenyanInput(
      bannerSample,
      Abracadabra.ENCRYPT,
      key,
      Object.assign(new WenyanConfig(), {
        PunctuationMark: true,
        RandomIndex: 50,
        RandomParagraphing: [20, 80],
        DilutionConfig: new DilutionConfig(
          true,
          0.2,
          "LYRIC",
          "ALL",
          "SMART",
          "UNIFORM",
          corpus,
          true,
          50
        ),
      }),
      new AdvancedEncConfig()
    );
    const bannerCipher = bannerAbra.Output();
    bannerAbra.WenyanInput(bannerCipher, Abracadabra.DECRYPT, key);
    if (bannerAbra.Output() !== bannerSample) {
      throw new Error("Banner preset verification failed");
    }

    // 3. 加密推演步骤演示
    const compressionSample = "https://github.com/SheepChef/Abracadabra";
    const sample = new TextEncoder().encode(compressionSample);
    const checked = new Uint8Array(sample.length + 1);
    checked.set(sample);
    checked[sample.length] = GetLuhnBit(sample);
    const compressed = Compress(checked);
    const encryptedBytes = Encrypt(compressed.slice(), key, new AdvancedEncConfig());
    const encoded = RemovePadding(Base64.fromUint8Array(encryptedBytes));
    const mapped = new WenyanSimulator(key).enMap(
      encoded,
      true,
      50,
      [20, 80],
      false,
      false,
      false,
      new DilutionConfig()
    );
    const pipeCheck = new Abracadabra();
    pipeCheck.WenyanInput(mapped, "DECRYPT", key);
    if (pipeCheck.Output() !== compressionSample) {
      throw new Error("Pipeline preset verification failed");
    }
    const hex = (bytes) =>
      Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(" ");
    const mappedChars = Array.from(mapped);
    const trace = [
      {
        title: "原文",
        source: "TextEncoder",
        format: "UTF-8 / TEXT",
        meta: sample.length + " bytes",
        frames: [compressionSample],
      },
      {
        title: "压缩",
        source: "Compress()",
        format: "HEX / WITH CHECKSUM",
        meta: checked.length + " → " + compressed.length + " bytes",
        frames: [hex(compressed)],
      },
      {
        title: "加密",
        source: "Encrypt()",
        format: "AES-256-CTR / HEX",
        meta: encryptedBytes.length + " bytes",
        frames: [hex(encryptedBytes)],
      },
      {
        title: "编码",
        source: "Base64.fromUint8Array()",
        format: "BASE64",
        meta: encoded.length + " characters",
        frames: [encoded],
      },
      {
        title: "成文",
        source: "WenyanSimulator.enMap()",
        format: "文言密文",
        meta: mappedChars.length + " 字",
        frames: Array.from({ length: 7 }, (_, i) =>
          mappedChars
            .slice(0, Math.ceil((mappedChars.length * (i + 1)) / 7))
            .join("")
        ),
      },
    ];

    // 4. 高级加密档位对比（包含离线预计算的 PBKDF2 样例）
    const secText = "一封写给未来的信。";
    const security = [0, 1, 2].map((index) => {
      const abra = new Abracadabra();
      abra.WenyanInput(
        secText,
        "ENCRYPT",
        key,
        new WenyanConfig(),
        new AdvancedEncConfig(true, true, index >= 1, index >= 2)
      );
      const encrypted = abra.Output();
      abra.WenyanInput(encrypted, "DECRYPT", key);
      if (abra.Output() !== secText) {
        throw new Error("Security preset verification failed");
      }
      return { length: Array.from(encrypted).length, cipher: encrypted };
    });

    // 5. 灵活分段传输演示（4 片段乱序接收后重组）
    const packetMessage =
      "春天想去看海，夏天想去山里听雨。秋天把路上拍的照片寄给你，冬天留一盏灯等你回来。明天从东站出发，带上相机。";
    const transfer = new Abracadabra();
    const transferRanges = [
      [20, 25],
      [18, 24],
      [22, 28],
      [16, 32],
    ];
    let tfOut = null;
    for (let attempt = 0; attempt < 32; attempt++) {
      const range = transferRanges[Math.floor(attempt / 8)];
      const tfCfg = new AdvancedEncConfig(
        false,
        false,
        false,
        false,
        false,
        4,
        Date.now(),
        null,
        new FlexibleTransferConfig(true, true, 1729, range)
      );
      transfer.WenyanInput(
        packetMessage,
        "ENCRYPT",
        key,
        new WenyanConfig(),
        tfCfg
      );
      const candidate = transfer.Output();
      if (Array.isArray(candidate) && candidate.length === 4) {
        tfOut = candidate;
        break;
      }
    }
    if (!tfOut) {
      throw new Error("Failed to generate 4 transfer packets");
    }
    const order = [2, 0, 3, 1];
    const scrambled = order.map((idx) => tfOut[idx]);
    transfer.WenyanInput(scrambled.join(""), "DECRYPT", key);
    const decoded = transfer.Output();
    const packetResult = Array.isArray(decoded) ? decoded.join("") : decoded;
    if (packetResult !== packetMessage) {
      throw new Error("Transfer preset verification failed");
    }
    const packets = order.map((idx) => ({ number: idx + 1, text: tfOut[idx] }));

    // 6. 密文稀释初始样例（古文 18% 均匀分布）
    const dilInput = "见字如晤";
    const origDil = new Abracadabra();
    origDil.WenyanInput(
      dilInput,
      "ENCRYPT",
      key,
      new WenyanConfig(),
      new AdvancedEncConfig()
    );
    const origText = origDil.Output();
    const baselineLength = Array.from(origText).filter((c) => !/\\s/u.test(c)).length;
    const baseEncoded = new WenyanSimulator(key).deMap(origText, key);
    const dilCfg = new DilutionConfig(
      true,
      0.18,
      "ESSAY",
      "ALL",
      "SMART",
      "UNIFORM",
      corpus,
      true,
      50
    );
    const dilText = new WenyanSimulator(key).enMap(
      baseEncoded,
      true,
      25,
      [20, 80],
      false,
      false,
      false,
      dilCfg
    );
    if (new WenyanSimulator(key).deMap(dilText, key) !== baseEncoded) {
      throw new Error("Dilution deMap verification failed");
    }
    const dilCheck = new Abracadabra();
    dilCheck.WenyanInput(dilText, "DECRYPT", key);
    if (dilCheck.Output() !== dilInput) {
      throw new Error("Dilution decrypt verification failed");
    }
    const corpusCount = ["B", "S", "C"].reduce(
      (sum, type) => sum + (corpus[type]?.Sentences.length || 0),
      0
    );

    return {
      DEMO_KEY: key,
      PAYLOAD_ALPHABET: alphabet,
      HERO_PRESET: { input: heroInput, cipher: heroCipher },
      BANNER_PRESET: { sample: bannerSample, cipher: bannerCipher },
      PIPELINE_TRACE: trace,
      SECURITY_PRESETS: security,
      TRANSFER_PRESET: { packets, result: packetResult },
      DILUTION_PRESET: {
        input: dilInput,
        corpusCount,
        baselineLength,
        text: dilText,
        style: "古文",
      },
    };
  }
`;

try {
  await access(DILUTION_DATA_FILE);
} catch {
  throw new Error(
    `Missing ${DILUTION_DATA_FILE}. Run "node build-dilution-std.mjs" first.`,
  );
}

const tempDir = await mkdtemp(join(tmpdir(), "abra-home-presets-"));
const bundlePath = join(tempDir, "runner.cjs");

let data;
try {
  await build({
    stdin: { contents: RUNNER_SOURCE, resolveDir: ROOT, loader: "js" },
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: bundlePath,
    logLevel: "silent",
  });
  const require = createRequire(import.meta.url);
  const { generatePresets } = require(bundlePath);
  data = generatePresets();
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

const banner = [
  "// Auto-generated by build-home-presets.mjs using the local Abracadabra engine",
  "// (demo key only) and verified via round-trip decryption.",
  "",
].join("\n");

const body = Object.entries(data)
  .map(([key, value]) => `export const ${key} = ${JSON.stringify(value, null, 2)};`)
  .join("\n\n");

await mkdir(dirname(OUTPUT_FILE), { recursive: true });
await writeFile(OUTPUT_FILE, banner + body + "\n", "utf8");

const { size } = await stat(OUTPUT_FILE);
console.log("[Home Presets] Build complete");
console.log(`  Hero:     ${Array.from(data.HERO_PRESET.cipher).length} chars`);
console.log(`  Banner:   ${Array.from(data.BANNER_PRESET.cipher).length} chars`);
console.log(
  `  Dilution: ${Array.from(data.DILUTION_PRESET.text).length} chars (baseline ${data.DILUTION_PRESET.baselineLength})`,
);
console.log(
  `  Transfer: ${data.TRANSFER_PRESET.packets.map((p) => Array.from(p.text).length).join(" / ")} chars`,
);
console.log(`  Size:     ${(size / 1024).toFixed(2)} KiB`);
console.log(`  Output:   ${OUTPUT_FILE}`);
