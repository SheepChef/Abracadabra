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
import { Base64 } from "js-base64";
import { OldMapper, WenyanSimulator } from "./ChineseMappingHelper";
import { Compress, Decompress } from "./CompressionHelper.js";
import { Decrypt, Encrypt } from "./EncryptHelper";

import {
  Uint8ArrayTostring,
  GetLuhnBit,
  RemovePadding,
  CheckLuhnBit,
  packByte,
  unpackByte,
} from "./Misc.js";

export class WenyanConfig {
  /**
   * 魔曰 文言文加密参数
   *
   * @param{bool}PunctuationMark 指定是否为密文添加标点符号，默认 true/添加;
   * @param{int}RandomIndex 密文算法的随机程度，越大随机性越强，默认 50，最大100，超过100将会出错;
   * @param{bool}PianwenMode 指定是否强制生成骈文密文，默认 false;
   * @param{bool}LogicMode 指定是否强制生成逻辑密文，默认 false;
   */
  constructor(
    PunctuationMark = true,
    RandomIndex = 50,
    PianwenMode = false,
    LogicMode = false,
    Traditional = false
  ) {
    this.PunctuationMark = PunctuationMark;
    this.RandomIndex = RandomIndex;
    this.PianwenMode = PianwenMode;
    this.LogicMode = LogicMode;
    this.Traditional = Traditional;
  }
}

export class AdvancedEncConfig {
  /**
   * 魔曰 高级加密参数
   *
   * @param{bool}Enable 指定是否打开高级加密功能，默认 false/不开启;
   * @param{bool}UseStrongIV 指定是否使用完整16字节IV，默认 true/开启;
   * @param{bool}UseHMAC 指定是否使用HMAC对消息签名，默认 false/不开启;
   * @param{bool}UsePBKDF2 指定是否对密钥加盐并使用密钥衍生函数 false/不开启;
   * @param{bool}UseTOTP 指定是否使用TOTP作为密钥衍生的盐值，默认 false/不开启，若不使用密钥衍生函数，则不生效;
   * @param{number}TOTPTimeStep 指定TOTP时间窗口，取值范围 0~15 对应 [3 5 10 30 min] [2 6 12 h] [1 3 5 d] [1 3 Week] [1 2 6 Month] [1 yr], 默认4;
   * @param{number}TOTPEpoch 指定用于TOTP加密的Unix时间戳记，以毫秒为单位(JS标准)，默认为系统时间；
   */
  constructor(
    Enable = false,
    UseStrongIV = true,
    UseHMAC = false,
    UsePBKDF2 = false,
    UseTOTP = false,
    TOTPTimeStep = 4,
    TOTPEpoch = Date.now(),
    TOTPBaseKey = null
  ) {
    this.Enable = Enable;
    this.UseStrongIV = UseStrongIV;
    this.UseHMAC = UseHMAC;
    this.UsePBKDF2 = UsePBKDF2;
    this.UseTOTP = UseTOTP;
    this.TOTPTimeStep = TOTPTimeStep;
    this.TOTPEpoch = TOTPEpoch;
    this.TOTPBaseKey = TOTPBaseKey;
  }
}

//魔数，用于自动识别高级加密数据，理论上需要附加正常加密/解密时绝不可能在开头出现的Base64编码范围内字符
const ADVANCED_ENC_MAGIC = "+=";

export class CallbackObj {
  /**
   * 魔曰 Debug 回调位点对象
   *
   * ENC/DEC_BASE64 (Base64字符串)
   *
   * ROUNDS (转轮状态)
   *
   * ENC_MAPTEMP (映射过程变量)
   *
   * ENC_SENTENCES (组句步骤变量)
   *
   * ENC_PAYLOADS (加密的载荷分配数组)
   *
   * DEC_PAYLOAD (解密提取的有效载荷)
   *
   *
   * @param{string}Type 指定回调参数的Tag
   * @param{string}Value 回调参数的值
   */
  constructor(Type = "NORMAL", Value = null) {
    this.Type = Type;
    this.Value = Value;
  }
}

/**
 * @param{WenyanConfig}WenyanConfigObj 文言文的生成配置;
 * @param{AdvancedEncConfig}AdvancedEncObj 高级加密配置;
 */
