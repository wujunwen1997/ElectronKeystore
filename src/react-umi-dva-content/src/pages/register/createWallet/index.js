import React, {Component} from 'react'
import s from './index.scss'
import {Form, Input, Button, message} from 'antd';
import router from 'umi/router';
import { connect } from 'dva'
import {checkWalletName} from '@/utils/index'
import {ipcRenderer} from '@/config/Electron.js'
import LinkOpt from '@/components/LinkOpts'
import errorMsg from "@/utils/errorMsg.js";
import {checkPassword} from "@/utils/index.js";
import PropTypes from 'prop-types';

@connect(({userModel}) => ({userModel}))
class RouterComponent extends Component {
  state = {
    loading: false,
    haveAes: false
  }
  createWalletResult = (arg) => {
    this.setState({loading: false})
    const createWalletResultSuccess = () => {
      message.success('创建成功')
      const { userModel } = this.props;
      const {aesKey, token, url} = userModel;
      (aesKey && aesKey !== '' && token && token !== '' && url && url !== '') ? router.push('/') : router.push('/register/configureGateway')
    }
    errorMsg(arg, createWalletResultSuccess)
  }
  render() {
    const { form, userModel } = this.props;
    const {aesKey, token, url} = userModel;
    const { getFieldDecorator } = form;
    const surePassword = (rule, value, callback) => {
      this.props.form.getFieldsValue().password === value ? callback() : callback('两次输入密码不同')
    }
    const handleSubmit = (e) => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          delete values.surePassword
          this.setState({loading: true})
          const data = ipcRenderer.sendSync("create-wallet", values);
          this.createWalletResult(data)
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
              <Input prefix='密码' type="password" placeholder="8-20个字符" />
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator('surePassword', {
              rules: [{validator: surePassword }],
            })(
              <Input prefix='确认密码' type="password"  placeholder="8-20个字符"/>
            )}
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" block loading={this.state.loading}>
              {(aesKey && aesKey !== '' && token && token !== '' && url && url !== '') ? '进入创建' : '下一步'}
            </Button>
          </Form.Item>
        </Form>
        <LinkOpt login={true} imports={true}/>
      </div>
    )
  }
}
RouterComponent.propTypes = {
  userModel: PropTypes.shape({
    aesKey: PropTypes.string,
    token: PropTypes.string,
    url: PropTypes.string
  })
};
const WrappedNormalLoginForm = Form.create({ name: 'create-wallet' })(RouterComponent);

export default WrappedNormalLoginForm
