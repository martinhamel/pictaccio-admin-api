import { TransactionalOrder } from '@pictaccio/admin-api/database/entities/transactional_order';
import { TransactionalSubject } from '@pictaccio/admin-api/database/entities/transactional_subject';
import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'order_checks', schema: 'admin' })
export class AdminOrderCheck extends BaseEntity {
    @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'order_checks_id_pkey' })
    public id: number;

    @Column({ type: 'boolean' })
    public check: boolean;

    @Column({ type: 'text' })
    public photo_id: string;

    @Column({ type: 'text' })
    public product_id: string;

    @ManyToOne(() => TransactionalOrder, order => order.checks)
    @JoinColumn({ name: 'order_id', foreignKeyConstraintName: 'order_checks_order_id_fkey' })
    public order: TransactionalOrder;

    @ManyToOne(() => TransactionalSubject, subject => subject.checks)
    @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'order_checks_subject_id_fkey' })
    public subject: TransactionalSubject;

    /* PUBLIC */
    public static async getChecksForOrder(orderId: string): Promise<AdminOrderCheck[]> {
        return AdminOrderCheck.find({
            where: { order: { id: orderId } },
            relations: ['order', 'subject']
        });
    }
}
