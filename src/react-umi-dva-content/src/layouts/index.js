import React, {Component, Fragment} from 'react'
import styles from './index.css';
import needLog from './needLog/index'
import logged from './logged/index'


class BasicLayout extends Component{
  render () {
    const Container = needLog;
    const { children } = this.props;
    const storage = window.localStorage
    const MyLayout = storage.getItem('token') ? logged : Container
    return (
      <MyLayout>
        {children}
      </MyLayout>
    );
  }
}
export default BasicLayout;
