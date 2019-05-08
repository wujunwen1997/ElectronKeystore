import React, {Component} from 'react'
import { Input, Table, Button } from 'antd';
import s from './index.scss'
import {timeFormat} from '@/utils'

const Search = Input.Search;
class AddressManagementComponent extends Component {
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
    const columns = [
      {
        title: 'PubKey Hash',
        dataIndex: 'symbol'
      },
      {
        title: '导入时间',
        dataIndex: 'createTime',
        render: (text) => (
          <span>
            {timeFormat(text)}
          </span>
        )
      },
      {
        title: '操作',
        dataIndex: 'do',
        render: (e, r) =>
          (
            <div className={s.tableBtn}>
              <Button size={'small'} type={'primary'}>详情</Button>
            </div>
          ),
      }
    ]
    const list = []
    return (
      <div className={s.adsMng}>
        <Search
          placeholder="请输入地址"
          onSearch={value => console.log(value)}
          style={{ width: 300 }}
        />
        <Table rowSelection={rowSelection} columns={columns} dataSource={list} rowKey={record => record.id}
               size="middle" pagination={false}/>
      </div>
    )
  }
}

export default AddressManagementComponent
