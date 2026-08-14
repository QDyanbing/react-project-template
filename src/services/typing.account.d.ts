declare namespace API {
  interface AccountLoginParams {
    account: string;
    password: string;
  }

  interface AccountProfileParams {
    name: string;
    email?: string;
    phone?: string;
  }

  interface AccountPasswordParams {
    currentPassword: string;
    password: string;
  }

  interface Account {
    userId: string;
    account: string;
    name: string;
    email?: string;
    phone?: string;
    roles: Role[];
    permissions: Permission[];
  }
}
