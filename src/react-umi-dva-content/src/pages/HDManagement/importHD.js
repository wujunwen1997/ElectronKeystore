import React, {Component} from 'react'
import {Form, Input, Button, message} from 'antd';
import router from "umi/router";
import s from './import.scss'
import {ipcRenderer} from '@/config/Electron.js'
import errorMsg from "@/utils/errorMsg.js";
import {checkPassword, checkWalletName} from "@/utils/index.js";

class App extends Component {
  goBack = () => {
    router.goBack()
  };
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        ipcRenderer.send('import-hd', values)
        const getDelKeysResult = (event, arg) => {
          const success = () => {
            message.success('导入成功')
            router.push('/HDManagement')
          }
          errorMsg(arg, success)
          ipcRenderer.removeListener("import-hd-result", getDelKeysResult)
        }
        ipcRenderer.on("import-hd-result", getDelKeysResult);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={s.hdContent}>
        <Form className={s.hdForm} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} onSubmit={this.handleSubmit}>
          <Form.Item
            label="助记词"
          >
            {getFieldDecorator('mnemonic', {
              rules: [{ required: true, message: '请输入您的助记词' }],
            })(
              <Input placeholder='请输入您的助记词'/>
            )}
          </Form.Item>
          <Form.Item
            label="密码"
          >
            {getFieldDecorator('password', {
              rules: [{ required: true, message: '请输入您的密码' }, { validator: checkPassword}],
            })(
              <Input type={'password'} placeholder='请输入您的密码'/>
            )}
          </Form.Item>
          <Form.Item wrapperCol={{ span: 12, offset: 5 }}>
            <Button type="primary" htmlType="submit" size={'small'}>确认</Button>
            <Button type="primary" htmlType="submit" size={'small'} onClick={this.goBack}>返回</Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappedApp = Form.create({ name: 'coordinated' })(App);

export default WrappedApp

