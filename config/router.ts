import {
  type AnyRoute,
  createBrowserHistory,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from "@tanstack/react-router";
import { router as routeConfigs } from "@config/routes";
import { RootLayout } from "@/layouts/root";

function createRoutes(
  parentRoute: AnyRoute,
  routeConfigs: readonly RouteConfig[]
): AnyRoute[] {
  return routeConfigs.map((routeConfig) => {
    const route = createRoute({
      getParentRoute: () => parentRoute,
      path: routeConfig.path,
      component: lazyRouteComponent(routeConfig.component),
    });

    return routeConfig.children?.length
      ? route.addChildren(createRoutes(route, routeConfig.children))
      : route;
  });
}

const ROOT_ROUTE = createRootRoute({ component: RootLayout });

export const router = createRouter({
  history: createBrowserHistory(),
  routeTree: ROOT_ROUTE.addChildren(createRoutes(ROOT_ROUTE, routeConfigs)),
});
