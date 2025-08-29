import { Action, OwnershipChecker, useExpressServer } from '@loufa/routing-controllers';
import { LoaderInterface } from '../bootstrap';
import { Collection } from '../core/collection';
import { ConfigSchema } from '../core/config_schema';
import { logger } from '../core/logger';
import express, { json } from 'express';
// import { promises as fsPromises } from 'fs';
import { createServer } from 'http';
import { Container } from 'typedi';

type Operation = 'create:any' | 'read:any' | 'update:any' | 'delete:any' |
    'create:own' | 'read:own' | 'update:own' | 'delete:own';

function makeOperationString(operation: string, own: boolean): Operation {
    return (operation.indexOf('.') === -1
        ? operation += own ? ':own' : ':any'
        : operation.replace('.', ':')) as Operation;
}

const MAX_BODY_SIZE = '200mb';
const FILE_SIZE_LIMIT = 200 * 1024 * 1024;

export const expressInternalLoader: LoaderInterface = async (): Promise<any> => {
    const config = Container.get<ConfigSchema>('config');
    const app = express();
    const server = createServer({
        //     key: await fsPromises.readFile('../test.key'),
        //     cert: await fsPromises.readFile('../test.crt')
    }, app);

    logger.debug('Initializing express', {
        area: 'loaders',
        subarea: 'express-internal',
        action: 'loading'
    });

    app.disable('x-powered-by');

    // Load middlewares
    app.use(json({ limit: MAX_BODY_SIZE }));

    useExpressServer(app, {
        classTransformer: true,
        routePrefix: config.http.servers.internal.prefix,
        defaultErrorHandler: true,
        validation: {
            forbidUnknownValues: false
        },

        authorizationChecker: async (action: Action,
            roles: string[],
            ownershipChecker: OwnershipChecker): Promise<boolean> => {
            return true;
        },

        controllers: [config.http.servers.internal.dirs.controllers],
        middlewares: [config.http.servers.internal.dirs.middlewares],
        interceptors: [config.http.servers.internal.dirs.interceptors]
    });

    // Load validators
    (new Collection(config.http.servers.internal.dirs.validators, { filter: /.*\.js$/ }))
        .on('ready', collection => collection.importAll());

    // Load decorators
    (new Collection(config.http.servers.internal.dirs.validators, { filter: /.*\.js$/ }))
        .on('ready', collection => collection.importAll());

    // Load production settings
    if (config.env.production) {
        app.set('trust proxy', 1);
    }

    logger.info(
        `Internal http listening on ${config.http.servers.internal.interface}:${config.http.servers.internal.listen}`, {
        area: 'loaders',
        subarea: 'express-internal',
        action: 'http:listen',
        interface: config.http.servers.internal.interface,
        port: config.http.servers.internal.listen
    });
    //app.listen(config.server.listen, config.server.interface);
    server.listen(config.http.servers.internal.listen, config.http.servers.internal.interface);
};
