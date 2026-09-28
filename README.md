# MC 百科全书

一个纯静态的 Minecraft 百科网页：**先选版本，再看内容**。

打开后第一屏让你选择 **Java 版** 还是 **基岩版（Bedrock）**，
之后所有分类、条目、搜索都会按所选版本过滤——只属于另一版本的内容会自动隐藏，
并在页面上提示"另有 N 条属于 XX 版专属内容"。

## 在线访问

推到 GitHub 后开启 Pages 即可直接用浏览器打开，无需后端、无需构建。

## 本地运行

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

或者直接双击 `index.html`（纯静态，无构建依赖）。

## 流程

```
选版本（Java / 基岩）
   ↓
首页（各分类预览卡片）
   ↓
分类页（生物 / 方块 / 物品 / 附魔 / 状态效果 / 维度 / 结构 / 红石 / 进度与成就 / 核心机制）
   ↓
条目详情（信息框 + 属性表 + 正文小节 + 版本差异 + 相关条目）
```

随时可：顶部搜索、🎲 随机条目、右上角切换版本、🌙 切换深浅主题。

## 内容规模

| 分类 | 条目数 |
|---|---|
| 生物 | 23 |
| 方块 | 20 |
| 物品 | 17 |
| 附魔 | 16 |
| 状态效果 | 14 |
| 维度 | 3 |
| 结构 | 11 |
| 红石 | 10 |
| 进度与成就 | 11 |
| 核心机制 | 10 |
| **合计** | **135** |

其中 **仅 Java 版** 7 条、**仅基岩版** 6 条，17 条带有明确的版本差异说明。

## 版本差异的处理

不只是"有没有"，而是把差异做成可查条目：

- **进度 vs 成就**——Java 用树状 progress，基岩用线性 achievement，两个系统不互通
- **准连接性**（仅 Java）——这是"Java 红石机器搬到基岩就失灵"的根源
- **TNT 复制**（仅 Java）——基岩没有等价机制
- **水桶装鱼**（仅基岩）——Java 的桶装不了生物
- **攻击冷却**——两版战斗手感差异的主要来源
- **凋灵血量**——基岩版更高，且过半会召唤凋灵骷髅
- **区块模拟距离**——Java 分模拟/渲染两个设置，基岩只有一个滑块

## 界面：Material Design 3

整套界面按 Material Design 3（Material You）规范实现。

**配色**——MD3 tonal palette，由种子色生成 `primary / secondary / tertiary / surface / outline` 全套角色色，
深浅两套主题各一份：

| 版本 | 种子色 | 主色 |
|---|---|---|
| Java 版 | 草绿 | `#3E6B22`（亮色）/ `#A5CC7F`（暗色） |
| 基岩版 | 青蓝 | `#00658A`（亮色）/ `#7FCCFF`（暗色） |

**切版本 = 换一整套配色**，这就是 MD3 的 dynamic color——不只是换个强调色，
`primary-container`、`secondary-container`、`surface` 等整组角色色都会跟着变。

**组件**（均按 MD3 规范落地）：

| 组件 | 规格 |
|---|---|
| Top App Bar | 高 64px，滚动后升到 elevation 2 |
| Search bar | 全圆角 28px，48px 高，无下划线 |
| Navigation Drawer | 桌面常驻（280px），移动端 Modal（含 scrim） |
| Drawer item | 高 56px，全圆角，选中态 `secondary-container` |
| Card | Filled Card，圆角 12/16px，hover 升 elevation |
| Chip | Assist / Filter，高 24–32px，圆角 8px |
| Button | Filled / Tonal / Text，全圆角，高 40px |
| FAB | 56×56，圆角 16px，elevation 3 |
| Snackbar | 圆角 4px，`inverse-surface`，自动消隐 |
| Menu | 下拉菜单，圆角 12px，elevation 2 |

**其他**：shape scale（4/8/12/16/28/full）、elevation level 0–5、
emphasized easing、state layer（hover/focus/pressed 叠加层）、
MD3 type scale（display / headline / title / body / label）。

图标为内联 SVG（Material Symbols 风格路径）+ emoji，不依赖外链字体。

## 文件

```
index.html   页面结构（版本选择屏 + 百科主体）
styles.css   MD3 设计系统：tonal palette + shape + elevation + 全套组件
data.js      135 个条目的数据（10 个分类）
app.js       SPA 路由、版本过滤、搜索、随机、主题、Snackbar
```

## 说明

- 数据基于公开通用的 Minecraft 知识整理，随版本更新可能有出入
- 所有数值以游戏内实测为准；涉及版本差异的部分已在条目中标注
- 无图片资源，条目图标统一用 emoji 占位，避免外链失效
