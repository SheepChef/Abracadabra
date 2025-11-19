/*
 * Copyright (C) 2025 SheepChef (a.k.a. Haruka Hokuto)
 *
 * 这是一个自由软件。
 * 在遵守AIPL-1.1许可证的前提下，
 * 你可以自由复制，修改，分发，使用它。
 *
 * 查阅 Academic Innovation Protection License(AIPL) 来了解更多 .
 * 本作品应随附一份完整的 AIPL-1.1 许可证全文。
 *
 */

/*
 * ACKNOWLEDGEMENT
 *
 * This project uses code from Unishox2 as a compression library,
 * with certain modifications made to achieve specific purposes.
 *
 * Unishox2 is licensed under the Apache License, Version 2.0.
 * Copyright (C) 2020 Siara Logics (cc)
 *
 * Special thanks to Arundale Ramanathan, the author of Unishox2,
 * who genuinely answered my enquiries and helped me to debug.
 *
 * 本作品中包含的 Unishox2 不适用 AIPL-1.1 许可证。
 * 使用 Unishox2 须遵守其原始许可证。
 *
 */

import * as Core from "./CoreHandler.js";
import { preCheck_OLD, PreCheckResult, stringToUint8Array } from "./Misc.js";
export class Abracadabra {
  //主类

  static TEXT = "TEXT"; //常量方便调用
  static UINT8 = "UINT8";

  static ENCRYPT = "ENCRYPT";
  static DECRYPT = "DECRYPT";
  static AUTO = "AUTO";

  #input = ""; //输入类型，可以是 UINT8 或者 TEXT
  #output = ""; //输出类型，可以是 UINT8 或者 TEXT

  #res = null; // 输出的结果

  /**
   * 创建一个 Abracadabra 实例
   * @param{string}inputType 可以是 TEXT 或者 UINT8，默认TEXT
   * @param{string}outputType 可以是 TEXT 或者 UINT8，默认TEXT
   */
  constructor(inputType = Abracadabra.TEXT, outputType = Abracadabra.TEXT) {
    //初始化函数指定一些基本参数
    if (inputType != Abracadabra.TEXT && inputType != Abracadabra.UINT8) {
      throw "Unexpected Argument";
    }
    if (outputType != Abracadabra.TEXT && outputType != Abracadabra.UINT8) {
      throw "Unexpected Argument";
    }

    this.#input = inputType;
    this.#output = outputType;
  }
  /**
   * 魔曰 文言文加密模式
   *
   * @param{string | Uint8Array}input 输入的数据，根据此前指定的输入类型，可能是字符串或字节数组
   * @param{string}mode 指定模式，可以是 ENCRYPT DECRYPT 中的一种;
   * @param{string}key 指定密钥，默认是 ABRACADABRA;
   * @param{WenyanConfig}WenyanConfigObj 文言文的生成配置;
   * @param{bool} AdvancedEnc 指定是否启用安全加密特性;
   * @param{function}callback 回调函数，获取执行过程中特定位置的结果数据，调试时使用;
   */
  WenyanInput(
    input,
    mode,
    key = "ABRACADABRA",
    WenyanConfigObj = new Core.WenyanConfig(true, 50, false, false),
    AdvancedEnc = false,
    callback
  ) {
    if (this.#input == Abracadabra.UINT8) {
      //如果指定输入类型是UINT8
      if (Object.prototype.toString.call(input) != "[object Uint8Array]") {
        throw "Unexpected Input Type";
      }
      if (mode == Abracadabra.ENCRYPT) {
        let Nextinput = new Object();
        Nextinput.output = input;
        this.#res = Core.Enc(Nextinput, key, WenyanConfigObj, callback);
      } else if (mode == Abracadabra.DECRYPT) {
        let Nextinput = new Object();
        Nextinput.output = input;
        this.#res = Core.Dec(Nextinput, key, callback);
      }
      return 0;
    } else if (this.#input == Abracadabra.TEXT) {
      //如果指定输入类型是TEXT
      if (Object.prototype.toString.call(input) != "[object String]") {
        throw "Unexpected Input Type";
      }
      let Nextinput = new Object();
      Nextinput.output = stringToUint8Array(input);
      if (mode == Abracadabra.ENCRYPT) {
        this.#res = Core.Enc(Nextinput, key, WenyanConfigObj, callback);
      } else if (mode == Abracadabra.DECRYPT) {
        this.#res = Core.Dec(Nextinput, key, callback);
      }
      return 0;
    }
    return 0;
  }

