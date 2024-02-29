import * as cdk from 'aws-cdk-lib'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'

export interface CognitoProps {
  postSignUpFn?: nodejs.NodejsFunction
  appName: string
}

export class Cognito extends Construct {
  userPool: cognito.UserPool

  constructor(
    scope: Construct,
    id: string,
    { postSignUpFn, appName }: CognitoProps
  ) {
    super(scope, id)

    const userPool = new cognito.UserPool(scope, `${id}UserPool`, {
      userPoolName: `${id}UserPool`,
      signInCaseSensitive: false,
      userVerification: {
        emailSubject: `Your verification link for ${appName}`,
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
    new cognito.CfnUserPoolGroup(scope, 'adminGroup', {
      groupName: 'adminGroup',
      userPoolId: userPool.userPoolId,
    })

    new cognito.UserPoolDomain(scope, 'userPoolDomain', {
      userPool,
      cognitoDomain: { domainPrefix: appName.toLowerCase() },
    })

    const userPoolClient = new cognito.UserPoolClient(scope, `${id}Client`, {
      userPool,
      generateSecret: false, // Don't need to generate secret for web app running on browsers
    })

    const identityPool = new cognito.CfnIdentityPool(
      scope,
      `${id}IdentityPool`,
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
    new cognito.CfnIdentityPoolRoleAttachment(scope, 'DefaultValidRole', {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn,
      },
    })

    // Export values
    new cdk.CfnOutput(scope, 'UserPoolId', {
      value: userPool.userPoolId,
    })
    new cdk.CfnOutput(scope, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    })
    new cdk.CfnOutput(scope, 'IdentityPoolId', {
      value: identityPool.ref,
    })
  }
}
