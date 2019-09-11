import {getEthDetail, getBtcDetail, getBnbDetail} from '@/api/signatureTransaction/index.js'
import {pathMatchRegexp} from '@/utils/index.js'
import fetch from '@/api/config/fetch.js'

export default {
  namespace: 'transactionDetail',
  state: {
    transactionMsg: {},
    inputArr: [],
    outputArr: [],
    moreText: '显示所有输入输出'
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
    * getDetails({ payload }, { call, put }) {
      let data = {};
      let inputArr = [];
      let outputArr = [];
      if (payload.blockchain === 'ETH') {
        data = yield call(fetch, getEthDetail({id: payload.data}));
        inputArr = data.fromAddress ? [data.fromAddress] : [];
        outputArr = data.toAddress ? [data.toAddress] : []
      } else {
        let api = ''
        if (payload.blockchain === 'BNB') {
          api = getBnbDetail
        } else {
          api = getBtcDetail
        }
        data = yield call(fetch, api({id: payload.data}));
        let {inputs, outputs} = data;
        data.input = inputs
        data.outputs = outputs
        inputArr = (inputs && inputs.length > 6) ? inputs.slice(0,6) : inputs;
        outputArr = (outputs && outputs.length > 6) ? outputs.slice(0,6) : outputs;
      }
      if (data) {
        yield put({
          type: 'querySuccess',
          payload:  {
            transactionMsg: data,
            inputArr,
            outputArr
          },
        })
      }
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        const m = pathMatchRegexp('/home/transactionDetail/:id', pathname)
        if (m) {
          dispatch({ type: 'getDetails', payload: {data: m[1], ...query}})
          dispatch({type: 'querySuccess', payload: {moreText: '显示所有输入输出'}})
        }
      })
    },
  },
};
