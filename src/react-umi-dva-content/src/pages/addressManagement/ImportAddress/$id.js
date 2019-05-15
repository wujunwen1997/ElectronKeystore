import React, {Component} from 'react'
import { Input, Button, message } from 'antd';
import {connect} from "dva";
import {pathMatchRegexp} from '@/utils/index.js'
import s from './index.scss'
import {ipcRenderer} from '@/config/Electron.js'
import errorMsg from "@/utils/errorMsg.js";
import router from "umi/router";
import {remote} from "../../../config/Electron";
const { TextArea } = Input;

@connect(({addressManagement}) => ({addressManagement}))
class Sider extends Component {
  goBack = () => {
    router.push('/addressManagement')
  };
  render() {
    const {addressManagement, dispatch, location} = this.props;
    const {wifText, jsonText, password} = addressManagement;
    let isWif = pathMatchRegexp('/addressManagement/ImportAddress/:id', location.pathname)[1] === 'wif'
    const ReadFile = (arg) => {
      const success = () => {
        dispatch({
          type: 'addressManagement/setModel',
          payload: isWif ? {wifText:  arg.data} : {jsonText: arg.data}
        })
      };
      errorMsg(arg, success);
    };
    //  导入
    const importWifEvent = (arg) => {
      const success = () => {
        const {success, fail, duplicate} = arg.data;
        let str = []
        success && success > 0 && str.push(`成功导入${success}个私钥`)
        fail && fail > 0 && str.push(`${fail}个私钥导入失败`)
        duplicate && duplicate > 0 && str.push(`${duplicate}个私钥已存在`)
        message.info(str.join(', '));
      };
      const fail = () => {
        message.error('导入WIF格式私钥失败')
      };
      errorMsg(arg, success, fail);
    };
    const importJsonEvent = (arg) => {
      const success = () => {
        message.success('私钥导入成功！')
      };
      errorMsg(arg, success,);
    }
    const onImport = () => {
      if (isWif) {
        if (!wifText) {
          message.warning('请输入地址')
          return
        }
        const data = ipcRenderer.sendSync('import-wif', wifText);
        importWifEvent(data);
      } else {
        if (!password || !jsonText) {
          message.warning('请确认输入JSON私钥和解锁密码')
          return
        }
        const data = ipcRenderer.sendSync('import-eth-json', {json: jsonText, password: password});
        importJsonEvent(data);
      }
    };
    const changeTextAres = (e) => {
      const { value } = e.target;
      let obj = isWif ? {wifText: value} : {jsonText: value};
      dispatch({
        type: 'addressManagement/setModel',
        payload: obj
      })
    };
    const changeInput = (e) => {
      const { value } = e.target;
      dispatch({
        type: 'addressManagement/setModel',
        payload: {password: value}
      })
    }
    const fileImport = () => {
      const { dialog } = remote
      dialog.showOpenDialog({title: '链付：私钥文件导入', filters: [{extensions: ['*']}]}, function (filePaths) {
        if (filePaths) {
          if (filePaths.length > 0) {
            const data = ipcRenderer.sendSync('read-file', filePaths[0])
            ReadFile(data);
          } else {
            message.warning('选择文件为空！');
          }
        } else {
          message.warning('选择文件为空！');
        }
      })
    }
    return (
          <div className={s.wif}>
            <TextArea onChange={changeTextAres} value={isWif ? wifText : jsonText}
                      placeholder={isWif ? '在此粘贴WIF格式的私钥字符串，或从文件载入，多个私钥以进行换行分隔。' :
                        '在此粘贴JSON格式的私钥字符串，或从文件载入。'}/>
            <div className={s.bot}>
                <Button type={'primary'} size={'small'} className={s.newBtn} onClick={fileImport}>从文件载入</Button>
                {!isWif && <Input size="small" value={password} onChange={changeInput} placeholder="请在此输入解锁密码" />}
                <Button type={'primary'} size={'small'} className={s.newBtn} onClick={this.goBack}>返回</Button>
                <Button type={'primary'} size={'small'} className={s.importBtn} onClick={onImport}>导入</Button>
            </div>
          </div>
    );
  }
}


export default Sider
