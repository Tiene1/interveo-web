/** Enveloppe d'erreur du backend (HttpExceptionFilter global). */
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  method: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody | undefined,
  ) {
    super(body?.message ?? `Erreur API (${status})`);
    this.name = "ApiError";
  }
}
