import React, {PureComponent} from 'react'
import s from "./index.scss";
import Link from "umi/link";
import PropTypes from 'prop-types'

class LinkOpts extends PureComponent {
  render() {
    const {createWallet} = this.props
    return (
      <ul className={s.bot}>
        <li><Link to='/login'>登录钱包</Link></li>
        <li>|</li>
        <li>{createWallet ? <Link to='/register/createWallet'>创建钱包</Link> : <Link to='/register/importWallet'>钱包导入</Link>}</li>
      </ul>
    )
  }
}
LinkOpts.propTypes = {
  createWallet: PropTypes.bool
};
export default LinkOpts
