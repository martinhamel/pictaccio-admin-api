import { getUniqueFilename } from '@loufa/loufairy-server';
import { checkFileMimeType } from '../utils/checkFileMimeType';
import { extname, join } from 'path';
import { Container, Inject, Service } from 'typedi';
import { ConfigSchema } from '../core/config_schema';
import { logger } from '../core/logger';
import { getMetadata } from '../database/decorators/metadata';
import { AdminUser } from '../database/entities/admin_user';
import { UserNotFoundError } from '../errors/user_not_found_error';
import { InvalidFormatError } from '../errors/invalid_format_error';
import { User } from '@pictaccio/shared/types/user';
import { UserInfo } from '@pictaccio/shared/types/user_info';
import { UserName } from '@pictaccio/shared/types/user_name';
import { UserStatuses } from '@pictaccio/shared/types/user_status';

@Service('user-info')
export class UserInfoService {
    public async changeUserName(email: string, name: UserName): Promise<void> {
        logger.info(`[UserInfoService] Changing username for ${email}...`, {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:edit-username',
            email
        });

        // Check if user exist...
        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[UserInfoService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'userInfo',
                action: 'userInfo:edit-username',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Set the name
        const { id } = await AdminUser.findByEmail(email);
        await AdminUser.setUserInfo(id, { name });

        logger.info('[UserInfoService] ...success', {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:edit-username',
            result: 'success',
            email
        });
    }

    public async readAvatar(email: string): Promise<string> {
        logger.info(`[AuthService] Reading Avatar for ${email}...`, {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:upload-avatar',
            email
        });

        // Check if user exist...
        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'userInfo',
                action: 'userInfo:upload-avatar',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Get the avatar
        const { id } = await AdminUser.findByEmail(email);
        const image = await AdminUser.readUserAvatar(id);

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:read-avatar',
            result: 'success',
            email
        });

        return image;
    }

    public async readUserName(email: string): Promise<UserName> {
        logger.info(`[UserInfoService] Reading username for ${email}...`, {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:read-username',
            email
        });

        // Check if user exist...
        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[UserInfoService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'userInfo',
                action: 'userInfo:read-username',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Get the name
        const { id } = await AdminUser.findByEmail(email);
        const { name } = await AdminUser.getUserInfo(id);

        logger.info('[UserInfoService] ...success', {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:read-username',
            result: 'success',
            email
        });

        return name;
    }

    public async readUser(email: string): Promise<User> {
        logger.info(`[AuthService] reading user session info for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:user-session/read',
            email
        });

        // Check if user exist...
        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:user-session/read',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Get user session info
        const { roles, created_on, last_login } = await AdminUser.findByEmail(email);
        const user: User = {
            email,
            roles,
            createdOn: created_on,
            lastLogin: last_login
        };

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:user-session/read',
            result: 'success',
            email
        });

        return user;
    }

    public async uploadAvatar(email: string, image: any): Promise<void> {
        logger.info(`[AuthService] Uploading Avatar for ${email}...`, {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:upload-avatar',
            email
        });

        // Check if user exist...
        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'userInfo',
                action: 'userInfo:upload-avatar',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        const imageMimeType = process.platform === 'win32'
            ? 'image/jpeg'
            : await checkFileMimeType(image.data);

        if (!['image/jpeg', 'image/png'].includes(imageMimeType)) {
            logger.error(`[AuthService] ...failed. Reason: User ${email} has sent a non supported format`, {
                area: 'services',
                subarea: 'userInfo',
                action: 'userInfo:upload-avatar',
                result: 'failed',
                email
            });
            throw new InvalidFormatError();
        }

        const { id } = await AdminUser.findByEmail(email);
        const modelMetadata = getMetadata(AdminUser);
        const destinationDir = modelMetadata.allowedUploads['avatar'].path;
        const fileOnDisk = await getUniqueFilename(join(destinationDir, id, extname(image.name)));
        image.mv(fileOnDisk);

        const config: ConfigSchema = Container.get<ConfigSchema>('config');
        const fileName: string = fileOnDisk.slice(config.env.dirs.public.length + 1).replace(/\\/g, '/');

        // Set the avatar
        await AdminUser.editUserAvatar(id, fileName);
        await AdminUser.setStatus(id, 'enabled');

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:upload-avatar',
            result: 'success',
            email
        });
    }
}
