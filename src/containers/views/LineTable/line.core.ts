import SVG from 'svg.js'
import $ from 'jquery'
import _ from 'lodash'

const LineCore: any = {
  init(params: any = {}): void {
    this.initPoint('originPoints')
    this.initPoint('targetPoints')
    const {
      type,
      drawingId,
      originStruct,
      targetStruct,
      verify,
      mappingIndex,
      handleMapListVisible,
      handleUpdateMappingIndex,
      renderTips,
      updateCurrentLink
    } = params
    this.type = type
    this.drawingId = drawingId
    this.renderTips = renderTips
    this.verify = verify
    this.handleMapListVisible = handleMapListVisible
    this.handleUpdateMappingIndex = handleUpdateMappingIndex
    this.updateCurrentLink = updateCurrentLink
    // 映射索引
    this.mappingIndex = mappingIndex
    // 左侧圆点对象
    this.originPoints = []
    // 右侧圆点对象
    this.targetPoints = []
    // 当前操作圆点对象
    this.currentInfo = {}
    this.originX = 8 // 圆圈距离左侧边的距离
    this.pointStep = 36 // 点与点之间的步长,即表格高度
    this.deltaY = 52 // 起始点容差 即第一个点距离顶部之间的距离
    this.pointStep = 36 // 点与点之间的步长,即表格高度
    this.deltaY = 38 + 36 / 2 - 10 / 2 // 起始点容差 即第一个点距离顶部之间的距离
    this.normalCircle = 10 // 正常情况下 圆点的直径
    this.hoverCircle = 18 // hover状态下 圆的直径
    this.lineWidth = 2 // 线的宽度
    this.lineLength = 164 // 线的长度
    this.targetX = 160 // 平行两个圆圈圆心之间的间距 理论等于线的长度

    const svg = $(`#${this.drawingId} > svg`)
    if (svg && svg.length) {
      svg.remove()
    }
    this.drawing = SVG(this.drawingId).size('100%', '100%')
    this.arrow = this.drawing.marker(12, 10, function (marker: any) {
      marker.polyline([
        [0, 3],
        [0, 7],
        [6, 5],
        [0, 3]
      ])
      marker.fill('#0F71E2')
      marker.stroke({
        color: '#0F71E2',
        opacity: 0.6,
        width: 1
      })
    })
    this.activeArrow = this.drawing.marker(12, 10, function (marker: any) {
      marker.polyline([
        [0, 3],
        [0, 7],
        [6, 5],
        [0, 3]
      ])
      marker.fill('#fd9a18')
      marker.stroke({
        color: '#fd9a18',
        opacity: 0.6,
        width: 1
      })
    })
    this.createLeftList(originStruct)
    this.createRightList(targetStruct)
    this.createMapLine()
    this.bindParentsEvent()
  },
  destroy() {
    this.drawing = undefined
  },
  initPoint(type: string) {
    if (!this[type]) return
    _.forEach(this[type], item => {
      if (type === 'originPoints') item.line.hide()
      item.remove()
    })
  },
  createIcon(offsetX: number, index: number, label = ''): any {
    const point = this.drawing.image()
    point
      .style({
        cursor: 'pointer'
      })
      .move(offsetX, index * this.pointStep + this.deltaY)
    return point
  },
  /**
   * @description: 获取节点连线状态
   * @param {string} type start: 源节点  end:目标节点
   * @param {string} verifyKey 待检测节点的连线状态
   * @return {boolean} true: 已经连接  false:未连接
   */
  getPointStatus(type: string, verifyKey: string): boolean {
    const arr = type === 'start' ? this.originPoints : this.targetPoints
    const index = _.findIndex(arr, (o: any) => o.point.key === verifyKey)
    if (index === -1) return true
    const target = _.find(this.mappingIndex, [type, index])
    return target
  },
  bindCurrentLine(originKey: any): any {
    const index = _.findIndex(this.originPoints, (o: any) => o.point.key === originKey)
    if (index === -1) return
    this.current = this.originPoints[index]
    const current = this.current
    current.begin = {}
    current.begin.y = this.pointStep * index + (this.deltaY + this.normalCircle / 2)
    current.begin.x = 14
    return this.current
  },
  cancelDrawing(): void {
    this.current.line.hide()
    this.changeIconByType('normal', this.current.point)
    this.current = ''
    this.updateCurrentLink()
  },
  drawingLine(endIndex: number): void {
    const { key: targetKey } = this.targetPoints[endIndex].point
    const verifyRes = this.verify(this.current.point.key, targetKey)
    if (!verifyRes || this.getPointStatus('end', targetKey)) {
      this.cancelDrawing()
      return
    }

    this.targetPoints[endIndex].isLinked = true
    this.current.line.show()
    this.current.line.stroke({
      dasharray: [1]
    })
    this.current.line.plot(
      this.current.begin.x,
      this.current.begin.y,
      this.lineLength,
      this.pointStep * endIndex + (this.deltaY + this.normalCircle / 2)
    )
    const index = _.findIndex(this.originPoints, (o: any) => o.point.key === this.current.point.key)
    if (index === -1) return
    this.mappingIndex.push({ start: index, end: endIndex })
    this.handleUpdateMappingIndex(this.mappingIndex)
    this.changeIconByType('normal', this.current.point)
    this.current = ''
  },
  changeIconByType(type: string, point: any) {
    const { label = '', active = '' } = point
    let tag = ''
    switch (type) {
      case 'normal':
        tag = ''
        point.size(this.normalCircle).translate(0, 0)
        break
      case 'hovered':
        tag = 'Hovered'
        point.size(this.hoverCircle).translate(-4, -4)
        break
      case 'del':
        tag = 'Del'
        point.size(this.hoverCircle).translate(-4, -4)
        break

      default:
        break
    }
  },
  createLeftList(dataSource: []) {
    _.forEach(dataSource, (item: any, index: number) => {
      const obj: any = {}
      const point = this.createIcon(this.originX, index)
      point.key = item.DAM_line_key
      point.mousedown((e: MouseEvent): void => {
        if (e.button !== 0 || this.getPointStatus('start', point.key)) return
        e.preventDefault()
        e.stopPropagation()
        this.changeIconByType('hovered', point)
        const current = this.bindCurrentLine(point.key)
        current.line.show()
        current.line.stroke({
          color: '#0F71E2',
          dasharray: [5, 5]
        })
        current.line.plot(current.begin.x, current.begin.y, current.begin.x, current.begin.y)
      })
      $(point.node).on('contextmenu', (e: MouseEvent): void => {
        e.preventDefault()
        e.stopPropagation()
        if (this.getPointStatus('start', point.key)) return
        this.bindCurrentLine(point.key)
        this.handleMapListVisible(true, item.dataType)
        this.changeIconByType('hovered', point)
      })
      obj.line = this.createLine()
      obj.point = point
      obj.remove = () => {
        $(point.node).remove()
      }
      this.originPoints.push(obj)
    })
  },
  getTargetIndex(targetKey: any) {
    return _.findIndex(this.targetPoints, (o: any) => o.point.key === targetKey)
  },
  createRightPoint(item: any, index: number) {
    const obj: any = {}
    const label = item.required ? 'Warning' : ''
    // this.type === 'dataOutput' &&
    // // ((item.isNullable === 0 && !item.isAutoIncrement) || item.required === 1)
    //   ? 'Warning'
    //   : '';
    const point = this.createIcon(this.targetX, index, label)
    point.label = label
    point.key = item.DAM_line_key
    //	当右侧节点被链接时 点击节点取消映射线
    point.click(() => {
      const pointIndex = this.getTargetIndex(point.key)
      if (pointIndex === -1) return
      const { isLinked } = this.targetPoints[pointIndex]
      if (!isLinked) return
      const targetIndex = _.findIndex(this.mappingIndex, (o: any) => o.end === index)
      const { start } = this.mappingIndex[targetIndex]
      this.originPoints[start].line.hide()
      this.targetPoints[index].isLinked = false
      this.updateCurrentLink()
      this.initLine(start, index)
      this.mappingIndex.splice(targetIndex, 1)
      this.handleUpdateMappingIndex(this.mappingIndex)
    })
    point.mouseover(() => {
      const pointIndex = this.getTargetIndex(point.key)
      if (pointIndex === -1) return
      const { isLinked } = this.targetPoints[pointIndex]
      if (isLinked && !this.current) {
        this.changeIconByType('del', point)
      }
      if (!isLinked && this.current) {
        this.changeIconByType('hovered', point)
      }
    })
    point.mouseleave(() => {
      this.changeIconByType('normal', point)
    })
    point.mouseup((e: MouseEvent): void => {
      e.stopPropagation()
      if (this.current) {
        this.drawingLine(index)
      } else {
        return
      }
    })
    obj.point = point
    obj.isLinked = false
    obj.remove = () => {
      $(point.node).remove()
    }
    this.targetPoints.push(obj)
  },
  createRightList(dataSource: any) {
    _.forEach(dataSource, (item: any, index: number) => {
      this.createRightPoint(item, index)
    })
  },
  createMapLine() {
    this.mappingIndex.forEach((item: any) => {
      const { start, end } = item
      const startItem = this.originPoints[start]
      startItem.line.show()
      startItem.line.stroke({
        color: '#0F71E2'
      })
      startItem.line.plot(
        14,
        this.pointStep * start + (this.deltaY + this.normalCircle / 2),
        this.lineLength,
        this.pointStep * end + (this.deltaY + this.normalCircle / 2)
      )
      this.targetPoints[end].isLinked = true
    })
  },
  /* 创建线条 */
  createLine() {
    const line = this.drawing.line()
    line.stroke({
      color: '#0F71E2',
      width: this.lineWidth,
      opacity: 0.6,
      linecap: 'round'
    })
    line.hide()
    line.mouseout(function () {
      line.fill('#0F71E2')
    })
    line.marker('end', this.arrow)
    return line
  },
  activeLine(originIndex: number, targetIndex: number) {
    const { line, point } = this.originPoints[originIndex]
    const { point: targetPoint } = this.targetPoints[targetIndex]
    $(line.node).attr('stroke', '#fd9a18')
    line.marker('end', this.activeArrow)
    point.active = 'Warning'
    this.changeIconByType('normal', point)
    targetPoint.active = 'Warning'
    this.changeIconByType('normal', targetPoint)
  },
  initLine(originIndex: number, targetIndex: number) {
    const { line, point } = this.originPoints[originIndex]
    const { point: targetPoint } = this.targetPoints[targetIndex]
    $(line.node).attr('stroke', '#0F71E2')
    line.marker('end', this.arrow)
    point.active = ''
    this.changeIconByType('normal', point)
    targetPoint.active = ''
    this.changeIconByType('normal', targetPoint)
  },
  /* 绑定父亲事件事件 */
  bindParentsEvent() {
    $(document).on('mouseup', (e: MouseEvent) => {
      if (this.current && e.button === 0) {
        this.cancelDrawing()
      }
    })
    $(`#${this.drawingId}`).mousemove((e: MouseEvent) => {
      e.preventDefault()
      if (this.current) {
        const { left, top } = $(`#${this.drawingId}`).offset()
        const end: any = {}
        end.x = this.getMousePos(e).x - left
        end.y = this.getMousePos(e).y - top
        this.current.line.plot(this.current.begin.x, this.current.begin.y, end.x, end.y)
      }
    })
  },
  cancelMapping() {
    _.forEach(this.mappingIndex, item => {
      this.originPoints[item.start].line.hide()
    })
    this.mappingIndex = []
  },
  /**
   * @description: 拖动排序，根据元素的索引改变节点的位置 y值
   */
  updateIndexByDrag(type: string, dragIndex: number, hoverIndex: number) {
    const { start, end } =
      type === 'pre' ? { start: hoverIndex, end: dragIndex } : { start: dragIndex, end: hoverIndex }
    const direct = type === 'pre' ? 1 : -1
    const special = type === 'pre' ? end : start
    for (let i = start; i <= end; i++) {
      const mappingItem = _.find(this.mappingIndex, o => o.start === i)
      const { line, point } = this.originPoints[i]
      if (i === special) {
        const increment = (start - end) * direct
        if (mappingItem) {
          const lineY = $(line.node).attr('y1') - 0 + increment * this.pointStep
          $(line.node).attr('y1', lineY)
          mappingItem.increment = increment
        }
        const pointY = $(point.node).attr('y') - 0 + increment * this.pointStep
        $(point.node).attr('y', pointY)
      } else {
        const increment = this.pointStep * direct
        if (mappingItem) {
          const lineY = $(line.node).attr('y1') - 0 + increment
          $(line.node).attr('y1', lineY)
          mappingItem.increment = direct
        }
        const pointY = $(point.node).attr('y') - 0 + increment
        $(point.node).attr('y', pointY)
      }
    }
    const [dragTarget] = this.originPoints.splice(dragIndex, 1)
    this.originPoints.splice(hoverIndex, 0, dragTarget)
    _.forEach(this.mappingIndex, item => {
      item.start += item.increment || 0
      item.increment = undefined
    })
  },
  updateMappingIndex(mappingIndex: []) {
    _.forEach(this.mappingIndex, item => {
      this.originPoints[item.start].line.hide()
    })
    this.mappingIndex = mappingIndex
    this.createMapLine()
  },
  getOriginPointByMapping(index: number) {
    const mappingTarget = _.find(this.mappingIndex, ['end', index])
    const { start } = mappingTarget
    const { line } = this.originPoints[start]
    return { line, mappingTarget }
  },
  add(item: any) {
    const index = this.targetPoints.length
    this.createRightPoint(item, index)
  },
  delete(delIndexArr: []) {
    let delta = 0
    _.forEach(this.targetPoints, (item, index) => {
      const { isLinked } = item
      const isDel = _.includes(delIndexArr, item.point.key)
      if (isDel) {
        delta += 1
        item.remove()
        item.isDel = true
        if (isLinked) {
          const { line } = this.getOriginPointByMapping(index)
          line.hide()
          _.remove(this.mappingIndex, (o: any) => o.end === index)
          this.handleUpdateMappingIndex(this.mappingIndex)
        }
      } else {
        if (delta) {
          if (isLinked) {
            const { line, mappingTarget } = this.getOriginPointByMapping(index)
            const newLineY = $(line.node).attr('y2') - delta * this.pointStep
            $(line.node).attr('y2', newLineY)
            mappingTarget.end -= delta
          }
          const newPointY = $(item.point.node).attr('y') - delta * this.pointStep
          $(item.point.node).attr('y', newPointY)
        }
      }
    })
    _.remove(this.targetPoints, (o: any) => o.isDel)
    const newTargetPoints = _.cloneDeep(this.targetPoints)
    this.targetPoints = []
    this.createRightList(newTargetPoints)
  },
  /* 获取鼠标的坐标 */
  getMousePos(event: MouseEvent) {
    const e = event || window.event
    const scrollX = document.documentElement.scrollLeft || document.body.scrollLeft
    const scrollY = document.documentElement.scrollTop || document.body.scrollTop
    const x = e.pageX || e.clientX + scrollX
    const y = e.pageY || e.clientY + scrollY
    return {
      x,
      y
    }
  }
}

export default LineCore
