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
import { Base64 } from "js-base64";
import structuredClone from "@ungap/structured-clone";
import { OldMapper, WenyanSimulator } from "./ChineseMappingHelper.js";
import { Compress, Decompress } from "./CompressionHelper.js";
import { DeAONT, Decrypt, EnAONT, Encrypt } from "./EncryptHelper.js";

import {
  Uint8ArrayTostring,
  GetLuhnBit,
  RemovePadding,
  CheckLuhnBit,
  packByte,
  unpackByte,
  GetRandomIndex,
  distributeFlexibleTransfer,
  insertStringAtIndex,
  packFlexibleTransferConfig,
  unpackFlexibleTransferConfig,
  insertEncryptMarks,
  AddPadding,
  stringToUint8Array,
} from "./Misc.js";

export class WenyanConfig {
  /**
   * 魔曰 文言文加密参数
   *
   * @param{bool}PunctuationMark 指定是否为密文添加标点符号，默认 true/添加;
   * @param{int}RandomIndex 密文算法的随机程度，越大随机性越强，默认 50，最大100，超过100将会出错;
   * @param{[number, number]}RandomParagraphing 密文所使用的分段函数每段载荷上下限。传入 min 和 max，默认 20/80。min 小于 20, max 大于 200, 或者 max < min 将会出错;
   * @param{bool}PianwenMode 指定是否强制生成骈文密文，默认 false;
   * @param{bool}LogicMode 指定是否强制生成逻辑密文，默认 false;
   */
  constructor(
    PunctuationMark = true,
    RandomIndex = 50,
    RandomParagraphing = [20, 80],
    PianwenMode = false,
    LogicMode = false,
    Traditional = false
  ) {
    this.PunctuationMark = PunctuationMark;
    this.RandomIndex = RandomIndex;
    this.RandomParagraphing = RandomParagraphing;
    this.PianwenMode = PianwenMode;
    this.LogicMode = LogicMode;
    this.Traditional = Traditional;
  }
}

export class FlexibleTransferConfig {
  /**
   * 魔曰 灵活传输参数
   *
   * @param{bool}Enable 指定是否启用灵活传输功能，默认 false/不开启
   * @param{bool}UseAONT 指定是否启用全有或全无转换(AONT)，默认 true/开启，开启后必须获得所有密文才可以解密完整内容，但是会导致密文变长，解密速度变缓慢
   * @param{number}MessageID  指定临时消息ID，有助于防止混淆不同发送方的消息，默认-1为随机选择(0~4095)
   * @param{[number, number]}RandomParagraphing 指定分段加密每段字节数量上下限。传入 min 和 max，默认 20/80。min 小于 10, max 大于 380, 或者 max < min 将会出错;
   */
  constructor(
    Enable = false,
    UseAONT = true,
    MessageID = -1,
    RandomParagraphing = [20, 80]
  ) {
    this.Enable = Enable;
    this.UseAONT = UseAONT;
    this.MessageID = MessageID;
    this.RandomParagraphing = RandomParagraphing;
    if (
      RandomParagraphing[0] < 10 ||
      RandomParagraphing[1] > 380 ||
      RandomParagraphing[1] < RandomParagraphing[0]
    ) {
      throw new Error("Invalid Flexible Transfer Argument.");
    }
    this.isRecursion = false; //初始化递归状态
    this.RecursionSeqNum = 0;
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
   * @param{number}TOTPEpoch 指定用于TOTP加密的Unix时间戳记，以毫秒为单位(JS标准)，默认为系统时间;
   * @param{string}TOTPBaseKey 指定用于TOTP加密的预共享密钥，默认为加密主密钥;
   * @param{FlexibleTransferConfig}FlexibleTransfer 指定灵活传输配置，若此项不是一个Object则默认不启用，高级加密的Enable参数，对灵活传输不生效;
   */
  constructor(
    Enable = false,
    UseStrongIV = true,
    UseHMAC = false,
    UsePBKDF2 = false,
    UseTOTP = false,
    TOTPTimeStep = 4,
    TOTPEpoch = Date.now(),
    TOTPBaseKey = null,
    FlexibleTransfer = new FlexibleTransferConfig()
  ) {
    this.Enable = Enable;
    this.UseStrongIV = UseStrongIV;
    this.UseHMAC = UseHMAC;
    this.UsePBKDF2 = UsePBKDF2;
    this.UseTOTP = UseTOTP;
    this.TOTPTimeStep = TOTPTimeStep;
    this.TOTPEpoch = TOTPEpoch;
    this.TOTPBaseKey = TOTPBaseKey;
    this.FlexibleTransfer = FlexibleTransfer;
  }
}

export class FlexibleTransferDataObj {
  /**
   * 魔曰 灵活传输数据对象
   *
   * 在解密时候，如果检测到当前密文使用了灵活传输，则介入并利用该对象封装数据和必须的参数。
   *
   * @param{bool}UseAONT 是否启用全有或全无转换(AONT)
   * @param{number}MessageID 消息ID
   * @param{string}DataInBase64 Base64编码后的加密Data
   * @param{string}SerialNumber 消息序号
   */
  constructor(UseAONT, MessageID, DataInBase64, SerialNumber) {
    this.UseAONT = UseAONT;
    this.MessageID = MessageID;
    this.SerialNumber = SerialNumber;
    this.DataInBase64 = DataInBase64;
  }
}

export class EncResultDataObj {
  /**
   * 魔曰 加密结果数据对象
   *
   * 加密的数据结果
   *
   * @param{string}StringData 字符串Data
   * @param{Uint8Array}BufferData 字节Data
   */
  constructor(StringData, BufferData) {
    this.StringData = StringData;
    this.BufferData = BufferData;
  }
}

export class DecResultDataObj {
  /**
   * 魔曰 解密结果数据对象
   *
   * 解密的数据结果
   *
   * @param{string}StringData 字符串Data
   * @param{Uint8Array}BufferData 字节Data
   */
  constructor(StringData, BufferData) {
    this.StringData = StringData;
    this.BufferData = BufferData;
  }
}

//标头，用于自动识别高级加密数据，理论上需要附加正常加密/解密时绝不可能在开头出现的Base64编码范围内字符
export const ADVANCED_ENC_MAGIC = "+=";
//标头，用于自动识别灵活传输数据
export const FLEXIBLE_TRANSFER_MAGIC = "/=";

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
  let OriginalData = new Uint8Array();
  OriginalData = input.output;

