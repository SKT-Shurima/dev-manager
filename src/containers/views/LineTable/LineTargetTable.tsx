import React, { Component, Fragment } from 'react'
import { Row, Col, Button, Table, Form, message } from 'antd'
import { FormProps } from 'antd/lib/form'
import { ColumnProps } from 'antd/lib/table'

import styles from './index.module.css'

interface IProps extends FormProps {
  dataSource: any[]
  currentLinkedKey: string
  onUpdate: (record: any) => void
  onSort: (type: string) => void
  getTargetStatus: (key: string) => boolean
  checkCurrentRecord: (type: 'end', record: any) => void
  isEdit?: boolean
  onAdd?: any
  onDelete?: any
  columns?: ColumnProps<any>[]
}

interface IState {
  selectedRowKeys: []
}

class LineTargetTable extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      selectedRowKeys: []
    }
  }

  getColumns = () => {
    const columns = [
      {
        key: 'index',
        title: '序号',
        width: 130,
        dataIndex: 'index',
        render: (_text: any, _record: any, index: number) => index + 1
      },
      {
        key: 'name',
        title: '名称',
        width: 130,
        dataIndex: 'name'
      }
    ]
    return columns
  }

  onSelectChange = (selectedRowKeys: []): void => {
    this.setState({ selectedRowKeys })
  }

  onDelete = () => {
    const { selectedRowKeys } = this.state
    if (!selectedRowKeys.length) return
    this.props.onDelete(selectedRowKeys)
    this.setState({
      selectedRowKeys: []
    })
  }

  render() {
    const { selectedRowKeys } = this.state
    const { dataSource, checkCurrentRecord, currentLinkedKey } = this.props
    const rowSelection: any = {
      columnWidth: 40,
      selectedRowKeys,
      onChange: this.onSelectChange
    }
    return (
      <Table
        size="small"
        className="task-edit-table"
        rowClassName={(record: { DAM_line_key: string }) =>
          record.DAM_line_key === currentLinkedKey ? 'activeRecord' : ''
        }
        rowKey="DAM_line_key"
        rowSelection={rowSelection}
        columns={this.getColumns()}
        dataSource={dataSource}
        onRow={(_record: any, index: any) => ({
          onClick: () => {
            checkCurrentRecord('end', index)
          }
        })}
        pagination={false}
      />
    )
  }
}

export default LineTargetTable
