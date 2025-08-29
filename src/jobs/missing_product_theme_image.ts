import { TransactionalProductTypeTheme } from '../database/entities/transactional_product_type_theme';
import type JobsCommWorkerService from '../services/jobs_comm_worker_service';
import { Container } from 'typedi';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('../services/jobs_comm_worker_service.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('../services/redis_service.js');

// TODO: Rework background job for updated DB format
export default (async function (): Promise<void> {
    const themedProducts = await TransactionalProductTypeTheme.find({ relations: ['product', 'themesSet'] });
    const productWithMissingImages: string[] = [];

    for (const themedProduct of themedProducts) {
        if (Object.values(themedProduct.themeSet.themes).length ===
            Object.values(themedProduct.product.images).length) {
            continue;
        }

        productWithMissingImages.push(themedProduct.id);
    }

    if (!productWithMissingImages.length) {
        return;
    }

    Container.get<JobsCommWorkerService>('jobs-comm-worker')
        .publishProductMissingThemeImagesReport(productWithMissingImages);
});
