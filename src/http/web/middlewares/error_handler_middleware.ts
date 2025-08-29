import { Response, NextFunction } from 'express';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from '@loufa/routing-controllers';
import { Service } from 'typedi';
import { logger } from '../../../core/logger';
import { httpCommonFields } from '../../../core/logger_common';
import { Request } from '../../../types/request';

/**
 * Handles errors and logs them
 */
@Service()
@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    public error(error: HttpError, request: Request, response: Response, next: NextFunction): void {
        let accessError = false;

        // @ts-ignore
        if (error.code === 'ERR_HTTP_HEADERS_SENT' || error.httpCode === 404) {
            next();
            return;
        }

        logger.error(
            `Error while processing request from ${request.ip} for ${request.url}. ` +
            `Error: ${error.name} ${error.message}`, {
            error,
            area: 'http/web',
            subarea: 'middlewares/error-handler',
            action: 'logging',
            session_id: request.sessionID,
            http_method: request.method,
            stack: error.stack,
            validation_errors: error['errors'],
            data: {
                headers: request.headers,
                query: request.query,
                body: request.body
            },
            ...httpCommonFields(request)
        });

        if (error.name === 'AccessDeniedError') {
            accessError = true;
        }

        response.status(accessError ? 403 : (error.httpCode || 500));
        response.json({
            status: 'error',
            context: ['AccessDeniedError'].includes(error.name) ? error.name : 'UNKNOWN_ERROR',
            correlationId: request.correlationId
        });
        next();
    }
}
