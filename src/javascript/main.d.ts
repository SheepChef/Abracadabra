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

declare module "abracadabra-cn";

export interface WenyanConfig {
  /** 指定是否为密文添加标点符号，默认 true/添加; */
  PunctuationMark?: boolean;
  /** 密文算法的随机程度，越大随机性越强，默认 50，最大100，超过100将会出错; */
  RandomIndex?: number;
  /** 控制文言文密文的稀释配置; */
  DilutionConfig?: DilutionConfig;
  /** 指定超长密文所使用的分段函数每段载荷上下限。传入 min 和 max，默认 20/80。min 小于 20, max 大于 200, 或者 max < min 将会出错; */
  RandomParagraphing?: [number, number];
  /** 指定是否强制生成骈文密文，默认 false; */
  PianwenMode?: boolean;
  /** 指定是否强制生成逻辑密文，默认 false; */
  LogicMode?: boolean;
  /** 指定输出文本是否为繁体中文，默认 false; */
  Traditional?: boolean;
}

export interface AdvancedEncConfig {
  /** 指定是否启用高级加密功能，默认 false/不开启; 灵活传输功能的启用与否，由其自身的属性单独控制*/
  Enable?: boolean;
  /** 指定是否使用完整16字节IV，默认 true/开启*/
  UseStrongIV?: boolean;
  /** 指定是否使用HMAC对消息签名，默认 false/不开启; */
  UseHMAC?: boolean;
  /** 指定是否对密钥加盐并使用密钥衍生函数 false/不开启;*/
  UsePBKDF2?: boolean;
  /** 指定是否使用TOTP作为密钥衍生的盐值，默认 false/不开启，若不使用密钥衍生函数，则不生效;*/
  UseTOTP?: boolean;
  /** 指定TOTP时间窗口，取值范围 0~15
   *  对应 [3 5 10 30 min] [2 6 12 h] [1 3 5 d] [1 3 Week] [1 2 6 Month] [1 yr], 默认4;
   * **/
  TOTPTimeStep?: number;
  /**
   * 指定用于TOTP加密的Unix时间戳记，以毫秒为单位(JS标准)，默认为系统时间；
   */
  TOTPEpoch?: number;
  /**
   * 指定用于TOTP加密的预共享密钥，默认为加密主密钥，推荐使用网站域名作为此项密钥以提升安全性;
   * 注意，TOTP的安全性主要依赖于此BaseKey
   */
  TOTPBaseKey?: string;
  /**
   * 指定灵活传输配置，若此项不是一个Object则默认不启用。
   * 高级加密的Enable参数，对灵活传输不生效。
   */
  FlexibleTransfer?: FlexibleTransferConfig;
}

//分段加密和分段传输的配置。
//每段密文单独执行高级加密，AONT在加密之前单独执行。
export interface FlexibleTransferConfig {
  /** 指定是否启用灵活传输功能，默认 false/不开启 */
  Enable?: boolean;
  /** 指定是否启用全有或全无转换(AONT)，默认 true/开启，开启后必须获得所有密文才可以解密完整内容，但是会导致解密速度变缓慢*/
  UseAONT?: boolean;
  /** 指定临时消息ID，有助于防止混淆不同发送方的消息，默认-1为随机选择(0~4095)*/
  MessageID?: number;
  /**
   * 指定所使用的分段函数每段字节数量上下限。传入 min 和 max，默认 20/80。min 小于 10, max 大于 380, 或者 max < min 将会出错;
   *
   * 注意，灵活传输的分段为字节级，而非载荷字级。二者互不干涉。
   *
   * *380字节约为500个以上的载荷字
   */
  RandomParagraphing?: [number, number];
}

export interface DilutionConfig {
  /** 指定是否启用密文稀释功能，默认 false/不开启 */
  Enable?: boolean;
  /** 指定用户期望的目标密文载荷率，应当是 [0.01,1] 之间的两位精度的浮点数。目标载荷率不代表实际密文的精确载荷率，将允许有必要误差。默认为 0.18*/
  DilutionTargetRate?: number;
  /** 文体过滤配置。
   *
   * ESSAY 为仅使用一般古文，POEM 为仅使用古诗，LYRIC 为仅使用宋词。
   *
   * ALL 不特别过滤，随机使用全部文体，默认 ALL */
  FilterMode?: "ALL" | "ESSAY" | "POEM" | "LYRIC";
  /** 古诗过滤配置，若不启用古诗则此配置无效。
   *
   * FOUR/FIVE/SEVEN 分别过滤出四言/五言/七言。
   *
   * ALL 不特别过滤，随机使用全部诗词。 */
  PoemFilterMode?: "ALL" | "FOUR" | "FIVE" | "SEVEN";
  /** 采样模式，SMART 为自适应算法采样。RANDOM 为简单随机采样。默认为 SMART */
  SampleMode?: "SMART" | "RANDOM";
  /** 段内载荷分配的模式， UNIFORM 为均匀。CONCENTRATE 为集中。默认为 UNIFORM */
  PayloadDistribution?: "UNIFORM" | "CONCENTRATE";
  /** 传入一个稀释语料库对象，用于稀释，若不传，则使用内置库 */
  Corpus?: DilutionCorpus | null;
  /** 古诗词每条模板后自动单换行，默认 true；段落仍使用双换行 */
  PoemAutoLineBreak?: boolean;
  /** 每次生成，在选择文体时的随机性，应当是[0~100]之间的整数。此参数越低，文体的选择将越与载荷率的取值、语料库的载荷率分布相关，默认 50。*/
  StyleRandomIndex?: number;
}

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

