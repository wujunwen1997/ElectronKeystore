import React, {PureComponent, Fragment} from 'react'
import {Icon, Alert, Button, message} from 'antd'
import s from './index.scss'
import {remote} from '../../../config/Electron.js'
import Popover from '@/components/Popover/index.jsx'
import {ipcRenderer} from '@/config/Electron.js'
import router from "umi/router";
import LinkOpt from '@/components/LinkOpts'

ipcRenderer.on("export-keystore-result", function (event, arg) {
  message.success('Keystore 文件导出成功！')
  router.push('/login');
});
class RouterComponent extends PureComponent {

  saveAccountPrivKeyFile = () => {
    const { dialog } = remote
    let reqSaveAccountPrivatekeyFileData = {
      accountNick: '123',
      savePrivPath: ''
    }
    dialog.showSaveDialog({title: '导出 Keystore 文件', filters: [{name: 'wallet', extensions: ['wallet']}]}, function (filePaths) {
      if (filePaths !== undefined) {
        reqSaveAccountPrivatekeyFileData.savePrivPath = filePaths
        //  调用导出事件
        ipcRenderer.send("export-keystore", reqSaveAccountPrivatekeyFileData);
      }
    })
  }
  render() {
    return (
      <Fragment>
        <div className={s.createSuccess}>
          <Icon type="check-circle" />
          <p>钱包创建成功</p>
          <span>
          为了安全，在您使用前，请备份钱包！
           <Popover text='Keystore：是您钱包的文件，用钱包密码才能导入使用，请牢记钱包密码！'>
            <Icon type="question-circle" />
          </Popover>
        </span>
          <Alert message="警告： 密码不可找回，如果忘记密码，只能通过私钥重新创建钱包" type="warning" showIcon />
          <Button block onClick={this.saveAccountPrivKeyFile}>
            导出 Keystore 文件
          </Button>
        </div>
        <LinkOpt/>
      </Fragment>
    )
  }
}

export default RouterComponent
