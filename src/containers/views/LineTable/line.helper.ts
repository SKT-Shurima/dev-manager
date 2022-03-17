import { message } from 'antd'
import _ from 'lodash'
import { IMapping, IMappingIndex, IStruct } from './lineTable.d'

export const initLineData = (preParams: IMappingIndex, params: IMapping): IMapping => {
  const { originStruct: preOrigin = [], targetStruct: preTarget = [], mappingIndex = [] } = preParams
  const oldMappingInfo = _.map(mappingIndex, (i: any) => ({
    origin: preOrigin[i.start],
    target: preTarget[i.end]
  }))
  const { originStruct = preOrigin || [], targetStruct = preTarget || [], mapping = [] } = _.cloneDeep(params) || {}
  const newOriginStruct = originStruct
  const newTargetStruct = targetStruct
  let newMapping: any[] = []
  if (_.isEmpty(mapping)) {
    _.forEach(oldMappingInfo, (item: any) => {
      const { origin: originItem, target: targetItem } = item
      const newOriginItem = _.find(newOriginStruct, (o: any) => o.name === originItem.name)
      const newTargetItem = _.find(newTargetStruct, (o: any) => o.name === targetItem.name)
      if (
        !_.isNil(newOriginItem) &&
        !_.isNil(newTargetItem) &&
        _.get(newOriginItem, 'dataType') === _.get(newTargetItem, 'dataType')
      ) {
        newMapping.push({
          originName: newOriginItem.name,
          targetName: newTargetItem.name
        })
      }
    })
  } else {
    newMapping = mapping
  }
  return {
    originStruct: newOriginStruct,
    targetStruct: newTargetStruct,
    mapping: newMapping
  }
}

/**
 * @description: 通过 源字段名称目标字段名称 获取映射数组下标索引
 * @return {array} 数组索引
 */
export const getMappingIndex = (params: IMapping): any[] => {
  const { originStruct, targetStruct, mapping } = params
  const mappingIndex: any[] = []
  _.forEach(mapping, (item: any) => {
    const start: number = _.findIndex(originStruct, (o: any) => o.name === item.originName)
    const end: number = _.findIndex(targetStruct, (o: any) => o.name === item.targetName)
    if (start !== -1 && end !== -1) {
      mappingIndex.push({ start, end })
    }
  })
  return mappingIndex
}

export const linkVerify = ({
  originStruct,
  targetStruct,
  startKey,
  endKey
}: {
  originStruct: any[]
  targetStruct: any[]
  startKey: string
  endKey: string
}): boolean => {
  const { dataType: originDataType } = _.find(originStruct, (o: any) => o.DAM_line_key === startKey) || {}
  const {
    dataType: targetDataType,
    disabled,
    name: targetName
  } = _.find(targetStruct, (o: any) => o.DAM_line_key === endKey) || {}
  // 自增字段禁止连线
  if (disabled) {
    message.warning('自增字段禁止连线!')
    return false
  } else if (originDataType && targetDataType && originDataType !== targetDataType) {
    message.warning('数据类型不一致')
    return false
  } else if (!targetName) {
    message.warning('请输入数据源名称')
    return false
  } else if (_.some(targetStruct, (i: any) => i.DAM_line_key !== endKey && i.name === targetName)) {
    message.warning('字段重名，请修改后连线')
    return false
  } else {
    return true
  }
}

export const getSaveData = (params: IMappingIndex) => {
  const { originStruct, targetStruct, mappingIndex } = params
  const mapping: any[] = []
  let verifyBool = true
  _.forEach(targetStruct, (item: any, index: number) => {
    if (!verifyBool) return
    // 校验必连字段有没有连线
    if (item.required && !_.find(mappingIndex, (i: any) => i.end === index)) {
      verifyBool = false
      message.error('请对非空字段进行映射!')
      return
    }
    // 校验是否重名
    if (_.some(targetStruct, (i: any) => i.DAM_line_key !== item.DAM_line_key && i.name === item.name)) {
      verifyBool = false
      message.error('含有重名字段，请校验!')
      return
    }

    const linkedMappingItem = _.find(mappingIndex, (i: any) => i.end === index)
    if (linkedMappingItem) {
      const { start, end } = linkedMappingItem
      const mappingItem: any = {
        originName: originStruct[start].name,
        targetName: targetStruct[end].name
      }
      mapping.push(mappingItem)
    }
  })
  if (verifyBool) {
    return {
      originStruct,
      targetStruct,
      mapping
    }
  } else {
    return
  }
}

/**
 * @description: 根据名称进行排序 当且仅当字段名称和数据类型均一致的情况下映射
 * 把匹配到的选项置前 未匹配到的按原顺序排部在后面
 */
