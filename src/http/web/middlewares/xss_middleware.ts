import { NextFunction, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from '@loufa/routing-controllers';
import { Service } from 'typedi';
import { Request } from '../../../types/request';

function sanitizeString(str: string): string {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sanitizeRequest(obj: any): any {
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    } else if (Array.isArray(obj)) {
        return obj.map(sanitizeRequest);
    } else if (typeof obj === 'object' && obj !== null) {
        const sanitizedObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                sanitizedObj[key] = sanitizeRequest(obj[key]);
            }
        }
        return sanitizedObj;
    }
    return obj;
}

@Service()
@Middleware({ type: 'before' })
export class XssMiddleware implements ExpressMiddlewareInterface {
    public use(request: Request, response: Response, next: NextFunction): any {
        // TODO: Implement whitelist-based sanitization
        // if (request.body) {
        //     request.body = sanitizeRequest(request.body);
        // }
        // if (request.query) {
        //     request.query = sanitizeRequest(request.query);
        // }
        // if (request.params) {
        //     request.params = sanitizeRequest(request.params);
        // }

        next();
    }
}
