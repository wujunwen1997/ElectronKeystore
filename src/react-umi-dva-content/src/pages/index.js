import React, { PureComponent } from 'react'
import Redirect from 'umi/redirect'
// const { ipcRenderer } =  window.require('electron');
//
// ipcRenderer.on("add-item-result", function (event, arg) {
//   console.log("add-item-result", arg);
// });
//
// ipcRenderer.on("query-all-item-result", function (event, arg) {
//   console.log("query-all-item-result", arg);
// });
class Index extends PureComponent {

  render() {
    const onclick = () => {
      // ipcRenderer.send("add-item");
    }
    return <Redirect to='/login' />
  }
}

export default Index
