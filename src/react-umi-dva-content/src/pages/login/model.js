import {ipcRenderer} from '@/config/Electron.js'

export default {
  namespace: 'user',
  state: {
    allWalletName: []
  },
  reducers: {
    'setLocale'(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    }
  },
  subscriptions: {
    setupHistory({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname.includes('login')) {
          ipcRenderer.send("get-user-wallet");
        }
      })
    }
  }
};
