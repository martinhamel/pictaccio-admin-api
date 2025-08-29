import {
    Authorized,
    Body,
    CurrentUser,
    Get,
    JsonController,
    Post,
    QueryParam,
    Req,
    UnauthorizedError
} from '@loufa/routing-controllers';
import { ResponseSchema } from '@loufa/routing-controllers-openapi';
import { ConfigSchema } from '../../../core/config_schema';
import { logger } from '../../../core/logger';
import { httpCommonFields } from '../../../core/logger_common';
import { ArchiveUserRequest } from '../../../http/shared/controllers/requests/archive_user_request';
import { DeleteUserRequest } from '../../../http/shared/controllers/requests/delete_user_request';
import { EditUserRequest } from '../../../http/shared/controllers/requests/edit_user_request';
import {
    ArchiveAccountResponse
} from '../../../http/shared/controllers/responses/archive_account_response';
import { DeleteUserResponse } from '../../../http/shared/controllers/responses/delete_user_response';
import { EditUserResponse } from '../../../http/shared/controllers/responses/edit_user_response';
import { UserListResponse } from '../../../http/shared/controllers/responses/user_list_response';
import {
    UserPermissionResponse
} from '../../../http/shared/controllers/responses/user_permission_response';
import { RbacService } from '../../../services/rbac_service';
import { UserService } from '../../../services/user_service';
import { Request } from '../../../types/request';
import { User } from '@pictaccio/shared/types/user';
import { Inject, Service } from 'typedi';

@Service()
@JsonController('/user')
export class UserController {
    constructor(@Inject('user') private user: UserService,
        @Inject('rbac') private rbac: RbacService,
        @Inject('config') private config: ConfigSchema) {
    }

    @Authorized('delete:account')
    @Post('/archive')
    @ResponseSchema(ArchiveAccountResponse)
    public async archiveAccount(@CurrentUser() user: User,
        @Body() body: ArchiveUserRequest,
        @Req() request: Request): Promise<ArchiveAccountResponse> {
        logger.info(`[AuthController] User ${user.email} is archiving user id ${body.id}`, {
            area: 'http/web',
            subarea: 'controller/user',
            action: 'user:archive',
            controller_action: 'archiveAccount',
            data: body,
            src_user_email: user.email,
            target_user_id: body.id,
            ...httpCommonFields(request)
        });

        if (user.id === body.id) {
            logger.warn(`[UserController] User ${user.email} attempted to archive their own account`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:archive',
                controller_action: 'archiveAccount',
                data: body,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed',
                context: 'SELF_ARCHIVE'
            };
        }

        await this.user.archive(body.id, body.archive !== false);

        return {
            status: 'great-success'
        };
    }

    @Authorized('delete:account')
    @ResponseSchema(DeleteUserResponse)
    @Post('/delete')
    public async delete(@CurrentUser() user: User,
        @Req() request: Request,
        @Body() body: DeleteUserRequest): Promise<DeleteUserResponse> {
        logger.info(
            `[UserController] User ${user.email} to delete a user.`, {
            area: 'http/web',
            subarea: 'controller/userInfo',
            action: 'user:edit-username',
            controller_action: 'editUsername',
            email: user.email,
            sourceId: user.id,
            targetId: body.id,
            ...httpCommonFields(request)
        });

        try {
            await this.user.delete(body.id);

            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error(
                `[UserController] Deleting user attempted by ${user.email}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/user',
                action: 'user:delete-user',
                controller_action: 'delete',
                email: user.email,
                sourceId: user.id,
                targetId: body.id,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed'
            };
        }
    }

    @Authorized('update:account')
    @ResponseSchema(EditUserResponse)
    @Post('/edit')
    public async edit(@CurrentUser() user: User,
        @Req() request: Request,
        @Body() body: EditUserRequest): Promise<EditUserResponse> {
        logger.info(
            `[UserController] User ${user.email} sent a request to delete a user.`, {
            area: 'http/web',
            subarea: 'controller/userInfo',
            action: 'user:edit-username',
            controller_action: 'editUsername',
            email: user.email,
            sourceId: user.id,
            targetId: body.id,
            ...httpCommonFields(request)
        });

        try {
            await this.user.edit(body.id, body.info);

            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error(
                `[UserController] Editing user ${body.id} failed for ${user.email}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/user',
                action: 'user:edit-user',
                controller_action: 'edit',
                email: user.email,
                sourceId: user.id,
                targetId: body.id,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed'
            };
        }
    }

    @Authorized('read:account', () => true)
    @ResponseSchema(UserPermissionResponse)
    @Get('/permissions')
    public async getPermissions(@CurrentUser() user: User): Promise<UserPermissionResponse> {
        return {
            status: 'great-success',
            roles: user.roles,
            capabilities: user.roles
                .map(role => this.config.roles.capabilities[role])
                .reverse()
                .reduce((combined, capabilities) => Object.assign(combined, capabilities), {})
        };
    }

    @Authorized('read:account')
    @ResponseSchema(UserListResponse)
    @Get('/list')
    public async list(@QueryParam('assignable') assignable: boolean,
        @CurrentUser() user: User,
        @Req() request: Request): Promise<UserListResponse> {
        logger.info(
            `[UserController] User ${user.email} requested a list of users.`, {
            area: 'http/web',
            subarea: 'controller/user',
            action: 'user:list',
            controller_action: 'list',
            ...httpCommonFields(request)
        });

        if (!assignable && request.permissions.some(permission =>
            permission.resource === 'account' && permission.attributes.includes('assignable'))) {
            logger.warn(
                `[UserController] User ${user.email} requested a list of all users but only have assignable` +
                ` permission.`, {
                area: 'http/web',
                subarea: 'controller/user',
                action: 'user:list',
                controller_action: 'list',
                ...httpCommonFields(request)
            });
            throw new UnauthorizedError('You do not have permission to list all users.');
        }

        try {
            const users = await this.user.listAll();

            return {
                status: 'great-success',
                users: assignable
                    ? users.filter(user => this.rbac.can(user.roles, 'read:any', 'order').granted
                        && user.status === 'enabled')
                    : users
            };
        } catch (error) {
            logger.error(
                `[UserController] Listing users failed for user ${user.email}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/user',
                action: 'user:list',
                controller_action: 'list',
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed'
            };
        }
    }
}
