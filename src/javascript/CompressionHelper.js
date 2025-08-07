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

import * as Unishox from "./unishox2.js";
import pako from "pako";

import { Uint8ArrayTostring } from "./Misc.js";

const CHINESE_WEBPAN_LIB = [
  "https://",
  "lanzou",
  "pan.quark.cn",
  "pan.baidu.com",
  "aliyundrive.com",
  "123pan.com",
];
const INTER_WEBPAN_LIB = [
  "https://",
  "mypikpak.com",
  "mega.nz",
  "drive.google.com",
  "sharepoint.com",
  "1drv.ms",
];
const CHINESE_WEBSITE_LIB = [
  "https://",
  "baidu.com",
  "b23.tv",
  "bilibili.com",
  "weibo.com",
  "weixin.qq.com",
];
const INTER_WEBSITE_LIB = [
  "https://",
  "google.com",
  "youtube.com",
  "x.com",
  "twitter.com",
  "telegra.ph",
];
const INTER_WEBSITE_LIB_2 = [
  "https://",
  "wikipedia.org",
  "github.com",
  "pages.dev",
  "github.io",
  "netlify.app",
];
const JAPAN_WEBSITE_LIB = [
  "https://",
  "pixiv.net",
  "nicovideo.jp",
  "dlsite.com",
  "line.me",
  "dmm.com",
];
const PIRACY_WEBSITE_LIB = [
  "https://",
  "nyaa.si",
  "bangumi.moe",
  "thepiratebay.org",
  "e-hentai.org",
  "exhentai.org",
];
const GENERIC_TLINK_LIB = [
  "https://",
  "magnet:?xt=urn:btih:",
  "magnet:?xt=urn:sha1:",
  "ed2k://",
  "thunder://",
  "torrent",
];
const GENERIC_LINK_LIB_1 = ["https://", ".cn", ".com", ".net", ".org", ".xyz"];
const GENERIC_LINK_LIB_2 = ["https://", ".info", ".moe", ".cc", ".co", ".dev"];
const GENERIC_LINK_LIB_3 = ["https://", ".io", ".us", ".eu", ".jp", ".de"];
const GENERIC_LINK_LIB_4 = [
  "https://",
  ".top",
  ".one",
  ".online",
  ".me",
  ".ca",
];

