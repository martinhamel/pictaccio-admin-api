import { Middleware, ExpressMiddlewareInterface } from '@loufa/routing-controllers';
import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import { NextFunction, Response } from 'express';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Inject, Service } from 'typedi';
import { Request } from '@pictaccio/admin-api/types/request';
import { logger } from '@pictaccio/admin-api/core/logger';
import { httpCommonFields } from '@pictaccio/admin-api/core/logger_common';

/**
 * Not found middleware. Needs to be loaded last, hence the Z. This will ensure that the request is properly answered
 * with a 404 in the event no action was found matching the requested url
 */
@Service()
@Middleware({ type: 'after' })
export class ZNotFoundMiddleware implements ExpressMiddlewareInterface {
    constructor(@Inject('config') private config: ConfigSchema) {
    }

    public async use(request: Request, response: Response, next: NextFunction): Promise<void> {
        let isPublicFile = false;

        try {
            isPublicFile =
                await fs.stat(join(this.config.http.servers.web.dirs.public.onDisk, request.url)) !== undefined;
        } catch (e) {
            // Pass
        }

        if (!isPublicFile && !response.headersSent) {
            logger.error(
                `Not found error while processing request ${request.url} from ${request.ip} `, {
                area: 'http/web',
                subarea: 'middlewares/not-found',
                action: 'logging',
                session_id: request.session.id,
                data: {
                    headers: request.headers,
                    query: request.query,
                    body: request.body
                },
                ...httpCommonFields(request)
            });

            response
                .status(404)
                .json({
                    status: 'error',
                    context: 'not-found',
                    correlationId: request.correlationId
                });
            response.end();
        } else if (isPublicFile) {
            // We've made sure the file exist on the file system so we can proceed
            next();
        }
    }
}
