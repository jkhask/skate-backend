import * as appsync from 'aws-cdk-lib/aws-appsync'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

export interface ResolverConfig {
  typeName: string
  fieldName: string
  codePath: string
}

export interface ApiProps {
  userPool: cognito.UserPool
  schemaPath: string
}

export class Api extends Construct {
  api: appsync.GraphqlApi

  constructor(
    scope: Construct,
    id: string,
    { userPool, schemaPath }: ApiProps
  ) {
    super(scope, id)

    this.api = new appsync.GraphqlApi(scope, `${id}Graphql`, {
      name: id,
      definition: appsync.Definition.fromFile(schemaPath),
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
      const { typeName, fieldName, codePath } = config
      new appsync.Resolver(scope, `${fieldName}Resolver`, {
        api: this.api,
        dataSource,
        runtime: appsync.FunctionRuntime.JS_1_0_0,
        typeName,
        fieldName,
        code: appsync.Code.fromAsset(codePath),
      })
    })
  }
}
