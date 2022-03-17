import React, { Component, Fragment } from 'react'
import { observer, inject } from 'mobx-react'
import G6 from '@antv/g6'

import Header from '@components/Header'
import CanvasToolBar from '@components/CanvasToolBar'
import Icon from '@components/Icon'
import NoData from '@components/NoData'
import { nodeTooltip, edgeTooltip, formatterNodeInfo, renderCustomNode, renderCustomEdge } from '../blood.helper'
import { treeGraph } from '../taskBlood.const'
import styles from '../index.less'

interface IProps {
  bloodStore?: any
}

interface IState {
  treeData: any
}

@inject('bloodStore')
@observer
class BloodTree extends Component<IProps, IState> {
  private graph: any
  private graphContainer: any
  private pointId2NodeId: any
  private nodeId2Info: any
  private edges: any = []
  private pointId2EdgeInfo: {
    [idName: string]: {
      taskName: string
      taskId: string
    }
  }
  public constructor(props: any) {
    super(props)
    const { edges, treeRootNode, points } = props.bloodStore
    this.pointId2EdgeInfo = {}
    this.pointId2NodeId = {}
    this.nodeId2Info = {}
    _.forEach(points, item => {
      const nodeInfo = formatterNodeInfo(item.sourceInfo)
      const { nodeId } = nodeInfo
      this.pointId2NodeId[item.pointId] = nodeId
      this.nodeId2Info[nodeId] = { ...nodeInfo, pointId: item.pointId }
    })

    this.edges = _.map(edges, (edgeItem: any) => {
      const { nextPointId, prePointId, taskName, taskId } = edgeItem
      const preNodeId = this.pointId2NodeId[prePointId]
      const nextNodeId = this.pointId2NodeId[nextPointId]
      const mapId = `${preNodeId}-${nextNodeId}`
      if (_.isNil(this.pointId2EdgeInfo[mapId])) {
        this.pointId2EdgeInfo[mapId] = {
          taskName,
          taskId
        }
      }
      return {
        preNodeId,
        nextNodeId
      }
    })
    const rootNodeInfo = this.getNodeInfoByPointId(treeRootNode)
    const rootData = {
      id: '0',
      chainNodeIds: [],
      ...rootNodeInfo
    }
    const childrenNodes = this.generateChildrenNodes([_.cloneDeep({ ...rootData, id: 'child-0' })])
    const parentNodes = this.generateParentNodes([_.cloneDeep({ ...rootData, id: 'parent-0' })])
    this.state = {
      treeData: {
        ...rootData,
        children: _.concat(parentNodes[0].children, childrenNodes[0].children)
      }
    }
  }

  public componentDidMount() {
    if (_.isNil(this.state.treeData.pointId)) {
      return
    }
    this.registerNode()
    this.registerEdge()
    this.initGraph(this.state.treeData)
  }

  private generateParentNodes = (data: any) => {
    return _.map(data, (item: any) => {
      const { pointId, chainNodeIds, id } = item
      const nodeId = this.pointId2NodeId[pointId]
      const children: any[] = []
      _.forEach(
        _.filter(this.edges, (edgeItem: any) => `${edgeItem.nextNodeId}` === `${nodeId}`),
        (i: any, index: number) => {
          if (!_.includes(chainNodeIds, `${i.preNodeId}`)) {
            const parentId = `${id}-${index}`
            const nodeInfo = this.nodeId2Info[i.preNodeId]
            children.push({
              ...nodeInfo,
              id: parentId,
              side: 'left',
              collapsed: true,
              chainNodeIds: _.concat(chainNodeIds, `${nodeId}`)
            })
          }
        }
      )
      item.children = children
      if (!_.isEmpty(item.children)) {
        this.generateParentNodes(item.children)
      }
      return item
    })
  }

  private generateChildrenNodes = (data: any[]) => {
    return _.map(data, (item: any) => {
      const { pointId, chainNodeIds, id } = item
      const nodeId = this.pointId2NodeId[pointId]
      const children: any[] = []
      _.forEach(
        _.filter(this.edges, (edgeItem: any) => `${edgeItem.preNodeId}` === `${nodeId}`),
        (i: any, index: number) => {
          if (!_.includes(chainNodeIds, `${i.nextNodeId}`)) {
            const childId = `${id}-${index}`
            const nodeInfo = this.nodeId2Info[i.nextNodeId]
            children.push({
              ...nodeInfo,
              id: childId,
              side: 'right',
              collapsed: true,
              chainNodeIds: _.concat(chainNodeIds, `${nodeId}`)
            })
          }
        }
      )
      item.children = children
      if (!_.isEmpty(item.children)) {
        this.generateChildrenNodes(item.children)
      }
      return item
    })
  }

  private getNodeInfoByPointId = (pointId: string) => {
    return this.nodeId2Info[this.pointId2NodeId[pointId]] || {}
  }

