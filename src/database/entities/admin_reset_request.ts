import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import moment from 'moment';
import { Container } from 'typedi';
import { BaseEntity, Column, CreateDateColumn, Entity, Index, LessThan, PrimaryGeneratedColumn } from 'typeorm';

const config = Container.get<ConfigSchema>('config');

@Entity({ name: 'reset_requests', schema: 'admin' })
export class AdminResetRequest extends BaseEntity {
    @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'reset_requests_id_pkey' })
    public id: string;

    @Column({ type: 'text' })
    public code: string;

    @Index('reset_requests_email_key', { unique: true })
    @Column({ type: 'text' })
    public email: string;

    @Column({ type: 'text' })
    public user_id: string;

    @Index('reset_requests_created_on_idx')
    @CreateDateColumn()
    public created_on: Date;

    /* PUBLIC */
    public static async checkResetEntry(
        email: string, code: string, resetToken?: string): Promise<{ valid: boolean, resetToken: string }> {
        const { id, code: dbCode, created_on } = await AdminResetRequest.findOne({ where: { email } });

        return {
            valid: code === dbCode &&
                moment().subtract(config.app.db.codeExpiryTimeInHour, 'hours').isBefore(created_on) &&
                (resetToken ? id === resetToken : true),
            resetToken: id
        };
    }

    public static createResetEntry(userId: string, email: string, code: string): void {
        const reset = new AdminResetRequest();

        reset.user_id = userId;
        reset.email = email;
        reset.code = code;

        reset.save();
    }

    public static async deleteExpired(): Promise<void> {
        await AdminResetRequest.delete({
            created_on: LessThan(moment().subtract(config.app.db.codeExpiryTimeInHour, 'hours').toDate())
        });
    }

    public static async deleteFromResetToken(resetToken: string): Promise<void> {
        await AdminResetRequest.delete(resetToken);
    }

    public static async deleteFromEmail(email: string): Promise<void> {
        await AdminResetRequest.delete({ email: email });
    }
}
