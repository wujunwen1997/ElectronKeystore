import React, {Component} from 'react'
import s from './index.scss'
import {Form, Input, Button, message, Select} from 'antd';
import { connect } from 'dva'
import {checkToken, checkAesKey} from '@/utils/index.js'
import {ipcRenderer} from '@/config/Electron.js'
import router from 'umi/router';
import errorMsg from "@/utils/errorMsg.js";

const Option = Select.Option;

@connect()
class RouterComponent extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const data = ipcRenderer.sendSync("set-gateway", values)
        this.setGatewayResult(data);
      }
    });
  }
  setGatewayResult = (arg) => {
    const success = () => {
      message.success('配置成功')
      router.push('/')
    }
    errorMsg(arg, success)
  }
  pass = () => {
    router.push('/')
  }
  render() {
    const { form } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;
    const onSelect = (val) => {
      setFieldsValue({url: val})
    }
    const selectAfter = (
      <Select className={s.select} value={'网关'} onSelect={onSelect} dropdownMatchSelectWidth={false}>
        <Option value="https://customer-test.chainspay.com/api/gateway">https://customer-test.chainspay.com/api/gateway</Option>
        <Option value="https://customer.chainspay.com/api/gateway">https://customer.chainspay.com/api/gateway</Option>
      </Select>
    );
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
            {getFieldDecorator('token', {
              rules: [{validator: checkToken}],
            })(
              <Input prefix='Token' placeholder="请输入Token值" />
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator('url', {
              rules: [{ required: true, message: '请输入网关信息'}],
            })(
              <Input placeholder="请输入网关" addonBefore={selectAfter}/>
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
