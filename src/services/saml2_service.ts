import { ServiceProvider, IdentityProvider } from 'saml2-js';
import { Container, Service } from 'typedi';
import { logger } from '@pictaccio/admin-api/core/logger';

const config = Container.get('config') as any;
const serviceProvider = new ServiceProvider({
    entity_id: config.saml.serviceProviderEntityId,
    private_key: config.saml.serviceProviderPrivateKey,
    certificate: config.saml.serviceProviderCertificate,
    assert_endpoint: config.saml.serviceProviderAssertEndpoint,
    allow_unencrypted_assertion: true
});
const identityProvider = new IdentityProvider({
    sso_login_url: config.saml.identityProviderLoginURL,
    sso_logout_url: config.saml.identityProviderLogoutURL,
    certificates: config.saml.identityProviderCertificates
});

@Service('saml2')
class Saml2Service {
    public createMetadata() {
        return serviceProvider.create_metadata;
    }

    public login(options): Promise<any> {
        return new Promise((resolve, reject) => {
            serviceProvider.create_login_request_url(identityProvider, options,
                (error, loginUrl, requestId) => {
                    if (error !== null) {
                        logger.error(`Failed to create SAML2 login request url`, {
                            area: 'services',
                            subarea: 'saml2',
                            action: 'user:login',
                            result: 'failed',
                            error
                        });

                        reject(error);
                        return;
                    }

                    logger.info(`Created SAML2 login request url`, {
                        area: 'services',
                        subarea: 'saml2',
                        action: 'user:login',
                        result: 'success',
                        login_url: loginUrl,
                        request_id: requestId
                    });
                    resolve({
                        loginUrl,
                        requestId
                    });
                }
            );
        });
    }

    public assert(options): Promise<any> {
        return new Promise((resolve, reject) => {
            serviceProvider.post_assert(identityProvider, options, (error, samlResponse) => {
                if (error !== null) {
                    logger.error(`Failed to assert`, {
                        area: 'services',
                        subarea: 'saml2',
                        action: 'user:saml-assert',
                        result: 'failed',
                        error
                    });

                    reject(error);
                    return;
                }

                logger.info(`Sucessfully posted assertion`, {
                    area: 'services',
                    subarea: 'saml2',
                    action: 'user:saml-assert',
                    result: 'success',
                    saml_response: samlResponse
                });
                resolve({
                    samlResponse
                });
            });
        });
    }

    public logout(options): Promise<any> {
        return new Promise((resolve, reject) => {
            serviceProvider.create_logout_request_url(identityProvider, options, (error, logoutUrl) => {
                if (error !== null) {
                    logger.error(`Failed to logout`, {
                        area: 'services',
                        subarea: 'saml2',
                        action: 'user:logout',
                        result: 'failed',
                        error
                    });

                    reject(error);
                    return;
                }

                logger.info(`Sucessfully logged out`, {
                    area: 'services',
                    subarea: 'saml2',
                    action: 'user:saml-assert',
                    result: 'success',
                    logout_url: logoutUrl
                });
                resolve({
                    logoutUrl
                });
            });
        });
    }
}
