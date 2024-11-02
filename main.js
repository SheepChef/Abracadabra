import { Base64 } from "js-base64";
import * as Util from "./utils.js";

export class Abracadabra {
  //主类

  static TEXT = "TEXT"; //常量方便调用
  static UINT8 = "UINT8";

  static LINK = "LINK";
  static DECRYPT = "DECRYPT";
  static AUTO = "AUTO";
  static BASE64 = "BASE64";
  static DIRECT = "DIRECT";
  #input = ""; //输入类型，可以是 BLOB 或者 TEXT
  #output = ""; //输出类型，可以是 BLOB 或者 TEXT

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
   * 输入数据以处理，请注意指定的类型
   *
   * **模式定义**
   *
   * **DECRYPT** 强制解密，对输入执行预检，然后解密。
   *
   * **AUTO** 自动判断输入是否是密文，然后自动执行对应操作。
   *
   * **LINK** 强制加密，使用链接模式，将输入强制转换为字符串，进行UrlEncode，再加密。
   *
   * **BASE64** 强制加密，使用BASE64模式，将输入先进行BASE64转码，再加密。
   *
   * **DIRECT** 强制加密，使用默认模式，请确保输入数据不存在任何特殊字符，否则指定该模式将被自动逻辑忽略。
   * @param{string | Uint8Array}input 输入的数据，根据此前指定的输入类型，可能是字符串或字节数组
   * @param{string}mode 指定模式，可以是 DECRYPT AUTO LINK BASE64 DIRECT 中的一种;
   */
  Input(input, mode) {
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
        preCheckRes = Util.preCheck(inputString);

        if (
          (preCheckRes.isEncrypted &&
            mode != Abracadabra.LINK &&
            mode != Abracadabra.BASE64) ||
          mode == Abracadabra.DECRYPT
        ) {
          //如果是加密的字符串且没有强制指定要再次加密，或者强制执行解密,自动执行解密
          //注意，DEFAULT此时不可用(即使指定)，在这里如果指定DEFAULT，也会自动执行解密
          //如果是加密的字符串,指定AUTO在此处会自动解密
          this.#res = Util.deMap(preCheckRes);
        } else {
          this.#res = Util.enMap(
            preCheckRes,
            mode == Abracadabra.LINK ? true : false,
            mode == Abracadabra.BASE64 ? true : false,
            mode == Abracadabra.DIRECT ? true : false,
            false
          ); //在字符串可解码的情况下，加密时不采用文件模式
        }
      } else {
        //如果给定的数据不可预检(不可能是密文，此时强制解密无效)，直接对数据进行base64编码，传递给加密函数，忽略所有模式指令，强制Base64模式。
        inputString = Base64.fromUint8Array(input);
        preCheckRes = new Util.PreCheckResult(
          inputString,
          false,
          false,
          true,
          false,
          false
        );
        this.#res = Util.enMap(preCheckRes, false, false, false, true); //在字符串可解码的情况下，加密时不采用文件模式
      }
    } else if (this.#input == Abracadabra.TEXT) {
      //如果指定输入类型是TEXT
      if (Object.prototype.toString.call(input) != "[object String]") {
        throw "Unexpected Input Type";
      }
      let preCheckRes = Util.preCheck(input);
      if (
        (preCheckRes.isEncrypted &&
          mode != Abracadabra.LINK &&
          mode != Abracadabra.BASE64) ||
        mode == Abracadabra.DECRYPT
      ) {
        //如果是加密的字符串且没有强制指定要再次加密，或者强制执行解密,自动执行解密
        //注意，DEFAULT此时不可用(即使指定)，在这里如果指定DEFAULT，也会自动执行解密
        //如果是加密的字符串,指定AUTO在此处会自动解密
        this.#res = Util.deMap(preCheckRes);
      } else {
        this.#res = Util.enMap(
          preCheckRes,
          mode == Abracadabra.LINK ? true : false,
          mode == Abracadabra.BASE64 ? true : false,
          mode == Abracadabra.DIRECT ? true : false,
          false
        ); //在字符串可解码的情况下，加密时不采用文件模式
      }
    }
    return 0;
  }
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
}