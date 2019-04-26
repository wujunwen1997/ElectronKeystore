const checkWalletName = (rule, value, callback) => {
  value && value.length > 20 ? callback('不能超过20个字符') :  callback()
}

export {
  checkWalletName
}
