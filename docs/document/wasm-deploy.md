# WebAssembly 部署

前往[Release 页面](https://github.com/SheepChef/Abracadabra/releases/latest)下载编译好的 WebAssembly `.wasm` 文件。

然后，推荐使用 [**wasmtime**](https://github.com/bytecodealliance/wasmtime) 来调用它，其他 Runtime 不做特别兼容。

本项目的 WebAssembly 模块使用 [**Javy**](https://github.com/bytecodealliance/javy) 编译而来，可通过支持 WASI 的宿主在不同语言环境中调用。

要调用本 WebAssembly 模块，需要使用尚在预览状态的 [**WASI**](https://github.com/WebAssembly/WASI)，目前仅有 wasmtime 提供了最完整的 WASI 支持，但它在各个语言的实现并不一致。

本模块的合法输入为一个 JSON 字符串，输入时请勿附带注释，遵循以下格式：

```json
{
  "method": "WENYAN",
  "inputType": "TEXT",
  "outputType": "TEXT",
  "input": "示例文本",
  "mode": "ENCRYPT",
  "key": "ABRACADABRA",
  "WenyanConfig": {},
  "AdvancedEncConfig": {}
}
```

::: tip 输出格式
WASM 模块执行完毕后，结果将通过 `stdout` 以 JSON 编码形式输出。

- 如果 `outputType` 指定为 `UINT8`，则输出的是 Base64 编码字符串（或 Base64 字符串数组）。
- 如果启用了 `FlexibleTransfer` 灵活分段功能，输出可能是一个字符串数组（或 Base64 字符串数组）。

:::

::: warning 安全性和性能警告

此 WASM 模块将 JS 代码和 `QuickJS` 运行时捆绑在一起，允许你在有 `wasmtime` 的环境中调用模块。你需要注意以下事项。

- 执行效率将显著劣于 V8 引擎环境，尤其是执行密集哈希运算的时候。`QuickJS` 是轻量化的 JS 运行时，无法和 V8 媲美。

- `QuickJS` 不支持获取密码学安全随机数，因此，随机数算法将由梅森旋转作为代替。这会削弱加密安全性，不建议用于敏感数据。

WASM 不是魔曰的主线开发任务，依赖库未经积极更新，如果遇到问题，请提 Issue。

如果 WASM 的使用场景过少，它最终会被移除。

:::

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
wasm_file = "<Path_to_WASM_Module_File>"
try:
    run_wasi(wasm_file)
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
