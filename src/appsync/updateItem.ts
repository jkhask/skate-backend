import { Context, util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export const request = (ctx: Context) => {
  const { sub, ...rest } = ctx.args
  const values = Object.entries(rest).reduce((obj, [key, value]) => {
    obj[key as typeof rest] = value ?? ddb.operations.remove()
    return obj
  }, {} as never)

  return ddb.update({
    key: { sub },
    update: values,
  })
}

export const response = (ctx: Context) => {
  const { error, result } = ctx
  if (error) {
    util.appendError(error.message, error.type)
  }
  return result
}
