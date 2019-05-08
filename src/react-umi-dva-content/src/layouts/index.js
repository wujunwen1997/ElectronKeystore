import React, {Component} from 'react'
import needLog from './needLog/index'
import logged from './logged/index'
import { connect } from 'dva';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import {getUserInfo} from "../utils/storage";

@connect((model) => ({model}))
class BasicLayout extends Component{
  render () {
    const { children } = this.props;
    let o = getUserInfo()
    const MyLayout = o.walletName && o.url ? logged : needLog;
    return (
          <MyLayout>
             {children}
          </MyLayout>
    );
  }
}
export default BasicLayout;
