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
import {
  wordArrayToUint8Array,
  Uint8ArrayTostring,
  GetRandomIndex,
} from "./Misc.js";

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

  for (var i = 0; i < 16; i++) {
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

function AES_256_GCM_E(Uint8attr, key, RandomBytes) {}

function AES_256_GCM_D(Uint8attr, key, RandomBytes) {}

//执行AES加密，返回UINT8数组
export function Encrypt(OriginalData, key, AdvancedEnc = false) {
  let RandomBytes = new Array(); //取两个随机数作为AES加密的IV
  RandomBytes.push(GetRandomIndex(256));
  RandomBytes.push(GetRandomIndex(256));

  OriginalData = AES_256_CTR_E(OriginalData, key, RandomBytes); //AES加密

  let TempArray = new Uint8Array(OriginalData.byteLength + 2);
  TempArray.set(OriginalData, 0);
  TempArray.set(RandomBytes, OriginalData.byteLength); //把IV附加在加密后数据的末尾，解密时提取
  OriginalData = TempArray;
  return OriginalData;
}

export function Decrypt(Data, key, AdvancedEnc = false) {
  //Data = Base64.toUint8Array(TempStr1);
  let RandomBytes = [null, null];
  RandomBytes[1] = Data.at(Data.byteLength - 1);
  RandomBytes[0] = Data.at(Data.byteLength - 2);

  Data = Data.subarray(0, Data.byteLength - 2);

  //取到两个字节的IV，然后对AES加密后的数据执行解密。

  Data = AES_256_CTR_E(Data, key, RandomBytes);

  return Data;
}
