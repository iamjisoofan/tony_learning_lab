# CLAUDE.md

本文件为 Claude Code 在本仓库工作时提供指引。

## 项目目标

辅助孩子学习的工具集。已实现「听写辅助」，规划中：「错题辅助」「学科辅助学习」等。功能会持续叠加，因此目录结构按**功能模块（feature）**组织，便于横向扩展。

## 技术栈

- Vite + React 19 + TypeScript（严格模式）
- TanStack Router：**文件式路由**，路由树由 `@tanstack/router-plugin` 自动生成到 `src/routeTree.gen.ts`（已 gitignore，勿手动编辑）
- TanStack Query：异步/服务端状态管理，已在 `main.tsx` 中提供 Provider，供后续功能使用
- 浏览器 Web Speech API（`window.speechSynthesis`）做听写朗读，无后端、无第三方依赖

## 常用命令

```bash
npm run dev        # 开发服务器（http://localhost:5173）
npm run build      # tsc 类型检查 + vite 生产构建
npm run typecheck  # 仅类型检查
npm run preview    # 预览生产构建
```

## 代码组织约定

- `src/routes/*` 只放路由声明与页面装配，尽量薄；具体业务实现放在 `src/features/<功能>/`。
- 新增功能：`features/` 下建模块 → `routes/` 下加路由文件 → 首页 `index.tsx` 的 `features` 数组里加入口卡片。
- 路由树自动生成：新增/重命名 `routes/` 下文件后，`vite dev` 会自动更新 `routeTree.gen.ts`。

## 注意事项

- 面向儿童：界面用中文、文案简洁友好、按钮大而清晰。
- 语音质量依赖操作系统语音包，代码里对「不支持/无匹配语音」要有兜底（见 `useSpeech.ts`）。
- 改动后用 `npm run typecheck` 验证类型，再用 `npm run build` 确认可构建。
