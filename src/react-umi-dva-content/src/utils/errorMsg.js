import {message} from 'antd';

const errorMsg = (arg, success, fail) => {
  if (arg && arg.data && arg.data !== '{}' && !arg.errorMsg) {
    success && success()
  } else {
    message.error(arg.errorMsg)
    fail && fail()
  }
}

export default errorMsg
