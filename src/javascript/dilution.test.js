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

test("Dilution 和 FlexibleTransfer 联合测试", () => {
  const Corpus = GetDilutionTestCorpus();
  expect(Corpus instanceof DilutionCorpus).toBe(true);
  expect(Object.getPrototypeOf(Corpus)).toBe(DilutionCorpus.prototype);
  expect(Object.getPrototypeOf(DilutionCorpus.prototype)).toBeNull();

  const Input =
    "57004cf6-c72a-4f99-96bb-c9b14f67b53b50669cfc-1811-45e0-9ff3-db122101aac9037e47c3-9361-4eb4-925e-8dcb63812c9df426eec7-ebe8-4166-93b2-f4d51c3337b8c7131e27-7382-4f5f-b2db-894f2fed9e5b";
  const Password = "PLAIN-CONFIG-TEST";

  const PlainEnc = new Abracadabra();
  PlainEnc.WenyanInput(Input, "ENCRYPT", Password, {
    DilutionConfig: {
      Enable: true,
      DilutionTargetRate: 0.25,
      FilterMode: "POEM",
      PoemFilterMode: "FIVE",
    },
  });
  const PlainCipher = PlainEnc.Output();
  const PlainDec = new Abracadabra();
  PlainDec.WenyanInput(PlainCipher, "DECRYPT", Password);
  expect(PlainDec.Output()).toBe(Input);

  const FlexEnc = new Abracadabra();
  FlexEnc.WenyanInput(
    Input.repeat(5),
    "ENCRYPT",
    Password,
    {
      DilutionConfig: { Enable: true, Corpus },
    },
    {
      FlexibleTransfer: {
        Enable: true,
        UseAONT: true,
        RandomParagraphing: [10, 30],
      },
    }
  );
  const FlexCipher = FlexEnc.Output().join("");
  const FlexDec = new Abracadabra();
  FlexDec.WenyanInput(FlexCipher, "DECRYPT", Password);
  expect(FlexDec.Output()).toEqual([Input.repeat(5)]);

  const BadConfigs = [
    { Enable: "yes" },
    { Enable: true, DilutionTargetRate: 0.123 },
    { Enable: true, DilutionTargetRate: 0 },
    { Enable: true, FilterMode: "BAD" },
    { Enable: true, PoemFilterMode: "SIX" },
    { Enable: true, SampleMode: "OTHER" },
    { Enable: true, PayloadDistribution: "OTHER" },
    { Enable: true, PoemAutoLineBreak: 1 },
    { Enable: true, StyleRandomIndex: 101 },
    {
      Enable: true,
      Corpus: { Tier: Corpus.Tier, B: Corpus.B, S: Corpus.S, C: Corpus.C },
    },
  ];

  for (const BadConfig of BadConfigs) {
    expect(() =>
      PlainEnc.WenyanInput(Input, "ENCRYPT", Password, {
        DilutionConfig: BadConfig,
      })
    ).toThrow();
  }
});
