import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string | number;
  details?: string;
}

/** Extrai uma mensagem legível de qualquer tipo de erro (Error, gRPC, objeto). */
function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e['details'] === 'string') return e['details'];
    if (typeof e['message'] === 'string') return e['message'];
    return JSON.stringify(e);
  }
  return String(err);
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const message = extractMessage(err);
  const statusCode = err.statusCode || 500;

  // Não expõe stack trace em produção (OWASP A6)
  logger.error(message, { code: err.code, stack: err.stack });

  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production' && statusCode === 500
          ? 'Erro interno do servidor'
          : message,
    },
  });
}
