import React, {Component} from 'react'
import {Menu, Badge} from 'antd';
import {connect} from "dva";
import s from './index.scss'
import router from "umi/router";
import PropTypes from 'prop-types';

@connect(({ home, loading }) => ({ home, loading }))
class HomeComponent extends Component {
  render() {
    const {home} = this.props
    const {coin, navList} = home
    const handleClick = (e) => {
      router.push(`/home/${e.key}`)
    }
    let arr = []
    for (let i in navList) {
      let o = {};
      o[i] = navList[i];
      arr.push(o)
    }
    return (
      <div className={s.leftNav}>
        <Menu
          onClick={handleClick}
          style={{ width: 120 }}
          defaultSelectedKeys={coin}
          selectedKeys={coin}
          mode="inline"
          className={s.menu}
        >
          {
            arr && arr.length > 0 && arr.map(_ => {
              return (
                <Menu.Item key={Object.keys(_)[0]} >
                  <Badge count={_[Object.keys(_)[0]]} overflowCount={999}>
                    <div>{Object.keys(_)[0]}</div>
                  </Badge>
                </Menu.Item>
              )
            })
          }
        </Menu>
        <div className={s.content}>
          {this.props.children}
        </div>
      </div>
    )
  }
}
HomeComponent.propTypes = {
  home: PropTypes.shape({
    coin: PropTypes.array,
    navList: PropTypes.object
  })
};
export default HomeComponent
