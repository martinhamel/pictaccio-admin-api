import { join } from 'node:path';
import { ConfigSchema } from './core/config_schema';
import { formatPEMString, getApiServerVersion } from './core/utils';
import * as process from 'process';

const ROOT_DIR = process.env.ROOT_DIR ?? __dirname;
const featureFlags = {
    _debugDbMetrics: 'FF_DEBUG_DB_METRICS' in process.env,
    subjectCodeDupeValidation: 'FF_SUBJECT_CODE_DUPE_VALIDATION' in process.env
};

let version = '';

export const config: ConfigSchema = {
    env: {
        get version() {
            return version;
        },
        environment: process.env.NODE_ENV,
        instanceId: process.env.INSTANCE_ID,
        production: process.env.NODE_ENV === 'production',
        rootUrl: {
            api: (process.env.ROOT_URL_API ?? '').trim(),
            gui: (process.env.ROOT_URL_GUI ?? '').trim(),
            transactional: (process.env.ROOT_URL_TRANSACTIONAL ?? '').trim()
        },
        corsOrigins: (process.env.CORS_ORIGINS ?? '').split(',').map((origin) => origin.trim()),
        debug: process.env.NODE_ENV === 'debug',
        firstUserFirstName: process.env.FIRST_USER_FIRST_NAME,
        firstUserLastName: process.env.FIRST_USER_LAST_NAME,
        firstUserEmail: process.env.FIRST_USER_EMAIL,
        dirs: {
            locales: join(__dirname, 'locales/{{lng}}/{{ns}}.yaml'),
            jobs: join(__dirname, 'jobs'),
            public: join(ROOT_DIR, 'public'),
            root: __dirname,
            services: join(__dirname, 'services')
        }
    },

    app: {
        name: 'admin-api',
        locale: 'en',
        contactUs: {
            to: 'hello@server.tld',
            from: process.env.APP_EMAIL_FROM
        },
        db: {
            codeExpiryTimeInHour: 24
        },
        dirs: {
            thumbnails: join(ROOT_DIR, 'public', 'thumbs'),
            sessionPhotos: join(ROOT_DIR, 'public', 'photos'),
            backgrounds: join(ROOT_DIR, 'public', 'backgrounds'),
            branding: join(ROOT_DIR, 'public', 'branding'),
            products: join(ROOT_DIR, 'public', 'products'),
            users: join(ROOT_DIR, 'public', 'users')
        },
        email: {
            from: process.env.APP_EMAIL_FROM
        },
        files: {
            watermarkImage: join(ROOT_DIR, 'public', 'watermark.png'),
            logoImage: join(ROOT_DIR, 'public', 'logo.png')
        },
        logging: {
            httpHost: process.env.APP_LOGGING_HTTP_HOST,
            httpPort: Number(process.env.APP_LOGGING_HTTP_PORT),
            httpToken: process.env.APP_LOGGING_HTTP_TOKEN
        },
        password: {
            policy: {
                symbols: 1,
                lowercase: 1,
                uppercase: 1,
                numbers: 1,
                minLength: 12,
                maxLength: 150
            }
        },
        photos: {
            thumbnails: {
                medium: {
                    portraitSize: 400,
                    landscapeSize: 500
                }
            }
        }
    },

    locales: {
        supported: [
            'en',
            'fr'
        ],
        fallbacks: {
            lang: 'en'
        }

    },

    http: {
        servers: {
            web: {
                interface: '0.0.0.0',
                listen: 3000,
                prefix: undefined,
                dirs: {
                    controllers: join(__dirname, 'http/web/controllers') + '/*_controller*',
                    middlewares: join(__dirname, 'http/web/middlewares') + '/*_middleware*',
                    interceptors: join(__dirname, 'http/web/interceptors') + '/*_interceptor*',
                    validators: join(__dirname, 'http/shared/validators/'),
                    decorators: join(__dirname, 'http/shared/decorators/'),
                    templates: join(__dirname, 'http/web/views/templates/'),
                    helpers: join(__dirname, 'http/web/views/helpers/'),
                    partials: join(__dirname, 'http/web/views/templates/partials/'),
                    public: {
                        onDisk: join(__dirname, 'public'),
                        img: '/img',
                        script: '/js',
                        css: '/css'
                    }
                },
                sessionSecret: 'CHANGE ME',
                sessionTTL: 3600
            },
            internal: {
                interface: process.env.HTTP_INTERNAL_INTERFACE,
                listen: Number(process.env.HTTP_INTERNAL_PORT),
                prefix: undefined,
                dirs: {
                    controllers: join(__dirname, 'http/internal/controllers') + '/*_controller*',
                    middlewares: join(__dirname, 'http/internal/middlewares') + '/*_middleware*',
                    interceptors: join(__dirname, 'http/internal/interceptors') + '/*_interceptor*',
                    validators: join(__dirname, 'http/shared/validators/'),
                    decorators: join(__dirname, 'http/shared/decorators/')
                },
                sessionSecret: 'CHANGE ME',
                sessionTTL: 3600
            }
        }
    },

    rpc: {
        clients: {
            imageService: {
                host: process.env.RPC_IMAGE_SERVICE_HOST,
                port: Number(process.env.RPC_IMAGE_SERVICE_PORT)
            }
        },
        servers: {
            apiService: {
                interface: process.env.RPC_API_SERVICE_SERVER_INTERFACE,
                listen: Number(process.env.RPC_API_SERVICE_SERVER_PORT)
            }
        }
    },

    saml: {
        serviceProviderEntityId: process.env.SAML_ENTITY_ID,
        serviceProviderPrivateKey: formatPEMString(process.env.SAML_PRIVATE_KEY),
        serviceProviderCertificate: formatPEMString(process.env.SAML_CERTIFICATE),
        serviceProviderAssertEndpoint: process.env.SAML_ASSERT_ENDPOINT,
        identityProviderLoginURL: process.env.SAML_IDP_LOGIN_URL,
        identityProviderLogoutURL: process.env.SAML_IDP_LOGOUT_URL,
        identityProviderCertificates: [formatPEMString(process.env.SAML_IDP_CERT1),
        formatPEMString(process.env.SAML_IDP_CERT2)]
    },

    sendgrid: {
        apikey: process.env.SENDGRID_APIKEY
    },

    db: [{
        name: 'default',
        type: process.env.DB_TYPE,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE_NAME,
        schema: 'public',
        synchronize: false,
        logging: true,
        entitiesDir: [join(__dirname, 'database/entities') + '/*'],
        migrationsDir: [join(__dirname, 'database/migrations') + '/*'],
        subscribersDir: [join(__dirname, 'database/subscribers') + '/*_subscriber*']
    }],

    redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        tls: false
    },

    auth: {
        secret: process.env.AUTH_SECRET,
        resourceSecret: process.env.AUTH_RESOURCE_SECRET,
        resourceTokenDefaultExpiry: 86400
    },

    scheduler: {
        concurrency: 2,
        jobs: [
            { name: 'model_admin_reset_gc', timing: '0 * * * *' }, // Every hour
            { name: 'model_admin_invite_gc', timing: '0 * * * *' }, // Every hour
            //{name: 'missing_product_theme_image', timing: '0,15,30,45 * * * *'}, // Every 15 minutes
            { name: 'process_expired_sessions', timing: '0 0 * * *' }, // Every day
            { name: 'compile_background_stats', timing: '0 0,6,12,18 * * *' }, // Every 6 hours
            { name: 'compile_sales_stats', timing: '0 0,6,12,18 * * *' } // Every 6 hours
        ]
    },

    roles: {
        get list(): string[] { return Object.keys(config.roles.capabilities); },
        capabilities: {
            'super-admin': {
                'debug': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'account': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'background': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'campaign': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'store-config': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'order': { 'create:any': [], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'order-comment': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'order-publish': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'product': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'session': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'shipping': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'user-info': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'session-versions': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'report': { 'create:any': [], 'read:any': ['*'], 'update:any': [], 'delete:any': [] }
            },
            'admin': {
                'account': { 'create:any': [], 'read:any': ['assignable'], 'update:own': ['*'], 'delete:any': [] },
                'background': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'campaign': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'store-config': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'order': { 'create:any': [], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'order-comment': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'order-publish': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'product': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'session': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'session-versions': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'shipping': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'user-info': { 'create:any': [], 'read:any': ['*'], 'update:own': ['*'], 'delete:any': [] },
                'report': { 'create:any': [], 'read:any': ['*'], 'update:any': [], 'delete:any': [] }
            },
            'customer-service': {
                'account': { 'create:any': [], 'read:any': ['assignable'], 'update:own': ['*'], 'delete:any': [] },
                'order': { 'create:any': [], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'order-comment': { 'create:any': ['*'], 'read:any': ['*'], 'update:own': ['*'], 'delete:own': ['*'] },
                'order-publish': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'session': { 'create:any': [], 'read:any': ['*'], 'update:any': [], 'delete:any': [] },
                'session-versions': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'shipping': { 'create:any': [], 'read:any': ['*'], 'update:any': [], 'delete:any': [] },
                'user-info': { 'create:own': ['*'], 'read:any': ['*'], 'update:own': ['*'], 'delete:own': [] }
            },
            'product-manager': {
                'account': { 'create:any': [], 'read:own': ['*'], 'update:own': ['*'], 'delete:any': [] },
                'background': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'product': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'user-info': { 'create:own': ['*'], 'read:any': ['*'], 'update:own': ['*'], 'delete:own': [] },
                'session': { 'create:any': [], 'read:any': ['*'], 'update:any': [], 'delete:any': [] }
            },
            'production-manager': {
                'account': { 'create:any': [], 'read:any': ['assignable'], 'update:own': ['*'], 'delete:any': [] },
                'order': { 'create:any': [], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'order-comment': { 'create:any': ['*'], 'read:any': ['*'], 'update:own': ['*'], 'delete:own': ['*'] },
                'order-publish': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'user-info': { 'create:own': ['*'], 'read:any': ['*'], 'update:own': ['*'], 'delete:own': [] },
                'session': { 'create:any': [], 'read:any': ['*'], 'update:any': [], 'delete:any': [] },
                'session-versions': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*'] },
                'shipping': { 'create:any': [], 'read:any': ['*'], 'update:any': [], 'delete:any': [] },
            },
            'report-viewer': {
                'account': { 'create:any': [], 'read:own': ['*'], 'update:own': ['*'], 'delete:any': [] },
                'user-info': { 'create:own': ['*'], 'read:any': ['*'], 'update:own': ['*'], 'delete:own': [] },
                'report': { 'create:any': [], 'read:any': ['*'], 'update:any': [], 'delete:any': [] }
            },
            'session-manager': {
                'account': { 'create:any': [], 'read:own': ['*'], 'update:own': ['*'], 'delete:any': [] },
                'product': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'session': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'shipping': { 'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': [] },
                'user-info': { 'create:own': ['*'], 'read:any': ['*'], 'update:own': ['*'], 'delete:own': [] }
            }
        }
    },

    featureFlags
};

(async function () {
    version = await getApiServerVersion();
}());
