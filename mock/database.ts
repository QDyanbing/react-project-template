export interface MockUser extends Omit<API.User, 'roles'> {
  password: string;
  roleUuids: string[];
}

export interface MockRole extends API.RoleSetParams {
  uuid: string;
  gmtCreate: string;
}

export const permissions: API.Permission[] = [
  { code: '*', name: '全部权限', description: '自动拥有当前及后续新增的全部权限' },
  { code: 'user:view', name: '查看用户', description: '查看用户列表和详情' },
  { code: 'user:create', name: '新增用户' },
  { code: 'user:modify', name: '修改用户' },
  { code: 'user:delete', name: '删除用户' },
  { code: 'user:enable', name: '启用用户' },
  { code: 'user:disable', name: '禁用用户' },
  { code: 'user:reset-password', name: '重置用户密码' },
  { code: 'role:view', name: '查看角色', description: '查看角色列表和详情' },
  { code: 'role:create', name: '新增角色' },
  { code: 'role:modify', name: '修改角色' },
  { code: 'role:delete', name: '删除角色' },
];

export const roles: MockRole[] = [
  {
    uuid: '10000000-0000-4000-8000-000000000001',
    name: '超级管理员',
    description: '拥有系统内全部权限',
    permissionCodes: ['*'],
    gmtCreate: '2026-01-01 09:00:00',
  },
  {
    uuid: '10000000-0000-4000-8000-000000000002',
    name: '运营人员',
    description: '负责用户和角色的日常查看与维护',
    permissionCodes: ['user:view', 'user:modify', 'user:enable', 'user:disable', 'role:view'],
    gmtCreate: '2026-01-02 09:00:00',
  },
  {
    uuid: '10000000-0000-4000-8000-000000000003',
    name: '只读人员',
    description: '仅可查看基础管理数据',
    permissionCodes: ['user:view', 'role:view'],
    gmtCreate: '2026-01-03 09:00:00',
  },
];

export const users: MockUser[] = [
  {
    uuid: '20000000-0000-4000-8000-000000000001',
    account: 'admin',
    password: '123456',
    name: '管理员',
    email: 'admin@example.com',
    phone: '13800000000',
    roleUuids: ['10000000-0000-4000-8000-000000000001'],
    status: 'enabled',
    gmtCreate: '2026-01-01 09:00:00',
  },
  {
    uuid: '20000000-0000-4000-8000-000000000002',
    account: 'operator',
    password: '123456',
    name: '运营人员',
    email: 'operator@example.com',
    roleUuids: ['10000000-0000-4000-8000-000000000002'],
    status: 'enabled',
    gmtCreate: '2026-01-02 09:00:00',
  },
  {
    uuid: '20000000-0000-4000-8000-000000000003',
    account: 'viewer',
    password: '123456',
    name: '只读人员',
    roleUuids: ['10000000-0000-4000-8000-000000000003'],
    status: 'disabled',
    gmtCreate: '2026-01-03 09:00:00',
  },
];

export const tokens = new Map<string, string>();

export const getRoleData = (role: MockRole): API.Role => ({
  uuid: role.uuid,
  name: role.name,
  description: role.description,
  permissions: permissions.filter(({ code }) => role.permissionCodes.includes(code)),
  userCount: users.filter(({ roleUuids }) => roleUuids.includes(role.uuid)).length,
  gmtCreate: role.gmtCreate,
});

export const getUserData = (user: MockUser): API.User => ({
  uuid: user.uuid,
  account: user.account,
  name: user.name,
  email: user.email,
  phone: user.phone,
  roles: roles.filter(({ uuid }) => user.roleUuids.includes(uuid)).map(getRoleData),
  status: user.status,
  gmtCreate: user.gmtCreate,
});

export const getAccountData = (user: MockUser): API.Account => {
  const data = getUserData(user);
  const userRoles = roles.filter(({ uuid }) => user.roleUuids.includes(uuid));
  const permissionCodes = new Set(userRoles.flatMap(({ permissionCodes }) => permissionCodes));

  return {
    uuid: data.uuid,
    account: data.account,
    name: data.name,
    email: data.email,
    phone: data.phone,
    roles: data.roles,
    permissions: permissions.filter(({ code }) => permissionCodes.has(code)),
  };
};
