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
 * @typedef {import("./ChineseDilutionHelper.js").DilutionCorpusSourceManifestObj} DilutionCorpusSourceManifestObj
 * @typedef {import("./ChineseDilutionHelper.js").DilutionCorpusJSONInput} DilutionCorpusJSONInput
 * @typedef {import("./ChineseDilutionHelper.js").DilutionCorpusObj} DilutionCorpusObj
 */

import { loadBundledDilutionCorpus } from "../generated/dilution-std-data.js";

export class DilutionCorpus {
  /**
   *
   * Dilution Corpus 规则库容器
   *
   * 用于结构化存储 Dilution 规则库
   *
   * 传入 Manifest清单文件 及 B/S/C(古文/古诗/词) 句式 JSON，执行对规则库的初始化。
   *
   * B/S/C 可以是单份 JSON，也可以是按原顺序排列的 JSON 分片数组。
   * 每份 JSON 可以是已经解析的对象，或者尚未解析的 JSON 字符串。
   *
   * B, S 和 C 至少提供一种；未提供的类型设为 null。
   *
   * @param {DilutionCorpusSourceManifestObj | string} Manifest 发行 Manifest JSON 对象或 JSON 字符串
   * @param {DilutionCorpusJSONInput | null} B 一般古文 JSON 或顺序分片，默认 null
   * @param {DilutionCorpusJSONInput | null} S 古诗 JSON 或顺序分片，默认 null
   * @param {DilutionCorpusJSONInput | null} C 词 JSON 或顺序分片，默认 null
   * @constructor
   */
  constructor(Manifest = null, B = null, S = null, C = null) {
    let ManifestObj =
      typeof Manifest === "string" ? JSON.parse(Manifest) : Manifest;
    // 校验传参，传参为空就直接报错。
    if (
      !ManifestObj ||
      typeof ManifestObj.Tier !== "string" ||
      (B == null && S == null && C == null)
    ) {
      // 无参构造：自动使用随 npm 包分发的 Std Corpus
      // 注意，不传入Manifest将会自动回落，无论传入何种规则集，都必须要传入Manifest。
      const data = loadBundledDilutionCorpus();

      Manifest = data.manifest;
      ManifestObj = Manifest;
      B = data.dilution_templates_B;
      S = data.dilution_templates_S;
      C = data.dilution_templates_C;
    }

    this.Tier = ManifestObj.Tier; //读取Mnifest中的Tier
    /** @type {DilutionCorpusObj | null} */
    this.B = null;
    /** @type {DilutionCorpusObj | null} */
    this.S = null;
    /** @type {DilutionCorpusObj | null} */
    this.C = null;

    for (const SentenceType of /** @type {const} */ (["B", "S", "C"])) {
      //读取古文和古诗的规则库
      const Input =
        SentenceType === "B"
          ? B
          : SentenceType === "S"
          ? S
          : SentenceType === "C"
          ? C
          : null;
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
