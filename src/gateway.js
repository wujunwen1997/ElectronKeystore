const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

export class Gateway {

    constructor(app, ipcMain, isDevMode) {
        this.app = app;
        this.ipcMain = ipcMain;
        this.isDevMode = isDevMode;
        this.init();
    }

    addListeners() {
        const self = this;

        /*
        获取网关配置
        返回结果result, 如果data为null则表示网关配置不存在或者获取失败，errorMsg会包含错误信息
        {
          data: {
            aesKey:'',
            aesToken:'',
            url:''
          },
          errorMsg: null
        }
         */
        self.ipcMain.on('get-gateway', function (event) {
            try {
                if (self.gateway !== undefined) {
                    event.returnValue = {data: self.gateway, errorMsg: null};
                } else {
                    event.returnValue = {data: null, errorMsg: '网关配置不存在'};
                }
            } catch (e) {
                event.returnValue = {data: null, errorMsg: e.message};
            }
        });

        /*
        设置网关，参数data
        {
         aesKey:'',
         aesToken:'',
         url:''
        }
        返回结果result, true表示设置成功，false表示设置失败，如果设置失败errorMsg会包含失败原因
        {
          data: true,
          errorMsg: null
        }
         */
        self.ipcMain.on('set-gateway', function (event, data) {
            try {
                const select = self.db.prepare('SELECT * FROM gateway');
                const selectInfo = select.get();
                if (selectInfo === undefined) {
                    const insert = self.db.prepare('INSERT INTO gateway VALUES (?, ?, ?)');
                    const insertInfo = insert.run(data.url, data.aesKey, data.aesToken);
                    if (insertInfo.changes === 1) {
                        self.gateway = data;
                        event.returnValue = {data: true, errorMsg: null};
                        return;
                    }
                } else {
                    const update = self.db.prepare('UPDATE gateway SET url = ?, aes_key = ?, aes_token = ?');
                    const updateInfo = update.run(data.url, data.aesKey, data.aesToken);
                    if (updateInfo.changes === 1) {
                        self.gateway = data;
                        event.returnValue = {data: true, errorMsg: null};
                        return;
                    }
                }
                event.returnValue = {data: false, errorMsg: '设置网关失败'};
            } catch (e) {
                event.returnValue = {data: false, errorMsg: e.message};
            }
        });
    }

    init() {
        const dir = this.isDevMode ? __dirname : this.app.getPath('userData');
        this.db = new Database(path.join(dir, `gateway.config`));
        const init = fs.readFileSync(path.join(__dirname,'migrate','gateway.sql'), 'utf8');
        this.db.exec(init);

        const stmt = this.db.prepare('SELECT * FROM gateway');
        const info = stmt.get();
        if (info !== undefined) {
            this.gateway = {
                aesKey: info.aes_key,
                aesToken: info.aes_token,
                url: info.url
            };
        }
    }

    getGateway() {
        return this.gateway;
    }
}