export function Enc(
  input,
  key,
  WenyanConfigObj,
  AdvancedEncObj,
  callback = null
) {
  //初始化
  //input.output Uint8Array
  let WenyanSimulatorObj = new WenyanSimulator(key, callback);

  let OriginalData = new Uint8Array();
  OriginalData = input.output;
  let TempS;
  TempS = Uint8ArrayTostring(OriginalData);

  let TempArray = new Uint8Array(OriginalData.byteLength + 1);
  TempArray.set(OriginalData, 0);

  //对未处理的数据计算校验和，放在末尾
  TempArray.set([GetLuhnBit(OriginalData)], OriginalData.byteLength);

  //压缩
  OriginalData = Compress(TempArray);
  //加密

  AdvancedEncObj = new AdvancedEncConfig(
    AdvancedEncObj.Enable !== undefined ? AdvancedEncObj.Enable : false,
    AdvancedEncObj.UseStrongIV !== undefined
      ? AdvancedEncObj.UseStrongIV
      : true,
    AdvancedEncObj.UseHMAC !== undefined ? AdvancedEncObj.UseHMAC : false,
    AdvancedEncObj.UsePBKDF2 !== undefined ? AdvancedEncObj.UsePBKDF2 : false,
    AdvancedEncObj.UseTOTP !== undefined ? AdvancedEncObj.UseTOTP : false,
    AdvancedEncObj.TOTPTimeStep !== undefined ? AdvancedEncObj.TOTPTimeStep : 4,
    AdvancedEncObj.TOTPEpoch !== undefined
      ? AdvancedEncObj.TOTPEpoch
      : Date.now(),
    AdvancedEncObj.TOTPBaseKey !== null &&
    AdvancedEncObj.TOTPBaseKey !== undefined
      ? AdvancedEncObj.TOTPBaseKey
      : key
  );

  OriginalData = Encrypt(OriginalData, key, AdvancedEncObj);

  if (AdvancedEncObj.Enable) {
    //加上高级加密配置位
    if (AdvancedEncObj.UseTOTP && AdvancedEncObj.TOTPTimeStep > 15) {
      throw "Error Encrypting. Invalid TOTP Timestep.";
    }
    let byte = packByte(
      AdvancedEncObj.UseStrongIV,
      AdvancedEncObj.UseHMAC,
      AdvancedEncObj.UsePBKDF2,
      AdvancedEncObj.UseTOTP,
      AdvancedEncObj.TOTPTimeStep
    );
    let TempArray = new Uint8Array(OriginalData.byteLength + 1);
    TempArray.set(OriginalData, 0);
    TempArray.set([byte], OriginalData.byteLength);

    OriginalData = TempArray; //将高级加密配置位放在末尾
  }

  let OriginStr = RemovePadding(Base64.fromUint8Array(OriginalData)); //转Base64

  if (AdvancedEncObj.Enable) {
    //加上高级加密标头
    OriginStr = ADVANCED_ENC_MAGIC + OriginStr;
  }

  try {
    if (callback != null) callback(new CallbackObj("ENC_BASE64", OriginStr));
  } catch (err) {}
  //映射
  let Res = WenyanSimulatorObj.enMap(
    OriginStr,
    WenyanConfigObj.PunctuationMark !== undefined
      ? WenyanConfigObj.PunctuationMark
      : true,
    WenyanConfigObj.RandomIndex !== undefined
      ? WenyanConfigObj.RandomIndex
      : 50,
    WenyanConfigObj.PianwenMode !== undefined
      ? WenyanConfigObj.PianwenMode
      : false,
    WenyanConfigObj.LogicMode !== undefined ? WenyanConfigObj.LogicMode : false,
    WenyanConfigObj.Traditional !== undefined
      ? WenyanConfigObj.Traditional
      : false
  );

  return Res;
}

