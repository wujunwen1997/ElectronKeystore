import React, {Component} from 'react'
import { Menu} from 'antd';
import {connect} from "dva";
import {pathMatchRegexp} from '@/utils/index.js'
import router from "umi/router";
import s from './index.scss'

@connect()
class Sider extends Component {
  render() {
    const {children, location} = this.props;
    const handleClick = (e) => {
      router.push(`/addressManagement/importAddress/${e.key}`)
    };
    return (
      <div className={s.importAddress}>
        <Menu
          className={s.menu}
          onClick={handleClick}
          style={{ width: 120 }}
          defaultSelectedKeys={[pathMatchRegexp('/addressManagement/ImportAddress/:id', location.pathname)[1]]}
          mode="inline"
        >
          <Menu.Item key="wif">
            <span>WIF格式私钥</span>
          </Menu.Item>
          <Menu.Item key="json">
            <span>JSON格式私钥</span>
          </Menu.Item>
        </Menu>
        <div className={s.content}>
          {children}
        </div>
      </div>

    );
  }
}


export default Sider
