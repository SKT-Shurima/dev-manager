import http from '@services/http'
import { BASE_URL } from '@config/env'

/**
 * @description: 获取任务血缘
 */
export const getTaskRelation = (): Promise<any> => {
  return http.get(`${BASE_URL}/source/relation/get/all`)
}

export const getMetaHealth = (): Promise<any> => {
  return http.get('/static/meta-frontend/health/startup/')
}
