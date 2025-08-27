import { Authorized, Body, CurrentUser, Get, JsonController, Post, Req } from '@loufa/routing-controllers';
import { ResponseSchema } from '@loufa/routing-controllers-openapi';
import { AvatarReadResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/avatar_read_response';
import { Inject, Service } from 'typedi';
import { logger } from '@pictaccio/admin-api/core/logger';
import { httpCommonFields } from '@pictaccio/admin-api/core/logger_common';
import { Request } from '@pictaccio/admin-api/types/request';
import { User } from '@pictaccio/shared/src/types/user';
import { EditUserNameRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/edit_user_name_request';
import { EditUserNameResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/edit_user_name_response';
import { ReadUserNameResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/read_user_name_response';
import { ReadUserSessionInfoResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/read_user_session_info_response';
import { UploadAvatarResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/upload_avatar_response';
import { UserInfoService } from '@pictaccio/admin-api/services/user_info_service';

@Service()
@JsonController('/user-info')
export class UserInfoController {
    constructor(@Inject('user-info') private _userInfo: UserInfoService) {
    }

    @Authorized('update:user-info', () => true)
    @Post('/username/edit')
    public async editUserName(@CurrentUser() user: User,
        @Req() request: Request,
        @Body() body: EditUserNameRequest): Promise<EditUserNameResponse> {
        logger.error(
            `[UserInfoController] User ${user.email} sent a request to change their user name.`, {
            area: 'http/web',
            subarea: 'controller/userInfo',
            action: 'user:edit-username',
            controller_action: 'editUsername',
            email: user.email,
            ...httpCommonFields(request)
        });

        try {
            await this._userInfo.changeUserName(user.email.toLowerCase(), body);
            return { status: 'great-success' };
        } catch (error) {
            logger.error(
                `[UserInfoController] User ${user.email} failed to change their username. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/userInfo',
                action: 'user:edit-username',
                controller_action: 'editUsername',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });
            return {
                status: 'failed'
            };
        }
    }

    @Authorized('read:user-info', () => true)
    @Get('/avatar/read')
    @ResponseSchema(AvatarReadResponse)
    public async readAvatar(@CurrentUser() user: User,
        @Req() request: Request): Promise<AvatarReadResponse> {
        try {
            const avatarPath = await this._userInfo.readAvatar(user.email.toLowerCase());
            return {
                status: 'great-success',
                avatarPath
            };
        } catch (error) {
            logger.error(`[UserInfoController] User ${user.email} failed to fetch their avatar. ` +
                `Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/userInfo',
                action: 'user:read-avatar',
                controller_action: 'readAvatar',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });
            return {
                status: 'failed'
            };
        }
    }

    @Authorized('read:user-info', () => true)
    @Get('/username/read')
    @ResponseSchema(ReadUserNameResponse)
    public async readUserName(@CurrentUser() user: User,
        @Req() request: Request): Promise<ReadUserNameResponse> {
        try {
            const result = await this._userInfo.readUserName(user.email.toLowerCase());
            return {
                status: 'great-success',
                name: result
            };
        } catch (error) {
            logger.error(`[UserInfoController] User ${user.email} failed to read their username. ` +
                `Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/userInfo',
                action: 'user:read-username',
                controller_action: 'readUsername',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });
            return {
                status: 'failed'
            };
        }
    }

    @Authorized('read:user-info')
    @Get('/read')
    @ResponseSchema(ReadUserSessionInfoResponse)
    public async readUserSessionInfo(@CurrentUser() user: User,
        @Req() request: Request): Promise<ReadUserSessionInfoResponse> {
        try {
            const response = await this._userInfo.readUser(user.email.toLowerCase());
            return {
                status: 'great-success',
                info: response
            };
        } catch (error) {
            logger.error(
                `[UserInfoController] User ${user.email} failed to read their session information. ` +
                `Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:user-session/read',
                controller_action: 'readUserSessionInfo',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed'
            };
        }
    }

    @Authorized('update:user-info', () => true)
    @Post('/avatar/update')
    @ResponseSchema(UploadAvatarResponse)
    public async uploadAvatar(@CurrentUser() user: User,
        @Req() request: Request): Promise<UploadAvatarResponse> {
        try {
            await this._userInfo.uploadAvatar(user.email.toLowerCase(), request.files['content']);
        } catch (error) {
            logger.error(
                `[UserInfoController] User ${user.email} failed to upload their avatar. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/userInfo',
                action: 'user:upload-avatar',
                controller_action: 'uploadAvatar',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed'
            };
        }

        return {
            status: 'great-success'
        };
    }
}
