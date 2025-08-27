import { TransactionalOrder } from '@pictaccio/admin-api/database/entities/transactional_order';
import { TransactionProcessorResponse } from '@pictaccio/admin-api/types/transaction_processor_response';
import { TransactionType } from '@pictaccio/admin-api/types/transaction_type';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity({ name: 'transactions', schema: 'transactional' })
export class TransactionalTransaction extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'transactions_id_pkey' })
    public id: string;

    @Column({ type: 'text' })
    public payment_module: TransactionType;

    @Column({ type: 'boolean' })
    public successful: boolean;

    @Column({ type: 'text', nullable: true })
    public transaction_code: string;

    @Column({ type: 'jsonb' })
    public processor_response: TransactionProcessorResponse;

    @CreateDateColumn({ type: 'timestamp' })
    public created: Date;

    @ManyToOne(() => TransactionalOrder, order => order.transactions)
    @JoinColumn({ name: 'order_id', foreignKeyConstraintName: 'transaction_order_id_fkey' })
    public order: string;

    /* PUBLIC */
    public static getManyByOrder(orderIds: string[]): Promise<TransactionalTransaction[]> {
        return TransactionalTransaction.createQueryBuilder()
            .where('TransactionalTransaction.order_id IN (:...orderIds)', { orderIds })
            .leftJoinAndSelect('TransactionalTransaction.order', 'TransactionalOrder')
            .getMany();
    }
}
