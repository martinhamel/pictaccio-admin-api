import { Language } from "@pictaccio/shared/types/language";

export interface ConfigSchema {
    env: {
        version: string,
        environment: string,
        instanceId: string,
        production: boolean,
        rootUrl: {
            api: string;
            gui: string;
            transactional: string;
        },
        corsOrigins: string[],
        debug: boolean,
        firstUserFirstName: string,
        firstUserLastName: string,
        firstUserEmail: string,
        dirs: {
            locales: string,
            jobs: string,
            public: string,
            root: string,
            services: string
        }
    },

    app: {
        name: string,
        locale: string,
        contactUs: {
            to: string,
            from: string
        },
        db: {
            codeExpiryTimeInHour: number
        },
        dirs: {
            thumbnails: string,
            sessionPhotos: string,
            backgrounds: string,
            branding: string,
            products: string,
            users: string
        },
        email: {
            from: string
        },
        files: {
            watermarkImage: string
            logoImage: string
        },
        logging: {
            httpHost: string,
            httpPort: number,
            httpToken: string
        },
        password: {
            policy: {
                symbols: number,
                lowercase: number,
                uppercase: number,
                numbers: number,
                minLength: number,
                maxLength: number
            }
        },
        photos: {
            thumbnails: {
                medium: {
                    portraitSize: number,
                    landscapeSize: number
                }
            }
        }
    },

    locales: {
        supported: Language[],
        fallbacks: {
            lang: Language
        },
    },

    http: {
        servers?: {
            [key: string]: {
                interface: string,
                listen: number,
                prefix: undefined | string,
                dirs: {
                    controllers: string,
                    middlewares: string,
                    interceptors: string,
                    validators: string,
                    decorators: string
                    templates?: string,
                    helpers?: string,
                    partials?: string,
                    public?: {
                        onDisk: string,
                        css: string,
                        img: string,
                        script: string
                    }
                },
                sessionSecret: string,
                sessionTTL: number
            }
        },
        clients?: {
            [key: string]: {
                host: string,
                port: number
            }
        }
    },

    rpc: {
        clients: {
            [key: string]: {
                host: string,
                port: number,
                username?: string,
                password?: string
            }
        },
        servers: {
            [key: string]: {
                interface: string,
                listen: number
            }
        }
    },

    saml: {
        serviceProviderEntityId: string,
        serviceProviderPrivateKey: string,
        serviceProviderCertificate: string,
        serviceProviderAssertEndpoint: string,
        identityProviderLoginURL: string,
        identityProviderLogoutURL: string,
        identityProviderCertificates: string[]
    },

    sendgrid: {
        apikey: string
    },

    db: {
        name: string,
        type: string,
        host: string,
        port: number,
        username: string,
        password: string,
        database: string,
        schema: string,
        synchronize: boolean,
        logging: boolean,
        entitiesDir: string[],
        migrationsDir: string[],
        subscribersDir: string[]
    }[],

    redis: {
        host: string,
        port: number,
        tls: boolean,
    },

    auth: {
        secret: string,
        resourceSecret: string,
        resourceTokenDefaultExpiry: number
    },

    scheduler: {
        concurrency: number,
        jobs: { name: string, timing: string, disabled?: boolean }[]
    },

    roles: {
        list: string[],
        capabilities: {
            [key: string]: {
                [key: string]: {
                    [key: string]: string[]
                }
            }
        }
    },

    featureFlags: {
        [key: string]: boolean
    }
}
