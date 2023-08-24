import axios from 'axios';

const clientId = process.env.MS_CLIENT_ID;
const clientSecret = process.env.MS_CLIENT_SECRET;
const tenant = process.env.MS_TENANT;

export const getMsToken = async (): Promise<string> => {
	const result = await axios.post(
		`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
		{
			client_id: clientId,
			scope: 'https://graph.microsoft.com/.default',
			client_secret: clientSecret,
			grant_type: 'client_credentials',
		},
		{
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);
	return result.data.access_token;
};
