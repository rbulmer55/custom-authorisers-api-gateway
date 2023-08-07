import {
	APIGatewayTokenAuthorizerEvent,
	APIGatewayTokenAuthorizerHandler,
	APIGatewayAuthorizerResult,
	PolicyDocument,
} from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const cognitoJwtVerifier = CognitoJwtVerifier.create({
	userPoolId: process.env.USER_POOL_ID || '',
	clientId: process.env.CLIENT_ID || '',
	tokenUse: 'access',
});

export const authHandler: APIGatewayTokenAuthorizerHandler = async (
	event: APIGatewayTokenAuthorizerEvent
) => {
	const authorizationToken = event.authorizationToken;
	if (!authorizationToken) {
		throw new Error('Error: unauthorised.');
	}

	try {
		const token = authorizationToken.replace('Bearer ', '');

		// verify token
		await cognitoJwtVerifier.verify(token);

		return generatePolicy('user', 'Allow', '*', token);
	} catch (error) {
		return generatePolicy('user', 'Deny', '*');
	}
};

function generatePolicy(
	principalId: string,
	effect: string,
	resource: string,
	token = '',
	identity = '',
	scope = ''
): APIGatewayAuthorizerResult {
	const policyDocument: PolicyDocument = {
		Version: '2012-10-17',
		Statement: [
			{
				Action: 'execute-api:Invoke',
				Effect: effect,
				Resource: resource,
			},
		],
	};

	const authResponse: APIGatewayAuthorizerResult = {
		principalId: principalId,
		policyDocument,
		context: { authToken: token, identity, scope },
	};

	return authResponse;
}
