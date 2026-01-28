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
import MersenneTwister from "mersenne-twister";

const SIG_DECRYPT_JP = "桜込凪雫実沢";
const SIG_DECRYPT_CN = "玚俟玊欤瞐珏";

const NULL_STR = "孎"; //默认忽略的占位字符，一个生僻字。

let array = new Uint32Array(1);
let seed = 0;

try {
  window.crypto.getRandomValues(array);
  seed = array[0];
} catch (err) {
  seed = Date.now();
}

var MT = new MersenneTwister(seed);
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
  let tempBase64 = Base64.fromUint8Array(fileData);
  return Base64.decode(tempBase64);
}

export function GetRandomIndex(length) {
  // 取随机数
  let Rand = Math.floor(MT.random() * length);

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
 * 将四个 0/1（或 true/false）和一个 0..15 整数打包成一个 0..255 的字节值
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
 * 将字节解包回原始的四个 bit 与 size
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

export function getStep(key) {
  let second = 0;
  /* v8 ignore next 50 */
  switch (key) {
    case 0:
      second = 180;
      break;
    case 1:
      second = 300;
      break;
    case 2:
      second = 600;
      break;
    case 3:
      second = 1800;
      break;
    case 4:
      second = 7200;
      break;
    case 5:
      second = 21600;
      break;
    case 6:
      second = 43200;
      break;
    case 7:
      second = 86400;
      break;
    case 8:
      second = 259200;
      break;
    case 9:
      second = 432000;
      break;
    case 10:
      second = 604800;
      break;
    case 11:
      second = 1814400;
      break;
    case 12:
      second = 2419200;
      break;
    case 13:
      second = 4838400;
      break;
    case 14:
      second = 14515200;
      break;
    case 15:
      second = 31557600;
      break;
  }
  return second;
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
