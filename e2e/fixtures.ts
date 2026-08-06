import { test as base, expect, type APIRequestContext, type WorkerInfo } from '@playwright/test';

type CleanupHandler = (request: APIRequestContext) => Promise<void>;

interface CleanupTask {
  handler: CleanupHandler;
  name: string;
  priority: number;
  sequence: number;
}

export interface CleanupRegistry {
  /**
   * 注册测试数据清理任务。
   *
   * 优先级越高越先执行；相同优先级按注册顺序倒序执行。
   */
  add: (name: string, handler: CleanupHandler, priority?: number) => void;
}

interface WorkerFixtures {
  cleanup: CleanupRegistry;
}

const getBaseURL = (workerInfo: WorkerInfo) => {
  const { baseURL } = workerInfo.project.use;

  return typeof baseURL === 'string' ? baseURL : undefined;
};

export const test = base.extend<Record<never, never>, WorkerFixtures>({
  cleanup: [
    async ({ playwright }, use, workerInfo) => {
      const tasks: CleanupTask[] = [];
      const request = await playwright.request.newContext({ baseURL: getBaseURL(workerInfo) });

      await use({
        add: (name, handler, priority = 0) => {
          tasks.push({ handler, name, priority, sequence: tasks.length });
        },
      });

      const errors: Error[] = [];
      const cleanupTasks = [...tasks].sort(
        (current, next) => next.priority - current.priority || next.sequence - current.sequence,
      );
      for (const task of cleanupTasks) {
        try {
          await task.handler(request);
        } catch (cause) {
          errors.push(new Error(`清理 ${task.name} 失败`, { cause }));
        }
      }
      await request.dispose();

      if (errors.length) {
        throw new AggregateError(errors, 'E2E 测试数据清理失败');
      }
    },
    { auto: true, scope: 'worker' },
  ],
});

export { expect };
