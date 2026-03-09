---
layout: home

hero:
  name: "魔曰"
  text: "以文封缄"
  tagline: Abracadabra 魔曰 是安全，高效的文本加密工具，可以将数据加密为汉字构成的文言文。
  image:
    src: /logo.png
    alt: Abracadabra
  actions:
    - theme: brand
      text: 快速开始 →
      link: document/quick-start.md
    - theme: alt
      text: GitHub仓库
      link: https://github.com/SheepChef/Abracadabra

features:
  - icon: 🪄
    title: 惟妙惟肖
    details: 魔曰的密文看起来像逼真的古文，用算法构造字面意义，使加密具有文学色彩。
  - icon: 🔐
    title: 固若金汤
    details: 魔曰重视数据安全，标配 AES 加密，可选高级加密套件，完全在本地离线执行。
  - icon: 🌈
    title: 不拘一格
    details: 魔曰允许你调整加密参数，使用不同的模式，生成高度随机化，不同风格的密文。
  - icon: 🎭
    title: 似是而非
    details: 密文完全呈现文言文特征，不存在罕见字符和异常字频，难以与正常文言文区分。
  - icon: 🏛️
    title: 熔古铸今
    details: 引用《古文观止》等古籍，依托真实古文，将密码和古汉语文学相融合。
  - icon: ⚡
    title: 惜字如金
    details: 魔曰重视密文长短，在加密前压缩数据，让密文尽可能缩短，避免长篇大论。
  - icon: 🎯
    title: 规行矩步
    details: 完整且严格的代码单元测试，强制解密兼容性，确保魔曰加密安全可靠。
  - icon: 🌳
    title: 博采众议
    details: 依AIPL 1.1许可证，你可以自由查阅，修改魔曰的源代码，参与社区，提出建议和贡献。
---

## Abracadabra 魔曰

<div style="display:flex;flex-flow: wrap;">

<img src="https://img.shields.io/badge/license-AIPL%201.1-yellow"/>

<img src="https://img.shields.io/badge/lang-JavaScript-orange"/>

<img src="https://img.shields.io/badge/binary-WASM-b33bb3"/>

</div>

<div style="display:flex;flex-flow: wrap;">

[<img src="https://img.shields.io/github/v/release/SheepChef/Abracadabra?color=00aaff"/>](https://github.com/SheepChef/Abracadabra/releases/latest)

[<img src="https://img.shields.io/github/actions/workflow/status/SheepChef/Abracadabra/node.js.yml?branch=main&label=%E6%9E%84%E5%BB%BA"/>](https://github.com/SheepChef/Abracadabra/actions/workflows/node.js.yml)

[<img src="https://img.shields.io/codecov/c/github/SheepChef/Abracadabra?label=%E8%A6%86%E7%9B%96%E7%8E%87"/>](https://github.com/SheepChef/Abracadabra/actions/workflows/coverage.yml)

<a href="https://hellogithub.com/repository/6d67b7be3ccc43419924dbe40b31e937" target="_blank"><img src="https://api.hellogithub.com/v1/widgets/recommend.svg?rid=6d67b7be3ccc43419924dbe40b31e937&claim_uid=cQrPYdpGNg4ACK6&theme=small" alt="Featured｜HelloGitHub" /></a>

![GitHub Repo stars](https://img.shields.io/github/stars/SheepChef/Abracadabra)

</div>

Abracadabra(魔曰) 是开源，安全，高效的文本加密工具。  
将数据加密为汉字构成的文言文，完全开源，易于部署，易于使用。

## 特性

- **仿真，使用文言语法句式**。
- 开源，所有源代码公开可查。
- 安全，标配 AES，可选高级加密套件。
- 可靠，代码经过严格单元测试。
- 便捷，易于本地部署和使用。

> 原创逆向研究，特别支持解密熊曰(与熊论道)密文。

### **熔古铸今：文言文仿真加密**

> 早夏振于局而听恋，路在临驿，静星之舒，迸于夏。梦曰：“不请流也” ，星雅即灯明，雪近即城极，返林而不能放，开而不能指，镜也。
>
> 此冰有聪雪高霞，极茶谜竹。或添福看茶，添棋于云，盈岩作鸳，春鹤信心。风取，航鹂旅人，北兰歌涧，雨云信涧，此韵有长路瀚灯，静云青林。

构造高仿真文言文，**参考《古文观止》《经史百家杂钞》《古文辞类纂》等古代典籍。**  
标准 AES256 加密，引入更复杂的组句、语法匹配机制，将密码和中国古典文言文相融合。

密文高度随机，支持用户自定义随机性和文本风格偏好，打造前所未有的跨文化数字加密方案。

<div style="width: 100%; height: 57px;"><a href="https://ctext.org/zhs"><img src="https://ctext.org/logos/ctplogo6.gif" border="0" alt="中国哲学书电子化计划" /></a></div>

## 开放源代码许可

**⚠️ 本项目受私有许可证保护**，使用本项目则默认视为同意并遵守相关条款。禁止将本项目用于非法用途。  
👉 查阅 [**AIPL-1.1 许可**](https://github.com/SheepChef/Abracadabra/blob/main/LICENSE.md) 来了解详细信息，也可以前往 [**#87**](https://github.com/SheepChef/Abracadabra/issues/87) 查阅简单介绍。

---

以下是本项目的依赖项：

- [**Unishox2**](https://github.com/siara-cc/Unishox2) 短字符串压缩实现 _©Siara-cc_, **Apache-2.0** License.
- [**crypto-js**](https://github.com/brix/crypto-js) 加密算法实现 _©Jeff Mott/Evan Vosberg_, **MIT** License.
- [**pako**](https://github.com/nodeca/pako) GZIP 压缩实现 _©Vitaly Puzrin/Andrei Tuputcyn_, **MIT** License.
- [**js-base64**](https://github.com/dankogai/js-base64) Base64 编码工具实现 _©Dan Kogai_, **BSD-3-Clause** License.
- [**mersenne-twister**](https://github.com/boo1ean/mersenne-twister) 梅森旋转算法实现 _©Makoto Matsumoto/Takuji Nishimura_, **BSD-3-Clause** License.
- [**opencc-js**](https://github.com/nk2028/opencc-js) 简繁体转换实现 _©nk2028_, **MIT** License.
- [**otplib**](https://github.com/yeojz/otplib) TOTP 实现 _©Gerald Yeo_, **MIT** License.

本项目许可证与所有依赖项的许可证兼容。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=SheepChef/Abracadabra&type=Date)](https://star-history.com/#SheepChef/Abracadabra&Date)
