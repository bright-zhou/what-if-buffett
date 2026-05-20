# What If Buffett — 产品设计文档

## 项目概述

交互式巴菲特投资收益率模拟器。用户通过拖拽图表中的收益率柱子"篡改历史"，实时观察对 60 年投资终局的影响，直观感受复利与长期价值投资的核心原则。

## MVP 范围

### 核心功能
- 复合图表：柱状图（年收益率）+ 折线图（资产值），三线并存（巴菲特实际 / 标普 500 / 用户假设）
- 拖拽修改收益率 → 后续资产自动重算（Forward Propagation）
- 关键数据卡（三值并列）：终局总资产、三种 CAGR、盈利年占比、最大回撤
- 支持重置所有调整为初始值

### V2 暂缓
- 亏损恢复期计算
- 破产边界提示
- "去掉最好的一年"一键实验
- 更多预设 What-If 场景
- 移动端收益编辑

## 技术栈

| 层级 | 选型 | 理由 |
|------|------|------|
| 框架 | React 19 | 业界标准，生态成熟 |
| 构建 | Vite | 零配置启动，HMR 极快 |
| 图表 | Recharts (D3-based) | React 声明式，拖拽事件可扩展 |
| 语言 | TypeScript | 类型安全，数据接口清晰 |
| 部署 | Vercel / GitHub Pages | 静态部署零运维 |

无后端、无数据库、无路由、无状态管理库。

## 架构

### 数据流（单向）

```
buffett-data.json
    ↓
useSimulator(rawData, userAdjustments)
    ↓ (forward propagation)
资产曲线 (3条) + 统计指标 (4项)
    ↓
ChartArea + SummaryCards
```

### 组件树

```
App
├─ Header（标题 + 一句话 hook）
├─ ChartArea
│  ├─ CombinedChart（Bar + Line 复合图）
│  └─ Legend（三色图例）
├─ SummaryCards（所有字段三值并列）
│  ├─ FinalAssets（终局总资产）
│  ├─ CAGRComparison（年化复合收益率）
│  ├─ WinRate（盈利年占比）
│  └─ MaxDrawdown（最大回撤）
└─ Footer（数据来源 + 重置按钮）
```

### 核心模块

- **useSimulator**：唯一的大脑。输入收益率数组 → 输出资产曲线 + 统计指标。纯计算，无副作用
- **buffett-data.json**：60 年数据，含 buffettAnnualReturn 和 sp500AnnualReturn

## 核心计算逻辑

### 复算规则

```
buffettAsset[n] = buffettAsset[n-1] × (1 + buffettReturn[n])  // 不变
sp500Asset[n]   = sp500Asset[n-1]   × (1 + sp500Return[n])    // 不变
userAsset[n]    = userAsset[n-1]    × (1 + userReturn[n])      // 用户调整
```

用户拖拽第 N 年 → `userReturn[N]` 更新 → `i = N to 2025` 全部重算。

### 统计指标

| 指标 | 公式 |
|------|------|
| 终局总资产 | 最后一年末资产值 |
| CAGR | (终局资产 / 初始资产) ^ (1/60) - 1 |
| 盈利年占比 | 正收益率年份数 / 60 |
| 最大回撤 | 从历史峰值到后续最低点的最大跌幅 |

## 交互设计

### 拖拽编辑
- 可拖拽范围：-100% ~ +200%（钳位）
- 鼠标按下（onMouseDown）→ 记录年份和起始 Y 值
- 鼠标拖动（onMouseMove）→ 按 Y 偏移换算收益率，requestAnimationFrame 节流
- 鼠标释放（onMouseUp）→ 锁定新值，触发重算
- 实时数值提示跟随鼠标

### 重置
- Footer 中提供重置按钮，一键恢复 userReturn = buffettReturn

## 数据结构

```typescript
interface YearData {
  year: number;           // 1965-2025
  buffettReturn: number;  // 巴菲特实际年收益率（小数，如 0.25）
  sp500Return: number;    // 标普 500 年收益率
}

interface SimulationResult {
  years: YearData[];
  userReturn: number[];   // 用户调整后的收益率
  buffettAsset: number[]; // 巴菲特资产曲线
  sp500Asset: number[];   // 标普资产曲线
  userAsset: number[];    // 用户资产曲线
  stats: {
    finalAssets: [number, number, number];  // [巴菲特, 标普, 用户]
    cagr: [number, number, number];
    winRate: [number, number, number];
    maxDrawdown: [number, number, number];
  };
}
```

## 边界情况

| 场景 | 处理方式 |
|------|----------|
| 收益率拖到 -100% | 资产归零，后续资产均为 0，不报错 |
| 收益率超出范围 | 钳位到 [-100%, +200%]，显示实际值但用钳位值计算 |
| 快速连续拖动 | requestAnimationFrame 节流 |
| 移动端触摸 | 仅只读显示，提示"请使用桌面端编辑" |

## 测试策略

- **回算验证**：初始态 userReturn = buffettReturn，userAsset 应与 buffettAsset 完全一致
- **暴力算验证**：指定某年调整为 X%，手动计算终局资产，与模拟器输出对比
- **拖拽交互验证**：鼠标事件触发与数值更新的正确性
- **重置验证**：重置后数据还原为初始值

MVP 以核心计算单元测试 + 手动验证为主，不做 UI 快照测试。

## 设计原则

- 奥卡姆剃刀：Less is more，MVP 是为验证和学习
- 数据驱动洞察，而非展示数据
- 所有比较三值并列，突显差异
