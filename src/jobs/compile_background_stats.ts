import { logger } from '@pictaccio/admin-api/core/logger';
import { appDataSource } from '@pictaccio/admin-api/database/data_source';
import { AdminBackgroundStat } from '@pictaccio/admin-api/database/entities/admin_background_stat';
import { TransactionalOrder } from '@pictaccio/admin-api/database/entities/transactional_order';
import { TransactionalProduct } from '@pictaccio/admin-api/database/entities/transactional_product';
import { getAppStateQuery, setAppStateQuery } from '@pictaccio/admin-api/database/helpers/app_states';
import { lock } from '@pictaccio/admin-api/database/helpers/locks';
import { LockAcquireError } from '@pictaccio/admin-api/errors/lock_acquire_error';
import { VirtualProduct } from '@pictaccio/shared/src/types/virtual_product';
import { MoreThanOrEqual, QueryRunner } from 'typeorm';

const MAX_BATCH_SIZE = 1000;

type BackgroundInfo = {
    backgroundId: string;
    productId: string | VirtualProduct;
}

async function createBackgroundStat(runner: QueryRunner,
    backgroundInfo: BackgroundInfo,
    order: TransactionalOrder): Promise<void> {
    const result = await runner.manager.query(
        'SELECT date_trunc(\'day\', CAST($1 AS TIMESTAMP)) as truncated_date',
        [order.completed_on]
    );
    const truncatedDate = Math.floor(result[0].truncated_date.getTime() / 1000);

    await runner.manager.query(
        `INSERT INTO admin.background_stats (background_id, date, usage_count, conversion_count)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (background_id, date)
         DO UPDATE
         SET usage_count = admin.background_stats.usage_count + EXCLUDED.usage_count,
         conversion_count = admin.background_stats.conversion_count + EXCLUDED.conversion_count`,
        [backgroundInfo.backgroundId, truncatedDate, 1, order.paid ? 1 : 0]
    );

    await runner.manager.query(
        `INSERT INTO admin.background_stats_products 
            (background_stats_background_id, background_stats_date, background_stats_product_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (background_stats_background_id, background_stats_date, background_stats_product_id)
         DO NOTHING`,
        [backgroundInfo.backgroundId, truncatedDate, backgroundInfo.productId]
    );
    await runner.manager.query(
        `INSERT INTO admin.background_stats_orders_map (background_id, date, order_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (background_id, date, order_id)
         DO NOTHING`,
        [backgroundInfo.backgroundId, truncatedDate, order.id]
    );
}

function parseBackgroundInfos(order: TransactionalOrder): BackgroundInfo[] {
    // TODO: Remove ts-ignore after string bigint conversion is merged
    // @ts-ignore
    return Object.values(order.cart)
        .map(item => Object.values(Object.fromEntries(Object.entries(order.photo_selection)
            .filter(([id, selection]) => item.selection.includes(id) && selection.background !== undefined)
            .map(([id, selection]) => [id, { ...selection, productId: item.productId }])
        )))
        .flat()
        .map(selection => ({
            backgroundId: selection.background.id,
            productId: selection.productId
        }));
}

async function getOrdersToProcess(runner: QueryRunner): Promise<TransactionalOrder[]> {
    const lastProcessedOrderUpdateTimestamp = await getAppStateQuery(runner, 'lastBackgroundStatsOrderUpdateTimestamp');

    return runner.manager.getRepository(TransactionalOrder).find({
        where: {
            completed_on: MoreThanOrEqual(lastProcessedOrderUpdateTimestamp)
        },
        order: {
            completed_on: 'ASC'
        },
        take: MAX_BATCH_SIZE
    });
}

async function processExistingOrderStats(runner: QueryRunner,
    order: TransactionalOrder,
    previousStats: AdminBackgroundStat[]): Promise<void> {
    const backgroundInfos: BackgroundInfo[] = parseBackgroundInfos(order);

    for await (const backgroundInfo of backgroundInfos) {
        // TODO: Remove ts-ignore after string bigint conversion is merged
        // @ts-ignore
        const stat = previousStats.find(stat => stat.background.id === backgroundInfo.backgroundId);

        if (!stat) {
            const statRow = await runner.manager.getRepository(AdminBackgroundStat).findOne({
                where: {
                    // TODO: Remove ts-ignore after string bigint conversion is merged
                    // @ts-ignore
                    background: { id: backgroundInfo.backgroundId },
                    dateJS: order.completed_on
                },
                relations: ['background']
            });

            if (statRow) {
                statRow.usage_count++;
                statRow.conversion_count += order.paid
                    ? 1
                    : 0;

                if (statRow.orders.map(order => order.id).includes(order.id)) {
                    statRow.orders.push(order);
                }

                // @ts-ignore
                if (statRow.products.map(product => product.id).includes(backgroundInfo.productId)) {
                    // TODO: Remove ts-ignore after string bigint conversion is merged
                    // @ts-ignore
                    statRow.products.push({ id: backgroundInfo.productId } as TransactionalProduct);
                }

                await runner.manager.getRepository(AdminBackgroundStat).save(statRow);
            } else {
                await createBackgroundStat(runner, backgroundInfo, order);
            }
        }
    }
}

async function processNewOrderStats(runner: QueryRunner, order: TransactionalOrder): Promise<void> {
    const backgroundInfos: BackgroundInfo[] = parseBackgroundInfos(order);

    for await (const backgroundInfo of backgroundInfos) {
        await createBackgroundStat(runner, backgroundInfo, order);
    }
}

async function processOrder(runner: QueryRunner, order: TransactionalOrder): Promise<void> {
    const previousStats = await runner.manager.getRepository(AdminBackgroundStat)
        .createQueryBuilder()
        .leftJoin('AdminBackgroundStat.orders', 'TransactionalOrder')
        .where('TransactionalOrder.id = :orderId', { orderId: order.id })
        .getMany();

    if (previousStats && previousStats.length > 0) {
        await processExistingOrderStats(runner, order, previousStats);
    } else {
        await processNewOrderStats(runner, order);
    }
}

export default (async function (): Promise<void> {
    const runner = appDataSource.createQueryRunner();

    await runner.connect();

    try {
        let processing = true;

        while (processing) {
            const orders = await getOrdersToProcess(runner);

            if (orders.length === 0) {
                processing = false;
                continue;
            }

            await runner.startTransaction('READ COMMITTED');
            await runner.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
            await runner.query('SET CONSTRAINTS ALL DEFERRED');
            await lock(runner, 'backgroundStats');

            for (const order of orders) {
                await processOrder(runner, order);
            }

            const latestOrder = orders.reduce(
                (highest, order) => order.completed_on > highest.completed_on ? order : highest, orders[0]);
            await setAppStateQuery(runner, 'lastBackgroundStatsOrderUpdateTimestamp', latestOrder.completed_on);
            await setAppStateQuery(runner, 'lastBackgroundStatsProcessedOrderId', latestOrder.id);

            await runner.commitTransaction();
        }
    } catch (error) {
        await runner.rollbackTransaction();

        if (error instanceof LockAcquireError) {
            return;
        }

        logger.info('Compile background usage stats job failed', {
            area: 'jobs',
            subarea: 'background-stats',
            action: 'compileBackgroundStats',
            error
        });
    } finally {
        await runner.release();
    }
});
