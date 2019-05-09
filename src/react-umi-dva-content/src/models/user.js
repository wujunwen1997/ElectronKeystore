import {pathMatchRegexp} from '@/utils/index.js'
import {ipcRenderer} from '@/config/Electron.js'
import router from "umi/router";
export default {
  namespace: 'userModel',
  state: {
    url: '',
    aesKey: '',
    aesToken: '',
    walletName: '',
    walletPath: ''
  },
  reducers: {
    'setModel'(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    }
  },
  subscriptions: {
    setupHome({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathMatchRegexp('/home/:id', pathname) || pathMatchRegexp('/configure', pathname)) {
          ipcRenderer.send("get-wallet-info");
          const getWallets = (event, arg) => {
            if (arg.data && arg.data !== '{}') {
              if (arg.data && arg.data.walletName && arg.data.walletName !== '' && typeof(arg.data.walletName) !== 'undefined') {
                dispatch({ type: 'setModel', payload: {walletName: arg.data.walletName, walletPath: arg.data.walletPath}})
              } else {
                router.push('/');
              }
            } else {
              dispatch({ type: 'setModel', payload: {walletName: '', walletPath: ''}})
              router.push('/');
            }
            ipcRenderer.removeListener("get-wallet-info-result", getWallets)
          }
          ipcRenderer.on("get-wallet-info-result", getWallets);
        }
      })
    },
    setupConfigureGateway({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathMatchRegexp('/configure', pathname)) {
          console.log('全局ConfigureGateway')
          ipcRenderer.send("get-gateway");
          const getGatewayResult = (event, arg) => {
            if (arg.data && arg.data !== '{}') {
              dispatch({ type: 'setModel', payload: {aesKey: arg.data.aesKey, aesToken: arg.data.aesToken, url: arg.data.url}})
            } else {
              dispatch({ type: 'setModel', payload: {aesKey: '', aesToken: '', url: ''}})
            }
            ipcRenderer.removeListener("get-gateway-result", getGatewayResult)
          }
          ipcRenderer.on("get-gateway-result", getGatewayResult);
        }
      })
    },
  },
};
