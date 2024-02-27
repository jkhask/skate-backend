import * as cdk from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Api } from './constructs/api'
import { Cognito } from './constructs/cognito'

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
      entry: './src/cognito/postSignUp.ts',
      environment: { SKATERS_TABLE: usersTable.tableName },
    })
    usersTable.grantFullAccess(postSignUpFn)

    const { userPool } = new Cognito(this, 'cognito', { postSignUpFn })
    new Api(this, 'api', { userPool, usersTable })
  }
}
