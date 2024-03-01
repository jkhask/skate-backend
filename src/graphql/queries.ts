/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const listSkaters = /* GraphQL */ `query ListSkaters {
  listSkaters {
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
` as GeneratedQuery<
  APITypes.ListSkatersQueryVariables,
  APITypes.ListSkatersQuery
>;