/** B 为一般古文，S 为古诗，C 为词 */
export type DilutionCorpusSentenceType = "B" | "S" | "C";

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
  /** B 为一般古文，S 为古诗，C 为词 */
  SentenceType: DilutionCorpusSentenceType;
  /** 当前 B/S/C Corpus 的句式总数。 */
  SentenceCount: number;
  /** 运行时使用的精简统计对象，不是原始 JSON 中的 Manifest 文件名。 */
  Manifest: DilutionCorpusManifestObj;
}

/** 当前 B/S/C 的必要统计；Manifest 未提供的字段为 null。 */
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

/** 原始 B/S/C JSON 第一片的 Metadata。 */
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
 * B/S/C 句式 JSON 输入。
 * 单文件传入 JSON 对象或 JSON 字符串；分片传入按顺序排列的数组。
 * 分片第一项必须包含 Metadata，后续项只需要 Sentences。
 */
export type DilutionCorpusJSONInput =
  | DilutionCorpusJSON
  | [DilutionCorpusJSON, ...(DilutionCorpusJSONPartObj | string)[]];

export interface DilutionCorpus {
  /** 规则库尺寸。 */
  readonly Tier: DilutionCorpusTier;
  /** 已初始化的一般古文 Corpus；未提供 B 时为 null。 */
  readonly B: DilutionCorpusObj | null;
  /** 已初始化的古诗 Corpus；未提供 S 时为 null。 */
  readonly S: DilutionCorpusObj | null;
  /** 已初始化的词 Corpus；未提供 C 时为 null。 */
  readonly C: DilutionCorpusObj | null;
}

export interface CallbackObj {
  /** 回调数据的标签 */
  Type?: string;
  /** 回调数据的值 */
  Value?: any;
}

type Callback = (Data: CallbackObj) => any;
export class Abracadabra {
  /** 文言文生成配置构造函数。 */
  static WenyanConfig: new (
    PunctuationMark?: boolean,
    RandomIndex?: number,
    DilutionConfigObj?: DilutionConfig,
    RandomParagraphing?: [number, number],
    PianwenMode?: boolean,
    LogicMode?: boolean,
    Traditional?: boolean
  ) => WenyanConfig;
  /** 高级加密配置构造函数。 */
  static AdvancedEncConfig: new (
    Enable?: boolean,
    UseStrongIV?: boolean,
    UseHMAC?: boolean,
    UsePBKDF2?: boolean,
    UseTOTP?: boolean,
    TOTPTimeStep?: number,
    TOTPEpoch?: number,
    TOTPBaseKey?: string | null,
    FlexibleTransfer?: FlexibleTransferConfig
  ) => AdvancedEncConfig;
  /** 灵活传输配置构造函数。 */
  static FlexibleTransferConfig: new (
    Enable?: boolean,
    UseAONT?: boolean,
    MessageID?: number,
    RandomParagraphing?: [number, number]
  ) => FlexibleTransferConfig;
  /** 密文稀释配置构造函数。 */
  static DilutionConfig: new (
    Enable?: boolean,
    DilutionTargetRate?: number,
    FilterMode?: "ALL" | "ESSAY" | "POEM" | "LYRIC",
    PoemFilterMode?: "ALL" | "FOUR" | "FIVE" | "SEVEN",
    SampleMode?: "SMART" | "RANDOM",
    PayloadDistribution?: "UNIFORM" | "CONCENTRATE",
    Corpus?: DilutionCorpus | null,
    PoemAutoLineBreak?: boolean,
    StyleRandomIndex?: number
  ) => DilutionConfig;
  /** 语料库构造函数；不传 Manifest 时加载内置语料库。 */
  static DilutionCorpus: new (
    Manifest?: DilutionCorpusSourceManifestObj | string | null,
    B?: DilutionCorpusJSONInput | null,
    S?: DilutionCorpusJSONInput | null,
    C?: DilutionCorpusJSONInput | null
  ) => DilutionCorpus;
  /** 调试回调数据构造函数。 */
  static CallbackObj: new (Type?: string, Value?: any) => CallbackObj;
  static TEXT: "TEXT";
  static UINT8: "UINT8";

