import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import * as _ from 'lodash'
import Provider from './Provider'
import IntlWrapper from './IntlWrapper'
import HashRouter from './HashRouter'
import history from './ht'
import { menus, asynchronousComponents } from './menu.config'
import { routes } from './route.config'
import Error from '@components/Error'
import { menuItem } from './index.d'
import styles from './index.module.scss'

const { SubMenu } = Menu
const { Header, Content, Sider } = Layout

function App() {
  const renderMenu = (items: menuItem[]) => {
    return _.map(items, i => {
      if (_.isEmpty(i.children)) {
        return (
          <Menu.Item key={i.key}>
            <a href={i.path}>{i.name}</a>
          </Menu.Item>
        )
      } else {
        return (
          <SubMenu key={i.key} title={i.name}>
            {renderMenu(i.children)}
          </SubMenu>
        )
      }
    })
  }
  return (
    <Provider>
      <HashRouter history={history}>
        <IntlWrapper>
          <Routes>
            <Route
              path="/*"
              element={
                <Layout>
                  <Header className={styles.headerWrapper}>
                    <a href="/" className={styles.logo}>
                      37.3℃
                    </a>
                    <p className={styles.tips}>纸上得来终觉浅，绝知此事要躬行。</p>
                  </Header>
                  <Layout>
                    <Sider width={240}>
                      <Menu mode="inline" style={{ height: '100%', borderRight: 0 }}>
                        {renderMenu(menus)}
                      </Menu>
                    </Sider>
                    <Layout>
                      <Content>
                        <Routes>
                          {_.map(routes, m => {
                            const Component = asynchronousComponents[m.path]
                            return Component && <Route key={m.path} path={m.path} element={<Component />} />
                          })}
                          <Route path="*" element={<Error />} />
                        </Routes>
                      </Content>
                    </Layout>
                  </Layout>
                </Layout>
              }
            ></Route>
          </Routes>
        </IntlWrapper>
      </HashRouter>
    </Provider>
  )
}

export default App
