#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CognitoCustomAuthStackStateful } from '../lib/stateful/stateful-stack';
import { CognitoCustomAuthStackStateless } from '../lib/stateless/stateless-stack';

const app = new cdk.App();
const stateful = new CognitoCustomAuthStackStateful(
	app,
	'CognitoCustomAuthStackStateful',
	{}
);

new CognitoCustomAuthStackStateless(app, 'CognitoCustomAuthStackStateless', {
	userPoolId: stateful.userPoolId,
	clientId: stateful.clientId,
	hostedDomain: stateful.hostedDomain,
});
