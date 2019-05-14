import {pathMatchRegexp} from '@/utils/index.js'
import {ipcRenderer} from '@/config/Electron.js'
import errorMsg from "@/utils/errorMsg.js";

export default {
  namespace: 'addressManagement',
  state: {
    isWif: true,
    wifText: '',
    wifUrl: '',
    jsonText: '',
    jsonUrl: '',
    password: '',// json密码
    totalElements: 0,//总条数
    pageNum: 1, // 当前页位置
    elements: [],
    selectedRowKeys: []
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
        if (pathMatchRegexp('/addressManagement', pathname)) {
          if (query && query.pageNum || Object.keys(query).length === 0) {
            ipcRenderer.send('query-key', {
              pageNum: query && query.pageNum ? query.pageNum : 0, // 从0开始
              pageSize: 10
            });
            const getQueryGey = (event, arg) => {
              const success = () => {
                const {elements, pageNum, totalElements} = arg.data
                let obj = {pageNum: parseInt(pageNum) + 1}
                dispatch({ type: 'setModel', payload: {elements, totalElements, obj}})
              }
              errorMsg(arg, success)
              ipcRenderer.removeListener("query-key-result", getQueryGey)
            }
            ipcRenderer.on("query-key-result", getQueryGey);
          } else if(query && query.data) {
            ipcRenderer.send('search-key', query.data);
            const getSearchGey = (event, arg) => {
              const success = () => {
                const {info} = arg.data
                dispatch({ type: 'setModel', payload: {elements: [info], totalElements: 1}})
              }
              errorMsg(arg, success)
              ipcRenderer.removeListener("search-key-result", getSearchGey)
            }
            ipcRenderer.on("search-key-result", getSearchGey);
          }
        }
        if (pathMatchRegexp('/addressManagement/ImportAddress', pathname)) {
          dispatch({ type: 'setModel', payload: {wifText: '', jsonText: ''}})
        }
      })
    },
  },
};
