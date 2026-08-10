import type { Language } from '@/i18n/languages';
import type { router } from '@config/router';
import type { RouteComponent } from '@tanstack/react-router';
import type { ResourceKey } from 'i18next';

declare global {
  namespace I18n {
    interface Locale {
      language: Language;
      namespace: string;
      resources: ResourceKey;
    }
  }

  type RouteConfig =
    | {
        children?: RouteConfig[];
        component: () => Promise<{ default: RouteComponent }>;
        path: string;
        permissions?: string[];
        redirect?: never;
      }
    | {
        children?: RouteConfig[];
        component?: never;
        path: string;
        permissions?: never;
        redirect: string;
      }
    | {
        children: RouteConfig[];
        component: () => Promise<{ default: RouteComponent }>;
        path?: never;
        permissions?: string[];
        redirect?: never;
      };
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
