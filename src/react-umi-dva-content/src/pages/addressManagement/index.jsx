import React, {Component} from 'react'
import { Input, Table, Button, Pagination, message, Modal } from 'antd';
import s from './index.scss'
import router from "umi/router";
import {connect} from "dva";
import {ipcRenderer} from '@/config/Electron.js'
import errorMsg from "@/utils/errorMsg.js";
import { stringify } from 'qs'
import PropTypes from 'prop-types';
const confirm = Modal.confirm;
const Search = Input.Search;

@connect(({addressManagement}) =>({addressManagement}))
class AddressManagementComponent extends Component {
  importAddress = () => {
    router.push('addressManagement/importAddress/wif')
  };
  render() {
    const {addressManagement, location, dispatch} = this.props;
    const {pathname} = location
    const {totalElements, elements, pageNum,selectedRowKeys} = addressManagement;
    const rowSelection = {
      onChange: (selectedRowKeys) => {
        dispatch({
          type: 'addressManagement/setModel',
          payload: {selectedRowKeys: selectedRowKeys}
        })
      },
    };
    const routerChange = (obj) => {
      router.push({
        pathname,
        search: stringify(
          {
            ...obj,
          },
          { arrayFormat: 'repeat' }
        ),
      })
    }
    const columns = [
      {
        title: 'PubKey Hash',
        dataIndex: 'pubkeyHash'
      },
      {
        title: '导入时间',
        dataIndex: 'createdAt'
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
      routerChange({pageNum: parseInt(page) - 1})
    };
    const onSearch = (val) => {
      val === '' ? onPageChange(1) : routerChange({data: val})
    }
    const delAddress = (key) => {
      confirm({
        title: '确认删除此地址?',
        content: key,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          const data = ipcRenderer.sendSync('delete-key', key)
          const getDelKeyResult = (arg) => {
            const success = () => {
              message.success('删除成功')
              onPageChange(1)
            }
            errorMsg(arg, success)
          }
          getDelKeyResult(data);
        },
      });
    }
    const onDatchDelete = () => {
      if (selectedRowKeys.length === 0) {
        message.warning('至少需要选中一个地址')
      } else {
        const data = ipcRenderer.sendSync('batch-delete-key', selectedRowKeys)
        const getDelKeysResult = (arg) => {
          const success = () => {
            message.success('删除成功')
            onPageChange(1)
          }
          errorMsg(arg, success)
        }
        getDelKeysResult(data);
      }
    }
    const getDelBtn = () => {
      return (
        <div>
          <Button type="primary" size={'small'} className={[s.autograph, s.newBtn].join(' ')} onClick={onDatchDelete}>批量删除</Button>
        </div>
      )
    };
    return (
      <div className={s.adsMng}>
        <div className={s.top}>
          <Button type={'primary'} className={s.importBtn} onClick={this.importAddress}>导入地址</Button>
          <Search
            placeholder="请输入地址"
            onSearch={onSearch}
            style={{ width: 350 }}
          />
        </div>
        <Table rowSelection={rowSelection} columns={columns} dataSource={totalElements && totalElements > 0 ? elements : []} rowKey={record => record.pubkeyHash}
               size="middle" pagination={false} />
        <div className={s.botttom}>
          <Pagination defaultCurrent={pageNum} total={totalElements}
                      showQuickJumper showTotal={totalElements => `共 ${totalElements} 条`}
                      size={'small'} onChange={onPageChange} />
          {
            totalElements && (totalElements > 0) ? getDelBtn() : ''
          }
        </div>
      </div>
    )
  }
}
AddressManagementComponent.propTypes = {
  addressManagement: PropTypes.shape({
    selectedRowKeys: PropTypes.array,
    elements: PropTypes.array,
    pageNum: PropTypes.number,
    totalElements: PropTypes.number
  })
};
export default AddressManagementComponent
