const path = require('path');
const glob = require('glob');
const fs = require('fs');
const Database = require('better-sqlite3');
const crypto = require('crypto');
const bcrypto = require('blockchain-crypto');

export class Wallet {

    constructor(app, ipcMain, isDevMode, gateway) {
        this.app = app;
        this.ipcMain = ipcMain;
        this.isDevMode = isDevMode;
        this.gateway = gateway;
    }

    addListeners() {
        const self = this;

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
        导入钱包，参数data
        {
          walletPath: 钱包路径
          walletName: 新的钱包名,
          password: 密码
        }，
        返回结果result, true表示导入成功，false表示导入失败，如果导入失败errorMsg会包含失败原因
        {
          data: true,
          errorMsg: null
        }
         */
        self.ipcMain.on('import-wallet', function (event, data) {
            try {
                let db = new Database(data.walletPath);
                const result = Wallet.checkPassword(db, data.password);
                if (result.data !== true) {
                    event.sender.send('import-wallet-result', {data: false, errorMsg: result.errorMsg});
                    return;
                }
                const walletPath = self.getWalletPath(data.walletName);
                if (fs.existsSync(walletPath)) {
                    event.sender.send('import-wallet-result', {data: false, errorMsg: '钱包文件已存在'});
                    return;
                }
                fs.copyFile(data.walletPath, walletPath, (err) => {
                    if (err) {
                        event.sender.send('import-wallet-result', {data: false, errorMsg: err.message});
                        return;
                    }
                    event.sender.send('import-wallet-result', {data: true, errorMsg: null});
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

                const result = Wallet.checkPassword(self.db, data.password);
                if (result.data === true) {
                    self.aesKey = crypto.scryptSync(data.password, 'chainspay', 16);
                    self.walletInfo = {
                        walletName:data.walletName,
                        walletPath:self.getWalletPath(data.walletName)
                    };
                }
                event.sender.send('login-result', result);
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
            const walletDir = self.getWalletDir();
            const filenames = glob.sync(path.join(walletDir, '*.wallet'));
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
            if (self.walletInfo === undefined) {
                event.sender.send('get-wallet-info-result', {data: null, errorMsg: '尚未登录钱包'});
            } else {
                event.sender.send('get-wallet-info-result', {data: self.walletInfo, errorMsg: null});
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
                if (self.gateway.getGateway() === undefined) {
                    event.sender.send('encrypt-data-result', {data: null, errorMsg: '网关配置不存在'});
                    return;
                }
                let cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(self.gateway.getGateway().aesKey, 'base64'), Buffer.alloc(16, 0));
                let encrypt = cipher.update(JSON.stringify(data), 'utf8', 'base64');
                encrypt += cipher.final('base64');
                let body = self.gateway.getGateway().aesToken + encrypt;
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
                if (self.gateway.getGateway() === undefined) {
                    event.sender.send('decrypt-data-result', {data: null, errorMsg: '网关配置不存在'});
                    return;
                }
                let sha1 = crypto.createHash('sha1');
                let sig = sha1.update(data.body).digest('hex');
                if (sig !== data.sig) {
                    event.sender.send('decrypt-data-result', {data: null, errorMsg: '签名校验失败'});
                    return;
                }
                let encrypt = data.body.substring(self.gateway.getGateway().aesToken.length);
                let decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(self.gateway.getGateway().aesKey, 'base64'), Buffer.alloc(16, 0));
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
        查看key，参数data是
        {
          pageNum:0, // 从0开始
          pageSize:10
        }
        返回结果result, 按照创建时间降序，成功返回分页数据，如果失败返回null，errorMsg会包含失败原因
        {
          data: {
            totalPage:3, // 总页数
            pageNum:0, // 当前页位置
            elements:[ // 数据
              {
                pubkeyHash:'',
                createdAt:''
              }
            ]
          },
          errorMsg: null,
        }
         */
        self.ipcMain.on('query-key', function (event, data) {
            try {
                const totalStmt = self.db.prepare('SELECT count(*) AS count FROM key');
                const totalInfo = totalStmt.get();
                let total = 0;
                if (totalInfo !== undefined) {
                    total = totalInfo.count;
                }
                if (total === 0) {
                    event.sender.send('query-key-result', {
                        data: {
                            totalPage:0,
                            pageNum:data.pageNum,
                            elements:[]
                        },
                        errorMsg: null
                    });
                    return;
                }
                const totalPage = Math.ceil(total/data.pageSize);
                if (data.pageNum > totalPage - 1) {
                    event.sender.send('query-key-result', {
                        data: {
                            totalPage:totalPage,
                            pageNum:data.pageNum,
                            elements:[]
                        },
                        errorMsg: null
                    });
                    return;
                }
                const offset = data.pageNum * data.pageSize;
                const selectStmt = self.db.prepare('SELECT * FROM key ORDER BY created_at DESC LIMIT ? OFFSET ?');
                const selectInfo = selectStmt.all(data.pageSize, offset);
                const elements = [];
                for (let i = 0; i < selectInfo.length; i++) {
                    elements.push({
                        pubkeyHash:selectInfo[i].pubkey_hash,
                        createdAt:Date.parse(selectInfo[i].created_at).toLocaleString()
                    })
                }
                event.sender.send('query-key-result', {
                    data: {
                        totalPage:totalPage,
                        pageNum:data.pageNum,
                        elements:elements
                    },
                    errorMsg: null
                });
            } catch (e) {
                event.sender.send('query-key-result', {data: null, errorMsg: e.message});
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

    getWalletDir() {
        // 如果是开发者模式，钱包文件就存放在当前目录
        return this.isDevMode ? __dirname : this.app.getPath('userData');
    }

    getWalletPath(walletName) {
        const walletDir = this.getWalletDir();
        return path.join(walletDir, `${walletName}.wallet`);
    }

    openWallet(walletName) {
        const walletPath = this.getWalletPath(walletName);
        this.db = new Database(walletPath);
        const init = fs.readFileSync(path.join(__dirname,'migrate','init.sql'), 'utf8');
        this.db.exec(init);
    }

    closeWallet() {
        if (this.db !== undefined) {
            this.db.close();
            this.db = undefined;
        }
        this.aesKey = undefined;
        this.walletInfo = undefined;
    }

    static checkPassword(db, password) {
        const stmt = db.prepare('SELECT * FROM password');
        const info = stmt.get();
        if (info === undefined) {
            return {data: false, errorMsg: '钱包文件中没有密码信息'};
        }
        const hash = crypto.pbkdf2Sync(password, info.salt, 1000, 64, 'sha512');
        if (hash.toString('hex') === info.password_hash) {
            return {data: true, errorMsg: null};
        } else {
            return {data: false, errorMsg: '密码不正确'};
        }
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
