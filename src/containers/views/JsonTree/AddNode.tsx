import React, { Component } from 'react'
import { Button } from 'sup-ui'

import EditorNode from './EditorNode'
import styles from './index.less'

interface IProps {
  keys: string[]
  variables: any[]
  onChange: (value: any) => void
}

interface IState {
  visible: boolean
  value: any
  item: {
    [key: string]: string | number | undefined
  }
}

class AddNode extends Component<IProps, IState> {
  private editRefs: any
  public constructor(props: IProps) {
    super(props)
    const item: { [key: string]: string | number | undefined } = {}
    _.forEach(props.keys, key => {
      item[key] = ''
    })
    this.state = {
      visible: false,
      value: undefined,
      item
    }
    this.editRefs = {}
  }

  public addNode = () => {
    this.setState({
      visible: true,
      value: undefined
    })
  }

  public handleChange = (key: string, value: string | number) => {
    const { item } = this.state
    item[key] = value
    this.setState({
      item
    })
  }

  public handleOk = () => {
    const verifyRes = _.map(this.editRefs, item => {
      return item.verify()
    })
    if (_.includes(verifyRes, undefined)) return
    this.props.onChange(this.state.item)
    this.setState({
      visible: false
    })
  }

  public handleCancel = () => {
    this.setState({
      visible: false
    })
  }

  public render() {
    const { visible, item } = this.state
    const { keys, variables } = this.props
    return (
      <div className={styles.addWrapper}>
        {visible ? (
          <ul className={styles.addList}>
            {_.map(keys, (key, index) => {
              return (
                <li key={`${key}-${index}`}>
                  <EditorNode
                    wrappedComponentRef={(ref: any) => {
                      this.editRefs[key] = ref
                    }}
                    value={item[key]}
                    itemKey={key}
                    edit={true}
                    variables={variables}
                    onChange={this.handleChange.bind(this, key)}
                  />
                </li>
              )
            })}
            <li>
              <Button type="primary" size="small" onClick={this.handleOk}>
                确定
              </Button>
              <Button size="small" onClick={this.handleCancel}>
                取消
              </Button>
            </li>
          </ul>
        ) : (
          <Button size="small" onClick={this.addNode}>
            添加
          </Button>
        )}
      </div>
    )
  }
}

export default AddNode
