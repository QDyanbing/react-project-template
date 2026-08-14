export const router = [
  {
    path: '/',
    redirect: '/home',
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
        path: '/home',
        component: () => import('@/pages/Home'),
      },
      {
        path: '/home/detail',
        component: () => import('@/pages/HomeDetail'),
      },
      {
        path: '/home/create',
        component: () => import('@/pages/HomeSet'),
      },
      {
        path: '/home/modify',
        component: () => import('@/pages/HomeSet'),
      },
      {
        path: '/profile',
        component: () => import('@/pages/Profile'),
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
        path: '/roles',
        component: () => import('@/pages/Role'),
      },
      {
        path: '/roles/detail',
        component: () => import('@/pages/RoleDetail'),
        permissions: ['role:view'],
      },
      {
        path: '/roles/create',
        component: () => import('@/pages/RoleSet'),
      },
      {
        path: '/roles/modify',
        component: () => import('@/pages/RoleSet'),
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
