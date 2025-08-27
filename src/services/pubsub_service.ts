import { FastStoreInterface } from '@pictaccio/admin-api/core/fast_store_interface';
import { PublicAppIntegration } from '@pictaccio/admin-api/database/entities/public_app_integration';
import { PublicStoreConfig } from '@pictaccio/admin-api/database/entities/public_store_config';
import { AsyncStoreService } from '@pictaccio/admin-api/services/async_store_service';
import StoreConfigService from '@pictaccio/admin-api/services/store_config_service';
import { StoreConfiguration } from '@pictaccio/shared/src/types/store_configuration';
import { StoreLanguageItem } from '@pictaccio/shared/src/types/store_language_item';
import { TaxLocality } from '@pictaccio/shared/src/types/tax_locality';
import { TransactionalCustomization } from '@pictaccio/shared/src/types/transactional_customization';
import { Inject, Service } from 'typedi';

const NOT_READY_MESSAGE = 'The store is not ready to accept orders. Please contact the store owner for more' +
    ' information. --- Le magasin n\'est pas prêt à accepter des commandes. Veuillez contacter le propriétaire du' +
    ' magasin pour plus d\'informations.';

@Service('pubsub')
export class PubsubService {
    constructor(@Inject('fast-store') private fastStore: FastStoreInterface,
        @Inject('store-config') private storeConfig: StoreConfigService,
        @Inject('async-store') private asyncStore: AsyncStoreService) {
        this._listenConfigRequest();
    }

    public async publishAppIntegrationsChanged(app: string): Promise<void> {
        await this.fastStore.publish('app-integrations:changed', app);
    }

    public async publishBackgroundChanged(): Promise<void> {
        await this.fastStore.publish('backgrounds:changed', '');
    }

    public async publishConfiguredLanguagesChanged(languages: StoreLanguageItem[]): Promise<void> {
        await this.fastStore.publish('configured-languages:changed', JSON.stringify(languages));
    }

    public async publishStoreConfigChanged(): Promise<void> {
        const config = await PublicStoreConfig.getMany([
            'external-urls',
            'store-address-address-line1',
            'store-address-address-line2',
            'store-address-unit-type',
            'store-address-unit-number',
            'store-address-city',
            'store-address-region',
            'store-address-country',
            'store-address-postal-code',
            'store-emails',
            'store-phones',
            'tax-locality',
            'tax-rate-hst',
            'tax-rate-gst',
            'tax-rate-qst',
            'tax-rate-pst',
            'tax-id-hst',
            'tax-id-gst',
            'tax-id-qst',
            'tax-id-pst'
        ]);
        const storeConfiguration: StoreConfiguration = {
            contact: {
                addressLine1: config['store-address-address-line1'],
                addressLine2: config['store-address-address-line2'],
                city: config['store-address-city'],
                region: config['store-address-region'],
                postalCode: config['store-address-postal-code'],
                country: config['store-address-country'],
                phone: (JSON.parse(config['store-phones'] ?? '[]')
                    .find(i => i.name === '_main'))?.phone ?? '',
                email: (JSON.parse(config['store-emails'] ?? '[]')
                    .find(i => i.name === '_customer-service'))?.email ?? '',
                notifyEmail: (JSON.parse(config['store-emails'] ?? '[]')
                    .find(i => i.name === '_notifications'))?.email ?? ''
            },
            taxes: {
                locality: config['tax-locality'] as TaxLocality,
                canadian: {
                    gstId: config['tax-id-gst'],
                    hstId: config['tax-id-hst'],
                    pstId: config['tax-id-pst'],
                    qstId: config['tax-id-qst'],
                    gst: config['tax-rate-gst'],
                    hst: config['tax-rate-hst'],
                    pst: config['tax-rate-pst'],
                    qst: config['tax-rate-qst']
                }
            },
            urls: {
                contact: (JSON.parse(config['external-urls'] ?? '{}').contact ?? ''),
                root: (JSON.parse(config['external-urls'] ?? '{}').root ?? ''),
                termsAndConditions: (JSON.parse(config['external-urls'] ?? '{}').termsAndConditions ?? '')
            }
        };
        await this.fastStore.publish('store-config:changed', JSON.stringify(storeConfiguration));
    }

    public async publishStoreCustomizationChanged(): Promise<void> {
        const customization: TransactionalCustomization = {
            storeName: await PublicStoreConfig.get('store-name'),
            colors: JSON.parse(await PublicStoreConfig.get('branding-colors') ?? '{}')
        };
        await this.fastStore.publish('store-customization:changed', JSON.stringify(customization));
    }

    public async publishStoreNotifyEmailsChanged(emails: string[]): Promise<void> {
        await this.fastStore.publish('store-notify-emails:changed', JSON.stringify(emails));
    }

    public async publishStoreShutdownChanged(shutdown: boolean, message: string): Promise<void> {
        const storeConfiguration = await this.storeConfig.isConfigured();
        const payload = JSON.stringify({
            shutdown: storeConfiguration.isReady ? shutdown : true,
            message: storeConfiguration.isReady ? message : NOT_READY_MESSAGE
        });

        await this.fastStore.publish('store-shutdown:changed', payload);
    }

    /* PRIVATE */
    private _listenConfigRequest(): void {
        this.fastStore.subscribe('config:request', async () => {
            this.asyncStore.init();
            this.asyncStore.set('pubsubContext', {
                channel: 'config:request',
                startTime: new Date()
            });

            await this._reloadAppIntegrations();
            await this._reloadConfiguredLanguages();
            await this._reloadNotifyEmails();
            await this._reloadShutdown();

            await this.publishBackgroundChanged();
            await this.publishStoreConfigChanged();
            await this.publishStoreCustomizationChanged();

            await this.fastStore.publish('config:done', '');
        });
    }

    private async _reloadAppIntegrations(): Promise<void> {
        const appList = await PublicAppIntegration.getActiveList();

        for await (const app of appList) {
            await this.publishAppIntegrationsChanged(app);
        }
    }

    private async _reloadConfiguredLanguages(): Promise<void> {
        const languages = await PublicStoreConfig.get('store-languages');

        if (languages) {
            await this.publishConfiguredLanguagesChanged(JSON.parse(languages));
        }
    }

    private async _reloadNotifyEmails(): Promise<void> {
        const notifyEmails = await PublicStoreConfig.get('store-notify-emails');

        if (notifyEmails) {
            await this.publishStoreNotifyEmailsChanged(JSON.parse(notifyEmails));
        }
    }

    private async _reloadShutdown(): Promise<void> {
        const storeLock = await PublicStoreConfig.get('store-shutdown');
        const storeConfiguration = await this.storeConfig.isConfigured();

        if (storeLock) {
            const lock = JSON.parse(storeLock);
            await this.publishStoreShutdownChanged(storeConfiguration.isReady ? lock.shutdown : true, lock.message);
        } else {
            await this.publishStoreShutdownChanged(!storeConfiguration.isReady,
                storeConfiguration.isReady ? '' : NOT_READY_MESSAGE);
        }
    }
}
