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

var array = new Uint32Array(1);

try {
  window.crypto.getRandomValues(array);
  var seed = array[0];
} catch (err) {
  var seed = Date.now();
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

  if (Check == DCheck) {
    return true;
  } else {
    return false;
  }
}

export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