  /**
   * 魔曰 传统加密模式
   *
   * @param{string | Uint8Array}input 输入的数据，根据此前指定的输入类型，可能是字符串或字节数组
   * @param{string}mode 指定模式，可以是 ENCRYPT DECRYPT AUTO 中的一种;
   * @param{string}key 指定密钥，默认是 ABRACADABRA;
   * @param{bool}q 指定是否在加密后省略标志位，默认 false/不省略;
   */
  OldInput(input, mode, key = "ABRACADABRA", q = false) {
    if (this.#input == Abracadabra.UINT8) {
      //如果指定输入类型是UINT8
      if (Object.prototype.toString.call(input) != "[object Uint8Array]") {
        throw "Unexpected Input Type";
      }
      //对于输入UINT8的情况，先尝试将数据转换成字符串进行预检。
      let Decoder = new TextDecoder("utf-8", { fatal: true });
      let NoNeedtoPreCheck = false;
      let inputString = String();
      try {
        inputString = Decoder.decode(input);
      } catch (err) {
        //指定了Fatal，如果在解码时出现错误，则无需再执行预检
        NoNeedtoPreCheck = true;
      }
      let preCheckRes;
      if (!NoNeedtoPreCheck) {
        //如果给定的数据是一个可解码的字符串，那么解码预检
        //此时参照预检结果和指定的模式进行判断
        preCheckRes = preCheck_OLD(inputString);

        if (
          (preCheckRes.isEncrypted && mode != Abracadabra.ENCRYPT) ||
          mode == Abracadabra.DECRYPT
        ) {
          //如果是加密的字符串且没有强制指定要再次加密，或者强制执行解密,自动执行解密
          //如果是加密的字符串,指定AUTO在此处会自动解密
          this.#res = Core.Dec_OLD(preCheckRes, key);
        } else {
          this.#res = Core.Enc_OLD(preCheckRes, key, q); //在字符串可解码的情况下，加密时不采用文件模式
        }
      } else {
        //如果给定的数据不可预检(不可能是密文，此时强制解密无效)，直接对数据传递给加密函数
        preCheckRes = new PreCheckResult(input, true);
        this.#res = Core.Enc_OLD(preCheckRes, key, q);
      }
    } else if (this.#input == Abracadabra.TEXT) {
      //如果指定输入类型是TEXT
      if (Object.prototype.toString.call(input) != "[object String]") {
        throw "Unexpected Input Type";
      }
      let preCheckRes = preCheck_OLD(input);
      if (
        (preCheckRes.isEncrypted && mode != Abracadabra.ENCRYPT) ||
        mode == Abracadabra.DECRYPT
      ) {
        //如果是加密的字符串且没有强制指定要再次加密，或者强制执行解密,自动执行解密
        //如果是加密的字符串,指定AUTO在此处会自动解密
        this.#res = Core.Dec_OLD(preCheckRes, key);
      } else {
        this.#res = Core.Enc_OLD(preCheckRes, key, q); //在字符串可解码的情况下，加密时不采用文件模式
      }
    }
    return 0;
  }

  /**
   * 魔曰 获取加密/解密后的结果
   */
  Output() {
    if (this.#res == null) {
      throw "Null Output, please input some data at first.";
    }
    if (typeof this.#res == "object") {
      if (this.#output == Abracadabra.TEXT) {
        return this.#res.output; //要输出字符串，那么直接输出字符串，解密总会有字符串
      } else {
        //如果要输出UINT8
        if (this.#res.output_B != null) {
          //如果有现成的可用，直接输出现成的。
          return this.#res.output_B;
        } else {
          //如果没有现成的，那么就要转换一下再输出
          const encoder = new TextEncoder();
          const encodedData = encoder.encode(this.#res.output);

          return encodedData;
        }
      }
    } else if (typeof this.#res == "string") {
      //如果是字符串类型，那么就是加密结果
      if (this.#output == Abracadabra.TEXT) {
        return this.#res; //要输出字符串，那么直接输出字符串，解密总会有字符串
      } else {
        //如果要输出UINT8
        //没有现成的，那么就要转换一下再输出
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(this.#res);
        return encodedData;
      }
    }
  }

  /**
   * 魔曰 传统加密模式
   *
   * **这是一个过时的接口，请尽可能切换到新接口 OldInput()**
   *
   * @param{string | Uint8Array}input 输入的数据，根据此前指定的输入类型，可能是字符串或字节数组
   * @param{string}mode 指定模式，可以是 ENCRYPT DECRYPT AUTO 中的一种;
   * @param{string}key 指定密钥，默认是 ABRACADABRA;
   * @param{bool}q 指定是否在加密后省略标志位，默认 false/不省略;
   */
  /* v8 ignore next 4 */
  get Input() {
    // 使用 getter 属性
    return this.OldInput;
  }

  /**
   * 魔曰 文言文加密模式
   *
   * **这是一个过时的接口，请尽可能切换到新接口 WenyanInput()**
   *
   * @param{string | Uint8Array}input 输入的数据，根据此前指定的输入类型，可能是字符串或字节数组
   * @param{string}mode 指定模式，可以是 ENCRYPT DECRYPT 中的一种;
   * @param{string}key 指定密钥，默认是 ABRACADABRA;
   * @param{bool}q 指定是否为密文添加标点符号，默认 true/添加;
   * @param{int}r 密文算法的随机程度，越大随机性越强，默认 50，最大100，超过100将会出错;
   * @param{bool}p 指定是否强制生成骈文密文，默认 false;
   * @param{bool}l 指定是否强制生成逻辑密文，默认 false;
   */
  /* v8 ignore next 12 */
  Input_Next(
    input,
    mode,
    key = "ABRACADABRA",
    q = true,
    r = 50,
    p = false,
    l = false
  ) {
    let conf = new Core.WenyanConfig(q, r, p, l);
    return this.WenyanInput(input, mode, key, conf);
  }
}
