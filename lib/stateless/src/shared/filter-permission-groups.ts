export const filterPermissionGroups = (
	usersGroups: any[],
	idpGroups: any[]
): any[] => {
	return usersGroups
		.map((usersGroup) => {
			const matchedGroup = idpGroups.find(
				(idPGroup) => idPGroup.id === usersGroup
			);

			if (matchedGroup) {
				return {
					groupName: matchedGroup.displayName,
					groupId: matchedGroup.id,
				};
			}
			return false;
		})
		.filter(Boolean);
};
