import * as appsync from 'aws-cdk-lib/aws-appsync'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import * as path from 'path'

export interface ResolverConfig {
  typeName: string
  fieldName: string
  code: appsync.Code
}

export interface ApiProps {
  userPool: cognito.UserPool
}

export class Api extends Construct {
  api: appsync.GraphqlApi

  constructor(scope: Construct, id: string, { userPool }: ApiProps) {
    super(scope, id)

    this.api = new appsync.GraphqlApi(scope, `${id}Graphql`, {
      name: id,
      definition: appsync.Definition.fromFile(
        path.join(__dirname, '../../appsync/schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: { userPool },
        },
      },
    })
  }

  addResolversForTable(
    scope: Construct,
    table: dynamodb.TableV2,
    dataSourcePrefix: string,
    resolverConfigs: ResolverConfig[]
  ) {
    const dataSource = this.api.addDynamoDbDataSource(
      `${dataSourcePrefix}DataSource`,
      table
    )
    resolverConfigs.forEach(config => {
      const { typeName, fieldName, code } = config
      new appsync.Resolver(scope, `${fieldName}Resolver`, {
        api: this.api,
        dataSource,
        runtime: appsync.FunctionRuntime.JS_1_0_0,
        typeName,
        fieldName,
        code,
      })
    })
  }
}
