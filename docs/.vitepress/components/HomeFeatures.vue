<script setup>
import { onBeforeUnmount, onMounted, ref, computed, watch } from "vue";
import { withBase } from "vitepress";
import { markPayload } from "./homeCipher.js";
import {
  PAYLOAD_ALPHABET,
  PIPELINE_TRACE,
  SECURITY_PRESETS,
  TRANSFER_PRESET,
} from "./homePresets.js";
import PipelineDemo from "./PipelineDemo.vue";
import DilutionShowcase from "./DilutionShowcase.vue";
import TransferDemo from "./TransferDemo.vue";
import OfflineDemo from "./OfflineDemo.vue";
import FaqItem from "./FaqItem.vue";
import { useSceneClock } from "./useSceneClock.js";
const props = defineProps({
  loadEngine: Function,
  alphabet: String,
  cipher: String,
  original: String,
});
const root = ref(null);
const preset = ref(0);
const presetNames = ["随机 IV", "再加完整性校验", "再加口令派生"];
const security = ref(SECURITY_PRESETS);
const trace = ref(PIPELINE_TRACE);
const securityScene = ref(null);
const { time: securityTime, seek: seekSecurity } = useSceneClock(securityScene);
const openQuestion = ref(-1);
watch(
  () => Math.floor(securityTime.value / 3200) % 3,
  (index) => (preset.value = index)
);
function choosePreset(index) {
  preset.value = index;
  seekSecurity(index * 3200);
}
const packets = ref(
  TRANSFER_PRESET.packets.map((item) => ({
    number: item.number,
    tokens: markPayload(item.text, PAYLOAD_ALPHABET),
  }))
);
const packetResult = ref(TRANSFER_PRESET.result);
const failure = ref("");
const copied = ref(false);
let observer, copyTimer;

const securityRows = [
  { title: "AES-256-CTR", subtitle: "加密消息内容", minimum: 0 },
  { title: "StrongIV", subtitle: "使用完整的 128 位随机 IV", minimum: 0 },
  { title: "HMAC-SHA256", subtitle: "验证密文完整性", minimum: 1 },
  { title: "PBKDF2", subtitle: "提高口令猜测的计算成本", minimum: 2 },
];
const selectedSecurity = computed(() => security.value[preset.value]);
const code =
  "import { Abracadabra } from 'abracadabra-cn';\n\nconst abra = new Abracadabra();\nconst config = new Abracadabra.WenyanConfig();\nconfig.DilutionConfig = new Abracadabra.DilutionConfig(\n  true, 0.18, 'POEM', 'FIVE'\n);\nabra.WenyanInput('见字如晤', 'ENCRYPT', '你的魔咒', config);\nconst cipher = abra.Output();";
const questions = [
  {
    q: "这是 AI 生成的古文吗？",
    a: "不是。普通仿真通过句式和词性映射组织密文，Dilution 稀释模式则从真实古文、古诗和词的语料中选句。整个过程不调用语言模型，古文字面意思也不代表原文含义。",
    link: "wenyan",
    label: "查看文言文仿真原理",
  },
  {
    q: "能从古文的意思猜出原文吗？",
    a: "古文的字面意思与原文含义无关。魔曰先对数据加密，再将载荷映射到汉字，还原时需要使用魔曰和正确密钥，口令本身的强度也很重要。",
    link: "enc",
    label: "了解加密与混淆",
  },
  {
    q: "为什么原文很短，密文却长了很多？",
    a: "汉字映射、文言虚词与安全参数都需要额外空间。开启 Dilution 后，较低的目标载荷率通常会让同一条消息变成更长的诗文。魔曰会先尝试压缩，但长度、文貌和安全参数仍需按用途取舍。",
    link: "best-practise",
    label: "查看最佳实践",
  },
  {
    q: "稀释后的密文，解密也要同一份语料库吗？",
    a: "不需要。稀释改变的是承载数据的文本形式，接收方无需知道目标载荷率、文体、分布模式或语料库。保留完整密文，使用原来的密钥，即可按正常流程解密。",
    link: "dilution",
    label: "了解密文稀释",
  },
  {
    q: "目标载荷率越低，加密就越安全吗？",
    a: "载荷率调节的是字频、句式与载荷分布，不增加或减少密码学安全性，也不能保证防御所有统计攻击。降低目标载荷率通常会显著增加密文长度，在一定程度上增加统计分析的难度，但机密性仍取决于加密层的配置。",
    link: "dilution",
    label: "查看能力边界",
  },
  {
    q: "不用联网也能加密吗？",
    a: "可以。Demo 完成加载后可脱机运行，还可以安装 PWA、浏览器扩展或 Android 客户端。加密和解密由本地代码完成。",
    link: "quick-start",
    label: "选择适合你的使用方式",
  },
  {
    q: "更新版本后，旧密文还能用吗？",
    a: "魔曰优先保持向后解密兼容性。新版本通常可以解密旧密文，旧版本则未必能识别后续加入的功能，具体支持情况请查看兼容性矩阵。",
    link: "compatibility",
    label: "查看兼容性矩阵",
  },
  {
    q: "可以把魔曰用在自己的项目里吗？",
    a: "可以按 AIPL-1.2 许可使用与修改源代码。项目提供 JavaScript 核心库、WebAssembly 命令行形式及完整前端，接入和分发时请保留相应版权声明并遵循许可条款。",
    link: "LICENSE",
    label: "阅读完整许可",
  },
];

