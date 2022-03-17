import React, { Component } from 'react'
import { Form, message } from 'sup-ui'
import { FormComponentProps } from 'sup-ui/lib/form/Form'

import Icon from '@components/Icon'
import { baseTypes } from '../../../devTask.const'
import SetValueByDataType from '../SetValueByDataType'
import DataType from './DataType'
import VarType from './VarType'
import { isDefinedVar } from '../../module.helper'
import styles from './index.less'

interface IProps extends FormComponentProps {
  itemKey: string
  onChange: (value: any) => void
  variables?: any[]
  value?: any
  edit?: boolean
}

interface IState {
  edit: boolean
  dataType: string
  value: any
  varType: number
}

class EditorNode extends Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props)
    const { value, edit = false } = props
    const isVar = isDefinedVar(value)
    this.state = {
      dataType: this.queryDataType(value),
      edit,
      value,
      varType: isVar ? 2 : 1
    }
  }

  private queryDataType = (value: any) => {
    if (typeof value === 'boolean') {
      return 'Boolean'
    } else if (typeof value === 'number') {
      if (`${value}`.indexOf('.') === -1) {
        return 'Integer'
      } else {
        return 'Float'
      }
    } else {
      return 'String'
    }
  }

  private handleEdit = () => {
    const { value } = this.props
    const isVar = isDefinedVar(value)
    this.setState({
      edit: true,
      dataType: this.queryDataType(value),
      value,
      varType: isVar ? 2 : 1
    })
  }

  private handleValueChange = (value: any) => {
    value = this.transEnum2DataTypeValue(value, this.state.dataType)

    this.setState({ value })
  }

  private handleDataTypeChange = (dataType: string) => {
    const value = dataType === 'Boolean' ? true : undefined
    this.setState({
      dataType,
      value
    })
  }

  private handleVarTypeChange = (varType: number) => {
    this.setState({
      varType
    })
  }

  /**
   * @description: 将枚举值转换为该数据类型的数据
   * 例 枚举值为 1 的布尔值转换为 true
   * @param {any} value
   * @return {any} 对应数据类型的值
   */
  private transEnum2DataTypeValue = (value: any, dataType: string) => {
    const { varType } = this.state
    if (varType === 2) {
      return `#{${value}}`
    } else {
      if (dataType === 'Boolean') {
        return !!value
      } else {
        return value
      }
    }
  }

  private transDataValue = (value: any) => {
    const { varType, dataType } = this.state
    if (varType === 2) {
      if (isDefinedVar(value)) {
        return value.slice(2, -1)
      } else {
        return undefined
      }
    } else {
      if (dataType === 'Boolean') {
        return value - 0
      } else {
        return value
      }
    }
  }

  public verify = () => {
    let verifiedValue
    this.props.form.validateFields((error: any) => {
      if (error) {
        message.error('信息编辑有误，请校验！')
        return
      }
      const { dataType, value } = this.state
      if (_.includes(['Integer', 'Long', 'BigInteger', 'Double', 'Float', 'BigDecimal'], dataType)) {
        verifiedValue = value - 0
      } else {
        verifiedValue = value
      }
    })
    return verifiedValue
  }

  private handleOk = () => {
    const value = this.verify()
    if (value === undefined) return
    this.props.onChange(value)
    this.setState({
      edit: false,
      value
    })
  }

  private handleCancel = () => {
    const { value } = this.props
    const dataType = this.queryDataType(value)
    this.setState({
      edit: false,
      dataType,
      value
    })
  }

  private transValueByType = (text: any) => {
    try {
      if (typeof text === 'boolean') {
        text = text.toString()
      } else if (_.isObject(text)) {
        text = _.get(text, 'value', '')
      }
    } catch (error) {
      text = ''
    }
    return text
  }

  public render() {
    const {
      itemKey,
      variables,
      value: propsValue,
      form: { getFieldDecorator }
    } = this.props
    const { dataType, edit, value, varType } = this.state
    return (
      <dl className={styles.keyWrapper}>
        <dt className={styles.key}>{itemKey}:</dt>
        {edit ? (
          <dd className={styles.edit}>
            <DataType
              initialValue={dataType}
              formKey={itemKey}
              dataSource={baseTypes}
              getFieldDecorator={getFieldDecorator}
              onChange={this.handleDataTypeChange}
            />
            {variables && (
              <VarType
                initialValue={varType}
                formKey={itemKey}
                getFieldDecorator={getFieldDecorator}
                onChange={this.handleVarTypeChange}
              />
            )}
            <SetValueByDataType
              formKey={itemKey}
              varType={varType === 1 ? 'const' : 'let'}
              value={this.transDataValue(value)}
              dataType={dataType}
              variables={_.filter(variables || [], varItem => varItem.dataType === dataType)}
              getFieldDecorator={getFieldDecorator}
              onChange={this.handleValueChange}
            />
            <button onClick={this.handleOk} className={styles.btnIcon}>
              确定
            </button>
            |
            <button onClick={this.handleCancel} className={styles.btnIcon}>
              取消
            </button>
          </dd>
        ) : (
          <dd onClick={this.handleEdit} className={styles.iconWrapper}>
            {_.isNil(propsValue) ? (
              <span className={styles.tips}>请点击编辑</span>
            ) : (
              <span className={styles[typeof propsValue]}>{this.transValueByType(propsValue)}</span>
            )}

            <Icon type="edit" className={styles.icon} />
          </dd>
        )}
      </dl>
    )
  }
}

export default Form.create<IProps>({ name: 'editorNode' })(EditorNode)
