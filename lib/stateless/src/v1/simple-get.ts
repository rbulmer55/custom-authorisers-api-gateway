import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';

export const simpleGetHandler: APIGatewayProxyHandler = async (
	event: APIGatewayProxyEvent
) => {
	return {
		statusCode: 200,
		body: 'Hello, you are authorised',
	};
};
