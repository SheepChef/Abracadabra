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

import { sha256 } from "@noble/hashes/sha2.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";
import { wordArrayToUint8Array } from "./Misc.js";
import { CallbackObj } from "./CoreHandler.js";

export class RoundObfus {
  constructor(key, callback = null) {
    this.RoundFlip = 0; //标志现在到哪了
    this.RoundControl = new Uint8Array(32); //一个数组，用密钥哈希来控制轮转的行为
    this.LETTERS_ROUND_1 =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.LETTERS_ROUND_2 =
      "FbPoDRStyJKAUcdahfVXlqwnOGpHZejzvmrBCigQILxkYMuWTEsN"; //手动随机打乱的乱序轮
    this.LETTERS_ROUND_3 =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.NUMBERSYMBOL_ROUND_1 = "1234567890+/=";
    this.NUMBERSYMBOL_ROUND_2 = "5=0764+389/12"; //手动随机打乱的乱序轮
    this.NUMBERSYMBOL_ROUND_3 = "1234567890+/=";

    this.Normal_Characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/=1234567890"; //表内有映射的所有字符组成的字符串
    this.LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    this.BIG_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.NUMBERS = "1234567890";
    this.SYMBOLS = "+/=";
    this.NUMBERSYMBOL = "0123456789+/=";

    this.NULL_STR = "孎"; //默认忽略的占位字符，一个生僻字。

    this.callback = callback;

    //初始化转轮操作的数组
    let HashArray = sha256(utf8ToBytes(key));

    this.RoundControl = HashArray;

    //保存转轮初始状态
    this.LETTERS_ROUND_1_ORIGINAL = this.LETTERS_ROUND_1;
    this.LETTERS_ROUND_2_ORIGINAL = this.LETTERS_ROUND_2;
    this.LETTERS_ROUND_3_ORIGINAL = this.LETTERS_ROUND_3;
    this.NUMBERSYMBOL_ROUND_1_ORIGINAL = this.NUMBERSYMBOL_ROUND_1;
    this.NUMBERSYMBOL_ROUND_2_ORIGINAL = this.NUMBERSYMBOL_ROUND_2;
    this.NUMBERSYMBOL_ROUND_3_ORIGINAL = this.NUMBERSYMBOL_ROUND_3;
    this.lettersOffset1 = 0;
    this.lettersOffset2 = 0;
    this.lettersOffset3 = 0;
    this.numSymOffset1 = 0;
    this.numSymOffset2 = 0;
    this.numSymOffset3 = 0;
  }

  _rotateString(str, n) {
    // 向右轮转指定位数
    return str.slice(n) + str.slice(0, n);
  }

  _LrotateString(str, n) {
    // 向左轮转指定位数
    return str.slice(str.length - n) + str.slice(0, str.length - n);
  }
  RoundKeyMatch(keyIn) {
    // //查询轮换密钥的键值
    let idx1 = this.LETTERS.indexOf(keyIn);
    let idx2 = this.NUMBERSYMBOL.indexOf(keyIn);

    if (idx1 != -1) {
      let char1 =
        this.LETTERS_ROUND_1_ORIGINAL[(idx1 + this.lettersOffset1) % 52];
      let idx1_1 = this.LETTERS.indexOf(char1);
      let char2 =
        this.LETTERS_ROUND_2_ORIGINAL[(idx1_1 + this.lettersOffset2) % 52];
      let idx1_2 = this.LETTERS.indexOf(char2);
      return this.LETTERS_ROUND_3_ORIGINAL[(idx1_2 + this.lettersOffset3) % 52];
    } else if (idx2 != -1) {
      let l2 = this.NUMBERSYMBOL.length;
      let char1 =
        this.NUMBERSYMBOL_ROUND_1_ORIGINAL[(idx2 + this.numSymOffset1) % l2];
      let idx2_1 = this.NUMBERSYMBOL.indexOf(char1);
      let char2 =
        this.NUMBERSYMBOL_ROUND_2_ORIGINAL[(idx2_1 + this.numSymOffset2) % l2];
      let idx2_2 = this.NUMBERSYMBOL.indexOf(char2);
      return this.NUMBERSYMBOL_ROUND_3_ORIGINAL[
        (idx2_2 + this.numSymOffset3) % l2
      ];
    }
    return this.NULL_STR;
  }

