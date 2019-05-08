import React, {Component} from 'react'
import {Form, Input, Button, Select, message} from 'antd';
import s from './index.scss'
import {ipcRenderer} from '@/config/Electron.js'
import LinkOpt from '@/components/LinkOpts'
import router from "umi/router";
import errorMsg from "@/utils/errorMsg.js";
const { Option } = Select;

class Login extends Component {
  state = {
    walletsArr: []
  };
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        ipcRenderer.send("login", values);
      }
    });
  };
  //  得到网关配置
  getGatewayResult = (event, arg) => {
    const {dispatch} = this.props;
    if (arg.data === null) {
      dispatch({
        type: 'userModel/setModel',
        payload: {aesKey: '', aesToken: '', url: ''}
      });
      message.error(arg.errorMsg)
    } else {
      dispatch({
        type: 'userModel/setModel',
        payload: {aesKey: arg.data.aesKey, aesToken: arg.data.aesToken, url: arg.data.url}
      })
    }
    router.push('/home');
  };
  //  得到钱包信息
  getWalletInfoResult = (event, arg) => {
    console.log(22222, arg);
    const {dispatch} = this.props;
    if (arg.data === null) {
      dispatch({
        type: 'userModel/setModel',
        payload: {walletName: '--', walletPath: '--'}
      });
      message.error(arg.errorMsg)
    } else {
      dispatch({
        type: 'userModel/setModel',
        payload: {walletName: arg.data.walletName, walletPath: arg.data.walletPath}
      });
      ipcRenderer.send("get-gateway");
    }
  };

  login = (event, arg) => {
    console.log(343333, arg)
    // errorMsg(arg, loginSuccess)
    // if (arg.data) {
    //   message.success('登录成功！');
    //   ipcRenderer.send("get-wallet-info");
    // } else {
    //   message.error(arg.errorMsg)
    // }
  };
  getWallets = (event, arg) => {
    if (arg.data && arg.data.length > 0) {
      console.log(123456, arg)
      this.setState({
        walletsArr: arg.data
      })
    } else {
      router.push('/welcome');
      this.setState({
        walletsArr: []
      })
    }
  };
  componentDidMount () {
    ipcRenderer.send("get-user-wallet");
    ipcRenderer.on("get-user-wallet-result", this.getWallets);
    ipcRenderer.on("login-result", this.login);
    ipcRenderer.on("get-gateway-result", this.getGatewayResult);
    ipcRenderer.on("get-wallet-info-result", this.getWalletInfoResult);
  }
  componentWillUnmount () {
    ipcRenderer.removeListener("get-user-wallet-result", this.getWallets)
    ipcRenderer.removeListener("login-result", this.login)
    ipcRenderer.removeListener("get-gateway-result", this.getGatewayResult)
    ipcRenderer.removeListener("get-wallet-info-result", this.getWalletInfoResult);
  }
  render() {
    const { getFieldDecorator } = this.props.form

    return (
      <div className={s.login}>
          <p>登录链付钱包</p>
        <Form onSubmit={this.handleSubmit} className="login-form" layout={'horizontal'} >
          {
            this.state.walletsArr && this.state.walletsArr.length > 0 &&  <Form.Item hasFeedback>
              {getFieldDecorator('walletName', {
                rules: [{ required: true, message: 'Please input your username!' }],
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
              rules: [{ required: true, message: 'Please input your Password!' }],
            })(
              <Input type="password" placeholder='请输入密码'/>
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
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
