import React, {Component} from 'react'
import { Input, Table, Button, Pagination, message } from 'antd';
import s from '../addressManagement/index.scss'
import router from "umi/router";
import {connect} from "dva";
import {ipcRenderer} from '@/config/Electron.js'
import {timeFormat} from '@/utils'
import errorMsg from "@/utils/errorMsg.js";

const Search = Input.Search;

@connect(({addressManagement}) =>({addressManagement}))
class AddressManagementComponent extends Component {
  state = {
    page: {
      pageNum:0, // 从0开始
      pageSize:10
    }
  };
  importAddress = () => {
    router.push('HDManagement/importHD')
  };
  render() {
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
        show: false
      })
    };
    const {addressManagement} = this.props;
    const {page} = this.state;
    const {pageNum, pageSize} = page;
    const {totalPage, elements} = addressManagement;
    const delAddress = (key) => {
      ipcRenderer.send('delete-key')
      const getDelKeyResult = (event, arg) => {
        const success = () => {
          message.success('删除成功')
        }
        errorMsg(arg, success)
        ipcRenderer.removeListener("get-gateway-result", getDelKeyResult)
      }
      ipcRenderer.on("delete-key-result", getDelKeyResult);
    }
    const columns = [
      {
        title: '助记词',
        dataIndex: 'pubkeyHash'
      },
      {
        title: '导入时间',
        dataIndex: 'createdAt',
        render: (text) => (
          <span>
            {timeFormat(text)}
          </span>
        )
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (e, r) =>
          (
            <div className={s.tableBtn}>
              <Button size={'small'} type={'primary'} onClick={() => delAddress(r.pubkeyHash)}>删除</Button>
            </div>
          ),
      }
    ];
    const onPageChange = (page) => {
    };
    const getDelBtn = () => {
      return (
        <div>
          <Button type="primary" size={'small'} className={[s.autograph, s.newBtn].join(' ')}>批量删除</Button>
        </div>
      )
    };
    return (
      <div className={s.adsMng}>
        <div className={s.top}>
          <Button type={'primary'} size={'small'} className={s.importBtn} onClick={this.importAddress}>导入HD</Button>
        </div>
        <Table rowSelection={rowSelection} columns={columns} dataSource={totalPage && totalPage > 0 ? elements : []} rowKey={record => record.pubkeyHash}
               size="middle" pagination={false} />
        <div className={s.botttom}>
          <Pagination defaultPageSize={pageSize} hideOnSinglePage={true} total={totalPage} showQuickJumper showTotal={totalPage => `共 ${totalPage} 条`}
                      size={'small'} onChange={onPageChange} showSizeChanger />
          {
            totalPage && (totalPage > 0) ? getDelBtn() : ''
          }
        </div>
      </div>
    )
  }
}

export default AddressManagementComponent