async function copyCode() {
  try {
    await navigator.clipboard.writeText(code);
    copied.value = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied.value = false), 2000);
  } catch {
    copied.value = false;
  }
}
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        entry.target.classList.toggle("in-view", entry.isIntersecting);
      }),
    { threshold: 0.1 }
  );
  root.value
    .querySelectorAll(".feature-section")
    .forEach((el) => observer.observe(el));
});
onBeforeUnmount(() => {
  observer?.disconnect();
  clearTimeout(copyTimer);
});
</script>

<template>
  <div ref="root" class="home-features">
    <DilutionShowcase :load-engine="loadEngine" />
    <section
      class="feature-section pipeline-section"
      aria-labelledby="pipeline-title"
    >
      <div class="section-intro">
        <span class="section-label">加密过程</span>
        <h2 id="pipeline-title">惜字如金<br /><span>落笔成文</span></h2>
        <p>
          短句、链接以至长文，皆可交付魔曰。依次经由压缩、流式加密、字符映射，最终织就文言章法，环环各司其职。
        </p>
        <a :href="withBase('/document/luhn-compress.html')">
          细览加密步骤 <span aria-hidden="true">↗</span></a
        >
      </div>
      <PipelineDemo :trace="trace" :alphabet="alphabet" />
    </section>

    <section
      class="feature-section security-section"
      aria-labelledby="security-title"
    >
      <div ref="securityScene" class="security-scene">
        <div class="security-stage">
          <div
            class="security-presets"
            role="group"
            aria-label="高级加密样例"
            :style="{ '--n': presetNames.length }"
          >
            <span
              class="security-pill"
              :style="{ transform: `translateX(${preset * 100}%)` }"
              aria-hidden="true"
            ></span>
            <button
              v-for="(name, index) in presetNames"
              :key="name"
              type="button"
              :aria-pressed="preset === index"
              @click="choosePreset(index)"
            >
              {{ name }}
            </button>
          </div>
          <div class="security-options">
            <div
              v-for="row in securityRows"
              :key="row.title"
              class="security-option"
              :class="{ enabled: preset >= row.minimum }"
            >
              <span class="option-check" aria-hidden="true">{{
                preset >= row.minimum ? "✓" : "+"
              }}</span>
              <div>
                <code>{{ row.title }}</code
                ><span>{{ row.subtitle }}</span>
              </div>
            </div>
          </div>
          <div class="security-result">
            <span>输出篇幅</span>
            <Transition name="number" mode="out-in"
              ><strong :key="preset"
                >{{ selectedSecurity?.length ?? "—" }}<small>字</small></strong
              ></Transition
            >
          </div>
        </div>
      </div>
      <div class="section-intro">
        <span class="section-label">安全配置</span>
        <h2 id="security-title">辞章为表<br /><span>密码为里</span></h2>
        <p>
          魔曰底层以标准 AES-256-CTR 加密消息。 可选 StrongIV 提供以完整随机
          IV；HMAC 以校验密文是否遭篡改；PBKDF2 以提高口令枚举成本。
        </p>
        <p>
          防护愈重，加密结果亦会相应变长。须按场景择取配置，并为高价值数据设定强密钥。
        </p>
        <a :href="withBase('/document/enc.html')"
          >查阅安全参数 <span aria-hidden="true">↗</span></a
        >
      </div>
    </section>

    <section
      class="feature-section transfer-section"
      aria-labelledby="transfer-title"
    >
      <div class="section-intro">
        <span class="section-label">分段传输</span>
        <h2 id="transfer-title">各行其道<br /><span>聚而成章</span></h2>
        <p>
          使用灵活分段传输功能，可将数据拆成多段，分别加密，分别发送。<br />
          收齐后无须顾虑顺序，魔曰自会辨序重组。
        </p>
        <p>若开启 AONT 全有或全无转换，须集齐全部片段才可解出原文。</p>
        <a :href="withBase('/document/flexible.html')"
          >了解灵活分段传输 <span aria-hidden="true">↗</span></a
        >
      </div>
      <TransferDemo :packets="packets" :result="packetResult" />
    </section>

    <section
      class="feature-section local-section"
      aria-labelledby="local-title"
    >
      <OfflineDemo />
      <div class="section-intro">
        <span class="section-label">离线运算</span>
        <h2 id="local-title">藏器于身<br /><span>何假外求</span></h2>
        <p>
          所有加解密均在本地完成，不经由任何服务端。载入后即可脱机使用，亦可自行部署前端环境。
        </p>
        <a :href="withBase('/document/frontend-deploy.html')"
          >查看前端与自部署方式 <span aria-hidden="true">↗</span></a
        >
      </div>
    </section>

    <section
      class="feature-section integration-section"
      aria-labelledby="integration-title"
    >
      <div class="integration-copy">
        <span class="section-label">多元入口</span>
        <h2 id="integration-title">简则易从<br /><span>引而即用</span></h2>
        <p>
          在线 Demo、浏览器扩展与 Android 端皆开箱可用。 开发者也可直接引入
          JavaScript 核心库，或在命令行调用 WebAssembly 版本。
        </p>
        <div class="entry-links">
          <a href="https://abra.js.org/">网页 Demo <span>↗</span></a
          ><a :href="withBase('/document/quick-start.html')"
            >扩展 / Android <span>↗</span></a
          ><a :href="withBase('/document/wasm-deploy.html')"
            >WebAssembly CLI <span>↗</span></a
          ><a :href="withBase('/document/frontend-deploy.html')"
            >自行部署 <span>↗</span></a
          >
        </div>
      </div>
      <div class="code-scene">
        <div class="code-stage">
          <div class="install-line">
            <span
              ><span aria-hidden="true">$</span> npm install
              abracadabra-cn</span
            >
            <button type="button" @click="copyCode">
              {{ copied ? "已复制 ✓" : "复制代码" }}
            </button>
          </div>
          <pre
            tabindex="0"
            aria-label="JavaScript 接入示例"
          ><code><span class="code-purple">import</span> { Abracadabra } <span class="code-purple">from</span> <span class="code-mint">'abracadabra-cn'</span>;

