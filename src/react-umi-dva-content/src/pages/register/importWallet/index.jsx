import React, {Component} from 'react'
import s from './index.scss'
import {Form, Input, Button, Icon, message} from 'antd';
import {remote} from '../../../config/Electron.js'
import {checkWalletName} from '@/utils/index'
import {ipcRenderer} from '@/config/Electron.js'
import LinkOpt from '@/components/LinkOpts'
import router from "umi/router";

ipcRenderer.on("import-keystore-result", function (event, arg) {
  message.success('钱包导入成功！')
  router.push('/login');
});
class RouterComponent extends Component {
  state = {
    recoverAccountFrm: {
      accountNick: '',
      accountPrivatekeyFilePath: '',
      accountPwd: ''
    },
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        ipcRenderer.send("import-keystore", values);
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const onImport = () => {
      const { dialog } = remote
      let that = this
      dialog.showOpenDialog({title: '链付：Keystore 文件导入', filters: [{name: 'wallet', extensions: ['wallet']}]}, function (filePaths) {
        if (filePaths) {
          if (filePaths.length > 0) {
            that.setState({
            recoverAccountFrm: Object.assign(that.state.recoverAccountFrm, {accountPrivatekeyFilePath: filePaths[0]})
          })
          } else {
            message.warning('选择文件为空！');
          }
        } else {
          message.warning('选择文件为空！');
        }
      })
    }
    return (
      <div className={s.import}>
        <p className={s.title}>钱包导入</p>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <Form.Item>
            {getFieldDecorator('Keystore', {
              rules: [{ required: true, message: '请导入钱包文件！' }],
              initialValue: this.state.recoverAccountFrm.accountPrivatekeyFilePath
            })(
              <Input prefix='Keystore文件' placeholder="推荐使用右侧导入功能"  addonAfter={<Icon type="plus" onClick={onImport}/>}/>
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: '请输入旧钱包密码!' }],
            })(
              <Input prefix='Keystore密码' type="password" placeholder="请输入旧钱包密码" />
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator('newWalletName', {
              rules: [ { validator: checkWalletName}],
            })(
              <Input prefix='新钱包名'  placeholder="请输入钱包名，不超过20个字符"/>
            )}
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" block>导入钱包</Button>
          </Form.Item>
        </Form>
        <LinkOpt create={true} login={true}/>
      </div>
    )
  }
}

const WrappedNormalLoginForm = Form.create({ name: 'import-wallet' })(RouterComponent);

export default WrappedNormalLoginForm
