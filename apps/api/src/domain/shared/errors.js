export class AppError extends Error {
  constructor(message, status = 500, details = undefined, code = undefined) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
    this.code = code;
  }
}

export const appError = (message, status = 400, details = undefined, code = undefined) =>
  new AppError(message, status, details, code);

export const ensure = (condition, message, status = 400, details = undefined, code = undefined) => {
  if (!condition) {
    throw appError(message, status, details, code);
  }
};

export const toErrorResponse = (error) => {
  const status = Number.isInteger(error?.status) ? error.status : 500;
  return {
    status,
    body: {
      error: {
        message: error?.message ?? 'Internal server error',
        status,
        ...(error?.code ? { code: error.code } : {}),
        ...(error?.details ? { details: error.details } : {}),
      },
    },
  };
};
