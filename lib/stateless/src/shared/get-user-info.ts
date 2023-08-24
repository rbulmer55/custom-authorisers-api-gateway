import axios from 'axios';

export const getUserInfo = async (token: string): Promise<string[]> => {
	const result = await axios.get(
		`https://custom-auth-with-ad.auth.eu-west-1.amazoncognito.com/oauth2/userInfo`,
		{
			headers: {
				Authorization: token,
			},
		}
	);
	const groupsArray: string[] = result.data['custom:groups']
		.replace('[', '')
		.replace(']', '')
		.split(', ');
	return groupsArray;
};
