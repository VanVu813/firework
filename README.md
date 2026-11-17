# 🎆 烟花乐园 Firework Fun

一个给小朋友玩的放烟花网页游戏。夜晚星空下，点按天空即可发射绚丽烟花。

A fireworks web game for kids. Tap the night sky to launch beautiful fireworks.

## ✨ 玩法 How to Play

- **点按天空** — 从地面发射烟花，在点击处绽放 / Tap the sky to launch a firework
- **底部选择栏** — 7 种烟花任选：🌸樱花雨 ✨金菊 🌈彩虹环 💥大丽花 ❤️爱心 🐟流星鱼 🎁惊喜盲盒
- **🎆 自动秀** — 自动随机放烟花，适合小小朋友 / Auto show mode for the littlest ones
- **🔊 音效开关** — Web Audio 程序化生成的发射与爆炸声 / Procedural sound effects
- **中/EN** — 一键切换中英文界面 / Toggle Chinese & English UI

## 🚀 本地运行 Run Locally

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

纯 HTML/CSS/原生 JavaScript，零依赖，支持触屏与鼠标。

Pure HTML/CSS/vanilla JS. Zero dependencies. Touch & mouse friendly.

## 🌐 在线游玩 Play Online

GitHub Pages: https://vanvu813.github.io/firework/

## 📁 结构 Structure

```
├── index.html        # 页面入口
├── css/style.css     # 界面样式
└── js/
    ├── main.js       # 游戏主循环、夜空背景
    ├── fireworks.js  # 粒子系统与烟花类型
    ├── audio.js      # Web Audio 程序化音效
    └── ui.js         # 双语 UI、选择栏、自动秀
```
