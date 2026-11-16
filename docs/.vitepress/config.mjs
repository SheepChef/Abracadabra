import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

const SITE_URL = "https://abracadabra.js.org";
const SITE_NAME = "Abracadabra 魔曰";
const SITE_DESCRIPTION =
  "Abracadabra 魔曰是安全，高效的文本加密工具，可以将数据加密为汉字构成的文言文、古诗或词。";

// https://vitepress.dev/reference/site-config
export default withMermaid({
  lang: "zh-CN",
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  sitemap: {
    hostname: SITE_URL,
  },
  head: [
    ["link", { rel: "icon", href: "/logo.png" }],
    [
      "meta",
      {
        name: "keywords",
        content:
          "Abracadabra, 魔曰, 文本加密, 古文加密, 文言文加密, AES-256, 密文稀释, 本地加密, 隐私工具, 开源加密",
      },
    ],
    ["meta", { name: "author", content: "SheepChef" }],
    ["meta", { property: "og:site_name", content: SITE_NAME }],
    ["meta", { property: "og:locale", content: "zh_CN" }],
    ["meta", { property: "og:image", content: `${SITE_URL}/logo.png` }],
    ["meta", { name: "twitter:card", content: "summary" }],
    [
      "meta",
      {
        name: "google-site-verification",
        content: "NDhYJs2rXcRRZ4pfZBJxmshD0CQ8iYWc6p7YHT0ArG4",
      },
    ],
  ],
  transformHead({ pageData }) {
    const cleanPath = pageData.relativePath
      .replace(/(^|\/)index\.md$/, "$1")
      .replace(/\.md$/, ".html");
    const canonicalUrl = `${SITE_URL}/${cleanPath}`;
    const isHome = pageData.relativePath === "index.md";
    const pageTitle = pageData.frontmatter?.title || pageData.title;
    const fullTitle = pageTitle ? `${pageTitle} | ${SITE_NAME}` : SITE_NAME;
    const pageDesc =
      pageData.frontmatter?.description ||
      pageData.description ||
      SITE_DESCRIPTION;

    const head = [
      ["link", { rel: "canonical", href: canonicalUrl }],
      ["meta", { property: "og:url", content: canonicalUrl }],
      ["meta", { property: "og:type", content: isHome ? "website" : "article" }],
      ["meta", { property: "og:title", content: fullTitle }],
      ["meta", { property: "og:description", content: pageDesc }],
      ["meta", { name: "twitter:title", content: fullTitle }],
      ["meta", { name: "twitter:description", content: pageDesc }],
    ];

    if (isHome) {
      head.push([
        "script",
        { type: "application/ld+json" },
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: SITE_NAME,
          alternateName: "魔曰",
          url: `${SITE_URL}/`,
          applicationCategory: "SecurityApplication",
          operatingSystem: "Web, Android, Windows, macOS, Linux",
          softwareVersion: "3.8.0",
          inLanguage: "zh-CN",
          isAccessibleForFree: true,
          description: pageDesc,
          author: {
            "@type": "Person",
            name: "SheepChef",
            url: "https://shef.cc",
          },
          sameAs: [
            "https://github.com/SheepChef/Abracadabra",
            "https://abra.js.org",
          ],
        }),
      ]);
    }

    return head;
  },

  themeConfig: {
    nav: [
      { text: "主页", link: "/" },
      { text: "文档", link: "/document/quick-start.md" },
      { text: "Demo", link: "https://abra.js.org" },
    ],

    outline: { level: [2, 3] },

    sidebar: [
      { text: "快速开始", link: "/document/quick-start.md" },
      { text: "功能对比", link: "/document/comparison.md" },
      { text: "密文兼容性", link: "/document/compatibility.md" },
      {
        text: "编译和部署",
        collapsed: false,
        items: [
          { text: "JavaScript", link: "/document/js-deploy.md" },
          { text: "WebAssembly(CLI)", link: "/document/wasm-deploy.md" },
          {
            text: "前端页面和浏览器插件",
            link: "/document/frontend-deploy.md",
          },
        ],
      },
      {
        text: "技术细节",
        collapsed: false,
        items: [
          { text: "压缩和校验", link: "/document/luhn-compress.md" },
          { text: "加密和混淆", link: "/document/enc.md" },
          { text: "灵活分段传输", link: "/document/flexible.md" },
          { text: "字符映射", link: "/document/character.md" },
          { text: "文言文仿真", link: "/document/wenyan.md" },
          { text: "密文稀释", link: "/document/dilution.md" },
        ],
      },
      {
        text: "使用指引",
        collapsed: false,
        items: [
          { text: "Demo 使用指南", link: "/document/demo-usage.md" },
          { text: "最佳操作实践", link: "/document/best-practise.md" },
          { text: "常见问题和使用提示", link: "/document/FAQ.md" },
        ],
      },
      { text: "LLM 基准测试", link: "/document/bench.md" },
      { text: "鸣谢", link: "/document/thanks.md" },
      { text: "Demo页", link: "https://abra.js.org" },
      { text: "GitHub仓库", link: "https://github.com/SheepChef/Abracadabra" },
    ],

    logo: "/logo.png",
    socialLinks: [
      { icon: "github", link: "https://github.com/SheepChef/Abracadabra" },
    ],
    // 文章翻页
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },

    // 移动端 - 外观
    darkModeSwitchLabel: "外观",
    outlineTitle: "本页目录",

    // 移动端 - 返回顶部
    returnToTopLabel: "返回顶部",

    // 移动端 - menu
    sidebarMenuLabel: "菜单",
    footer: {
      message: "中国制造 • AIPL-1.2许可",
      copyright:
        "Copyright © 2025-present <a href='https://shef.cc' target='_blank'>SheepChef</a>",
    },
  },
  markdown: {
    image: {
      lazyLoading: true,
    },
  },
});
