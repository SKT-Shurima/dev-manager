import React, { Component } from 'react'
import { Tree, Button } from 'sup-ui'

import Icon from '@components/Icon'
import { isDefinedVar } from '../../module.helper'
import EditorNode from './EditorNode'
import AddNode from './AddNode'
import VarSelect from './VarSelect'
import styles from './index.less'

const { TreeNode } = Tree

interface IProps {
  json: any
  originJson: any
  variables: any[]
  onChange: (type: 'replace' | 'update' | 'delete', value: any, path: any[]) => void
  defaultSelectPath?: string
}

interface IState {}

class JsonTree extends Component<IProps, IState> {
  private getOriginValueType = (value: any) => {
    const valueType = typeof value
    if (valueType === 'object') {
      const objectType = Object.prototype.toString.call(value)
      if (objectType === '[object Array]') {
        return 'Array'
      } else if (objectType === '[object Object]') {
        return 'Object'
      } else {
        return 'string'
      }
    } else {
      return valueType
    }
  }

  private handleChangeMapping = (path: any[], value: string) => {
    this.props.onChange(value ? 'replace' : 'delete', value, path)
  }

  private handleDelete = (targetIndex: number, path: any[]) => {
    const { json } = this.props
    const targetArr = _.cloneDeep(_.isEmpty(path) ? json : _.get(json, path))
    if (targetArr.length > 1) {
      _.remove(targetArr, (_item, index) => index === targetIndex)
      this.props.onChange('update', targetArr, path)
    }
  }

  /**
   * @description: 渲染对象类型的节点
   * @param {type}
   * @return:
   */
  private renderObjectNode = (objKey: string, obj: any, originObj: any, path: string[] = []) => {
    const { variables, onChange } = this.props
    const varValue = isDefinedVar(obj) ? obj : ''
    const parentNodePath = path.join('/')
    return (
      <TreeNode
        key={`${parentNodePath}`}
        title={
          <div
            className={styles.keyWrapper}
            // onClick={this.handleSelect.bind(this, nodePath, 'Object')}
          >
            <span className={styles.key}>{`${objKey} {} -${_.keys(originObj).length} keys`}</span>
            <VarSelect
              value={varValue}
              options={_.filter(variables, item => item.type === 4 || item.type === 3)}
              onChange={this.handleChangeMapping.bind(this, path)}
            />
          </div>
        }
      >
        {!varValue &&
          _.map(obj, (oValue: any, oKey: string) => {
            const nodePathArray = _.concat(path, oKey)
            const originValue = _.get(originObj, oKey)
            const valueType = this.getOriginValueType(originValue)
            const nodePath = nodePathArray.join('/')
            if (valueType === 'Object') {
              return this.renderObjectNode(oKey, oValue, originValue, nodePathArray)
            } else if (valueType === 'Array') {
              if (this.getOriginValueType(originValue[0]) === 'Object') {
                return this.renderObjectArrayNode(oKey, oValue, originValue, nodePathArray)
              } else {
                return this.renderArrayNode(oKey, oValue, originValue, nodePathArray)
              }
            } else {
              return (
                <TreeNode
                  key={`${nodePath}`}
                  selectable={false}
                  title={
                    <EditorNode
                      itemKey={oKey}
                      value={oValue}
                      variables={variables}
                      onChange={(value: any) => {
                        onChange('update', value, nodePathArray)
                      }}
                    />
                  }
                />
              )
            }
          })}
      </TreeNode>
    )
  }

  /**
   * @description: 渲染数组对象的list
   * @param {type}
   * @return:
   */
  private renderArrayList = (arrList: any[], path: string[]): any[] => {
    const { onChange, variables } = this.props
    const keys = _.map(arrList[0], (_value, key) => key)
    const parentNodePath = path.join('/')
    const nodes = _.map(arrList, (item, index) => (
      <TreeNode
        key={`${parentNodePath}/${index}`}
        selectable={false}
        title={
          <span className={styles.keyWrapper}>
            <span className={styles.key}>{`${index} {} -${keys.length} keys`}</span>
            {arrList.length > 1 && (
              <Icon
                type="remove"
                className={styles.icon}
                onClick={() => {
                  this.handleDelete(index, path)
                }}
              />
            )}
          </span>
        }
      >
        {_.map(keys, key => {
          const nodePath = _.concat<string | number>(path, index, key)
          return (
            <TreeNode
              key={nodePath.join('/')}
              selectable={false}
              title={
                <EditorNode
                  itemKey={key}
                  variables={variables}
                  value={item[key]}
                  onChange={(value: any) => {
                    onChange('update', value, nodePath)
                  }}
                />
              }
            />
          )
        })}
      </TreeNode>
    ))
    nodes.push(
      <TreeNode
        key={`${parentNodePath}/${arrList.length}`}
        className={styles.addNode}
        selectable={false}
        title={
          <AddNode
            keys={keys}
            variables={variables}
            onChange={(value: any) => {
              const addNodePath = _.concat<string | number>(path, arrList.length)
              onChange('update', value, addNodePath)
            }}
          />
        }
      />
    )
    return nodes
  }

