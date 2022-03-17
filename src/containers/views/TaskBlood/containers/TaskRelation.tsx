import React, { Component } from 'react'
import * as echarts from 'echarts'
import { observer, inject } from 'mobx-react'
import { Button, Spin } from 'sup-ui'

import Header from '@components/Header'
import CanvasToolBar from '@components/CanvasToolBar'
import KeywordSearch from '@components/KeywordSearch'
import { nodeTooltip, edgeTooltip, formatterNodeInfo, extraEllipsis } from '../blood.helper'
import { bloodStyle } from '../taskBlood.const'
import styles from '../index.less'

interface IProps {
  bloodStore?: any
}

interface IState {
  searchValue: string
}

@inject('bloodStore')
@observer
class TaskRelation extends Component<IProps, IState> {
  private pointId2NodeId: any
  private nodeId2Info: any
  private chartRef: any
  private chart: any
  private renderChartFn: any
  public constructor(props: IProps) {
    super(props)
    this.state = {
      searchValue: ''
    }
    this.pointId2NodeId = {}
    this.nodeId2Info = {}
    this.renderChartFn = _.debounce(this.renderChart, 600)
  }

  public componentDidMount() {
    this.chart = echarts.init(this.chartRef)
    const options = {
      ...bloodStyle.defaultConfig,
      series: [
        {
          ...bloodStyle.defaultSeriesConfig,
          nodes: [],
          links: []
        }
      ]
    }
    this.chart.setOption(options)
    this.renderChart()
  }

  private init = () => {
    this.setState(
      {
        searchValue: ''
      },
      () => {
        this.renderChart()
      }
    )
  }

  private renderChart = () => {
    const nodes = this.getNodes()
    const links = this.getLinks()
    const options = this.chart.getOption()
    options.series[0].nodes = nodes
    options.series[0].links = links
    this.chart.on('dblclick', { dataType: 'node' }, (node: any) => {
      const { id } = node.data
      const targetNodePoint = _.findKey(this.pointId2NodeId, v => v === id)
      if (!_.isNil(targetNodePoint)) {
        this.props.bloodStore.changeViewType(targetNodePoint)
      }
    })
    this.chart.setOption(options)
  }

  private getNodes = () => {
    const { hasMetaData, points, edges } = this.props.bloodStore
    const { searchValue } = this.state
    const nodes: any[] = []
    _.forEach(points, item => {
      const nodeInfo = formatterNodeInfo(item.sourceInfo)
      const { nodeId, nodeName } = nodeInfo
      this.pointId2NodeId[item.pointId] = nodeId
      this.nodeId2Info[nodeId] = nodeInfo
      if (_.includes(nodeName, searchValue)) {
        nodes.push({
          id: nodeId,
          name: extraEllipsis(nodeName),
          itemStyle: bloodStyle.nodeItemStyle,
          emphasis: {
            itemStyle: {
              ...bloodStyle.nodeActiveStyle
            }
          },
          tooltip: {
            position: 'bottom',
            formatter: nodeTooltip(nodeInfo.sourceInfo, hasMetaData)
          }
        })
      }
    })
    _.forEach(edges, edgeItem => {
      const { taskName, nextPointId, prePointId } = edgeItem
      if (_.includes(taskName, searchValue)) {
        const nextId = this.pointId2NodeId[nextPointId]
        const nextNodeInfo = _.get(this.nodeId2Info, nextId, {})
        const preId = this.pointId2NodeId[prePointId]
        const preNodeInfo = _.get(this.nodeId2Info, preId, {})
        nodes.push(
          {
            id: nextId,
            name: nextNodeInfo.name,
            itemStyle: bloodStyle.nodeItemStyle,
            emphasis: {
              itemStyle: {
                ...bloodStyle.nodeActiveStyle
              }
            },
            tooltip: {
              position: 'bottom',
              formatter: nodeTooltip(nextNodeInfo.sourceInfo, hasMetaData)
            }
          },
          {
            id: preId,
            name: preNodeInfo.name,
            itemStyle: bloodStyle.nodeItemStyle,
            emphasis: {
              itemStyle: {
                ...bloodStyle.nodeActiveStyle
              }
            },
            tooltip: {
              position: 'bottom',
              formatter: nodeTooltip(preNodeInfo.sourceInfo, hasMetaData)
            }
          }
        )
      }
    })
    return _.unionBy(nodes, 'id')
  }

  private getLinks = () => {
    const { edges } = this.props.bloodStore
    const { searchValue } = this.state
    const edgeCount: any = {}
    const links: any[] = []
    _.forEach(edges, item => {
      if (_.includes(item.taskName, searchValue)) {
        const source = `${this.pointId2NodeId[item.prePointId]}`
        const target = `${this.pointId2NodeId[item.nextPointId]}`
        const countId = [source, target].sort().join('-')
        edgeCount[countId] = _.isNil(edgeCount[countId]) ? 0 : edgeCount[countId] + 1
        const curveness = 0.3 * Math.ceil(edgeCount[countId] / 2) * (edgeCount[countId] % 2 === 0 ? -1 : 1)
        links.push({
          source,
          target,
          taskName: extraEllipsis(`${item.taskName}`),
          lineStyle: {
            normal: {
              ...bloodStyle.lineNormalStyle,
              curveness
            }
          },
          emphasis: {
            itemStyle: {
              ...bloodStyle.lineActiveStyle
            }
          },
          tooltip: {
            position: 'bottom',
            formatter: () => {
              const sourceName = _.get(this.nodeId2Info, [source, 'nodeName'], '')
              const targetName = _.get(this.nodeId2Info, [target, 'nodeName'], '')
              return edgeTooltip({
                taskName: item.taskName,
                taskId: item.taskId,
                sourceName,
                targetName
              })
            }
          }
        })
      }
    })
    return links
  }

  private handleSearch = (value: string) => {
    this.setState({
      searchValue: value
    })
    this.renderChartFn()
  }

  private handleZoomIn = () => {
    const options = this.chart.getOption()
    const zoom = options.series[0].zoom
    if (zoom < 5) {
      options.series[0].zoom += 0.2
      this.chart.setOption(options)
    }
  }

  private handleZoomOut = () => {
    const options = this.chart.getOption()
    const zoom = options.series[0].zoom
    if (zoom > 0.5) {
      options.series[0].zoom -= 0.2
      this.chart.setOption(options)
    }
  }

  private handleToggleMovable = (removable: boolean) => {
    const options = this.chart.getOption()
    if (removable) {
      options.series[0].roam = true
    } else {
      options.series[0].roam = 'scale'
    }
    this.chart.setOption(options)
  }

  public render() {
    const { loading, taskName } = this.props.bloodStore
    const title = `${taskName ? `${taskName}-` : ''}数据血缘`
    return (
      <dl className={styles.wrapper}>
        <Header
          left={title}
          right={
            <div className={styles.search}>
              <KeywordSearch
                size="large"
                placeholder="请输入关键字搜索"
                disabled={loading}
                value={this.state.searchValue}
                onSearch={this.handleSearch}
              />
              <Button ghost disabled={loading} size="large" onClick={this.init}>
                初始化
              </Button>
            </div>
          }
        />
        <dd className={styles.container}>
          <Spin spinning={loading} />
          <div
            className={styles.editorWrapper}
            ref={ref => {
              this.chartRef = ref
            }}
          />
          <CanvasToolBar
            onZoomIn={this.handleZoomIn}
            onZoomOut={this.handleZoomOut}
            toggleMovable={this.handleToggleMovable}
          />
        </dd>
      </dl>
    )
  }
}

export default TaskRelation
