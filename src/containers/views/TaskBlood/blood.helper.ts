import { sourceTypeEnum } from '../devTask.const'
import { inSupos, transJsonParse } from '@utils/common'
import { treeGraph } from './taskBlood.const'

/**
 * @description: 节点信息配置跳转界面事件
 * @param {string} sourceId
 * @param {string} tableName
 * @return {*}
 */
window.bloodDetailJumpUrl = (sourceId: string, tableName: string) => {
  if (inSupos()) {
    window.parent.location.hash = `#/design/metaDevelopment?source=${sourceId}&tableName=${tableName}`
  } else {
    window.location.hash = `#/metadata/list?source=${sourceId}&tableName=${tableName}`
  }
}

/**
 * @description: 节点的tooltips 信息，根据不同的数据源类型组装不同的数据源信息
 * @param {any} sourceInfo 数据源信息
 * @param {boolean} hasMetaData 判断所在平台有没有安装元数据，如果含有，则点击详情跳转元数据管理
 * @return {htmlString} html文本
 */
export const nodeTooltip = (sourceInfo: any, hasMetaData: boolean) => {
  const sourceId = _.get(sourceInfo, 'sourceId')
  const sourceName = _.get(sourceInfo, 'sourceName')
  const sourceType = _.get(sourceInfo, 'sourceType')
  const sourceTypeName = _.get(sourceTypeEnum, [sourceType, 'name'], '')
  let tableName = ''
  let infoCardHtml = '<ul class="infoListWrapper">'
  switch (sourceType) {
    case 1:
    case 2:
    case 3:
    case 9:
    case 15: {
      const name = _.get(sourceInfo, ['extendConfig', 'tableViewName'], '')
      tableName = name
      infoCardHtml += `<li class="infoListItem"><label class="infoLabel">表名称</label><span class="infoValue">${name}</span></li>`
      break
    }
    case 4: {
      const filePath = _.get(sourceInfo, ['extendConfig', 'path'], '')
      const fileName = _.get(sourceInfo, ['extendConfig', 'fileName'], '')
      infoCardHtml += `<li class="infoListItem"><label class="infoLabel">文件名称</label><span class="infoValue">${fileName}</span></li>`
      infoCardHtml += `<li class="infoListItem"><label class="infoLabel">文件路径</label><span class="infoValue">${filePath}</span></li>`
      break
    }
    case 7: {
      const url = _.get(sourceInfo, 'extendConfig.operatorConfig.url', '')
      infoCardHtml += `<li class="infoListItem"><label class="infoLabel">请求地址</label><span class="infoValue">${url}</span></li>`
      break
    }
    case 31: {
      const templateName = _.get(sourceInfo, ['extendConfig', 'templateName'], '')
      tableName = templateName
      const templateDisplayName = _.get(sourceInfo, ['extendConfig', 'templateDisplayName'], '')
      const templateNamespace = _.get(sourceInfo, ['extendConfig', 'templateNamespace'], '')
      infoCardHtml += `<li class="infoListItem"><label class="infoLabel">模板名称</label><span class="infoValue">${templateDisplayName}</span></li>`
      infoCardHtml += `<li class="infoListItem"><label class="infoLabel">模板别名</label><span class="infoValue">${templateName}</span></li>`
      infoCardHtml += `<li class="infoListItem"><label class="infoLabel">命名空间</label><span class="infoValue">${templateNamespace}</span></li>`
      const instanceName = _.get(sourceInfo, ['extendConfig', 'instanceName'])
      if (!_.isNil(instanceName)) {
        const instanceDisplayName = _.get(sourceInfo, ['extendConfig', 'instanceDisplayName'], '')
        infoCardHtml += `<li class="infoListItem"><label class="infoLabel">实例名称</label><span class="infoValue">${instanceDisplayName}</span></li>`
        infoCardHtml += `<li class="infoListItem"><label class="infoLabel">实例别名</label><span class="infoValue">${instanceName}</span></li>`
      }
      const attributeInfo = _.get(sourceInfo, ['extendConfig', 'attributeInfo'])
      if (!_.isNil(attributeInfo)) {
        const { showName, name, namespace } = attributeInfo
        let attrName = name
        if (_.startsWith(name, `${namespace}_`)) {
          attrName = name.slice(`${namespace}_`.length)
        }
        infoCardHtml += `<li class="infoListItem"><label class="infoLabel">属性名称</label><span class="infoValue">${showName}</span></li>`
        infoCardHtml += `<li class="infoListItem"><label class="infoLabel">属性别名</label><span class="infoValue">${attrName}</span></li>`
      }
      break
    }
    default:
      break
  }
  infoCardHtml += `<li class="infoListItem"><label class="infoLabel">数据源名称</label><span class="infoValue">${sourceName}</span></li>`
  infoCardHtml += `<li class="infoListItem"><label class="infoLabel">数据源类型</label><span class="infoValue">${sourceTypeName}</span></li>`
  infoCardHtml += '</ul>'
  let tooltip = '<div class="infoCard">'
  tooltip += '<h3 class="infoTitleWrapper"><span class="infoTitle">基本信息</span>'
  if (hasMetaData && tableName) {
    tooltip += `<a class="detail" onclick="bloodDetailJumpUrl('${sourceId}','${tableName}')">详情&nbsp;></a>`
  }
  tooltip += '</h3>'
  tooltip += `${infoCardHtml}</div>`
  return tooltip
}