<span class="code-purple">const</span> abra = <span class="code-purple">new</span> Abracadabra();
<span class="code-purple">const</span> config = <span class="code-purple">new</span> Abracadabra.WenyanConfig();
config.DilutionConfig = <span class="code-purple">new</span> Abracadabra.DilutionConfig(
  <span class="code-purple">true</span>, 0.18, <span class="code-mint">'POEM'</span>, <span class="code-mint">'FIVE'</span>
);
abra.WenyanInput(
  <span class="code-mint">'见字如晤'</span>, <span class="code-mint">'ENCRYPT'</span>, <span class="code-mint">'你的魔咒'</span>, config
);
<span class="code-purple">const</span> cipher = abra.Output();<span class="code-caret animated" aria-hidden="true"></span></code></pre>
          <a class="code-doc" :href="withBase('/document/js-deploy.html')"
            >完整 API、参数配置与示例 <span aria-hidden="true">↗</span></a
          >
        </div>
      </div>
    </section>

    <section class="questions-section" aria-labelledby="questions-title">
      <div class="questions-heading">
        <span class="section-label">常见疑问</span>
        <h2 id="questions-title">落笔之前<br /><span>疑义相与析</span></h2>
        <a :href="withBase('/document/FAQ.html')"
          >查阅完整常见问题 <span aria-hidden="true">↗</span></a
        >
      </div>
      <div class="questions">
        <FaqItem
          v-for="(item, index) in questions"
          :key="item.q"
          :item="item"
          :index="index"
          :open="openQuestion === index"
          @toggle="openQuestion = openQuestion === index ? -1 : index"
        />
      </div>
    </section>
    <p v-if="failure" class="feature-error" role="status">{{ failure }}</p>
    <section class="community-section">
      <div>
        <span class="section-label">开源共享</span>
        <h2 id="contribution-title">海纳百川<br /><span>博采众议</span></h2>
        <p>
          代码悉数公开，欢迎查阅实现、商榷文体语料或提交改进。<br />使用与二次开发请遵循
          AIPL-1.2 开源许可。
        </p>
      </div>
      <div class="community-actions">
        <div class="community-buttons">
          <a
            class="community-primary"
            href="https://github.com/SheepChef/Abracadabra"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                stroke="none"
                d="M8 1.5a6.5 6.5 0 0 0-2.05 12.67c.32.06.44-.14.44-.31v-1.21c-1.8.39-2.18-.76-2.18-.76-.29-.75-.72-.95-.72-.95-.59-.4.04-.39.04-.39.65.05.99.67.99.67.58.99 1.52.7 1.89.54.06-.42.23-.7.41-.86-1.44-.16-2.95-.72-2.95-3.2 0-.71.25-1.29.67-1.74-.07-.16-.29-.82.06-1.72 0 0 .55-.18 1.79.66a6.2 6.2 0 0 1 3.26 0c1.24-.84 1.79-.66 1.79-.66.35.9.13 1.56.06 1.72.42.45.67 1.03.67 1.74 0 2.49-1.52 3.04-2.96 3.2.23.2.44.6.44 1.21v1.79c0 .17.12.38.45.31A6.5 6.5 0 0 0 8 1.5Z"
              /></svg
            >GitHub 仓库</a
          ><a
            class="community-secondary"
            :href="withBase('/document/quick-start.html')"
            >阅读文档
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" /></svg
          ></a>
        </div>
        <a
          class="community-tertiary"
          href="https://abra.js.org/"
          target="_blank"
          rel="noopener noreferrer"
          >进入在线演示 <span aria-hidden="true">↗</span></a
        >
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-features {
  --line: #ffffff12;
  --muted: #96909f;
  color: #eae9ef;
}

