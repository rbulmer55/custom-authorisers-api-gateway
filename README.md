# Cognito Custom Authoriser

This example application creates an API gateway with custom Congito Authentication.

![architecture](./architecture.png 'Architecture')

For example purposes we have a endpoint to retrieve a token for a user in the Cognito UserPool.

`POST /v1/login` - returns JWT access token with scopes

The Simple Get Lambda is behind the custom authoriser which validates the JWT passed in, and rejects if the token is invalid.

`GET /v1/` - Checks Access token beofre executing the function

## Known issues

### Custom Scopes

Currently the login endpoint cannot provide custom user scopes when authenticating with SRP auth - `https://github.com/aws-amplify/amplify-js/issues/3732`. To extend using custom scopes use a hosted UI for access token generation rather than the [Resource Owner Flow method used in this demonstration](https://auth0.com/docs/get-started/authentication-and-authorization-flow/resource-owner-password-flow)
