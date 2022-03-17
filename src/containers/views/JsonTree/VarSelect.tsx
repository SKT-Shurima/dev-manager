import React, { Component, Fragment } from 'react'
import { Select } from 'sup-ui'

import Icon from '@components/Icon'
import { popupContainer } from '@utils/propUtil'
import { isDefinedVar } from '../../module.helper'
import styles from './index.less'

const { Option } = Select

interface IProps {
  value: string
  options: any[]
  onChange: (value?: any) => void
}

interface IState {
  visible: boolean
  value: string
}

class VarSelect extends Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props)
    this.state = {
      visible: false,
      value: props.value
    }
  }

  public handleEdit = (e: any) => {
    e.stopPropagation()
    const { value, options } = this.props
    if (isDefinedVar(value)) {
      const targetVar = value.slice(2, -1)
      this.setState({
        visible: true,
        value: _.find(options, item => item.name === targetVar) ? value : ''
      })
    } else {
      this.setState({
        visible: true,
        value
      })
    }
  }

  public handleChange = (value: string) => {
    this.setState({
      value: `#{${value}}`
    })
  }

  public handleOk = (e: any) => {
    e.stopPropagation()
    this.setState({
      visible: false
    })
    this.props.onChange(this.state.value)
  }

  public handleCancel = (e: any) => {
    e.stopPropagation()
    this.setState({
      visible: false
    })
  }

  public handleRemove = (e: any) => {
    e.stopPropagation()
    this.setState({
      value: ''
    })
    this.props.onChange()
  }

  public render() {
    const { options } = this.props
    const { visible, value } = this.state
    return (
      <div style={{ marginLeft: '10px' }} className={styles.keyWrapper}>
        {visible ? (
          <Fragment>
            <Select
              placeholder="-请选择-"
              size="small"
              dropdownMatchSelectWidth={false}
              className={styles.varSelect}
              value={value.slice(2, -1)}
              onChange={this.handleChange}
              getPopupContainer={popupContainer}
            >
              {_.map(options, item => (
                <Option key={item.name} value={item.name}>
                  {item.name}
                </Option>
              ))}
            </Select>
            <button onClick={this.handleOk} className={styles.btnIcon}>
              确定
            </button>
            |
            <button onClick={this.handleCancel} className={styles.btnIcon}>
              取消
            </button>
          </Fragment>
        ) : value ? (
          <Fragment>
            <span style={{ marginRight: '10px' }}>{value}</span>
            <Icon type="remove" onClick={this.handleRemove} />
          </Fragment>
        ) : (
          <Icon type="edit" className={styles.icon} onClick={this.handleEdit} />
        )}
      </div>
    )
  }
}

export default VarSelect
