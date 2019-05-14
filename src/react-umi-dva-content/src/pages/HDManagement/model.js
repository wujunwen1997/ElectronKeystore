import {pathMatchRegexp} from '@/utils/index.js'
import {ipcRenderer} from '@/config/Electron.js'
import errorMsg from "@/utils/errorMsg.js";

export default {
  namespace: 'hdManagement',
  state: {
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
        if (pathMatchRegexp('/HDManagement', pathname)) {
          ipcRenderer.send('query-hd', {
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
            ipcRenderer.removeListener("query-hd-result", getQueryGey)
          }
          ipcRenderer.on("query-hd-result", getQueryGey);
        }
      })
    },
  },
};
