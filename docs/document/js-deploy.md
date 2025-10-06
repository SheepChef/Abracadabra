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

## JavaScript 类型接口

Abracadabra 库仅包含一个类型，即`Abracadabra`

使用前，你需要实例化该类型，实例化时需要两个参数来指定输入输出的方式，如果不附带参数，则自动使用默认值 `TEXT`。

```js
import { Abracadabra } from "abracadabra-cn";

let Abra = new Abracadabra(); //不附带参数，

/*
Abracadabra.TEXT = "TEXT"
Abracadabra.UINT8 = "UINT8"
*/
let Abra = new Abracadabra(InputMode, OutputMode);
//参数必须是上述二者中的一个，传入其他值会导致错误。
```

`TEXT` 表明将来的输入/输出为 `String`，`UINT8` 表明将来的输入/输出为 `Uint8Array`，你可以灵活使用两种不同的类型。

::: warning 接口兼容性须知
旧的接口 `Input_Next()` 和 `Input()` 目前仍然可以使用，但未来的版本更新中会移除它们。
:::

::: tip 文件加/解密
使用`Uint8Array`作为输入/输出方式，魔曰可以加解密任意二进制(图片/视频/任何文件)，但是不推荐这么做。
:::

### WenyanInput() 文言仿真加密函数

`WenyanInput()` 函数用来对数据执行文言文仿真加密。

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
 * @param {any}callback 回调函数，获取执行过程中特定位置的结果
 * @return {number} 成功则返回 0（失败不会返回，会抛出异常）
 */
Abra.WenyanInput(input, mode, key, {...}, callback);
```

第一个参数 `input` 接受两种类型的输入，分别是 `String` 和 `Uint8Array`，这是此前在实例化的时候指定的输入类型。

如果你指定了 `UINT8` 却传入 `String`，将抛出错误，反之亦然。

第二个参数 `mode` 接受上文中特定字符串的输入，任何其他输入都将被忽略，不会输出任何结果。

第三个参数 `key` 接受字符串类型的密钥输入，如果不提供，则默认使用内置密钥 `ABRACADABRA`。

如果指定了错误的密码，那么在解码/解密数据校验过程中会抛出错误。

第五个参数 `callback` 接受一个回调函数，缺省时为 `null`。程序会在执行中关键位置多次调用此函数，以便调试，无调试需求可忽略此项。

第四个参数接受一个`WenyanConfig`配置对象的输入，仅在加密的时候需要：

```javascript
export interface WenyanConfig {
  /** 指定是否为密文添加标点符号，默认 true/添加; */
  PunctuationMark?: boolean;
  /** 密文算法的随机程度，越大随机性越强，默认 50，最大100，超过100将会出错; */
  RandomIndex?: number;
  /** 指定是否强制生成骈文密文，默认 false; */
  PianwenMode?: boolean;
  /** 指定是否强制生成逻辑密文，默认 false; */
  LogicMode?: boolean;
  /** 指定输出文本是否为繁体中文，默认 false; */
  Traditional?: boolean;
}
```

`PunctuationMark` 是布尔值，默认为 `true`。如果传入 `false`，则加密结果中将不含标点符号，解密时可以忽略这个参数。

`RandomIndex` 是整数值，默认为`50`，最小值`0`，最大值`100`，超过 100 的输入将会报错。输入值越大，载荷量选择算法的随机性越大；输入值为 0 时，句式选择步骤将只选择载荷字较多的那个。解密时可以忽略这个参数。

`PianwenMode` 是布尔值，不指定则默认为 `false`。如果传入 `true`，则加密结果会优先使用骈文句式，呈现四字到五字一组的对仗格律，这有助于减少密文的总体长度。解密时可以忽略这个参数。

`LogicMode` 是布尔值，默认为 `false`。如果传入 `true`，则加密结果会优先使用逻辑句式，呈现强论述类逻辑风格。解密时可以忽略这个参数。

`Traditional` 是布尔值，默认为 `false`。如果传入 `true`，则加密结果会自动转换为繁体中文(香港)。解密时可以忽略这个参数。

`PianwenMode` 和 `LogicMode` 不能同时指定为 `true`，否则会抛出错误。

```javascript
//正确调用方式：

import { Abracadabra } from "abracadabra-cn";
let Abra = new Abracadabra(); //不附带参数，

Abra.WenyanInput(TestTemp, "ENCRYPT", "ABRACADABRA", {
  RandomIndex: 25,
  PianwenMode: true,
}); //指定随机指数为25，并使用骈文模式，缺省项自动使用默认值

Abra.WenyanInput(TestTemp, "DECRYPT", "ABRACADABRA"); //解密不需要传入配置
```

在无错误的情况下， `WenyanInput()` 函数的返回值通常是 `0`。

### OldInput() 传统加密函数

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

第四个参数 `q` 接受布尔值的输入，如果传入 `true`，则加密结果中将不含标志位，更加隐蔽，但解密时需要强制解密。

在无错误的情况下， `OldInput()` 函数的返回值通常是 `0`。

### Output()

```js
import { Abracadabra } from "abracadabra-cn";

let Abra = new Abracadabra(); //不附带参数，

Abra.OldInput(input, mode, key, q);

let Result = Abra.Output(); //获取输出
```

在调用 `Output()` 之前，你需要至少调用过一次 `WenyanInput()` 或者 `OldInput()`，否则将会抛出错误。

调用 `Output()` 将获得此前输入的处理结果，其返回类型可能是 `String` 或 `Uint8Array`，取决于对象实例化时指定了何种输出模式。

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
