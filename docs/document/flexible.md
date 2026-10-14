# 灵活分段传输

灵活分段传输 是魔曰针对超长文本或二进制文件传输设计的核心扩展机制。

## 功能

在实际使用中，灵活分段传输能提供以下关键的实用体验：

- **多渠道分发传输**：由于数据被拆分为数个独立的密文段，你可以将它们通过不同的社交平台、论坛贴文或聊天窗口分别发出，最后由接收方一并收集并解密。
- **乱序接收与自动重组**：每个分段密文中均嵌有隐藏的序列号(SerialNumber)和消息标识(MessageID)。接收方可以杂乱无章地导入密文，系统会自动按 MessageID 归类、按顺序重组并恢复明文，对传输顺序和通道没有任何要求。
- **改善长文本呈现**：超长密文如果单条转换并大段发送，容易暴露句式重复率或呈现字频特征。分段传输使用一维值噪声(`ValueNoise1D`)对数据进行动态长度切片，允许用户分开甚至跨平台发送密文，便于将较长内容分为多个独立段落。
- **全有或全无保护(AONT)**：开启 AONT 后，密文分段深度纠缠。解密时必须集齐 100% 的分段，即便只缺失任意一个分段，也无法还原出明文的任何局部片段，便于按整条消息进行恢复。

## 实现机制

为了支持分批分发与无序重组，魔曰在底层实现了四项核心机制：

### 噪声分段

程序使用一维值噪声(`ValueNoise1D`)与余弦平滑插值，在设定的上下限区间内平滑、自适应地产生每一段的分段大小。这种长度分布相比纯随机数更具平滑度，使生成的古文段落长短过渡更加自然。

### AONT

在分段加密前，程序采用基于 MGF1-SHA256 的 4 轮 Feistel 结构操作，对明文进行全有或全无变换(AONT)。

此过程使得所有数据字节彼此纠缠，任何一点数据被篡改或者缺失都会在解密时引发雪崩效应，导致整体数据不可读。此过程是密码学安全的。

启用 AONT 时，系统将在 AONT 执行前对全文进行整体压缩；禁用时，则对各数据段进行独立压缩。通常整体压缩的效率优于独立压缩。所用压缩算法与常规加密模式一致。

AONT 默认开启，除非用户主动关闭。

::: tip 这意味着什么?

开启 AONT 意味着，缺失/修改任意一个或多个段落的密文，都会导致整条消息完全无法解密，即**全有或全无**。接收方必须完整地接收到某条消息的**所有**密文段落，才能解密该条消息，否则完全无法解密。

反之，关闭 AONT 时，接收到的有效分段可以分别解密。

:::

下方的论文给出了此设计之密码学安全性的证明，具体代码请见 `EncryptHelper.js`。

> Luby, Michael; Rackoff, Charles (April 1988), "How to Construct Pseudorandom Permutations from Pseudorandom Functions", SIAM Journal on Computing, 17 (2): 373–386, doi:10.1137/0217022, ISSN 0097-5397.

### 标头

每个加密后的分段 Base64 数据中，都会被随机插入一个固定长度为 10 字符的标头，格式为 `... /=xxxxxxxx ...`。

- `"/="` 为灵活分段的魔数标识。
- 后续 8 字符(48 bits)承载元数据，其中 34 位控制字段经主密钥 CTR 处理，14 位局部 IV 不加密：包含用于定位结束位置以重置转轮(`RoundReset`)的 `lengthToBoundary` (9 bits)、局部 `iv` (14 bits)、`messageID` (12 bits)、`SerialNumber` (12 bits) 和 AONT 状态。

标头将在密文的随机位置插入，并在后续字符映射过程中经过进一步混淆，因此不会引入可统计的特征。

### 混合解密

用户可将多个密文消息混在一起解密，前提是它们均启用了灵活传输，且都使用同一个密钥加密。

解密时，解映射器通过 `lengthToBoundary` 精确识别出当前分段的边界，在分段交界处重置三重转轮的状态以避免跨段状态污染。随后，按照 MessageID 归类，并在同一消息下基于 SerialNumber 升序排列，合并拼接后执行 DeAONT 与解密。

::: tip 提示

当一次性导入多个属于不同消息(即 `MessageID` 不同)的密文段落进行合并解密时，**所有消息必须均启用了灵活分段传输，且加密密码必须保持一致**。

由于解密函数在单次运行中仅接受单一密钥参数，若各消息的密码不同，或未携带分段加密标头，将无法在同一次调用中成功解密。

