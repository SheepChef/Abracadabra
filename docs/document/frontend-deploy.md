# 前端 部署和编译

## 快速部署

前往[Release 页面](https://github.com/SheepChef/Abracadabra/releases/latest)下载 `fastdeploy_X.X.zip`

然后，将它解压到你网站的任意位置，也可以直接上传到静态容器中。

配置路由，即可得到一个与[项目 Demo](https://abra.js.org/)一模一样的页面。

若要自行编译或修改前端代码，请前往前端源代码仓库。

## 编译源码

首先，前往[前端源码仓库](https://github.com/SheepChef/Abracadabra_demo)，拉取前端源码仓库的代码。

```sh
git clone https://github.com/SheepChef/Abracadabra_demo.git
```

进入项目目录并安装依赖：

```sh
cd Abracadabra_demo
npm install
```

本项目采用统一架构，Web 页面、浏览器扩展以及 Android 应用的源码均已合并至主分支 (`main`)。你可以根据目标平台，运行相应的构建指令：

- **Web 静态页面**

  ```sh
  npm run build
  ```

  构建产物位于 `./docs` 目录。

- **Android (Cordova) App**

  ```sh
  npm run build:android
  ```

  该命令会自动编译 Vue 并触发 Cordova Release 构建。打包生成的 APK 位于 `Abracadabra-cordova/platforms/android/app/build/outputs/apk/release/`。_(需提前配置好 Android 编译环境及签名)_

- **Chrome 扩展程序**

  ```sh
  npm run build:chrome
  ```

  构建产物位于 `./dist-chrome` 目录，可在 Chrome 中选择“加载已解压的扩展程序”。

- **Firefox 扩展程序**

  ```sh
  npm run build:firefox
  ```

  构建产物位于 `./dist-firefox` 目录。

- **一键构建所有平台**
  ```sh
  npm run build:all
  ```

## 构建 Android APP

构建 Android APK 依赖于 Apache Cordova，如果你是首次进行打包，请确保本地已配置好相应的 Android 编译环境。

### 环境准备

- 安装 **Java Development Kit (JDK)**（Cordova Android 15 推荐 JDK 17）。
- 安装 **Android Studio**，并通过 SDK Manager 安装与所用 Cordova Android 版本匹配的 SDK 及 Build Tools。
- 正确配置系统环境变量 `JAVA_HOME` 和 `ANDROID_HOME`。
- 安装 **Gradle**，并正确配置环境变量，确保编译路径无中文字符。
- 全局安装 Cordova CLI：
  ```sh
  npm install -g cordova
  ```

### 准备签名文件 (Keystore)

为了通过 `npm run build:android` 自动化生成可分发的 Release APK，你必须配置应用签名。

1. 使用 Android Studio 或 `keytool` 生成一个 `.jks` 密钥库文件（例如命名为 `Abracadabra.jks`）。
2. 将该文件放置在项目根目录的 `Abracadabra-cordova` 文件夹内。
3. 按需修改或核对 `Abracadabra-cordova/build.json` 中的签名配置，确保 `storePassword`、`alias` 等参数与你的密钥库一致。

### 清理缓存与构建

如果你修改过图标 (res 目录) 或 `config.xml`，建议在打包前清理一次 Cordova 缓存以防止旧资产残留：

```sh
cd Abracadabra-cordova
cordova clean android
cd ..
npm run build:android
```
