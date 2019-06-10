import React, {Component} from 'react'
import { Table, Button, Pagination, message, Modal } from 'antd';
import s from '../addressManagement/index.scss'
import router from "umi/router";
import {connect} from "dva";
import {ipcRenderer} from '@/config/Electron.js'
import errorMsg from "@/utils/errorMsg.js";
import { stringify } from 'qs'
import PropTypes from 'prop-types';
const confirm = Modal.confirm;

@connect(({hdManagement}) =>({hdManagement}))
class hdManagementComponent extends Component {
  importAddress = () => {
    router.push('HDManagement/importHD')
  };
  render() {
    const {hdManagement, pathname, dispatch} = this.props;
    const {elements, totalElements, pageNum, selectedRowKeys} = hdManagement;
    const rowSelection = {
      onChange: (selectedRowKeys) => {
        dispatch({
          type: 'hdManagement/setModel',
          payload: {selectedRowKeys: selectedRowKeys}
        })
      }
    };
    const delAddress = (key) => {
      confirm({
        title: '确认删除此助记词?',
        content: key,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          const data = ipcRenderer.sendSync('delete-hd', key)
          const getDelKeyResult = (arg) => {
            const success = () => {
              message.success('删除成功')
              onPageChange(1)
            }
            errorMsg(arg, success)
          }
         getDelKeyResult(data)
        },
      });
    }
    const columns = [
      {
        title: '助记词',
        dataIndex: 'mnemonic'
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
              <Button size={'small'} type={'primary'} onClick={() => delAddress(r.mnemonic)}>删除</Button>
            </div>
          ),
      }
    ];
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
    const onPageChange = (page) => {
      routerChange({pageNum: parseInt(page) - 1})
    };
    const onDelete = () => {
      if (selectedRowKeys.length === 0) {
        message.warning('至少需要选中一个HD')
      } else {
        const data = ipcRenderer.sendSync('batch-delete-hd', selectedRowKeys)
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
          <Button type="primary" size={'small'} className={[s.autograph, s.newBtn].join(' ')} onClick={onDelete}>批量删除</Button>
        </div>
      )
    };
    return (
      <div className={s.adsMng}>
        <div className={s.top}>
          <Button type={'primary'} className={s.importBtn} onClick={this.importAddress}>导入HD</Button>
        </div>
        <Table rowSelection={rowSelection} columns={columns} dataSource={totalElements && totalElements > 0 ? elements : []} rowKey={record => record.mnemonic}
               size="middle" pagination={false} scroll={{ y: 320 }}/>
        <div className={s.botttom}>
          <Pagination total={totalElements} showQuickJumper defaultCurrent={pageNum}
                      showTotal={totalElements => `共 ${totalElements} 条`}
                      size={'small'} onChange={onPageChange} />
          {
            totalElements && (totalElements > 0) ? getDelBtn() : null
          }
        </div>
      </div>
    )
  }
}
hdManagementComponent.propTypes = {
  hdManagement: PropTypes.shape({
    selectedRowKeys: PropTypes.array,
    elements: PropTypes.array,
    pageNum: PropTypes.number,
    totalElements: PropTypes.number
  })
};
export default hdManagementComponent
