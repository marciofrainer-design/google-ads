"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../config/logger");
/** Extrai uma mensagem legível de qualquer tipo de erro (Error, gRPC, objeto). */
function extractMessage(err) {
    if (err instanceof Error)
        return err.message;
    if (typeof err === 'object' && err !== null) {
        const e = err;
        if (typeof e['details'] === 'string')
            return e['details'];
        if (typeof e['message'] === 'string')
            return e['message'];
        return JSON.stringify(e);
    }
    return String(err);
}
function errorHandler(err, _req, res, _next) {
    const message = extractMessage(err);
    const statusCode = err.statusCode || 500;
    // Não expõe stack trace em produção (OWASP A6)
    logger_1.logger.error(message, { code: err.code, stack: err.stack });
    res.status(statusCode).json({
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: process.env.NODE_ENV === 'production' && statusCode === 500
                ? 'Erro interno do servidor'
                : message,
        },
    });
}
//# sourceMappingURL=errorHandler.js.map