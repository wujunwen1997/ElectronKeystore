import pathToRegexp from 'path-to-regexp'

const checkWalletName = (rule, value, callback) => {
  value && value.length > 20 ? callback('不能超过20个字符') :  callback()
}
const pathMatchRegexp = (regexp, pathname) => {
  return pathToRegexp(regexp).exec(pathname)
}
function timeFormat(time) {
  var d = new Date(time);

  var year = d.getFullYear();       //年
  var month = d.getMonth() + 1;     //月
  var day = d.getDate();            //日

  var hh = d.getHours();            //时
  var mm = d.getMinutes();          //分
  var ss = d.getSeconds();           //秒

  var clock = year + "/";

  if (month < 10)
    clock += "0";

  clock += month + "/";

  if (day < 10)
    clock += "0";

  clock += day + " ";

  if (hh < 10)
    clock += "0";

  clock += hh + ":";
  if (mm < 10) clock += '0';
  clock += mm + ":";

  if (ss < 10) clock += '0';
  clock += ss;
  return (clock);
}
function filterLastZore (Value) {
  const regexp = /(?:\.0*|(\.\d+?)0+)$/
  return Value.toString().replace(regexp, '$1')
}
const checkUrl = (rule, value, callback) => {
  let reg = /^((https|http|ftp|rtsp|mms)?:\/\/)+[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/
  if (reg.test(value)) {
    callback()
  } else {
    callback('请输入正确的URL');
  }
}
function isNumber(val) {
  let regPos = /^\d+(\.\d+)?$/; //非负浮点数
  let regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
  if(regPos.test(val) || regNeg.test(val)) {
    return true;
  } else {
    return false;
  }
}
const checkToken = (rule, value, callback) => {
  if (value &&　value.length === 32) {
    callback()
  } else {
    callback('Token格式有误！')
  }
}
const checkAesKey = (rule, value, callback) => {
  if (value &&　value.length === 24) {
    callback()
  } else {
    callback('AesKey格式有误！')
  }
}
const checkPassword = (rule, value, callback) => {
  let reg = /^([a-z0-9\.\@\!\#\$\%\^\&\*\(\)]){8,20}$/i;
  if (reg.test(value)) {
    callback()
  } else {
    callback('8-20个字符，含数字、字母和符号')
  }
}
export {
  checkWalletName,
  pathMatchRegexp,
  timeFormat,
  filterLastZore,
  checkUrl,
  isNumber,
  checkToken,
  checkAesKey,
  checkPassword
}
