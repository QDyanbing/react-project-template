export const router = [
  {
    path: '/',
    component: () => import('@/pages/Home'),
  },
  {
    path: '/about',
    component: () => import('@/pages/About'),
  },
] satisfies RouteConfig[];
