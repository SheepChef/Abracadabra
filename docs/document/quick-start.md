# 快速开始

**Abracadabra 魔曰** 是开源，安全，高效的文本加密工具。将数据加密为汉字构成的文言文，完全开源，易于部署，易于使用。

相较于传统的加密方法(佛曰/熊曰/兽音等)，魔曰有很多优势：

- **仿真，使用文言语法句式**。
- 开源，所有源代码公开可查。
- 安全，标配 AES，可选高级加密套件。
- 可靠，代码经过严格单元测试。
- 便捷，易于本地部署和使用。

<h3>百闻不如一见，现在就试试看吧！</h3>

## 直接使用

### Demo

本项目有自动托管在 Cloudflare Pages 的静态 Demo 可供直接使用。

此页面加载完成后可完全脱机运行，你也可以选择安装 PWA 来更优雅地使用它。

Demo 会适配魔曰的所有可调参数，你可以在此体验到魔曰的完整功能。

<div style="width:170px">

[<img src="https://img.shields.io/badge/立刻使用-ffd91c?logo=cloudflarepages&style=for-the-badge&logoColor=000000" width="170"/>](https://abra.js.org/)

</div>

### 浏览器插件

浏览器插件的代码完全复用静态页面代码。

此插件不申请任何浏览器权限(包括联网权限)，没有任何多余功能。

已上架 **Chrome WebStore**, **Edge 加载项** 和 **Firefox 扩展**。

如果不方便访问 Chrome 插件商店，也可以访问 Edge 插件商店，和 Firefox 扩展商店。

<div style="display: grid;
    justify-items: center;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    grid-auto-flow: row;
    grid-gap: 10px;">
<div style="width:171px">

[<img src="https://img.shields.io/badge/Chrome 商店-8a54ff?logo=chromewebstore&style=for-the-badge&logoColor=ffffff" width="171" />](https://chrome.google.com/webstore/detail/jgmlgdoefnmlealmfmhjhnoiejaifpko)

</div>

<div style="width:170px">

[<img src="https://img.shields.io/badge/MSEdge 商店-8a54ff?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMyAyMyI+CiAgICA8cGF0aCBmaWxsPSIjZjNmM2YzIiBkPSJNMCAwaDIzdjIzSDB6Ii8+CiAgICA8cGF0aCBmaWxsPSIjZjM1MzI1IiBkPSJNMSAxaDEwdjEwSDF6Ii8+CiAgICA8cGF0aCBmaWxsPSIjODFiYzA2IiBkPSJNMTIgMWgxMHYxMEgxMnoiLz4KICAgIDxwYXRoIGZpbGw9IiMwNWE2ZjAiIGQ9Ik0xIDEyaDEwdjEwSDF6Ii8+CiAgICA8cGF0aCBmaWxsPSIjZmZiYTA4IiBkPSJNMTIgMTJoMTB2MTBIMTJ6Ii8+Cjwvc3ZnPg==&style=for-the-badge&logoColor=ffffff" width="170" />](https://microsoftedge.microsoft.com/addons/detail/abracadabra-%E9%AD%94%E6%9B%B0/kfkmhdcahjblddpkkmnjeppmfmfoihkb)

</div>

<div style="width:174px">

[<img src="https://img.shields.io/badge/Firefox 商店-8a54ff?logo=firefoxbrowser&style=for-the-badge&logoColor=ffffff" width="174" />](https://addons.mozilla.org/zh-CN/firefox/addon/abracadabra-%E9%AD%94%E6%9B%B0/)

</div>
</div>

::: warning 提示

Edge 插件商店的上架审核速度十分缓慢，因此更新速度也更慢。不推荐从 Edge 商店下载本插件。

:::

### Android 客户端

本项目的 Android 客户端完全在 WebView 中静态运行。

![image](https://github.com/user-attachments/assets/0f3b1c92-8853-4c70-8ef2-58630769beda)

APK 使用 HBuilderX 自动打包，**完全离线运行，没有自动更新等配套功能**。

功能和界面均和前端静态网页没有差异。

APK 文件可以 [**在 Release 中下载**](https://github.com/SheepChef/Abracadabra/releases/latest)

## 简单部署

### 部署核心库

使用 npm 下载 Abracadabra 库。

你也可以前往[Release 页面](https://github.com/SheepChef/Abracadabra/releases/latest)直接下载 JS 文件。

```sh
$ npm install abracadabra-cn
```

然后，在项目中引入库文件

```js
import { Abracadabra } from "abracadabra-cn";
```

---

你也可以直接在任意网页上直接引用本项目。

在 Release 处下载 `.umd.cjs` 文件，放到自定义位置，然后在网页 `<head>` 标签添加引用：

```html
<script src="<path>/abracadabra-cn.umd.cjs"></script>
```

在网页的其他地方调用脚本接口，可以这么写：

```html
<script>
  let Abra = new window["abracadabra-cn"].Abracadabra(InputMode, OutputMode);
</script>
```

### 部署完整前端

前往[Release 页面](https://github.com/SheepChef/Abracadabra/releases/latest)下载 `fastdeploy_X.X.zip`

然后，将它解压到你网站的任意位置，也可以直接上传到静态容器中。

配置路由，即可得到一个与[项目 Demo](https://abra.js.org/)一模一样的页面。

若要自行编译或修改前端代码，请前往前端源代码仓库。

浏览器插件的源码同样在前端源代码仓库，位于 crx 分支。

<div style="width:103px">

[<img src="https://img.shields.io/badge/前端源码-9a10b5?style=for-the-badge" width="103" />](https://github.com/SheepChef/Abracadabra_demo)

</div>

## 下一步

- 了解魔曰的用户指南，最佳使用实践，请继续阅读[使用指引](/document/demo-usage.md)。

- 查阅魔曰的详细编译部署指南和接口文档，请参考[部署和编译](/document/js-deploy.md)。

- 了解魔曰的详细技术细节，请查阅[技术细节](/document/wenyan.md)
