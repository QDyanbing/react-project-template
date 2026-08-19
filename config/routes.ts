export const router = [
  {
    path: '/',
    redirect: '/roles',
  },
  {
    component: () => import('@/layouts/root'),
    children: [
      {
        path: '/403',
        component: () => import('@/pages/403'),
      },
      {
        path: '/404',
        component: () => import('@/pages/404'),
      },
      {
        path: '/500',
        component: () => import('@/pages/500'),
      },
      {
        path: '/profile',
        component: () => import('@/pages/Profile'),
      },
      {
        path: '/profile/modify',
        component: () => import('@/pages/ProfileSet'),
      },
      {
        path: '/profile/password',
        component: () => import('@/pages/PasswordSet'),
      },
      {
        path: '/users',
        component: () => import('@/pages/User'),
        permissions: ['user:view'],
      },
      {
        path: '/users/detail',
        component: () => import('@/pages/UserDetail'),
        permissions: ['user:view'],
      },
      {
        path: '/users/create',
        component: () => import('@/pages/UserSet'),
        permissions: ['user:create'],
      },
      {
        path: '/users/modify',
        component: () => import('@/pages/UserSet'),
        permissions: ['user:view', 'user:modify'],
      },
      {
        path: '/roles',
        component: () => import('@/pages/Role'),
        permissions: ['role:view'],
      },
      {
        path: '/roles/detail',
        component: () => import('@/pages/RoleDetail'),
        permissions: ['role:view'],
      },
      {
        path: '/roles/create',
        component: () => import('@/pages/RoleSet'),
        permissions: ['role:create'],
      },
      {
        path: '/roles/modify',
        component: () => import('@/pages/RoleSet'),
        permissions: ['role:view', 'role:modify'],
      },
      {
        path: '$',
        redirect: '/404',
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/pages/Login'),
  },
] satisfies RouteConfig[];
