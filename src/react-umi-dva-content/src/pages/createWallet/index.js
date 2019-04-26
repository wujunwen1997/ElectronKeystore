import React, {Component} from 'react'
import s from './index.scss'
import {Form, Input, Button, message} from 'antd';
import Link from 'umi/link'
import { connect } from 'dva'
import {checkWalletName} from '@/utils/index'
import {ipcRenderer} from '@/config/Electron.js'

@connect(({loading}) => ({loading}))
class RouterComponent extends Component {
  state = {
    loading: false
  }
  render() {
    const { form, loading, dispatch } = this.props;
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
      let that = this
      that.props.form.validateFields((err, values) => {
        if (!err) {
          delete values.surePassword
          // console.log('Received values of form: ', values);
          that.setState({loading: true})
          ipcRenderer.send("create-wallet", values);
          // 成功
          ipcRenderer.on("create-wallet-result", function (event, arg) {
            // dispatch({
            //   type: 'createWallet/info',
            //   payload: arg
            // });
            that.setState({loading: false})
            message.success('创建成功！')
          });
        }
      });
    }
    return (
      <div className={s.create}>
        <p className={s.title}>创建钱包</p>
        <span>警示：密码不可重置，密码不可找回，请牢记密码！</span>
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
        <ul className={s.bot}>
          <li><Link to='/login'>登录钱包</Link></li>
          <li>|</li>
          <li><Link to='/importWallet'>钱包导入</Link></li>
        </ul>
      </div>
    )
  }
}
const WrappedNormalLoginForm = Form.create({ name: 'create-wallet' })(RouterComponent);

export default WrappedNormalLoginForm
