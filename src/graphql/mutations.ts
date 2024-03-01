/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const updateSkater = /* GraphQL */ `mutation UpdateSkater(
  $sub: String!
  $name: String
  $email: String
  $phone_number: String
  $primary: String
  $points: Int
  $dateAdded: String
) {
  updateSkater(
    sub: $sub
    name: $name
    email: $email
    phone_number: $phone_number
    primary: $primary
    points: $points
    dateAdded: $dateAdded
  ) {
    sub
    name
    email
    phone_number
    primary
    points
    dateAdded
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateSkaterMutationVariables,
  APITypes.UpdateSkaterMutation
>;
