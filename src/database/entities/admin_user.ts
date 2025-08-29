import { config } from '../../config';
import { AllowUploads } from '../../database/decorators/allow_uploads';
import { NotFoundError } from '../../errors/not_found_error';
import { User } from '@pictaccio/shared/types/user';
import { UserInfo } from '@pictaccio/shared/types/user_info';
import { UserStatus, UserStatuses } from '@pictaccio/shared/types/user_status';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users', schema: 'admin' })
export class AdminUser extends BaseEntity {
    @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'users_id_pkey' })
    public id?: string;

    @Column({ type: 'text', nullable: true })
    @AllowUploads({ path: config.app.dirs.users, mimes: 'image/*' })
    public avatar?: string;

    @Column({ type: 'text' })
    public email: string;

    @Column({ type: 'text', nullable: true })
    public hash?: string;

    @Column({ type: 'jsonb' })
    public info?: UserInfo;

    @Column({ type: 'timestamp', nullable: true })
    public last_login?: Date;

    @Column({ type: 'int' })
    public rev?: number;

    @Column({ type: 'jsonb' })
    public roles?: string[];

    @Column({ type: 'text', nullable: true })
    public salt?: string;

    @Column({ type: 'text', nullable: true })
    public seed?: string;

    @Column({ type: 'enum', enum: UserStatuses, default: 'ghost' })
    public status: UserStatus;

    @CreateDateColumn({ type: 'timestamp' })
    public created_on?: Date;

    /* PUBLIC */
    public static async createUser(email: string, status: UserStatus, roles: string[], rev: number): Promise<string> {
        const user = new AdminUser();
        user.email = email;
        user.status = status;
        user.roles = roles;
        user.rev = rev;
        user.info = {
            name: {
                firstName: '',
                lastName: ''
            }
        };

        return (await user.save()).id;
    }

    public static async deleteUser(id: string): Promise<boolean> {
        const user = await AdminUser.findOne({ where: { id } });

        if (!user) {
            return false;
        }

        await AdminUser.delete({ id });

        return true;
    }

    public static async edit(id: string, user: User): Promise<void> {
        const { id: found, info } = await AdminUser.findOne({ where: { id } });
        const userRecord = new AdminUser();

        if (!found) {
            throw new NotFoundError(`User id ${id} not found`);
        }


        if (user.status) {
            userRecord.status = user.status;
        }
        if (user.email) {
            userRecord.email = user.email;
        }
        if (user.roles) {
            userRecord.roles = user.roles;
        }
        if (user.info) {
            userRecord.info = {
                ...info,
                ...user.info
            };
        }

        await AdminUser.createQueryBuilder('admin.users')
            .where({ id })
            .update(userRecord)
            .execute();
    }

    public static async editUserAvatar(id: string, avatar: string): Promise<void> {
        if (!await AdminUser.findOne({ where: { id } })) {
            throw new NotFoundError(`User id ${id} not found`);
        }

        await AdminUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ avatar })
            .execute();
    }

    public static async emailExists(email: string): Promise<boolean> {
        return await AdminUser.count({ where: { email } }) > 0;
    }

    public static async enableUser(id: string, enabled: boolean): Promise<boolean> {
        const { status } = await AdminUser.findOne({ where: { id } });

        if (!['enabled', 'disabled'].includes(status)) {
            return false;
        }

        await AdminUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ status: enabled ? 'enabled' : 'disabled' })
            .execute();
        return true;
    }

    public static async getUserInfo(id: string): Promise<UserInfo> {
        if (!await AdminUser.findOne({ where: { id } })) {
            throw new NotFoundError(`User id ${id} not found`);
        }

        const { info } = await AdminUser.findOne({ where: { id } });
        return info || {};
    }

    public static async findByEmail(email: string): Promise<AdminUser> {
        return await AdminUser.findOne({ where: { email } });
    }

    public static async setLastLogin(id: string): Promise<void> {
        await AdminUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ last_login: new Date() })
            .execute();
    }

    public static async setStatus(id: string, status: UserStatus): Promise<void> {
        await AdminUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ status })
            .execute();
    }

    public static async setUserHashAndSalt(id: string, hash: string, salt: string): Promise<void> {
        await AdminUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ hash, salt })
            .execute();
    }

    public static async setUserInfo(id: string, userInfo: UserInfo): Promise<void> {
        let { info } = await AdminUser.findOne({ where: { id } });

        if (!info) {
            info = {};
        }

        await AdminUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ info: Object.assign(info, userInfo) })
            .execute();
    }

    public static async setUserRoles(id: string, roles: string[]): Promise<void> {
        if (!await AdminUser.findOne({ where: { id } })) {
            throw new NotFoundError(`User id ${id} not found`);
        }

        await AdminUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ roles: roles })
            .execute();
    }

    public static async setUserSeed(id: string, seed: string): Promise<void> {
        if (!await AdminUser.findOne({ where: { id } })) {
            throw new NotFoundError(`User id ${id} not found`);
        }

        await AdminUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ seed })
            .execute();
    }

    public static async readUserAvatar(id: string): Promise<string> {
        if (!await AdminUser.findOne({ where: { id } })) {
            throw new NotFoundError(`User id ${id} not found`);
        }

        const { avatar } = await AdminUser.findOne({ where: { id } });
        return avatar;
    }

    public static async userStatusIs(email: string, status: UserStatus): Promise<boolean> {
        const user = await AdminUser.findOne({ where: { email } });

        if (!user) {
            return false;
        }

        return user.status === status;
    }
}
