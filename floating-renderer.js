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
const contextMenu = document.getElementById('contextMenu');
const toggleAction = document.getElementById('toggleAction');
const resetAction = document.getElementById('resetAction');

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

function updateMenu() {
  if (timerState.running) {
    toggleAction.textContent = '暂停计时';
  } else if (timerState.elapsed > 0) {
    toggleAction.textContent = '继续计时';
  } else {
    toggleAction.textContent = '开始计时';
  }

  resetAction.disabled = timerState.elapsed === 0;
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

  updateMenu();
}

function hideContextMenu() {
  contextMenu.classList.remove('visible');
}

function showContextMenu(x, y) {
  contextMenu.classList.add('visible');

  const { width, height } = contextMenu.getBoundingClientRect();
  const maxX = Math.max(8, window.innerWidth - width - 8);
  const maxY = Math.max(8, window.innerHeight - height - 8);

  contextMenu.style.left = `${Math.min(x, maxX)}px`;
  contextMenu.style.top = `${Math.min(y, maxY)}px`;
}

function bindActions() {
  toggleAction.addEventListener('click', () => {
    issueTimerCommand('toggle-timer');
    hideContextMenu();
  });

  resetAction.addEventListener('click', () => {
    if (resetAction.disabled) return;
    issueTimerCommand('reset-timer');
    hideContextMenu();
  });

  document.querySelector('[data-action="show-main"]')?.addEventListener('click', () => {
    issueTimerCommand('show-main');
    hideContextMenu();
  });

  document.querySelector('[data-action="hide-floating"]')?.addEventListener('click', () => {
    issueTimerCommand('hide-floating');
    hideContextMenu();
  });

  document.querySelector('[data-action="quit-app"]')?.addEventListener('click', () => {
    issueTimerCommand('quit-app');
    hideContextMenu();
  });
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
    showContextMenu(event.clientX, event.clientY);
  });

  window.addEventListener('click', (event) => {
    if (!event.target.closest('.context-menu')) {
      hideContextMenu();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      hideContextMenu();
    }
  });

  window.addEventListener('blur', hideContextMenu);

  window.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;
    if (event.target.closest('.context-menu')) return;
    hideContextMenu();
    void currentWindow.startDragging();
  });

  floatingTimer.addEventListener('dblclick', () => {
    issueTimerCommand('show-main');
  });
}

function init() {
  syncTheme();
  updateUI();
  bindActions();
  setupWindowInteractions();

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') {
      syncTheme();
    }
  });

  window.addEventListener('storage', handleStorageChange);
}

init();
