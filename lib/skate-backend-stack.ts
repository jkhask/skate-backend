import * as cdk from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Cognito } from './constructs/cognito'

export class SkateBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const usersTable = new dynamodb.TableV2(this, 'skaters', {
      partitionKey: { name: 'sub', type: dynamodb.AttributeType.STRING },
    })

    const postSignUpFn = new nodejs.NodejsFunction(this, 'postSignUpFn', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      entry: './src/cognito/postSignUp.ts',
      handler: 'handler',
      environment: { SKATERS_TABLE: usersTable.tableName },
    })
    usersTable.grantFullAccess(postSignUpFn)

    const cognito = new Cognito(this, 'cognito', { postSignUpFn })

    // const api = new appsync.GraphqlApi(this, 'api', {
    //   name: 'cltFreeSkateApi',
    //   definition: appsync.Definition.fromFile(
    //     path.join(__dirname, 'schema.graphql')
    //   ),
    //   authorizationConfig: {
    //     defaultAuthorization: {
    //       authorizationType: appsync.AuthorizationType.USER_POOL,
    //     },
    //   },
    // })
  }
}
