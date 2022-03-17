import React from 'react'
import loadable from '@loadable/component'
import PageLoading from '@components/PageLoading'
import { menuItem } from './index.d'

const loadableOptions = { fallback: <PageLoading /> }

export const menus: menuItem[] = [
  {
    name: 'DashBoard',
    key: 'dashboard',
    path: '/dashboard'
  },
  {
    name: '自定义组件',
    key: 'custom',
    children: [
      {
        name: '映射表格',
        key: 'line-table',
        path: '/line-table'
      },
      {
        name: 'JSON TreeEditor',
        key: 'json-tree',
        path: '/json-tree'
      }
    ]
  }
]

export const asynchronousComponents = {
  '/line-table': loadable(() => import('@views/LineTable'), loadableOptions),
  '/dashboard': loadable(() => import('@views/DashBoard'), loadableOptions)
}

// all routers key
export type AsynchronousComponentKeys = keyof typeof asynchronousComponents