  DRoundKeyMatch(keyIn) {
    //查询轮换密钥的键值
    let orig_idx1 = this.LETTERS_ROUND_3_ORIGINAL.indexOf(keyIn);
    let orig_idx2 = this.NUMBERSYMBOL_ROUND_3_ORIGINAL.indexOf(keyIn);

    if (orig_idx1 != -1) {
      let idx1 = (orig_idx1 - this.lettersOffset3 + 52) % 52;
      let char1 = this.LETTERS[idx1];
      let orig_idx2_str = this.LETTERS_ROUND_2_ORIGINAL.indexOf(char1);
      let idx1_1 = (orig_idx2_str - this.lettersOffset2 + 52) % 52;
      let char1_1 = this.LETTERS[idx1_1];
      let orig_idx1_str = this.LETTERS_ROUND_1_ORIGINAL.indexOf(char1_1);
      let idx1_2 = (orig_idx1_str - this.lettersOffset1 + 52) % 52;
      return this.LETTERS[idx1_2];
    } else if (orig_idx2 != -1) {
      let l2 = this.NUMBERSYMBOL.length;
      let idx2 = (orig_idx2 - this.numSymOffset3 + l2) % l2;
      let char2 = this.NUMBERSYMBOL[idx2];
      let orig_idx2_str = this.NUMBERSYMBOL_ROUND_2_ORIGINAL.indexOf(char2);
      let idx2_1 = (orig_idx2_str - this.numSymOffset2 + l2) % l2;
      let char2_1 = this.NUMBERSYMBOL[idx2_1];
      let orig_idx1_str = this.NUMBERSYMBOL_ROUND_1_ORIGINAL.indexOf(char2_1);
      let idx2_2 = (orig_idx1_str - this.numSymOffset1 + l2) % l2;
      return this.NUMBERSYMBOL[idx2_2];
    }
    return this.NULL_STR;
  }

  RoundKey() {
    let ControlNum = 0;
    if (this.RoundFlip == 32) {
      this.RoundFlip = 0;
    }
    ControlNum = this.RoundControl[this.RoundFlip] % 10; //哈希字节对十取余即操作数
    if (ControlNum == 0) {
      //等于零就赋值为10
      ControlNum = 10;
    }

    let l2 = this.NUMBERSYMBOL.length;

    //不再直接操作字符串，而是操作偏移量数组，这是操作字符串的等效实现，但是效率显著更好。

    if (ControlNum % 2 == 0) {
      //操作数是偶数
      this.lettersOffset1 = (this.lettersOffset1 + 6) % 52; //将第一个密钥轮向右轮6位
      this.numSymOffset1 = (this.numSymOffset1 + 6) % l2;

      this.lettersOffset2 = (this.lettersOffset2 - ControlNum + 52) % 52; //将第二个密钥轮向左轮 ControlNum 位
      this.numSymOffset2 = (this.numSymOffset2 - ControlNum + l2) % l2;

      this.lettersOffset3 =
        (this.lettersOffset3 + Math.floor(ControlNum / 2) + 1) % 52; //将第三个密钥轮向右轮ControlNum/2+1位
      this.numSymOffset3 =
        (this.numSymOffset3 + Math.floor(ControlNum / 2) + 1) % l2;
    } else {
      //操作数是奇数
      this.lettersOffset1 = (this.lettersOffset1 - 3 + 52) % 52; //将第一个密钥轮向左轮3位
      this.numSymOffset1 = (this.numSymOffset1 - 3 + l2) % l2;

      this.lettersOffset2 = (this.lettersOffset2 + ControlNum) % 52; //将第二个密钥轮向右轮ControlNum位
      this.numSymOffset2 = (this.numSymOffset2 + ControlNum) % l2;

      this.lettersOffset3 =
        (this.lettersOffset3 - Math.floor((ControlNum + 7) / 2) + 52) % 52; //将第三个密钥轮向左轮(ControlNum+7)/2位
      this.numSymOffset3 =
        (this.numSymOffset3 - Math.floor((ControlNum + 7) / 2) + l2) % l2;
    }
    this.RoundFlip++;
    try {
      if (this.callback != null)
        this.callback(
          new CallbackObj("ROUNDS", [
            this.LETTERS_ROUND_1,
            this.LETTERS_ROUND_2,
            this.LETTERS_ROUND_3,
            this.NUMBERSYMBOL_ROUND_1,
            this.NUMBERSYMBOL_ROUND_2,
            this.NUMBERSYMBOL_ROUND_3,
          ])
        );
    } catch (err) {
      // continue regardless of error
    }
  }

