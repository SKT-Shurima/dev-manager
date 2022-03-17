import React from 'react'
import WidthLogs from './HOCDemo'

class Demo1 extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount(): void {
    console.log('Demo1')
  }

  render(): React.ReactNode {
    return <div>Demo1</div>
  }
}

export default WidthLogs(Demo1)
