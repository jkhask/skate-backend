import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class SkateBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const postSignUpFn = new nodejs.NodejsFunction(this, "postSignUpFn", {
      runtime: lambda.Runtime.NODEJS_LATEST,
      entry: "./src/cognito/postConfirmationLambdaTrigger.ts",
      handler: "handler",
    });

    const userPool = new cognito.UserPool(this, "skateUserPool", {
      userPoolName: "skaters",
      signInCaseSensitive: false,
      userVerification: {
        emailSubject: "Verify your email for CLTFreeSkate",
        emailBody: "Thanks for signing up! Your verification code is {####}",
        emailStyle: cognito.VerificationEmailStyle.CODE,
        smsMessage: "Thanks for signing up! Your verification code is {####}",
      },
      signInAliases: {
        username: true,
        email: true,
      },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 6,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      standardAttributes: {
        fullname: {
          required: true,
          mutable: true,
        },
        nickname: {
          required: false,
          mutable: true,
        },
        phoneNumber: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        joinedOn: new cognito.DateTimeAttribute(),
      },
      lambdaTriggers: {
        postConfirmation: postSignUpFn,
      },
    });

    const userPoolClient = new cognito.UserPoolClient(this, "skateClient", {
      userPool,
      generateSecret: false, // Don't need to generate secret for web app running on browsers
    });

    const identityPool = new cognito.CfnIdentityPool(
      this,
      "skateIdentityPool",
      {
        allowUnauthenticatedIdentities: false, // Don't allow unathenticated users
        cognitoIdentityProviders: [
          {
            clientId: userPoolClient.userPoolClientId,
            providerName: userPool.userPoolProviderName,
          },
        ],
      }
    );

    const usersTable = new dynamodb.TableV2(this, "users", {
      partitionKey: { name: "cognitoId", type: dynamodb.AttributeType.STRING },
    });

    usersTable.grantReadWriteData(identityPool.);

    // Export values
    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });
    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "IdentityPoolId", {
      value: identityPool.ref,
    });
  }
}
