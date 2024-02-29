import * as appsync from 'aws-cdk-lib/aws-appsync'
import { ResolverConfig } from '../lib/constructs/api'

export const usersResolvers: ResolverConfig[] = [
  {
    typeName: 'Query',
    fieldName: 'listSkaters',
    dataSourcePrefix: 'skaters',
    code: appsync.Code.fromInline(`
        export function request(ctx) {
          return { operation: 'Scan' };
        }

        export function response(ctx) {
          return ctx.result.items;
        }
    `),
  },
]
