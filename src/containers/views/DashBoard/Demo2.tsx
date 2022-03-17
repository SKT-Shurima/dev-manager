import React from 'react'

class Demo2 extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount(): void {
    console.log('demo2')
  }

  render(): React.ReactNode {
    return <div>demo2</div>
  }
}

export default Demo2
