export default {
  namespace: 'createWallet',
  state: {
    userInfo: {}
  },
  reducers: {
    'info'(state, {payload: newState}) {
      return Object.assign({}, state, newState)
    },
    'updateState'(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    }
  },
  effects: {
    * createWallet({payload}, { call, put, select }) {
        yield put({
        type: 'info',
        payload: {}
      })
    }
  },
  subscriptions: {
    // setupHistory({ dispatch, history }) {
    //   history.listen(location => {
    //     dispatch({
    //       type: 'setLocale',
    //       payload: {
    //         locationPathname: location.pathname,
    //         locationQuery: location.query,
    //       },
    //     })
    //   })
    // }
  }
};
