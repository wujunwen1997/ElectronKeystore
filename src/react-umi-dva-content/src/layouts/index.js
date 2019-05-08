import React, {Component} from 'react'
import needLog from './needLog/index'
import logged from './logged/index'
import { connect } from 'dva';
import {ipcRenderer} from '@/config/Electron.js'
import errorMsg from "@/utils/errorMsg.js";
// import { TransitionGroup, CSSTransition } from 'react-transition-group'

@connect()
class BasicLayout extends Component{
  state = {
    walletName: null
  }
  //  得到钱包信息
  getWalletInfoResult = (event, arg) => {
    const success = () => {
      this.setState({walletName: arg.data.walletName})
    }
    const fail = () => {
      this.setState({walletName: null})
    }
    errorMsg(arg, success, fail)
  };
  componentDidMount () {
    ipcRenderer.send("get-wallet-info")
    ipcRenderer.on("get-wallet-info-result", this.getWalletInfoResult);
  }
  componentWillUnmount () {
    ipcRenderer.removeListener("get-wallet-info-result", this.getWalletInfoResult);
  }
  render () {
    const { children } = this.props;
    const MyLayout = this.state.walletName ? logged : needLog;
    return (
          <MyLayout>
             {children}
          </MyLayout>
    );
  }
}
export default BasicLayout;
