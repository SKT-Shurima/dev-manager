import React from 'react'
import loadable from '@loadable/component'
import PageLoading from '@components/PageLoading'

const loadableOptions = { fallback: <PageLoading /> }
export const routes = [
  {
    path: '/line-table',
    component: loadable(() => import('@views/LineTable'), loadableOptions)
  },
  {
    path: '/dashboard',
    component: loadable(() => import('@views/DashBoard'), loadableOptions)
  }
]
