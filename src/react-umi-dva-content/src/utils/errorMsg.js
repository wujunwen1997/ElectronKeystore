import {message} from 'antd';

const errorMsg = (arg, success) => {
  if (arg.data) {
    success()
  } else {
    message.error(`操作失败 ${arg.errorMsg}`)
  }
}

export default errorMsg