  static ENCRYPT: "ENCRYPT";
  static DECRYPT: "DECRYPT";
  static AUTO: "AUTO";

  /**
   * Abracadabra 魔曰加密
   *
   * 创建一个 Abracadabra 实例
   *
   * @param {string} inputType 指定输入数据类型，可以是 TEXT 或者 UINT8，默认TEXT
   * @param {string} outputType 指定输出数据类型，可以是 TEXT 或者 UINT8，默认TEXT
   *
   * @author Haruka Hokuto (SheepChef)
   * @copyright Copyright (C) 2025-2026 SheepChef (a.k.a. Haruka Hokuto)
   * @license AIPL-1.2
   */
  constructor(inputType?: "TEXT" | "UINT8", outputType?: "TEXT" | "UINT8");

  /**
   * 魔曰 文言文加密模式
   *
   * @param {string | Uint8Array} input 输入的数据，根据此前指定的输入类型，可能是字符串或字节数组
   * @param {string} mode 指定模式，可以是 ENCRYPT DECRYPT 中的一种;
   * @param {string} key 指定密钥，默认是 ABRACADABRA;
   * @param {WenyanConfig} WenyanConfigObj 文言文的生成配置;
   * @param {AdvancedEncConfig} AdvancedEncObj 指定是否启用安全加密特性;
   * @param {Callback}callback 回调函数，获取执行过程中特定位置的结果数据，调试时使用
   * @return {number} 成功则返回 0（失败不会返回，会抛出异常）
   */
  WenyanInput(
    input: string | Uint8Array,
    mode: "ENCRYPT" | "DECRYPT",
    key?: string,
    WenyanConfigObj?: WenyanConfig,
    AdvancedEncObj?: AdvancedEncConfig,
    callback?: Callback
  ): number;

  /**
   * 魔曰 传统加密模式
   *
   * @param {string | Uint8Array} input 输入的数据，根据此前指定的输入类型，可能是字符串或字节数组
   * @param {string} mode 指定模式，可以是 ENCRYPT DECRYPT AUTO 中的一种;
   * @param {string} key 指定密钥，默认是 ABRACADABRA;
   * @param {bool} q 指定是否在加密后省略标志位，默认 false/不省略;
   * @return {number} 成功则返回 0（失败不会返回，会抛出异常）
   */
  OldInput(
    input: string | Uint8Array,
    mode: "ENCRYPT" | "DECRYPT" | "AUTO",
    key?: string,
    q?: boolean
  ): number;

  /**
   * 魔曰 传统加密模式
   *
   * **这是一个过时的接口，请尽可能切换到新接口 OldInput()**
   *
   * @param {string | Uint8Array} input 输入的数据，根据此前指定的输入类型，可能是字符串或字节数组
   * @param {string} mode 指定模式，可以是 ENCRYPT DECRYPT AUTO 中的一种;
   * @param {string} key 指定密钥，默认是 ABRACADABRA;
   * @param {bool} q 指定是否在加密后省略标志位，默认 false/不省略;
   * @return {number} 成功则返回 0（失败不会返回，会抛出异常）
   */
  Input(
    input: string | Uint8Array,
    mode: "ENCRYPT" | "DECRYPT" | "AUTO",
    key?: string,
    q?: boolean
  ): number;

  /**
   * 魔曰 文言文加密模式
   *
   * **这是一个过时的接口，请尽可能切换到新接口 WenyanInput()**
   *
   * @param {string | Uint8Array} input 输入的数据，根据此前指定的输入类型，可能是字符串或字节数组
   * @param {string} mode 指定模式，可以是 ENCRYPT DECRYPT 中的一种;
   * @param {string} key 指定密钥，默认是 ABRACADABRA;
   * @param {bool} q 指定是否为密文添加标点符号，默认 true/添加;
   * @param {int} r 密文算法的随机程度，越大随机性越强，默认 50，最大100，超过100将会出错;
   * @param {bool} p 指定是否强制生成骈文密文，默认 false;
   * @param {bool} l 指定是否强制生成逻辑密文，默认 false;
   * @return {number} 成功则返回 0（失败不会返回，会抛出异常）
   */
  Input_Next(
    input: string | Uint8Array,
    mode: "ENCRYPT" | "DECRYPT",
    key?: string,
    q?: boolean,
    r?: number,
    p?: boolean,
    l?: boolean
  ): number;

  /**
   * 魔曰 解密熊曰加密密文
   *
   * @param {string} input 输入的数据，只能是字符串
   * @return {number} 成功则返回 0（失败不会返回，会抛出异常）
   *
   * 解密与熊论道(熊曰加密)2020年算法更新后的密文。
   *
   */
  BearDecode(input: string): number;

  /**
   * 魔曰 获取加密/解密后的结果
   * @returns {string | Uint8Array} 根据此前指定的输出类型，可能是字符串或字节数组；或者分段传输输出的多个结果
   */
  Output(): string | Uint8Array | string[] | Uint8Array[];
}
