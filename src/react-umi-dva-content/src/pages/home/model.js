import {pathMatchRegexp} from '@/utils/index.js'
import {getWithdrawTx, getNavTotal} from '@/api/signatureTransaction'
import fetch from '@/api/config/fetch.js'
import {message} from 'antd'
import {cloneDeep} from 'lodash'

export default {
  namespace: 'home',
  state: {
    data: {},
    coin: ['BTC'],
    selectedRowKeys: [],
    navList: {
      BTC: 0, BCH: 0, ETH: 0, LTC: 0, RCO: 0, ECO: 0
    }
  },
  reducers: {
    querySuccess(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
  effects: {
    * detailList({ payload }, { call, put }) {
      let name = '';
      let obj = cloneDeep(payload)
      switch (payload.blockchain) {
        case 'BTC':
          name = 'BITCOIN';
          break;
        case 'BCH':
          name = 'BITCOINCASH';
          break;
        case 'ETH':
          name = 'ETHEREUM';
          break;
        case 'LTC':
          name = 'LITECOIN';
          break;
        case 'RCO':
          name = 'RCOIN';
          break;
        case 'ECO':
          name = 'ECOIN';
          break;
        default:
          name = ''
      }
      if (name === '') {
        message.error('参数错误');
        return
      } else {
        obj.blockchain = name
      }
      const data = yield call(fetch, getWithdrawTx(obj));
      if (data) {
        yield put({
          type: 'querySuccess',
          payload: {data: data, coin: [payload.blockchain]},
        })
      }
    },
    //  获取侧边栏的待签名数量
    * getNavTotal({ payload }, { call, put }) {
      const data = yield call(fetch, getNavTotal());
      if (data && data.length > 0) {
        const obj = {BTC: 0, BCH: 0, ETH: 0, LTC: 0, RCO: 0, ECO: 0}
        Object.keys(obj).forEach(k => {
          data.forEach(u => {
            if (k === 'BTC' && u.blockchain === 'BITCOIN') {
              obj.BTC = u.number
            } else if (k === 'BCH' && u.blockchain === 'BITCOINCASH') {
              obj.BCH = u.number
            } else if (k === 'ETH' && u.blockchain === 'ETHEREUM') {
              obj.ETH = u.number
            } else if (k === 'LTC' && u.blockchain === 'LITECOIN') {
              obj.LTC = u.number
            } else if (k === 'RCO' && u.blockchain === 'RCOIN') {
              obj.RCO = u.number
            } else if (k === 'ECO' && u.blockchain === 'ECOIN') {
              obj.ECO = u.number
            }
          })
        })
        yield put({
          type: 'querySuccess',
          payload: {navList: obj},
        })
      }
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathMatchRegexp('/home/:id', pathname)) {
          dispatch({ type: 'getNavTotal'}).then(() => {
            dispatch({ type: 'detailList', payload: Object.assign({}, query, {blockchain: pathMatchRegexp('/home/:id', pathname)[1]})})
          })
        }
      })
    },
  },
}

