const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
const isDev = process.argv.includes('--dev');

if (isWindows) {
    app.disableHardwareAcceleration();
}

// ── 全局状态 ──────────────────────────────────────────
let tray = null;
let reminderWindow = null;
let controlWindow = null;
let timer = null;
let timerRunning = false;
let intervalMinutes = 20;
let elapsedSeconds = 0;
let tickInterval = null;
let showTrayTime = true; // 状态栏是否显示剩余时间

// ── 托盘图标（状态栏）─────────────────────────────────
function createTray() {
    const icon = createTrayIcon();
    tray = new Tray(icon);
    tray.setToolTip('站立提醒');

    // 左键点击 → 直接打开控制面板
    tray.on('click', () => {
        showControlWindow();
    });

    // 右键菜单
    tray.on('right-click', () => {
        const contextMenu = Menu.buildFromTemplate([
            {
                label: '打开主面板',
                click: () => showControlWindow()
            },
            { type: 'separator' },
            {
                label: timerRunning ? '⏸ 暂停计时' : '▶️ 开始计时',
                click: () => toggleTimer()
            },
            { type: 'separator' },
            {
                label: '显示剩余时间',
                type: 'checkbox',
                checked: showTrayTime,
                click: (menuItem) => {
                    showTrayTime = menuItem.checked;
                    updateTrayTitle();
                }
            },
            { type: 'separator' },
            {
                label: '退出',
                click: () => {
                    app.isQuitting = true;
                    app.quit();
                }
            }
        ]);
        tray.popUpContextMenu(contextMenu);
    });
}

function createTrayIcon() {
    if (isMac) {
        // macOS: 使用 Template 图标，自动适配深色/浅色模式
        const iconPath = path.join(__dirname, 'assets', 'tray-iconTemplate.png');
        const img = nativeImage.createFromPath(iconPath);
        img.setTemplateImage(true);
        return img;
    } else {
        // Windows: 使用应用图标作为托盘图标
        const iconPath = path.join(__dirname, 'assets', 'icon.ico');
        return nativeImage.createFromPath(iconPath);
    }
}

function updateTrayMenu() {
    // 右键菜单通过 right-click 事件动态生成
}

// 格式化状态栏时间（紧凑格式）
function formatTrayTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

// 更新状态栏标题（图标旁的文字）
function updateTrayTitle() {
    if (!tray) return;
    if (!showTrayTime || !timerRunning) {
        tray.setTitle('');
        return;
    }
    const remaining = Math.max(0, intervalMinutes * 60 - elapsedSeconds);
    tray.setTitle(` ${formatTrayTime(remaining)}`, { fontType: 'monospacedDigit' });
}

// ── 控制面板窗口 ─────────────────────────────────────
function showControlWindow() {
    if (controlWindow && !controlWindow.isDestroyed()) {
        controlWindow.show();
        controlWindow.focus();
        return;
    }

    const controlWindowOptions = {
        width: 420,
        height: 560,
        resizable: false,
        maximizable: false,
        show: false,
        useContentSize: true,
        autoHideMenuBar: true,
        backgroundColor: isMac ? '#00000000' : '#eef2ff',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    };

    if (isMac) {
        controlWindowOptions.titleBarStyle = 'hiddenInset';
        controlWindowOptions.vibrancy = 'under-window';
        controlWindowOptions.visualEffectState = 'active';
    } else {
        controlWindowOptions.titleBarStyle = 'hidden';
        controlWindowOptions.icon = path.join(__dirname, 'assets', 'icon.ico');
    }

    // Windows/Linux：使用页面内自定义标题栏按钮，便于悬停底色；不再使用 titleBarOverlay

    controlWindow = new BrowserWindow(controlWindowOptions);

    if (isWindows) {
        controlWindow.removeMenu();
    }

    controlWindow.once('ready-to-show', () => {
        controlWindow.show();

        if (isDev) {
            controlWindow.webContents.openDevTools({ mode: 'detach' });
        }
    });

    controlWindow.loadFile('control.html');

    controlWindow.on('close', (e) => {
        if (!app.isQuitting) {
            e.preventDefault();
            controlWindow.hide();
        }
    });
}

