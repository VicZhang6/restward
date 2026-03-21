import { getCurrentWindow } from '@tauri-apps/api/window';
import {
  STORAGE_KEYS,
  applyTheme,
  detectPlatform,
  getStoredInterval,
  getStoredTheme,
  getStoredTimerState,
  issueTimerCommand
} from './app-shared.js';

const currentWindow = getCurrentWindow();
const platform = detectPlatform();
const floatingTimer = document.getElementById('floatingTimer');
const remainingTime = document.getElementById('remainingTime');

let currentTheme = getStoredTheme();
let timerState = getStoredTimerState(getStoredInterval(20));

document.body.classList.add(`platform-${platform}`);

function syncTheme() {
  applyTheme(currentTheme);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateUI() {
  remainingTime.textContent = formatTime(timerState.remaining);

  // 更新状态类名（用于颜色变化）
  floatingTimer.classList.remove('is-running', 'is-paused', 'is-idle');

  if (timerState.running) {
    floatingTimer.classList.add('is-running');
  } else if (timerState.elapsed > 0) {
    floatingTimer.classList.add('is-paused');
  } else {
    floatingTimer.classList.add('is-idle');
  }
}

function handleStorageChange(event) {
  if (event.key === STORAGE_KEYS.theme) {
    currentTheme = getStoredTheme();
    syncTheme();
    return;
  }

  if (event.key === STORAGE_KEYS.timerState && event.newValue) {
    timerState = getStoredTimerState(timerState.intervalMinutes);
    updateUI();
    return;
  }

  if (event.key === STORAGE_KEYS.intervalMinutes) {
    timerState = getStoredTimerState(getStoredInterval(timerState.intervalMinutes));
    updateUI();
  }
}

function setupWindowInteractions() {
  window.addEventListener('contextmenu', (event) => {
    event.preventDefault();

    issueTimerCommand('show-floating-menu', {
      x: Math.round(window.screenX + event.clientX),
      y: Math.round(window.screenY + event.clientY)
    });
  });

  window.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;
    void currentWindow.startDragging();
  });

  floatingTimer.addEventListener('dblclick', () => {
    issueTimerCommand('show-main');
  });
}

function init() {
  syncTheme();
  updateUI();
  setupWindowInteractions();

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') {
      syncTheme();
    }
  });

  window.addEventListener('storage', handleStorageChange);
}

init();
