import { logger } from '../core/logger';
import { AdminUser } from '../database/entities/admin_user';
import { User } from '@pictaccio/shared/types/user';
import { Service } from 'typedi';

@Service('user')
export class UserService {
    public async archive(id: string, toggle: boolean): Promise<boolean> {
        logger.info(`[AuthService] Archiving user id ${id}...`, {
            area: 'services',
            subarea: 'user',
            action: 'user:archive',
            userId: id
        });

        if (toggle) {
            await AdminUser.setStatus(id, 'archived');
        } else {
            await AdminUser.setStatus(id, 'enabled');
        }

        logger.info(`[AuthService] ... success`, {
            area: 'services',
            subarea: 'user',
            action: 'user:archive',
            result: 'success',
            userId: id
        });

        return true;
    }

    public async delete(id: string): Promise<boolean> {
        logger.info(`[AuthService] Deleting user id ${id}...`, {
            area: 'services',
            subarea: 'user',
            action: 'user:delete',
            userId: id
        });

        await AdminUser.deleteUser(id);

        logger.info(`[AuthService] ... success`, {
            area: 'services',
            subarea: 'user',
            action: 'user:delete',
            result: 'success',
            userId: id
        });

        return true;
    }

    public async edit(id: string, user: User): Promise<boolean> {
        logger.info(`[AuthService] Changing user id ${id} info...`, {
            area: 'services',
            subarea: 'user',
            userId: id,
            action: 'user:edit',
            user
        });

        await AdminUser.edit(id, user);

        logger.info(`[AuthService] ... success`, {
            area: 'services',
            subarea: 'user',
            action: 'user:edit',
            userId: id,
            result: 'success'
        });

        return true;
    }

    public async listAll(): Promise<User[]> {
        const users = await AdminUser
            .createQueryBuilder('user')
            .orderBy({
                "info->'name'->>'firstName'": "ASC",
                "info->'name'->>'lastName'": "ASC"
            })
            .getMany();

        return users.map(user => ({
            id: user.id,
            status: user.status,
            email: user.email,
            roles: user.roles,
            info: user.info,
            avatar: user.avatar,
            createdOn: user.created_on,
            lastLogin: user.last_login
        }));
    }
}
