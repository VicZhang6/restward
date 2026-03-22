# Implementation Plan: 6 Features

## Implementation Order (dependencies considered)

i18n 放最后做，因为它需要提取所有文件中的字符串。先加完新功能，再统一做国际化。

---

## Phase 1: 休息动作建议 (Exercise Suggestions)
**Scope:** 最简单，只改 reminder 窗口

### Changes:
1. **`app-shared.js`** — 新增 `exercises` 数据数组（15-20条中英文建议），新增 `getRandomExercise()` 函数
2. **`reminder.html`** — 在提醒卡片中添加一个建议展示区域（图标 + 建议文字），替换固定的 tips 文字
3. **`renderer.js`** — 页面加载时调用 `getRandomExercise()` 并填充 DOM

---

## Phase 2: 提醒音效 (Sound Effects via Web Audio API)
**Scope:** reminder 窗口播放音效 + 控制面板设置

### Changes:
1. **`app-shared.js`** — 新增 STORAGE_KEYS: `soundEnabled`, `soundType`。新增 `getStoredSoundEnabled()`, `setStoredSoundEnabled()`, `getStoredSoundType()`, `setStoredSoundType()`。新增 `SOUND_TYPES` 常量（如 'bell', 'chime', 'ding', 'none'）
2. **新文件 `sound.js`** — Web Audio API 音效生成模块，导出 `playSound(type)` 函数，包含几种不同的合成音效（铃声、叮咚、和弦等）
3. **`renderer.js`** — 页面加载时检查音效设置，如果启用则调用 `playSound()`
4. **`control.html`** — 设置面板添加"提醒音效"卡片：启用/禁用开关 + 音效类型选择 + 试听按钮
5. **`control-renderer.js`** — 绑定音效设置的 UI 交互逻辑

---

## Phase 3: 开机自启动 (Auto-start on Boot)
**Scope:** Rust 插件 + 前端设置开关

### Changes:
1. **`src-tauri/Cargo.toml`** — 添加 `tauri-plugin-autostart = "2"` 依赖
2. **`package.json`** — 添加 `@tauri-apps/plugin-autostart` npm 依赖
3. **`src-tauri/src/lib.rs`** — 注册 autostart 插件：`.plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, None))`
4. **`src-tauri/capabilities/default.json`** — 添加 autostart 权限
5. **`app-shared.js`** — 新增 STORAGE_KEYS: `autostart`，新增 get/set 函数
6. **`control.html`** — 设置面板添加"开机自启动"卡片（开关切换）
7. **`control-renderer.js`** — 绑定自启动开关逻辑，调用 `@tauri-apps/plugin-autostart` 的 `enable()`/`disable()` API

---

## Phase 4: 久坐统计报告 (Sitting Statistics)
**Scope:** 数据跟踪 + 文件持久化 + 新统计视图

### Data Structure (JSON file via tauri-plugin-fs):
```json
{
  "days": {
    "2026-03-22": {
      "standUpCount": 5,
      "totalSeatedMinutes": 180,
      "reminderCount": 6,
      "dismissedCount": 5,
      "pomodoroCompleted": 0,
      "firstActivity": "09:00",
      "lastActivity": "18:30"
    }
  }
}
```

### Changes:
1. **`src-tauri/Cargo.toml`** — 添加 `tauri-plugin-fs = "2"` 依赖
2. **`package.json`** — 添加 `@tauri-apps/plugin-fs` npm 依赖
3. **`src-tauri/src/lib.rs`** — 注册 fs 插件
4. **`src-tauri/capabilities/default.json`** — 添加 fs 权限（限定 appData 目录）
5. **新文件 `stats.js`** — 统计数据管理模块：
   - `loadStats()` / `saveStats()` — 读写 JSON 文件（appData/stats.json）
   - `recordStandUp()` — 记录一次站立
   - `recordReminder()` — 记录一次提醒
   - `getDailyStats(date)` / `getWeeklyStats()` / `getMonthlyStats()`
   - 保留最近 90 天数据，自动清理旧数据
6. **`control-renderer.js`** — 提醒触发时调用 `recordReminder()`，提醒关闭时调用 `recordStandUp()`
7. **`control.html`** — 添加第三个视图 `statsView`（与 timerView、settingsView 并列）：
   - 导航：在标题栏或设置中添加统计入口按钮
   - 今日摘要卡片（站立次数、久坐时长、响应率）
   - 最近 7 天柱状图（纯 CSS/SVG 实现）
   - 最近 30 天趋势
