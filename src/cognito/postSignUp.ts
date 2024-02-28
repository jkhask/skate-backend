import { DynamoDB, PutItemInput } from '@aws-sdk/client-dynamodb'

interface CognitoEvent {
  request: {
    userAttributes: {
      sub: string
      name: string
      email: string
      phone_number: string
      'custom:primary': string
    }
  }
}

const client = new DynamoDB()

export const handler = async (
  event: CognitoEvent,
  context: any
): Promise<any> => {
  try {
    const userAttributes = event.request.userAttributes
    console.log(userAttributes)
    const {
      sub,
      name,
      email,
      phone_number,
      'custom:primary': primary,
    } = userAttributes

    const params: PutItemInput = {
      TableName: process.env.SKATERS_TABLE!,
      Item: {
        sub: { S: sub },
        name: { S: name },
        email: { S: email },
        phone_number: { S: phone_number },
        primary: { S: primary },
        points: { N: 0 },
        dateAdded: { S: new Date().toISOString() },
      },
    }

    // Put user information into DynamoDB
    await client.putItem(params)

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User added to DynamoDB successfully' }),
    }
  } catch (error) {
    console.error('Error adding user to DynamoDB:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    }
  } finally {
    context.done(null, event)
  }
}
