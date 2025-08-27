import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import { PublicAppIntegration } from '@pictaccio/admin-api/database/entities/public_app_integration';
import { PublicStoreConfig } from '@pictaccio/admin-api/database/entities/public_store_config';
import { AppIntegrationApp, AppIntegrationApps } from '@pictaccio/shared/src/types/app_integration_app';
import { CssStyleDescription, CssStyleTransactional } from '@pictaccio/shared/src/types/css_color_descriptor';
import { CustomExternalUrls } from '@pictaccio/shared/src/types/custom_external_urls';
import { Language } from '@pictaccio/shared/src/types/language';
import { SaleTaxes } from '@pictaccio/shared/src/types/sale_taxes';
import { StoreLanguageItem } from '@pictaccio/shared/src/types/store_language_item';
import { StoreConfigurationStatus } from '@pictaccio/shared/src/types/store_status';
import { TaxLocality } from '@pictaccio/shared/src/types/tax_locality';
import { getTaxesForLocality } from '@pictaccio/shared/src/utils/taxes';
import { Inject, Service } from 'typedi';

@Service('store-config')
export default class StoreConfigService {
    constructor(@Inject('config') private config: ConfigSchema) {
    }

    public async isConfigured(): Promise<StoreConfigurationStatus> {
        const storeLanguages: StoreLanguageItem[] = await PublicStoreConfig.get('store-languages')
            ? JSON.parse(await PublicStoreConfig.get('store-languages'))
            : [];
        const brandingColors: CssStyleDescription = await PublicStoreConfig.get('branding-colors')
            ? JSON.parse(await PublicStoreConfig.get('branding-colors'))
            : CssStyleTransactional;
        const watermarkStatus: string = await PublicStoreConfig.get('watermark-image');
        const logoStatus: string = await PublicStoreConfig.get('logo-image');
        const externalUrls: CustomExternalUrls = await PublicStoreConfig.get('external-urls')
            ? JSON.parse(await PublicStoreConfig.get('external-urls'))
            : null;
        const storeName: string = await PublicStoreConfig.get('store-name');
        const taxLocality: TaxLocality = await PublicStoreConfig.get('tax-locality') as TaxLocality;
        const taxRateGst: number = Number(await PublicStoreConfig.get('tax-rate-gst') ?? 0);
        const taxRatePst: number = Number(await PublicStoreConfig.get('tax-rate-pst') ?? 0);
        const taxRateHst: number = Number(await PublicStoreConfig.get('tax-rate-hst') ?? 0);
        const taxRateQst: number = Number(await PublicStoreConfig.get('tax-rate-qst') ?? 0);
        const taxGstId: string = await PublicStoreConfig.get('tax-id-gst');
        const taxPstId: string = await PublicStoreConfig.get('tax-id-pst');
        const taxHstId: string = await PublicStoreConfig.get('tax-id-hst');
        const taxQstId: string = await PublicStoreConfig.get('tax-id-qst');
        const appIntegrations: AppIntegrationApp[] = await PublicAppIntegration.getActiveList();
        const addressAddress1: string = await PublicStoreConfig.get('store-address-address-line1');
        const addressCity: string = await PublicStoreConfig.get('store-address-city');
        const addressRegion: string = await PublicStoreConfig.get('store-address-region');
        const addressPostalCode: string = await PublicStoreConfig.get('store-address-postal-code');
        const addressCountry: string = await PublicStoreConfig.get('store-address-country');

        const languageConfigured = this._isLanguageConfigured(storeLanguages);
        const customizationConfigured = this._isCustomizationConfigured(brandingColors,
            watermarkStatus,
            logoStatus,
            externalUrls,
            storeName);
        const paymentConfigured = this._isPaymentConfigured(appIntegrations);
        const contactConfigured = this._isContactConfigured(addressAddress1,
            addressCity,
            addressRegion,
            addressPostalCode,
            addressCountry);
        const taxesConfigured = this._isTaxesConfigured(taxLocality,
            taxRateGst,
            taxRatePst,
            taxRateHst,
            taxRateQst,
            taxGstId,
            taxPstId,
            taxHstId,
            taxQstId);

        return {
            isReady: languageConfigured &&
                customizationConfigured &&
                paymentConfigured &&
                contactConfigured &&
                taxesConfigured,
            features: {
                languageConfigured,
                customizationConfigured,
                paymentConfigured,
                contactConfigured,
                taxesConfigured
            }
        };
    }

    public async primaryLanguage(): Promise<Language> {
        const storeLanguages = JSON.parse(await PublicStoreConfig.get('store-languages') ?? '[]');

        if (!storeLanguages || storeLanguages.length === 0) {
            return this.config.locales.fallbacks.lang;
        }

        const primaryLang = storeLanguages.find(lang => lang.primary);

        if (!primaryLang) {
            return storeLanguages[0].locale;
        }

        return primaryLang.locale;
    }

    /* PRIVATE */
    private _isContactConfigured(addressAddress1: string,
        addressCity: string,
        addressRegion: string,
        addressPostalCode: string,
        addressCountry: string): boolean {
        return typeof addressAddress1 === 'string' && addressAddress1.length > 0 &&
            typeof addressCity === 'string' && addressCity.length > 0 &&
            typeof addressRegion === 'string' && addressRegion.length > 0 &&
            typeof addressPostalCode === 'string' && addressPostalCode.length > 0 &&
            typeof addressCountry === 'string' && addressCountry.length > 0;
    }

    private _isCustomizationConfigured(brandingColors: CssStyleDescription,
        watermarkStatus: string,
        logoStatus: string,
        externalUrls: CustomExternalUrls,
        storeName: string): boolean {
        return Object.values(brandingColors).every(color => color !== '') &&
            watermarkStatus === 'uploaded' &&
            logoStatus === 'uploaded' &&
            Object.values(externalUrls).every(url => url !== '') &&
            typeof storeName === 'string' && storeName.length > 0;
    }

    private _isLanguageConfigured(languages: StoreLanguageItem[]): boolean {
        return Array.isArray(languages) && languages.some(lang => lang.primary);
    }

    private _isPaymentConfigured(appIntegrations: AppIntegrationApp[]): boolean {
        const requiredApps = ['elavon', 'paypal', 'stripe', 'chase'];

        return appIntegrations.some(app => requiredApps.includes(app));
    }

    private _isTaxesConfigured(taxLocality: TaxLocality,
        taxRateGst: number,
        taxRatePst: number,
        taxRateHst: number,
        taxRateQst: number,
        taxIdGst: string,
        taxIdPst: string,
        taxIdHst: string,
        taxIdQst: string): boolean {
        const requiredTaxes = getTaxesForLocality(taxLocality);
        const taxRates = { gst: taxRateGst, pst: taxRatePst, hst: taxRateHst, qst: taxRateQst };
        const taxIds = { gst: taxIdGst, pst: taxIdPst, hst: taxIdHst, qst: taxIdQst };

        if (!Array.isArray(requiredTaxes) || requiredTaxes.length === 0) {
            return false;
        }

        return requiredTaxes.every(tax => (taxRates[tax] !== undefined && taxRates[tax] > 0) &&
            (taxIds[tax] !== undefined && taxIds[tax].length > 0));
    }
}
