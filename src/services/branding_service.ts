import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import { logger } from '@pictaccio/admin-api/core/logger';
import { getMetadata, ModelMetadata } from '@pictaccio/admin-api/database/decorators/metadata';
import { PublicStoreConfig } from '@pictaccio/admin-api/database/entities/public_store_config';
import { InvalidFormatError } from '@pictaccio/admin-api/errors/invalid_format_error';
import { PubsubService } from '@pictaccio/admin-api/services/pubsub_service';
import { CustomExternalUrls } from '@pictaccio/shared/src/types/custom_external_urls';
import { NamedColors } from '@pictaccio/shared/src/types/named_colors';
import { StoreCustomizationColors } from '@pictaccio/shared/src/types/store_customization_colors';
import { join } from 'path';
import { Container, Inject, Service } from 'typedi';
import { BaseEntity } from 'typeorm';

@Service('branding')
export class BrandingService {
    constructor(@Inject('config') private config: ConfigSchema,
        @Inject('pubsub') private pubsub: PubsubService) {
    }

    public async readColors(): Promise<StoreCustomizationColors> {
        try {
            const colors = JSON.parse(await PublicStoreConfig.get('branding-colors'));
            return new StoreCustomizationColors(colors);
        } catch (e) {
            return new StoreCustomizationColors();
        }
    }

    public async readUrls(): Promise<CustomExternalUrls> {
        try {
            const externalUrls = JSON.parse(await PublicStoreConfig.get('external-urls'));
            return new CustomExternalUrls(externalUrls);
        } catch (e) {
            return new CustomExternalUrls();
        }
    }

    public async saveColors(colors: NamedColors): Promise<boolean> {
        await PublicStoreConfig.set('branding-colors', JSON.stringify(colors));
        await this.pubsub.publishStoreCustomizationChanged();
        return true;
    }

    public async saveUrls(urls: CustomExternalUrls): Promise<boolean> {
        await PublicStoreConfig.set('external-urls', JSON.stringify(urls));
        await this.pubsub.publishStoreConfigChanged();
        return true;
    }
}
