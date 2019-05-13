import React, {Component, Fragment} from 'react'
import {Table, Button, Pagination} from 'antd';
import {connect} from "dva";
import s from './index.scss';
import router from "umi/router";
import { stringify } from 'qs'
import {timeFormat, isNumber} from '@/utils'
import Link from "umi/link";

@connect(({ home, loading }) => ({ home, loading }))
class HomeComponent extends Component {
  render() {
    const {home, loading, location} = this.props;
    const { query, pathname } = location;
    let thisLoad = loading.effects['home/detailList'];
    const {data} = home;
    const {total, list} = data;
    const columns = [
      {
        title: '币种',
        dataIndex: 'symbol'
      },
      {
        title: '时间',
        dataIndex: 'createTime',
        render: (text) => (
          <span>
            {timeFormat(text)}
          </span>
        )
      },
      {
        title: '金额',
        dataIndex: 'amount',
      },
      {
        title: '出款',
        dataIndex: 'output',
        render: (e, r) =>
          (<span>
            {isNumber(e) ? `${e}个地址` : e}
          </span>)
      },
      {
        title: '收款',
        dataIndex: 'input',
        render: (e, r) =>
          (<span>
            {isNumber(e) ? `${e}个地址` : e}
          </span>)
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (e, r) =>
          (
            <div className={s.tableBtn}>
              <Link to={`/home/transactionDetail/${r.id}?blockchain=${r.symbol}`}><Button size={'small'} type={'primary'}>详情</Button></Link>
            </div>
          ),
      }
    ];
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
    const onPageChange = (page) => {
      router.push({
        pathname,
        search: stringify(
          {
            ...query,
            ...{
              pageNum: page - 1 //  后台需要从0开始
            },
          },
          { arrayFormat: 'repeat' }
        ),
      })
    }
    return (
      <Fragment>
        <Table rowSelection={rowSelection} columns={columns} dataSource={list} rowKey={record => record.id}
               size="middle" pagination={false} className={s.myTable} loading={thisLoad}/>
        {
          list && list.length >0 && (
            <div className={s.botttom}>
              <Pagination defaultPageSize={20} hideOnSinglePage={true} total={total} showQuickJumper showTotal={total => `共 ${total} 条`}
                          size={'small'} onChange={onPageChange}/>
              {
                parseInt(total) > 0 && (
                  <div>
                    <Button type="primary" size={'small'} className={[s.autograph, s.newBtn].join(' ')}>批量签名</Button>
                  </div>
                )
              }
            </div>
          )
        }
      </Fragment>
    )
  }
}
export default HomeComponent
