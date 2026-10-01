declare module "abracadabra-cn";

export interface WenyanConfig {
  /** 指定是否为密文添加标点符号，默认 true/添加; */
  PunctuationMark?: boolean;
  /** 密文算法的随机程度，越大随机性越强，默认 50，最大100，超过100将会出错; */
  RandomIndex?: number;
  /** 密文的稀释程度，默认为0，越高将会稀释得越多; */
  //DiluteIndex?: number;
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

export interface CallbackObj {
  /** 回调数据的标签 */
  Type?: string;
  /** 回调数据的值 */
  Value?: any;
}

type Callback = (Data: CallbackObj) => any;
export class Abracadabra {
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
