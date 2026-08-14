import type { IncomingMessage } from 'node:http';
import type { MockResponse } from '../plugins/mock';
import { roles, tokens, users, type MockUser } from './database';

type Authorization =
  | { authorized: true; user: MockUser }
  | { authorized: false; response: MockResponse<API.ErrorResult> };

export const createSuccess = <T>(data: T, status = 200): MockResponse<API.SuccessResult<T>> => ({
  body: { success: true, data },
  status,
});

export const createError = (
  errorMessage: string,
  status = 200,
  errorType: API.ErrorResult['errorType'] = 'WARNING',
): MockResponse<API.ErrorResult> => ({
  body: {
    success: false,
    errorCode: String(status),
    errorType,
    errorMessage,
  },
  status,
});

const getRequestToken = (request: IncomingMessage) => {
  const authorization = request.headers.authorization;

  return authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
};

export const getCurrentMockUser = (request: IncomingMessage) => {
  const token = getRequestToken(request);
  const userId = token ? tokens.get(token) : undefined;

  return users.find((user) => user.userId === userId && user.status === 'enabled');
};

export const createUnauthorized = (request: IncomingMessage): MockResponse<API.ErrorResult> => {
  const referer = request.headers.referer;
  let redirect = '/';

  if (referer) {
    const url = new URL(referer);
    redirect = `${url.pathname}${url.search}`;
  }

  return {
    body: {
      success: false,
      errorCode: '401',
      errorMessage: '登录状态已失效，请重新登录',
      data: `/login?redirect=${encodeURIComponent(redirect)}`,
    },
    status: 401,
  };
};

export const authorize = (
  request: IncomingMessage,
  permission?: string | string[],
): Authorization => {
  const user = getCurrentMockUser(request);
  if (!user) return { authorized: false, response: createUnauthorized(request) };

  if (permission) {
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    const permissionCodes = roles
      .filter(({ uuid }) => user.roleUuids.includes(uuid))
      .flatMap(({ permissionCodes }) => permissionCodes);

    if (
      !permissionCodes.includes('*') &&
      !requiredPermissions.some((requiredPermission) =>
        permissionCodes.includes(requiredPermission),
      )
    ) {
      return { authorized: false, response: createError('暂无访问权限', 403) };
    }
  }

  return { authorized: true, user };
};

export const getRequestTokenValue = getRequestToken;
