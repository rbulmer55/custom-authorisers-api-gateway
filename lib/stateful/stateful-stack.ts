import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
	UserPool,
	UserPoolClient,
	UserPoolDomain,
} from 'aws-cdk-lib/aws-cognito';

export class CognitoCustomAuthStackStateful extends cdk.Stack {
	public readonly userPoolId: string;
	public readonly clientId: string;
	public readonly hostedDomain: string;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		/**
		 * Create our basic user pool
		 */
		const userPool = new UserPool(this, 'auth-api-user-pool', {
			userPoolName: 'auth-api-user-pool',
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});
		this.userPoolId = userPool.userPoolId;

		/**
		 * Create a hosted domain for activating and alternative login
		 * Optional.
		 */
		const hostedDomain = new UserPoolDomain(this, 'up-domain', {
			userPool,
			cognitoDomain: { domainPrefix: 'auth-08-23' },
		});
		this.hostedDomain = hostedDomain.domainName;

		/**
		 * Create an App client to integrate with the userpool
		 */
		const appClient = new UserPoolClient(this, 'pool-client', {
			userPool,
			authFlows: { userPassword: true, userSrp: true },
		});
		this.clientId = appClient.userPoolClientId;
	}
}