.home-features a {
  text-decoration: none;
  color: inherit;
}

.home-features a:focus-visible,
.home-features button:focus-visible,
.home-features pre:focus-visible {
  outline: 2px solid #c68cff;
  outline-offset: 5px;
}

.home-features button {
  font: inherit;
  cursor: pointer;
}

.feature-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 64px;
  padding: 64px 0;
  border-bottom: 1px solid var(--line);
}

.section-label {
  margin-left: 2px;
  display: block;
  font-size: 11px;
  color: #b795d2;
  letter-spacing: 1.1px;
  margin-bottom: 14px;
}

.section-intro {
  min-width: 0;
}

.section-intro h2,
.integration-copy h2,
.questions-heading h2,
.community-section h2 {
  font-family: var(--abra-font-serif);
  font-size: 34px;
  line-height: 1.4;
  font-weight: 400;
  letter-spacing: -0.02em;
  margin: 0 0 20px;
  text-wrap: balance;
}

.section-intro h2 > span,
.integration-copy h2 > span,
.questions-heading h2 > span,
.community-section h2 > span {
  color: #b1a2bf;
}

.section-intro p,
.integration-copy > p {
  color: #a19aa9;
  font-size: 14px;
  line-height: 1.95;
  margin-top: 12px;
  max-width: 420px;
  text-wrap: pretty;
}

.section-intro > a,
.questions-heading > a {
  display: inline-flex;
  gap: 10px;
  color: #cba5e9;
  font-size: 13px;
  margin-top: 23px;
}

.section-intro > a:hover,
.questions-heading > a:hover {
  color: #e0bdff;
}

.security-scene {
  min-width: 0;
  border: 1px solid #ffffff16;
  border-radius: 13px;
  background: #202026;
  padding: 5px;
  box-shadow: 0 24px 64px #06050a4d;
}

.security-stage {
  border: 1px solid #ffffff12;
  border-radius: 9px;
  background: #17171c;
  padding: 17px 18px 18px;
}

.security-presets {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--n, 3), minmax(0, 1fr));
  background: #131318;
  border: 1px solid #ffffff0d;
  border-radius: 6px;
  margin: 0 0 16px;
  padding: 3px;
}

