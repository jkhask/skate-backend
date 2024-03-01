import { Context } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export const request = () => {
  return ddb.scan({})
}

export const response = (ctx: Context) => {
  const { items = [] } = ctx.result
  return items
}
