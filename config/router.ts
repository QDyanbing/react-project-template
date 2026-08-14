import { hasPermission } from '@/utils/access';
import { router as routeConfigs } from '@config/routes';
import {
  type AnyRoute,
  createBrowserHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
  redirect,
} from '@tanstack/react-router';

interface RouterContext {
  getCurrentUser: () => Promise<API.Account | undefined>;
}

const getBeforeLoad = (routeConfig: RouteConfig) => {
  if (routeConfig.redirect) {
    return () => {
      throw redirect({ to: routeConfig.redirect });
    };
  }

  const { permissions } = routeConfig;
  if (!permissions?.length) return undefined;

  return async ({ context }: { context: RouterContext }) => {
    const currentUser = await context.getCurrentUser();
    if (!currentUser) return;

    if (!hasPermission(currentUser.permissions, permissions)) {
      throw redirect({ to: '/403' });
    }
  };
};

function createRoutes(parentRoute: AnyRoute, routeConfigs: readonly RouteConfig[]): AnyRoute[] {
  return routeConfigs.map((routeConfig, index) => {
    const options = {
      getParentRoute: () => parentRoute,
      component: routeConfig.component ? lazyRouteComponent(routeConfig.component) : undefined,
      beforeLoad: getBeforeLoad(routeConfig),
    };
    const route = routeConfig.path
      ? createRoute({ ...options, path: routeConfig.path })
      : createRoute({ ...options, id: `layout-${index}` });

    return routeConfig.children?.length
      ? route.addChildren(createRoutes(route, routeConfig.children))
      : route;
  });
}

const ROOT_ROUTE = createRootRouteWithContext<RouterContext>()({ component: Outlet });

export const router = createRouter({
  context: {
    getCurrentUser: async () => undefined,
  },
  history: createBrowserHistory(),
  routeTree: ROOT_ROUTE.addChildren(createRoutes(ROOT_ROUTE, routeConfigs)),
});
