//  签名交易的表格数据
export function getWithdrawTx(data) {
  return {url: 'unsignedTx/list', data}
}
//  签名交易的侧边栏信息数量
export function getNavTotal() {
  return {url: 'tx/unsignedNumber', data: '' }
}
//  eth的签名交易详情
export function getEthDetail(data) {
  return {url: `tx/eth/info`, data}
}
//  btc的签名交易详情
export function getBtcDetail(data) {
  return {url: `tx/btc/info`, data}
}
//  bnb的签名交易详情
export function getBnbDetail(data) {
  return {url: `tx/bnb/info`, data}
}
//  btc的签名交易
export function btcAutograph(data) {
  return {url: `/btc/signedTx/upload`, data}
}
//  eth的签名交易
export function ethAutograph(data) {
  return {url: `/eth/signedTx/upload`, data}
}
//  bnb的签名交易
export function bnbAutograph(data) {
  return {url: `/bnb/signedTx/upload`, data}
}
