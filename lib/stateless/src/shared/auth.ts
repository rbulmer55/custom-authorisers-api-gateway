import {
	APIGatewayTokenAuthorizerEvent,
	APIGatewayTokenAuthorizerHandler,
	APIGatewayAuthorizerResult,
	PolicyDocument,
} from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { getUserInfo } from './get-user-info';
import { getMsToken } from './get-ms-token';
import { getMsGroups } from './get-ms-groups';
import { filterPermissionGroups } from './filter-permission-groups';

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

		// user info to get groups
		const groupsResult = await getUserInfo(authorizationToken);

		// now as an example lets call the graphAPI to get the name of groups
		// note we can change the AD attrbiute to return name, but this is
		// an example of enriching the token authentication with an idP

		// get microsoft graph token
		const msToken = await getMsToken();

		// call microsoft graph API
		const idpGroups = await getMsGroups(msToken);

		// model groups for downstream functions
		const enrichedGroups = filterPermissionGroups(groupsResult, idpGroups);

		return generatePolicy('user', 'Allow', '*', token, {
			groups: JSON.stringify(enrichedGroups),
		});
	} catch (error) {
		return generatePolicy('user', 'Deny', '*');
	}
};

function generatePolicy(
	principalId: string,
	effect: string,
	resource: string,
	token = '',
	userContext = {},
	identity = '',
	scope = '' // You can also add scopes onto the functions for permissions
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
		context: { authToken: token, identity, scope, ...userContext },
	};

	return authResponse;
}
