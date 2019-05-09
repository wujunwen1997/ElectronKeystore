import React, {Component} from 'react'
import needLog from './needLog/index'
import logged from './logged/index'
import { connect } from 'dva';

@connect(({userModel}) =>({userModel}))
class BasicLayout extends Component{
  render () {
    const { children, userModel } = this.props;
    const isLogin = userModel.walletName;
    const MyLayout = isLogin ? logged : needLog;
    return (
          <MyLayout>
             {children}
          </MyLayout>
    );
  }
}
export default BasicLayout;
