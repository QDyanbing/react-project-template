declare namespace API {
  interface RoleSetParams {
    name: string;
    description?: string;
    permissionCodes: string[];
  }

  interface RoleParams {
    keyword?: string;
    pageNum: number;
    pageSize: number;
  }

  interface Role {
    uuid: string;
    name: string;
    description?: string;
    permissions: Permission[];
    userCount: number;
    gmtCreate: string;
  }
}
