import {message} from 'antd';

const errorMsg = (arg, success, fail) => {
  if (arg.data) {
    success()
  } else {
    message.error(arg.errorMsg)
    fail()
  }
}

export default errorMsg
