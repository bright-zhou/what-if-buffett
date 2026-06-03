# What If Buffett

拖拽柱状图"篡改历史"，实时观察巴菲特 60 年投资生涯的蝴蝶效应。

→ 在线体验：[whatifbuffett.wozai.online](https://whatifbuffett.wozai.online/)

*[English](README.en.md)*

## 这是什么

一个交互式投资模拟器。展示沃伦·巴菲特 1965–2025 年共 61 年的实际投资收益率，你可以**直接拖拽图表中的柱子**修改某一年回报率，系统即时重算后续所有资产变化，直观感受复利的力量——以及一个决策如何改变终局。

三条曲线对比：

- **巴菲特实际**（蓝色）— 他的真实回报
- **标普 500**（灰色）— 同期指数基准
- **你的假设**（橙色）— 你修改后的"平行宇宙"

## 使用场景

- 理解复利效应："如果巴菲特 1970 年代亏了 50% 会怎样？"
- 感受摩擦成本："每年多扣 2% 管理费，60 年后差多少？"
- 验证直觉："去掉收益最差的那些年，最终资产能翻多少？"

## 数据来源

Berkshire Hathaway Annual Reports (1965–2025)，巴菲特历年致股东信中的年度收益率数据。

## 反馈

有问题、建议或好奇？欢迎到 [GitHub Issues](https://github.com/bright-zhou/what-if-buffett/issues) 一起讨论。

## 技术栈

React 19 + TypeScript + Vite + Recharts + Vitest。纯前端应用，无后端、无数据库。

## License

MIT
