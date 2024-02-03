import * as AWS from 'aws-sdk'

interface CognitoEvent {
  request: {
    userAttributes: any
  }
}

const dynamoDb = new AWS.DynamoDB.DocumentClient()

export const handler = async (
  event: CognitoEvent,
  context: any
): Promise<any> => {
  try {
    const userAttributes = event.request.userAttributes
    console.log(userAttributes)
    const { sub, name, email, phone_number, primary } = userAttributes

    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.SKATERS_TABLE!,
      Item: {
        sub,
        name,
        email,
        phone_number,
        primary,
        dateAdded: new Date().toISOString(),
      },
    }

    // Put user information into DynamoDB
    await dynamoDb.put(params).promise()
    context.done(null, event)
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User added to DynamoDB successfully' }),
    }
  } catch (error) {
    console.error('Error adding user to DynamoDB:', error)
    context.done(null, event)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    }
  }
}