/**
 * @description: 将节点的信息 解构出来根据不同类型的数据源 格式化出对应的信息
 * @param {string} originSourceInfo 节点详情信息的 JSON 串
 * @return {object} 节点详情信息对象
 */
export const formatterNodeInfo = (originSourceInfo: string) => {
  const sourceInfo = transJsonParse(originSourceInfo)
  let name = ''
  const sourceName = _.get(sourceInfo, 'sourceName')
  const sourceType = _.get(sourceInfo, 'sourceType')
  const sourceId = _.get(sourceInfo, 'sourceId')

  switch (sourceType) {
    case 1:
    case 2:
    case 3:
    case 9:
    case 15:
      name = _.get(sourceInfo, ['extendConfig', 'tableViewName'], '')
      break
    case 4: {
      const fileName = _.get(sourceInfo, ['extendConfig', 'fileName'], '')
      name = `${fileName}`
      break
    }
    case 31: {
      name = _.get(sourceInfo, ['extendConfig', 'templateDisplayName'], '')
      break
    }
    default:
      break
  }
  const nodeId = `${sourceType}-${sourceId}-${name}`

  return {
    nodeId,
    nodeName: name || sourceName,
    sourceName,
    sourceInfo
  }
}

/**
 * @description: 边的提示信息，只需要展示源表，目标表及任务名称，跳转发布任务URL
 * @param {*}
 * @return {*}
 */
export const edgeTooltip = ({
  taskName,
  taskId,
  sourceName,
  targetName
}: {
  taskName: string
  taskId: string
  sourceName: string
  targetName: string
}) => {
  let html = '<div class="infoCard">'
  html += '<h3 class="infoTitleWrapper"><span class="infoTitle">基本信息</span>'
  html += `<a class="detail" href="#/process/release/detail/${taskId}?tab=${taskName}-发布任务">详情&nbsp;></a></h3>`
  html += '<ul class="infoListWrapper">'
  html += `<li class="infoListItem"><label class="infoLabel">任务名称</label><span  class="infoValue">${taskName}</span></li>`
  html += `<li class="infoListItem"><label class="infoLabel">源表名称</label><span  class="infoValue">${sourceName}</span></li>`
  html += `<li class="infoListItem"><label class="infoLabel">目标表名称</label><span  class="infoValue">${targetName}</span></li>`
  html += '</ul></div>'
  return html
}

/**
 * @description: 数据血缘的节点渲染
 * 主要是根据G6的配置信息，通过矩形文本进行组装搭配形成ui界面
 * @param {any} cfg 节点配置信息 G6提供
 * @param {any} group 节点所在的组，G6提供
 * @param {any} treeData 数据血缘树
 * @return {*}
 */
