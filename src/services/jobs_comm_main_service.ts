import { FastStoreInterface } from '@pictaccio/admin-api/core/fast_store_interface';
import NotificationService from '@pictaccio/admin-api/services/notification_service';
import { Inject, Service } from 'typedi';

@Service('jobs-comm-main')
export default class JobsCommMainService {
    constructor(@Inject('fast-store') private fastStore: FastStoreInterface,
        @Inject('notification') private notification: NotificationService) {
    }

    public init(): void {
        this._missingProductThemeImagesSubscriber();
    }

    /* PRIVATE */
    private _missingProductThemeImagesSubscriber(): void {
        this.fastStore.subscribe('job:product:missing-product-theme-images', (value: string) => {
            try {
                this.notification.missingProductThemeImagesCollector(JSON.parse(value));
            } catch (e) {
                // Pass
            }
        });
    }
}
