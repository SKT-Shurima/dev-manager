/*
 * @Description: 映射表格 拖拽拖拽连线功能
 * @Author: liyongshuai
 */
import React, { Component } from 'react'
import update from 'immutability-helper'
import $ from 'jquery'
import _ from 'lodash'

import LineOriginTable from './LineOriginTable'
import LineTargetTable from './LineTargetTable'
import lineCore from './line.core'
import { ILineTableProps, ILineTableState } from './lineTable'
import {
  initLineData,
  getMappingIndex,
  linkVerify,
  getSaveData,
  sortByType,
  getOutStructByKeys,
  getFieldNextIndex
} from './line.helper'
import styles from './index.module.scss'

const PREFIX_ID = 'supngin-mapping'

class LineTable extends Component<ILineTableProps, ILineTableState> {
  tipsRef: any
  isTips: boolean
  line: any
  drawingId: string
  mappingIndex: any[]
  targetRef: any

  constructor(props: any) {
    super(props)
    const { mappingId } = props
    this.state = {
      mapListVisible: false,
      originStruct: [],
      targetStruct: [],
      mapDataType: '',
      currentLink: {
        startKey: '',
        endKey: ''
      }
    }
    this.line = lineCore
    this.drawingId = `${PREFIX_ID}-drawing-${mappingId}`
    this.mappingIndex = []
    this.isTips = window.localStorage.getItem('lineTableTips') === 'false'
  }

  componentDidMount() {
    $(document).on('mouseup', this.hiddenMapList)
  }

  componentWillUnmount() {
    this.line.destroy()
    $(document).off('mouseup', this.hiddenMapList)
  }

  handleConfigChange = () => {
    this.props.handleConfigChange()
  }

  /**
   * @description: 映射表映射关系重新渲染
   * 当源列表/目标列表发生改变，先找出原始的映射关系
   * 然后根据原始映射关系与新数据进行对比，如果有前后信息匹配的，则将已配置的映射关系保留;反之剔除
   * 当映射关系由外部传入，则以外部传入为准
   * @param {array} originStruct 源字段信息列表
   * @param {array} targetStruct 目标字段信息列表
   * @param {array} mapping  源字段与目标字段的映射关系
   */
  init = (params: any) => {
    const { originStruct, targetStruct, mapping } = initLineData(
      {
        mappingIndex: this.mappingIndex,
        ..._.pick(this.state, ['originStruct', 'targetStruct'])
      },
      params
    )
    this.setState(
      {
        originStruct,
        targetStruct
      },
      () => {
        this.mappingIndex = getMappingIndex({
          originStruct,
          targetStruct,
          mapping
        })
        this.lineInit(originStruct, targetStruct)
      }
    )
  }

  lineInit = (originStruct: any[], targetStruct: any[]) => {
    this.line.init({
      originStruct,
      targetStruct,
      drawingId: this.drawingId,
      mappingIndex: this.mappingIndex,
      handleUpdateMappingIndex: this.handleUpdateMappingIndex,
      updateCurrentLink: this.updateCurrentLink
    })
  }

  checkCurrentRecord = (type: 'start' | 'end', index: number) => {
    const linkedMappingItem = _.find(this.mappingIndex, i => i[type] === index)
    if (linkedMappingItem) {
      const { start, end } = linkedMappingItem
      const { originStruct, targetStruct } = this.state
      this.updateCurrentLink(originStruct[start].DAM_line_key, targetStruct[end].DAM_line_key)
      this.line.activeLine(start, end)
    }
  }

  renderTips = (left: any, top: any) => {
    this.tipsRef.setState({
      visible: true,
      left,
      top
    })
  }

  /**
   * @description: 建立连线之前进行数据校验
   * @param {string} startKey 起始源节点
   * @param {string} endKey 目标源节点
   * @return {boolean} 返回是否可以建立连线
   */
  linkVerify = (startKey: string, endKey: string) => {
    return linkVerify({
      ..._.pick(this.state, ['originStruct', 'targetStruct']),
      startKey,
      endKey
    })
  }

  /**
   * @description: 点击保存时候将数据整理后传给父组件
   * @return: originStruct 源数据源 targetStruct 目标数据源
   */
  saveVerify = () => {
    if (!this.targetRef.verify()) {
      return
    }
    return getSaveData({
      ..._.pick(this.state, ['originStruct', 'targetStruct']),
      mappingIndex: this.mappingIndex
    })
  }

  handleUpdateMappingIndex = (mappingIndex: any[]) => {
    this.mappingIndex = mappingIndex
    this.handleConfigChange()
  }

  handleMapListVisible = (value: boolean, mapDataType = '') => {
    if (!this.state.targetStruct.length) return
    this.setState({
      mapListVisible: value,
      mapDataType
    })
  }

  cancelActive = () => {
    const { originStruct, targetStruct, currentLink } = this.state
    const originIndex = _.findIndex(originStruct, i => i.DAM_line_key === currentLink.startKey)
    const targetIndex = _.findIndex(targetStruct, i => i.DAM_line_key === currentLink.endKey)
    if (originIndex !== -1 && targetIndex !== -1) {
      this.line.initLine(originIndex, targetIndex)
    }
  }

  hiddenMapList = (e: MouseEvent) => {
    if (e.button !== 0) return
    this.updateCurrentLink()
    this.setState({
      mapListVisible: false
    })
  }

