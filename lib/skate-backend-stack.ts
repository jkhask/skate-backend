import * as cdk from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { usersResolvers } from '../appsync/resolvers'
import { Api } from './constructs/api'
import { Cognito } from './constructs/cognito'

const appName = 'CLTFreeSkate'

export class SkateBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // DB
    const usersTable = new dynamodb.TableV2(this, 'skaters', {
      partitionKey: { name: 'sub', type: dynamodb.AttributeType.STRING },
    })

    // Post Sign Up Lambda
    const postSignUpFn = new nodejs.NodejsFunction(this, 'postSignUpFn', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      entry: './lambda/cognito/postSignUp.ts',
      environment: { SKATERS_TABLE: usersTable.tableName },
    })
    usersTable.grantFullAccess(postSignUpFn)

    // Auth
    const { userPool } = new Cognito(this, 'skateAuth', {
      postSignUpFn,
      appName,
    })

    // API
    const skateApi = new Api(this, 'skateApi', { userPool })
    skateApi.addResolversForTable(this, usersTable, 'skaters', usersResolvers)
  }
}
