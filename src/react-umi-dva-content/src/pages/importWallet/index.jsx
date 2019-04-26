import React, {Component} from 'react'
import s from './index.scss'
import {Form, Input, Button, Icon} from 'antd';
import Link from 'umi/link'
import {remote} from '../../config/Electron.js'
import {checkWalletName} from '@/utils/index'

class RouterComponent extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const onImport = () => {
      console.log(remote)
      const { dialog } = remote
      let that = this
      dialog.showOpenDialog({title: '链付：Keystore 文件导入', filters: [{name: 'wallet', extensions: ['wallet']}]}, function (filePaths) {
        console.log(filePaths)
        // if (filePaths.length > 0) {
          // that.recoverAccountFrm.accountPrivatekeyFilePath = filePaths[0]
        // }
      })
    }
    return (
      <div className={s.import}>
        <p className={s.title}>钱包导入</p>
        <div className={s.tip}>提示：通过钱包Keystore 文件导入！</div>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <Form.Item>
            {getFieldDecorator('Keystore', {
              rules: [{ required: true, message: 'Please input your username!' }],
            })(
              <Input prefix='Keystore文件' placeholder="请选择" disabled={true} addonAfter={<Icon type="plus" onClick={onImport}/>}/>
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
        <ul className={s.bot}>
          <li><Link to='/login'>登录钱包</Link></li>
          <li>|</li>
          <li><Link to='/createWallet'>创建钱包</Link></li>
        </ul>
      </div>
    )
  }
}

const WrappedNormalLoginForm = Form.create({ name: 'import-wallet' })(RouterComponent);

export default WrappedNormalLoginForm