  //如果灵活传输已经激活，则进入递归程序；并避免无限递归。
  if (
    AdvancedEncObj.FlexibleTransfer &&
    AdvancedEncObj.FlexibleTransfer.Enable &&
    !AdvancedEncObj.FlexibleTransfer.isRecursion
  ) {
    /*高级灵活加密需要在两个地方介入
     * 在本函数执行递归和加密标头封装，在转轮函数解密时执行标头判断和拦截，解密主函数需要判断转轮函数返回的数据是否为灵活加密数据。
     * 转轮函数在拦截标头时，需要实时地封装灵活加密数据对象，将对象数组返回上一级，以供判断。
     * 解密主函数需要针对MessageID执行一次分类，再依据各个分类中消息的序号执行排序，最后执行分段解密。若识别到AONT，还需要执行反AONT。
     * 高级加密标头和灵活加密标头将一次性同时插入，下一版本中，高级加密标头允许插入到全段文本的任意位置，由转轮函数执行拦截和提取。
     */

    AdvancedEncObj.FlexibleTransfer = new FlexibleTransferConfig(
      AdvancedEncObj.FlexibleTransfer.Enable !== undefined
        ? AdvancedEncObj.FlexibleTransfer.Enable
        : false,
      AdvancedEncObj.FlexibleTransfer.UseAONT !== undefined
        ? AdvancedEncObj.FlexibleTransfer.UseAONT
        : true,
      AdvancedEncObj.FlexibleTransfer.MessageID !== undefined
        ? AdvancedEncObj.FlexibleTransfer.MessageID
        : -1,
      AdvancedEncObj.FlexibleTransfer.RandomParagraphing !== undefined &&
      Array.isArray(AdvancedEncObj.FlexibleTransfer.RandomParagraphing)
        ? AdvancedEncObj.FlexibleTransfer.RandomParagraphing
        : [20, 80]
    ); //重新组装一个新对象，以自动缺省未传入值

    //有AONT的时候提前压缩，递归时候避免重复压缩。校验码仍然保留。
    if (AdvancedEncObj.FlexibleTransfer.UseAONT) {
      OriginalData = Compress(OriginalData);
    }

    // 开始执行分段，分段采用余弦插值噪声
    let PayloadLengthArray = distributeFlexibleTransfer(
      OriginalData.byteLength,
      AdvancedEncObj.FlexibleTransfer.RandomParagraphing[0],
      AdvancedEncObj.FlexibleTransfer.RandomParagraphing[1]
    );

    //如果启用了AONT，则执行AONT。
    if (AdvancedEncObj.FlexibleTransfer.UseAONT) {
      OriginalData = EnAONT(OriginalData);
    }

    //先计算每段的字节长度，再根据字节长度来切分数组。
    let SlicedDataArray = new Array(PayloadLengthArray.length);
    let offset = 0;
    for (let i = 0; i < PayloadLengthArray.length; i++) {
      let chunkLength = PayloadLengthArray[i];

      SlicedDataArray[i] = OriginalData.slice(offset, offset + chunkLength);
      offset += chunkLength;
    }

    //开始递归，初始化递归标志
    let RecursiveAdvancedEncObj = structuredClone(AdvancedEncObj);
    RecursiveAdvancedEncObj.FlexibleTransfer.isRecursion = true;
    RecursiveAdvancedEncObj.FlexibleTransfer.RecursionSeqNum = 0;

    if (AdvancedEncObj.FlexibleTransfer.MessageID == -1) {
      //随机消息ID
      RecursiveAdvancedEncObj.FlexibleTransfer.MessageID = GetRandomIndex(4096);
    }

    let ResultArray = new Array(SlicedDataArray.length);
    for (let i = 0; i < SlicedDataArray.length; i++) {
      ResultArray[i] = Enc(
        { output: SlicedDataArray[i] },
        key,
        structuredClone(WenyanConfigObj),
        structuredClone(RecursiveAdvancedEncObj),
        callback
      );
      RecursiveAdvancedEncObj.FlexibleTransfer.RecursionSeqNum++;
    }
    return ResultArray;
  }

