// 保留原测试文件中 readFileSync、DilutionCorpus、DilutionConfig、Abracadabra 等导入。

import { expect, test, bench } from "vitest";

import { Abracadabra } from "./main";
import { DilutionConfig } from "./CoreHandler";
import { DilutionCorpus } from "./ChineseDilutionHelper";

let DilutionTestCorpus = null;

function GetDilutionTestCorpus() {
  return new DilutionCorpus();
}

const DilutionTestStyles = [
  ["ALL", "ALL"],
  ["ESSAY", "ALL"],
  ["LYRIC", "ALL"],
  ["POEM", "ALL"],
  ["POEM", "FOUR"],
  ["POEM", "FIVE"],
  ["POEM", "SEVEN"],
];

const DilutionTestInputs = [
  "测试。",
  "中文、English、123。",
  "换行测试：第一行\n第二行。",
  "繁简与标点：天地玄黄，宇宙洪荒！",
  "混合输入：中文、English、123、emoji 🌙。\n再来一行。",
];

// 前 96 轮覆盖 6 种文体 × 2 种采样 × 2 种载荷分布 × 2 种标点 × 2 种繁体设置。
// 后 4 轮继续执行正常 Roundtrip。仅复用语料；不 Mock 或检查组句内部细节。
test.each(Array.from({ length: 100 }, (_, Round) => Round))(
  "Dilution Roundtrip #%i",
  { timeout: 30000 },
  (Round) => {
    const [FilterMode, PoemFilterMode] =
      DilutionTestStyles[Round % DilutionTestStyles.length];
    const SampleMode = Math.floor(Round / 6) % 2 === 0 ? "SMART" : "RANDOM";
    const PayloadDistribution =
      Math.floor(Round / 12) % 2 === 0 ? "UNIFORM" : "CONCENTRATE";
    const Input = `Round ${Round}: ${
      DilutionTestInputs[Round % DilutionTestInputs.length]
    }`;
    const Password = "DILUTION-TEST";

    const Encoder = new Abracadabra();
    let DliutionConfigObj = new DilutionConfig(
      true,
      [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8][Math.floor(Round) % 9],
      FilterMode,
      PoemFilterMode,
      SampleMode,
      PayloadDistribution,
      GetDilutionTestCorpus(),
      Math.floor(Round / 24) % 2 === 0,
      50
    );
    DliutionConfigObj.ForceFallBackSearch = Math.floor(Round / 24) % 2 === 0;
    Encoder.WenyanInput(Input, "ENCRYPT", Password, {
      PunctuationMark: Math.floor(Round / 24) % 2 === 0,
      Traditional: Math.floor(Round / 48) % 2 === 0,
      RandomIndex: [0, 25, 50, 75, 100][Math.floor(Round / 5) % 5],
      RandomParagraphing: [20, 40],
      DilutionConfig: DliutionConfigObj,
    });

    const Ciphertext = Encoder.Output();
    expect(Ciphertext.length).toBeGreaterThan(0);

    const Decoder = new Abracadabra();
    Decoder.WenyanInput(Ciphertext, "DECRYPT", Password);
    expect(Decoder.Output()).toBe(Input);
  }
);
