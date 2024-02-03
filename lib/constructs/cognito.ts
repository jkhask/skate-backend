import * as cdk from 'aws-cdk-lib'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'

export interface CognitoProps {
  postSignUpFn?: nodejs.NodejsFunction
}

export class Cognito extends Construct {
  userPool: cognito.UserPool

  constructor(scope: Construct, id: string, { postSignUpFn }: CognitoProps) {
    super(scope, id)

    const userPool = new cognito.UserPool(scope, 'skateUserPool', {
      userPoolName: 'skaters',
      signInCaseSensitive: false,
      userVerification: {
        emailSubject: 'Your verification link for CLTFreeSkate',
        emailBody:
          'Please click the link to verify your email address. {##Verify Email##}',
        emailStyle: cognito.VerificationEmailStyle.LINK,
      },
      signInAliases: {
        email: true,
      },
      selfSignUpEnabled: true,
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
        phoneNumber: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        primary: new cognito.StringAttribute(),
      },
      lambdaTriggers: {
        postConfirmation: postSignUpFn,
      },
    })
    this.userPool = userPool

    // group for admins
    new cognito.CfnUserPoolGroup(this, 'adminGroup', {
      groupName: 'adminGroup',
      userPoolId: userPool.userPoolId,
    })

    new cognito.UserPoolDomain(scope, 'userPoolDomain', {
      userPool,
      cognitoDomain: { domainPrefix: 'cltfreeskate' },
    })

    const userPoolClient = new cognito.UserPoolClient(scope, 'skateClient', {
      userPool,
      generateSecret: false, // Don't need to generate secret for web app running on browsers
    })

    const identityPool = new cognito.CfnIdentityPool(
      scope,
      'skateIdentityPool',
      {
        allowUnauthenticatedIdentities: false, // Don't allow unathenticated users
        cognitoIdentityProviders: [
          {
            clientId: userPoolClient.userPoolClientId,
            providerName: userPool.userPoolProviderName,
          },
        ],
      }
    )
    identityPool.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)

    // Signed-in users
    const authenticatedRole = new cdk.aws_iam.Role(scope, 'authenticatedRole', {
      assumedBy: new cdk.aws_iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    })

    authenticatedRole.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)

    authenticatedRole.addToPolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          'mobileanalytics:PutEvents',
          'mobiletargeting:*',
          'cognito-sync:*',
          'cognito-identity:*',
        ],
        resources: ['*'],
      })
    )

    //Attach authenticated and unauthenticated roles to identity pool
    const defaultPolicy = new cognito.CfnIdentityPoolRoleAttachment(
      scope,
      'DefaultValidRole',
      {
        identityPoolId: identityPool.ref,
        roles: {
          authenticated: authenticatedRole.roleArn,
        },
      }
    )

    // Export values
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    })
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    })
    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: identityPool.ref,
    })
  }
}
