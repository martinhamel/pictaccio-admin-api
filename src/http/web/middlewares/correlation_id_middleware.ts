import { randomUUID } from 'crypto';
import { NextFunction, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from '@loufa/routing-controllers';
import { Service } from 'typedi';
import { Request } from '../../../types/request';

/**
 * This logs all the requests the application handles
 */
@Service()
@Middleware({ type: 'before' })
export class LoggingHandlerMiddleware implements ExpressMiddlewareInterface {
    public use(request: Request, response: Response, next: NextFunction): any {
        request.correlationId = randomUUID();
        next();
    }
}
