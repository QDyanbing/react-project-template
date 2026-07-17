import type { RouteComponent } from '@tanstack/react-router';
import type { router } from '@config/router';

declare global {
  type RouteConfig = {
    children?: RouteConfig[];
    component: () => Promise<{ default: RouteComponent }>;
    path: string;
  };
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