export function Dec(
  input,
  key,
  TOTPEpoch = null,
  TOTPBaseKey = null,
  callback
) {
  //初始化
  //input.output Uint8Array
  let AdvancedEncObj = null;
  let AdvancedMarker = false;
  let WenyanSimulatorObj = new WenyanSimulator(key, callback);
  let OriginStr = Uint8ArrayTostring(input.output);

  //解映射
  let TempStr1 = WenyanSimulatorObj.deMap(OriginStr);

  let TempStr2Int = new Uint8Array();

  if (TempStr1.slice(0, 2) === ADVANCED_ENC_MAGIC) {
    //检测高级加密标志
    TempStr1 = TempStr1.slice(2);
    AdvancedMarker = true;
  }

  if (!Base64.isValid(TempStr1)) {
    /* v8 ignore next 3 */
    //检查Base64是否合法，如果不合法，那么就没有必要继续处理下去
    throw "Error Decoding. Bad Input or Incorrect Key.";
  }
  try {
    //取到IV，然后对AES加密后的数据执行解密。
    TempStr2Int = Base64.toUint8Array(TempStr1);

    if (AdvancedMarker) {
      //读取高级加密配置
      let rawconfig = unpackByte(TempStr2Int.at(TempStr2Int.byteLength - 1));
      AdvancedEncObj = new AdvancedEncConfig(
        true,
        rawconfig.flags.b0,
        rawconfig.flags.b1,
        rawconfig.flags.b2,
        rawconfig.flags.b3,
        rawconfig.size,
        TOTPEpoch === null ? Date.now() : TOTPEpoch,
        TOTPBaseKey === null ? key : TOTPBaseKey
      );

      //解密
      TempStr2Int = Decrypt(TempStr2Int.slice(0, -1), key, AdvancedEncObj);
    } else {
      TempStr2Int = Decrypt(TempStr2Int, key, AdvancedEncObj);
    }

    //解压缩
    TempStr2Int = Decompress(TempStr2Int);
  } catch (err) {
    /* v8 ignore next 3 */
    //解压缩/解密失败，丢出错误。
    throw "Error Decoding. Bad Input or Incorrect Key.";
  }

  if (!CheckLuhnBit(TempStr2Int)) {
    /* v8 ignore next 3 */
    //检查密文的校验位是否匹配
    //校验不通过，则丢出错误。
    throw "Error Decrypting. Checksum Mismatch.";
  } else {
    //校验通过，则移除校验位。
    TempStr2Int = TempStr2Int.subarray(0, TempStr2Int.byteLength - 1);
  }

  //到此，TempStr2Int 就是解密的结果，也就是原始数据(UINT8Array)。
  let Res = new Object();

  //组装一个对象，同时返回两种类型的解密结果。
  Res.output = Uint8ArrayTostring(TempStr2Int);
  Res.output_B = TempStr2Int;

  return Res;
}

export function Enc_OLD(input, key, q) {
  //初始化
  let OldMapperObj = new OldMapper(key);

  let OriginalData = new Uint8Array();
  OriginalData = input.output;

  let TempArray = new Uint8Array(OriginalData.byteLength + 1);
  TempArray.set(OriginalData, 0);

  TempArray.set([GetLuhnBit(OriginalData)], OriginalData.byteLength);
  //压缩
  OriginalData = Compress(TempArray);
  //加密
  OriginalData = Encrypt(OriginalData, key);

  let OriginStr = RemovePadding(Base64.fromUint8Array(OriginalData));
  //映射
  let Res = OldMapperObj.enMap(OriginStr, q);

  return Res;
}

export function Dec_OLD(input, key) {
  //初始化
  let OldMapperObj = new OldMapper(key);
  let OriginStr = Uint8ArrayTostring(input.output);

  //解映射
  let TempStr1 = OldMapperObj.deMap(OriginStr);

  //还原出AES加密之后的Base64 TempStr1

  let TempStr2Int = new Uint8Array();
  let RandomBytes = new Array(2);
  if (!Base64.isValid(TempStr1)) {
    throw "Error Decoding. Bad Input or Incorrect Key.";
  }
  try {
    TempStr2Int = Base64.toUint8Array(TempStr1);

    //解密
    TempStr2Int = Decrypt(TempStr2Int, key);

    //解压缩
    TempStr2Int = Decompress(TempStr2Int);
  } catch (err) {
    throw "Error Decoding. Bad Input or Incorrect Key.";
  }

  //校验数据
  if (!CheckLuhnBit(TempStr2Int)) {
    /* v8 ignore next 9 */
    if (
      TempStr2Int.at(TempStr2Int.byteLength - 1) == 2 &&
      TempStr2Int.at(TempStr2Int.byteLength - 2) == 2 &&
      TempStr2Int.at(TempStr2Int.byteLength - 3) == 2
    ) {
      TempStr2Int = TempStr2Int.subarray(0, TempStr2Int.byteLength - 3);
    } else {
      throw "Error Decrypting. Checksum Mismatch.";
    }
  } else {
    TempStr2Int = TempStr2Int.subarray(0, TempStr2Int.byteLength - 1);
  }

  //到此，TempStr2Int 就是解密的结果，形式为字节码。
  let Res = new Object();

  Res.output = Uint8ArrayTostring(TempStr2Int);
  Res.output_B = TempStr2Int;
  return Res;
}
