import { AdminUser } from '@pictaccio/admin-api/database/entities/admin_user';
import { TransactionalOrder } from '@pictaccio/admin-api/database/entities/transactional_order';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';

@Entity({ name: 'order_assignments', schema: 'admin' })
export class AdminOrderAssignment extends BaseEntity {
    @PrimaryColumn({ type: 'bigint', name: 'order_id', primaryKeyConstraintName: 'order_assignments_order_id_pkey' })
    @OneToOne(() => TransactionalOrder)
    @JoinColumn({ name: 'order_id', foreignKeyConstraintName: 'order_assignments_order_id_fkey' })
    public order: TransactionalOrder;

    @ManyToOne(() => AdminUser, { nullable: true })
    @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'order_assignments_user_id_fkey' })
    public user: AdminUser;

    /* PUBLIC */
    public static async assignOrderToUser(orderId: string, userId: string): Promise<void> {
        const assignment = new AdminOrderAssignment();

        assignment.order = await TransactionalOrder.findOneOrFail({ where: { id: orderId } });
        assignment.user = userId !== null
            ? await AdminUser.findOne({ where: { id: userId } })
            : null;

        await AdminOrderAssignment.upsert(assignment, ['order']);
    }

    public static async getOrderAssignment(orderId: string): Promise<AdminUser> {
        const assignment = await AdminOrderAssignment
            .createQueryBuilder()
            .where('order_id = :orderId', { orderId })
            .leftJoinAndSelect('AdminOrderAssignment.user', 'user')
            .getOne();

        return assignment
            ? assignment.user
            : null;
    }
}
