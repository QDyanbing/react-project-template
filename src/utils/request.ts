import { emitMessage } from "@/utils/message";

type RequestOptions = Omit<RequestInit, "body" | "method"> & {
  skipErrorHandler?: boolean;
};

type RequestErrorOptions = {
  cause?: unknown;
  data?: unknown;
  level?: "warning" | "error";
  redirect?: string;
  status?: number;
};

export class RequestError extends Error {
  data?: unknown;
  level: "warning" | "error";
  redirect?: string;
  status?: number;

  constructor(message: string, options: RequestErrorOptions) {
    super(message, { cause: options.cause });
    this.name = "RequestError";
    this.data = options.data;
    this.level = options.level ?? "error";
    this.redirect = options.redirect;
    this.status = options.status;
  }
}

function getResponseMessage(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "errorMessage" in data &&
    typeof data.errorMessage === "string"
  ) {
    return data.errorMessage;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return undefined;
}

function getResponseRedirect(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "data" in data &&
    typeof data.data === "string"
  ) {
    return data.data;
  }

  return undefined;
}

async function parseResponse(response: Response) {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  if (response.headers.get("content-type")?.includes("json")) {
    return JSON.parse(text);
  }

  return text;
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

function getStatusMessage(status: number) {
  if (status === 401) return "登录状态已失效，请重新登录";
  if (status === 403) return "暂无访问权限";
  if (status === 404) return "请求的资源不存在";
  if (status >= 500) return "服务异常，请稍后重试";

  return `请求失败（${status}）`;
}

function createHttpError(
  response: Response,
  data: unknown,
  cause?: unknown,
) {
  const status = response.status;
  let redirect: string | undefined;
  let level: "warning" | "error" = "error";

  if (status === 401) {
    redirect = getResponseRedirect(data);
  }

  if (status === 403) {
    level = "warning";
  }

  return new RequestError(getResponseMessage(data) ?? getStatusMessage(status), {
    cause,
    data,
    level,
    redirect,
    status,
  });
}

function createBusinessError(data: unknown) {
  if (
    typeof data !== "object" ||
    data === null ||
    !("success" in data) ||
    data.success !== false
  ) {
    return undefined;
  }

  let errorCode = NaN;
  if ("errorCode" in data) {
    errorCode = Number.parseInt(String(data.errorCode), 10);
  }

  let redirect: string | undefined;
  if (errorCode === 401) {
    redirect = getResponseRedirect(data);
  } else if (errorCode >= 300 && errorCode < 400) {
    redirect = getResponseRedirect(data);
  }

  let level: "warning" | "error" = "error";
  if ("errorType" in data && data.errorType === "WARNING") {
    level = "warning";
  }

  let content = getResponseMessage(data);
  if (!content && !Number.isNaN(errorCode)) {
    content = getStatusMessage(errorCode);
  }
  if (!content && level === "warning") content = "请求未完成";
  if (!content) content = "系统异常，请稍后重试";

  let status: number | undefined;
  if (!Number.isNaN(errorCode)) status = errorCode;

  return new RequestError(content, {
    data,
    level,
    redirect,
    status,
  });
}

function isSuccessResult(data: unknown): data is API.SuccessResult<unknown> {
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    data.success === true &&
    "data" in data
  );
}

function handleGlobalError(error: RequestError) {
  if (error.redirect) {
    const currentPath = `${location.pathname}${location.search}`;

    if (currentPath !== error.redirect) {
      location.replace(error.redirect);
      return;
    }
  }

  emitMessage(error.level, error.message);
}

function appendSearchParams(url: string, data: unknown) {
  if (typeof data !== "object" || data === null) return url;

  const [path = "", hash] = url.split("#", 2);
  const [pathname = "", search] = path.split("?", 2);
  const searchParams = new URLSearchParams(search);

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
    } else {
      searchParams.set(key, String(value));
    }
  });

  let result = pathname;
  const query = searchParams.toString();

  if (query) result += `?${query}`;
  if (hash) result += `#${hash}`;

  return result;
}

async function send<TData, TResult>(
  method: string,
  url: string,
  data?: TData,
  options: RequestOptions = {},
): Promise<API.SuccessResult<TResult> | undefined> {
  const { skipErrorHandler = false, ...init } = options;
  const headers = new Headers(init.headers);
  const token = localStorage.getItem("token");
  let requestUrl = url;

  if (method === "GET") requestUrl = appendSearchParams(url, data);

  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body: BodyInit | undefined;
  if (method !== "GET" && data !== undefined) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    body = JSON.stringify(data);
  }

  try {
    const response = await fetch(requestUrl, {
      ...init,
      body,
      headers,
      method,
    });
    let result: unknown;

    try {
      result = await parseResponse(response);
    } catch (error) {
      if (!response.ok) {
        throw createHttpError(response, undefined, error);
      }

      throw error;
    }

    if (!response.ok) {
      throw createHttpError(response, result);
    }

    const businessError = createBusinessError(result);
    if (businessError) throw businessError;

    if (!isSuccessResult(result)) {
      throw new RequestError("响应数据格式错误", { data: result });
    }

    return result as API.SuccessResult<TResult>;
  } catch (error) {
    if (isAbortError(error)) {
      if (!skipErrorHandler) return undefined;
      throw error;
    }

    let requestError: RequestError;
    if (error instanceof RequestError) {
      requestError = error;
    } else {
      let content = "网络异常，请稍后重试";
      if (error instanceof SyntaxError) content = "响应数据格式错误";

      requestError = new RequestError(content, { cause: error });
    }

    if (!skipErrorHandler) {
      handleGlobalError(requestError);
      return undefined;
    }

    throw requestError;
  }
}

export default {
  get<TData, TResult>(
    url: string,
    data?: TData,
    options?: RequestOptions,
  ) {
    return send<TData, TResult>("GET", url, data, options);
  },
  post<TData, TResult>(
    url: string,
    data?: TData,
    options?: RequestOptions,
  ) {
    return send<TData, TResult>("POST", url, data, options);
  },
  put<TData, TResult>(
    url: string,
    data?: TData,
    options?: RequestOptions,
  ) {
    return send<TData, TResult>("PUT", url, data, options);
  },
  delete<TData, TResult>(
    url: string,
    data?: TData,
    options?: RequestOptions,
  ) {
    return send<TData, TResult>("DELETE", url, data, options);
  },
};
