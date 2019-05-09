import React, {Component} from 'react'
import s from './index.scss'
import {Form, Input, Button, message} from 'antd';
import { connect } from 'dva'
import {checkToken, checkAesKey} from '@/utils/index.js'
import {ipcRenderer} from '@/config/Electron.js'
import router from 'umi/router';
import errorMsg from "@/utils/errorMsg.js";

@connect()
class RouterComponent extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log(values)
      if (!err) {
        ipcRenderer.send("set-gateway", values)
        ipcRenderer.on("set-gateway-result", this.setGatewayResult);
      }
    });
  }
  setGatewayResult = (event, arg) => {
    const success = () => {
      message.success('配置成功')
      router.push('/')
    }
    errorMsg(arg, success)
    ipcRenderer.removeListener("set-gateway-result", this.setGatewayResult)
  }
  pass = () => {
    router.push('/')
  }
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div className={s.create}>
        <p className={s.title}>配置网关</p>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <Form.Item hasFeedback>
            {getFieldDecorator('aesKey', {
              rules: [{validator: checkAesKey},],
            })(
              <Input prefix='AesKey' placeholder="请输入AesKey值" />
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator('aesToken', {
              rules: [{validator: checkToken}],
            })(
              <Input prefix='AesToken' placeholder="请输入AesToken值" />
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator('url', {
              rules: [{ required: true, message: '请输入网关信息'}],
            })(
              <Input prefix='网关'  placeholder="请输入网关"/>
            )}
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" block>
              创建钱包
            </Button>
          </Form.Item>
        </Form>
        <p className={s.pass} onClick={this.pass}>跳过 ></p>
      </div>
    )
  }
}
const WrappedNormalLoginForm = Form.create({ name: 'create-wallet' })(RouterComponent);

export default WrappedNormalLoginForm