  RoundReset() {
    //转轮复位
    this.lettersOffset1 = 0;
    this.lettersOffset2 = 0;
    this.lettersOffset3 = 0;
    this.numSymOffset1 = 0;
    this.numSymOffset2 = 0;
    this.numSymOffset3 = 0;
    this.RoundFlip = 0;
  }
}

export class RoundObfusOLD {
  constructor(key) {
    this.RoundFlip = 0; //标志现在到哪了
    this.RoundControl = new Uint8Array(32); //一个数组，用密钥哈希来控制轮转的行为
    this.LETTERS_ROUND_1 =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.LETTERS_ROUND_2 =
      "FbPoDRStyJKAUcdahfVXlqwnOGpHZejzvmrBCigQILxkYMuWTEsN"; //手动随机打乱的乱序轮
    this.LETTERS_ROUND_3 =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.NUMBERSYMBOL_ROUND_1 = "1234567890+=_-/?.>,<|`~!@#$%^&*(){}[];:";
    this.NUMBERSYMBOL_ROUND_2 = "~3{8}_-$[6(2^&#5|1*%0,<9:`+@7/?.>4=];!)"; //手动随机打乱的乱序轮
    this.NUMBERSYMBOL_ROUND_3 = "1234567890+=_-/?.>,<|`~!@#$%^&*(){}[];:";

    this.Normal_Characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+=_-/?.>,<|`~!@#$%^&*(){}[];:1234567890"; //表内有映射的所有字符组成的字符串
    this.LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    this.BIG_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.NUMBERS = "1234567890";
    this.SYMBOLS = "+=_-/?.>,<|`~!@#$%^&*(){}[];:";
    this.NUMBERSYMBOL = "1234567890+=_-/?.>,<|`~!@#$%^&*(){}[];:";

    this.NULL_STR = "孎"; //默认忽略的占位字符，一个生僻字。
    //初始化转轮操作的数组
    let HashArray = sha256(utf8ToBytes(key));

    this.RoundControl = HashArray;
  }

  _rotateString(str, n) {
    // 向右轮转指定位数
    return str.slice(n) + str.slice(0, n);
  }

  _LrotateString(str, n) {
    // 向左轮转指定位数
    return str.slice(str.length - n) + str.slice(0, str.length - n);
  }
  RoundKeyMatch(keyIn) {
    //查询轮换密钥的键值
    let idx1, idx2;
    let idx1_1, idx2_1;
    let idx1_2, idx2_2;

    idx1 = this.LETTERS.indexOf(keyIn);
    idx2 = this.NUMBERSYMBOL.indexOf(keyIn);

    idx1_1 = this.LETTERS.indexOf(this.LETTERS_ROUND_1[idx1]);
    idx2_1 = this.NUMBERSYMBOL.indexOf(this.NUMBERSYMBOL_ROUND_1[idx2]);

    idx1_2 = this.LETTERS.indexOf(this.LETTERS_ROUND_2[idx1_1]);
    idx2_2 = this.NUMBERSYMBOL.indexOf(this.NUMBERSYMBOL_ROUND_2[idx2_1]);

    if (idx1 != -1) {
      //判断给定字符的类型
      return this.LETTERS_ROUND_3[idx1_2];
    } else if (idx2 != -1) {
      return this.NUMBERSYMBOL_ROUND_3[idx2_2];
    }
    return this.NULL_STR;
  }

