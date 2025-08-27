import { randomUUID } from 'crypto';
import express, { json, urlencoded } from 'express';
import fileUploads from 'express-fileupload';
import session from 'express-session';
// import { promises as fsPromises } from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Container } from 'typedi';
import { Action, OwnershipChecker, useExpressServer } from '@loufa/routing-controllers';
import { LoaderInterface } from '@pictaccio/admin-api/bootstrap';
import { Collection } from '@pictaccio/admin-api/core/collection';
import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import { logger } from '@pictaccio/admin-api/core/logger';
import { User } from '@pictaccio/shared/src/types/user';
import { View } from '@pictaccio/admin-api/http/web/views/view';
import cors from 'cors';

type Operation = 'create:any' | 'read:any' | 'update:any' | 'delete:any' |
    'create:own' | 'read:own' | 'update:own' | 'delete:own';

function makeOperationString(operation: string, own: boolean): Operation {
    return (operation.indexOf('.') === -1
        ? operation += own ? ':own' : ':any'
        : operation.replace('.', ':')) as Operation;
}

const MAX_BODY_SIZE = '200mb';
const FILE_SIZE_LIMIT = 200 * 1024 * 1024;

export const expressLoader: LoaderInterface = async (): Promise<any> => {
    const config = Container.get<ConfigSchema>('config');
    const auth = Container.get<any>('auth');
    const rbac = Container.has('rbac') ? Container.get<any>('rbac') : undefined;
    const app = express();
    const server = createServer({
        //     key: await fsPromises.readFile('../test.key'),
        //     cert: await fsPromises.readFile('../test.crt')
    }, app);
    const sessionMiddleware = session({
        secret: config.http.servers.web.sessionSecret,
        resave: false,
        name: 'lid',
        saveUninitialized: true,
        rolling: true,
        cookie: { secure: config.env.production },
        store: Container.get('backstore')/*,
        genid(request: express.Request): string {
            if (request.query && request.query['cookie']) {
                return request.query['cookie'] as string;
            }

            return randomUUID();
        }*/
    });
    const socketio = new Server(server, {
        path: '/channel/',
        cors: {
            origin: true,
            credentials: true
        }
    });

    Container.set('socket-io', socketio);

    socketio.engine.use(sessionMiddleware);

    logger.debug('Initializing express', {
        area: 'loaders',
        subarea: 'express',
        action: 'loading'
    });

    app.disable('x-powered-by');

    // Load middlewares
    app.use(cors({
        origin: true,
        credentials: true
    }));
    app.use(express.static(config.env.dirs.public));
    app.use(urlencoded({ extended: true, limit: MAX_BODY_SIZE }));
    app.use(fileUploads({
        createParentPath: true,
        safeFileNames: true,
        preserveExtension: true,
        parseNested: true,
        limits: { fileSize: FILE_SIZE_LIMIT }
    }));

    app.use(sessionMiddleware);
    //app.use(json);

    useExpressServer(app, {
        cors: {
            origin: true,
            credentials: true
        },
        classTransformer: true,
        routePrefix: config.http.servers.web.prefix,
        defaultErrorHandler: false,
        validation: {
            forbidUnknownValues: false
        },
        viewClass: View,

        authorizationChecker: async (action: Action,
            roles: string[],
            ownershipChecker: OwnershipChecker): Promise<boolean> => {
            const token = action.request.headers['authorization']?.substring(7);
            const user = await auth.userFromToken(token);

            if (!await auth.validateAuthentication(token)) {
                logger.info(`Checking authorization for resource '${roles.join(' ')}', but user isn't authenticated.`, {
                    area: 'loaders',
                    subarea: 'express',
                    action: 'user:checking-authorization',
                    result: 'failed',
                    context: 'not-authenticated',
                    resource_name: action.request.url,
                    src_user_email: user?.email,
                    src_user_id: user?.id,
                    src_user_roles: user?.roles
                });
                return false;
            }

            if (user) {
                const ownsTargetResource = typeof ownershipChecker === 'function'
                    ? await ownershipChecker(action, user)
                    : false;

                action.request.user = user;

                if (!roles.length) {
                    logger.info(`Checking authorization, allowing because user is ` +
                        `authenticated and no roles were requested`, {
                        area: 'loaders',
                        subarea: 'express',
                        action: 'user:checking-authorization',
                        result: 'success',
                        context: 'authenticated-no-roles',
                        resource_name: action.request.url,
                        src_user_email: user?.email,
                        src_user_id: user?.id,
                        src_user_roles: user?.roles
                    });
                    return true;
                }

                if (!rbac) {
                    logger.info(`Checking authorization, allowing because the RBAC services isn't loaded`, {
                        area: 'loaders',
                        subarea: 'express',
                        action: 'user:checking-authorization',
                        result: 'success',
                        context: 'has-roles-but-no-rbac',
                        resource_name: action.request.url,
                        src_user_email: user?.email,
                        src_user_id: user?.id,
                        src_user_roles: user?.roles
                    });
                    return true;
                }

                const permissions = roles
                    .map(role => {
                        const [operation, resource] = role.split(':');
                        return { operation, resource };
                    })
                    .map(role => rbac.can(
                        user.roles,
                        makeOperationString(role.operation, ownsTargetResource), role.resource))
                    .filter(permission => permission.granted);
                const granted = permissions.length !== 0;

                action.request.permissions = permissions;

                if (granted) {
                    logger.info(`Checking authorization, allowing because user is ` +
                        `authenticated and and their roles allow access to '${roles.join(' ')}'`, {
                        area: 'loaders',
                        subarea: 'express',
                        action: 'user:checking-authorization',
                        result: 'success',
                        context: 'has-permission',
                        resource_name: action.request.url,
                        src_user_email: user?.email,
                        src_user_id: user?.id,
                        src_user_roles: user?.roles
                    });
                } else {
                    logger.info(`Checking authorization, denying because user is ` +
                        `authenticated but their roles doesn't allow access to '${roles.join(' ')}'`, {
                        area: 'loaders',
                        subarea: 'express',
                        action: 'user:checking-authorization',
                        result: 'failed',
                        context: 'missing-permission',
                        resource_name: action.request.url,
                        src_user_email: user?.email,
                        src_user_id: user?.id,
                        src_user_roles: user?.roles
                    });
                }
                return granted;
            }

            return false;
        },

        currentUserChecker: async (action: Action): Promise<User> => {
            const token = action.request.headers['authorization']?.substring(7);

            return auth.userFromToken(token);
        },

        controllers: [config.http.servers.web.dirs.controllers],
        middlewares: [config.http.servers.web.dirs.middlewares],
        interceptors: [config.http.servers.web.dirs.interceptors]
    });

    // Load validators
    (new Collection(config.http.servers.web.dirs.validators, { filter: /.*\.js$/ }))
        .on('ready', collection => collection.importAll());

    // Load decorators
    (new Collection(config.http.servers.web.dirs.validators, { filter: /.*\.js$/ }))
        .on('ready', collection => collection.importAll());

    // Load production settings
    if (config.env.production) {
        app.set('trust proxy', 1);
    }

    logger.info(`Web http listening on ${config.http.servers.web.interface}:${config.http.servers.web.listen}`, {
        area: 'loaders',
        subarea: 'express',
        action: 'http:listen',
        interface: config.http.servers.web.interface,
        port: config.http.servers.web.listen
    });
    //app.listen(config.server.listen, config.server.interface);
    server.listen(config.http.servers.web.listen, config.http.servers.web.interface);

    Container.set('express.app', app);
};
