import type { RouteComponent } from '@tanstack/react-router';
import type { router } from '@config/router';

declare global {
  type RouteConfig =
    | {
        children?: RouteConfig[];
        component: () => Promise<{ default: RouteComponent }>;
        path: string;
        redirect?: never;
      }
    | {
        children?: RouteConfig[];
        component?: never;
        path: string;
        redirect: string;
      }
    | {
        children: RouteConfig[];
        component: () => Promise<{ default: RouteComponent }>;
        path?: never;
        redirect?: never;
      };
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
