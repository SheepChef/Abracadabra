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
import MersenneTwister from "mersenne-twister"; //兼容性
import { sha256 } from "@noble/hashes/sha2.js";
import { ecb as AES_ECB } from "@noble/ciphers/aes.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";
import { random } from "./CSPRNGHelper.js"; //密码学安全随机数的封装
import {
  FlexibleTransferConfig,
  FLEXIBLE_TRANSFER_MAGIC,
} from "./CoreHandler.js";

const SIG_DECRYPT_JP = "桜込凪雫実沢";
const SIG_DECRYPT_CN = "玚俟玊欤瞐珏";

const NULL_STR = "孎"; //默认忽略的占位字符，一个生僻字。

let MTseed = Date.now();

var MT = new MersenneTwister(MTseed);
//获取密码学安全随机数，如果不支持WebCrypto API，回落到日期和时间。

export class PreCheckResult {
  constructor(output, isEncrypted = false) {
    this.output = output;
    this.isEncrypted = isEncrypted;
  }
}

export function RemovePadding(Base64String) {
  let PaddingCount = 0;
  for (let i = Base64String.length - 1; i >= Base64String.length - 4; i--) {
    if (Base64String[i] == "=") {
      PaddingCount++;
    }
  }
  return Base64String.slice(0, Base64String.length - PaddingCount);
}

export function AddPadding(Base64String) {
  if (Base64String.length % 4 == 3) {
    return Base64String + "=";
  } else if (Base64String.length % 4 == 2) {
    return Base64String + "==";
  } else {
    return Base64String;
  }
}

export function setCharOnIndex(string, index, char) {
  if (index > string.length - 1) return string;
  return string.substring(0, index) + char + string.substring(index + 1);
}

export function stringToUint8Array(str) {
  let tempBase64 = Base64.encode(str);
  return Base64.toUint8Array(tempBase64);
}

// 将WordArray转换为Uint8Array
export function wordArrayToUint8Array(data) {
  const dataArray = new Uint8Array(data.sigBytes);
  for (let i = 0x0; i < data.sigBytes; i++) {
    dataArray[i] = (data.words[i >>> 0x2] >>> (0x18 - (i % 0x4) * 0x8)) & 0xff;
  }
  return dataArray;
}

export function Uint8ArrayTostring(fileData) {
  return new TextDecoder().decode(fileData);
}

export function GetRandomIndex(length) {
  // 取随机数
  let Rand;

  Rand = Math.floor(MT.random() * length);

  return Rand;
}

export function GetSecureRandomIndex(length) {
  // 取随机数
  let Rand;
  Rand = Math.floor(MT.random() * length);

  try {
    Rand = Math.floor(random() * length);
  } catch (err) {
    Rand = Math.floor(MT.random() * length);
  }

  return Rand;
}

export function difference(arr1, arr2) {
  return arr1.filter((item) => !arr2.includes(item));
}

export function insertStringAtIndex(str, value, index) {
  // 分割字符串为两部分，并在中间插入新值
  return str.slice(0, index) + value + str.slice(index);
}

export function GetLuhnBit(Data) {
  let Digit = new Array();
  let num, digit;
  for (let i = 0; i < Data.byteLength; i++) {
    num = Data[i];
    while (num > 0) {
      digit = num % 10;
      Digit.push(digit);
      num = Math.floor(num / 10);
    }
  }

  // Digit应当是一个数位构成的数组。
  let sum = 0;
  let Check = 0;

  for (let i = 0; i < Digit.length; i++) {
    if (i % 2 != 0) {
      Digit[i] = Digit[i] * 2;
      if (Digit[i] >= 10) {
        Digit[i] = (Digit[i] % 10) + Math.floor(Digit[i] / 10); //计算数字之和
      }
    }
    sum = sum + Digit[i];
  }

  Check = 10 - (sum % 10);

  return Check;
}

export function CheckLuhnBit(Data) {
  let DCheck = Data[Data.byteLength - 1];
  let Check = GetLuhnBit(Data.subarray(0, Data.byteLength - 1));

  return Check == DCheck;
}

export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * 工具函数
 *
 * 将四个 0/1（或 true/false）和一个 0..15 整数打包成一个 0..255 的字节值
 * 用于包装高级加密的配置位
 *
 * @param {number|boolean} b0 - 最低位（bit0）
 * @param {number|boolean} b1 - bit1
 * @param {number|boolean} b2 - bit2
 * @param {number|boolean} b3 - bit3
 * @param {number} size - 0..15，存放在高 4 位
 * @returns {number} 0..255 的字节（Number）。如果需要 Uint8Array，可用 Uint8Array.of(byte)[0] 或 new Uint8Array([byte])
 */
