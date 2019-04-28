import React, {Component} from 'react'
import router from "umi/router";

class HomeComponent extends Component {
  goBackRouter = () => {
    let storage = window.localStorage
    storage.removeItem('token')
    router.push('/login');
  }
  render() {
    return (
      <div>
        123home
        <button onClick={this.goBackRouter}>back</button>
      </div>
    )
  }
}

export default HomeComponent
