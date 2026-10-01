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
import { ctr as AES_CTR } from "@noble/ciphers/aes.js";
import { Base64 } from "js-base64";
import { totp } from "./otplib.d.ts";
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { hexToBytes, bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
import { AdvancedEncConfig } from "./CoreHandler.js";
import {
  wordArrayToUint8Array,
  Uint8ArrayTostring,
  GetRandomIndex,
  GetSecureRandomIndex,
  getStep,
  i2osp,
} from "./Misc.js";

function createDigestSHA256(algorithm, hmacKey, counter) {
  const msgBytes = hexToBytes(counter);
  const keyBytes = hexToBytes(hmacKey);

  const hmacHash = hmac(sha256, keyBytes, msgBytes);

  return bytesToHex(hmacHash);
}

function AES_256_CTR_E(Uint8attr, key, RandomBytes) {
  let HashArray = sha256(utf8ToBytes(key));
  let KeyHash = HashArray;

  let TempArray = new Uint8Array(HashArray.byteLength + 2);
  TempArray.set(HashArray, 0);
  TempArray.set([RandomBytes[0], RandomBytes[1]], HashArray.byteLength);
  HashArray = TempArray;

  let HashHashArray = sha256(HashArray);

  let ivArray = new Uint8Array(16);

  for (let i = 0; i < 16; i++) {
    ivArray[i] = HashHashArray[i];
  }

  let nonce = ivArray;
  let msg = Uint8attr;

  let ciphertext_ = AES_CTR(KeyHash, nonce).encrypt(msg);

  return ciphertext_;
}

/**
 * 执行高级AES加密，返回UINT8数组。
 * HMAC签名和AES加密共享同一密钥，符合应用规范。
 * @param{AdvancedEncConfig}AdvancedEncObj 高级加密配置;
 */
function AES_256_CTR_HMAC_SHA256_E(
  Uint8attr,
  key,
  RandomBytes,
  AdvancedEncObj
) {
  let HashArray = sha256(utf8ToBytes(key));
  let KeyHash = HashArray;

  let HMAC_HASH = null;
  let ivArray = new Uint8Array();
  let salt = null;
  let ResultLength = 0;

  //执行AES-256-CTR

  //根据策略，加载强或者弱IV
  if (AdvancedEncObj.UseStrongIV) {
    ivArray = new Uint8Array(16);

    for (let i = 0; i < 16; i++) {
      //加载IV
      ivArray[i] = RandomBytes[i];
    }
  } else {
    let TempArray = new Uint8Array(HashArray.byteLength + 2);
    TempArray.set(HashArray, 0);
    TempArray.set([RandomBytes[0], RandomBytes[1]], HashArray.byteLength);
    HashArray = TempArray;

    let HashHashArray = sha256(HashArray); //密钥两次哈希,附加两字节随机数

    ivArray = new Uint8Array(16);

    for (let i = 0; i < 16; i++) {
      ivArray[i] = HashHashArray[i];
    }
  }

  //执行密钥衍生
  if (AdvancedEncObj.UsePBKDF2) {
    if (AdvancedEncObj.UseTOTP) {
      //TOTP密钥衍生
      totp.options = {
        createDigest: createDigestSHA256,
        algorithm: "sha256",
        encoding: "base64",
        digits: 16,
        epoch: AdvancedEncObj.TOTPEpoch,
        step: getStep(AdvancedEncObj.TOTPTimeStep),
      };

      let BaseKeyHash = sha256(
        AdvancedEncObj.TOTPBaseKey !== null &&
          AdvancedEncObj.TOTPBaseKey !== undefined
          ? utf8ToBytes(AdvancedEncObj.TOTPBaseKey)
          : utf8ToBytes(key)
      );
      salt = totp.generate(Base64.fromUint8Array(BaseKeyHash)); //获取totp一次性密钥
      let key256Bits = pbkdf2(sha256, key, salt, {
        c: 100000,
        dkLen: 32,
      });
      KeyHash = key256Bits;
    } else {
      //普通密钥衍生，使用16字节的盐
      salt = new Uint8Array(16);
      for (let i = 0; i < salt.byteLength; i++) {
        salt[i] = GetSecureRandomIndex(256);
      }
      let key256Bits = pbkdf2(sha256, key, salt, {
        c: 100000,
        dkLen: 32,
      });
      KeyHash = key256Bits;
      ResultLength = ResultLength + 16;
    }
  }

  let iv = ivArray;
  let msg = Uint8attr;

  let Enc = AES_CTR(KeyHash, iv).encrypt(msg);

  //执行HMAC-SHA256
  if (AdvancedEncObj.UseHMAC) {
    let Cipher = Enc;
    HMAC_HASH = hmac(sha256, KeyHash, Cipher);
    ResultLength = ResultLength + 32;
  }

  //组装数据，结构为 [密文]-[HMAC_HASH]-[密钥盐值]-[IV(上层函数EncryptHandler:Encrypt添加)]-[高级加密参数(上上层函数CoreHandler:Enc添加)]
  let CipherTextLength = Enc.byteLength;
  ResultLength = ResultLength + CipherTextLength;

  let EncResult = new Uint8Array(ResultLength); //按长度创建密文数据

  EncResult.set(Enc, 0); //密文，长度随机
  if (AdvancedEncObj.UseHMAC) {
    EncResult.set(HMAC_HASH, CipherTextLength); //HMAC_HASH，长度32字节
  }
  if (AdvancedEncObj.UsePBKDF2 && !AdvancedEncObj.UseTOTP) {
    EncResult.set(
      salt,
      AdvancedEncObj.UseHMAC ? CipherTextLength + 32 : CipherTextLength
    ); //单纯密钥衍生 salt，长度16字节
  }

  return EncResult;
}

/**
 * 执行高级加密模式的解密
 * @param{AdvancedEncConfig}AdvancedEncObj 高级加密配置;
 */
function AES_256_CTR_HMAC_SHA256_D(
  Uint8attr,
  key,
  RandomBytes,
  AdvancedEncObj
) {
  //执行解密操作

  //对密钥执行一重哈希
  let HashArray = sha256(utf8ToBytes(key));
  let KeyHash = HashArray;
  let ivArray = new Uint8Array();

  if (AdvancedEncObj.UseStrongIV) {
    //加载强IV或弱IV
    ivArray = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      ivArray[i] = RandomBytes[i];
    }
  } else {
    let TempArray = new Uint8Array(HashArray.byteLength + 2);
    TempArray.set(HashArray, 0);
    TempArray.set([RandomBytes[0], RandomBytes[1]], HashArray.byteLength);
    HashArray = TempArray;

    let HashHashArray = sha256(HashArray); //密钥两次哈希,附加两字节随机数

    ivArray = new Uint8Array(16);

    for (let i = 0; i < 16; i++) {
      ivArray[i] = HashHashArray[i];
    }
  }

  //尝试获取或推导盐值和衍生密钥
  let salt = new Uint8Array(16);

  if (AdvancedEncObj.UsePBKDF2 && !AdvancedEncObj.UseTOTP) {
    //截取普通盐值
    for (let i = 0; i < 16; i++) {
      salt[15 - i] = Uint8attr.at(Uint8attr.byteLength - 1 - i);
    }
    Uint8attr = Uint8attr.subarray(0, Uint8attr.byteLength - 16);
    let key256Bits = pbkdf2(sha256, key, salt, {
      c: 100000,
      dkLen: 32,
    });
    KeyHash = key256Bits;
  } else if (AdvancedEncObj.UsePBKDF2 && AdvancedEncObj.UseTOTP) {
    //推导TOTP盐值
    totp.options = {
      createDigest: createDigestSHA256,
      algorithm: "sha256",
      encoding: "base64",
      digits: 16,
      epoch: AdvancedEncObj.TOTPEpoch,
      step: getStep(AdvancedEncObj.TOTPTimeStep),
    };
    let BaseKeyHash = sha256(
      AdvancedEncObj.TOTPBaseKey !== null &&
        AdvancedEncObj.TOTPBaseKey !== undefined
        ? utf8ToBytes(AdvancedEncObj.TOTPBaseKey)
        : utf8ToBytes(key)
    );
    salt = totp.generate(Base64.fromUint8Array(BaseKeyHash)); //获取totp一次性密钥
    let key256Bits = pbkdf2(sha256, key, salt, {
      c: 100000,
      dkLen: 32,
    });
    KeyHash = key256Bits;
  }

  if (AdvancedEncObj.UseHMAC) {
    //验证HMAC签名是否完整
    let HMAC_HASH = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      HMAC_HASH[31 - i] = Uint8attr.at(Uint8attr.byteLength - 1 - i);
    }
    Uint8attr = Uint8attr.subarray(0, Uint8attr.byteLength - 32);

    let HMAC_HASH_B = hmac(sha256, KeyHash, Uint8attr);

    if (HMAC_HASH.byteLength != HMAC_HASH_B.byteLength) {
      throw new Error("Error Decrypting. HMAC Mismatch."); // HMAC不匹配，阻止进一步解密
    }

    for (let i = 0; i < HMAC_HASH.byteLength; i++) {
      if (HMAC_HASH[i] != HMAC_HASH_B[i]) {
        throw new Error("Error Decrypting. HMAC Mismatch."); // HMAC不匹配，阻止进一步解密
      }
    }
  }

  let iv = ivArray;
  let msg = Uint8attr;

  let Dec = AES_CTR(KeyHash, iv).encrypt(msg);

  return Dec;
}

