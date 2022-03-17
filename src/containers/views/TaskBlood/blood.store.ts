import { observable, action, runInAction } from 'mobx'
import { message } from 'sup-ui'
import { inSupos } from '@utils/common'
import { SYSTEM } from '@utils/env'

import { formatterNodeInfo } from './blood.helper'
import { getTaskRelation, getMetaHealth } from './blood.service'

class BloodStore {
  private taskName = ''
  private tableName = ''
  @observable public points: any[] = []
  @observable public edges: any[] = []
  @observable public loading = false
  @observable public viewType = ''
  @observable public treeRootNode = ''
  @observable public hasMetaData = false
  public constructor({ taskName, tableName }: { tableName: string; taskName: string }) {
    this.taskName = taskName
    this.tableName = tableName
    this.init()
  }

  @action.bound
  public init = () => {
    // 如果当前环境是在supOS里面的话，首先应该校验metaData服务是否正常
    // 如果是window独立部署的情况，因为不含有元数据，所以默认是false;
    // 其他情况默认时含有元数据模块
    if (inSupos()) {
      this.getMetaHealth()
    } else if (SYSTEM === 'ETL_WIN') {
      this.hasMetaData = false
    } else {
      this.hasMetaData = true
    }
    this.getTaskRelation()
  }

  /*获取列表数据*/
  @action.bound
  public async getTaskRelation() {
    this.loading = true
    const res = await getTaskRelation()
    if (res.code !== 200) {
      runInAction(() => {
        this.loading = false
      })
      message.error(`${res.message}`)
      return
    } else {
      runInAction(() => {
        this.loading = false
        const edges = _.get(res.data, 'edges', [])
        const points = _.get(res.data, 'points', [])
        if (this.taskName) {
          const pointIds: any[] = []
          this.edges = _.filter(edges, (edgeItem: any) => {
            if (edgeItem.taskName === this.taskName) {
              pointIds.push(edgeItem.prePointId, edgeItem.nextPointId)
              this.treeRootNode = `${edgeItem.prePointId}`
              return true
            } else {
              return false
            }
          })
          this.points = _.filter(points, pointItem => _.includes(pointIds, pointItem.pointId))
          this.viewType = 'bloodTree'
        } else if (this.tableName) {
          this.edges = edges
          this.points = points
          this.viewType = 'bloodTree'
          const targetPoint = _.find(points, item => formatterNodeInfo(item.sourceInfo).nodeName === this.tableName)
          if (!_.isNil(targetPoint)) {
            this.changeViewType(targetPoint.pointId)
          }
        } else {
          this.edges = edges
          this.points = points
          this.viewType = 'relation'
        }
      })
    }
  }

  @action.bound
  public changeViewType = (nodePoint: string) => {
    this.viewType = nodePoint ? 'bloodTree' : 'relation'
    this.treeRootNode = nodePoint
  }

  @action.bound
  public async getMetaHealth() {
    const res = await getMetaHealth()
    if (_.get(res, 'status') === 'UP') {
      runInAction(() => {
        this.hasMetaData = true
      })
    }
  }
}

export default BloodStore
