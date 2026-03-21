import { getCurrentWindow } from '@tauri-apps/api/window';
import { LogicalSize } from '@tauri-apps/api/dpi';
import {
  STORAGE_KEYS,
  applyTheme,
  getStoredInterval,
  getStoredTheme,
  getStoredTimerState,
  issueTimerCommand
} from './app-shared.js';

const currentWindow = getCurrentWindow();
const remainingTimeLabel = document.getElementById('remainingTimeLabel');
const statusLabel = document.getElementById('statusLabel');
const toggleAction = document.getElementById('toggleAction');
const toggleActionLabel = document.getElementById('toggleActionLabel');
const toggleActionHint = document.getElementById('toggleActionHint');
const resetAction = document.getElementById('resetAction');

let currentTheme = getStoredTheme();
let timerState = getStoredTimerState(getStoredInterval(20));

function syncTheme() {
  applyTheme(currentTheme);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getToggleActionLabel() {
  if (timerState.running) {
    return '暂停计时';
  }

  if (timerState.elapsed > 0) {
    return '继续计时';
  }

  return '开始计时';
}

function getStatusLabel() {
  if (timerState.running) {
    return '进行中';
  }

  if (timerState.elapsed > 0) {
    return '已暂停';
  }

  return '待开始';
}

function updateUI() {
  remainingTimeLabel.textContent = `剩余 ${formatTime(timerState.remaining)}`;
  statusLabel.textContent = getStatusLabel();
  toggleActionLabel.textContent = getToggleActionLabel();
  toggleActionHint.textContent = timerState.running ? '暂停' : timerState.elapsed > 0 ? '继续' : '开始';
  resetAction.disabled = timerState.elapsed === 0;
}

async function closeMenu() {
  await currentWindow.hide().catch(() => { });
}

async function syncWindowSize() {
  const nextWidth = Math.ceil(document.documentElement.scrollWidth);
  const nextHeight = Math.ceil(document.documentElement.scrollHeight);
  await currentWindow.setSize(new LogicalSize(nextWidth, nextHeight)).catch(() => { });
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

function bindActions() {
  document.querySelectorAll('[data-command]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (button.disabled) return;

      issueTimerCommand(button.dataset.command);
      await closeMenu();
    });
  });

  window.addEventListener('keydown', async (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      await closeMenu();
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      issueTimerCommand('toggle-timer');
      await closeMenu();
    }
  });
}

async function init() {
  syncTheme();
  updateUI();
  bindActions();
  await syncWindowSize();

  window.addEventListener('storage', handleStorageChange);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') {
      syncTheme();
    }
  });

  await currentWindow.onFocusChanged(async ({ payload: focused }) => {
    if (!focused) {
      await closeMenu();
    }
  });

  await currentWindow.setFocus().catch(() => { });
}

void init();
