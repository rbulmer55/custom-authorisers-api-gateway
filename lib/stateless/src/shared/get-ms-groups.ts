import axios from 'axios';

export const getMsGroups = async (token: string): Promise<any[]> => {
	const result = await axios.get(`https://graph.microsoft.com/v1.0/groups/`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	return result.data.value;
};
