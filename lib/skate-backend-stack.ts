import * as cdk from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import * as path from 'path'
import { Api } from './constructs/api'
import { Cognito } from './constructs/cognito'
import { usersResolvers } from './resolvers'

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
      entry: path.join(__dirname, '../src/lambda/cognito/postSignUp.ts'),
      environment: { SKATERS_TABLE: usersTable.tableName },
    })
    usersTable.grantFullAccess(postSignUpFn)

    // Auth
    const { userPool } = new Cognito(this, 'skateAuth', {
      postSignUpFn,
      appName,
    })

    // API
    const skateApi = new Api(this, 'skateApi', {
      userPool,
      schemaPath: path.join(__dirname, '../schema.graphql'),
    })
    skateApi.addResolversForTable(this, usersTable, 'skaters', usersResolvers)
  }
}
