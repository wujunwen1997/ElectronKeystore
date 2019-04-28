import React, {Component} from 'react'
import {Form, Icon, Input, Button, Select, message} from 'antd';
import s from './index.scss'
import {ipcRenderer} from '@/config/Electron.js'
import LinkOpt from '@/components/LinkOpts'
import router from "umi/router";
// import cookie from '../../utils/cookie'
const { Option } = Select;
let walletsArr = [];

ipcRenderer.on("login-result", function (event, arg) {
  message.success('登录成功！')
  let storage = window.localStorage
  storage.setItem('token', arg.data.session)
  router.push('/home');
});
class Login extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        ipcRenderer.send("login", values);
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    ipcRenderer.on("get-user-wallet-result", function (event, arg) {
      if (arg.data && arg.data.length > 0) {
        walletsArr = arg.data
      } else {
        router.push('/welcome');
        walletsArr = []
      }
    });
    return (
      <div className={s.login}>
          <p>登录</p>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <Form.Item hasFeedback>
            {getFieldDecorator('walletName', {
              rules: [{ required: true, message: 'Please input your username!' }],
            })(
              <Select>
                {
                  walletsArr.map(u=> {
                    return <Option value={u}>{u}</Option>
                  })
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password!' }],
            })(
              <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
             登录
            </Button>
          </Form.Item>
        </Form>
        <LinkOpt/>
      </div>
    )
  }
}

export default Form.create({ name: 'login' })(Login);
