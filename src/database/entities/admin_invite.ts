import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import moment from 'moment';
import { Container } from 'typedi';
import { BaseEntity, Column, CreateDateColumn, Entity, LessThan, PrimaryGeneratedColumn } from 'typeorm';

const config = Container.get<ConfigSchema>('config');

@Entity({ name: 'user_invites', schema: 'admin' })
export class AdminInvite extends BaseEntity {
    @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'user_invites_id_pkey' })
    public id: string;

    @Column({ type: 'text' })
    public email: string;

    @Column({ type: 'text' })
    public user_id: string;

    @CreateDateColumn()
    public created_on: Date;

    /* PUBLIC */
    public static async checkInviteToken(email: string, token: string): Promise<boolean> {
        return await AdminInvite.count({ where: { email, id: token } }) > 0;
    }

    public static async createInvite(id: string, email: string): Promise<string> {
        const invite = new AdminInvite();

        invite.user_id = id.toString();
        invite.email = email;

        return (await invite.save()).id;
    }

    public static async deleteExpired(): Promise<void> {
        await AdminInvite.delete({
            created_on: LessThan(moment().subtract(config.app.db.codeExpiryTimeInHour, 'hours').toDate())
        });
    }

    public static async findByToken(token: string): Promise<AdminInvite> {
        return AdminInvite.findOne({ where: { id: token } });
    }
}