//执行AES加密，返回UINT8数组
/**
 * @param{AdvancedEncConfig}AdvancedEncObj 高级加密配置;
 */
export function Encrypt(
  OriginalData,
  key,
  AdvancedEncObj = new AdvancedEncConfig()
) {
  let RandomBytes = new Array(); //取两个随机数作为AES加密的IV
  let TempArray = null;
  if (!AdvancedEncObj.Enable) {
    //执行非高级安全模式的加密
    RandomBytes.push(GetSecureRandomIndex(256));
    RandomBytes.push(GetSecureRandomIndex(256));

    OriginalData = AES_256_CTR_E(OriginalData, key, RandomBytes); //AES-256-CTR加密

    TempArray = new Uint8Array(OriginalData.byteLength + 2);
    TempArray.set(OriginalData, 0);
    TempArray.set(RandomBytes, OriginalData.byteLength); //把IV附加在加密后数据的末尾，解密时提取
  } else {
    //执行高级安全模式的加密
    if (AdvancedEncObj.UseStrongIV) {
      for (let i = 0; i < 16; i++) {
        RandomBytes.push(GetSecureRandomIndex(256)); //获取十六个随机数字作为完整的IV
      }
    } else {
      RandomBytes.push(GetSecureRandomIndex(256));
      RandomBytes.push(GetSecureRandomIndex(256));
    }

    OriginalData = AES_256_CTR_HMAC_SHA256_E(
      OriginalData,
      key,
      RandomBytes,
      AdvancedEncObj
    ); //AES-256-CTR-HMAC-SHA256加密

    if (AdvancedEncObj.UseStrongIV) {
      TempArray = new Uint8Array(OriginalData.byteLength + 16);
      TempArray.set(OriginalData, 0);
      TempArray.set(RandomBytes, OriginalData.byteLength); //把IV附加在加密后数据的末尾，解密时提取
    } else {
      TempArray = new Uint8Array(OriginalData.byteLength + 2);
      TempArray.set(OriginalData, 0);
      TempArray.set(RandomBytes, OriginalData.byteLength); //把IV附加在加密后数据的末尾，解密时提取
    }
  }
  OriginalData = TempArray;
  return OriginalData;
}

