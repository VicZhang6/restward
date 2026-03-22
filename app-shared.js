export const STORAGE_KEYS = {
  theme: 'standup-reminder.theme',
  intervalMinutes: 'standup-reminder.interval-minutes',
  showFloating: 'standup-reminder.show-floating',
  showTrayTime: 'standup-reminder.show-tray-time',
  reminderDismissedAt: 'standup-reminder.reminder-dismissed-at',
  timerState: 'standup-reminder.timer-state',
  timerCommand: 'standup-reminder.timer-command',
  soundEnabled: 'standup-reminder.sound-enabled',
  soundType: 'standup-reminder.sound-type',
  autostart: 'standup-reminder.autostart',
  language: 'standup-reminder.language',
  timerMode: 'standup-reminder.timer-mode',
  pomodoroConfig: 'standup-reminder.pomodoro-config',
  pomodoroState: 'standup-reminder.pomodoro-state'
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

export function getStoredShowFloating(fallback = true) {
  const value = localStorage.getItem(STORAGE_KEYS.showFloating);
  return value === null ? fallback : value === 'true';
}

export function setStoredShowFloating(showFloating) {
  localStorage.setItem(STORAGE_KEYS.showFloating, String(Boolean(showFloating)));
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

// --- Exercise Suggestions ---

const EXERCISES = [
  { zh: '转动脖子：顺时针和逆时针各转 5 圈', en: 'Neck rolls: 5 circles clockwise and counterclockwise' },
  { zh: '伸展手臂：双手交叉向上伸展 10 秒', en: 'Arm stretch: interlace fingers and reach up for 10s' },
  { zh: '深呼吸 5 次：鼻吸口呼，每次 4 秒', en: 'Take 5 deep breaths: inhale through nose, exhale through mouth' },
  { zh: '肩部环绕：向前和向后各转 10 圈', en: 'Shoulder rolls: 10 circles forward and backward' },
  { zh: '扭转腰部：左右各转 5 次', en: 'Torso twist: rotate left and right 5 times each' },
  { zh: '踮脚站立：踮起脚尖保持 10 秒，重复 5 次', en: 'Calf raises: hold on tiptoes for 10s, repeat 5 times' },
  { zh: '手腕旋转：顺时针和逆时针各转 10 圈', en: 'Wrist rotations: 10 circles each direction' },
  { zh: '眼部放松：闭眼 20 秒，然后看远处 20 秒', en: 'Eye rest: close eyes 20s, then look far away 20s' },
  { zh: '原地踏步 30 秒', en: 'March in place for 30 seconds' },
  { zh: '靠墙站立 30 秒，保持背部贴墙', en: 'Stand against wall for 30s, keep back flat' },
  { zh: '双手背后交握，挺胸拉伸 10 秒', en: 'Clasp hands behind back and stretch chest for 10s' },
  { zh: '去接一杯水，保持每天 8 杯水', en: 'Get a glass of water — stay hydrated!' },
  { zh: '左右侧颈拉伸：每侧保持 10 秒', en: 'Side neck stretch: hold each side for 10 seconds' },
  { zh: '站立前屈：弯腰触脚尖保持 10 秒', en: 'Standing forward bend: touch toes and hold 10s' },
  { zh: '开合跳 10 次，活动全身', en: 'Do 10 jumping jacks to activate your whole body' },
  { zh: '抬腿运动：每条腿抬起保持 5 秒，各 5 次', en: 'Leg raises: hold each leg up 5s, repeat 5 times' }
];

export function getRandomExercise() {
  return EXERCISES[Math.floor(Math.random() * EXERCISES.length)];
}

// --- Sound Settings ---

export const SOUND_TYPES = ['bell', 'chime', 'ding'];

export function getStoredSoundEnabled(fallback = true) {
  const value = localStorage.getItem(STORAGE_KEYS.soundEnabled);
  return value === null ? fallback : value === 'true';
}

export function setStoredSoundEnabled(enabled) {
  localStorage.setItem(STORAGE_KEYS.soundEnabled, String(Boolean(enabled)));
}

export function getStoredSoundType(fallback = 'bell') {
  const value = localStorage.getItem(STORAGE_KEYS.soundType);
  return SOUND_TYPES.includes(value) ? value : fallback;
}

export function setStoredSoundType(type) {
  if (SOUND_TYPES.includes(type)) {
    localStorage.setItem(STORAGE_KEYS.soundType, type);
  }
}

// --- Language / i18n ---

const VALID_LANGUAGES = new Set(['zh', 'en']);

export function getStoredLanguage(fallback = 'zh') {
  const value = localStorage.getItem(STORAGE_KEYS.language);
  return VALID_LANGUAGES.has(value) ? value : fallback;
}

export function setStoredLanguage(lang) {
  if (VALID_LANGUAGES.has(lang)) {
    localStorage.setItem(STORAGE_KEYS.language, lang);
  }
}

// --- Timer Mode ---

const VALID_MODES = new Set(['standup', 'pomodoro']);

export function getStoredTimerMode(fallback = 'standup') {
  const value = localStorage.getItem(STORAGE_KEYS.timerMode);
  return VALID_MODES.has(value) ? value : fallback;
}

export function setStoredTimerMode(mode) {
  if (VALID_MODES.has(mode)) {
    localStorage.setItem(STORAGE_KEYS.timerMode, mode);
  }
}

// --- Pomodoro Config ---

const DEFAULT_POMODORO_CONFIG = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4
};

export function getStoredPomodoroConfig() {
  const raw = localStorage.getItem(STORAGE_KEYS.pomodoroConfig);
  if (!raw) return { ...DEFAULT_POMODORO_CONFIG };
  try {
    const parsed = JSON.parse(raw);
    return {
      workMinutes: Math.max(1, Math.min(120, Number(parsed.workMinutes) || 25)),
      shortBreakMinutes: Math.max(1, Math.min(60, Number(parsed.shortBreakMinutes) || 5)),
      longBreakMinutes: Math.max(1, Math.min(60, Number(parsed.longBreakMinutes) || 15)),
      longBreakInterval: Math.max(2, Math.min(10, Number(parsed.longBreakInterval) || 4))
    };
  } catch {
    return { ...DEFAULT_POMODORO_CONFIG };
  }
}

export function setStoredPomodoroConfig(config) {
  localStorage.setItem(STORAGE_KEYS.pomodoroConfig, JSON.stringify(config));
}

// --- Pomodoro State ---

export function getStoredPomodoroState() {
  const raw = localStorage.getItem(STORAGE_KEYS.pomodoroState);
  if (!raw) return { phase: 'work', completedRounds: 0 };
  try {
    const parsed = JSON.parse(raw);
    return {
      phase: ['work', 'shortBreak', 'longBreak'].includes(parsed.phase) ? parsed.phase : 'work',
      completedRounds: Math.max(0, Number(parsed.completedRounds) || 0)
    };
  } catch {
    return { phase: 'work', completedRounds: 0 };
  }
}

export function setStoredPomodoroState(state) {
  localStorage.setItem(STORAGE_KEYS.pomodoroState, JSON.stringify(state));
}
