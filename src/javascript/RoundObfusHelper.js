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
    let KeyHash = CryptoJS.SHA256(key);
    let HashArray = wordArrayToUint8Array(KeyHash);

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
        ControlNum
      ); //将第二个密钥轮向左轮ControlNum*2位
      this.NUMBERSYMBOL_ROUND_2 = this._LrotateString(
        this.NUMBERSYMBOL_ROUND_2,
        ControlNum
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
    } catch (err) {}
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
    let KeyHash = CryptoJS.SHA256(key);
    let HashArray = wordArrayToUint8Array(KeyHash);

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
