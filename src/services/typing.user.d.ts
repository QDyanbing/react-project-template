declare namespace API {
  interface UserSetParams {
    name: string;
    email?: string;
    phone?: string;
    roleUuids: string[];
  }

  interface UserParams {
    keyword?: string;
    status?: 'enabled' | 'disabled';
    pageNum: number;
    pageSize: number;
  }

  interface User {
    uuid: string;
    account: string;
    name: string;
    email?: string;
    phone?: string;
    roles: Role[];
    status: 'enabled' | 'disabled';
    gmtCreate: string;
  }
}
