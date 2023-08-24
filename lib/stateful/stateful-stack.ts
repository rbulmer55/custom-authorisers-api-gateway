import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
	StringAttribute,
	UserPool,
	UserPoolClient,
	UserPoolDomain,
	UserPoolIdentityProviderSaml,
	UserPoolIdentityProviderSamlMetadata,
} from 'aws-cdk-lib/aws-cognito';

const azureADMetaURL = process.env.AD_META_URL;

export class CognitoCustomAuthStackStateful extends cdk.Stack {
	public readonly userPoolId: string;
	public readonly clientId: string;
	public readonly hostedDomain: string;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		if (!azureADMetaURL) {
			throw new Error('AD Environment not set');
		}

		/**
		 * Create our basic user pool
		 */
		const userPool = new UserPool(this, 'custom-auth-user-pool', {
			userPoolName: 'custom-auth-user-pool',
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			customAttributes: {
				groups: new StringAttribute({ mutable: true }),
			},
		});
		this.userPoolId = userPool.userPoolId;

		/**
		 * Create a hosted domain for activating and alternative login
		 * Optional.
		 */
		const hostedDomain = new UserPoolDomain(this, 'custom-auth-domain', {
			userPool,
			cognitoDomain: { domainPrefix: 'custom-auth-with-ad' },
		});
		this.hostedDomain = hostedDomain.domainName;

		const ipSAMLMeta = UserPoolIdentityProviderSamlMetadata.url(azureADMetaURL);

		/**
		 * Create a SAML identity provider for AD
		 */
		const customIdentityProvider = new UserPoolIdentityProviderSaml(
			this,
			'custom-auth-ip',
			{
				metadata: ipSAMLMeta,
				userPool,
				attributeMapping: {
					custom: {
						'custom:groups': {
							attributeName:
								'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups',
						},
					},
				},
				name: 'AzureADIdentityProvider',
			}
		);

		/**
		 * Create an App client to integrate with the userpool
		 */
		const appClient = new UserPoolClient(this, 'custom-auth-client', {
			userPool,
			authFlows: { userPassword: true, userSrp: true },
			oAuth: {
				flows: {
					authorizationCodeGrant: true,
					implicitCodeGrant: true, //enabled for testing,
				},
				//change this with UI deployments
				callbackUrls: ['http://localhost:5173/login/oauth2/code/cognito/'],
				logoutUrls: ['http://localhost:5173/'],
			},
			supportedIdentityProviders: [
				{ name: customIdentityProvider.providerName },
			],
		});
		this.clientId = appClient.userPoolClientId;
	}
}