function GZIP_COMPRESS(Data) {
  let DataOutput = pako.gzip(Data);

  if (DataOutput.byteLength >= Data.byteLength) {
    return Data;
  }
  return DataOutput;
}
function GZIP_DECOMPRESS(Data) {
  const firstTwoBytes = new Uint8Array(Data.buffer, 0, 2);
  if (firstTwoBytes[0] === 0x1f && firstTwoBytes[1] === 0x8b) {
    // Likely compressed with gzip
    let DataOutput = pako.ungzip(Data);
    return DataOutput;
  } else {
    return Data;
  }
}
function UNISHOX_COMPRESS(Data) {
  let CompressedStrCharArray = new Uint8Array(2048);
  let Datastr = Uint8ArrayTostring(Data);
  let libmark = 255;

  for (let i = 1; i < 6; i++) {
    if (Datastr.indexOf(CHINESE_WEBPAN_LIB[i]) != -1) {
      libmark = 254;
      break;
    }
    if (Datastr.indexOf(INTER_WEBPAN_LIB[i]) != -1) {
      libmark = 245;
      break;
    }
  }
  if (libmark == 255) {
    for (let i = 1; i < 6; i++) {
      if (Datastr.indexOf(CHINESE_WEBSITE_LIB[i]) != -1) {
        libmark = 253;
        break;
      }
      if (Datastr.indexOf(INTER_WEBSITE_LIB[i]) != -1) {
        libmark = 252;
        break;
      }
      if (Datastr.indexOf(INTER_WEBSITE_LIB_2[i]) != -1) {
        libmark = 244;
        break;
      }
      if (Datastr.indexOf(JAPAN_WEBSITE_LIB[i]) != -1) {
        libmark = 251;
        break;
      }
      if (Datastr.indexOf(PIRACY_WEBSITE_LIB[i]) != -1) {
        libmark = 250;
        break;
      }
    }
  }
  if (libmark == 255) {
    for (let i = 1; i < 6; i++) {
      if (Datastr.indexOf(GENERIC_TLINK_LIB[i]) != -1) {
        libmark = 249;
        break;
      }
      if (Datastr.indexOf(GENERIC_LINK_LIB_1[i]) != -1) {
        libmark = 248;
        break;
      }
      if (Datastr.indexOf(GENERIC_LINK_LIB_2[i]) != -1) {
        libmark = 247;
        break;
      }
      if (Datastr.indexOf(GENERIC_LINK_LIB_3[i]) != -1) {
        libmark = 246;
        break;
      }
      if (Datastr.indexOf(GENERIC_LINK_LIB_4[i]) != -1) {
        libmark = 243;
        break;
      }
    }
  }

  let Outlen;
  switch (libmark) {
    case 255:
      Outlen = Unishox.unishox2_compress_simple(
        Data,
        Data.byteLength,
        CompressedStrCharArray
      );
      break;
    case 254:
      Outlen = Unishox.unishox2_compress_simple(
        Data,
        Data.byteLength,
        CompressedStrCharArray,
        CHINESE_WEBPAN_LIB
      );
      break;
    case 245:
      Outlen = Unishox.unishox2_compress_simple(
        Data,
        Data.byteLength,
        CompressedStrCharArray,
        INTER_WEBPAN_LIB
      );
      break;
    case 253:
      Outlen = Unishox.unishox2_compress_simple(
        Data,
        Data.byteLength,
        CompressedStrCharArray,
        CHINESE_WEBSITE_LIB
      );
      break;
    case 252:
      Outlen = Unishox.unishox2_compress_simple(
        Data,
        Data.byteLength,
        CompressedStrCharArray,
        INTER_WEBSITE_LIB
      );
      break;
    case 244:
      Outlen = Unishox.unishox2_compress_simple(
        Data,
        Data.byteLength,
        CompressedStrCharArray,
        INTER_WEBSITE_LIB_2
      );
      break;
    case 251:
      Outlen = Unishox.unishox2_compress_simple(
        Data,
        Data.byteLength,
        CompressedStrCharArray,
        JAPAN_WEBSITE_LIB
      );
      break;
    case 250:
      Outlen = Unishox.unishox2_compress_simple(
        Data,
        Data.byteLength,
        CompressedStrCharArray,
        PIRACY_WEBSITE_LIB
      );
      break;
    case 249:
      Outlen = Unishox.unishox2_compress_simple(
        Data,
        Data.byteLength,
        CompressedStrCharArray,
        GENERIC_TLINK_LIB
      );
      break;
    case 248:
      Outlen = Unishox.unishox2_compress_simple(
        Data,
        Data.byteLength,
        CompressedStrCharArray,
        GENERIC_LINK_LIB_1
      );
      break;
    case 247:
      Outlen = Unishox.unishox2_compress_simple(
        Data,
        Data.byteLength,
        CompressedStrCharArray,
        GENERIC_LINK_LIB_2
      );
      break;
    case 246:
      Outlen = Unishox.unishox2_compress_simple(
        Data,
        Data.byteLength,
        CompressedStrCharArray,
        GENERIC_LINK_LIB_3
      );
      break;
    case 243:
      Outlen = Unishox.unishox2_compress_simple(
        Data,
        Data.byteLength,
        CompressedStrCharArray,
        GENERIC_LINK_LIB_4
      );
      break;
  }

  let ResStrCharArray = CompressedStrCharArray.subarray(0, Outlen);
  if (ResStrCharArray.byteLength >= Data.byteLength) {
    return Data;
  }

  let TempArray = new Uint8Array(ResStrCharArray.byteLength + 2);
  TempArray.set(ResStrCharArray, 0);
  TempArray.set([libmark, 255], ResStrCharArray.byteLength);
  ResStrCharArray = TempArray;

  return ResStrCharArray;
}
function UNISHOX_DECOMPRESS(Data) {
  const lastElement = Data[Data.byteLength - 1];
  const secondLastElement = Data[Data.byteLength - 2];

  if (
    lastElement != 255 ||
    secondLastElement < 243 ||
    secondLastElement > 255
  ) {
    return Data;
  }
  let libmark = secondLastElement;
  let NewData = Data.subarray(0, Data.byteLength - 2);

  let DecompressedStrCharArray = new Uint8Array(2048);

  let Outlen;
  switch (libmark) {
    case 255:
      Outlen = Unishox.unishox2_decompress(
        NewData,
        NewData.byteLength,
        DecompressedStrCharArray,
        Unishox.USX_HCODES_DFLT,
        Unishox.USX_HCODE_LENS_DFLT,
        Unishox.USX_FREQ_SEQ_DFLT,
        Unishox.USX_TEMPLATES
      );
      break;
    case 254:
      Outlen = Unishox.unishox2_decompress(
        NewData,
        NewData.byteLength,
        DecompressedStrCharArray,
        Unishox.USX_HCODES_DFLT,
        Unishox.USX_HCODE_LENS_DFLT,
        CHINESE_WEBPAN_LIB,
        Unishox.USX_TEMPLATES
      );
      break;
    case 245:
      Outlen = Unishox.unishox2_decompress(
        NewData,
        NewData.byteLength,
        DecompressedStrCharArray,
        Unishox.USX_HCODES_DFLT,
        Unishox.USX_HCODE_LENS_DFLT,
        INTER_WEBPAN_LIB,
        Unishox.USX_TEMPLATES
      );
      break;
    case 253:
      Outlen = Unishox.unishox2_decompress(
        NewData,
        NewData.byteLength,
        DecompressedStrCharArray,
        Unishox.USX_HCODES_DFLT,
        Unishox.USX_HCODE_LENS_DFLT,
        CHINESE_WEBSITE_LIB,
        Unishox.USX_TEMPLATES
      );
      break;
    case 252:
      Outlen = Unishox.unishox2_decompress(
        NewData,
        NewData.byteLength,
        DecompressedStrCharArray,
        Unishox.USX_HCODES_DFLT,
        Unishox.USX_HCODE_LENS_DFLT,
        INTER_WEBSITE_LIB,
        Unishox.USX_TEMPLATES
      );
      break;
    case 244:
      Outlen = Unishox.unishox2_decompress(
        NewData,
        NewData.byteLength,
        DecompressedStrCharArray,
        Unishox.USX_HCODES_DFLT,
        Unishox.USX_HCODE_LENS_DFLT,
        INTER_WEBSITE_LIB_2,
        Unishox.USX_TEMPLATES
      );
      break;
    case 251:
      Outlen = Unishox.unishox2_decompress(
        NewData,
        NewData.byteLength,
        DecompressedStrCharArray,
        Unishox.USX_HCODES_DFLT,
        Unishox.USX_HCODE_LENS_DFLT,
        JAPAN_WEBSITE_LIB,
        Unishox.USX_TEMPLATES
      );
      break;
    case 250:
      Outlen = Unishox.unishox2_decompress(
        NewData,
        NewData.byteLength,
        DecompressedStrCharArray,
        Unishox.USX_HCODES_DFLT,
        Unishox.USX_HCODE_LENS_DFLT,
        PIRACY_WEBSITE_LIB,
        Unishox.USX_TEMPLATES
      );
      break;
    case 249:
      Outlen = Unishox.unishox2_decompress(
        NewData,
        NewData.byteLength,
        DecompressedStrCharArray,
        Unishox.USX_HCODES_DFLT,
        Unishox.USX_HCODE_LENS_DFLT,
        GENERIC_TLINK_LIB,
        Unishox.USX_TEMPLATES
      );
      break;
    case 248:
      Outlen = Unishox.unishox2_decompress(
        NewData,
        NewData.byteLength,
        DecompressedStrCharArray,
        Unishox.USX_HCODES_DFLT,
        Unishox.USX_HCODE_LENS_DFLT,
        GENERIC_LINK_LIB_1,
        Unishox.USX_TEMPLATES
      );
      break;
    case 247:
      Outlen = Unishox.unishox2_decompress(
        NewData,
        NewData.byteLength,
        DecompressedStrCharArray,
        Unishox.USX_HCODES_DFLT,
        Unishox.USX_HCODE_LENS_DFLT,
        GENERIC_LINK_LIB_2,
        Unishox.USX_TEMPLATES
      );
      break;
    case 246:
      Outlen = Unishox.unishox2_decompress(
        NewData,
        NewData.byteLength,
        DecompressedStrCharArray,
        Unishox.USX_HCODES_DFLT,
        Unishox.USX_HCODE_LENS_DFLT,
        GENERIC_LINK_LIB_3,
        Unishox.USX_TEMPLATES
      );
      break;
    case 243:
      Outlen = Unishox.unishox2_decompress(
        NewData,
        NewData.byteLength,
        DecompressedStrCharArray,
        Unishox.USX_HCODES_DFLT,
        Unishox.USX_HCODE_LENS_DFLT,
        GENERIC_LINK_LIB_4,
        Unishox.USX_TEMPLATES
      );
      break;
  }
  let ResStrCharArray = DecompressedStrCharArray.subarray(0, Outlen);
  return ResStrCharArray;
}

export function Compress(OriginalData) {
  if (OriginalData.byteLength <= 1024) {
    //压缩数据
    let SizeBefore = OriginalData.byteLength;
    OriginalData = UNISHOX_COMPRESS(OriginalData);

    if (OriginalData.byteLength == SizeBefore) {
      OriginalData = GZIP_COMPRESS(OriginalData);
    }
  } else {
    OriginalData = GZIP_COMPRESS(OriginalData);
  }
  return OriginalData;
}

export function Decompress(OriginalData) {
  OriginalData = GZIP_DECOMPRESS(OriginalData);
  OriginalData = UNISHOX_DECOMPRESS(OriginalData);

  return OriginalData;
}
