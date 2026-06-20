# 学习小帮手（Tony Learning Lab）

辅助孩子学习的工具集。第一个功能是**听写辅助**，后续规划**错题辅助**、**学科辅助学习**等。

## 技术栈

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript
- [TanStack Router](https://tanstack.com/router)（文件式路由，自动生成路由树）
- [TanStack Query](https://tanstack.com/query)（数据/异步状态管理，为后续功能预留）
- 听写朗读使用浏览器内置 **Web Speech API**（无需联网或第三方服务）

## 快速开始

```bash
npm install
npm run dev      # 启动开发服务器，默认 http://localhost:5173
```

其他命令：

```bash
npm run build      # 类型检查 + 生产构建
npm run preview    # 本地预览生产构建
npm run typecheck  # 仅类型检查
```

## 目录结构

```
src/
  main.tsx                  # 入口，挂载 Router + Query Provider
  routeTree.gen.ts          # 路由树（自动生成，已 gitignore）
  styles.css                # 全局样式
  routes/                   # 文件式路由（每个文件 = 一个页面）
    __root.tsx              # 根布局（顶部导航 + Outlet）
    index.tsx               # 首页（功能入口）
    dictation.tsx           # 听写页（挂载 DictationApp）
  features/                 # 各功能模块的业务实现
    dictation/
      DictationApp.tsx      # 听写主界面与流程控制
      useSpeech.ts          # Web Speech API 语音合成封装
      wordLists.ts          # 内置词单（可扩展为自定义/导入）
```

## 新增一个功能（约定）

1. 在 `src/features/<功能名>/` 下实现业务组件。
2. 在 `src/routes/` 下新增对应路由文件，引入该组件。
3. 在 `src/routes/index.tsx` 的 `features` 列表里加一张入口卡片。

路由树会在运行 `npm run dev` 时由 `@tanstack/router-plugin` 自动生成，无需手写。

## 听写功能说明

- 选择词单、调整语速 / 每词遍数 / 间隔时间后点击「开始」。
- 程序逐个朗读词语并隐藏文字，孩子边听边写；可「重读本词」「显示答案」。
- 词单目前内置在 `wordLists.ts`，后续可扩展为家长自定义、文件导入或后端获取。

> 提示：语音质量取决于操作系统/浏览器安装的中文、英文语音包。推荐使用最新版 Chrome / Edge / Safari。