export const sortByName = ({ originStruct, targetStruct }: IStruct): IMappingIndex => {
  const leftNeedPre: any[] = []
  const rightNeedPre: any[] = []
  const mappingIndex: any[] = []
  const copyOriginDataSource: any[] = _.cloneDeep(originStruct)
  const copyTargetDataSource: any[] = _.cloneDeep(targetStruct)
  _.forEach(targetStruct, (item: any, index: number) => {
    if (!item.disabled) {
      const targetIndex = _.findIndex(originStruct, (o: any) => o.name === item.name && o.dataType === item.dataType)
      if (targetIndex !== -1) {
        const leftTarget = originStruct[targetIndex]
        copyOriginDataSource[targetIndex] = null
        const rightTarget = targetStruct[index]
        copyTargetDataSource[index] = null
        leftNeedPre.push(leftTarget)
        if (rightTarget) {
          rightNeedPre.push(rightTarget)
        }
      }
    }
  })
  _.forEach(rightNeedPre, (_item: any, index: number) => {
    const obj: any = {
      start: index,
      end: index
    }
    mappingIndex.push(obj)
  })
  _.remove(copyOriginDataSource, (o: any) => !o)
  _.remove(copyTargetDataSource, (o: any) => !o)
  const newOriginStruct = _.concat(leftNeedPre, copyOriginDataSource)
  const newTargetStruct = _.concat(rightNeedPre, copyTargetDataSource)
  return {
    originStruct: newOriginStruct,
    targetStruct: newTargetStruct,
    mappingIndex
  }
}

export const sortByAuto = ({ originStruct, targetStruct, mappingIndex }: IMappingIndex): IMappingIndex => {
  const leftNeedPre: any[] = []
  const rightNeedPre: any[] = []
  const newMappingIndex: any[] = []
  const copyOriginDataSource = _.cloneDeep(originStruct)
  const copyTargetDataSource = _.cloneDeep(targetStruct)
  _.forEach(mappingIndex, (item: any, index: number) => {
    const { start, end } = item
    const leftTarget = originStruct[start]
    copyOriginDataSource[start] = null
    leftNeedPre.push(leftTarget)
    const rightTarget = targetStruct[end]
    copyTargetDataSource[end] = null
    rightNeedPre.push(rightTarget)
    const obj = {
      start: index,
      end: index
    }
    newMappingIndex.push(obj)
  })
  _.remove(copyOriginDataSource, (o: any) => !o)
  _.remove(copyTargetDataSource, (o: any) => !o)
  const newOriginStruct = _.concat(leftNeedPre, copyOriginDataSource)
  const newTargetStruct = _.concat(rightNeedPre, copyTargetDataSource)
  return {
    originStruct: newOriginStruct,
    targetStruct: newTargetStruct,
    mappingIndex: newMappingIndex
  }
}

/**
 * @description: 按顺序进行连线映射
 *  当源数据(originStruct)长度大于目标源(targetStruct)长度 以目标源长度为准 反之为源数据
 * 	当且仅当顺序和数据类型均一致时才会连线
 */
export const sortByIndex = ({ originStruct, targetStruct }: IStruct): IMappingIndex => {
  const originLen = originStruct.length
  const targetLen = targetStruct.length
  if (!originLen || !targetLen) {
    return { originStruct, targetStruct, mappingIndex: [] }
  }
  const mappingIndex: any[] = []
  if (originLen > targetLen) {
    _.forEach(targetStruct, (item: any, index: number) => {
      if (item.dataType === originStruct[index].dataType && !item.disabled) {
        mappingIndex.push({
          start: index,
          end: index
        })
      }
    })
  } else {
    _.forEach(originStruct, (item: any, index: number) => {
      const { disabled, dataType } = targetStruct[index]
      if (item.dataType === dataType && !disabled) {
        mappingIndex.push({
          start: index,
          end: index
        })
      }
    })
  }
  return {
    originStruct,
    targetStruct,
    mappingIndex
  }
}

export const sortByType = (type: string, params: IMappingIndex): IMappingIndex => {
  switch (type) {
    case 'index':
      return sortByIndex(params)
    case 'name':
      return sortByName(params)
    case 'auto':
      return sortByAuto(params)
    case 'none':
      return { ...params, mappingIndex: [] }
    default:
      return params
  }
}

export const getOutStructByKeys = ({
  originStruct,
  targetStruct,
  mappingIndex,
  rowKeys
}: {
  originStruct: any[]
  targetStruct: any[]
  mappingIndex: any[]
  rowKeys: string[]
}): IMapping => {
  const mapping: any[] = _.map(mappingIndex, (i: any) => ({
    originName: originStruct[i.start].name,
    targetName: targetStruct[i.end].name
  }))
  const incrTargetStruct: any[] = []
  _.forEach(originStruct, (item: any, index: number) => {
    const { DAM_line_key: originKey, name } = item
    const include = _.includes(rowKeys, originKey)
    if (include) {
      const isSameName = _.find(targetStruct, (o: any) => o.name === name)
      // 重名的不予输出
      if (!isSameName) {
        incrTargetStruct.push({
          ..._.pick(item, ['name', 'showName', 'dataType'])
        })
        const isLinked = _.find(mappingIndex, (o: any) => o.start === index)
        // 已经连线禁止重复连线
        if (!isLinked) {
          const mappingItem = {
            originName: name,
            targetName: name
          }
          mapping.push(mappingItem)
        }
      }
    }
  })
  return {
    originStruct,
    targetStruct: _.concat(targetStruct, incrTargetStruct),
    mapping
  }
}

export const getFieldNextIndex = (targetStruct: any[]): number => {
  const customNameReg = /^field-(\d+)$/
  const customNameIndex: number[] = []
  _.forEach(targetStruct, (i: any) => {
    if (customNameReg.test(i.name)) {
      customNameIndex.push(i.name.split('-')[1] - 0)
    }
  })
  return (_.max(customNameIndex) || 0) + 1
}
