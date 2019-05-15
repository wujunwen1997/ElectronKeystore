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
    walletPath: '',
    current: 'signatureTransaction'
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
        let arr = ['/home/:id', '/configure', '/addressManagement', '/addressManagement/ImportAddress/:id', '/HDManagement', '/HDManagement/importHD'];
        let needInfo = false;
        arr.forEach(u => {
          if (pathMatchRegexp(u, pathname)) {
            needInfo = true
          }
        });
        if (needInfo) {
          ipcRenderer.send("get-wallet-info");
          const getWallets = (event, arg) => {
            if (arg.data && arg.data !== '{}') {
              if (arg.data && arg.data.walletName && arg.data.walletName !== '' && typeof(arg.data.walletName) !== 'undefined') {
                dispatch({ type: 'setModel', payload: {walletName: arg.data.walletName, walletPath: arg.data.walletPath}})
              } else {
                router.push('/');
              }
            } else {
              dispatch({ type: 'setModel', payload: {walletName: '', walletPath: ''}});
              router.push('/');
            }
            ipcRenderer.removeListener("get-wallet-info-result", getWallets)
          };
          ipcRenderer.on("get-wallet-info-result", getWallets);
        }
      })
    },
    setupConfigureGateway({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathMatchRegexp('/configure', pathname) || pathMatchRegexp('/register/createWallet', pathname)) {
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
    setupTitle({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        let title = ''
        if (pathMatchRegexp('/home/:id', pathname)) {
          title = 'signatureTransaction'
        } else if (pathMatchRegexp('/configure', pathname)) {
          title = 'configure'
        } else if (pathMatchRegexp('/addressManagement', pathname) || pathMatchRegexp('/addressManagement/ImportAddress/:id', pathname)) {
          title = 'addressManagement'
        } else if (pathMatchRegexp('/HDManagement', pathname) || pathMatchRegexp('/HDManagement/importHD', pathname)) {
          title = 'HDManagement'
        }
        dispatch({ type: 'setModel', payload: {current: title}})
      })
    },
  },
};
