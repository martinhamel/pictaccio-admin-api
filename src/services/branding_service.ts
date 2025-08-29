import { ConfigSchema } from '../core/config_schema';
import { logger } from '../core/logger';
import { getMetadata, ModelMetadata } from '../database/decorators/metadata';
import { PublicStoreConfig } from '../database/entities/public_store_config';
import { InvalidFormatError } from '../errors/invalid_format_error';
import { PubsubService } from '../services/pubsub_service';
import { CustomExternalUrls } from '@pictaccio/shared/types/custom_external_urls';
import { NamedColors } from '@pictaccio/shared/types/named_colors';
import { StoreCustomizationColors } from '@pictaccio/shared/types/store_customization_colors';
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
