import React, {Component} from 'react'
import {Icon, Menu} from 'antd'
import s from './index.scss'
import Link from "umi/link"
import {ipcRenderer} from '@/config/Electron.js'
import {connect} from "dva";
import errorMsg from "@/utils/errorMsg.js";

@connect((userModel) => ({userModel}))
class logged extends Component {
  state = {
    walletName: null
  }
  getWalletInfoResult = (event, arg) => {
    const success = () => {
      this.setState({walletName: arg.data.walletName})
    }
    const fail = () => {
      this.setState({walletName: null})
    }
    errorMsg(arg, success, fail)
    ipcRenderer.removeListener("get-wallet-info-result", this.getWalletInfoResult);
  }
  componentDidMount () {
    ipcRenderer.send("get-wallet-info")
    ipcRenderer.on("get-wallet-info-result", this.getWalletInfoResult);
  }
  render() {
    const { children, userModel, dispatch } = this.props;
    const {current} = userModel.userModel
    const handleClick = (e)=> {
      dispatch({ type: 'userModel/setModel', payload: {current: e.key}})
    }
    return (
      <div className={s.logged}>
       <div className={s.top}>
         <Menu
           onClick={handleClick}
           selectedKeys={[current]}
           mode="horizontal" className={s.myHeader}
           style={{width: '100%'}}
         >
           <Menu.Item key="signatureTransaction">
             <Link to="/home/BTC"><Icon type="form" />签名交易</Link>
           </Menu.Item>
           <Menu.Item key="addressManagement">
             <Link to="/addressManagement"><Icon type="book" />地址管理</Link>
           </Menu.Item>
           <Menu.Item key="HDManagement">
             <Link to="/HDManagement"><Icon type="unlock" />HD管理</Link>
           </Menu.Item>
           <Menu.Item key="configure" style={{float: 'right'}}>
             <Link to="/configure"><Icon type="setting" />{this.state.walletName}</Link>
           </Menu.Item>
         </Menu>
       </div>
        <div className={s.content}>
          {children}
        </div>
      </div>
    )
  }
}

export default logged
