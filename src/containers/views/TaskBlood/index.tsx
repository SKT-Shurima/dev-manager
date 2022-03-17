import React, { Component } from 'react'
import { Provider, observer } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router-dom'

import BloodTree from './containers/BloodTree'
import TaskRelation from './containers/TaskRelation'
import BloodStore from './blood.store'

interface IProps extends RouteComponentProps {
  tableName?: string
}

@observer
class TaskBlood extends Component<IProps> {
  private bloodStore: any
  public constructor(props: IProps) {
    super(props)
    this.bloodStore = new BloodStore({
      tableName: props.tableName || '',
      taskName: _.get(props, 'match.params.taskName', '')
    })
  }

  public render() {
    const { viewType } = this.bloodStore
    return (
      <Provider bloodStore={this.bloodStore}>
        {viewType === 'relation' && <TaskRelation />}
        {viewType === 'bloodTree' && <BloodTree />}
      </Provider>
    )
  }
}

export default withRouter(TaskBlood)
