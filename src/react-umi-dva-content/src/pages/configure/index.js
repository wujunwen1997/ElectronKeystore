import React, {Component} from 'react'
import s from './index.scss'
import { Form, Input, Button, message, Select, AutoComplete } from 'antd';
import {checkToken, checkAesKey} from '@/utils/index.js'
import {ipcRenderer} from '@/config/Electron.js'
import {connect} from "dva";
import router from "umi/router";
import errorMsg from "@/utils/errorMsg.js";
import PropTypes from 'prop-types';

const Option = Select.Option;

@connect((userModel) => ({userModel}))
class ConfigureComponent extends Component {
  state = {
    dataSource: [],
  };
  submit = () => {
    this.props.form.validateFields(
      (err) => {
        if (!err) {
          const data = ipcRenderer.sendSync("set-gateway", this.props.form.getFieldsValue())
          this.setGatewayResult(data)
        }
      },
    );
  }
  layout = () => {
    const data = ipcRenderer.sendSync('logout');
    this.sendLayout(data);
  }
  sendLayout = (arg) => {
    const success = () => {
      router.push('/configure')
    }
    errorMsg(arg, success)
  }
  setGatewayResult = (arg) => {
    errorMsg(arg, () => {message.success('保存成功')})
  }
  render() {
    const {userModel, form} = this.props;
    const {walletName, walletPath, url, aesKey, token} = userModel.userModel;
    const { getFieldDecorator, setFieldsValue } = form;
    const onSelect = (val) => {
      setFieldsValue({url: val})
    }
    const selectAfter = (
      <Select className={s.select} value={''} onSelect={onSelect} dropdownClassName={s.option}>
        <Option value="https://customer-test.chainspay.com/api/gateway">https://customer-test.chainspay.com/api/gateway</Option>
        <Option value="https://customer.chainspay.com/api/gateway">https://customer.chainspay.com/api/gateway</Option>
      </Select>
    );
    return (
      <div className={s.configure}>
        <div className={s.textGroup}>
          <div className={s.textGroupDiv}>
            <p>基本信息</p>
            <div>
              <label>钱包名</label>
              <span>{walletName}</span>
              <Button type="primary" size={'small'} className={s.layout} onClick={this.layout}>切换钱包</Button>
            </div>
            <div className={s.keepWay}>
              <label></label>
              <div style={{width: '80px'}}>钱包文件路径</div>
              <div>{walletPath}</div></div>
          </div>
          <div className={s.textGroupDiv}>
            <p>网关设置</p>
            <Form.Item label="Aeskey">
              {getFieldDecorator('aesKey', {
                rules: [{validator: checkAesKey}, { required: true, message: '请输入Aeskey值'}],
                initialValue: aesKey
              })(
                <Input placeholder="请输入Aeskey值"/>
              )}
            </Form.Item>
            <Form.Item label="Token">
              {getFieldDecorator('token', {
                rules: [{validator: checkToken}, { required: true, message: '请输入Token值'}],
                initialValue: token
              })(
                <Input placeholder="请输入Token值"/>
              )}
            </Form.Item>
            <Form.Item label="网关">
              {getFieldDecorator('url', {
                initialValue: url,
                rules: [{ required: true, message: '请输入网关信息'}],
              })(
                <Input placeholder="请输入网关" addonAfter={selectAfter}/>
              )}
            </Form.Item>
            <Button type="primary" size={'small'} className={s.saveBtn} onClick={this.submit}>保存</Button>
          </div>
          <div className={s.textGroupDiv}>
            <p>版本信息</p>
            <div className={s.keepWay}>
              <label></label>
              <div style={{width: '80px'}}>官网</div>
              <div style={{color: '#077BE7'}}>https://chainspay.com</div>
            </div>
            <div><label>当前版本</label><span>V1.0.0</span></div>
          </div>
        </div>
      </div>
    )
  }
}
ConfigureComponent.propTypes = {
  userModel: PropTypes.shape({
    token: PropTypes.string,
    aesKey: PropTypes.string,
    url: PropTypes.string,
    walletPath: PropTypes.string,
    walletName: PropTypes.string
  })
};
const WrappedDynamicRule = Form.create({ name: 'dynamic_rule' })(ConfigureComponent);
export default WrappedDynamicRule
