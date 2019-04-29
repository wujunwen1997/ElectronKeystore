import React, {Component} from 'react'
import s from './index.scss'
import {Form, Input, Button, message} from 'antd';
import router from 'umi/router';
import { connect } from 'dva'
import {checkWalletName} from '@/utils/index'
import {ipcRenderer} from '@/config/Electron.js'
import LinkOpt from '@/components/LinkOpts'

ipcRenderer.on("create-wallet-result", function (event, arg) {
  if (arg.data) {
    message.success('创建成功！')
    router.push('/login');
  } else {
    message.error('创建失败 ', arg.errorMsg);
  }
});
@connect(({loading}) => ({loading}))
class RouterComponent extends Component {
  state = {
    loading: false
  }
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const checkPassword = (rule, value, callback) => {
      let reg = /^([a-z0-9\.\@\!\#\$\%\^\&\*\(\)]){8,20}$/i;
      if (reg.test(value)) {
        callback()
      } else {
        callback('8-20个字符，含数字、字母和符号')
      }
    }
    const surePassword = (rule, value, callback) => {
      this.props.form.getFieldsValue().password === value ? callback() : callback('两次输入密码不同')
    }
    const handleSubmit = (e) => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          delete values.surePassword
          ipcRenderer.send("create-wallet", values);
        }
      });
    }
    return (
      <div className={s.create}>
        <p className={s.title}>创建钱包</p>
        <Form onSubmit={handleSubmit} className="login-form">
          <Form.Item hasFeedback>
            {getFieldDecorator('walletName', {
              rules: [
                { required: true, message: '请输入钱包名!' },
                { validator: checkWalletName}
                ],
            })(
              <Input prefix='钱包名' placeholder="不超过20个字符" />
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator('password', {
              rules: [
                { required: true, message: '请输入密码！' },
                { validator: checkPassword}
              ],
            })(
              <Input prefix='密码' type="password" placeholder="8-20个字符，含数字、字母和符号" />
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator('surePassword', {
              rules: [{validator: surePassword }],
            })(
              <Input prefix='确认密码' type="password"  placeholder="8-20个字符，含数字、字母和符号"/>
            )}
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" block loading={this.state.loading}>创建钱包</Button>
          </Form.Item>
        </Form>
        <LinkOpt login={true} imports={true}/>
      </div>
    )
  }
}
const WrappedNormalLoginForm = Form.create({ name: 'create-wallet' })(RouterComponent);

export default WrappedNormalLoginForm
