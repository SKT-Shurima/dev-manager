import React, { FunctionComponent } from 'react'
import { Select, Form } from 'sup-ui'

import { popupContainer } from '@utils/propUtil'

const FormItem = Form.Item
const { Option } = Select

interface IProps {
  initialValue: number
  formKey: string
  getFieldDecorator: any
  onChange: (value: number) => void
  label?: string
}

const VarType: FunctionComponent<IProps> = (props: IProps) => {
  const { getFieldDecorator, formKey, label, initialValue, onChange } = props

  return (
    <FormItem label={label}>
      {getFieldDecorator(`var_type_${formKey}`, {
        initialValue,
        rules: [
          {
            required: true,
            message: '-请选择-'
          }
        ]
      })(
        <Select
          placeholder="-请选择-"
          dropdownMatchSelectWidth={false}
          onChange={onChange}
          getPopupContainer={popupContainer}
        >
          <Option key={1} value={1}>
            常量
          </Option>
          <Option key={2} value={2}>
            变量
          </Option>
        </Select>
      )}
    </FormItem>
  )
}

export default VarType
