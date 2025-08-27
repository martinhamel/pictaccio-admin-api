import { NextFunction, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from '@loufa/routing-controllers';
import { Service } from 'typedi';
import { Request } from '@pictaccio/admin-api/types/request';

@Service()
@Middleware({ type: 'before' })
export class CacheControlMiddleware implements ExpressMiddlewareInterface {
    public use(request: Request, response: Response, next: NextFunction): any {
        response.setHeader('Cache-Control', 'no-store');
        next();
    }
}
