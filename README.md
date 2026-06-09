# What If Buffett

拖拽柱状图"篡改历史"，实时观察巴菲特 60 年投资生涯的蝴蝶效应。

→ 在线体验：[whatifbuffett.wozai.online](https://whatifbuffett.wozai.online/)

*[English](README.en.md)*

## 这是什么

一个交互式投资模拟器。展示沃伦·巴菲特 1965–2025 年共 61 年的实际投资收益率，你可以**拖拽柱子修改回报率、调节摩擦成本和杠杆倍数**，系统即时重算，直观感受复利的力量——以及一个决策如何影响终局。

三条曲线对比：

- **巴菲特实际**（蓝色）— 巴菲特的真实回报
- **标普 500**（灰色）— 同期指数基准
- **你的假设**（橙色）— 你修改后的"平行宇宙"

## 使用场景

- 理解复利效应："如果巴菲特 1970 年代亏了 50% 会怎样？"
- 量化摩擦成本："每年 2% 的摩擦成本，60 年会吞噬多少复利？"
- 杠杆的双刃剑："加了 2x 杠杆，是让复利飞得更快，还是让回撤摔得更惨？"

## 数据来源

Berkshire Hathaway Annual Reports (1965–2025)，巴菲特历年致股东信中的年度收益率数据。

## 反馈

有问题、建议或好奇？欢迎到 [GitHub Issues](https://github.com/bright-zhou/what-if-buffett/issues) 一起讨论。

## 技术栈

React 19 + TypeScript + Vite + Recharts + Vitest。纯前端应用，无后端、无数据库。

## License

MIT