.security-pill {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc((100% - 6px) / var(--n, 3));
  border-radius: 4px;
  background: #c68cff1a;
  box-shadow: inset 0 0 0 1px #c68cff26;
  pointer-events: none;
  transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.security-presets button {
  position: relative;
  z-index: 1;
  padding: 7px 6px;
  min-width: 0;
  color: #8f839c;
  font-size: 12px;
  border-radius: 4px;
  background: none;
  white-space: nowrap;
  transition: color 0.35s;
}

.security-presets button[aria-pressed="true"] {
  color: #e4c6ff;
}

.security-presets button:hover {
  color: #dec8ee;
}

.security-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px solid #ffffff08;
  opacity: 0.64;
  transition: opacity 0.5s;
}

.security-option.enabled {
  opacity: 1;
}

.option-check {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #51405f;
  border-radius: 4px;
  width: 19px;
  height: 19px;
  color: #8a739c;
  transition: background 0.4s, color 0.4s;
}

.enabled .option-check {
  background: #98dbc512;
  border-color: #98dbc538;
  color: #98dbc5;
}

.security-option > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.security-option code {
  font: 12px var(--vp-font-family-mono);
  color: #cbbbd9;
}

.security-option > div > span {
  font-size: 11px;
  color: #9586a3;
}

.security-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0 4px;
  font-size: 11px;
  color: #a190ae;
}

.security-result strong {
  font-size: 24px;
  font-weight: 500;
  line-height: 1;
  color: #d4aff6;
  font-variant-numeric: tabular-nums;
}

.security-result small {
  font-size: 11px;
  font-weight: 400;
  margin-left: 6px;
  color: #a28eaf;
}

.number-enter-active,
.number-leave-active {
  transition: transform 0.2s, opacity 0.2s, filter 0.2s;
}

.number-enter-from {
  opacity: 0;
  transform: translateY(5px);
  filter: blur(3px);
}

.number-leave-to {
  opacity: 0;
  transform: translateY(-5px);
  filter: blur(3px);
}

.integration-section {
  gap: 55px;
  padding-block: 76px;
}

.integration-copy > p {
  max-width: 400px;
}

.entry-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
  margin-top: 22px;
  max-width: 370px;
}

.entry-links a {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  color: #c2abcf;
  padding: 13px 0;
  border-bottom: 1px solid var(--line);
}

.entry-links a:hover {
  color: #dfbaff;
}

.entry-links span {
  color: #83708f;
}

.code-scene {
  min-width: 0;
  padding: 5px;
  border: 1px solid #ffffff16;
  border-radius: 13px;
  overflow: hidden;
  background: #202026;
  box-shadow: 0 24px 64px #06050a4d;
}

.code-stage {
  border: 1px solid #ffffff12;
  border-radius: 9px;
  background: #17171c;
  overflow: hidden;
}

.install-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  color: #bba9c8;
  font: 12px/1.8 var(--vp-font-family-mono);
  border-bottom: 1px solid var(--line);
  background: #131318;
  overflow-wrap: anywhere;
}

.install-line > span > span {
  color: #766582;
  margin-right: 10px;
}

.install-line button {
  background: none;
  color: #9683a6;
  font: 11px var(--vp-font-family-base);
  padding: 3px 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.install-line button:hover {
  color: #d5aff1;
}

.code-scene pre {
  overflow: auto;
  padding: 21px 18px;
  margin: 0;
  font: 12px/1.9 var(--vp-font-family-mono);
  color: #c3b9cf;
}

.code-purple {
  color: #c68cff;
}

.code-mint {
  color: #98dbc5;
}

.code-caret {
  display: inline-block;
  height: 13px;
  width: 5px;
  background: #c68cff;
  margin-left: 3px;
  vertical-align: middle;
  animation: caret 1.2s step-end infinite;
}

.code-doc {
  display: flex;
  justify-content: space-between;
  margin: 0 18px;
  padding: 14px 0;
  border-top: 1px solid var(--line);
  font-size: 11px;
  color: #a688bd !important;
}

.questions-section {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 70px;
  padding: 76px 0 70px;
}

.questions-heading h2 {
  margin-bottom: 0;
}

.questions-heading > a {
  margin-top: 21px;
}

.community-section {
  border-top: 1px solid var(--line);
  padding: 54px 0 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.community-section h2 {
  font-size: 28px;
  margin-bottom: 12px;
}

.community-section p {
  font-size: 14px;
  color: #9e8fa8;
  line-height: 1.9;
}

.community-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  flex-shrink: 0;
}

.community-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.community-primary,
.community-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 17px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  transition: background 0.22s, border-color 0.22s, color 0.22s, transform 0.22s,
    box-shadow 0.22s;
}