  let WenyanSimulatorObj = new WenyanSimulator(key, callback);

  let TempS;
  TempS = Uint8ArrayTostring(OriginalData);

  let TempArray = new Uint8Array(OriginalData.byteLength + 1);
  TempArray.set(OriginalData, 0);

  //对未处理的数据计算校验和，放在末尾
  TempArray.set([GetLuhnBit(OriginalData)], OriginalData.byteLength);

  //压缩，这里分段加密必须为假(属性不存在)或者未开启，或者不位于递归状态时，才允许执行压缩
  if (
    !AdvancedEncObj.FlexibleTransfer ||
    !AdvancedEncObj.FlexibleTransfer.Enable ||
    !AdvancedEncObj.FlexibleTransfer.isRecursion
  ) {
    OriginalData = Compress(TempArray);
  } else {
    OriginalData = TempArray;
  }

  try {
    AdvancedEncObj = new AdvancedEncConfig(
      AdvancedEncObj.Enable !== undefined ? AdvancedEncObj.Enable : false,
      AdvancedEncObj.UseStrongIV !== undefined
        ? AdvancedEncObj.UseStrongIV
        : true,
      AdvancedEncObj.UseHMAC !== undefined ? AdvancedEncObj.UseHMAC : false,
      AdvancedEncObj.UsePBKDF2 !== undefined ? AdvancedEncObj.UsePBKDF2 : false,
      AdvancedEncObj.UseTOTP !== undefined ? AdvancedEncObj.UseTOTP : false,
      AdvancedEncObj.TOTPTimeStep !== undefined
        ? AdvancedEncObj.TOTPTimeStep
        : 4,
      AdvancedEncObj.TOTPEpoch !== undefined
        ? AdvancedEncObj.TOTPEpoch
        : Date.now(),
      AdvancedEncObj.TOTPBaseKey !== null &&
      AdvancedEncObj.TOTPBaseKey !== undefined
        ? AdvancedEncObj.TOTPBaseKey
        : key,
      AdvancedEncObj.FlexibleTransfer !== null &&
      AdvancedEncObj.FlexibleTransfer !== undefined
        ? AdvancedEncObj.FlexibleTransfer
        : new FlexibleTransferConfig()
    );
  } catch (err) {
    //遇到错误即AdvancedEncObj是一个null或者某个不可读取属性的非法值，自动缺省
    AdvancedEncObj = new AdvancedEncConfig();
  }
  //加密
  OriginalData = Encrypt(OriginalData, key, AdvancedEncObj);

