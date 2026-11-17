# 🎆 儿童乐园 Kids Land

一个给小朋友玩的多功能网页应用（iPad 优先，兼容手机/电脑）。
 currently 包含两个应用：放烟花 + 字母学习，后续可持续扩展新模块。

A multi-module kids web app (iPad-first). Currently includes **Fireworks** and **ABC Land**, designed to grow.

## 🏠 首页应用台 Home

大图标启动台，一键进入各模块；已学字母进度显示在学字母卡片上。
Big-icon launcher; learned-letters progress shown on the ABC card.

## 🎆 放烟花 Fireworks

- 点按天空发射烟花，7 种特效任选：🌸樱花雨 ✨金菊 🌈彩虹环 💥大丽花 ❤️爱心 🐟流星鱼 🎁惊喜盲盒
- 🎆 自动秀模式 / 🔊 程序化音效 / 烟花效果随屏幕大小自适应
- Tap the sky! 7 firework types, auto-show mode, procedural sound effects.

## 🔤 学字母 ABC Land（字母墙 / 学习 / 描红 / 考试，一个应用全包）

字母显示使用**手写体**（Patrick Hand，iPad 上回退 Chalkboard SE/Comic Sans），小写 a/g 等为单层书写字形，贴近孩子手写作业的字母形状。

- **字母墙**：A–Z 大格子，学过的盖 ⭐ 章（本地记忆进度）；右上角"去考试"直达测验
- **学习页**：大写金色/小写蓝色点读发音，单词卡 emoji 配图（点卡片听单词读音），中英对照
- **描红跟写**：虚线字母引导 + 手指描摹容差检测 + 完成度进度条，写完语音鼓励
- **字母考试**：自由勾选几个 / 一键全部 / 从 X 到 Y 区间选字母（可组合），三种题型随机：听音找字母、大小写配对、看图找首字母；答错可重试无惩罚，满分有奖杯；结算可一键"放烟花庆祝"跳回烟花模块自动秀
- 发音使用 iPad/浏览器内置 TTS（Web Speech API），无需音频文件
- Letter wall with progress stars, tap-to-speak uppercase/lowercase, emoji word cards,
  guided tracing with tolerance check, and a customizable quiz (pick letters / all / range A–E)
  with three question types and a fireworks celebration reward.

## 🚀 运行 Run

```bash
python3 -m http.server 8000   # 打开 http://localhost:8000
```

纯 HTML/CSS/原生 JavaScript，零依赖，支持触屏（手指/Apple Pencil）、鼠标。

Pure HTML/CSS/vanilla JS. Zero dependencies. Touch (finger/Apple Pencil) & mouse friendly.

## 🌐 在线 Online

https://vanvu813.github.io/firework/

## 📁 结构 Structure

```
├── index.html            # 应用外壳(hash 路由 + 双语顶栏)
├── css/
│   ├── style.css         # 共享样式 + 首页
│   ├── fireworks.css     # 烟花模块
│   └── abc.css           # 字母模块
└── js/
    ├── core.js           # 路由 / i18n / 本地存档 / 外壳
    ├── speech.js         # Web Speech TTS 发音引擎
    ├── home.js           # 首页启动台
    ├── fireworks/        # 烟花模块
    └── abc/              # 字母模块
        ├── data/letters.js  # 26 字母 × 3-4 个单词词库
        ├── home.js          # 字母墙
        ├── learn.js         # 学习页
        ├── trace.js         # 描红跟写
        └── quiz.js          # 考试页
```
