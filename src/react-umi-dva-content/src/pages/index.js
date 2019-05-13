import React, {Component} from 'react'
import {Form, Input, Button, Select, message} from 'antd';
import s from './index.scss'
import {ipcRenderer} from '@/config/Electron.js'
import LinkOpt from '@/components/LinkOpts'
import router from "umi/router";
import errorMsg from "@/utils/errorMsg.js";
import {connect} from "dva";
import logo from '@/assets/logo.png'
const { Option } = Select;

@connect((userModel) => ({userModel}))
class Login extends Component {
  state = {
    walletsArr: []
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({loading: true})
        ipcRenderer.send("login", values);
        ipcRenderer.on("login-result", this.login);
      }
    });
  }
  login = (event, arg) => {
    const loginSuccess = () => {
      message.success('登录成功！');
      router.push('/home/BTC');
    }
    errorMsg(arg, loginSuccess)
    ipcRenderer.removeListener("login-result", this.login)
  }
  getWallets = (event, arg) => {
    const success = () => {
      if (arg.data && arg.data.length > 0) {
        this.setState({walletsArr: arg.data})
      } else {
        router.push('/welcome');
      }
    }
    const fail = () => {
      this.setState({walletsArr: []})
      router.push('/welcome');
    }
    errorMsg(arg, success, fail)
    ipcRenderer.removeListener("get-user-wallet-result", this.getWallets)
  }
  componentDidMount () {
    ipcRenderer.send("get-user-wallet");
    ipcRenderer.on("get-user-wallet-result", this.getWallets);
  }
  render() {
    const { getFieldDecorator } = this.props.form

    return (
      <div className={s.login}>
        <div className={s.title}>
          <img src={logo} alt={''}></img>
          登录链付钱包
        </div>
        <Form onSubmit={this.handleSubmit} className="login-form" layout={'horizontal'} >
          {
            this.state.walletsArr && this.state.walletsArr.length > 0 &&  <Form.Item>
              <span className={s.walletName}>钱包名</span>
              {getFieldDecorator('walletName', {
                rules: [{ required: true, message: '请选择钱包名！' }],
                initialValue: this.state.walletsArr[this.state.walletsArr.length - 1]
              })(
                <Select>
                  {
                    this.state.walletsArr.map(u=> {
                      return <Option value={u} key={u}>{u}</Option>
                    })
                  }
                </Select>
              )}
            </Form.Item>
          }
          <Form.Item hasFeedback>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: '请输入密码！' }],
            })(
              <Input type="password" prefix='密码' placeholder='请输入密码'/>
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <LinkOpt create={true} imports={true}/>
      </div>
    )
  }
}

export default Form.create({ name: 'login' })(Login);
