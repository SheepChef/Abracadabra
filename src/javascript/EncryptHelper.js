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
import CryptoJS from "crypto-js";
import { Base64 } from "js-base64";
import { authenticator, totp, hotp } from "./otplib.d.ts";
import {
  wordArrayToUint8Array,
  Uint8ArrayTostring,
  GetRandomIndex,
  getStep,
} from "./Misc.js";
import { AdvancedEncConfig } from "./CoreHandler.js";

function createDigestSHA256(algorithm, hmacKey, counter) {
  let msg = CryptoJS.enc.Hex.parse(counter);
  let key = CryptoJS.enc.Hex.parse(hmacKey);
  let HMAC_HASH = CryptoJS.HmacSHA256(msg, key);

  return CryptoJS.enc.Hex.stringify(HMAC_HASH);
}

function AES_256_CTR_E(Uint8attr, key, RandomBytes) {
  let KeyHash = CryptoJS.SHA256(key);
  let HashArray = wordArrayToUint8Array(KeyHash);

  let TempArray = new Uint8Array(HashArray.byteLength + 2);
  TempArray.set(HashArray, 0);
  TempArray.set([RandomBytes[0], RandomBytes[1]], HashArray.byteLength);
  HashArray = TempArray;

  let HashWithRandom = CryptoJS.lib.WordArray.create(HashArray);
  let KeyHashHash = CryptoJS.SHA256(HashWithRandom); //密钥两次哈希,附加两字节随机数
  let HashHashArray = wordArrayToUint8Array(KeyHashHash);

  let ivArray = new Uint8Array(16);

  for (let i = 0; i < 16; i++) {
    ivArray[i] = HashHashArray[i];
  }

  let iv = CryptoJS.lib.WordArray.create(ivArray);
  let msg = CryptoJS.lib.WordArray.create(Uint8attr);

  let Enc = CryptoJS.AES.encrypt(msg, KeyHash, {
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.NoPadding,
    iv: iv,
  });
  return wordArrayToUint8Array(Enc.ciphertext);
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
  let KeyHash = CryptoJS.SHA256(key);
  let HashArray = wordArrayToUint8Array(KeyHash);
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

    let HashWithRandom = CryptoJS.lib.WordArray.create(HashArray);
    let KeyHashHash = CryptoJS.SHA256(HashWithRandom); //密钥两次哈希,附加两字节随机数
    let HashHashArray = wordArrayToUint8Array(KeyHashHash);

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
      let BaseKeyHash = CryptoJS.SHA256(
        AdvancedEncObj.TOTPBaseKey !== null &&
          AdvancedEncObj.TOTPBaseKey !== undefined
          ? AdvancedEncObj.TOTPBaseKey
          : key
      );
      salt = totp.generate(BaseKeyHash.toString(CryptoJS.enc.Base64)); //获取totp一次性密钥
      let key256Bits = CryptoJS.PBKDF2(key, salt, {
        keySize: 256 / 32,
        iterations: 100000, //十万次迭代
      });
      KeyHash = key256Bits;
    } else {
      //普通密钥衍生，使用16字节的盐
      salt = CryptoJS.lib.WordArray.random(16);
      let key256Bits = CryptoJS.PBKDF2(key, salt, {
        keySize: 256 / 32,
        iterations: 100000, //十万次迭代
      });
      KeyHash = key256Bits;
      ResultLength = ResultLength + 16;
    }
  }

  let iv = CryptoJS.lib.WordArray.create(ivArray);
  let msg = CryptoJS.lib.WordArray.create(Uint8attr);

  let Enc = CryptoJS.AES.encrypt(msg, KeyHash, {
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.NoPadding,
    iv: iv,
  });

  //执行HMAC-SHA256
  if (AdvancedEncObj.UseHMAC) {
    let Cipher = wordArrayToUint8Array(Enc.ciphertext);
    Cipher = CryptoJS.lib.WordArray.create(Cipher);
    HMAC_HASH = CryptoJS.HmacSHA256(Cipher, KeyHash);
    ResultLength = ResultLength + 32;
  }

  //组装数据，结构为 [密文]-[HMAC_HASH]-[密钥盐值]-[IV(上层函数添加)]-[高级加密参数]
  let CipherTextLength = wordArrayToUint8Array(Enc.ciphertext).byteLength;
  ResultLength = ResultLength + CipherTextLength;

  let EncResult = new Uint8Array(ResultLength); //按长度创建密文数据

  EncResult.set(wordArrayToUint8Array(Enc.ciphertext), 0); //密文，长度随机
  if (AdvancedEncObj.UseHMAC) {
    EncResult.set(wordArrayToUint8Array(HMAC_HASH), CipherTextLength); //HMAC_HASH，长度32字节
  }
  if (AdvancedEncObj.UsePBKDF2 && !AdvancedEncObj.UseTOTP) {
    EncResult.set(
      wordArrayToUint8Array(salt),
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
  let KeyHash = CryptoJS.SHA256(key);
  let HashArray = wordArrayToUint8Array(KeyHash);
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

    let HashWithRandom = CryptoJS.lib.WordArray.create(HashArray);
    let KeyHashHash = CryptoJS.SHA256(HashWithRandom); //密钥两次哈希,附加两字节随机数
    let HashHashArray = wordArrayToUint8Array(KeyHashHash);

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
    let key256Bits = CryptoJS.PBKDF2(key, CryptoJS.lib.WordArray.create(salt), {
      keySize: 256 / 32,
      iterations: 100000, //十万次迭代
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
    let BaseKeyHash = CryptoJS.SHA256(
      AdvancedEncObj.TOTPBaseKey !== null &&
        AdvancedEncObj.TOTPBaseKey !== undefined
        ? AdvancedEncObj.TOTPBaseKey
        : key
    );
    salt = totp.generate(BaseKeyHash.toString(CryptoJS.enc.Base64)); //获取totp一次性密钥
    let key256Bits = CryptoJS.PBKDF2(key, salt, {
      keySize: 256 / 32,
      iterations: 100000, //十万次迭代
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

    let ciphertext = CryptoJS.lib.WordArray.create(Uint8attr);

    let HMAC_HASH_B = wordArrayToUint8Array(
      CryptoJS.HmacSHA256(ciphertext, KeyHash)
    );

    if (HMAC_HASH.byteLength != HMAC_HASH_B.byteLength) {
      throw "Error Decrypting. HMAC Mismatch."; // HMAC不匹配，阻止进一步解密
    }

    for (let i = 0; i < HMAC_HASH.byteLength; i++) {
      if (HMAC_HASH[i] != HMAC_HASH_B[i]) {
        throw "Error Decrypting. HMAC Mismatch."; // HMAC不匹配，阻止进一步解密
      }
    }
  }

  let iv = CryptoJS.lib.WordArray.create(ivArray);
  let msg = CryptoJS.lib.WordArray.create(Uint8attr);

  let Dec = CryptoJS.AES.encrypt(msg, KeyHash, {
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.NoPadding,
    iv: iv,
  });

  return wordArrayToUint8Array(Dec.ciphertext);
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
    RandomBytes.push(GetRandomIndex(256));
    RandomBytes.push(GetRandomIndex(256));

    OriginalData = AES_256_CTR_E(OriginalData, key, RandomBytes); //AES-256-CTR加密

    TempArray = new Uint8Array(OriginalData.byteLength + 2);
    TempArray.set(OriginalData, 0);
    TempArray.set(RandomBytes, OriginalData.byteLength); //把IV附加在加密后数据的末尾，解密时提取
  } else {
    //执行高级安全模式的加密
    if (AdvancedEncObj.UseStrongIV) {
      for (let i = 0; i < 16; i++) {
        RandomBytes.push(GetRandomIndex(256)); //获取十六个随机数字作为完整的IV
      }
    } else {
      RandomBytes.push(GetRandomIndex(256));
      RandomBytes.push(GetRandomIndex(256));
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
