import { getCurrentWindow } from '@tauri-apps/api/window';
import {
  STORAGE_KEYS,
  applyTheme,
  detectPlatform,
  getRandomExercise,
  getSeatedTimeLabel,
  getStoredInterval,
  getStoredLanguage,
  getStoredSoundEnabled,
  getStoredSoundType,
  getStoredTimerMode,
  getStoredPomodoroState,
  getStoredTheme,
  markReminderDismissed
} from './app-shared.js';
import { playSound } from './sound.js';
import { t } from './i18n.js';

const reminderWindow = getCurrentWindow();
const platform = detectPlatform();
const dismissBtn = document.getElementById('dismiss-btn');
const dismissBtnText = document.getElementById('dismiss-btn-text');
const seatedTime = document.getElementById('seated-time');
const exerciseText = document.getElementById('exercise-text');
const reminderTitle = document.getElementById('reminder-title');
const reminderSubtitle = document.getElementById('reminder-subtitle');
const reminderTips = document.getElementById('reminder-tips');

let currentTheme = getStoredTheme();
let currentLang = getStoredLanguage();

document.body.classList.add(`platform-${platform}`);

function syncTheme() {
  applyTheme(currentTheme);
}

function updateSeatedTime() {
  seatedTime.textContent = getSeatedTimeLabel(getStoredInterval(20));
}

function updateExercise() {
  const exercise = getRandomExercise();
  exerciseText.textContent = currentLang === 'en' ? exercise.en : exercise.zh;
}

function updateTexts() {
  const mode = getStoredTimerMode();
  const pomodoroState = getStoredPomodoroState();

  if (mode === 'pomodoro') {
    if (pomodoroState.phase === 'work') {
      reminderTitle.textContent = t('reminder.pomodoroWorkDone');
      reminderSubtitle.textContent = t('reminder.pomodoroTakeBreak');
    } else {
      reminderTitle.textContent = t('reminder.pomodoroBreakDone');
      reminderSubtitle.textContent = t('reminder.pomodoroBackToWork');
    }
    dismissBtnText.textContent = t('reminder.pomoDismiss');
  } else {
    reminderTitle.textContent = t('reminder.title');
    reminderSubtitle.textContent = t('reminder.subtitle');
    dismissBtnText.textContent = t('reminder.dismiss');
  }
  reminderTips.textContent = t('reminder.tips');
}

function handleStorageChange(event) {
  if (event.key === STORAGE_KEYS.theme) {
    currentTheme = getStoredTheme();
    syncTheme();
  }

  if (event.key === STORAGE_KEYS.intervalMinutes) {
    updateSeatedTime();
  }

  if (event.key === STORAGE_KEYS.language) {
    currentLang = getStoredLanguage();
    updateTexts();
    updateExercise();
    updateSeatedTime();
  }
}

function setupDismissButton() {
  dismissBtn.addEventListener('click', () => {
    dismissBtnText.textContent = t('reminder.dismissed');
    dismissBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    dismissBtn.style.pointerEvents = 'none';

    window.setTimeout(async () => {
      markReminderDismissed();
      await reminderWindow.close();
    }, 400);
  });
}

function disableContextMenu() {
  window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
}

function init() {
  syncTheme();
  updateSeatedTime();
  updateExercise();
  updateTexts();
  setupDismissButton();
  disableContextMenu();

  if (getStoredSoundEnabled()) {
    playSound(getStoredSoundType());
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') {
      syncTheme();
    }
  });

  window.addEventListener('storage', handleStorageChange);
}

init();
