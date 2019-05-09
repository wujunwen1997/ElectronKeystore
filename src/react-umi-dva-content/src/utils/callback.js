import {ipcRenderer} from '@/config/Electron.js'


ipcRenderer.on("get-wallet-info-result", this.getWalletInfoResult);
