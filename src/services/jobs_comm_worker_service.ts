import { FastStoreInterface } from '@pictaccio/admin-api/core/fast_store_interface';
import { Inject, Service } from 'typedi';

@Service('jobs-comm-worker')
export default class JobsCommWorkerService {
    constructor(@Inject('fast-store') private fastStore: FastStoreInterface) {
    }

    public publishProductMissingThemeImagesReport(report: string[]): void {
        this.fastStore.publish('job:product:missing-product-theme-images', JSON.stringify(report));
    }
}
