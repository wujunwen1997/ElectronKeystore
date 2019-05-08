import React, {Component} from 'react'
import {Icon, Menu} from 'antd'
import s from './index.scss'
import Link from "umi/link"
import {connect} from "dva";
import {getUserInfo} from '@/utils/storage.js'

@connect()
class logged extends Component {
  state = {
    current: 'signatureTransaction',
  }

  handleClick = (e) => {
    this.setState({
      current: e.key,
    });
  }
  render() {
    const { children } = this.props;
    const {walletName} = getUserInfo()
    return (
      <div className={s.logged}>
       <div className={s.top}>
         <Menu
           onClick={this.handleClick}
           selectedKeys={[this.state.current]}
           mode="horizontal" className={s.myHeader}
         >
           <Menu.Item key="signatureTransaction">
             <Link to="/home/BTC"><Icon type="form" />签名交易</Link>
           </Menu.Item>
           <Menu.Item key="addressManagement">
             <Link to="/addressManagement"><Icon type="book" />地址管理</Link>
           </Menu.Item>
           <Menu.Item key="HDManagement">
             <Link to="/home"><Icon type="unlock" />HD管理</Link>
           </Menu.Item>
         </Menu>
         <div className={s.right}>
             <Link to="/configure"><Icon type="setting" />{walletName}</Link>
         </div>
       </div>
        <div className={s.content}>
          {children}
        </div>
      </div>
    )
  }
}

export default logged
