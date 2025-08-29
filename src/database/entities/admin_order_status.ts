import { TransactionalOrder } from '../../database/entities/transactional_order';
import { OrderStatus, OrderStatuses } from '@pictaccio/shared/types/order_status';
import { BaseEntity, Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'order_statuses', schema: 'admin' })
export class AdminOrderStatus extends BaseEntity {
    @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'order_statuses_id_pkey' })
    public id: number;

    @Column({ type: 'enum', enum: OrderStatuses, default: 'pending' })
    public status: OrderStatus;

    @OneToOne(() => TransactionalOrder, order => order.productionStatus)
    @JoinColumn({ name: 'order_id', foreignKeyConstraintName: 'order_statuses_order_id_fkey' })
    public order: TransactionalOrder;

    /* PUBLIC */
    public static async get(orderId: string): Promise<OrderStatus> {
        try {
            return (await AdminOrderStatus.findOneOrFail({
                where: { order: { id: orderId } },
                relations: ['order']
            })).status;
        } catch {
            const order = await TransactionalOrder.findOneOrFail({
                where: { id: orderId }
            });

            const status = new AdminOrderStatus();
            status.order = order;
            status.status = 'pending';
            await status.save();

            return 'pending';
        }
    }

    public static async set(orderId: string, status: OrderStatus): Promise<void> {
        await TransactionalOrder.findOneOrFail({
            where: { id: orderId }
        });

        try {
            const orderStatus = await AdminOrderStatus.findOneOrFail({
                where: { order: { id: orderId } },
                relations: ['order']
            });

            orderStatus.status = status;
            await orderStatus.save();
        } catch {
            const order = await TransactionalOrder.findOne({
                where: { id: orderId }
            });

            const orderStatus = new AdminOrderStatus();
            orderStatus.order = order;
            orderStatus.status = status;
            await orderStatus.save();
        }
    }
}
