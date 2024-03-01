/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Skater = {
  __typename: "Skater",
  sub?: string | null,
  name?: string | null,
  email?: string | null,
  phone_number?: string | null,
  primary?: string | null,
  points?: number | null,
  dateAdded?: string | null,
};

export type UpdateSkaterMutationVariables = {
  sub: string,
  name?: string | null,
  email?: string | null,
  phone_number?: string | null,
  primary?: string | null,
  points?: number | null,
  dateAdded?: string | null,
};

export type UpdateSkaterMutation = {
  updateSkater?:  {
    __typename: "Skater",
    sub?: string | null,
    name?: string | null,
    email?: string | null,
    phone_number?: string | null,
    primary?: string | null,
    points?: number | null,
    dateAdded?: string | null,
  } | null,
};

export type ListSkatersQueryVariables = {
};

export type ListSkatersQuery = {
  listSkaters?:  Array< {
    __typename: "Skater",
    sub?: string | null,
    name?: string | null,
    email?: string | null,
    phone_number?: string | null,
    primary?: string | null,
    points?: number | null,
    dateAdded?: string | null,
  } | null > | null,
};
