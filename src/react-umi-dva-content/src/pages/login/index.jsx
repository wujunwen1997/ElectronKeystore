import React, {Component} from 'react'
import { Button } from 'antd';
import s from './index.scss'
import Link from 'umi/link'

class RouterComponent extends Component {
  render() {
    return (
      <div className={s.log}>
        <p className={s.tle}>欢迎使用链付钱包</p>
        <Button ghost block className={s.btn}><Link to='/createWallet'>创建钱包</Link></Button>
        <Button ghost block className={s.btn}><Link to='/importWallet'>导入钱包</Link></Button>
      </div>
    )
  }
}

export default RouterComponent