  DRoundKeyMatch(keyIn) {
    //查询轮换密钥的键值
    let idx1, idx2;
    let idx1_1, idx2_1;
    let idx1_2, idx2_2;

    idx1 = this.LETTERS_ROUND_3.indexOf(keyIn);
    idx2 = this.NUMBERSYMBOL_ROUND_3.indexOf(keyIn);

    idx1_1 = this.LETTERS_ROUND_2.indexOf(this.LETTERS[idx1]);
    idx2_1 = this.NUMBERSYMBOL_ROUND_2.indexOf(this.NUMBERSYMBOL[idx2]);

    idx1_2 = this.LETTERS_ROUND_1.indexOf(this.LETTERS[idx1_1]);
    idx2_2 = this.NUMBERSYMBOL_ROUND_1.indexOf(this.NUMBERSYMBOL[idx2_1]);

    if (idx1 != -1) {
      //判断给定字符的类型
      return this.LETTERS[idx1_2];
    } else if (idx2 != -1) {
      return this.NUMBERSYMBOL[idx2_2];
    }
    return this.NULL_STR;
  }

  RoundKey() {
    let ControlNum = 0;
    if (this.RoundFlip == 32) {
      this.RoundFlip = 0;
    }
    ControlNum = this.RoundControl[this.RoundFlip] % 10; //哈希字节对十取余即操作数
    if (ControlNum == 0) {
      //等于零就赋值为10
      ControlNum = 10;
    }

    if (ControlNum % 2 == 0) {
      //操作数是偶数
      this.LETTERS_ROUND_1 = this._rotateString(this.LETTERS_ROUND_1, 6); //将第一个密钥轮向右轮6位
      this.NUMBERSYMBOL_ROUND_1 = this._rotateString(
        this.NUMBERSYMBOL_ROUND_1,
        6
      );

      this.LETTERS_ROUND_2 = this._LrotateString(
        this.LETTERS_ROUND_2,
        ControlNum * 2
      ); //将第二个密钥轮向左轮ControlNum*2位
      this.NUMBERSYMBOL_ROUND_2 = this._LrotateString(
        this.NUMBERSYMBOL_ROUND_2,
        ControlNum * 2
      );

      this.LETTERS_ROUND_3 = this._rotateString(
        this.LETTERS_ROUND_3,
        ControlNum / 2 + 1
      ); //将第三个密钥轮向右轮ControlNum/2+1位
      this.NUMBERSYMBOL_ROUND_3 = this._rotateString(
        this.NUMBERSYMBOL_ROUND_3,
        ControlNum / 2 + 1
      );
    } else {
      //操作数是奇数
      this.LETTERS_ROUND_1 = this._LrotateString(this.LETTERS_ROUND_1, 3); //将第一个密钥轮向左轮3位
      this.NUMBERSYMBOL_ROUND_1 = this._LrotateString(
        this.NUMBERSYMBOL_ROUND_1,
        3
      );

      this.LETTERS_ROUND_2 = this._rotateString(
        this.LETTERS_ROUND_2,
        ControlNum
      ); //将第二个密钥轮向右轮ControlNum位
      this.NUMBERSYMBOL_ROUND_2 = this._rotateString(
        this.NUMBERSYMBOL_ROUND_2,
        ControlNum
      );

      this.LETTERS_ROUND_3 = this._LrotateString(
        this.LETTERS_ROUND_3,
        (ControlNum + 7) / 2
      ); //将第三个密钥轮向左轮(ControlNum+5)/2位
      this.NUMBERSYMBOL_ROUND_3 = this._LrotateString(
        this.NUMBERSYMBOL_ROUND_3,
        (ControlNum + 7) / 2
      );
    }
    this.RoundFlip++;
  }
}