export const renderCustomNode = (cfg: any, group: any, treeData: any[]) => {
  const { nodeName = '', id, side, sourceInfo } = cfg
  const isRoot = id === '0'
  const isLeft = side === 'left'
  const sourceType = _.get(sourceInfo, 'sourceType')
  const nodeConfig = isRoot ? treeGraph.rootNode : treeGraph.normalNode
  const { width: nodeWidth, height: nodeHeight } = nodeConfig.rect
  const nodeOrigin = {
    x: -nodeWidth / 2,
    y: -nodeHeight / 2
  }
  let rect
  if (isRoot) {
    rect = group.addShape('rect', {
      attrs: {
        x: -nodeWidth / 2 - 10,
        y: -nodeHeight / 2,
        width: nodeWidth + 20,
        height: 60,
        fill: 'transparent'
      }
    })
  } else {
    rect = group.addShape('rect', {
      attrs: {
        x: -nodeWidth / 2 - 10,
        y: -nodeHeight / 2,
        width: nodeWidth + 10,
        height: nodeHeight,
        fill: 'transparent'
      }
    })
  }

  group.addShape('rect', {
    attrs: {
      x: -nodeWidth / 2,
      y: -nodeHeight / 2,
      ...nodeConfig.rect
    }
  })

  // label title
  group.addShape('text', {
    attrs: {
      x: -nodeWidth / 2 + 20,
      y: -nodeHeight / 2 + 24,
      text: nodeName.length > 20 ? nodeName.substr(0, 16) + '...' : nodeName,
      ...nodeConfig.label
    },
    name: 'table-name'
  })
  // 数据源描述 subLabel
  group.addShape('rect', {
    attrs: {
      x: -nodeWidth / 2 + 20,
      y: nodeOrigin.y + 32,
      ...nodeConfig.subRect
    },
    name: 'subLabel-wrap'
  })
  group.addShape('text', {
    attrs: {
      x: -nodeWidth / 2 + 28,
      y: nodeOrigin.y + 49,
      text: _.get(sourceTypeEnum, [sourceType, 'name'], ''),
      ...nodeConfig.subLabel
    },
    name: 'subLabel'
  })

  // collapse rect
  const childLength = cfg.children.length
  let leftLabel
  let rightLabel
  if (isRoot) {
    const { left, right } = _.groupBy(_.get(treeData, 'children', []), 'side')
    leftLabel = _.get(left, 'length', '')
    rightLabel = _.get(right, 'length', '')
  } else {
    leftLabel = isLeft ? childLength : '1'
    rightLabel = isLeft ? '1' : childLength
  }

  if (leftLabel) {
    //右节点
    group.addShape('circle', {
      attrs: {
        x: -nodeWidth / 2,
        ...treeGraph.collapsed.circleWrapper
      },
      name: 'left-circle-wrap'
    })
    group.addShape('circle', {
      attrs: {
        x: -nodeWidth / 2,
        ...treeGraph.collapsed.circleInner
      },
      name: 'left-circle-inner'
    })
    group.addShape('text', {
      attrs: {
        x: -nodeWidth / 2,
        text: leftLabel,
        ...treeGraph.collapsed.text
      },
      modelId: cfg.id,
      name: 'left-collapse-text'
    })
  }
  if (rightLabel) {
    // 左节点
    group.addShape('circle', {
      attrs: {
        x: nodeWidth / 2,
        ...treeGraph.collapsed.circleWrapper
      },
      name: 'right-circle-wrap'
    })
    group.addShape('circle', {
      attrs: {
        x: nodeWidth / 2,
        ...treeGraph.collapsed.circleInner
      },
      name: 'right-circle-inner'
    })
    group.addShape('text', {
      attrs: {
        x: nodeWidth / 2,
        text: rightLabel,
        ...treeGraph.collapsed.text
      },
      name: 'right-collapse-text',
      modelId: cfg.id
    })
  }
  return rect
}

export const renderCustomEdge = (cfg: any, group: any, pointId2EdgeInfo: any) => {
  const {
    sourceNode,
    targetNode,
    startPoint: { x: sx, y: sy },
    endPoint: { x: ex, y: ey }
  } = cfg
  const { nodeId: sourceNodeId } = sourceNode.getModel()
  const { nodeId: targetNodeId, side } = targetNode.getModel()
  const isLeft = side === 'left'
  const arrowAttr: any = {
    path: [
      ['M', sx, sy],
      ['L', ex, ey]
    ],
    stroke: '#B9B9B9',
    lineWidth: 1
  }
  const arrowPath = {
    path: 'M 0,0 L 10,5 L 10,-5 Z',
    fill: '#B9B9B9',
    stroke: '#B9B9B9',
    opacity: 0.8
  }
  if (isLeft) {
    arrowAttr.startArrow = arrowPath
  } else {
    arrowAttr.endArrow = arrowPath
  }
  group.addShape('path', {
    attrs: arrowAttr,
    name: 'path-shape'
  })

  let taskName = ''
  if (side === 'left') {
    taskName = _.get(pointId2EdgeInfo, [`${targetNodeId}-${sourceNodeId}`, 'taskName'], '')
  } else {
    taskName = _.get(pointId2EdgeInfo, [`${sourceNodeId}-${targetNodeId}`, 'taskName'], '')
  }
  taskName = taskName.length > 20 ? taskName.slice(0, 20) + '...' : taskName
  group.addShape('text', {
    attrs: {
      x: (sx + ex) / 2,
      y: (sy + ey) / 2 + (sy > ey ? -6 : 6),
      text: taskName,
      ...treeGraph.edgeLabel.text
    },
    name: 'task-name'
  })
}

/**
 * @description: 文本过长显示省略
 * canvas节点不能通过css控制显示是否省略，所以该处需要通过js进行处理
 * @param {string} text 文本
 * @param {number} length 截取文本的长度，默认20
 * @return {string} 返回处理后的文本信息
 */
export const extraEllipsis = (text: string, length = 20) => {
  if (_.isString(text)) {
    return text.length > length ? `${text.slice(0, length)}...` : text
  } else {
    return text
  }
}