// ── 提醒弹窗 ─────────────────────────────────────────
function showReminder() {
    if (reminderWindow && !reminderWindow.isDestroyed()) {
        reminderWindow.show();
        reminderWindow.focus();
        return;
    }

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const reminderWindowOptions = {
        width: width,
        height: height,
        x: 0,
        y: 0,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        movable: false,
        fullscreenable: false,
        hasShadow: false,
        show: false,
        backgroundColor: isMac ? '#00000000' : '#101828',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    };

    if (isMac) {
        reminderWindowOptions.transparent = true;
    }

    reminderWindow = new BrowserWindow(reminderWindowOptions);

    reminderWindow.setAlwaysOnTop(true, 'screen-saver');
    reminderWindow.setVisibleOnAllWorkspaces(true);
    reminderWindow.loadFile('reminder.html');
    reminderWindow.once('ready-to-show', () => {
        reminderWindow.show();
        reminderWindow.focus();
    });

    reminderWindow.on('closed', () => {
        reminderWindow = null;
    });
}

// ── 定时器逻辑 ────────────────────────────────────────
function startTimer() {
    stopTimer();
    timerRunning = true;
    elapsedSeconds = 0;

    tickInterval = setInterval(() => {
        elapsedSeconds++;

        // 广播倒计时更新到控制面板和状态栏
        broadcastTimerUpdate();
        updateTrayTitle();

        // 时间到，显示提醒
        if (elapsedSeconds >= intervalMinutes * 60) {
            showReminder();
            stopTimer();
        }
    }, 1000);

    updateTrayMenu();
    updateTrayTitle();
    broadcastStateChange();
}

function stopTimer() {
    if (tickInterval) {
        clearInterval(tickInterval);
        tickInterval = null;
    }
    timerRunning = false;
    updateTrayMenu();
    updateTrayTitle();
    broadcastStateChange();
}

function toggleTimer() {
    if (timerRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

function broadcastTimerUpdate() {
    const remaining = intervalMinutes * 60 - elapsedSeconds;
    const data = {
        remaining: Math.max(0, remaining),
        elapsed: elapsedSeconds,
        total: intervalMinutes * 60,
        running: timerRunning,
        intervalMinutes
    };
    if (controlWindow && !controlWindow.isDestroyed()) {
        controlWindow.webContents.send('timer-update', data);
    }
}

function broadcastStateChange() {
    const data = {
        running: timerRunning,
        intervalMinutes,
        elapsed: elapsedSeconds,
        remaining: Math.max(0, intervalMinutes * 60 - elapsedSeconds),
        total: intervalMinutes * 60
    };
    if (controlWindow && !controlWindow.isDestroyed()) {
        controlWindow.webContents.send('timer-state-changed', data);
    }
}

// ── IPC 事件处理 ──────────────────────────────────────
ipcMain.on('dismiss-reminder', () => {
    if (reminderWindow && !reminderWindow.isDestroyed()) {
        reminderWindow.close();
        reminderWindow = null;
    }
    // 关闭提醒后自动重新开始计时
    startTimer();
});

ipcMain.on('toggle-timer', () => {
    toggleTimer();
});

ipcMain.on('set-interval', (_event, minutes) => {
    intervalMinutes = Math.max(1, Math.min(120, minutes));
    if (timerRunning) {
        startTimer(); // 重新开始计时
    }
    broadcastStateChange();
});

ipcMain.handle('get-timer-state', () => {
    return {
        running: timerRunning,
        intervalMinutes,
        elapsed: elapsedSeconds,
        remaining: Math.max(0, intervalMinutes * 60 - elapsedSeconds),
        total: intervalMinutes * 60
    };
});

ipcMain.on('control-window-minimize', () => {
    if (controlWindow && !controlWindow.isDestroyed()) {
        controlWindow.minimize();
    }
});

ipcMain.on('control-window-close', () => {
    if (controlWindow && !controlWindow.isDestroyed()) {
        controlWindow.close();
    }
});

// ── 应用生命周期 ──────────────────────────────────────
app.whenReady().then(() => {
    if (isWindows) {
        Menu.setApplicationMenu(null);
    }

    createTray();
    showControlWindow();
});

// macOS: 点击 Dock 图标时重新显示控制面板
app.on('activate', () => {
    showControlWindow();
});

app.on('window-all-closed', (e) => {
    // macOS 上不退出应用
    e.preventDefault?.();
});

app.on('before-quit', () => {
    app.isQuitting = true;
    stopTimer();
});
