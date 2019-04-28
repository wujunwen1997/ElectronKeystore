import React, {Component} from 'react'
import s from "./index.scss";
import {Button} from "antd";
import Link from "umi/link";

class Welcome extends Component {
  render() {
    return (
        <div className={s.log}>
          <p className={s.tle}>
            <i className='iconfont iconlogo'></i>
            <span>登录链付钱包</span>
          </p>
          <Button block className={s.btn}><Link to='/register/createWallet'>创建钱包</Link></Button>
          <Button block className={s.btn}><Link to='/register/importWallet'>导入钱包</Link></Button>
        </div>
    )
  }
}

export default Welcome
