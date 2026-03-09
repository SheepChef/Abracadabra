/*
 * Copyright (C) 2026 SheepChef (a.k.a. Haruka Hokuto)
 *
 * 这是一个自由软件。
 * 在遵守AIPL-1.1许可证的前提下，
 * 你可以自由复制，修改，分发，使用它。
 *
 * 查阅 Academic Innovation Protection License(AIPL) 来了解更多 .
 * 本作品应随附一份完整的 AIPL-1.1 许可证全文。
 *
 */

/*
 * ACKNOWLEDGEMENT
 *
 * Copyright (C) 2020 PcMoe(坑晨)
 *
 * 在此致敬萌研社，以及其开发者坑晨。
 * 请勿将本开源档案用作商用，以及任何非法用途
 *
 */

// 透过已知明文攻击得出的字典
// 注意这个词典是顺序有关的，禁止修改顺序。

import pako from "pako";

const xiongyueDict = [
  "食",
  "性",
  "很",
  "雜",
  "既",
  "溫",
  "和",
  "會",
  "誘",
  "捕",
  "動",
  "物",
  "家",
  "住",
  "山",
  "洞",
  "沒",
  "有",
  "冬",
  "眠",
  "偶",
  "爾",
  "襲",
  "擊",
  "人",
  "類",
  "呱",
  "哞",
  "嗄",
  "哈",
  "嘍",
  "啽",
  "唬",
  "咯",
  "呦",
  "嗷",
  "嗡",
  "哮",
  "嗥",
  "嗒",
  "嗚",
  "吖",
  "吃",
  "嗅",
  "嘶",
  "噔",
  "咬",
  "噗",
  "嘿",
  "嚁",
  "噤",
  "囑",
  "非",
  "常",
  "喜",
  "歡",
  "堅",
  "果",
  "魚",
  "肉",
  "蜂",
  "蜜",
  "註",
  "取",
  "象",
  "發",
  "達",
  "你",
  "覺",
  "出",
  "更",
  "盜",
  "森",
  "氏",
  "我",
  "誒",
  "怎",
  "寶",
  "麼",
  "圖",
  "現",
  "破",
  "嚄",
  "告",
  "訴",
  "樣",
  "呆",
  "萌",
  "笨",
  "拙",
  "意",
];

const reverseDict = new Map();
xiongyueDict.forEach((char, idx) => reverseDict.set(char, idx));

// Base91 解码函数
function base91DecodeValues(vals) {
  let b = 0,
    n = 0,
    v = -1;
  const out = [];

  for (let i = 0; i < vals.length; i++) {
    let val = vals[i];
    if (v < 0) {
      v = val;
    } else {
      v += val * 91;
      b |= v << n;
      n += (v & 8191) > 88 ? 13 : 14;
      do {
        out.push(b & 255);
        b >>= 8;
        n -= 8;
      } while (n > 7);
      v = -1;
    }
  }
  if (v + 1) {
    out.push((b | (v << n)) & 255);
  }
  return new Uint8Array(out);
}

//解密主函数
export function decryptXiongyueSync(ciphertext) {
  // 去标头并倒序
  const chars = Array.from(ciphertext.substring(1)).reverse();

  // 查字典恢复 Base91 数值
  const b91Vals = chars.map((char) => {
    if (!reverseDict.has(char)) throw new Error(`非法的熊曰密文字符: ${char}`);
    return reverseDict.get(char);
  });

  // Base91 解码成二进制流
  const deflatedBytes = base91DecodeValues(b91Vals);

  try {
    // Deflate 解压
    const ptBytes = pako.inflateRaw(deflatedBytes);

    // UTF-8 解码
    const textDecoder = new TextDecoder("utf-8");
    return textDecoder.decode(ptBytes);
  } catch (err) {
    throw new Error("损坏的熊曰密文");
  }
}
