import { router } from '@config/router';

type Search = Record<string, unknown>;
type SearchUpdater = Search | ((search: Search) => Search);

/**
 * 跳转到目标页面，并在浏览器历史记录中新增一条记录。
 *
 * @param path 目标页面地址。
 * @param search URL 查询参数或查询参数更新函数。
 */
export const onHistoryChange = (path: string, search?: SearchUpdater) => {
  router.navigate({ to: path, search });
};

/**
 * 跳转到目标页面，并替换当前浏览器历史记录。
 *
 * @param path 目标页面地址。
 * @param search URL 查询参数或查询参数更新函数。
 */
export const onHistoryReplace = (path: string, search?: SearchUpdater) => {
  router.navigate({ to: path, search, replace: true });
};

/**
 * 返回上一条浏览器历史记录；没有可返回记录时跳转到兜底页面。
 *
 * @param defaultPath 没有可返回记录时使用的兜底页面地址。
 */
export const onHistoryBack = (defaultPath: string) => {
  if (router.history.canGoBack()) {
    router.history.back();
  } else {
    router.navigate({ to: defaultPath, replace: true });
  }
};

/**
 * 在新的浏览器标签页中打开目标页面。
 *
 * @param path 目标页面地址。
 */
export const onOpenTab = (path: string) => {
  window.open(path, '_blank', 'noopener,noreferrer');
};
