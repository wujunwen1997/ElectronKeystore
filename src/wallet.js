const path = require('path');
const glob = require('glob');
const fs = require('fs');
const crypto = require('crypto');

const TABLE_PASSWORD = 'password';

export class Wallet {

    constructor(app, ipcMain, isDevMode) {
        this.app = app;
        this.ipcMain = ipcMain;
        this.isDevMode = isDevMode;
    }

    addListeners() {
        /*
        创建钱包，参数data
        {
          walletName: 钱包名,
          password: 密码
        }，返回结果result
        {
          data: true, // true表示创建成功，false表示创建失败，如果创建失败errorMsg会包含失败原因
          errorMsg: null
        }
         */
        const self = this;
        self.ipcMain.on('create-wallet', function (event, data) {
            try {
                self.openWallet(data.walletName, true);
                self.initTable(function () {
                    let salt = crypto.randomBytes(16).toString('hex');
                    crypto.pbkdf2(data.password, salt, 1000, 64, 'sha512', (err, hash) => {
                        self.knex(TABLE_PASSWORD)
                            .insert({password_hash:hash.toString('hex'), salt})
                            .then( function () {
                                event.sender.send('create-wallet-result', {data: true, errorMsg: null});
                            });
                    });
                });
            } catch (e) {
                event.sender.send('create-wallet-result', {data: false, errorMsg: e.message});
            }
        });

        /*
        登录钱包，参数data
        {
          walletName: 钱包名,
          password: 密码
        }，返回结果result
        {
          data: true, // true登录成功，false表示登录失败，如果登录失败errorMsg会包含失败原因
          errorMsg: null
        }
         */
        self.ipcMain.on('login', function (event, data) {
            if (self.knex !== undefined) {
                event.sender.send('login-result', {data: false, errorMsg: '请先登出当前钱包'});
                return;
            }
            try {
                self.openWallet(data.walletName, false);
                let result = self.knex.select('*').from(TABLE_PASSWORD);
                result.then(function(rows){
                    if (rows.length === 0) {
                        event.sender.send('login-result', {data: false, errorMsg: '钱包文件中没有密码信息'});
                        return;
                    }
                    const hash = rows[0].password_hash;
                    const salt = rows[0].salt;
                    crypto.pbkdf2(data.password, salt, 1000, 64, 'sha512', (err, hash1) => {
                        if (hash1.toString('hex') === hash) {
                            event.sender.send('login-result', {data: true, errorMsg: null});
                        } else {
                            event.sender.send('login-result', {data: false, errorMsg: '密码不正确'});
                        }
                    });
                });
            } catch (e) {
                event.sender.send('login-result', {data: false, errorMsg: e.message});
            }
        });

        /*
        登出钱包，参数无
        返回结果result
        {
          data: true, // true登出成功，false表示登出失败，如果登出失败errorMsg会包含失败原因
          errorMsg: null
        }
         */
        self.ipcMain.on('logout', function (event) {
            if (self.knex === undefined) {
                event.sender.send('logout-result', {data: false, errorMsg: '尚未登录钱包'});
                return;
            }
            self.closeWallet();
            event.sender.send('logout-result', {data: true, errorMsg: null});
        });

        /*
        获取本地所有的钱包文件名，参数无
        返回结果result
        {
          data: [string,..], // 获取成功返回钱包名的数组，如果获取失败errorMsg会包含失败原因
          errorMsg: null
        }
         */
        self.ipcMain.on('get-user-wallet', function (event) {
            const userDataPath = self.getWalletPath();
            const filenames = glob.sync(path.join(userDataPath, '*.wallet'));
            let namesWithoutExtension = [];
            filenames.forEach((filename) => { namesWithoutExtension.push(path.parse(filename).name); });
            event.sender.send('get-user-wallet-result', {data: namesWithoutExtension, errorMsg: null});
        });
    }

    getWalletPath() {
        return this.isDevMode ? __dirname : this.app.getPath('userData');
    }

    openWallet(walletName, firstCreate) {
        // 如果是开发者模式，钱包文件就存放在当前目录
        const userDataPath = this.getWalletPath();
        const walletPath = path.join(userDataPath, `${walletName}.wallet`);

        // 如果是首次创建，要检查文件是否已存在
        if (firstCreate && fs.existsSync(walletPath)) {
            throw new Error("钱包已存在");
        } else if (!firstCreate && !fs.existsSync(walletPath)) {
            throw new Error("钱包不存在");
        }

        this.knex = require("knex")({
            client: "sqlite3",
            connection: {
                filename: walletPath
            },
            useNullAsDefault: true
        });
    }

    initTable(afterInitSuccess) {
        const self = this;
        self.knex.schema.hasTable(TABLE_PASSWORD).then(function(exists) {
            if (!exists) {
                return self.knex.schema.createTable(TABLE_PASSWORD, function(table) {
                    table.string('password_hash').primary();
                    table.string('salt');
                }).then(afterInitSuccess);
            }
        });
    }

    closeWallet() {
        this.knex = undefined;
    }
}
