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
      BTC: 0, BCH: 0, ETH: 0, LTC: 0, RCOIN: 0, ECOIN: 0, DASH: 0
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
        case 'RCOIN':
          name = 'RCOIN';
          break;
        case 'ECOIN':
          name = 'ECOIN';
          break;
        case 'DASH':
          name = 'DASH';
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
        const obj = {BTC: 0, BCH: 0, ETH: 0, LTC: 0, RCOIN: 0, ECOIN: 0, DASH: 0}
        Object.keys(obj).forEach(k => {
          data.forEach(u => {
            if (k === 'BTC' && u.blockchain === 'BITCOIN') {
              obj.BTC = u.number
            } else if (k === 'BCH' && u.blockchain === 'BITCOINCASH') {
              obj.BCH = u.number
            } else if (k === 'DASH' && u.blockchain === 'DASH') {
              obj.DASH = u.number
            } else if (k === 'ETH' && u.blockchain === 'ETHEREUM') {
              obj.ETH = u.number
            } else if (k === 'LTC' && u.blockchain === 'LITECOIN') {
              obj.LTC = u.number
            } else if (k === 'RCOIN' && u.blockchain === 'RCOIN') {
              obj.RCOIN = u.number
            } else if (k === 'ECOIN' && u.blockchain === 'ECOIN') {
              obj.ECOIN = u.number
            }
          })
        })
        let newState = {}
        if (payload === 'undefined') {
          newState = {navList: obj}
        } else {
          newState = {navList: obj, coin: [payload]}
        }
        yield put({
          type: 'querySuccess',
          payload: newState,
        })
      }
    },
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
    setupTotal({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathMatchRegexp('/home/transactionDetail/:id', pathname)) {
          dispatch({ type: 'getNavTotal', payload: query && query.blockchain})
        }
      })
    }
  },
}

