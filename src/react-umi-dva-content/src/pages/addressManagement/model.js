import {pathMatchRegexp} from '@/utils/index.js'
import {ipcRenderer} from '@/config/Electron.js'
import errorMsg from "@/utils/errorMsg.js";

export default {
  namespace: 'addressManagement',
  state: {
    isWif: true,
    wifText: '',
    jsonText: '',
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
            const data = ipcRenderer.sendSync('query-key', {
              pageNum: query && query.pageNum ? query.pageNum : 0, // 从0开始
              pageSize: 10
            });
            const getQueryGey = (arg) => {
              const success = () => {
                const {elements, pageNum, totalElements} = arg.data
                let obj = {pageNum: parseInt(pageNum) + 1}
                dispatch({ type: 'setModel', payload: {elements, totalElements, obj}})
              }
              errorMsg(arg, success)
            }
            getQueryGey(data);
          } else if(query && query.data) {
            const data = ipcRenderer.sendSync('search-key', query.data);
            const getSearchGey = (arg) => {
              const success = () => {
                if (arg.data.find) {
                  const {info} = arg.data
                  dispatch({ type: 'setModel', payload: {elements: [info], totalElements: 1}})
                } else {
                  dispatch({ type: 'setModel', payload: {elements: [], totalElements: 0}})
                }
              }
              errorMsg(arg, success)
            }
            getSearchGey(data);
          }
        }
        if (pathMatchRegexp('/addressManagement/ImportAddress/:id', pathname)) {
          dispatch({ type: 'setModel', payload: {wifText: '', jsonText: '', password: ''}})
        }
      })
    },
  },
};
