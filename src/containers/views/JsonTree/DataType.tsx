import React, { FunctionComponent } from 'react'
import { Select, Form } from 'sup-ui'

import { popupContainer } from '@utils/propUtil'

const FormItem = Form.Item
const { Option } = Select

interface IProps {
  initialValue: string
  formKey: string
  getFieldDecorator: any
  dataSource: any[]
  onChange: (value: string) => void
  label?: string
}

const DataType: FunctionComponent<IProps> = (props: IProps) => {
  const { getFieldDecorator, formKey, label, initialValue, dataSource, onChange } = props

  return (
    <FormItem label={label}>
      {getFieldDecorator(`dataType_${formKey}`, {
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
          {_.map(dataSource, item => (
            <Option key={item} value={item}>
              {item}
            </Option>
          ))}
        </Select>
      )}
    </FormItem>
  )
}

export default DataType
