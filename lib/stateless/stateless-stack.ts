import {
	EndpointType,
	LambdaIntegration,
	MethodLoggingLevel,
	RestApi,
	TokenAuthorizer,
} from 'aws-cdk-lib/aws-apigateway';

import * as cdk from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

interface statelsssProps extends cdk.StackProps {
	userPoolId: string;
	clientId: string;
	hostedDomain: string;
}

function validateProps(props: statelsssProps) {
	if (!props.userPoolId || !props.clientId) {
		throw new Error('Stack props have not been provided');
	}
}

export class CognitoCustomAuthStackStateless extends cdk.Stack {
	constructor(scope: Construct, id: string, props: statelsssProps) {
		super(scope, id, props);

		validateProps(props);
		/**
		 * Create our API to authenticate with
		 */
		const api = new RestApi(this, 'auth-api', {
			deploy: true,
			endpointTypes: [EndpointType.REGIONAL],
			deployOptions: {
				stageName: 'prod',
				dataTraceEnabled: true,
				loggingLevel: MethodLoggingLevel.INFO,
				tracingEnabled: true,
				metricsEnabled: true,
			},
		});

		/**
		 * Create a simple lambda that requires custom token authentication
		 */
		const simpleGet: NodejsFunction = new NodejsFunction(this, 'simple-get', {
			functionName: 'simple-get-handler',
			runtime: Runtime.NODEJS_16_X,
			entry: join(__dirname, '/src/v1/simple-get.ts'),
			memorySize: 1024,
			handler: 'simpleGetHandler',
			bundling: {
				minify: true,
				externalModules: ['aws-sdk'],
			},
			environment: {},
		});

		/**
		 * Create a lambda that logs in a user with Username/Password auth
		 * to retrieve a token
		 */
		const login: NodejsFunction = new NodejsFunction(this, 'login', {
			functionName: 'login-handler',
			runtime: Runtime.NODEJS_16_X,
			entry: join(__dirname, '/src/login/login.ts'),
			memorySize: 1024,
			handler: 'loginHandler',
			bundling: {
				minify: true,
				externalModules: ['aws-sdk'],
			},
			environment: {
				USER_POOL_ID: props.userPoolId,
				CLIENT_ID: props.clientId,
				// Not Required.
				HOSTED_DOMAIN: props.hostedDomain,
			},
		});

		/**
		 * Create our custom congito authoriser lambda
		 */
		const customAuthoriser: NodejsFunction = new NodejsFunction(
			this,
			'custom-authoriser',
			{
				functionName: 'auth-handler',
				runtime: Runtime.NODEJS_16_X,
				entry: join(__dirname, '/src/shared/auth.ts'),
				memorySize: 1024,
				handler: 'authHandler',
				bundling: {
					minify: true,
					externalModules: ['aws-sdk'],
				},
				environment: {
					USER_POOL_ID: props.userPoolId,
					CLIENT_ID: props.clientId,
				},
			}
		);

		/**
		 * Set our authoriser lambda as a token authoriser
		 */
		const auth = new TokenAuthorizer(this, 'NewRequestAuthorizer', {
			handler: customAuthoriser,
			// default header
			//identitySource: 'method.request.header.Authorization',
		});

		/**
		 * Create our get endpoint that requires authorisation
		 */
		const v1 = api.root.addResource('v1');
		v1.addMethod(
			'GET',
			new LambdaIntegration(simpleGet, {
				proxy: true,
				allowTestInvoke: false,
			}),
			{ authorizer: auth }
		);

		/**
		 * Create our login endpoint to retrieve a token
		 */
		const token = v1.addResource('login');
		token.addMethod(
			'POST',
			new LambdaIntegration(login, {
				proxy: true,
				allowTestInvoke: false,
			})
		);
	}
}
