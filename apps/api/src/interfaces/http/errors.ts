export class AppError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly details?: unknown,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const toErrorResponse = (error: unknown) => {
  const candidate = error as Partial<AppError>;
  const status = Number.isInteger(candidate?.status) ? Number(candidate.status) : 500;
  return {
    status,
    body: {
      error: {
        message: candidate?.message ?? 'Internal server error',
        status,
        ...(candidate?.code ? { code: candidate.code } : {}),
        ...(candidate?.details ? { details: candidate.details } : {}),
      },
    },
  };
};