export function packByte(b0, b1, b2, b3, size) {
  // 规范化为 0 或 1
  const bits = [b0, b1, b2, b3].map((x) => (x ? 1 : 0));
  if (!Number.isInteger(size) || size < 0 || size > 15) {
    throw new RangeError("size 必须是整数且在 0..15 范围内");
  }
  const byte =
    (size << 4) | // 高 4 位
    (bits[3] << 3) |
    (bits[2] << 2) |
    (bits[1] << 1) |
    (bits[0] << 0);
  // 确保返回 0..255
  return byte & 0xff;
}

/**
 * 工具函数
 *
 * 用于解包装高级加密的配置位
 *
 * @param {number} byte - 0..255
 * @returns {object} { byte, size, bits: [b0,b1,b2,b3] (数字 0/1), flags: {b0,b1,b2,b3} (布尔值) }
 */
export function unpackByte(byte) {
  if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
    throw new RangeError("byte 必须是 0..255 的整数");
  }
  const size = (byte >> 4) & 0x0f; // 高 4 位
  const b0 = (byte >> 0) & 1;
  const b1 = (byte >> 1) & 1;
  const b2 = (byte >> 2) & 1;
  const b3 = (byte >> 3) & 1;
  return {
    byte: byte & 0xff,
    size,
    bits: [b0, b1, b2, b3],
    flags: {
      b0: Boolean(b0),
      b1: Boolean(b1),
      b2: Boolean(b2),
      b3: Boolean(b3),
    }, // 方便需要布尔值时使用
  };
}

/**
 * 工具函数
 *
 * 将四个分段传输参数(合共48位，6字节)打包成字节值
 *
 * @param{number} lengthToBoundary - 检测到标头的位置距离边界还有多少个载荷字(0~511)
 * @param{number} messageID - 消息辨识ID(0~4095)
 * @param{number} SerialNumber - 消息序号(0~4095)
 * @param{boolean} UseAONT - 本段消息是否使用了AONT(全有或全无转换)
 * @param{string} key - 明文密钥，若提供则自动执行 AES-CTR 局部加密
 * @param{number} iv - 14bit的初始向量 (0~16383)
 * @returns{Uint8Array} 一个字节数组，长度为6。
 */
export function packFlexibleTransferConfig(
  lengthToBoundary,
  messageID,
  SerialNumber,
  UseAONT,
  key = null,
  iv = 0
) {
  //掩码截断，防止外部传入的数值过大导致位溢出
  const len = lengthToBoundary & 0x1ff; // 9 bits (max 511)
  const msg = messageID & 0xfff; // 12 bits (max 4095)
  const ser = SerialNumber & 0xfff; // 12 bits (max 4095)
  const aont = UseAONT ? 1 : 0; // 1 bit

  const safeIv = iv & 0x3fff; // 14 bits (max 16383)

  //避免32位位移溢出，将48位切割为高24位与低24位
  const high24 = (len << 15) | (msg << 3) | (ser >> 9);
  const low24 = ((ser & 0x1ff) << 15) | (aont << 14) | safeIv;

  //将 24 位区块映射为 Uint8Array (大端序)
  const ResultBuffer = new Uint8Array(6);
  ResultBuffer[0] = (high24 >> 16) & 0xff;
  ResultBuffer[1] = (high24 >> 8) & 0xff;
  ResultBuffer[2] = high24 & 0xff;
  ResultBuffer[3] = (low24 >> 16) & 0xff;
  ResultBuffer[4] = (low24 >> 8) & 0xff;
  ResultBuffer[5] = low24 & 0xff;

  //加密逻辑(若传入了 KEY)
  if (key) {
    // 派生AES加密Key SHA256(KEY)
    const hash1 = sha256(utf8ToBytes(key));

    // 派生IV (CTR 计数器块)
    // 14bit 扩充填充到 16bit (2字节)
    const ivByte0 = (safeIv >> 8) & 0xff;
    const ivByte1 = safeIv & 0xff;

    // 拼接 hash1 + 2字节的IV
    const concatData = new Uint8Array(hash1.length + 2); // hash1 是 32 字节，加2字节等于 34
    concatData.set(hash1, 0); // 拷贝 hash1 到头部
    concatData[32] = ivByte0; // 填充倒数第二个字节
    concatData[33] = ivByte1; // 填充最后一个字节

    // actualIV = SHA256( Hash1 + 2字节的IV )
    const actualIV = sha256(concatData);

    // 【步骤 C】：生成 CTR 密钥流 (Keystream)
    // 截取 actualIV 的前 16 字节(128 bit)作为 AES 的计数器块
    const counterBlock = actualIV.slice(0, 16);

    // 用 hash1 (第一层哈希) 作密钥，以 ECB 模式加密 counterBlock，
    // 这在密码学上等价于输出了 CTR 模式的第一块密钥流。
    const cipher = AES_ECB(hash1);
    const keystream = cipher.encrypt(counterBlock);

    // 掩码异或，加密前 34 bits
    ResultBuffer[0] ^= keystream[0];
    ResultBuffer[1] ^= keystream[1];
    ResultBuffer[2] ^= keystream[2];
    ResultBuffer[3] ^= keystream[3];
    // 0xC0 = 11000000，异或高2位，保留低6位和第5字节的8位(合计 14bit IV)绝对明文
    ResultBuffer[4] ^= keystream[4] & 0xc0;
  }

  return ResultBuffer;
}

