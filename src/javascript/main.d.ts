declare module "abracadabra-cn";

export interface WenyanConfig {
  /** 指定是否为密文添加标点符号，默认 true/添加; */
  PunctuationMark?: boolean;
  /** 密文算法的随机程度，越大随机性越强，默认 50，最大100，超过100将会出错; */
  RandomIndex?: number;
  /** 指定是否强制生成骈文密文，默认 false; */
  PianwenMode?: boolean;
  /** 指定是否强制生成逻辑密文，默认 false; */
  LogicMode?: boolean;
  /** 指定输出文本是否为繁体中文，默认 false; */
  Traditional?: boolean;
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
   * 创建一个 Abracadabra 实例
   * @param {string} inputType 可以是 TEXT 或者 UINT8，默认TEXT
   * @param {string} outputType 可以是 TEXT 或者 UINT8，默认TEXT
   */
  constructor(inputType?: "TEXT" | "UINT8", outputType?: "TEXT" | "UINT8");

  /**
   * 魔曰 文言文加密模式
   *
   * @param {string | Uint8Array} input 输入的数据，根据此前指定的输入类型，可能是字符串或字节数组
   * @param {string} mode 指定模式，可以是 ENCRYPT DECRYPT 中的一种;
   * @param {string} key 指定密钥，默认是 ABRACADABRA;
   * @param {WenyanConfig} WenyanConfigObj 文言文的生成配置;
   * @param {Callback}callback 回调函数，获取执行过程中特定位置的结果数据，调试时使用
   * @return {number} 成功则返回 0（失败不会返回，会抛出异常）
   */
  WenyanInput(
    input: string | Uint8Array,
    mode: "ENCRYPT" | "DECRYPT",
    key?: string,
    WenyanConfigObj?: WenyanConfig,
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
   * 魔曰 获取加密/解密后的结果
   * @returns {string | Uint8Array} 根据此前指定的输出类型，可能是字符串或字节数组
   */
  Output(): string | Uint8Array;
}
