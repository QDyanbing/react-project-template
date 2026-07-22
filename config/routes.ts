export const router = [
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
