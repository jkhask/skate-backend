import * as path from 'path'
import { ResolverConfig } from './constructs/api'

export const usersResolvers: ResolverConfig[] = [
  {
    typeName: 'Query',
    fieldName: 'listSkaters',
    codePath: path.join(__dirname, '../dist/appsync/scan.js'),
  },
  {
    typeName: 'Mutation',
    fieldName: 'updateSkater',
    codePath: path.join(__dirname, '../dist/appsync/updateItem.js'),
  },
]