  if (AdvancedEncObj.Enable) {
    //加上高级加密配置位
    if (AdvancedEncObj.UseTOTP && AdvancedEncObj.TOTPTimeStep > 15) {
      throw new Error("Error Encrypting. Invalid TOTP Timestep.");
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
    if (
      AdvancedEncObj.FlexibleTransfer &&
      AdvancedEncObj.FlexibleTransfer.Enable &&
      AdvancedEncObj.FlexibleTransfer.isRecursion
    ) {
      //高级加密和灵活传输同时启用
      OriginStr = insertEncryptMarks(
        OriginStr,
        ADVANCED_ENC_MAGIC,
        packFlexibleTransferConfig,
        AdvancedEncObj.FlexibleTransfer,
        key
      );
    } else {
      //只启用高级加密
      OriginStr = insertEncryptMarks(
        OriginStr,
        ADVANCED_ENC_MAGIC,
        null,
        null,
        null
      );
    }
  } else {
    if (
      AdvancedEncObj.FlexibleTransfer &&
      AdvancedEncObj.FlexibleTransfer.Enable &&
      AdvancedEncObj.FlexibleTransfer.isRecursion
    ) {
      //只启用灵活传输
      OriginStr = insertEncryptMarks(
        OriginStr,
        null,
        packFlexibleTransferConfig,
        AdvancedEncObj.FlexibleTransfer,
        key
      );
    }
  }

  try {
    if (callback != null) callback(new CallbackObj("ENC_BASE64", OriginStr));
  } catch (err) {
    // continue regardless of error
  }
  //映射
  let Res = WenyanSimulatorObj.enMap(
    OriginStr,
    WenyanConfigObj.PunctuationMark !== undefined
      ? WenyanConfigObj.PunctuationMark
      : true,
    WenyanConfigObj.RandomIndex !== undefined
      ? WenyanConfigObj.RandomIndex
      : 50,
    WenyanConfigObj.RandomParagraphing !== undefined
      ? WenyanConfigObj.RandomParagraphing
      : [20, 80],
    WenyanConfigObj.PianwenMode !== undefined
      ? WenyanConfigObj.PianwenMode
      : false,
    WenyanConfigObj.LogicMode !== undefined ? WenyanConfigObj.LogicMode : false,
    WenyanConfigObj.Traditional !== undefined
      ? WenyanConfigObj.Traditional
      : false
  );
  let Encoder = new TextEncoder();
  return new EncResultDataObj(Res, Encoder.encode(Res));
}

export function Dec(
  input,
  key,
  TOTPEpoch = null,
  TOTPBaseKey = null,
  callback = null
) {
  //初始化
  //input.output Uint8Array
  let AdvancedEncObj = null;
  let AdvancedMarker = false;
  let WenyanSimulatorObj = new WenyanSimulator(key, callback);
  let OriginStr;
  let TempStr1;

  if (!(input instanceof FlexibleTransferDataObj)) {
    OriginStr = Uint8ArrayTostring(input.output);
  } else {
    OriginStr = input.DataInBase64;
  }

  //解映射
  if (!(input instanceof FlexibleTransferDataObj)) {
    TempStr1 = WenyanSimulatorObj.deMap(OriginStr, key);
  } else {
    TempStr1 = OriginStr;
  }

  if (Array.isArray(TempStr1)) {
    //如果返回了一个数组，即为识别到启用了分段传输。
    //开始递归解密。先分类，再排序，再解密。

    //开始分类，针对不同的消息ID。
    let groups = {};
    for (let item of TempStr1) {
      if (!groups[item.MessageID]) groups[item.MessageID] = [];
      groups[item.MessageID].push(item);
    }
    let ResultArray = Object.values(groups);

    //分类完成，紧接着排序。

    // 遍历每一行 (row)
    ResultArray.forEach((row) => {
      // 对当前行按照 SerialNumber 从小到大排序
      row.sort((a, b) => a.SerialNumber - b.SerialNumber);
    });

    //对每一行的每个元素执行递归解密，然后执行拼接和AONT。
    for (let i = 0; i < ResultArray.length; i++) {
      let AONT = false;
      let ErrorObj = null;
      for (let a = 0; a < ResultArray[i].length; a++) {
        if (ResultArray[i][a].UseAONT) {
          AONT = true;
        }
        try {
          ResultArray[i][a] = Dec(
            ResultArray[i][a],
            key,
            TOTPEpoch,
            TOTPBaseKey,
            callback
          ).BufferData;
        } catch (err) {
          //错误处理只记录一个错误。
          ResultArray[i][a] = [];
          ErrorObj = err;
          continue;
        }
      }
      if (AONT) {
        ResultArray[i].UseAONT = true;
      }
      if (ErrorObj != null) {
        ResultArray[i].ErrorObj = ErrorObj;
      }
    }
    //拼接每一行的数据

    let MergedResultArray = ResultArray.map((row) => {
      //计算当前行所有 Uint8Array 的总长度
      const totalLength = row.reduce((sum, arr) => sum + arr.length, 0);

      //创建一个拥有该总长度的全新 Uint8Array
      const mergedArray = new Uint8Array(totalLength);

      //遍历当前行的 Uint8Array，依次塞入新数组中
      let offset = 0;
      for (let i = 0; i < row.length; i++) {
        mergedArray.set(row[i], offset); // 在指定的偏移量位置写入数据
        offset += row[i].length; // 更新偏移量
      }

      if (row.UseAONT) {
        mergedArray.UseAONT = true;
      }
      if (row.ErrorObj != null) {
        mergedArray.ErrorObj = row.ErrorObj;
      }

      // 返回拼接好的 Uint8Array
      return mergedArray;
    });

    for (let i = 0; i < MergedResultArray.length; i++) {
      let ErrorObj = null;
      if (MergedResultArray[i].ErrorObj) {
        ErrorObj = MergedResultArray[i].ErrorObj;
      }
      //开始执行ANOT，以及最终处理
      if (MergedResultArray[i].UseAONT) {
        if (MergedResultArray[i].byteLength > 1) {
          MergedResultArray[i] = DeAONT(MergedResultArray[i]);
        }
        //解压缩
        MergedResultArray[i] = Decompress(MergedResultArray[i]);
      }

      //组装最终要传回去的对象
      MergedResultArray[i] = new DecResultDataObj(
        Uint8ArrayTostring(MergedResultArray[i]),
        MergedResultArray[i]
      );
      if (ErrorObj != null) {
        MergedResultArray.ErrorObj = ErrorObj;
      }
    }

    return MergedResultArray;
  }

  let TempStr2Int = new Uint8Array();

  if (TempStr1.indexOf(ADVANCED_ENC_MAGIC) !== -1) {
    //检测高级加密标志

    TempStr1 =
      TempStr1.slice(0, TempStr1.indexOf(ADVANCED_ENC_MAGIC)) +
      TempStr1.slice(TempStr1.indexOf(ADVANCED_ENC_MAGIC) + 2); //移除高级加密标志

    AdvancedMarker = true;
  }

  TempStr1 = AddPadding(TempStr1);

  if (!Base64.isValid(TempStr1)) {
    /* v8 ignore next 3 */
    //检查Base64是否合法，如果不合法，那么就没有必要继续处理下去
    throw new Error("Error Decoding. Bad Input or Incorrect Key.");
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

    //解压缩，仅在传入的不是FlexibleDataObj时候，或者ANOT未开启的时候，才允许执行。
    if (
      !(input instanceof FlexibleTransferDataObj) ||
      (input instanceof FlexibleTransferDataObj && !input.UseAONT)
    ) {
      TempStr2Int = Decompress(TempStr2Int);
    }
  } catch (err) {
    //解压缩/解密失败，丢出错误。
    /* v8 ignore next 6 */
    if (typeof err == "string") {
      throw err;
    } else {
      throw new Error("Error Decoding. Bad Input or Incorrect Key.");
    }
  }

  if (!CheckLuhnBit(TempStr2Int)) {
    /* v8 ignore next 3 */
    //检查密文的校验位是否匹配
    //校验不通过，则丢出错误。
    throw new Error("Error Decrypting. Checksum Mismatch.");
  } else {
    //校验通过，则移除校验位。
    TempStr2Int = TempStr2Int.subarray(0, TempStr2Int.byteLength - 1);
  }

  //到此，TempStr2Int 就是解密的结果，也就是原始数据(UINT8Array)。
  let Res = new Object();

  //组装一个对象，同时返回两种类型的解密结果。
  Res.output = Uint8ArrayTostring(TempStr2Int);
  Res.output_B = TempStr2Int;

  return new DecResultDataObj(Uint8ArrayTostring(TempStr2Int), TempStr2Int);
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
    throw new Error("Error Decoding. Bad Input or Incorrect Key.");
  }
  try {
    TempStr2Int = Base64.toUint8Array(TempStr1);

    //解密
    TempStr2Int = Decrypt(TempStr2Int, key);

    //解压缩
    TempStr2Int = Decompress(TempStr2Int);
  } catch (err) {
    throw new Error("Error Decoding. Bad Input or Incorrect Key.");
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
      throw new Error("Error Decrypting. Checksum Mismatch.");
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