8. **`control-renderer.js`** — 统计视图的渲染和交互逻辑

---

## Phase 5: 番茄钟模式 (Pomodoro Mode)
**Scope:** 新的计时模式，可自定义时长

### State:
```javascript
pomodoroConfig: {
  workMinutes: 25,      // 可自定义
  shortBreakMinutes: 5, // 可自定义
  longBreakMinutes: 15, // 可自定义
  longBreakInterval: 4  // 每 N 轮后长休息
}
pomodoroState: {
  phase: 'work' | 'shortBreak' | 'longBreak',
  completedRounds: 0,
  totalCompleted: 0
}
```

### Changes:
1. **`app-shared.js`** — 新增 STORAGE_KEYS: `timerMode` ('standup'|'pomodoro'), `pomodoroConfig`, `pomodoroState`。新增相关 get/set 函数
2. **`control.html`** —
   - 主视图顶部添加模式切换器（标签页式: 久坐提醒 | 番茄钟）
   - 番茄钟模式下显示：当前阶段（工作/休息）、轮次进度（如 2/4）、不同颜色的进度环
   - 设置面板添加番茄钟配置卡片（工作时长、短休息、长休息的 input）
3. **`control-renderer.js`** —
   - 模式切换逻辑
   - 番茄钟计时：工作期结束 → 自动切换到休息 → 休息结束 → 切换到工作
   - 进度环颜色：工作=红色/番茄色，短休息=绿色，长休息=蓝色
   - 轮次计数和自动循环
4. **`reminder.html`** — 番茄钟模式下显示不同内容（"工作时间结束，休息一下" vs "休息结束，开始工作"）
5. **`renderer.js`** — 根据模式和阶段显示不同提醒内容
6. **`floating.html` / `floating-renderer.js`** — 番茄钟模式下显示阶段指示
7. **`floating-menu.html` / `floating-menu-renderer.js`** — 显示番茄钟状态信息
8. **同步 tray 菜单** — 显示当前番茄钟阶段

---

## Phase 6: 多语言支持 (i18n)
**Scope:** 全部前端文件，最后做

### Architecture:
- 新文件 `i18n.js` — 翻译系统核心
  - `translations` 对象包含 `zh` 和 `en` 两个语言包
  - `t(key)` 函数 — 根据当前语言返回翻译文本
  - `setLanguage(lang)` / `getLanguage()` — 切换和获取语言
  - `translatePage()` — 扫描 DOM 中带 `data-i18n` 属性的元素并翻译

### Changes:
1. **新文件 `i18n.js`** — 翻译系统模块，包含所有 UI 字符串的中英文翻译
2. **`app-shared.js`** — 新增 STORAGE_KEYS: `language`，新增 get/set 函数
3. **所有 HTML 文件** — 为所有可翻译文本元素添加 `data-i18n="key"` 属性
4. **所有 JS 文件** — 动态生成的文本改用 `t('key')` 函数
5. **`control.html`** — 设置面板添加"语言"卡片（中文/English 选择）
6. **`control-renderer.js`** — 语言切换时重新渲染所有动态文本 + 重建 tray 菜单
7. **`floating-menu.html` / `floating-menu-renderer.js`** — 应用翻译
8. **Tray 菜单** — 所有菜单项文本使用翻译

---

## Phase 7: 构建验证
1. `npm install` 安装新依赖
2. `npm run build` 构建前端
3. `npm run build` (tauri build) 尝试完整构建
4. 修复构建中发现的问题

---

## New Files Summary:
- `sound.js` — Web Audio 音效模块
- `stats.js` — 统计数据管理模块
- `i18n.js` — 国际化翻译模块

## Modified Files Summary:
- `app-shared.js` — 新增存储键和工具函数
- `control.html` — 设置面板扩展 + 统计视图 + 番茄钟 UI
- `control-renderer.js` — 所有新功能的交互逻辑
- `reminder.html` — 运动建议展示 + 番茄钟提醒内容
- `renderer.js` — 音效播放 + 运动建议 + 番茄钟模式
- `floating.html` — 番茄钟状态指示
- `floating-renderer.js` — 番茄钟模式适配
- `floating-menu.html` — 番茄钟状态信息
- `floating-menu-renderer.js` — 番茄钟模式适配
- `src-tauri/Cargo.toml` — 新增 autostart + fs 插件
- `src-tauri/src/lib.rs` — 注册新插件
- `src-tauri/capabilities/default.json` — 新增权限
- `package.json` — 新增 npm 依赖
