import * as appsync from 'aws-cdk-lib/aws-appsync'
import * as path from 'path'
import { ResolverConfig } from '../lib/constructs/api'

export const usersResolvers: ResolverConfig[] = [
  {
    typeName: 'Query',
    fieldName: 'listSkaters',
    code: appsync.Code.fromAsset(path.join(__dirname, 'scan.js')),
  },
  {
    typeName: 'Mutation',
    fieldName: 'updateSkater',
    code: appsync.Code.fromAsset(path.join(__dirname, 'updateItem.js')),
  },
]
