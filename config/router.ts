import {
  type AnyRoute,
  createBrowserHistory,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { router as routeConfigs } from "@config/routes";

function createRoutes(
  parentRoute: AnyRoute,
  routeConfigs: readonly RouteConfig[]
): AnyRoute[] {
  return routeConfigs.map((routeConfig, index) => {
    const options = {
      getParentRoute: () => parentRoute,
      component: routeConfig.component
        ? lazyRouteComponent(routeConfig.component)
        : undefined,
      beforeLoad: routeConfig.redirect
        ? () => {
            throw redirect({ to: routeConfig.redirect });
          }
        : undefined,
    };
    const route = routeConfig.path
      ? createRoute({ ...options, path: routeConfig.path })
      : createRoute({ ...options, id: `layout-${index}` });

    return routeConfig.children?.length
      ? route.addChildren(createRoutes(route, routeConfig.children))
      : route;
  });
}

const ROOT_ROUTE = createRootRoute({ component: Outlet });

export const router = createRouter({
  history: createBrowserHistory(),
  routeTree: ROOT_ROUTE.addChildren(createRoutes(ROOT_ROUTE, routeConfigs)),
});
