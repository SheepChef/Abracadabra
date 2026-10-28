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

/** Dilution Corpus 的尺寸分级。 */
export type DilutionCorpusTier =
  | "Nano"
  | "Micro"
  | "Mini"
  | "Std"
  | "Plus"
  | "Pro"
  | "Supra"
  | "Mega"
  | "Ultra";

/** B 为一般古文，S 为古诗词。 */
export type DilutionCorpusSentenceType = "B" | "S";

/** 两端均包含；Manifest 未提供该统计时为 null。 */
export type DilutionCorpusRange = [number, number] | null;

/** 已初始化的单一 B/S Corpus。 */
export interface DilutionCorpusObj {
  Metadata: DilutionCorpusMetadataObj;
  /** 保持输入 JSON 中的句式顺序。 */
  Sentences: string[];
}

/** 已初始化的 Corpus 元数据。 */
export interface DilutionCorpusMetadataObj {
  /** 规则库尺寸。 */
  Tier: DilutionCorpusTier;
  /** B 为一般古文，S 为古诗词。 */
  SentenceType: DilutionCorpusSentenceType;
  /** 当前 B/S Corpus 的句式总数。 */
  SentenceCount: number;
  /** 运行时使用的精简统计对象，不是原始 JSON 中的 Manifest 文件名。 */
  Manifest: DilutionCorpusManifestObj;
}

/** 当前 B/S 的必要统计；Manifest 未提供的字段为 null。 */
export interface DilutionCorpusManifestObj {
  /** 非零载荷率的众数（精确到两位小数）。 */
  TargetBaseRate: number | null;
  /** 全部模板的载荷率边界。 */
  PayloadRateHardLimit: DilutionCorpusRange;
  /** 非零载荷率边界。 */
  NonZeroPayloadRateHardLimit: DilutionCorpusRange;
  /** 单句有效长度边界。 */
  SentenceLengthHardLimit: DilutionCorpusRange;
  /** 单句载荷数量边界。 */
  PayloadCountHardLimit: DilutionCorpusRange;
}

/** 发行 Manifest JSON；其他非必要字段允许存在，但不会进入运行时对象。 */
export interface DilutionCorpusSourceManifestObj {
  Tier: DilutionCorpusTier;
  Statistics?: Partial<
    Record<DilutionCorpusSentenceType, Partial<DilutionCorpusManifestObj>>
  >;
}

/** 原始 B/S JSON 第一片的 Metadata。 */
export interface DilutionCorpusSourceMetadataObj {
  Tier: DilutionCorpusTier;
  SentenceType: DilutionCorpusSentenceType;
  SentenceCount: number;
}

/** 单文件或第一分片：必须包含 Metadata 和 Sentences。 */
export interface DilutionCorpusJSONFirstObj {
  Metadata: DilutionCorpusSourceMetadataObj;
  Sentences: string[];
}

/** 后续 JSON 分片：只需要 Sentences。 */
export interface DilutionCorpusJSONPartObj {
  Sentences: string[];
}

/** 单份 JSON 可以是已解析对象或 JSON 字符串。 */
export type DilutionCorpusJSON = DilutionCorpusJSONFirstObj | string;

/**
 * B/S 句式 JSON 输入。
 * 单文件传入 JSON 对象或 JSON 字符串；分片传入按顺序排列的数组。
 * 分片第一项必须包含 Metadata，后续项只需要 Sentences。
 */
export type DilutionCorpusJSONInput =
  | DilutionCorpusJSON
  | [DilutionCorpusJSON, ...(DilutionCorpusJSONPartObj | string)[]];

export class DilutionCorpus {
  /**
   *
   * Dilution Corpus 规则库容器
   *
   * 传入 Manifest 及 B/S 句式 JSON，同步初始化 Corpus。
   *
   * B/S 可以是单份 JSON，也可以是按原顺序排列的 JSON 分片数组。
   *
   * 每份 JSON 可以是已经解析的对象，或者尚未解析的 JSON 字符串。
   *
   * B 和 S 至少提供一种；未提供的类型设为 null。
   *
   * @param Manifest 发行 Manifest JSON 对象或 JSON 字符串
   * @param B 一般古文 JSON 或顺序分片，默认 null
   * @param S 古诗词 JSON 或顺序分片，默认 null
   */
  constructor(
    Manifest: DilutionCorpusSourceManifestObj | string,
    B?: DilutionCorpusJSONInput | null,
    S?: DilutionCorpusJSONInput | null
  );

  /** 规则库尺寸。 */
  readonly Tier: DilutionCorpusTier;
  /** 已初始化的一般古文 Corpus；未提供 B 时为 null。 */
  readonly B: DilutionCorpusObj | null;
  /** 已初始化的古诗词 Corpus；未提供 S 时为 null。 */
  readonly S: DilutionCorpusObj | null;
}
