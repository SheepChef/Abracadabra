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
 * @typedef {import("./ChineseDilutionHelper.js").DilutionCorpusSourceManifestObj} DilutionCorpusSourceManifestObj
 * @typedef {import("./ChineseDilutionHelper.js").DilutionCorpusJSONInput} DilutionCorpusJSONInput
 * @typedef {import("./ChineseDilutionHelper.js").DilutionCorpusObj} DilutionCorpusObj
 */

export class DilutionCorpus {
  /**
   *
   * Dilution Corpus 规则库容器
   *
   * 用于结构化存储 Dilution 规则库
   *
   * 传入 Manifest清单文件 及 B/S(古文/诗词) 句式 JSON，执行对规则库的初始化。
   *
   * B/S 可以是单份 JSON，也可以是按原顺序排列的 JSON 分片数组。
   * 每份 JSON 可以是已经解析的对象，或者尚未解析的 JSON 字符串。
   *
   * B 和 S 至少提供一种；未提供的类型设为 null。
   *
   * @param {DilutionCorpusSourceManifestObj | string} Manifest 发行 Manifest JSON 对象或 JSON 字符串
   * @param {DilutionCorpusJSONInput | null} B 一般古文 JSON 或顺序分片，默认 null
   * @param {DilutionCorpusJSONInput | null} S 古诗词 JSON 或顺序分片，默认 null
   * @constructor
   */
  constructor(Manifest, B = null, S = null) {
    const ManifestObj =
      typeof Manifest === "string" ? JSON.parse(Manifest) : Manifest;
    // 校验传参，传参为空就直接报错。
    if (
      !ManifestObj ||
      typeof ManifestObj.Tier !== "string" ||
      (B == null && S == null)
    ) {
      throw new Error("Invalid Dilution Corpus.");
    }

    this.Tier = ManifestObj.Tier; //读取Mnifest中的Tier
    /** @type {DilutionCorpusObj | null} */
    this.B = null;
    /** @type {DilutionCorpusObj | null} */
    this.S = null;

    for (const SentenceType of /** @type {const} */ (["B", "S"])) {
      //读取古文和古诗的规则库
      const Input = SentenceType === "B" ? B : S;
      if (Input == null) continue;

      const JSONFiles = Array.isArray(Input) ? Input : [Input];
      if (!JSONFiles.length)
        throw new Error(`Empty Dilution Corpus: ${SentenceType}.`);

      let Metadata;
      let Count = 0;
      const Parts = [];
      for (let i = 0; i < JSONFiles.length; i++) {
        const RawFile = JSONFiles[i];
        const JSONFile =
          typeof RawFile === "string" ? JSON.parse(RawFile) : RawFile;
        if (!JSONFile || !Array.isArray(JSONFile.Sentences)) {
          throw new Error(
            `Invalid Dilution Corpus JSON: ${SentenceType}, part ${i + 1}.`
          );
        }
        if (i === 0) Metadata = JSONFile.Metadata;
        Parts.push(JSONFile.Sentences);
        Count += JSONFile.Sentences.length;
      }

      if (
        !Metadata ||
        Metadata.Tier !== this.Tier ||
        Metadata.SentenceType !== SentenceType ||
        Metadata.SentenceCount !== Count
      ) {
        throw new Error(`Dilution Corpus Metadata mismatch: ${SentenceType}.`);
      }

      // 单文件直接使用原数组；分片只合并一次，不重新排列句式。
      let Sentences = Parts[0];
      if (Parts.length > 1) {
        Sentences = new Array(Count);
        let Index = 0;
        for (const Part of Parts) {
          for (let i = 0; i < Part.length; i++) Sentences[Index++] = Part[i];
        }
      }

      const Stats = ManifestObj.Statistics?.[SentenceType];
      this[SentenceType] = {
        Metadata: {
          Tier: this.Tier,
          SentenceType,
          SentenceCount: Count,
          Manifest: {
            TargetBaseRate: Stats?.TargetBaseRate ?? null,
            PayloadRateHardLimit: Stats?.PayloadRateHardLimit ?? null,
            NonZeroPayloadRateHardLimit:
              Stats?.NonZeroPayloadRateHardLimit ?? null,
            SentenceLengthHardLimit: Stats?.SentenceLengthHardLimit ?? null,
            PayloadCountHardLimit: Stats?.PayloadCountHardLimit ?? null,
          },
        },
        Sentences,
      };
    }
  }
}
