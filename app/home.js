const { app, Menu, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');

let logoWindow;
let mainWindow;
let fridaIDEWindow;

const commonWebPreferences = {
    contextIsolation: false,
    nodeIntegration: true,
    webviewTag: true,
    devTools: true,
};

const createWindow = (options) => {
    const window = new BrowserWindow(options);
    window.on('closed', () => {
        if (window === logoWindow) logoWindow = null;
        if (window === mainWindow) mainWindow = null;
        if (window === fridaIDEWindow) fridaIDEWindow = null;
    });
    return window;
};

const createTransparentWindow = () => {
    const { width, height } = screen.getPrimaryDisplay().size;
    logoWindow = createWindow({
        width,
        height,
        frame: false,
        resizable: false,
        transparent: true,
        skipTaskbar: true,
        webPreferences: commonWebPreferences,
        alwaysOnTop: true,
        fullscreen: true,
    });
    logoWindow.loadFile('logo.html');
    logoWindow.setIgnoreMouseEvents(true);
};

const createMainWindow = () => {
    mainWindow = createWindow({
        width: 550,
        height: 343,
        frame: false,
        resizable: false,
        transparent: true,
        alwaysOnTop: false,
        webPreferences: commonWebPreferences,
    });
    mainWindow.setMinimumSize(480, 320);
    mainWindow.loadFile('index.html');

    globalShortcut.register('Ctrl+P', () => {
        mainWindow.webContents.openDevTools();
    });
};

const createFridaIDEWindow = () => {
    fridaIDEWindow = createWindow({
        width: 750,
        height: 800,
        frame: true,
        resizable: true,
        webPreferences: commonWebPreferences,
    });

    fridaIDEWindow.loadFile('./Frida/index.html');
    fridaIDEWindow.setMinimumSize(480, 320);
    // fridaIDEWindow.webContents.openDevTools();
    Menu.setApplicationMenu(null);
};

const registerIpcHandlers = () => {
    ipcMain.on('close-transparent-window', () => {
        if (logoWindow) logoWindow.close();
    });

    ipcMain.on('createMainWindow', createMainWindow);
    ipcMain.on('createFridaIDEWindow', createFridaIDEWindow);
    ipcMain.on('close-app', app.quit);
    ipcMain.on('minimize-window', () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow) focusedWindow.minimize();
    });
};

let isToggling = false;

const toggleMainWindowVisibility = () => {
    if (isToggling) return; 
    isToggling = true;

    if (mainWindow && mainWindow.isVisible()) {
        mainWindow.hide();
    } else if (mainWindow) {
        mainWindow.show();
    } else {
        createMainWindow();
    }

    setTimeout(() => {
        isToggling = false; 
    }, 200);
};

// 所有窗口关闭事件
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// 应用程序就绪事件
app.whenReady().then(() => {
    createTransparentWindow(); 
    registerIpcHandlers();

    // 注册 F1 快捷键
    globalShortcut.register('F1', () => {
        toggleMainWindowVisibility();
    });
});

// 应用程序激活事件
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createTransparentWindow();
});

// 当应用退出时注销所有快捷键
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
