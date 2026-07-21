declare namespace API {
  interface SuccessResult<T> {
    success: true;
    data: T;
  }

  interface ErrorResult {
    success: false;
    errorCode?: string;
    errorType?: "ERROR" | "WARNING";
    errorMessage?: string;
    data?: unknown;
  }

  type Result<T> = SuccessResult<T> | ErrorResult;

  interface PageResult<T> {
    list: T[];
    total: number;
  }
}
