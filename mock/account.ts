import { setTimeout as delay } from "node:timers/promises";
import type { MockContext, MockRoute } from "../plugins/mock";

export default [
  {
    method: "POST",
    path: `/api/login`,
    handler: async ({ body }: MockContext<API.LoginParams>) => {
      await delay(300);

      if (body.account !== "admin" || body.password !== "123456") {
        return {
          body: {
            success: false,
            errorType: "WARNING",
            errorMessage: "账号或密码错误",
          },
        };
      }

      return {
        body: {
          success: true,
          data: { token: crypto.randomUUID() },
        },
      };
    },
  },
] satisfies MockRoute[];
