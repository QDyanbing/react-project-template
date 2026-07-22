import { globSync } from "node:fs";
import type { IncomingMessage } from "node:http";
import { resolve, sep } from "node:path";
import type { Plugin, RunnableDevEnvironment, ViteDevServer } from "vite";

export type MockMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export interface MockContext<TBody = unknown> {
  body: TBody;
  params: Record<string, string>;
  request: IncomingMessage;
  url: URL;
}

export interface MockResponse<TBody = unknown> {
  body?: TBody;
  headers?: Record<string, string>;
  status?: number;
}

export interface MockRoute {
  handler: (context: MockContext<any>) => MockResponse | Promise<MockResponse>;
  method: MockMethod;
  path: string;
}

function matchPath(routePath: string, pathname: string) {
  const routeSegments = routePath.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);
  if (routeSegments.length !== pathSegments.length) return;

  const params: Record<string, string> = {};

  for (let index = 0; index < routeSegments.length; index += 1) {
    const routeSegment = routeSegments[index];
    const pathSegment = pathSegments[index];
    if (!routeSegment || !pathSegment) return;

    if (routeSegment.startsWith(":")) {
      params[routeSegment.slice(1)] = decodeURIComponent(pathSegment);
    } else if (routeSegment !== pathSegment) {
      return;
    }
  }

  return params;
}

async function getRequestBody(request: IncomingMessage) {
  if (request.method === "GET" || request.method === "HEAD") return;

  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return;

  const body = Buffer.concat(chunks).toString();
  if (request.headers["content-type"]?.includes("application/json")) {
    return JSON.parse(body) as unknown;
  }

  return body;
}

async function getRoutes(server: ViteDevServer) {
  const files = globSync("mock/**/*.ts", { cwd: server.config.root })
    .filter((file) => !file.endsWith(".d.ts"))
    .sort();
  const modules = await Promise.all(
    files.map((file) =>
      (server.environments.ssr as RunnableDevEnvironment).runner.import<
        Record<string, unknown>
      >(`/${file.replaceAll("\\", "/")}`),
    ),
  );

  return modules.flatMap(({ default: routes }) =>
    Array.isArray(routes) ? (routes as MockRoute[]) : [],
  );
}

export default function mockServer(): Plugin {
  return {
    name: "mock-server",
    apply: "serve",
    async configureServer(server) {
      const mockDirectory = `${resolve(server.config.root, "mock")}${sep}`;
      let routes = await getRoutes(server);

      const reloadRoutes = (file: string) => {
        if (!file.startsWith(mockDirectory) || !file.endsWith(".ts")) return;
        void getRoutes(server)
          .then((nextRoutes) => {
            routes = nextRoutes;
          })
          .catch((error: unknown) => {
            const message =
              error instanceof Error ? error.message : String(error);
            server.config.logger.error(`Mock 路由加载失败：${message}`);
          });
      };

      server.watcher.on("add", reloadRoutes);
      server.watcher.on("change", reloadRoutes);
      server.watcher.on("unlink", reloadRoutes);

      server.middlewares.use(async (request, response, next) => {
        try {
          const url = new URL(request.url ?? "/", "http://localhost");
          if (!url.pathname.startsWith("/api/")) {
            next();
            return;
          }

          const method = request.method?.toUpperCase();
          let currentRoute: MockRoute | undefined;
          let params: Record<string, string> | undefined;

          for (const route of routes) {
            if (route.method !== method) continue;

            const matchedParams = matchPath(route.path, url.pathname);
            if (!matchedParams) continue;

            currentRoute = route;
            params = matchedParams;
            break;
          }

          if (!currentRoute || !params) {
            next();
            return;
          }

          const result = await currentRoute.handler({
            body: await getRequestBody(request),
            params,
            request,
            url,
          });

          response.statusCode = result.status ?? 200;
          Object.entries(result.headers ?? {}).forEach(([name, value]) => {
            response.setHeader(name, value);
          });

          if (result.body === undefined) {
            response.end();
            return;
          }

          if (!response.hasHeader("Content-Type")) {
            response.setHeader("Content-Type", "application/json; charset=utf-8");
          }
          response.end(JSON.stringify(result.body));
        } catch (error) {
          next(error);
        }
      });

      server.httpServer?.once("close", () => {
        server.watcher.off("add", reloadRoutes);
        server.watcher.off("change", reloadRoutes);
        server.watcher.off("unlink", reloadRoutes);
      });
    },
  };
}
