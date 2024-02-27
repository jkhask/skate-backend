import * as appsync from 'aws-cdk-lib/aws-appsync'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import * as path from 'path'

export interface ApiProps {
  userPool: cognito.UserPool
  usersTable: dynamodb.TableV2
}

export class Api extends Construct {
  api: appsync.GraphqlApi

  constructor(
    scope: Construct,
    id: string,
    { userPool, usersTable }: ApiProps
  ) {
    super(scope, id)
    const api = new appsync.GraphqlApi(scope, 'skatepi', {
      name: 'cltFreeSkateApi',
      definition: appsync.Definition.fromFile(
        path.join(__dirname, '../../graphql/schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: { userPool },
        },
      },
    })
    this.api = api

    const listSkatersFunc = new appsync.AppsyncFunction(
      scope,
      'listSkatersFunc',
      {
        name: 'listSkatersFunc',
        api,
        dataSource: api.addDynamoDbDataSource(
          'usersTableDatasource',
          usersTable
        ),
        code: appsync.Code.fromInline(`
            export function request(ctx) {
            return { operation: 'Scan' };
            }
  
            export function response(ctx) {
            return ctx.result.items;
            }
          `),
        runtime: appsync.FunctionRuntime.JS_1_0_0,
      }
    )

    new appsync.Resolver(scope, 'pipeline-resolver-get-posts', {
      api,
      typeName: 'Query',
      fieldName: 'listSkaters',
      code: appsync.Code.fromInline(`
            export function request(ctx) {
            return {};
            }
  
            export function response(ctx) {
            return ctx.prev.result;
            }
    `),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      pipelineConfig: [listSkatersFunc],
    })
  }
}
