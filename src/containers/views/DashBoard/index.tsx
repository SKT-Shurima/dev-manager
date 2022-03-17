import React from 'react'
import Demo1 from './Demo1'
import Demo2 from './Demo2'

class DashBoard extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount(): void {
    console.log('DashBoard')
    console.log(this.ref)
  }

  render(): React.ReactNode {
    return (
      <div>
        <Demo1 ref={ref => (this.ref = ref)}></Demo1>
        <Demo2></Demo2>
      </div>
    )
  }
}

export default DashBoard
