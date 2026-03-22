import { readTextFile, writeTextFile, exists, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';

const STATS_DIR = 'standup-reminder';
const STATS_FILE = 'standup-reminder/stats.json';
const MAX_DAYS = 90;

let statsCache = null;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function emptyDay() {
  return {
    standUpCount: 0,
    totalSeatedMinutes: 0,
    reminderCount: 0,
    dismissedCount: 0,
    pomodoroCompleted: 0
  };
}

async function ensureDir() {
  try {
    const dirExists = await exists(STATS_DIR, { baseDir: BaseDirectory.AppData });
    if (!dirExists) {
      await mkdir(STATS_DIR, { baseDir: BaseDirectory.AppData, recursive: true });
    }
  } catch {
    // directory may already exist
  }
}

export async function loadStats() {
  if (statsCache) return statsCache;
  try {
    const fileExists = await exists(STATS_FILE, { baseDir: BaseDirectory.AppData });
    if (!fileExists) {
      statsCache = { days: {} };
      return statsCache;
    }
    const raw = await readTextFile(STATS_FILE, { baseDir: BaseDirectory.AppData });
    statsCache = JSON.parse(raw);
    if (!statsCache.days) statsCache.days = {};
    return statsCache;
  } catch {
    statsCache = { days: {} };
    return statsCache;
  }
}

async function saveStats() {
  if (!statsCache) return;
  try {
    await ensureDir();
    // Prune old days
    const keys = Object.keys(statsCache.days).sort();
    while (keys.length > MAX_DAYS) {
      delete statsCache.days[keys.shift()];
    }
    await writeTextFile(STATS_FILE, JSON.stringify(statsCache, null, 2), { baseDir: BaseDirectory.AppData });
  } catch (e) {
    console.error('Failed to save stats', e);
  }
}

function getToday(stats) {
  const key = todayKey();
  if (!stats.days[key]) {
    stats.days[key] = emptyDay();
  }
  return stats.days[key];
}

export async function recordReminder(seatedMinutes = 0) {
  const stats = await loadStats();
  const today = getToday(stats);
  today.reminderCount += 1;
  today.totalSeatedMinutes += seatedMinutes;
  await saveStats();
}

export async function recordStandUp() {
  const stats = await loadStats();
  const today = getToday(stats);
  today.standUpCount += 1;
  today.dismissedCount += 1;
  await saveStats();
}

export async function recordPomodoroCompleted() {
  const stats = await loadStats();
  const today = getToday(stats);
  today.pomodoroCompleted += 1;
  await saveStats();
}

export async function getTodayStats() {
  const stats = await loadStats();
  return getToday(stats);
}

export async function getWeekStats() {
  const stats = await loadStats();
  const result = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayData = stats.days[key] || emptyDay();
    result.push({
      date: key,
      weekday: d.getDay(),
      ...dayData
    });
  }
  return result;
}
