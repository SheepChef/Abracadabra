# JavaScript 部署

使用 npm 下载 Abracadabra 库。

```sh
npm install abracadabra-cn
```

然后，在项目中引入库文件

```js
import { Abracadabra } from "abracadabra-cn";
```

如果你想在网页中全量引入本库，可以导入 `abracadabra-cn.umd.cjs`  
在网页上直接引用，请看 [**网页引用**](#网页引用) 一节。

## Abracadabra 实例

`Abracadabra` 是加解密操作的主类，文言文生成、高级加密和稀释分别使用各自的配置类型。

使用前，你需要实例化该类型，实例化时需要两个参数来指定输入输出的方式，如果不附带参数，则自动使用默认值 `TEXT`。

```js
import { Abracadabra } from "abracadabra-cn";

let Abra = new Abracadabra(); //不附带参数，

/*
Abracadabra.TEXT = "TEXT"
Abracadabra.UINT8 = "UINT8"
*/
let AbraWithMode = new Abracadabra("TEXT", "UINT8");
//参数必须是上述二者中的一个，传入其他值会导致错误。
```

`TEXT` 表明将来的输入/输出为 `String`，`UINT8` 表明将来的输入/输出为 `Uint8Array`，你可以灵活使用两种不同的类型。

::: warning 接口兼容性须知
旧的接口 `Input_Next()` 和 `Input()` 目前仍然可以使用，但未来的版本更新中会移除它们。
:::

::: tip 文件加/解密
使用`Uint8Array`作为输入/输出方式，魔曰可以加解密任意二进制(图片/视频/任何文件)，但是不推荐这么做。
:::

## 加解密方法

### WenyanInput() 文言仿真

`WenyanInput()` 函数用来对数据执行文言文仿真加解密。

```js
import { Abracadabra } from "abracadabra-cn";

let Abra = new Abracadabra(); //不附带参数，

/**
 * 魔曰 文言文加密模式
 *
 * @param {string | Uint8Array} input 输入的数据，根据此前指定的输入类型，可能是字符串或字节数组
 * @param {string} mode 指定模式，可以是 ENCRYPT DECRYPT 中的一种;
 * @param {string} key 指定密钥，默认是 ABRACADABRA;
 * @param {WenyanConfig} WenyanConfigObj 文言文的生成配置;
 * @param {AdvancedEncConfig} AdvancedEncObj 指定安全加密特性;
 * @param {any} callback 回调函数，获取执行过程中特定位置的结果
 * @return {number} 成功则返回 0(失败不会返回，会抛出异常)
 */
Abra.WenyanInput(input, mode, key, {...}, {...}, callback);
```

第一个参数 `input` 接受两种类型的输入，分别是 `String` 和 `Uint8Array`，这是此前在实例化的时候指定的输入类型。

如果你指定了 `UINT8` 却传入 `String`，将抛出错误，反之亦然。

第二个参数 `mode` 接受上文中特定字符串的输入，任何其他输入都将被忽略，不会输出任何结果。

第三个参数 `key` 接受字符串类型的密钥输入，如果不提供，则默认使用内置密钥 `ABRACADABRA`。

如果指定了错误的密码，那么在解码/解密数据校验过程中会抛出错误。

第六个参数 `callback` 接受一个回调函数，缺省时为 `null`。程序会在执行中关键位置多次调用此函数，以便调试，无调试需求可忽略此项。

第四、第五个参数的类型定义和字段用途，分别见 [配置类型](#配置类型) 一节。

---

### WenyanInput() 调用示例

```javascript
//正确调用方式：

import { Abracadabra } from "abracadabra-cn";
let Abra = new Abracadabra(); //不附带参数，
const TestTemp = "示例内容";

Abra.WenyanInput(
  TestTemp,
  "ENCRYPT",
  "ABRACADABRA",
  {
    RandomIndex: 25,
    PianwenMode: true,
  },
  {
    Enable: true,
    UseStrongIV: true,
    UseHMAC: true,
    UsePBKDF2: true,
    UseTOTP: true,
    FlexibleTransfer: {
      Enable: true,
      UseAONT: true,
      MessageID: 100,
      RandomParagraphing: [30, 90],
    },
  }
); // 启用高级加密及灵活分段传输，缺省项自动使用默认值

const CipherText = Abra.Output().join(""); //灵活分段加密返回密文段数组
Abra.WenyanInput(CipherText, "DECRYPT", "ABRACADABRA"); //解密一般不需要传入配置

//若加密时自定义了 TOTPBaseKey/TOTPEpoch，解密时也需传入相应参数。
```

在无错误的情况下， `WenyanInput()` 函数的返回值通常是 `0`。

---

### OldInput() 传统加密

::: warning 已终止支持

传统加密已终止支持，相关代码不会被移除，但也不会接受进一步更新。

传统加密模式下，不可启用高级加密功能。

:::

`OldInput()` 用传统模式加密密文。

```js
import { Abracadabra } from "abracadabra-cn";

let Abra = new Abracadabra(); //不附带参数，

/*
MODES:

Abracadabra.ENCRYPT = "ENCRYPT";
强制加密

Abracadabra.DECRYPT = "DECRYPT";
强制解密

Abracadabra.AUTO = "AUTO";
自动(遵循自动逻辑)

*/
Abra.OldInput(input, mode, key, q);
```

第一个参数 `input` 接受两种类型的输入，分别是 `String` 和 `Uint8Array`，这是此前在实例化的时候指定的输入类型。

如果你指定了 `UINT8` 却传入 `String`，将抛出错误，反之亦然。

第二个参数 `mode` 接受上文中特定字符串的输入，任何其他输入都将被视为 `AUTO` 并被忽略。

第三个参数 `key` 接受字符串类型的密钥输入，如果不提供，则默认使用内置密钥 `ABRACADABRA`。

如果指定了错误的密码，那么在解码/解密数据校验过程中会抛出错误。

第四个参数 `q` 接受布尔值的输入，如果传入 `true`，则加密结果中将不含标志位，但解密时需要强制解密。

在无错误的情况下， `OldInput()` 函数的返回值通常是 `0`。

---

### BearDecode() 熊曰解密

`BearDecode()` 允许用户解密熊曰密文。

```js
import { Abracadabra } from "abracadabra-cn";

let Abra = new Abracadabra(); //不附带参数。

//只允许输入字符串(UTF-8)
Abra.BearDecode(
  "呋擊眠魚堅笨唬咬呱洞物沒呦山誒註歡動笨意非覺呆誘嘿吖盜噗嗥溫沒洞魚啽和現現很哞呦蜜呱和出偶人嗷誒訴偶冬果果很森喜嗅噤很覺家森類雜拙呆意雜常吃"
);

let Result = Abra.Output(); //获取输出，输出只会是字符串
```

---

### Output() 输出

```js
import { Abracadabra } from "abracadabra-cn";

let Abra = new Abracadabra(); //不附带参数，

Abra.OldInput(input, mode, key, q);

let Result = Abra.Output(); //获取输出
```

在调用 `Output()` 之前，你需要至少调用过一次 `WenyanInput()` 或者 `OldInput()`，否则将会抛出错误。

调用 `Output()` 将获得此前输入的处理结果：

- **普通加/解密模式**：其返回类型为单条 `String` 或 `Uint8Array`，取决于实例初始化时指定的输出类型。
- **开启灵活分段传输时**：
  - **加密时**：`Output()` 会返回一个密文段数组(`String[]` 或 `Uint8Array[]`)，数组中的每个元素对应一个被切片并独立加密后的密文段落。
  - **解密时**：`Output()` 会返回一个已解码的消息数组(`String[]` 或 `Uint8Array[]`)。需要注意的是，数组的每个元素代表一封**完整重组后**的独立消息(按 `MessageID` 归类并按序号排序还原后的完整明文)，而非密文中的单个切片段落。只有当输入的密文中混合了属于不同 `MessageID` 的切片时，数组中才会包含多个解密结果。

---

### CallbackObj 调试回调

`WenyanInput()` 的第六个参数接受一个回调函数，每次调用时传入一个 `CallbackObj` 对象。

```javascript
export interface CallbackObj {
  /** 回调数据的标签 */
  Type?: string;
  /** 回调数据的值 */
  Value?: any;
}

type Callback = (Data: CallbackObj) => any;
```

`Type` 是字符串，用于区分执行阶段，默认为 `"NORMAL"`。

`Value` 是该阶段的数据，默认为 `null`。

`ENC_BASE64` 表示映射前的 Base64 数据，`ENC_SENTENCES` 表示选句结果。

`ENC_MAPTEMP` 表示映射过程中的文本，`DEC_PAYLOAD` 和 `DEC_BASE64` 分别表示解密时提取的载荷与还原的 Base64 数据。

回调可能在执行中多次触发，最终结果仍通过 `Output()` 获取。

```js
import { Abracadabra } from "abracadabra-cn";

let Abra = new Abracadabra();

Abra.WenyanInput("示例内容", "ENCRYPT", "ABRACADABRA", {}, {}, (Data) => {
  console.log(Data.Type, Data.Value);
});

let Result = Abra.Output(); //获取输出

//需要自行创建回调数据对象时，可以调用此构造函数。
let CallbackData = new Abracadabra.CallbackObj("NORMAL", null);
```

## 配置类型

配置类型的构造函数挂载在 `Abracadabra` 类型本身，通过 `new Abracadabra.WenyanConfig()` 等方式调用，它们不属于实例化后的主对象。

文言稀释配置必须使用 `new Abracadabra.DilutionConfig()` 创建。

文言文生成、高级加密和灵活传输仍接受普通配置对象(可自行组装)，缺省项自动使用默认值。

### WenyanConfig 文言文生成配置

`WenyanInput()` 的第四个参数接受一个`WenyanConfig`配置对象的输入，仅在加密的时候需要：

```javascript
export interface WenyanConfig {
  /** 指定是否为密文添加标点符号，默认 true/添加; */
  PunctuationMark?: boolean;
  /** 密文算法的随机程度，越大随机性越强，默认 50，最大100，超过100将会出错; */
  RandomIndex?: number;
  /** 控制文言文密文的稀释配置; */
  DilutionConfig?: DilutionConfig;
  /** 指定超长密文所使用的分段函数每段载荷上下限。传入 min 和 max，默认 20/80。min 小于 20, max 大于 200, 或者 max < min 将会出错; */
  RandomParagraphing?: [number, number];
  /** 指定是否优先生成骈文密文，默认 false; */
  PianwenMode?: boolean;
  /** 指定是否优先生成逻辑密文，默认 false; */
  LogicMode?: boolean;
  /** 指定输出文本是否为繁体中文，默认 false; */
  Traditional?: boolean;
}
```

`PunctuationMark` 是布尔值，默认为 `true`。如果传入 `false`，则加密结果中将不含标点符号，解密时可以忽略这个参数。

`RandomIndex` 是整数值，默认为`50`，最小值`0`，最大值`100`，超过 100 的输入将会报错。输入值越大，载荷量选择算法的随机性越大；输入值为 0 时，句式选择步骤将只选择载荷字较多的那个。解密时可以忽略这个参数。

`RandomParagraphing` 是一个数组。指定文言文分段长度上下限(载荷字个数) `[min, max]`，默认 `[20, 80]` 。min 小于 20, max 大于 200, 或者 max < min 将会出错;

`PianwenMode` 是布尔值，不指定则默认为 `false`。如果传入 `true`，则加密结果会优先使用骈文句式，呈现四字到五字一组的对仗格律，这有助于减少密文的总体长度。解密时可以忽略这个参数。

`LogicMode` 是布尔值，默认为 `false`。如果传入 `true`，则加密结果会优先使用逻辑句式，呈现强论述类逻辑风格。解密时可以忽略这个参数。

`Traditional` 是布尔值，默认为 `false`。如果传入 `true`，则加密结果会自动转换为繁体中文(香港)。解密时可以忽略这个参数。

`PianwenMode` 和 `LogicMode` 不能同时指定为 `true`，否则会抛出错误。

`DilutionConfig` 接受一个稀释配置，用来控制目标载荷率、文体和采样方式，默认不开启。

启用后使用稀释语料库选句，`PianwenMode` 和 `LogicMode` 不参与稀释选句。

具体参数见下方 [DilutionConfig 稀释配置](#dilutionconfig-稀释配置)。

也可以使用 `Abracadabra.WenyanConfig` 构造函数创建配置对象。

```js
import { Abracadabra } from "abracadabra-cn";

let WenyanConfigObj = new Abracadabra.WenyanConfig(
  true,
  50,
  new Abracadabra.DilutionConfig(),
  [20, 80],
  false,
  false,
  false
);
```

---

### DilutionConfig 稀释配置

`WenyanConfig.DilutionConfig` 用于控制密文稀释，仅在文言文加密时使用。

```javascript
export interface DilutionConfig {
  /** 指定是否启用密文稀释功能，默认 false/不开启 */
  Enable?: boolean;
  /** 指定用户期望的目标密文载荷率，应当是 [0.01,1] 之间的两位精度的浮点数。目标载荷率不代表实际密文的精确载荷率，将允许有必要误差。默认为 0.18*/
  DilutionTargetRate?: number;
  /** 文体过滤配置。
   *
   * ESSAY 为仅使用一般古文，POEM 为仅使用古诗，LYRIC 为仅使用宋词。
   *
   * ALL 不特别过滤，随机使用全部文体，默认 ALL */
  FilterMode?: "ALL" | "ESSAY" | "POEM" | "LYRIC";
  /** 古诗过滤配置，若不启用古诗则此配置无效。
   *
   * FOUR/FIVE/SEVEN 分别过滤出四言/五言/七言。
   *
   * ALL 不特别过滤，随机使用全部诗词。 */
  PoemFilterMode?: "ALL" | "FOUR" | "FIVE" | "SEVEN";
  /** 采样模式，SMART 为自适应算法采样。RANDOM 为简单随机采样。默认为 SMART */
  SampleMode?: "SMART" | "RANDOM";
  /** 段内载荷分配的模式， UNIFORM 为均匀。CONCENTRATE 为集中。默认为 UNIFORM */
  PayloadDistribution?: "UNIFORM" | "CONCENTRATE";
  /** 传入一个稀释语料库对象，用于稀释，若不传，则使用内置库 */
  Corpus?: DilutionCorpus | null;
  /** 古诗词每条模板后自动单换行，默认 true。段落仍使用双换行 */
  PoemAutoLineBreak?: boolean;
  /** 每次生成，在选择文体时的随机性，应当是[0~100]之间的整数。此参数越低，文体的选择将越与载荷率的取值、语料库的载荷率分布相关，默认 50。*/
  StyleRandomIndex?: number;
}
```

`Enable` 是布尔值，默认为 `false`。如果传入 `true`，则启用密文稀释，解密时可以忽略这个参数。

`DilutionTargetRate` 是数值，默认为 `0.18`。生成时取值范围为 `[0.01,1]`，最多保留两位小数。目标载荷率不代表实际密文的精确载荷率，实际结果允许存在必要误差。

`FilterMode` 是字符串，默认为 `ALL`。`ESSAY` 仅使用一般古文，`POEM` 仅使用古诗，`LYRIC` 仅使用词，`ALL` 使用所有可用文体。

`PoemFilterMode` 是字符串，默认为 `ALL`。`FOUR`、`FIVE`、`SEVEN` 分别过滤出四言、五言、七言，`ALL` 不特别过滤。此参数仅对古诗生效。

`SampleMode` 是字符串，默认为 `SMART`，使用自适应采样。如果传入 `"RANDOM"`，则每轮采样都会重新随机定位，仍然检查载荷和长度预算。

`PayloadDistribution` 是字符串，默认为 `UNIFORM`，使段内载荷尽可能均匀分布。如果传入 `CONCENTRATE`，则偏向将载荷集中在段内的某一区域。

`Corpus` 接受一个 `DilutionCorpus` 对象，默认为 `null`。启用稀释且未提供语料库时，自动加载内置 Std 语料库。

`PoemAutoLineBreak` 是布尔值，默认为 `true`。如果传入 `false`，则不在古诗模板后自动添加换行，段落仍使用双换行。

`StyleRandomIndex` 是整数值，默认为 `50`，取值范围为 `0~100`。数值越低，文体选择越依赖目标载荷率和语料库的载荷率分布。

::: warning 调用须知

稀释配置对象**必须**使用 `new Abracadabra.DilutionConfig()` 实例化。

如果在加密时传入 `{ Enable: true }` 等普通对象，则会被替换为默认配置，稀释不会启用。

:::

```js
import { Abracadabra } from "abracadabra-cn";

let Abra = new Abracadabra();

/**
 * 魔曰 文言文稀释配置
 *
 * @param {boolean} Enable 指定是否启用密文稀释，默认 false
 * @param {number} DilutionTargetRate 指定目标载荷率，默认 0.1
 * @param {string} FilterMode 指定文体，默认 ALL
 * @param {string} PoemFilterMode 指定古诗字数，默认 ALL
 * @param {string} SampleMode 指定采样模式，默认 SMART
 * @param {string} PayloadDistribution 指定段内载荷分布，默认 UNIFORM
 * @param {DilutionCorpus | null} Corpus 指定语料库，默认 null
 * @param {boolean} PoemAutoLineBreak 指定是否为古诗自动换行，默认 true
 * @param {number} StyleRandomIndex 指定文体选择随机性，默认 50
 */
let DilutionConfigObj = new Abracadabra.DilutionConfig(
  true,
  0.1,
  "POEM",
  "FIVE",
  "SMART",
  "UNIFORM",
  null,
  true,
  50
);

Abra.WenyanInput("示例内容", "ENCRYPT", "ABRACADABRA", {
  DilutionConfig: DilutionConfigObj,
});

let Result = Abra.Output(); //获取输出
```

功能机制及调用示例见 [密文稀释](./dilution.md)。

---

### AdvancedEncConfig 高级加密配置

`WenyanInput()` 的第五个参数接受一个`AdvancedEncConfig`配置对象的输入：

```javascript
export interface AdvancedEncConfig {
  /** 指定是否打开高级加密功能，默认 false/不开启; */
  Enable?: boolean;
  /** 指定是否使用完整16字节IV，默认 true/开启*/
  UseStrongIV?: boolean;
  /** 指定是否使用HMAC对消息签名，默认 false/不开启; */
  UseHMAC?: boolean;
  /** 指定是否对密钥加盐并使用密钥衍生函数 false/不开启;*/
  UsePBKDF2?: boolean;
  /** 指定是否使用TOTP作为密钥衍生的盐值，默认 false/不开启，若不使用密钥衍生函数，则不生效;*/
  UseTOTP?: boolean;
  /** 指定TOTP时间窗口，取值范围 0~15
   *  对应 [3 5 10 30 min] [2 6 12 h] [1 3 5 d] [1 3 Week] [1 2 6 Month] [1 yr], 默认4;
   **/
  TOTPTimeStep?: number;
  /** 指定用于TOTP加密的Unix时间戳记，以毫秒为单位(JS标准)，默认为系统时间；*/
  TOTPEpoch?: number;
  /**
   * 指定用于TOTP加密的预共享密钥，默认为加密主密钥，推荐使用足够随机且仅通信双方知晓的密钥;
   * 注意，TOTP的安全性主要依赖于此BaseKey
   **/
  TOTPBaseKey?: string;
  /** 指定灵活传输配置，若此项不是一个Object则默认不启用 */
  FlexibleTransfer?: FlexibleTransferConfig;
}
```

::: tip 提示

注意高级加密参数在解密时无需传递，除非需要指定 TOTP BaseKey 和 TOTP Epoch。

:::

`Enable` 是布尔值，默认为 `false`。如果传入 `true`，则将启用高级加密，解密时可以忽略这个参数。

`UseStrongIV` 是布尔值，默认为 `true`，如果传入 `true`，则高级加密时将使用完整 16 字节 IV。解密时可以忽略这个参数。

`UseHMAC` 是布尔值，默认为 `false`。如果传入 `true`，则高级加密时将使用 HMAC 对消息签名。解密时可以忽略这个参数。

`UsePBKDF2` 是布尔值，默认为 `false`。如果传入 `true`，则高级加密时将对密钥加盐并使用密钥衍生函数。解密时可以忽略这个参数。

`UseTOTP` 是布尔值，默认为 `false`。如果传入 `true`，则高级加密时将使用 TOTP 作为密钥衍生的盐值，若 `UsePBKDF2` 传入 `false`，则不生效。解密时可以忽略这个参数。

`TOTPTimeStep` 是整数值，默认为`4`，最小值`0`，最大值`15`，超过范围的输入将会报错。用于指定 TOTP 每步时长，每个值代表的时间见上方注释。解密时可以忽略这个参数。

`TOTPEpoch` 是整数值，默认为系统当前 Unix 时间戳，用于指定 TOTP 加密的 Unix 时间戳记，以毫秒为单位(JS 标准)。解密时可以携带这个参数，以指定用于解密的时间戳。

`TOTPBaseKey` 是字符串，默认为加密主密钥，用于指定 TOTP 加密的预共享密钥。解密时可以携带这个参数，以指定用于解密的 TOTP Basekey。

`FlexibleTransfer` 接受一个 `FlexibleTransferConfig` 类型的配置对象。

其启用与否由自身的 `Enable` 单独控制，不受高级加密 `Enable` 的影响。

也可以使用 `Abracadabra.AdvancedEncConfig` 构造函数创建配置对象。

```js
import { Abracadabra } from "abracadabra-cn";

let AdvancedEncObj = new Abracadabra.AdvancedEncConfig();
```

---

### FlexibleTransferConfig 灵活传输配置

```javascript
export interface FlexibleTransferConfig {
  /** 指定是否启用灵活传输功能，默认 false/不开启 */
  Enable?: boolean;
  /** 指定是否启用全有或全无转换(AONT)，默认 true/开启，开启后必须获得所有密文才可以解密完整内容 */
  UseAONT?: boolean;
  /** 指定临时消息ID，有助于防止混淆不同发送方的消息，默认-1为随机选择(0~4095) */
  MessageID?: number;
  /**
   * 指定分段加密每段字节数量上下限。传入 [min, max]，默认 [20, 80]。
   * min 小于 10, max 大于 380, 或者 max < min 将会出错;
   */
  RandomParagraphing?: [number, number];
}
```

`FlexibleTransfer` 接受一个 `FlexibleTransferConfig` 类型的配置对象：

- **Enable**：是否启用灵活分段传输。
- **UseAONT**：是否启用 AONT 转换(开启后安全性提高，但解密必须集齐所有分段)。
- **MessageID**：用于归类和区分多条混合传输消息的消息标识码(-1 表示随机选择 0-4095)。
- **RandomParagraphing**：分段字节范围 `[min, max]`，默认 `[20, 80]` 字节。

此处的 `RandomParagraphing` 按字节分段，与 `WenyanConfig.RandomParagraphing` 的载荷字分段互不干涉。实现机制和限制见 [灵活分段传输](./flexible.md)。

也可以使用 `Abracadabra.FlexibleTransferConfig` 构造函数创建配置对象。

```js
import { Abracadabra } from "abracadabra-cn";

let FlexibleTransferObj = new Abracadabra.FlexibleTransferConfig();
```

## 稀释语料库类型

### DilutionCorpus 规则库容器

`DilutionCorpus` 将 Manifest 与句式 JSON 同步初始化为可供稀释选句使用的语料库。

使用 `new Abracadabra.DilutionCorpus()` 创建语料库对象，不传入参数时自动加载内置 Std 语料库。

```js
import { Abracadabra } from "abracadabra-cn";

let Corpus = new Abracadabra.DilutionCorpus(); //使用内置语料库

/**
 * Dilution Corpus 规则库容器
 *
 * @param {DilutionCorpusSourceManifestObj | string | null} Manifest 发行 Manifest JSON 对象或 JSON 字符串
 * @param {DilutionCorpusJSONInput | null} B 一般古文 JSON 或顺序分片，默认 null
 * @param {DilutionCorpusJSONInput | null} S 古诗 JSON 或顺序分片，默认 null
 * @param {DilutionCorpusJSONInput | null} C 词 JSON 或顺序分片，默认 null
 */
let CustomCorpus = new Abracadabra.DilutionCorpus(Manifest, B, S, C);
//Manifest、B、S、C 为调用方已读取的语料库数据。
```

第一个参数 `Manifest` 接受 JSON 字符串或已解析对象，用于提供语料库分级和统计信息。

第二个参数 `B` 接受一般古文句式 JSON，第三个参数 `S` 接受古诗句式 JSON，第四个参数 `C` 接受词句式 JSON。

B、S、C 可以是单份 JSON，也可以是按原顺序排列的分片数组。每份 JSON 可以是字符串或已解析对象。

第一片必须含 `Metadata` 和 `Sentences`，后续分片只需要 `Sentences`。

`Tier` 和 `SentenceType` 必须与对应语料一致。第一片的 `SentenceCount` 必须等于该文体所有分片的句式总数。

初始化保留原始句式顺序。

::: tip 提示

使用自定义语料库时，需要提供有效的 Manifest，并至少提供 B、S、C 中的一种。

如果未提供有效的 Manifest，或 B、S、C 均为空，则自动加载内置 Std 语料库。

:::

---

### 语料库类型定义

`DilutionCorpus` 描述初始化后的语料库对象，`Tier` 为语料库分级，`B`、`S`、`C` 分别为三种文体的数据。

`DilutionCorpusObj` 包含句式数组与元数据，未提供的文体在语料库对象中设为 `null`。

`DilutionCorpusMetadataObj` 保存分级、文体、句式总数和运行时统计。

`DilutionCorpusManifestObj` 仅保留必要统计，缺失的统计字段为 `null`。

`DilutionCorpusSourceManifestObj` 和 `DilutionCorpusSourceMetadataObj` 分别描述发行 Manifest 与原始句式元数据。

`DilutionCorpusJSONFirstObj` 和 `DilutionCorpusJSONPartObj` 分别描述第一片与后续分片，`DilutionCorpusJSONInput` 描述单文件或分片输入。

```javascript
/** Dilution Corpus 的尺寸分级。 */
export type DilutionCorpusTier =
  | "Nano"
  | "Micro"
  | "Mini"
  | "Std"
  | "Plus"
  | "Pro"
  | "Supra"
  | "Mega"
  | "Ultra";

/** B 为一般古文，S 为古诗，C 为词 */
export type DilutionCorpusSentenceType = "B" | "S" | "C";

/** 两端均包含。Manifest 未提供该统计时为 null。 */
export type DilutionCorpusRange = [number, number] | null;

/** 已初始化的单一 B/S Corpus。 */
export interface DilutionCorpusObj {
  Metadata: DilutionCorpusMetadataObj;
  /** 保持输入 JSON 中的句式顺序。 */
  Sentences: string[];
}

/** 已初始化的 Corpus 元数据。 */
export interface DilutionCorpusMetadataObj {
  /** 规则库尺寸。 */
  Tier: DilutionCorpusTier;
  /** B 为一般古文，S 为古诗，C 为词 */
  SentenceType: DilutionCorpusSentenceType;
  /** 当前 B/S/C Corpus 的句式总数。 */
  SentenceCount: number;
  /** 运行时使用的精简统计对象，不是原始 JSON 中的 Manifest 文件名。 */
  Manifest: DilutionCorpusManifestObj;
}

/** 当前 B/S/C 的必要统计。Manifest 未提供的字段为 null。 */
export interface DilutionCorpusManifestObj {
  /** 非零载荷率的众数（精确到两位小数）。 */
  TargetBaseRate: number | null;
  /** 全部模板的载荷率边界。 */
  PayloadRateHardLimit: DilutionCorpusRange;
  /** 非零载荷率边界。 */
  NonZeroPayloadRateHardLimit: DilutionCorpusRange;
  /** 单句有效长度边界。 */
  SentenceLengthHardLimit: DilutionCorpusRange;
  /** 单句载荷数量边界。 */
  PayloadCountHardLimit: DilutionCorpusRange;
}

/** 发行 Manifest JSON。其他非必要字段允许存在，但不会进入运行时对象。 */
export interface DilutionCorpusSourceManifestObj {
  Tier: DilutionCorpusTier;
  Statistics?: Partial<
    Record<DilutionCorpusSentenceType, Partial<DilutionCorpusManifestObj>>
  >;
}

/** 原始 B/S/C JSON 第一片的 Metadata。 */
export interface DilutionCorpusSourceMetadataObj {
  Tier: DilutionCorpusTier;
  SentenceType: DilutionCorpusSentenceType;
  SentenceCount: number;
}

/** 单文件或第一分片，必须包含 Metadata 和 Sentences。 */
export interface DilutionCorpusJSONFirstObj {
  Metadata: DilutionCorpusSourceMetadataObj;
  Sentences: string[];
}

/** 后续 JSON 分片，只需要 Sentences。 */
export interface DilutionCorpusJSONPartObj {
  Sentences: string[];
}

/** 单份 JSON 可以是已解析对象或 JSON 字符串。 */
export type DilutionCorpusJSON = DilutionCorpusJSONFirstObj | string;

/**
 * B/S/C 句式 JSON 输入。
 * 单文件传入 JSON 对象或 JSON 字符串。分片传入按顺序排列的数组。
 * 分片第一项必须包含 Metadata，后续项只需要 Sentences。
 */
export type DilutionCorpusJSONInput =
  | DilutionCorpusJSON
  | [DilutionCorpusJSON, ...(DilutionCorpusJSONPartObj | string)[]];

export interface DilutionCorpus {
  /** 规则库尺寸。 */
  readonly Tier: DilutionCorpusTier;
  /** 已初始化的一般古文 Corpus。未提供 B 时为 null。 */
  readonly B: DilutionCorpusObj | null;
  /** 已初始化的古诗 Corpus。未提供 S 时为 null。 */
  readonly S: DilutionCorpusObj | null;
  /** 已初始化的词 Corpus。未提供 C 时为 null。 */
  readonly C: DilutionCorpusObj | null;
}
```

## 网页引用

绕过 NPM 和包管理，你也可以直接在任意网页上直接引用本项目。

在 Release 处下载 `.umd.cjs` 文件，放到自定义位置，然后在网页 `<head>` 标签添加引用：

```html
<script src="<path>/abracadabra-cn.umd.cjs"></script>
```

在网页的其他地方调用脚本接口，可以这么写：

```html
<script>
  let Abra = new window["abracadabra-cn"].Abracadabra(InputMode, OutputMode);

  //此后的调用方法，和前述调用方法没有差别，直接使用此实例化对象即可。
  //故不做过多赘述。
</script>
```

在实例化对象之后，其余的调用方法请见上一节。

## 自行编译

如果你想要自行编译 JavaScript 库文件，请克隆 main 分支到本地。  
安装 `npm` 并配置恰当的环境。

安装编译和调试依赖：

```sh
npm install
```

然后执行编译指令：

```sh
npm run build
```

如果你对密码映射表做出了修改，那么请确保将 JSON 压缩成一行，转义成字符串。  
然后修改 `ChineseMappingHelper.js` 中的 `OldMapper` 类(传统加密) 或者 `WenyanSimulator` 类(文言加密)：

```js
this.Map = "...."; // 字符串内填密码映射表
```

在执行编译时，会自动对文言文密本中的句式语法执行检查，如果有问题，则会报错并提示编译失败。  
如果你想要单独运行检查，可以执行：

```sh
npm run test
```