/**
 * 工具函数
 *
 * 将四个分段传输参数(合共48位，6字节)逆向拆包
 * 用于将 6 字节的 Uint8Array 还原为具体的配置参数
 *
 * @param {Uint8Array} buffer 长度为 6 的字节数组
 * @param {string} key  传入密钥
 */
export function unpackFlexibleTransferConfig(buffer, key = null) {
  if (buffer.length !== 6) {
    throw new Error("Buffer must be exactly 6 bytes");
  }

  const workBuffer = new Uint8Array(buffer);

  // 提取明文 IV
  const iv = ((workBuffer[4] & 0x3f) << 8) | workBuffer[5];

  // 局部 AES 解密 (如果传入了密钥)
  if (key) {
    //密钥派生过程
    const hash1 = sha256(utf8ToBytes(key));

    //直接申请 34 字节的内存
    const concatData = new Uint8Array(34);

    //将 32 字节的 hash1 拷贝到头部
    concatData.set(hash1, 0);

    // 提取 iv 的高字节和低字节，赋值到末尾
    concatData[32] = (iv >> 8) & 0xff;
    concatData[33] = iv & 0xff;

    const actualIV = sha256(concatData);

    // 截取 16 字节(128 bit)作为 AES 的计数器块
    const counterBlock = actualIV.slice(0, 16);

    //生成 CTR 密钥流
    const cipher = AES_ECB(hash1);
    const keystream = cipher.encrypt(counterBlock);

    //异或还原
    workBuffer[0] ^= keystream[0];
    workBuffer[1] ^= keystream[1];
    workBuffer[2] ^= keystream[2];
    workBuffer[3] ^= keystream[3];
    // 掩码 0xC0 (11000000)，仅仅解密第 5 字节的高 2 位，不碰低 6 位
    workBuffer[4] ^= keystream[4] & 0xc0;
  }

  //常规位拆包 (此时 workBuffer 已经是纯明文了)

  // 将 6 字节拆分为高 24 位与低 24 位
  const high24 = (workBuffer[0] << 16) | (workBuffer[1] << 8) | workBuffer[2];
  const low24 = (workBuffer[3] << 16) | (workBuffer[4] << 8) | workBuffer[5];

  //按约定的位宽与偏移量逐个提取字段
  const lengthToBoundary = (high24 >> 15) & 0x1ff; // 9位
  const messageID = (high24 >> 3) & 0xfff; // 12位

  //缝合跨越边界的 SerialNumber
  const serHigh3 = high24 & 0x7;
  const serLow9 = (low24 >> 15) & 0x1ff;
  const SerialNumber = (serHigh3 << 9) | serLow9;

  //提取布尔标志
  const UseAONT = ((low24 >> 14) & 0x1) === 1;

  // IV 在第一步已经提取过了，直接返回
  return { lengthToBoundary, messageID, SerialNumber, UseAONT, iv };
}

/**
 * 标准整数到字节串的转换 (I2OSP) - 32 位大端序
 * 将循环的计数器转换为 4 个字节的 Uint8Array
 *
 * @param {number} counter - 当前的循环计数器
 * @returns {Uint8Array} - 4字节的大端序字节数组
 */
