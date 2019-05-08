const path = require('path');
const glob = require('glob');
const fs = require('fs');
const Database = require('better-sqlite3');
const crypto = require('crypto');
const bcrypto = require('blockchain-crypto');

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
                self.openWallet(data.walletName);
                let salt = crypto.randomBytes(16).toString('hex');
                crypto.pbkdf2(data.password, salt, 1000, 64, 'sha512', (err, hash) => {
                    const stmt = self.db.prepare('INSERT INTO password VALUES (?, ?)');
                    const info = stmt.run(hash.toString('hex'), salt);
                    if (info.changes === 1) {
                        event.sender.send('create-wallet-result', {data: true, errorMsg: null});
                    } else {
                        event.sender.send('create-wallet-result', {data: false, errorMsg: '密码保存失败'});
                    }
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
                self.openWallet(data.walletName);
                const stmt = self.db.prepare('SELECT * FROM password');
                const info = stmt.get();
                if (info === undefined) {
                    event.sender.send('login-result', {data: false, errorMsg: '钱包文件中没有密码信息'});
                    return;
                }
                const hash = info.password_hash;
                const salt = info.salt;
                crypto.pbkdf2(data.password, salt, 1000, 64, 'sha512', (err, hash1) => {
                    if (hash1.toString('hex') === hash) {
                        self.aesKey = crypto.scryptSync(data.password, 'chainspay', 16);
                        event.sender.send('login-result', {data: true, errorMsg: null});
                    } else {
                        event.sender.send('login-result', {data: false, errorMsg: '密码不正确'});
                    }
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
        获取当前的钱包名和路径，参数无
        返回结果result, 获取成功钱包名和路径，如果获取失败errorMsg会包含失败原因
        {
          data: {
            walletName:'',
            walletPath:''
          },
          errorMsg: null
        }
         */
        self.ipcMain.on('get-wallet-info', function (event) {
            event.sender.send('get-wallet-info-result', {data: {walletName:self.walletName, walletPath:self.walletPath}, errorMsg: null});
        });

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
                if (self.gateWay !== undefined) {
                    event.sender.send('get-gateway-result', {data: self.gateWay, errorMsg: null});
                    return;
                }
                const stmt = self.db.prepare('SELECT * FROM gateway');
                const info = stmt.get();
                if (info === undefined) {
                    event.sender.send('get-gateway-result', {data: null, errorMsg: '网关配置不存在'});
                    return;
                }
                self.gateWay = {
                    aesKey: info.aes_key,
                    aesToken: info.aes_token,
                    url: info.url
                };
                event.sender.send('get-gateway-result', {data: self.gateWay, errorMsg: null});
            } catch (e) {
                event.sender.send('get-gateway-result', {data: null, errorMsg: e.message});
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
                        event.sender.send('set-gateway-result', {data: true, errorMsg: null});
                        return;
                    }
                } else {
                    const update = self.db.prepare('UPDATE gateway SET url = ?, aes_key = ?, aes_token = ?');
                    const updateInfo = update.run(data.url, data.aesKey, data.aesToken);
                    if (updateInfo.changes === 1) {
                        event.sender.send('set-gateway-result', {data: true, errorMsg: null});
                        return;
                    }
                }
                event.sender.send('set-gateway-result', {data: false, errorMsg: '设置网关失败'});
            } catch (e) {
                event.sender.send('set-gateway-result', {data: false, errorMsg: e.message});
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

        /*
        导入wif，参数data是string
        返回结果result, 成功返回导入数据，如果导入出现异常则返回异常原因
        {
          data: {
            success:1, // 成功新增
            fail:0, // wif格式不正确，无法导入
            duplicate:0 // wif格式正确但数据库已存在
          },
          errorMsg: null,
        }
         */
        self.ipcMain.on('import-wif', function (event, data) {
            try {
                let success = 0;
                let fail = 0;
                let duplicate = 0;
                data.replace(/\n/g, " ").split(" ").forEach(function (wif) {
                    let importResult = self.importWif(wif);
                    if (importResult === undefined) {
                        fail += 1;
                    } else {
                        const select = self.db.prepare('SELECT * FROM key WHERE pubkey_hash = ?');
                        const selectInfo = select.get(importResult.pubkeyHash);
                        if (selectInfo === undefined) {
                            const insert = self.db.prepare('INSERT INTO key VALUES (?, ?, ?)');
                            const insertInfo = insert.run(importResult.pubkeyHash, importResult.encryptKey, new Date().getTime());
                            if (insertInfo.changes === 1) {
                                success += 1;
                            } else {
                                fail += 1;
                            }
                        } else {
                            duplicate += 1;
                        }
                    }
                });
                event.sender.send('import-wif-result', {data: {success, fail, duplicate}, errorMsg: null});
            } catch (e) {
                event.sender.send('import-wif-result', {data: null, errorMsg: e.message});
            }
        });

        /*
        从文件导入wif，参数data是file
        返回结果result, 成功返回导入数据，如果导入出现异常则返回异常原因
        {
          data: {
            success:1,
            fail:0,
            duplicate:0
          },
          errorMsg: null,
        }
         */
        self.ipcMain.on('import-wif-from-file', function (event, data) {
            try {
            } catch (e) {
                event.sender.send('import-wif-from-file-result', {data: null, errorMsg: e.message});
            }
        });

        /*
        删除key，参数data是pubkeyHash
        返回结果result, 成功返回true，如果失败返回false，errorMsg会包含失败原因
        {
          data: true,
          errorMsg: null,
        }
         */
        self.ipcMain.on('delete-key', function (event, data) {
            try {
                const update = self.db.prepare('DELETE FROM key WHERE pubkey_hash = ?');
                const updateInfo = update.run(data);
                if (updateInfo.changes === 1) {
                    event.sender.send('delete-key-result', {data: true, errorMsg: null});
                } else {
                    event.sender.send('delete-key-result', {data: false, errorMsg: 'key不存在'});
                }
            } catch (e) {
                event.sender.send('delete-key-result', {data: false, errorMsg: e.message});
            }
        });
    }

    getWalletPath() {
        return this.isDevMode ? __dirname : this.app.getPath('userData');
    }

    openWallet(walletName) {
        // 如果是开发者模式，钱包文件就存放在当前目录
        const userDataPath = this.getWalletPath();
        const walletPath = path.join(userDataPath, `${walletName}.wallet`);

        this.db = new Database(walletPath);
        const init = fs.readFileSync(path.join(__dirname,'migrate','init.sql'), 'utf8');
        this.db.exec(init);

        this.walletName = walletName;
        this.walletPath = walletPath;

        const stmt = self.db.prepare('SELECT * FROM gateway');
        const info = stmt.get();
        if (info !== undefined) {
            self.gateWay = {
                aesKey: info.aes_key,
                aesToken: info.aes_token,
                url: info.url
            };
        }
    }

    closeWallet() {
        this.db.close();
        this.db = undefined;
        this.aesKey = undefined;
        this.gateWay = undefined;
        this.walletName = undefined;
        this.walletPath = undefined;
    }

    importWif(wif) {
        // 每个链的每个网络都逐个尝试
        let result = this.importBtcMainWif(wif);
        if (result !== undefined) {
            return result;
        }
        return undefined;
    }

    importBtcMainWif(wif) {
        try {
            let cipher = crypto.createCipheriv('aes-128-cbc', this.aesKey, Buffer.alloc(16, 0));
            const key = bcrypto.btc.decode_key(wif);
            const keyRaw = key.get_raw();
            cipher.update(Buffer.from(keyRaw));
            return {encryptKey:cipher.final('hex'), pubkeyHash:key.get_pubkey().key_id()}
        } catch (e) {
            return undefined;
        }
    }
}