  private registerNode = () => {
    const { treeData } = this.state
    G6.registerNode(
      'custom-node',
      {
        shapeType: 'custom-node',
        draw(cfg: any, group: any) {
          const rect = renderCustomNode(cfg, group, treeData)
          this.drawLinkPoints(cfg, group)
          return rect
        },
        update(cfg: any, item: any) {
          const group: any = item.getContainer()
          this.updateLinkPoints(cfg, group)
        },
        getAnchorPoints() {
          return [
            [0, 0.5],
            [1, 0.5]
          ]
        }
      },
      'rect'
    )
  }

  private registerEdge = () => {
    const pointId2EdgeInfo = this.pointId2EdgeInfo
    G6.registerEdge(
      'custom-edge',
      {
        afterDraw(cfg: any, group: any) {
          renderCustomEdge(cfg, group, pointId2EdgeInfo)
        },
        update: undefined
      },
      'line'
    )
  }

  private initTooltip = () => {
    const { hasMetaData } = this.props.bloodStore
    return new G6.Tooltip({
      offsetX: 10,
      offsetY: 20,
      trigger: 'click',
      getContent: (e: any) => {
        const modelInfo = e.item.getModel()
        if (modelInfo.type === 'custom-node') {
          const { sourceInfo } = modelInfo
          const outDiv = document.createElement('div')
          outDiv.innerHTML = nodeTooltip(sourceInfo, hasMetaData)
          return outDiv
        } else if (modelInfo.type === 'custom-edge') {
          const sourceNode = e.item.getSource().getModel()
          const targetNode = e.item.getTarget().getModel()
          const sourceName = _.get(sourceNode, ['sourceInfo', 'sourceName'])
          const targetName = _.get(targetNode, ['sourceInfo', 'sourceName'])
          const edgeInfo =
            targetNode.side === 'left'
              ? this.pointId2EdgeInfo[`${targetNode.nodeId}-${sourceNode.nodeId}`]
              : this.pointId2EdgeInfo[`${sourceNode.nodeId}-${targetNode.nodeId}`]
          const { taskName, taskId } = edgeInfo || {}
          return edgeTooltip({ taskName, taskId, sourceName, targetName })
        } else {
          return ''
        }
      },
      shouldBegin: (e: any) => {
        const modelName = e.target.get('name')
        if (modelName === 'table-name' || modelName === 'task-name') return true
        return false
      },
      itemTypes: ['node', 'edge']
    })
  }

  private handleCollapse = (e: any) => {
    const target = e.target
    const id = target.get('modelId')
    const item = this.graph.findById(id)
    const nodeModel = item.getModel()
    const name = target.cfg.name
    if (id === '0') {
      return
    } else if (
      (nodeModel.side === 'left' && name === 'left-collapse-text') ||
      (nodeModel.side === 'right' && name === 'right-collapse-text')
    ) {
      nodeModel.collapsed = !nodeModel.collapsed
      this.graph.layout()
      this.graph.setItemState(item, 'collapse', nodeModel.collapsed)
    }
  }

  private initGraph = (data: any) => {
    const container = this.graphContainer
    const width = container.scrollWidth
    const height = container.scrollHeight || 500
    const tooltip = this.initTooltip()
    this.graph = new G6.TreeGraph({
      container: this.graphContainer,
      width,
      height,
      ...treeGraph.defaultConfig,
      plugins: [tooltip]
    })
    this.graph.on('left-collapse-text:click', this.handleCollapse)
    this.graph.on('right-collapse-text:click', this.handleCollapse)
    this.graph.data(data)
    this.graph.render()
    this.graph.zoom(0.5, { x: width / 2, y: height / 2 })
  }

  private handleBack = () => {
    this.props.bloodStore.changeViewType()
  }

  private handleZoomIn = () => {
    let zoom = this.graph.getZoom()
    zoom = zoom < 5 ? zoom + 0.2 : zoom
    this.graph.zoomTo(zoom)
  }

  private handleZoomOut = () => {
    let zoom = this.graph.getZoom()
    zoom = zoom > 0.3 ? zoom - 0.2 : zoom
    this.graph.zoomTo(zoom)
  }

  private handleToggleMovable = (removable: boolean) => {
    if (removable) {
      this.graph.addBehaviors('drag-canvas', 'default')
    } else {
      this.graph.removeBehaviors('drag-canvas', 'default')
    }
  }

  public render() {
    return (
      <dl className={styles.wrapper}>
        <Header
          left={
            <Fragment>
              {this.props.bloodStore.viewType === 'bloodTree' ? null : (
                <Icon type="arrow" style={{ marginRight: '10px' }} onClick={this.handleBack} />
              )}
              数据血缘
            </Fragment>
          }
        />
        <dd className={styles.container}>
          {_.isNil(this.state.treeData.pointId) && <NoData className={styles.noData} />}
          <div className={styles.editorWrapper} ref={ref => (this.graphContainer = ref)} />
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

export default BloodTree
