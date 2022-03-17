export const bloodStyle = {
  defaultConfig: {
    tooltip: {
      position: 'bottom',
      trigger: 'item',
      triggerOn: 'click',
      hideDelay: 1500,
      enterable: true //鼠标是否可进入提示框浮层中
    },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut'
  },
  defaultSeriesConfig: {
    type: 'graph',
    layout: 'force',
    symbolSize: 50,
    roam: true,
    draggable: true,
    focusNodeAdjacency: true,
    edgeSymbol: ['circle', 'arrow'],
    edgeSymbolSize: [4, 10],
    edgeLabel: {
      show: true,
      position: 'middle',
      fontSize: 12,
      formatter: (params: any) => _.get(params, 'data.taskName', '')
    },
    label: {
      position: 'bottom',
      show: true,
      textStyle: {
        color: '#354052',
        textBorderColor: '#fff',
        textBorderWidth: 1,
        shadowBlur: 4,
        fontSize: 12
      }
    },
    force: {
      initLayout: 'force',
      repulsion: 200, //节点之间的斥力因子。支持数组表达斥力范围，值越大斥力越大。
      gravity: 0.02, //节点受到的向中心的引力因子。该值越大节点越往中心点靠拢。
      edgeLength: 180, //边的两个节点之间的距离，这个距离也会受 repulsion。[10, 50] 。值越小则长度越长
      layoutAnimation: true
    }
  },
  nodeItemStyle: {
    color: '#157eff',
    shadowColor: '#35c2ff',
    shadowBlur: 4
  },
  nodeActiveStyle: {
    color: '#FEA839',
    borderColor: '#FD9A18',
    shadowColor: 'rgba(254,168,57,0.5)',
    shadowBlur: 10
  },
  lineNormalStyle: {
    color: '#B9B9B9',
    opacity: 0.9,
    width: 1,
    curveness: 0.1
  },
  lineActiveStyle: {
    color: '#FEA839',
    width: 3,
    shadowColor: 'rgba(254,168,57,0.5)',
    shadowBlur: 10
  }
}

const normalNode = {
  rect: {
    width: 180,
    height: 60,
    lineWidth: 2,
    fill: '#fff',
    stroke: '#0F71E2',
    radius: 4,
    opacity: 1
  },
  label: {
    textAlign: 'left',
    textBaseline: 'bottom',
    fontSize: 14,
    fontWeight: 600,
    fill: '#354052',
    cursor: 'pointer'
  },
  subRect: {
    width: 64,
    height: 20,
    fill: 'transparent',
    stroke: '#D5DCE6',
    radius: 10,
    cursor: 'pointer'
  },
  subLabel: {
    textAlign: 'left',
    textBaseline: 'bottom',
    fontSize: 12,
    fontWeight: 400,
    fill: '#7F8FA4',
    cursor: 'pointer'
  }
}

const rootNode = {
  rect: {
    ...normalNode.rect,
    fill: '#0A85EF'
  },
  label: {
    ...normalNode.label,
    fill: '#fff'
  },
  subRect: {
    ...normalNode.subRect,
    fill: '#fff',
    opacity: 0.4
  },
  subLabel: {
    ...normalNode.subLabel,
    fill: '#fff'
  }
}

export const treeGraph = {
  defaultConfig: {
    modes: {
      default: ['zoom-canvas', 'drag-canvas']
    },
    fitView: true,
    animate: true,
    defaultNode: {
      type: 'custom-node'
    },
    defaultEdge: {
      type: 'custom-edge',
      style: {
        stroke: '#CED4D9',
        lineWidth: 2
      }
    },
    padding: [20, 50],
    defaultZoom: 0.8,
    layout: {
      type: 'mindmap',
      direction: 'H',
      dropCap: false,
      getHeight: () => {
        return 60
      },
      getWidth: () => {
        return 160
      },
      getVGap: () => {
        return 50
      },
      getHGap: () => {
        return 100
      },
      getSide: (d: any) => {
        return d.data.side || 'right'
      }
    }
  },
  collapsed: {
    circleWrapper: {
      y: 0,
      r: 11,
      lineWidth: 1,
      fill: '#0F71E2'
    },
    circleInner: {
      y: 0,
      r: 10,
      lineWidth: 1,
      fill: '#fff'
    },
    text: {
      y: 1,
      textAlign: 'center',
      textBaseline: 'middle',
      fontSize: 12,
      cursor: 'pointer',
      fill: '#0F71E2'
    }
  },
  edgeLabel: {
    text: {
      textAlign: 'center',
      textBaseline: 'bottom',
      fontSize: 14,
      fill: '#354052',
      cursor: 'pointer'
    }
  },
  normalNode,
  rootNode
}
