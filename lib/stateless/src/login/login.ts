import {
	AuthenticationDetails,
	CognitoUserPool,
	CognitoUser,
} from 'amazon-cognito-identity-js';
import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';

const { USER_POOL_ID: UserPoolId = '', CLIENT_ID: ClientId = '' } = process.env;

type loginBody = {
	username: string;
	password: string;
};

function asyncAuthenticateUser(
	cognitoUser: CognitoUser,
	cognitoAuthenticationDetails: AuthenticationDetails
) {
	return new Promise(function (resolve, reject) {
		cognitoUser.authenticateUser(cognitoAuthenticationDetails, {
			onSuccess: resolve,
			onFailure: reject,
			newPasswordRequired: resolve,
		});
	});
}

// please don't use this auth flow
export const loginHandler: APIGatewayProxyHandler = async (
	event: APIGatewayProxyEvent
) => {
	if (!event.body) {
		throw new Error('no body provided');
	}
	const { username, password } = JSON.parse(event.body) as loginBody;

	const authenticationData = {
		Username: username,
		Password: password,
	};

	const authenticationDetails = new AuthenticationDetails(authenticationData);

	const poolData = {
		UserPoolId,
		ClientId,
	};
	const userPool = new CognitoUserPool(poolData);
	const userData = {
		Username: username,
		Pool: userPool,
	};
	const cognitoUser = new CognitoUser(userData);

	try {
		const result = await asyncAuthenticateUser(
			cognitoUser,
			authenticationDetails
		);

		return {
			statusCode: 200,
			body: JSON.stringify(result),
		};
	} catch (err) {
		return {
			statusCode: 401,
			body: 'Login failed. Username or Password incorrect',
		};
	}
};
