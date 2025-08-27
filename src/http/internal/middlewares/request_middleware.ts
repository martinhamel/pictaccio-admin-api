import { ExpressMiddlewareInterface, Middleware } from '@loufa/routing-controllers';
import { AsyncStoreService } from '@pictaccio/admin-api/services/async_store_service';
import { Request } from '@pictaccio/admin-api/types/request';
import { NextFunction, Response } from 'express';
import { Inject, Service } from 'typedi';

@Service()
@Middleware({ type: 'before', priority: 0 })
export class RequestMiddleware implements ExpressMiddlewareInterface {
    constructor(@Inject('async-store') private asyncStore: AsyncStoreService) {
    }

    public use(request: Request, response: Response, next: NextFunction): any {
        this.asyncStore.init();
        this.asyncStore.set('requestInternal', request);

        request.timestamp = new Date();

        next();
    }
}
