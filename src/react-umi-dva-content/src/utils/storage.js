const localstorage = window.sessionStorage

const walletName = 'walletName'
const walletPath = 'walletPath'
const url = 'url'
const aesKey = 'aesKey'
const aesToken = 'aesToken'
export function setUserInfo (data) {
  data.walletName &&　localstorage.setItem(walletName, data.walletName)
  data.walletPath　&& localstorage.setItem(walletPath, data.walletPath)
  data.url && localstorage.setItem(url, data.url)
  data.aesKey && localstorage.setItem(aesKey, data.aesKey)
  data.aesToken && localstorage.setItem(aesToken, data.aesToken)
}
export function getUserInfo () {
  return {
    walletName: localstorage.getItem(walletName),
    walletPath: localstorage.getItem(walletPath),
    url: localstorage.getItem(url),
    aesKey: localstorage.getItem(aesKey),
    aesToken: localstorage.getItem(aesToken),
  }
}
export function removeUserInfo() {
  localstorage.removeItem(walletName)
  localstorage.removeItem(walletPath)
  localstorage.removeItem(url)
  localstorage.removeItem(aesKey)
  localstorage.removeItem(aesToken)
}
