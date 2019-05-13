import {pathMatchRegexp} from '@/utils/index.js'
import {ipcRenderer} from '@/config/Electron.js'
import router from "umi/router";
import errorMsg from "@/utils/errorMsg.js";

export default {
  namespace: 'importAddress',
  state: {
    isWif: true,
    wifText: '',
    jsonText: '',
    total: 0, // 总页数
    pageSize: 10, //  每页条数
    pageNum: 0, // 当前页位置
    elements: [ // 数据
      {
        pubkeyHash:'',
        createdAt:''
      }
    ]
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
        // if (pathMatchRegexp('/addressManagement', pathname)) {
        //   ipcRenderer.send('query-key', {
        //     pageNum:0, // 从0开始
        //     pageSize:10
        //   });
        //   const getQueryGey = (event, arg) => {
        //     const success = () => {
        //       dispatch({ type: 'setModel', payload: {}})
        //     }
        //     errorMsg(arg, success)
        //     ipcRenderer.removeListener("query-key-result", getQueryGey)
        //   }
        //   ipcRenderer.on("query-key-result", getQueryGey);
        // }
      })
    },
  },
};
