import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import type { Plugin } from "vite";

const MODULE_ID = "virtual:mock";
const RESOLVED_MODULE_ID = `\0${MODULE_ID}`;
const ENTRY_ID = fileURLToPath(new URL("../src/main.tsx", import.meta.url));

export default function mockServiceWorker(): Plugin {
  const worker = readFileSync(
    fileURLToPath(import.meta.resolve("msw/mockServiceWorker.js")),
  );

  return {
    name: "mock-service-worker",
    enforce: "pre",
    resolveId(id) {
      if (id === MODULE_ID) return RESOLVED_MODULE_ID;
    },
    load(id) {
      if (id !== RESOLVED_MODULE_ID) return;

      return `
        import { setupWorker } from "msw/browser";

        const handlers = Object.values(
          import.meta.glob("/mock/**/*.ts", { eager: true, import: "default" }),
        ).flat();

        export default setupWorker(...handlers);
      `;
    },
    transform(code, id) {
      if (id !== ENTRY_ID) return;

      return `
        import worker from "${MODULE_ID}";

        await worker.start({ onUnhandledRequest: "bypass" });

        ${code}
      `;
    },
    configureServer(server) {
      server.middlewares.use("/mockServiceWorker.js", (_request, response) => {
        response.setHeader("Content-Type", "text/javascript");
        response.end(worker);
      });
    },
  };
}