export function i2osp(counter) {
  const c = new Uint8Array(4);
  // 使用无符号右移 (>>>) 和位与 (&) 提取各个字节
  c[0] = (counter >>> 24) & 0xff;
  c[1] = (counter >>> 16) & 0xff;
  c[2] = (counter >>> 8) & 0xff;
  c[3] = counter & 0xff;
  return c;
}

/**
 * 工具函数
 *
 * 获取TOTP加密时候，十六个步长选项对应的实际步长(秒数)
 *
 * @param{number} key 整数(0~15)
 *
 */
export function getStep(key) {
  const STEPS = [
    180, 300, 600, 1800, 7200, 21600, 43200, 86400, 259200, 432000, 604800,
    1814400, 2419200, 4838400, 14515200, 31557600,
  ];
  return STEPS[key] || 0;
}

export class ValueNoise1D {
  /**
   * 工具函数
   * 一个基于伪随机的一维值噪声生成器
   *
   * 在一些不适合纯随机分布的情况下适用。
   *
   * **/
  constructor(seed = Math.random()) {
    this.seed = seed;
  }

  // 伪随机哈希，固定输入产生固定输出
  random(x) {
    let n = Math.sin(x * 12.9898 + this.seed) * 43758.5453;
    return n - Math.floor(n);
  }

  // 余弦平滑插值
  interpolate(a, b, blend) {
    const theta = blend * Math.PI;
    const f = (1 - Math.cos(theta)) * 0.5;
    return a * (1 - f) + b * f;
  }

  // 获取噪声值
  get(x) {
    const intX = Math.floor(x);
    const fracX = x - intX;

    const v1 = this.random(intX);
    const v2 = this.random(intX + 1);

    return this.interpolate(v1, v2, fracX);
  }
}

/**
 * 工具函数
 * 使用一个简单的算法，把灵活传输的数据字节分成多个段，返回一个数组
 *
 * @param{number}totalLength 传入一段密文的总载荷
 * @param{number}minLen 指定一段密文的最低载荷量
 * @param{number}maxLen 指定一段密文的最高载荷量
 * @returns{Array} 返回处理后的数组
 */
export function distributeFlexibleTransfer(
  totalLength,
  minLen = 20,
  maxLen = 80
) {
  //传入非法的值将直接抛出错误
  if (minLen < 10 || maxLen > 380 || maxLen < minLen) {
    throw "Invalid Payload Distribution Argument.";
  }
  //密文太长，超出了灵活传输可容纳的 380*4096 (1.56MB)字节的绝对上限，丢出错误。
  if (totalLength > 1556480) {
    throw `Payload Length Limit Exceeded.`;
  }
  //设置的最小分段参数过小，有造成分段数量超限的风险，丢出错误。
  if (minLen * 4096 < totalLength) {
    throw `Unacceptable Payload Distribution Argument. 
    Minimal length should be higher than ${Math.floor(totalLength / 4096)}`;
  }
  // 容错：如果总长甚至不够一个最小段落
  if (totalLength <= maxLen) return [totalLength];

  const chunks = [];
  let remaining = totalLength;
  let paragraphIndex = 0;

  //将噪声生成器实例化
  const noiseGen = new ValueNoise1D();

  while (remaining > 0) {
    // 获取当前波形值 (0.0 ~ 1.0)
    // 步长 0.5 决定了波形的平缓程度。值越小，相邻段落长度越接近
    let waveFactor = noiseGen.get(paragraphIndex * 0.5);

    //映射到具体长度
    let currentLen = Math.floor(minLen + waveFactor * (maxLen - minLen));

    //边界收敛
    if (currentLen >= remaining || remaining - currentLen < minLen) {
      chunks.push(remaining); // 把剩下的全部打包成最后一段
      break;
    }

    chunks.push(currentLen);
    remaining -= currentLen;
    paragraphIndex++;
  }

  return chunks;
}

/**
 * 工具函数
 * 动态/串行插入数据标志，支持任意标志缺省，精确计算剩余距离
 *
 * @param {string} originalStr 原始长字符串
 * @param {string|null|undefined} sub1 第一个数据标志 (如果不插则传 null/undefined/空字符串)
 * @param {function|null|undefined} sub2EncryptProvider 接收距离并返回 sub2 的回调函数 (如果不插则传 null/undefined)
 * @param {FlexibleTransferConfig} FlexibleTransferConfigObj 接收灵活传输参数。
 * @param {string} key 接收加密灵活传输参数所需要的密钥，默认是加密的主密钥
 * @returns {string} 最终拼接后的字符串
 */