.community-primary svg,
.community-secondary svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.community-primary {
  background: linear-gradient(180deg, #c68cff38 0%, #9b5ae024 100%);
  color: #f3ecff !important;
  border: 1px solid #c68cff61;
  box-shadow: inset 0 1px 0 #ffffff24, 0 6px 20px #9f5ae61c;
}

.community-primary svg {
  opacity: 0.92;
}

.community-primary:hover {
  background: linear-gradient(180deg, #c68cff4d 0%, #9b5ae033 100%);
  border-color: #c68cff8c;
  transform: translateY(-1px);
  box-shadow: inset 0 1px 0 #ffffff2e, 0 8px 24px #c68cff26;
}

.community-secondary {
  background: #ffffff06;
  color: #cbc2d8 !important;
  border: 1px solid #ffffff16;
  box-shadow: inset 0 1px 0 #ffffff0c;
}

.community-secondary svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.community-secondary:hover {
  background: #ffffff0d;
  border-color: #ffffff2a;
  color: #efeaf6 !important;
  transform: translateY(-1px);
}

.community-secondary:hover svg {
  transform: translateX(3px);
}

.community-tertiary {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #9e91ad !important;
  transition: color 0.2s;
}

.community-tertiary span {
  display: inline-block;
  transition: transform 0.2s;
}

.community-tertiary:hover {
  color: #dec2fa !important;
}

.community-tertiary:hover span {
  transform: translate(2px, -2px);
}

.feature-error {
  font-size: 11px;
  color: #b19cbe;
}

.animated {
  animation-play-state: paused !important;
}

.in-view .animated {
  animation-play-state: running !important;
}

@keyframes caret {
  50% {
    opacity: 0;
  }
}

@media (max-width: 960px) {
  .feature-section {
    gap: 35px;
    padding: 55px 0;
  }

  .section-intro h2,
  .integration-copy h2,
  .questions-heading h2 {
    font-size: 29px;
  }

  .community-section h2 {
    font-size: 25px;
  }

  .security-scene,
  .code-scene {
    padding: 4px;
  }

  .security-stage {
    padding: 14px;
  }

  .security-presets button {
    padding-inline: 4px;
  }

  .questions-section {
    gap: 35px;
  }
}

@media (max-width: 640px) {
  .feature-section {
    grid-template-columns: minmax(0, 1fr);
    gap: 25px;
    padding: 43px 0;
  }

  .section-label {
    margin-left: 2px;
    font-size: 11px;
    margin-bottom: 11px;
  }

  .section-intro h2,
  .integration-copy h2,
  .questions-heading h2 {
    font-size: 26px;
    margin-bottom: 14px;
  }

  .community-section h2 {
    font-size: 23px;
    margin-bottom: 12px;
  }

  .section-intro p,
  .integration-copy > p,
  .community-section p {
    font-size: 13px;
    line-height: 1.95;
    max-width: none;
  }

  .section-intro > a,
  .questions-heading > a {
    font-size: 12px;
    margin-top: 17px;
  }

  .security-scene {
    order: 2;
    padding: 4px;
  }

  .security-stage {
    padding: 13px 12px 14px;
  }

  .local-section > :first-child {
    order: 2;
  }

  .security-presets button {
    font-size: 11px;
    padding: 7px 4px;
  }

  .security-option {
    padding: 12px 0;
  }

  .security-result strong {
    font-size: 20px;
  }

  .integration-section {
    padding-block: 43px;
  }

  .entry-links {
    max-width: none;
    margin-top: 15px;
    gap: 0 16px;
  }

  .entry-links a {
    font-size: 12px;
  }

  .code-scene pre {
    font-size: 11px;
  }

  .install-line {
    font-size: 11px;
  }

  .questions-section {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
    padding: 43px 0;
  }

  .questions-heading h2 br {
    display: none;
  }

  .questions-heading h2 span {
    display: block;
  }

  .questions-heading > a {
    margin-top: 13px;
  }

  .community-section {
    align-items: flex-start;
    flex-direction: column;
    padding: 35px 0 39px;
    gap: 24px;
  }

  .community-actions {
    align-items: flex-start;
    gap: 12px;
  }

  .community-buttons {
    justify-content: flex-start;
  }

  .community-primary,
  .community-secondary {
    font-size: 13px;
    min-height: 36px;
    padding: 0 15px;
  }

  .community-tertiary {
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-features * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
