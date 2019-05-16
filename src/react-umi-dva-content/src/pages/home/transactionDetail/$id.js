import React, {Component, Fragment} from 'react'
import s from './index.scss'
import {Icon,Button, Alert, Empty, message, Modal} from 'antd';
import router from 'umi/router';
import {connect} from "dva";
import PropTypes from 'prop-types';
import {timeFormat, filterLastZore} from '@/utils/index.js'
import {ipcRenderer} from "../../../config/Electron";
import fetch from '@/api/config/fetch.js'
import {btcAutograph, ethAutograph} from '@/api/signatureTransaction'
const confirm = Modal.confirm;

@connect(({ transactionDetail, loading }) => ({ transactionDetail, loading }))
class RouterComponent extends Component {
  back = () => {
    router.goBack()
  }
  render() {
    const {transactionDetail, loading, dispatch} = this.props
    const {inputArr, outputArr, moreText, transactionMsg} = transactionDetail
    const {blockchain, createTime, amount, fee, inputs, outputs, platformCoin} = transactionMsg
    const seeAllAddress = () => {
      let obj = {}
      obj.moreText = moreText === '显示所有地址' ? '收起所有地址' : '显示所有地址'
      inputs.length > 6 && (obj.inputArr = inputArr.length < 7 ? inputs : inputs.slice(0,6))
      outputs.length > 6 && (obj.outputArr = outputArr.length < 7 ? outputs : outputs.slice(0,6))
      dispatch({
        type: 'transactionDetail/querySuccess',
        payload: obj
      })
    }
    const axiosAutograph = (id, rawTx) => {
      let api = blockchain === 'ETHEREUM' ? ethAutograph : btcAutograph;
      fetch(api({id, rawTx})).then(() => {
          message.success('签名成功')
          router.goBack()
        })
    }
    const autograph = () => {
      confirm({
        title: '确认对此交易进行签名?',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          const data = ipcRenderer.sendSync('sign-tx', transactionMsg)
          const onAutograph = (arg) => {
            if (arg && arg.data && arg.data !== '{}' && !arg.errorMsg) {
              axiosAutograph(transactionMsg.id, arg.data)
            } else {
              message.error(arg.errorMsg)
            }
          }
          onAutograph(data)
        },
      });
    }
    const getDataMap = () => {
      return (
        <Fragment>
          <ul className={s.top}>
            <li>
              <p>币种</p>
              <span>{blockchain}</span>
            </li>
            <li>
              <p>交易时间</p>
              <span>{timeFormat(createTime)}</span>
            </li>
            <li>
              <p>交易金额</p>
              <span>{amount} {platformCoin}</span>
            </li>
            <li>
              <p>网络手续费</p>
              <span>{fee} {platformCoin}</span>
            </li>
          </ul>
          <div className={s.amount } style={{'marginTop': '40px'}}>
            <div><p>付款地址</p></div>
            <div className={s.icon}></div>
            <div><p>收款地址</p></div>
          </div>
          <div className={[s.amount, s.maxHeight, moreText !== '显示所有地址' && s.max].join(' ') }>
            <div className={s.putGet}>
              <ul>
                {
                  inputArr.map((u, index) => (
                    <li key={index}>
                      {u.address}
                      &nbsp;<span className={s.address}>{filterLastZore(u.amount)}&nbsp; {platformCoin}</span>
                    </li>
                  ))
                }
              </ul>
              {
                inputArr.length !== inputs.length && inputs && inputs.length > 6 && <span className={s.more}>......</span>
              }
            </div>
            <div className={s.icon}><Icon type="right-circle" /></div>
            <div className={s.putGet}>
              <ul>
                {
                  outputArr.map((u, index) => (
                    <li key={index}>
                      {u.address}
                      &nbsp;<span className={s.address}>{filterLastZore(u.amount)} &nbsp;{platformCoin}</span>
                    </li>
                  ))
                }
              </ul>
              {
                outputArr.length !== outputs.length && outputs && outputs.length > 6 && <span className={s.more}>......</span>
              }
            </div>
          </div>
          {
            ((outputs && outputs.length > 6) || (inputs && inputs.length > 6)) &&
            <div className={s.seeAllAddress}>
              <span onClick={seeAllAddress}>{moreText}</span>
            </div>
          }
          <div className={s.bot}>
            <Alert message="温馨提示：签名一旦确认将无法撤销!" type="info" showIcon />
            <Button onClick={this.back} size={'small'}>返回</Button> <Button size={'small'} onClick={autograph}>签名</Button>
          </div>
        </Fragment>
      )
    }
    const notData = () => {
      return (
        <Empty description={'无数据'}/>
      )
    }
    return (
      <div className={s.graphDetail}>
        {
          loading.effects['transactionDetail/getDetails'] &&  <Icon type="loading" className={s.load}/>
        }
        {
          JSON.stringify(transactionDetail.transactionMsg) === "{}" ? notData() : getDataMap()
        }
      </div>
    )
  }
}
RouterComponent.propTypes = {
  transactionDetail: PropTypes.shape({
    moreText: PropTypes.string,
    inputArr: PropTypes.array,
    outputArr: PropTypes.array
  })
};
export default RouterComponent
