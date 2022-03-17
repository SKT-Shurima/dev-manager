import React, { Component, useRef } from 'react'
import { Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import * as _ from 'lodash'

import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import styles from './index.module.css'

const columns: ColumnProps<any>[] = [
  {
    key: 'index',
    title: '序号',
    width: 40,
    align: 'center',
    dataIndex: 'index',
    render: (_text: any, _record: any, index: number) => index + 1
  },
  {
    key: 'name',
    title: '名字',
    dataIndex: 'name',
    width: 120
  }
]

const type = 'DraggableBodyRow'

const DraggableBodyRow = ({ index, moveRow, className, style, ...restProps }: any) => {
  const ref = useRef()
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor: { getItem: () => any; isOver: () => any }) => {
      const { index: dragIndex }: { index: number } = monitor.getItem() || {}
      if (dragIndex === index) {
        return {}
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward'
      }
    },
    drop: (item: { index: number }) => {
      moveRow(item.index, index)
    }
  })
  const [, drag] = useDrag({
    type,
    item: { index },
    collect: (monitor: { isDragging: () => any }) => ({
      isDragging: monitor.isDragging()
    })
  })
  drop(drag(ref))

  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  )
}

interface IProps {
  updateIndexByDrag: any
  dataSource: any
  currentLinkedKey: string
  onSort: (type: string) => void
  checkCurrentRecord: (type: 'start', record: any) => void
  handlePreview?: any
  onOutput?: any
}

interface IState {
  selectedRowKeys: []
}

class LineOriginTable extends Component<IProps, IState> {
  components: any
  constructor(props: IProps) {
    super(props)
    this.state = {
      selectedRowKeys: []
    }
    this.components = {
      body: {
        row: DraggableBodyRow
      }
    }
  }

  onSelectChange = (selectedRowKeys: []): void => {
    this.setState({ selectedRowKeys })
  }

  moveRow = (dragIndex: number, hoverIndex: number) => {
    this.props.updateIndexByDrag(dragIndex > hoverIndex ? 'pre' : 'post', dragIndex, hoverIndex)
  }

  onOutput = () => {
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length) {
      this.setState({
        selectedRowKeys: []
      })
      this.props.onOutput(selectedRowKeys)
    }
  }

  /**
   * @description: 根据不同排序类型排序
   * @param {string} type index(顺序)/name(名称)/none(不映射)
   */
  sort = (type: string) => {
    this.props.onSort(type)
  }

  render() {
    const { selectedRowKeys } = this.state
    const { dataSource, checkCurrentRecord, currentLinkedKey, onOutput } = this.props
    const rowSelection: any = _.isFunction(onOutput)
      ? {
          columnWidth: 40,
          selectedRowKeys,
          onChange: this.onSelectChange
        }
      : null

    return (
      <DndProvider backend={HTML5Backend}>
        <Table
          size="small"
          rowClassName={record => (record.id === currentLinkedKey ? 'activeRecord' : '')}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
          components={this.components}
          rowKey="id"
          onRow={(_record, index) => ({
            index,
            moveRow: this.moveRow,
            onClick: () => {
              checkCurrentRecord('start', index)
            }
          })}
          pagination={false}
        />
      </DndProvider>
    )
  }
}

export default LineOriginTable