:::

::: warning ID 碰撞

单条消息分段传输的分段数量上限为 4096 段。

两条独立随机生成 ID 的消息，发生 `MessageID` 碰撞的概率为 1/4096 (0.024%)；合并消息越多，碰撞概率越高。发生 ID 碰撞时，不应将这两条消息混合解密。MessageID 不提供发送方身份认证。

:::

## 配置参数

在调用 `WenyanInput` 加密时，可在配置项中传入 `FlexibleTransfer` 的相关参数：

- **Enable** (Boolean, 默认 `false`)：是否启用灵活分段传输。
- **UseAONT** (Boolean, 默认 `true`)：是否开启全有或全无转换。开启后需要完整分段才能恢复整条消息，但不代替完整性认证，且会导致加密解密时间稍微延长，以及一定的内存开销。
- **MessageID** (Number, 默认 `-1`)：消息辨识 ID(0~4095)。若设为 -1，系统会随机生成一个，用于在混合接收时区分不同消息。
- **RandomParagraphing** (Array, 默认 `[20, 80]`)：指定分段的字节数量上下限。范围为 `[10, 380]`，区间越小密文段落越短。

::: tip 提示

此处的自适应分段是**最外层(字节级)**的切片分段，与文言文仿真层中的**自适应分段**是两个独立且不相干的机制。

在开启灵活分段传输时，数据在最外层(字节级)进行切片分段，每段被独立加密成 Base64。此后各加密段被分别送入文言仿真层，并再次遵循文言文的自适应上限规则进行字符段落切分。

:::

::: warning 限制

在处理不同长度的数据时，可接受的每段字节数量上下限也有所不同。启用 AONT 时按整体压缩后的数据长度判断，关闭时按原始数据长度判断。

所有**参与分段的数据**长度在 40KB 以内时均可使用最低下限(10 字节)，若该数据长度 X 大于 40KB，则给定的每段字节数量下限 N 必须满足 `4096 * N >= X`，否则程序将会报错。

灵活分段传输能接受的最大数据长度为 1520KB(1.48MB)，若参与分段的数据长度大于此上限，程序也将报错。

:::

## 流程

### 加密与分段

```mermaid
flowchart TD
    Start([原始数据 Uint8Array]) --> AONT_Check{是否启用 AONT?}
    AONT_Check -- 是 --> EnAONT[EnAONT 混淆]
    AONT_Check -- 否 --> SegDist[分段长度计算]
    EnAONT --> SegDist

    SegDist --> SliceData["根据 ValueNoise1D 噪声<br/>自适应切片 [min, max] 字节"]
    SliceData --> LoopStart[遍历数据块]

    LoopStart --> EncryptChunk[逐块 AES-CTR 加密]
    EncryptChunk --> Base64Chunk[转为 Base64 并去除 Padding]
    Base64Chunk --> InsertHeader["随机插入 10 字符标头<br/>/=xxxxxxxx"]
    InsertHeader --> WenyanMap[文言文仿真映射]

    WenyanMap --> LoopNext{是否处理完所有块?}
    LoopNext -- 否 --> LoopStart
    LoopNext -- 是 --> Output[输出多段文言文密文]
```

### 解密与重组

```mermaid
flowchart TD
    Input([多段汉字密文]) --> deMap[解映射 deMap]
    deMap --> ScanMagic{检测到魔数 /=?}

    ScanMagic -- 是 --> ReadHeader["提取并解密 8 字符标头<br/>获取边界距离 lengthToBoundary"]
    ReadHeader --> ReachBoundary{到达当前分段边界?}
    ReachBoundary -- 是 --> SaveChunk["隔离保存分段数据<br/>重置转轮状态 RoundReset"]
    ReachBoundary -- 否 --> ContinueRead[继续解混淆 Base64 字符]
    ContinueRead --> ReachBoundary

    ScanMagic -- 否 --> OutputArray[输出分段数据对象数组]
    SaveChunk --> ScanMagic

    OutputArray --> GroupMsg[按 MessageID 分类归群]
    GroupMsg --> SortMsg[各分组内按 SerialNumber 升序排序]
    SortMsg --> DecryptMsg[逐段解密并合并字节流]
    DecryptMsg --> AONT_CheckD{分段是否含 AONT?}
    AONT_CheckD -- 是 --> DeAONT[执行反 AONT 逆变换]
    AONT_CheckD -- 否 --> Restore[还原出原始数据]
    DeAONT --> Restore
    Restore --> Finish([解密完成])
```
