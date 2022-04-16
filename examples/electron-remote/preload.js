const {
    contextBridge,
    ipcRenderer
} = require('electron');

const remote = require('@electron/remote');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    getGlobal(key) {
        return remote.getGlobal(key);
    }
});