import React, {PureComponent} from 'react'
import s from "./index.scss";
import Link from "umi/link";
import PropTypes from 'prop-types'

class LinkOpts extends PureComponent {
  render() {
    const {create, imports, login} = this.props
    return (
      <ul className={s.bot}>
        {login &&  <li><Link to='/login'>登录钱包</Link></li>}
        {create && <li><Link to='/register/createWallet'>创建钱包</Link></li>}
        {imports && <li><Link to='/register/importWallet'>钱包导入</Link></li>}
      </ul>
    )
  }
}
LinkOpts.propTypes = {
  imports: PropTypes.bool,
  create: PropTypes.bool,
  login: PropTypes.bool
};
export default LinkOpts
