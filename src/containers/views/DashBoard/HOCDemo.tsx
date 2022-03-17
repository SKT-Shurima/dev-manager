import React from 'react'
const WidthLog = WrapperComponent => {
  class Logs extends React.Component {
    componentDidMount(): void {
      console.log('demo')
    }

    handleClick = () => {
      console.log('click')
    }

    render() {
      return <WrapperComponent ref={this.props.forwardRef}></WrapperComponent>
    }
  }
  return React.forwardRef((props, ref) => {
    return <Logs forwardRef={ref}></Logs>
  })
}

export default WidthLog
