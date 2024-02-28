import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

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

const client = new DynamoDBClient()
const docClient = DynamoDBDocumentClient.from(client)

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

    const command = new PutCommand({
      TableName: process.env.SKATERS_TABLE!,
      Item: {
        sub,
        name,
        email,
        phone_number,
        primary,
        points: 0,
        dateAdded: new Date().toISOString(),
      },
    })

    const resp = await docClient.send(command)
    console.log(resp)

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
