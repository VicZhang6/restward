export const STORAGE_KEYS = {
  theme: 'standup-reminder.theme',
  intervalMinutes: 'standup-reminder.interval-minutes',
  showTrayTime: 'standup-reminder.show-tray-time',
  reminderDismissedAt: 'standup-reminder.reminder-dismissed-at',
  timerState: 'standup-reminder.timer-state',
  timerCommand: 'standup-reminder.timer-command'
};

const VALID_THEMES = new Set(['system', 'light', 'dark']);

export function detectPlatform() {
  const source = [
    navigator.userAgentData?.platform,
    navigator.platform,
    navigator.userAgent
  ]
    .filter(Boolean)
    .join(' ');

  if (/mac/i.test(source)) return 'darwin';
  if (/win/i.test(source)) return 'win32';
  if (/linux/i.test(source)) return 'linux';
  return 'unknown';
}

export function isSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(theme, isDark = isSystemDark()) {
  const useDark = theme === 'dark' || (theme === 'system' && isDark);
  const root = document.documentElement;

  if (useDark) {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }
}

export function getStoredTheme() {
  const theme = localStorage.getItem(STORAGE_KEYS.theme);
  return VALID_THEMES.has(theme) ? theme : 'system';
}

export function setStoredTheme(theme) {
  if (!VALID_THEMES.has(theme)) return;
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

export function getThemeStatusText(theme) {
  const statusMap = {
    light: '浅色模式',
    dark: '深色模式',
    system: '跟随系统'
  };

  return statusMap[theme] || statusMap.system;
}

export function clampInterval(minutes) {
  return Math.max(1, Math.min(120, Number(minutes) || 20));
}

export function getStoredInterval(fallback = 20) {
  const value = Number.parseInt(localStorage.getItem(STORAGE_KEYS.intervalMinutes) || '', 10);
  return Number.isFinite(value) ? clampInterval(value) : fallback;
}

export function setStoredInterval(minutes) {
  localStorage.setItem(STORAGE_KEYS.intervalMinutes, String(clampInterval(minutes)));
}

export function getStoredShowTrayTime(fallback = true) {
  const value = localStorage.getItem(STORAGE_KEYS.showTrayTime);
  return value === null ? fallback : value === 'true';
}

export function setStoredShowTrayTime(showTrayTime) {
  localStorage.setItem(STORAGE_KEYS.showTrayTime, String(Boolean(showTrayTime)));
}

export function markReminderDismissed() {
  localStorage.setItem(STORAGE_KEYS.reminderDismissedAt, String(Date.now()));
}

export function getSeatedTimeLabel(minutes) {
  return `你已经坐了 ${clampInterval(minutes)} 分钟`;
}

export function createTimerState(state = {}) {
  const intervalMinutes = clampInterval(state.intervalMinutes ?? 20);
  const total = intervalMinutes * 60;
  const elapsed = Math.max(0, Math.min(total, Number.parseInt(state.elapsed ?? 0, 10) || 0));
  const remaining = Math.max(0, total - elapsed);

  return {
    running: Boolean(state.running),
    intervalMinutes,
    elapsed,
    remaining,
    total,
    updatedAt: Number.parseInt(state.updatedAt ?? Date.now(), 10) || Date.now()
  };
}

export function getStoredTimerState(fallbackInterval = 20) {
  const rawValue = localStorage.getItem(STORAGE_KEYS.timerState);
  if (!rawValue) {
    return createTimerState({ intervalMinutes: fallbackInterval });
  }

  try {
    const state = JSON.parse(rawValue);
    return createTimerState({
      intervalMinutes: state.intervalMinutes ?? fallbackInterval,
      elapsed: state.elapsed,
      running: state.running,
      updatedAt: state.updatedAt
    });
  } catch {
    return createTimerState({ intervalMinutes: fallbackInterval });
  }
}

export function setStoredTimerState(state) {
  localStorage.setItem(STORAGE_KEYS.timerState, JSON.stringify(createTimerState(state)));
}

export function getStoredTimerCommand() {
  const rawValue = localStorage.getItem(STORAGE_KEYS.timerCommand);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

export function issueTimerCommand(type, payload = {}) {
  const command = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    issuedAt: Date.now()
  };

  localStorage.setItem(STORAGE_KEYS.timerCommand, JSON.stringify(command));
  return command;
}
