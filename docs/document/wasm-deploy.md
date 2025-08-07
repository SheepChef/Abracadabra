# WebAssembly 部署

前往[Release 页面](https://github.com/SheepChef/Abracadabra/releases/latest)下载编译好的 WebAssembly `.wasm` 文件。

然后，推荐使用 [**wasmtime**](https://github.com/bytecodealliance/wasmtime) 来调用它，其他 Runtime 不做特别兼容。

本项目的 WebAssembly 模块使用 [**Javy**](https://github.com/bytecodealliance/javy) 编译而来，方便在 C++、Rust、Go 等语言中调用，**不推荐**在类似 Python、 Java、Node.js 的解释器中调用。

要调用本 WebAssembly 模块，需要使用尚在预览状态的 [**WASI**](https://github.com/WebAssembly/WASI)，目前仅有 wasmtime 提供了最完整的 WASI 支持，但它在各个语言的实现并不一致。

本模块的合法输入为一个 JSON 字符串，输入时请勿附带注释，遵循以下格式：

::: warning 兼容性提示
注意，V3.2 修改了接口标准，WASM 未对旧版本留有兼容，请参照新版接口来编写调用方式。
:::

```json
{
  "method":"", // WENYAN | OLD
  "inputType":"", // TEXT | UINT8
  "outputType":"", // TEXT | UINT8
  "input":"",  // 输入的数据，如果是TEXT请直接输入纯文本，如果是任意字节，请输入Base64编码字符串
  "mode":"",   // ENCRYPT | DECRYPT | AUTO   // AUTO 仅在 method 指定 OLD 时合法
  "key":"",    // 加密密钥，一个字符串 //如果缺省，自动使用默认值
  "q":bool,    // OLD模式下，决定是否添加标志位
  "WenyanConfig":{ //文言文生成配置，可以缺省，缺省自动使用默认值。
    "PunctuationMark": bool, // 指定是否为密文添加标点符号，默认 true/添加;
    "RandomIndex": number,  // 仅WENYAN模式下需要：算法的随机程度，越大随机性越强，默认 50，最大100，超过100将会出错;
    "PianwenMode":bool,    // 仅WENYAN模式下需要：尽可能使用对仗的骈文句式; 与逻辑句式冲突
    "LogicMode":bool,    // 仅WENYAN模式下需要：尽可能使用逻辑句式; 与骈文句式冲突
  },
}
```

用 wasmtime CLI 调用，在不同的命令行里有不同的方式，大多数时候是输入字符串的字符集的区别，以及是否需要在字符串外面加单引号的区别。

在 Windows CMD 或者 Powershell 中调用，请确保执行了 `chcp 65001` 以调整代码页为 UTF-8。

注意在 Windows CMD 中，输入的字符串**不需要**用单引号囊括。

```sh
echo '{"method":"WENYAN","mode":"ENCRYPT","inputType":"TEXT","outputType":"TEXT","input":"愿青空的祝福，与我的羽翼同在","key":"ABRACADABRA","WenyanConfig":{"PianwenMode":true}}' | wasmtime abracadabra-cn.wasm
```

对于其他语言，你需要使用 Wasmtime WASI 的 `stdin` 和 `stdout` 接口来操作本模块的输入输出，调用 `_start` 方法来启动本模块。

下方提供 Python 的示例，其他语言请自行查阅 wasmtime 对应的文档。

```sh
pip install wasmtime
```

```python
import wasmtime

def run_wasi(wasm_file):
    engine = wasmtime.Engine()
    module = wasmtime.Module.from_file(engine, wasm_file)
    store = wasmtime.Store(engine)
    linker = wasmtime.Linker(engine)
    wasi = wasmtime.WasiConfig()
    #Python 的 wasmtime 实现，想写入stdin，必须使用一个文件。
    #文件里填写要输入的JSON。
    wasi.stdin_file = "<Path_to_JSON_File>"
    wasi.inherit_stdout()
    wasi.inherit_stderr()
    linker.define_wasi()
    store.set_wasi(wasi)
    instance = linker.instantiate(store, module)
    start = instance.exports(store)["_start"]
    start(store)
try:
    run_wasi("<Path_to_WASM_Module_File>")
except FileNotFoundError:
    print(f"Error: WASM file '{wasm_file}' not found.")
except wasmtime.WasmtimeError as e:
    print(f"Wasmtime error: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
```

## 自行编译 (Javy)

首先，拉取仓库，安装 [**Javy**](https://github.com/bytecodealliance/javy)，配置恰当的环境。

然后，像编译普通 JS 库一样，执行：

```sh
npm install

npm run build
```

在输出文件夹中，找到 `abracadabra-cn-javy.js`

然后用 Javy 在命令行中编译：

```sh
javy build "Path/to/abracadabra-cn-javy.js" -o "path/Output.wasm"
```