export function Decrypt(Data, key, AdvancedEncObj = null) {
  //Data = Base64.toUint8Array(TempStr1);
  if (!AdvancedEncObj) {
    let RandomBytes = [null, null];
    RandomBytes[1] = Data.at(Data.byteLength - 1);
    RandomBytes[0] = Data.at(Data.byteLength - 2);

    Data = Data.subarray(0, Data.byteLength - 2);

    //取到两个字节的IV，然后对AES加密后的数据执行解密。

    Data = AES_256_CTR_E(Data, key, RandomBytes);

    return Data;
  } else {
    let RandomBytes;
    if (AdvancedEncObj.UseStrongIV) {
      //获取IV
      RandomBytes = new Array(16);
      for (let i = 0; i < 16; i++) {
        RandomBytes[15 - i] = Data.at(Data.byteLength - 1 - i);
      }
      Data = Data.subarray(0, Data.byteLength - 16);
    } else {
      RandomBytes = [null, null];
      RandomBytes[1] = Data.at(Data.byteLength - 1);
      RandomBytes[0] = Data.at(Data.byteLength - 2);

      Data = Data.subarray(0, Data.byteLength - 2);

      //取到两个字节的IV，然后对AES加密后的数据执行解密。
    }
    Data = AES_256_CTR_HMAC_SHA256_D(Data, key, RandomBytes, AdvancedEncObj);

    return Data;
  }
}

/**
 * 基于 SHA-256 的 MGF1 实现
 *
 * @param {Uint8Array} seed - 输入的随机种子
 * @param {number} maskLen - 需要生成的掩码目标长度 (字节数)
 * @returns {Uint8Array} - 生成的指定长度的伪随机掩码
 */
