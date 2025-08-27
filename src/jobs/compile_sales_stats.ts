import { logger } from '@pictaccio/admin-api/core/logger';
import { appDataSource } from '@pictaccio/admin-api/database/data_source';
import { AdminSalesStat } from '@pictaccio/admin-api/database/entities/admin_sales_stat';
import { AdminSalesStatsProduct } from '@pictaccio/admin-api/database/entities/admin_sales_stats_product';
import { TransactionalOrder } from '@pictaccio/admin-api/database/entities/transactional_order';
import { getAppStateQuery, setAppStateQuery } from '@pictaccio/admin-api/database/helpers/app_states';
import { lock } from '@pictaccio/admin-api/database/helpers/locks';
import { LockAcquireError } from '@pictaccio/admin-api/errors/lock_acquire_error';
import { ProductType } from '@pictaccio/shared/src/types/product_type';
import { calculateTaxes } from '@pictaccio/shared/src/utils/taxes';
import { MoreThanOrEqual, QueryRunner } from 'typeorm';

const MAX_BATCH_SIZE = 1000;

type OrderProduct = {
    productId: string;
    productType: ProductType;
    quantity: number;
}

type OrderStat = {
    numberOfSubjects: number;
    subtotal: string;
    delivery: string;
    promoRebate: string;
    taxes: string;
    returns: string;
    returnFees: string;
    total: string;
}

function countSubjects(order: TransactionalOrder): number {
    const usedPhotos = Object.values(order.cart).reduce<string[]>((photos, item) => {
        item.selection.forEach(photoId => {
            if (!photos.includes(photoId)) {
                photos.push(photoId);
            }
        });

        return photos;
    }, []);

    return Object.entries(order.photo_selection)
        .filter(([photoId, _]) => usedPhotos.includes(photoId))
        .reduce((subjects, [_, selection]) => {
            if (!subjects.includes(selection.image.subjectCode)) {
                subjects.push(selection.image.subjectCode);
            }

            return subjects;
        }, [])
        .length;
}

async function getOrdersToProcess(runner: QueryRunner): Promise<TransactionalOrder[]> {
    const lastProcessedOrderUpdateTimestamp = await getAppStateQuery(runner, 'lastSalesStatsOrderUpdateTimestamp');

    return runner.manager.getRepository(TransactionalOrder).find({
        where: {
            completed_on: MoreThanOrEqual(lastProcessedOrderUpdateTimestamp),
            paid: true
        },
        order: {
            completed_on: 'ASC'
        },
        relations: [
            'session'
        ],
        take: MAX_BATCH_SIZE
    });
}

function parseProducts(order: TransactionalOrder): OrderProduct[] {
    return Object.values(order.cart).reduce((products, item) => {
        const product = products.find(product => product.productId === item.productId) ?? {
            productId: item.productId,
            productType: item.productType,
            quantity: 0
        };

        if (product.quantity === 0) {
            products.push(product);
        }

        product.quantity += parseInt(item.quantity.toString(), 10) * item.selection.length;

        return products;
    }, [] as OrderProduct[]);
}

function parseOrderData(order: TransactionalOrder): OrderStat {
    return {
        numberOfSubjects: countSubjects(order),
        subtotal: order.sale_subtotal,
        delivery: order.sale_delivery_price,
        promoRebate: order.flags.promo
            ? order.flags.promo.amount
            : '0',
        taxes: calculateTaxes(order.sale_taxes),
        returns: '0',
        returnFees: '0',
        total: order.sale_total
    };
}

async function processOrder(runner: QueryRunner, order: TransactionalOrder): Promise<void> {
    const orderProducts = parseProducts(order);
    const orderStat = parseOrderData(order);
    const dateResult = await runner.manager.query(
        'SELECT date_trunc(\'day\', CAST($1 AS TIMESTAMP)) as truncated_date',
        [order.created_on]
    );
    const truncatedDate = Math.floor(dateResult[0].truncated_date.getTime() / 1000);
    const saleStat = new AdminSalesStat();

    saleStat.date = truncatedDate;
    saleStat.order_id = order.id;
    saleStat.session = order.session;
    saleStat.number_of_subjects = orderStat.numberOfSubjects;
    saleStat.subtotal = orderStat.subtotal;
    saleStat.shipping = orderStat.delivery;
    saleStat.promo_rebate = orderStat.promoRebate;
    saleStat.taxes = orderStat.taxes;
    saleStat.returns = orderStat.returns;
    saleStat.return_fees = orderStat.returnFees;
    saleStat.total = orderStat.total;

    await runner.manager.getRepository(AdminSalesStat).save(saleStat);

    const existing = await runner.manager.getRepository(AdminSalesStat)
        .find({
            where: {
                date: truncatedDate,
                order_id: order.id
            }
        });

    await runner.manager.getRepository(AdminSalesStatsProduct)
        .createQueryBuilder()
        .delete()
        .where('sales_stats_date = :date', { date: truncatedDate })
        .andWhere('sales_stats_order_id = :orderId', { orderId: order.id })
        .execute();

    const existing2 = await runner.manager.getRepository(AdminSalesStat)
        .find({
            where: {
                date: truncatedDate,
                order_id: order.id
            }
        });

    for await (const product of orderProducts) {
        const salesStatsProduct = new AdminSalesStatsProduct();

        salesStatsProduct.sales_stats_date = existing2[0].date;
        salesStatsProduct.sales_stats_order_id = existing2[0].order_id;
        salesStatsProduct.quantity = product.quantity;
        salesStatsProduct.sales_stats_product_id = product.productId.toString();

        await runner.manager.getRepository(AdminSalesStatsProduct).save(salesStatsProduct);
    }

    // const saleProducts = orderProducts.map(product => {
    //     const salesStatsProduct = new AdminSalesStatsProduct();
    //
    //     salesStatsProduct.sales_stats_date = truncatedDate;
    //     salesStatsProduct.sales_stats_order_id = order.id;
    //     salesStatsProduct.quantity = product.quantity;
    //     salesStatsProduct.sales_stats_product_id = product.productId.toString();
    //
    //     return salesStatsProduct;
    // });
    //
    // await runner.manager.getRepository(AdminSalesStatsProduct).save(saleProducts);
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
            await lock(runner, 'salesStats');

            for (const order of orders) {
                await processOrder(runner, order);
            }

            const latestOrder = orders.reduce(
                (highest, order) => order.completed_on > highest.completed_on ? order : highest, orders[0]);
            await setAppStateQuery(runner, 'lastSalesStatsOrderUpdateTimestamp', latestOrder.completed_on);
            await setAppStateQuery(runner, 'lastSalesStatsProcessedOrderId', latestOrder.id);

            await runner.commitTransaction();
        }
    } catch (error) {
        await runner.rollbackTransaction();

        if (error instanceof LockAcquireError) {
            return;
        }

        logger.info('Compile sales stats job failed', {
            area: 'jobs',
            subarea: 'sales-stats',
            action: 'compileSalesStats',
            error
        });
    } finally {
        await runner.release();
    }
});
