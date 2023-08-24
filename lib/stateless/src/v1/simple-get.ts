import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';

export const simpleGetHandler: APIGatewayProxyHandler = async (
	event: APIGatewayProxyEvent
) => {
	return {
		statusCode: 200,
		body: `Hello, you are authorised, You have access to: ${JSON.stringify(
			event.requestContext.authorizer?.groups
		)}`,
	};
};
