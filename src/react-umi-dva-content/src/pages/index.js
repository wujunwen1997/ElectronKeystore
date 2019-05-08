import React, {Component} from 'react'
import {Form, Input, Button, Select, message} from 'antd';
import s from './index.scss'
import {ipcRenderer} from '@/config/Electron.js'
import LinkOpt from '@/components/LinkOpts'
import router from "umi/router";
import errorMsg from "@/utils/errorMsg.js";
import {connect} from "dva";
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
      }
    });
  }
  login = (event, arg) => {
    const loginSuccess = () => {
      ipcRenderer.send("get-wallet-info")
      message.success('登录成功！');
    }
    errorMsg(arg, loginSuccess)
  }
  getWallets = (event, arg) => {
    const success = () => {
      this.setState({walletsArr: arg.data})
    }
    const fail = () => {
      this.setState({walletsArr: []})
      router.push('/welcome');
    }
    errorMsg(arg, success, fail)
  }
  //  得到钱包信息
  getWalletInfoResult = (event, arg) => {
    const success = () => {
      this.props.dispatch({
        type: 'userModel/setModel',
        payload: {walletName: arg.data.walletName}
      })
      if (arg.data.walletName) {
        router.push('/home/BTC');
      }
    }
    const fail = () => {
      this.props.dispatch({
        type: 'userModel/setModel',
        payload: {walletName: null}
      })
    }
    errorMsg(arg, success, fail)
  };
  componentDidMount () {
    ipcRenderer.send("get-user-wallet");
    ipcRenderer.on("get-user-wallet-result", this.getWallets);
    ipcRenderer.on("login-result", this.login);
    ipcRenderer.on("get-wallet-info-result", this.getWalletInfoResult);
  }
  componentWillUnmount () {
    ipcRenderer.removeListener("get-user-wallet-result", this.getWallets)
    ipcRenderer.removeListener("login-result", this.login)
    ipcRenderer.removeListener("get-wallet-info-result", this.getWalletInfoResult);
  }
  render() {
    const { getFieldDecorator } = this.props.form

    return (
      <div className={s.login}>
        <p className={s.title}>登录链付钱包</p>
        <Form onSubmit={this.handleSubmit} className="login-form" layout={'horizontal'} >
          {
            this.state.walletsArr && this.state.walletsArr.length > 0 &&  <Form.Item>
              <span className={s.ccc}>钱包名</span>
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
