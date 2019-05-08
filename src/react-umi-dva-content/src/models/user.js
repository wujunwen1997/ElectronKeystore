export default {
  namespace: 'userModel',
  state: {
    url: '',
    aesKey: '',
    aesToken: '',
    walletName: '--',
    walletPath: '--'
  },
  reducers: {
    'setModel'(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    }
  }
};