export function insertEncryptMarks(
  originalStr,
  sub1,
  sub2EncryptProvider,
  FlexibleTransferConfigObj,
  key
) {
  const L = originalStr.length;

  // 状态判定：检查当前需要插入哪些标志
  const hasSub1 = typeof sub1 === "string" && sub1.length > 0;
  const hasSub2 = typeof sub2EncryptProvider === "function";

  // ==== 场景 0: 两个标志都不插 ====
  if (!hasSub1 && !hasSub2) {
    return originalStr;
  }

  // ==== 场景 1: 只插入 sub1 ====
  if (hasSub1 && !hasSub2) {
    const i1 = Math.floor(Math.random() * (L + 1));
    return originalStr.slice(0, i1) + sub1 + originalStr.slice(i1);
  }

  // ==== 场景 2: 只插入 sub2 ====
  if (!hasSub1 && hasSub2) {
    // 此时不存在 sub1 干扰，直接在原字符串 L+1 个缝隙中选一个
    const i2 = Math.floor(Math.random() * (L + 1));
    // 距离就是原字符串剩下的字符数
    const distanceToEnd = L - i2;
    // 生成 sub2 并插入
    const sub2 =
      FLEXIBLE_TRANSFER_MAGIC +
      Base64.fromUint8Array(
        sub2EncryptProvider(
          distanceToEnd,
          FlexibleTransferConfigObj.MessageID,
          FlexibleTransferConfigObj.RecursionSeqNum,
          FlexibleTransferConfigObj.UseAONT,
          key,
          GetRandomIndex(16384)
        )
      );
    return originalStr.slice(0, i2) + sub2 + originalStr.slice(i2);
  }

  // ==== 场景 3: 两个标志都插入 (全量逻辑) ====
  if (hasSub1 && hasSub2) {
    const l1 = sub1.length;

    // Step 1: 确定并插入 sub1
    const i1 = Math.floor(Math.random() * (L + 1));
    const strAfterSub1 =
      originalStr.slice(0, i1) + sub1 + originalStr.slice(i1);

    // Step 2: 决定 sub2 虚拟位置 & 计算距离
    const r = Math.floor(Math.random() * (L + 2));
    let distanceToEnd = 0;
    let i2 = 0;

    if (r <= i1) {
      // sub2 在前：身后距离 = 原字串剩余 + sub1全长
      distanceToEnd = L - r + l1;
      i2 = r; // 在 strAfterSub1 中的真实插入位置
    } else {
      // sub2 在后：身后距离 = 仅原字串剩余
      distanceToEnd = L - r + 1;
      i2 = r + l1 - 1; // 需要跳过 sub1 的长度
    }

    // Step 3: 生成并插入 sub2
    const sub2 =
      FLEXIBLE_TRANSFER_MAGIC +
      Base64.fromUint8Array(
        sub2EncryptProvider(
          distanceToEnd,
          FlexibleTransferConfigObj.MessageID,
          FlexibleTransferConfigObj.RecursionSeqNum,
          FlexibleTransferConfigObj.UseAONT,
          key,
          GetSecureRandomIndex(16384)
        )
      );
    return strAfterSub1.slice(0, i2) + sub2 + strAfterSub1.slice(i2);
  }
}

export function preCheck_OLD(inp) {
  let input = String(inp);
  let size = input.length; //第一次遍历字符数组的函数，负责判断给定的输入类型。
  let temp, temp2, group;
  let isEncrypted = false; //判定该文本是否为加密文本

  let isJPFound = false; //如果检查出一个日语标志位，则标记为真
  let isCNFound = false; //如果检查出一个汉字标志位，则标记为真
  for (let i = 0; i < size; i++) {
    temp = input[i];

    if (i != size - 1) {
      //一次遍历两个字符，遇到倒数第一个的时候防止越界
      temp2 = input[i + 1];
    } else {
      temp2 = NULL_STR;
    }
    group = temp + temp2;

    //判断这个符号是不是标识符，标识符用空字符进行占位操作
    if (SIG_DECRYPT_JP.indexOf(temp) != -1) {
      input = setCharOnIndex(input, i, NULL_STR);
      isJPFound = true;
      continue;
    }
    if (SIG_DECRYPT_CN.indexOf(temp) != -1) {
      input = setCharOnIndex(input, i, NULL_STR);
      isCNFound = true;
      continue;
    }
  }

  if (isJPFound && isCNFound) {
    isEncrypted = true;
  }
  let Result = new PreCheckResult(stringToUint8Array(input), isEncrypted);
  return Result;
}
