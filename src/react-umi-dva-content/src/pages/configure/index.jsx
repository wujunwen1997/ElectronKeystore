import React, {Component} from 'react'
import s from './index.scss'
import { Form, Input, Button, message } from 'antd';
import {checkToken, checkAesKey} from '@/utils/index.js'
import {ipcRenderer} from '@/config/Electron.js'
import {connect} from "dva";
import router from "umi/router";
import errorMsg from "@/utils/errorMsg.js";

@connect()
class ConfigureComponent extends Component {
  state = {
    url: '',
    aesKey: '',
    aesToken: '',
    walletName: null,
    walletPath: '--'
  }
  submit = () => {
    this.props.form.validateFields(
      (err) => {
        if (!err) {
          ipcRenderer.send("set-gateway", this.props.form.getFieldsValue())
        }
      },
    );
  }
  layout = () => {
    ipcRenderer.send('logout');
  }
  sendLayout = (event, arg) => {
    const success = () => {
      ipcRenderer.send("get-wallet-info")
      ipcRenderer.removeListener("get-wallet-info-result", this.getWalletInfoResult);
      router.push('/')
    }
    errorMsg(arg, success)
  }
  setGatewayResult = (event, arg) => {
    errorMsg(arg, () => {message.success('保存成功')})
  }
  //  得到网关配置
  getGatewayResult = (event, arg) => {
    const success = () => {
      this.setState({aesKey: arg.data.aesKey, aesToken: arg.data.aesToken, url: arg.data.url})
    }
    const fail = () => {
      this.setState({aesKey: '', aesToken: '', url: ''})
    }
    errorMsg(arg, success, fail)
  };
  //  得到钱包信息
  getWalletInfoResult = (event, arg) => {
    const success = () => {
      this.props.dispatch({
        type: 'userModel/setModel',
        payload: {walletName: arg.data.walletName}
      })
      this.setState({walletName: arg.data.walletName, walletPath: arg.data.walletPath})
      ipcRenderer.send("get-gateway");
    }
    const fail = () => {
      this.setState({walletName: null, walletPath: '--'})
    }
    errorMsg(arg, success, fail)
  };
  componentDidMount () {
    ipcRenderer.send("get-wallet-info")
    ipcRenderer.on("set-gateway-result", this.setGatewayResult);
    ipcRenderer.on("logout-result", this.sendLayout)
    ipcRenderer.on("get-gateway-result", this.getGatewayResult);
    ipcRenderer.on("get-wallet-info-result", this.getWalletInfoResult);
  }
  componentWillUnmount () {
    ipcRenderer.removeListener("set-gateway-result", this.setGatewayResult)
    ipcRenderer.removeListener("logout-result", this.sendLayout)
    ipcRenderer.removeListener("get-gateway-result", this.getGatewayResult)
    ipcRenderer.removeListener("get-wallet-info-result", this.getWalletInfoResult);
  }
  render() {
    const {url, aesKey, aesToken, walletName, walletPath} = this.state
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={s.configure}>
        <div className={s.textGroup}>
          <div className={s.textGroupDiv}>
            <p>基本信息</p>
            <div>
              <label>钱包名</label>
              <span>{walletName}</span>
              <Button type="primary" size={'small'} className={s.layout} onClick={this.layout}>钱包切换</Button>
            </div>
            <div><label>钱包文件路径</label><span>{walletPath}</span></div>
          </div>
          <div className={s.textGroupDiv}>
            <p>网关设置</p>
            <Form.Item label="Aeskey" hasFeedback>
              {getFieldDecorator('aesKey', {
                rules: [{validator: checkAesKey}, { required: true, message: '请输入Aeskey值'}],
                initialValue: aesKey
              })(
                <Input placeholder="请输入Aeskey值"/>
              )}
            </Form.Item>
            <Form.Item label="AesToken" hasFeedback>
              {getFieldDecorator('aesToken', {
                rules: [{validator: checkToken}, { required: true, message: '请输入AesToken值'}],
                initialValue: aesToken
              })(
                <Input placeholder="请输入AesToken值"/>
              )}
            </Form.Item>
            <Form.Item label="网关" hasFeedback>
              {getFieldDecorator('url', {
                initialValue: url,
                rules: [{ required: true, message: '请输入网关信息'}],
              })(
                <Input placeholder="请输入网关"/>
              )}
            </Form.Item>
            <Button type="primary" size={'small'} className={s.saveBtn} onClick={this.submit}>保存</Button>
          </div>
          <div className={s.textGroupDiv}>
            <p>版本信息</p>
            <div><label>官网</label><span>https://test.chainspay.com/index.html</span></div>
            <div><label>当前版本</label><span>V1.0</span></div>
          </div>
        </div>
      </div>
    )
  }
}
const WrappedDynamicRule = Form.create({ name: 'dynamic_rule' })(ConfigureComponent);
export default WrappedDynamicRule
