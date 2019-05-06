const path = require('path');
const glob = require('glob');
const fs = require('fs');
const crypto = require('crypto');

const TABLE_PASSWORD = 'password';
const TABLE_CHAINSPAY = 'chainspay';

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
        }，
        返回结果result, true表示创建成功，false表示创建失败，如果创建失败errorMsg会包含失败原因
        {
          data: true,
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
        }，
        返回结果result, true登录成功，false表示登录失败，如果登录失败errorMsg会包含失败原因
        {
          data: true,
          errorMsg: null
        }
         */
        self.ipcMain.on('login', function (event, data) {
            try {
                if (self.knex === undefined) {
                    self.openWallet(data.walletName, false);
                }
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
        返回结果result, true登出成功，false表示登出失败，如果登出失败errorMsg会包含失败原因
        {
          data: true,
          errorMsg: null
        }
         */
        self.ipcMain.on('logout', function (event) {
            self.closeWallet();
            event.sender.send('logout-result', {data: true, errorMsg: null});
        });

        /*
        获取本地所有的钱包文件名，参数无
        返回结果result, 获取成功返回钱包名的数组，如果获取失败errorMsg会包含失败原因
        {
          data: [string,..],
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

        /*
        网关设置是否有配置
        返回结果result, true有设置，false表示没有设置，如果data为null则表示获取网关设置是否有配置时出现异常
        {
          data: true,
          errorMsg: null
        }
         */
        self.ipcMain.on('is-gateway-set', function (event) {
            try {
                if (self.gateWay !== undefined) {
                    event.sender.send('is-gateway-set-result', {data: true, errorMsg: null});
                    return;
                }
                let result = self.knex.select('*').from(TABLE_CHAINSPAY);
                result.then(function(rows){
                    if (rows.length === 0) {
                        event.sender.send('is-gateway-set-result', {data: false, errorMsg: null});
                        return;
                    }
                    self.gateWay = {
                        aesKey: rows[0].aes_key,
                        aesToken: rows[0].aes_token,
                        url: rows[0].url
                    };
                    event.sender.send('is-gateway-set-result', {data: true, errorMsg: null});
                });
            } catch (e) {
                event.sender.send('is-gateway-set-result', {data: null, errorMsg: e.message});
            }
        });

        /*
        对访问链付的数据进行加密和签名，参数data是任意的json object
        返回结果result, 加密成功返回发送给链付的请求数据，如果网关配置不存在则返回错误
        {
          data: {
            body:'the body of the request to chainspay',
            sig:'the sig of the body'
          },
          errorMsg: null,
        }
         */
        self.ipcMain.on('encrypt-data', function (event, data) {
            try {
                if (self.gateWay === undefined) {
                    event.sender.send('encrypt-data-result', {data: null, errorMsg: '网关配置不存在'});
                    return;
                }
                let cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(self.gateWay.aesKey, 'base64'), Buffer.alloc(16, 0));
                let encrypt = cipher.update(JSON.stringify(data), 'utf8', 'base64');
                encrypt += cipher.final('base64');
                let body = self.gateWay.aesToken + encrypt;
                let sha1 = crypto.createHash('sha1');
                let sig = sha1.update(body).digest('hex');
                event.sender.send('encrypt-data-result', {data: {body, sig}, errorMsg: null});
            } catch (e) {
                event.sender.send('encrypt-data-result', {data: null, errorMsg: e.message});
            }
        });

        /*
        对链付返回的数据进行解密，参数data是
        {
          body:'the body of the response from chainspay',
          sig:'the sig of the body'
        }
        返回结果result, 解密成功返回json object，如果网关配置不存在、签名校验不正确、解密失败则返回错误
        {
          data: {},
          errorMsg: null,
        }
         */
        self.ipcMain.on('decrypt-data', function (event, data) {
            try {
                if (self.gateWay === undefined) {
                    event.sender.send('decrypt-data-result', {data: null, errorMsg: '网关配置不存在'});
                    return;
                }
                let sha1 = crypto.createHash('sha1');
                let sig = sha1.update(data.body).digest('hex');
                if (sig !== data.sig) {
                    event.sender.send('decrypt-data-result', {data: null, errorMsg: '签名校验失败'});
                    return;
                }
                let encrypt = data.body.substring(self.gateWay.aesToken.length);
                let decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(self.gateWay.aesKey, 'base64'), Buffer.alloc(16, 0));
                let decrypt = decipher.update(encrypt, 'base64', 'utf8');
                decrypt += decipher.final('utf8');
                event.sender.send('decrypt-data-result', {data: JSON.parse(decrypt), errorMsg: null});
            } catch (e) {
                event.sender.send('decrypt-data-result', {data: null, errorMsg: e.message});
            }
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
        if (this.knex !== undefined) {
            this.knex = undefined;
        }
        if (this.gateWay !== undefined) {
            this.gateWay = undefined;
        }
    }
}
