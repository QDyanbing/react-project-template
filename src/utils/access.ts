export const hasPermission = (permissions: API.Permission[], requiredPermissions: string[]) => {
  const permissionCodes = permissions.map(({ code }) => code);

  return (
    requiredPermissions.length === 0 ||
    permissionCodes.includes('*') ||
    requiredPermissions.every((permission) => permissionCodes.includes(permission))
  );
};
