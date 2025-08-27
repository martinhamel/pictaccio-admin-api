import { FastStoreInterface } from '@pictaccio/admin-api/core/fast_store_interface';
import { TransactionalProduct } from '@pictaccio/admin-api/database/entities/transactional_product';
import WebsocketService from '@pictaccio/admin-api/services/websocket_service';
import { Inject, Service } from 'typedi';
import { NotificationDescriptor } from '@pictaccio/admin-api/types/notification_descriptor';
import { getLocaleStrings } from '@pictaccio/admin-api/utils/get_locale_strings';
import { sha256 } from '@pictaccio/admin-api/utils/hash';

@Service('notification')
export default class NotificationService {
    constructor(@Inject('fast-store') private fastStore: FastStoreInterface,
        @Inject('websocket') private websocket: WebsocketService) {
    }

    public async missingProductThemeImagesCollector(report: number[]): Promise<void> {
        const previousReportHash = await this.fastStore.get('notification:report-hash:missing-product-theme-images');
        const reportHash = sha256(JSON.stringify(report));

        if (!report.length) {
            return;
        }

        if (previousReportHash === reportHash) {
            return;
        }

        await this.fastStore.set('notification:report-hash:missing-product-theme-images', reportHash);
        const products = TransactionalProduct.findByIds(report);
        const descriptor: NotificationDescriptor = {
            title: getLocaleStrings('notifications:missingProductThemeImages.title'),
            message: getLocaleStrings('notifications:missingProductThemeImages.message'),
            linkPath: `/activities/products?filter-id=${report.join(',')}`,
            linkText: getLocaleStrings('notifications:missingProductThemeImages.linkText'),
            hasProgress: false,
            hasStop: false,
            hasClose: true
        };
        this.websocket.pushNotificationToRole(descriptor, ['admin', 'product-manager']);
    }
}
