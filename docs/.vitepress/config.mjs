import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default withMermaid({
  lang: "zh-CN",
  title: "Abracadabra 魔曰",
  description:
    "Abracadabra 魔曰是安全，高效的文本加密工具，可以将数据加密为汉字构成的文言文。",
  head: [
    ["link", { rel: "icon", href: "/logo.png" }],
    [
      "meta",
      {
        name: "keywords",
        content:
          "加密, 文本加密, 链接加密, 隐私工具, 数据安全, 安全, 网络安全, 密码, 汉字编码, 中文",
      },
    ],
    ["meta", { name: "author", content: "SheepChef" }],
    [
      "meta",
      {
        property: "og:title",
        content: "魔曰 — 古文风文本加密工具",
      },
    ],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Abracadabra 魔曰，是安全高效的文本加密工具，可以将数据加密为汉字构成的文言文",
      },
    ],
    ["meta", { property: "og:url", content: "https://abracadabra.js.org" }],
    [
      "meta",
      { property: "og:image", content: "https://abracadabra.js.org/logo.png" },
    ],
    [
      "meta",
      {
        name: "google-site-verification",
        content: "NDhYJs2rXcRRZ4pfZBJxmshD0CQ8iYWc6p7YHT0ArG4",
      },
    ],
  ],

  themeConfig: {
    nav: [
      { text: "主页", link: "/" },
      { text: "文档", link: "/document/quick-start.md" },
      { text: "Demo", link: "https://abra.js.org" },
    ],

    sidebar: [
      { text: "快速开始", link: "/document/quick-start.md" },
      { text: "功能对比", link: "/document/comparison.md" },
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
          { text: "压缩和校验管线", link: "/document/luhn-compress.md" },
          { text: "加密和混淆管线", link: "/document/enc.md" },
          { text: "字符映射管线", link: "/document/character.md" },
          { text: "文言文仿真管线", link: "/document/wenyan.md" },
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
      { text: "AI基准测试", link: "/document/bench.md" },
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
      message: "中国制造 • AIPL-1.1许可",
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
