import React, {Component, Fragment} from 'react'
import {Table, Button, Pagination, message, Modal} from 'antd';
import {connect} from "dva";
import s from './index.scss';
import router from "umi/router";
import { stringify } from 'qs'
import PropTypes from 'prop-types';
import {timeFormat, isNumber, filterLastZore} from '@/utils'
import Link from "umi/link";
import fetch from '@/api/config/fetch.js'
import {ipcRenderer} from "../../config/Electron";
import {getEthDetail, getBtcDetail, btcAutograph, ethAutograph} from '@/api/signatureTransaction'

const confirm = Modal.confirm;

@connect(({ home, loading }) => ({ home, loading }))
class HomeComponent extends Component {
  state = {
    loading: false
  }
  render() {
    const {home, loading, location, dispatch} = this.props;
    const { query, pathname } = location;
    let thisLoad = loading.effects['home/detailList'];
    const {data, selectedRowKeys} = home;
    const {total, list} = data;
    const columns = [
      {
        title: '币种',
        dataIndex: 'symbol',
        width: 70,
      },
      {
        title: '时间',
        dataIndex: 'createTime',
        width: 90,
        render: (text) => (
          <span>
            {timeFormat(text)}
          </span>
        )
      },
      {
        title: '金额',
        dataIndex: 'amount',
        render: (e, r) => (<span>{filterLastZore(e)}</span>)
      },
      {
        title: '输入',
        dataIndex: 'input',
        render: (e, r) =>
          (<span>
            {isNumber(e) ? `${e}个输入` : e}
          </span>)
      },
      {
        title: '输出',
        dataIndex: 'output',
        render: (e, r) =>
          (<span>
            {isNumber(e) ? `${e}个输出` : e}
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
        let arr = []
        selectedRows.forEach(u => {
          arr.push({id: u.id, blockchain: u.symbol})
        })
        dispatch({
          type: 'home/querySuccess',
          payload: {selectedRowKeys: arr}
        })
      }
    };
    const moreAutograph = () => {
      if (selectedRowKeys && selectedRowKeys.length > 0) {
        confirm({
          title: '确认此批量操作?',
          onOk() {
            const goQian = (k) => {
              let u = selectedRowKeys[k]
              let api = u.blockchain === 'ETH' ? getEthDetail : getBtcDetail;
              this.setState({loading: true})
              fetch(api({id: u.id})).then((data) => {
                const arg = ipcRenderer.sendSync('sign-tx', data)
                if (arg && arg.data && arg.data !== '{}' && !arg.errorMsg) {
                  const onAutograph = (rawTx, id, blockchain) => {
                    let api = blockchain === 'ETHEREUM' ? ethAutograph : btcAutograph;
                    fetch(api({id, rawTx})).then(() => {
                      if (selectedRowKeys.length > k + 1) {
                        goQian(k + 1)
                      } else {
                        message.success('签名成功')
                        this.setState({loading: false})
                        onPageChange(1)
                      }
                    })
                  }
                  onAutograph(arg.data, data.id, data.blockchain)
                } else {
                  message.error(arg.errorMsg);
                  this.setState({loading: false})
                }
              }).catch(() => {
                this.setState({loading: false})
              })
            }
            goQian(0)
          }
        });
      } else {
        message.warning('请至少选择1个交易')
      }
    }
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
              <Pagination defaultPageSize={20} total={total} showQuickJumper showTotal={total => `共 ${total} 条`}
                          size={'small'} onChange={onPageChange}/>
              {
                parseInt(total) > 0 && (
                  <div>
                    <Button type="primary" size={'small'} className={[s.autograph, s.newBtn].join(' ')}
                            onClick={moreAutograph} loading={this.state.loading}>批量签名</Button>
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
HomeComponent.propTypes = {
  home: PropTypes.shape({
    data: PropTypes.object,
    selectedRowKeys: PropTypes.array
  })
};
export default HomeComponent
