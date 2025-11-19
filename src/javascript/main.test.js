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

import { expect, test, bench } from "vitest";

import { Abracadabra } from "./main";

const Rand = Math.random() * 100000000000;
const TestString = Rand.toString();

const TestLinks = [
  "https://pan.baidu.com",
  "https://drive.google.com",
  "https://bilibili.com",
  "https://twitter.com",
  "https://github.com",
  "https://pixiv.net",
  "https://bangumi.moe",
  "magnet:?xt=urn:btih:C0FE00AD10B9D9A90A0750D1B5B9F6C6B8F2F5B6",
  "https://test.cn",
  "https://test.cc",
  "https://test.jp",
  "https://test.one",
];

function generateRandomUint8Array(length) {
  // 创建一个指定长度的 Uint8Array
  const uint8Array = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    uint8Array[i] = Math.floor(Math.random() * 256);
  }

  return uint8Array;
}

const TestData = [
  generateRandomUint8Array(1000),
  generateRandomUint8Array(2048),
];

test("加/解密测试", { timeout: 15000 }, () => {
  const Abra = new Abracadabra();
  let TestTemp = TestString;
  let TestTemp2 = TestString;
  let TestTemp3 = TestString;

  //将随机字符串用仿真加密循环加/解密6次，判断一致性和中途是否出错。
  for (let i = 0; i <= 6; i++) {
    Abra.WenyanInput(
      TestTemp,
      "ENCRYPT",
      "ABRACADABRA",
      {
        PunctuationMark: i % 2 == 0,
        RandomIndex: 50,
        PianwenMode: i % 2 == 0,
        LogicMode: i % 2 != 0,
        Traditional: i % 2 != 0,
      },
      i % 2 != 0
    );
    TestTemp = Abra.Output();
  }

  for (let i = 0; i <= 6; i++) {
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA");
    TestTemp = Abra.Output();
  }

  //将随机字符串用传统加密循环加/解密6次，判断一致性和中途是否出错。
  for (let i = 0; i <= 6; i++) {
    Abra.OldInput(TestTemp2, "ENCRYPT", "ABRACADABRA", true);
    TestTemp2 = Abra.Output();
  }

  for (let i = 0; i <= 6; i++) {
    Abra.OldInput(TestTemp2, "DECRYPT", "ABRACADABRA");
    TestTemp2 = Abra.Output();
  }
  expect(TestTemp).toBe(TestString);
  expect(TestTemp2).toBe(TestString);

  //测试传统加密标志位

  Abra.OldInput(TestTemp3, "AUTO", "ABRACADABRA");
  TestTemp3 = Abra.Output();
  Abra.OldInput(TestTemp3, "AUTO", "ABRACADABRA");
  TestTemp3 = Abra.Output();

  expect(TestTemp3).toBe(TestString);
});

test("链接压缩测试", { timeout: 15000 }, () => {
  //测试链接压缩。
  const Abra = new Abracadabra();

  TestLinks.forEach((item) => {
    //测试不同链接的加解密一致性
    let TestTemp = "";
    let TestTemp2 = "";
    Abra.WenyanInput(item, "ENCRYPT", "ABRACADABRA", {
      RandomIndex: 100,
    });
    TestTemp = Abra.Output();
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA");
    TestTemp = Abra.Output();

    Abra.OldInput(item, "ENCRYPT", "ABRACADABRA", true);
    TestTemp2 = Abra.Output();
    Abra.OldInput(TestTemp2, "DECRYPT", "ABRACADABRA");
    TestTemp2 = Abra.Output();

    expect(TestTemp).toBe(item);
    expect(TestTemp2).toBe(item);
  });
});

test("随机数据加密测试", { timeout: 15000 }, () => {
  //测试随机数据的加密。
  const Abra = new Abracadabra("UINT8", "UINT8");

  TestData.forEach((data) => {
    let TestTemp;
    let TestTemp2;
    let TestTemp3;
    Abra.WenyanInput(data, "ENCRYPT", "ABRACADABRA", {
      RandomIndex: 100,
    });
    TestTemp = Abra.Output();
    Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA");
    TestTemp = Abra.Output();

    Abra.OldInput(data, "ENCRYPT", "ABRACADABRA", true);
    TestTemp2 = Abra.Output();
    Abra.OldInput(TestTemp2, "DECRYPT", "ABRACADABRA");
    TestTemp2 = Abra.Output();

    //传统模式，自动判别
    Abra.OldInput(data, "AUTO", "ABRACADABRA");
    TestTemp3 = Abra.Output();
    Abra.OldInput(TestTemp3, "AUTO", "ABRACADABRA");
    TestTemp3 = Abra.Output();

    expect(TestTemp).toStrictEqual(data);
    expect(TestTemp2).toStrictEqual(data);
    expect(TestTemp3).toStrictEqual(data);
  });
});