  updateCurrentLink = (startKey = '', endKey = '') => {
    if (!startKey || !endKey) {
      this.cancelActive()
    }
    this.setState({
      currentLink: {
        startKey,
        endKey
      }
    })
  }

  /**
   * @description: 目标映射表新增字段
   * 新增字段名称自定义，自定义格式采用 'field-number'
   */
  handleAdd = () => {
    const { targetStruct } = this.state
    const nextIndex = getFieldNextIndex(targetStruct)
    const newData = {
      DAM_line_key: 'test',
      name: `field-${nextIndex}`,
      showName: `fieldName-${nextIndex}`,
      dataType: 'String'
    }
    this.setState({
      targetStruct: [...targetStruct, newData]
    })
    this.line.add(newData)
    this.handleConfigChange()
  }

  handleDelete = (selectedRowKeys: string[]) => {
    const { originStruct, targetStruct } = this.state
    const newTargetStruct = _.cloneWith(this.state.targetStruct)
    const { mapping = [] } =
      getSaveData({
        originStruct,
        targetStruct,
        mappingIndex: this.mappingIndex
      }) || {}
    _.remove(newTargetStruct, item => _.includes(selectedRowKeys, item.DAM_line_key))
    this.mappingIndex = getMappingIndex({
      originStruct,
      targetStruct: newTargetStruct,
      mapping
    })
    this.setState({
      targetStruct: newTargetStruct
    })
    this.lineInit(originStruct, newTargetStruct)
    this.handleConfigChange()
  }

  /**
   * @description: 字段含义  字段 数据类型修改
   */
  handleUpdate = (row: any) => {
    const newData: any[] = [...this.state.targetStruct]
    const index = newData.findIndex(item => row.DAM_line_key === item.DAM_line_key)
    const item = newData[index]
    newData.splice(index, 1, {
      ...item,
      ...row
    })
    this.updateCurrentLink()
    this.setState({ targetStruct: newData })
    this.handleConfigChange()
  }

  /**
   * @description: table 表不同类型排序
   * @param {string} type index(顺序)/name(名称)/auto(自动排序)/none(取消映射)
   */
  handleSort = (type: string) => {
    const { originStruct, targetStruct, mappingIndex } = sortByType(type, {
      ..._.pick(this.state, ['originStruct', 'targetStruct']),
      mappingIndex: this.mappingIndex
    })

    this.setState(
      {
        originStruct,
        targetStruct
      },
      () => {
        this.handleUpdateMappingIndex(mappingIndex)
        this.lineInit(originStruct, targetStruct)
      }
    )
  }

  /**
   * @description: 源数据直接输出到目标源  替换目标源  并对应连线
   * 只有在编辑状态下才能输出
   */
  handleOutput = (selectedRowKeys: []) => {
    this.init(
      getOutStructByKeys({
        ..._.pick(this.state, ['originStruct', 'targetStruct']),
        mappingIndex: this.mappingIndex,
        rowKeys: selectedRowKeys
      })
    )
    this.handleConfigChange()
  }

  linkedTargetIndex = (endIndex: number) => {
    if (this.line.targetPoints[endIndex].isLinked) {
      return
    }
    this.line.drawingLine(endIndex)
    this.handleMapListVisible(false)
    this.handleConfigChange()
  }

  /**
   * @description: 源字段列表拖动排序
   * @param {string} type pre/post  元素拖动的方向 pre是向上拖动 post是从上往下拖动
   * @param {number} dragIndex 拖动元素的索引
   * @param {number} hoverIndex 放置元素的索引
   */
  updateIndexByDrag = (type: string, dragIndex: number, hoverIndex: number) => {
    const { originStruct } = this.state
    const dragRow = originStruct[dragIndex]
    this.setState(
      update(this.state, {
        originStruct: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow]
          ]
        }
      })
    )
    this.line.updateIndexByDrag(type, dragIndex, hoverIndex)
    this.handleConfigChange()
  }

  getTargetStatus = (targetKey: string) => {
    const { isLinked } = _.find(this.line.targetPoints, o => o.point.key === targetKey) || {}
    return isLinked
  }

  render() {
    console.log('test')
    const { originStruct, targetStruct, currentLink } = this.state
    const { isEdit } = this.props
    return (
      <div className={styles.wrapper}>
        <div className={styles.originTable}>
          <LineOriginTable
            onSort={this.handleSort}
            dataSource={originStruct}
            updateIndexByDrag={this.updateIndexByDrag}
            onOutput={isEdit && this.handleOutput}
            currentLinkedKey={currentLink.startKey}
            checkCurrentRecord={this.checkCurrentRecord}
          />
        </div>
        <div id={`${this.drawingId}`} className={styles.drawing}></div>
        <div className={styles.targetTable}>
          <LineTargetTable
            isEdit={isEdit}
            dataSource={targetStruct}
            onSort={this.handleSort}
            onAdd={isEdit && this.handleAdd}
            onDelete={isEdit && this.handleDelete}
            onUpdate={this.handleUpdate}
            getTargetStatus={this.getTargetStatus}
            currentLinkedKey={currentLink.endKey}
            checkCurrentRecord={this.checkCurrentRecord}
          />
        </div>
      </div>
    )
  }
}
export default LineTable
