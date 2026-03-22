import { getStoredLanguage } from './app-shared.js';

const translations = {
  zh: {
    // Titlebar
    'app.name': '站立提醒',

    // Main view
    'timer.readyLabel': '准备就绪',
    'timer.remainingLabel': '剩余时间',
    'timer.editHint': '输入分钟数 或 MM:SS',
    'timer.start': '开始计时',
    'timer.pause': '暂停计时',
    'timer.resume': '继续计时',
    'timer.reset': '重置计时',
    'timer.intervalLabel': '提醒间隔',
    'timer.minuteUnit': '分钟',

    // Mode switcher
    'mode.standup': '久坐提醒',
    'mode.pomodoro': '番茄钟',

    // Pomodoro
    'pomodoro.work': '工作中',
    'pomodoro.shortBreak': '短休息',
    'pomodoro.longBreak': '长休息',
    'pomodoro.round': '第 {current}/{total} 轮',
    'pomodoro.workMin': '工作时长',
    'pomodoro.shortBreakMin': '短休息',
    'pomodoro.longBreakMin': '长休息',
    'pomodoro.longBreakInterval': '长休息间隔',
    'pomodoro.rounds': '轮',

    // Settings
    'settings.title': '设置',
    'settings.theme': '外观主题',
    'settings.themeSystem': '跟随系统',
    'settings.themeLight': '浅色',
    'settings.themeDark': '深色',
    'settings.currentTheme': '当前模式',
    'settings.themeStatusSystem': '跟随系统',
    'settings.themeStatusLight': '浅色模式',
    'settings.themeStatusDark': '深色模式',
    'settings.floating': '悬浮窗',
    'settings.floatingToggle': '显示桌面悬浮窗',
    'settings.floatingHint': '在屏幕角落显示迷你计时，可随时关闭',
    'settings.sound': '提醒音效',
    'settings.soundToggle': '启用提醒音效',
    'settings.soundHint': '提醒弹窗出现时播放提示音',
    'settings.soundType': '音效类型',
    'settings.soundBell': '铃声',
    'settings.soundChime': '风铃',
    'settings.soundDing': '叮咚',
    'settings.soundPreview': '试听',
    'settings.autostart': '开机自启动',
    'settings.autostartToggle': '开机时自动启动',
    'settings.autostartHint': '系统启动后自动运行站立提醒',
    'settings.language': '语言',
    'settings.languageZh': '中文',
    'settings.languageEn': 'English',
    'settings.pomodoroConfig': '番茄钟设置',
    'settings.about': '关于',
    'settings.aboutVersion': '站立提醒 v1.5.1',
    'settings.aboutSlogan': '保持健康，定时活动',
    'settings.aboutDownload': '下载最新版本',

    // Statistics
    'stats.title': '统计',
    'stats.today': '今日',
    'stats.standUpCount': '站立次数',
    'stats.seatedTime': '久坐时长',
    'stats.responseRate': '响应率',
    'stats.minutes': '分钟',
    'stats.times': '次',
    'stats.week': '近 7 天',
    'stats.noData': '暂无数据',

    // Reminder
    'reminder.title': '该站起来活动一下了！',
    'reminder.subtitle': '久坐对身体不好，起来伸个懒腰、喝杯水吧 ☕',
    'reminder.dismiss': '我已站起来了',
    'reminder.dismissed': '✓ 好的，继续加油！',
    'reminder.tips': '点击后将自动开始下一轮计时',
    'reminder.seatedTime': '你已经坐了 {minutes} 分钟',
    'reminder.pomodoroWorkDone': '专注时间结束！',
    'reminder.pomodoroTakeBreak': '辛苦了，休息一下吧 ☕',
    'reminder.pomodoroBreakDone': '休息结束！',
    'reminder.pomodoroBackToWork': '状态满满，继续加油 💪',
    'reminder.pomoDismiss': '好的',

    // Tray
    'tray.open': '打开主面板',
    'tray.showFloating': '显示悬浮窗',
    'tray.hideFloating': '隐藏悬浮窗',
    'tray.startTimer': '开始计时',
    'tray.pauseTimer': '暂停计时',
    'tray.showTrayTime': '显示剩余时间',
    'tray.hideTrayTime': '隐藏剩余时间',
    'tray.quit': '退出',

    // Floating menu
    'floatingMenu.title': '站立提醒',
    'floatingMenu.start': '开始计时',
    'floatingMenu.pause': '暂停计时',
    'floatingMenu.resume': '继续计时',
    'floatingMenu.reset': '重置',
    'floatingMenu.openMain': '打开主面板',
    'floatingMenu.hideFloating': '隐藏悬浮窗',
    'floatingMenu.quit': '退出应用',
    'floatingMenu.escHint': '按 Esc 关闭菜单',
    'floatingMenu.statusIdle': '待开始',
    'floatingMenu.statusRunning': '进行中',
    'floatingMenu.statusPaused': '已暂停',
    'floatingMenu.hintStart': '开始',
    'floatingMenu.hintPause': '暂停',
    'floatingMenu.hintResume': '继续'
  },
  en: {
    'app.name': 'Standup Reminder',

    'timer.readyLabel': 'Ready',
    'timer.remainingLabel': 'Remaining',
    'timer.editHint': 'Enter minutes or MM:SS',
    'timer.start': 'Start',
    'timer.pause': 'Pause',
    'timer.resume': 'Resume',
    'timer.reset': 'Reset',
    'timer.intervalLabel': 'Interval',
    'timer.minuteUnit': 'min',

    'mode.standup': 'Standup',
    'mode.pomodoro': 'Pomodoro',

    'pomodoro.work': 'Working',
    'pomodoro.shortBreak': 'Short Break',
    'pomodoro.longBreak': 'Long Break',
    'pomodoro.round': 'Round {current}/{total}',
    'pomodoro.workMin': 'Work',
    'pomodoro.shortBreakMin': 'Short Break',
    'pomodoro.longBreakMin': 'Long Break',
    'pomodoro.longBreakInterval': 'Long Break After',
    'pomodoro.rounds': 'rounds',

    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.themeSystem': 'System',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.currentTheme': 'Current',
    'settings.themeStatusSystem': 'Follow System',
    'settings.themeStatusLight': 'Light Mode',
    'settings.themeStatusDark': 'Dark Mode',
    'settings.floating': 'Floating Window',
    'settings.floatingToggle': 'Show floating timer',
    'settings.floatingHint': 'Mini timer on screen corner',
    'settings.sound': 'Sound',
    'settings.soundToggle': 'Enable reminder sound',
    'settings.soundHint': 'Play sound when reminder appears',
    'settings.soundType': 'Sound Type',
    'settings.soundBell': 'Bell',
    'settings.soundChime': 'Chime',
    'settings.soundDing': 'Ding',
    'settings.soundPreview': 'Preview',
    'settings.autostart': 'Auto-start',
    'settings.autostartToggle': 'Start on system boot',
    'settings.autostartHint': 'Launch automatically when system starts',
    'settings.language': 'Language',
    'settings.languageZh': '中文',
    'settings.languageEn': 'English',
    'settings.pomodoroConfig': 'Pomodoro Settings',
    'settings.about': 'About',
    'settings.aboutVersion': 'Standup Reminder v1.5.1',
    'settings.aboutSlogan': 'Stay healthy, move regularly',
    'settings.aboutDownload': 'Download Latest',

    'stats.title': 'Statistics',
    'stats.today': 'Today',
    'stats.standUpCount': 'Stand-ups',
    'stats.seatedTime': 'Seated Time',
    'stats.responseRate': 'Response Rate',
    'stats.minutes': 'min',
    'stats.times': 'times',
    'stats.week': 'Last 7 Days',
    'stats.noData': 'No data yet',

    'reminder.title': 'Time to stand up!',
    'reminder.subtitle': 'Sitting too long is bad for you. Stretch and grab some water ☕',
    'reminder.dismiss': 'I\'ve stood up',
    'reminder.dismissed': '✓ Great, keep it up!',
    'reminder.tips': 'Next round starts automatically',
    'reminder.seatedTime': 'You\'ve been sitting for {minutes} min',
    'reminder.pomodoroWorkDone': 'Focus time is up!',
    'reminder.pomodoroTakeBreak': 'Great work — take a break ☕',
    'reminder.pomodoroBreakDone': 'Break is over!',
    'reminder.pomodoroBackToWork': 'Recharged — let\'s go 💪',
    'reminder.pomoDismiss': 'OK',

    'tray.open': 'Open Panel',
    'tray.showFloating': 'Show Floating',
    'tray.hideFloating': 'Hide Floating',
    'tray.startTimer': 'Start Timer',
    'tray.pauseTimer': 'Pause Timer',
    'tray.showTrayTime': 'Show Time',
    'tray.hideTrayTime': 'Hide Time',
    'tray.quit': 'Quit',

    'floatingMenu.title': 'Standup Reminder',
    'floatingMenu.start': 'Start',
    'floatingMenu.pause': 'Pause',
    'floatingMenu.resume': 'Resume',
    'floatingMenu.reset': 'Reset',
    'floatingMenu.openMain': 'Open Panel',
    'floatingMenu.hideFloating': 'Hide Floating',
    'floatingMenu.quit': 'Quit',
    'floatingMenu.escHint': 'Press Esc to close',
    'floatingMenu.statusIdle': 'Idle',
    'floatingMenu.statusRunning': 'Running',
    'floatingMenu.statusPaused': 'Paused',
    'floatingMenu.hintStart': 'Start',
    'floatingMenu.hintPause': 'Pause',
    'floatingMenu.hintResume': 'Resume'
  }
};

export function t(key, params = {}) {
  const lang = getStoredLanguage();
  let text = translations[lang]?.[key] || translations.zh[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, String(v));
  }
  return text;
}

export function getThemeStatusTextI18n(theme) {
  const map = {
    light: 'settings.themeStatusLight',
    dark: 'settings.themeStatusDark',
    system: 'settings.themeStatusSystem'
  };
  return t(map[theme] || map.system);
}
