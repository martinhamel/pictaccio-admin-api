import { AdminUser } from '@pictaccio/admin-api/database/entities/admin_user';
import { TransactionalOrder } from '@pictaccio/admin-api/database/entities/transactional_order';
import { OrderComment } from '@pictaccio/admin-api/types/order_comment';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity, Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'order_comments', schema: 'admin' })
export class AdminOrderComment extends BaseEntity {
    @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'comments_id_pkey' })
    public id: string;

    @Column({ type: 'text' })
    public message: string;

    @Column({ type: 'boolean' })
    public edited: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    public created_on: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    public updated_on: Date;

    @ManyToOne(() => TransactionalOrder, order => order.comments)
    @JoinColumn({ name: 'order_id', foreignKeyConstraintName: 'comments_order_id_fkey' })
    public order: TransactionalOrder;

    @ManyToOne(() => AdminUser, user => user.id)
    @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'comments_user_id_fkey' })
    public user: AdminUser;

    /* PUBLIC */
    public static async addComment(orderId: string, commentData: OrderComment): Promise<AdminOrderComment> {
        const comment = new AdminOrderComment();
        comment.order = await TransactionalOrder.findOneOrFail({ where: { id: orderId } });
        comment.user = await AdminUser.findOneOrFail({ where: { id: commentData.userId } });
        comment.message = commentData.message;
        comment.edited = false;

        return comment.save();
    }

    public static async deleteComment(commentId: string): Promise<void> {
        const comment = await AdminOrderComment.findOneOrFail({ where: { id: commentId } });

        await comment.remove();
    }

    public static async editComment(commentId: string, message: string): Promise<void> {
        const comment = await AdminOrderComment.findOneOrFail({ where: { id: commentId } });

        comment.message = message;
        comment.edited = true;
        await comment.save();
    }
}
