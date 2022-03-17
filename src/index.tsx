import './index.scss'

import React from 'react'
import ReactDOM from 'react-dom'
import { configure } from 'mobx'

import App from '@shared/App'
import catchUnhandledRejection from './errorHandler'

configure({ enforceActions: 'observed' })
catchUnhandledRejection()

const render = (Component: React.ComponentType) => {
  ReactDOM.render(<Component />, document.getElementById('app'))
}

render(App)