export function mgf1_sha256(seed, maskLen) {
  const hLen = 32; // SHA-256 的输出长度固定为 32 字节 (256 bits)

  // RFC 8017 规定: 掩码长度不能超过 2^32 * hLen
  // 在 JS 中处理超大文件时要注意内存限制，通常不会触发这个上限
  if (maskLen > 2 ** 32 * hLen) {
    throw new Error("Mask too long");
  }

  // 预先分配最终输出的内存空间
  const mask = new Uint8Array(maskLen);

  // 计算需要循环调用哈希函数的次数 (向上取整)
  const iterations = Math.ceil(maskLen / hLen);

  let offset = 0; // 记录当前已经填充到 mask 的字节位置

  for (let counter = 0; counter < iterations; counter++) {
    // 1. 将计数器转换为 4 字节的大端序字节串 C
    const C = i2osp(counter);

    // 2. 拼接 seed 和 C (即 RFC 中的 seed || C)
    const dataToHash = new Uint8Array(seed.length + 4);
    dataToHash.set(seed, 0);
    dataToHash.set(C, seed.length);

    // 3. 计算拼接后数据的 SHA-256 哈希值
    // 【注意】这里调用你的自定义/高效 SHA-256 库
    const hashBlock = sha256(dataToHash);

    // 4. 将哈希块拷贝到最终的 mask 数组中
    // 最后一次循环可能不需要完整的 32 字节，计算剩余需要的字节数
    const bytesToCopy = Math.min(hLen, maskLen - offset);

    // 使用 subarray 提取需要的字节，并通过 set 写入目标位置
    mask.set(hashBlock.subarray(0, bytesToCopy), offset);

    offset += bytesToCopy;
  }

  return mask; // 输出生成的掩码流
}

/**
 * AONT(全有或全无转换)函数
 *
 * 使用 4 轮 Feistel 结构实现的 AONT 转换
 *
 * @param {Uint8Array} plain - 输入的原始明文
 * @returns {Uint8Array} - 输出的混淆数据
 */
export function EnAONT(plain) {
  const len = plain.length;
  if (len < 2) {
    /*throw new Error(
      "Insufficient payload length. Payload too short for AONT Feistel split."
    );*/
    return plain; //如果密文太短(长度只有一字节)，无法执行，就自动跳过执行。
  }

  // 动态计算切分点。即使长度为奇数也能完美处理
  const mid = Math.floor(len / 2);
  let L = plain.slice(0, mid);
  let R = plain.slice(mid);

  // 进行 4 轮迭代，确保左右两边的数据实现全局双向扩散
  // 轮函数的种子采用相反侧的数据
  for (let round = 0; round < 4; round++) {
    // 计算当前轮次 R 需要产生的掩码长度（必须等于 L 的长度）
    const mask = mgf1_sha256(R, L.length);

    // 核心异或：L = L ^ F(R)
    for (let i = 0; i < L.length; i++) {
      L[i] ^= mask[i];
    }

    // 左右互换（最后一轮通常不互换，或者解密时注意对称即可，这里每轮都换，解密对应反过来）
    const temp = L;
    L = R;
    R = temp;
  }

  // 拼接并返回结果（保持原始长度不变）
  const result = new Uint8Array(len);
  result.set(L, 0);
  result.set(R, L.length);
  return result;
}

/**
 *
 * AONT(全有或全无转换)函数
 *
 * 使用 4 轮 Feistel 结构实现的 AONT 逆转换
 *
 * @param {Uint8Array} cipher - 输入的混淆数据
 * @returns {Uint8Array} - 还原后的原始明文
 */
export function DeAONT(cipher) {
  const len = cipher.length;
  if (len < 2) {
    /*throw new Error(
      "Insufficient payload length. Payload too short for AONT Feistel split."
    );*/
    return cipher; //如果密文太短(长度只有一字节)，无法执行，就自动跳过执行。
  }

  // 按照正向相同的切分点切分
  const mid = Math.floor(len / 2);
  let L = cipher.slice(0, mid);
  let R = cipher.slice(mid);

  // 逆向迭代：轮数和正向完全一致，但数据处理顺序必须严格相反
  // 正向最后一步拼接的是 (L, R)，所以逆向开始时的 L 和 R 对应正向结束时的状态
  for (let round = 3; round >= 0; round--) {
    // 先进行左右互换，倒推回上一轮结束的状态
    const temp = L;
    L = R;
    R = temp;

    // 重新计算当时 R 侧产生的掩码
    const mask = mgf1_sha256(R, L.length);

    // 再次异或即可逆转：(L ^ mask) ^ mask = L
    for (let i = 0; i < L.length; i++) {
      L[i] ^= mask[i];
    }
  }

  // 拼接还原出最原始的明文
  const plain = new Uint8Array(len);
  plain.set(L, 0);
  plain.set(R, L.length);
  return plain;
}
