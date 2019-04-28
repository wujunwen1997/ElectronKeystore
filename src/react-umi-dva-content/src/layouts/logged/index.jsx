import React, {Component} from 'react'

class RouterComponent extends Component {
  render() {
    const { children } = this.props;
    return (
      <div>
        已登录
        {children}
      </div>
    )
  }
}

export default RouterComponent
