import React, {Component, Fragment} from 'react'
import styles from './index.css';
import needLog from './needLog/index'


class BasicLayout extends Component{
  render () {
    const Container = needLog;
    const { children } = this.props;
    return (
      <Fragment>
        {children}
      </Fragment>
    );
  }
}
export default BasicLayout;