  /**
   * @description: 渲染数据对象接节点
   * @param {type}
   * @return:
   */
  private renderObjectArrayNode = (objKey: string, nowValue: any, originValue: any[], path: string[]) => {
    const varValue = isDefinedVar(nowValue) ? nowValue : ''
    const { variables } = this.props
    const nodePath = path.join('/')
    return (
      <TreeNode
        key={`${nodePath}`}
        title={
          <div
            className={styles.keyWrapper}
            // onClick={this.handleSelect.bind(this, nodePath, 'Array')}
          >
            <span className={styles.key}>{`${objKey} [] -${originValue.length} objectItems`}</span>
            <VarSelect
              value={varValue}
              options={_.filter(variables, item => item.type === 3)}
              onChange={this.handleChangeMapping.bind(this, path)}
            />
          </div>
        }
      >
        {!varValue && this.renderArrayList(nowValue, path)}
      </TreeNode>
    )
  }

  /**
   * @description: 渲染纯数组节点
   * @param {type}
   * @return:
   */
  private renderArrayNode = (objKey: string, nowValue: any, originValue: any[], path: string[] = []) => {
    const nodePath = path.join('/')
    const { variables, onChange } = this.props
    nowValue = _.cloneDeep(nowValue)
    const varValue = isDefinedVar(nowValue) ? nowValue : ''
    let nodes: any[] = []
    if (!varValue) {
      nodes = _.map(nowValue, (item, index) => (
        <TreeNode
          key={`${nodePath}/${index}`}
          selectable={false}
          title={
            <div className={styles.keyWrapper}>
              <EditorNode
                itemKey={`${index}`}
                value={item}
                onChange={value => {
                  nowValue[index] = value
                  onChange('update', nowValue, path)
                }}
              />
              <Icon
                type="remove"
                className={styles.icon}
                onClick={() => {
                  nowValue.splice(index, 1)
                  onChange('update', nowValue, path)
                }}
              />
            </div>
          }
        />
      ))
      nodes.push(
        <TreeNode
          key={`${nodePath}/add`}
          selectable={false}
          title={
            <Button
              size="small"
              onClick={() => {
                nowValue.push('')
                onChange('update', nowValue, path)
              }}
            >
              添加
            </Button>
          }
        />
      )
    }
    return (
      <TreeNode
        key={`${nodePath}`}
        selectable={false}
        title={
          <div className={styles.keyWrapper}>
            <span className={styles.key}>{`${objKey} [] -${originValue.length} items`}:</span>
            <VarSelect
              value={varValue}
              options={_.filter(variables, item => item.type === 5)}
              onChange={this.handleChangeMapping.bind(this, path)}
            />
          </div>
        }
      >
        {nodes}
      </TreeNode>
    )
  }

  public render() {
    const { json, originJson, defaultSelectPath = '', variables } = this.props
    const valueType = this.getOriginValueType(json)
    let isNoData = false
    let nodes: any
    if (valueType === 'Object') {
      isNoData = !_.keys(originJson).length
      nodes = this.renderObjectNode('root', json, originJson, [])
    } else if (valueType === 'Array') {
      const [arrItem] = json
      const arrItemType = this.getOriginValueType(arrItem)
      if (arrItemType === 'Object') {
        nodes = this.renderObjectArrayNode('root', json, originJson, [])
      } else {
        nodes = this.renderArrayNode('root', json, originJson, [])
      }
    } else {
      nodes = (
        <TreeNode
          key="root"
          title={
            <div
              className={styles.keyWrapper}
              // onClick={this.handleSelect.bind(this, nodePath, 'Object')}
            >
              <span className={styles.key}>{`root {} -${_.keys(originJson).length} keys`}</span>
              <VarSelect
                value={json}
                options={_.filter(variables, item => item.type === 4 || item.type === 3)}
                onChange={this.handleChangeMapping.bind(this, [])}
              />
            </div>
          }
        />
      )
    }
    return (
      <div className={styles.treeWrapper}>
        {!isNoData ? (
          <Tree defaultExpandAll blockNode defaultSelectedKeys={[defaultSelectPath]}>
            {nodes}
          </Tree>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyImage} />
            <p>暂无数据</p>
          </div>
        )}
      </div>
    )
  }
}

export default JsonTree
