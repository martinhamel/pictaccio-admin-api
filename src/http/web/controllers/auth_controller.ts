import {
    Authorized,
    Body,
    CurrentUser,
    Get,
    JsonController,
    Post,
    QueryParams,
    Req,
    Res,
    Session
} from '@loufa/routing-controllers';
import { ResponseSchema } from '@loufa/routing-controllers-openapi';
import { ConfigSchema } from '../../../core/config_schema';
import { logger } from '../../../core/logger';
import { httpCommonFields } from '../../../core/logger_common';
import { MailerInterface } from '../../../core/mailer_interface';
import { AdminInvite } from '../../../database/entities/admin_invite';
import { AdminUser } from '../../../database/entities/admin_user';
import { InvalidResetCodeError } from '../../../errors/invalid_reset_code_error';
import { NotEnabledError } from '../../../errors/not_enabled_error';
import { UserExistError } from '../../../errors/user_exist_error';
import { UserNotFoundError } from '../../../errors/user_not_found_error';
import { WrongSecretError } from '../../../errors/wrong_secret_error';
import { WrongTOTPTokenError } from '../../../errors/wrong_totp_token_error';
import { ChangePasswordRequest } from '../../../http/shared/controllers/requests/change_password_request';
import { CompleteInviteRequest } from '../../../http/shared/controllers/requests/complete_invite_request';
import {
    CompletePasswordResetRequest
} from '../../../http/shared/controllers/requests/complete_password_reset_request';
import { CreateAccountRequest } from '../../../http/shared/controllers/requests/create_account_request';
import { DeleteAccountRequest } from '../../../http/shared/controllers/requests/delete_account_request';
import { EditAccountRequest } from '../../../http/shared/controllers/requests/edit_account_request';
import { FinishInviteRequest } from '../../../http/shared/controllers/requests/finish_invite_request';
import { InitiateInviteRequest } from '../../../http/shared/controllers/requests/initiate_invite_request';
import {
    InitiatePasswordResetRequest
} from '../../../http/shared/controllers/requests/initiate_password_reset_request';
import { LoginRequest } from '../../../http/shared/controllers/requests/login_request';
import {
    ValidatePasswordRequest
} from '../../../http/shared/controllers/requests/validate_password_request';
import {
    ValidateResetPasswordCodeRequest
} from '../../../http/shared/controllers/requests/validate_reset_password_code_request';
import {
    VerifyAuthenticatorRequest
} from '../../../http/shared/controllers/requests/verify_authenticator_request';
import {
    VerifyInviteTokenRequest
} from '../../../http/shared/controllers/requests/verify_invite_token_request';
import {
    ChangePasswordResponse
} from '../../../http/shared/controllers/responses/change_password_response';
import {
    CompleteInviteResponse
} from '../../../http/shared/controllers/responses/complete_invite_response';
import {
    CompletePasswordResetResponse
} from '../../../http/shared/controllers/responses/complete_password_reset_response';
import { CreateAccountResponse } from '../../../http/shared/controllers/responses/create_account_response';
import { DeleteAccountResponse } from '../../../http/shared/controllers/responses/delete_account_response';
import { EditAccountResponse } from '../../../http/shared/controllers/responses/edit_account_response';
import { FinishInviteResponse } from '../../../http/shared/controllers/responses/finish_invite_response';
import {
    InitiateInviteResponse
} from '../../../http/shared/controllers/responses/initiate_invite_response';
import {
    InitiatePasswordResetResponse
} from '../../../http/shared/controllers/responses/initiate_password_reset_response';
import { LoginResponse } from '../../../http/shared/controllers/responses/login_response';
import {
    ResetAuthenticatorResponse
} from '../../../http/shared/controllers/responses/reset_authenticator_response';
import {
    ValidateInviteTokenResponse
} from '../../../http/shared/controllers/responses/validate_invite_token_response';
import {
    ValidatePasswordResponse
} from '../../../http/shared/controllers/responses/validate_password_response';
import {
    ValidateResetPasswordCodeResponse
} from '../../../http/shared/controllers/responses/validate_reset_password_code_response';
import {
    VerifyAuthenticatorResponse
} from '../../../http/shared/controllers/responses/verify_authenticator_response';
import { AuthService } from '../../../services/auth_service';
import CommunicationService from '../../../services/communication_service';
import StoreConfigService from '../../../services/store_config_service';
import { Request } from '../../../types/request';
import { UserSession } from '../../../types/user_session';
import { ensureTrailingSlash } from '../../../utils/ensure_trailing_slash';
import { User } from '@pictaccio/shared/types/user';
import { Response } from 'express';
import { Inject, Service } from 'typedi';

@Service()
@JsonController('/auth')
export class AuthController {
    constructor(@Inject('auth') private auth: AuthService,
        @Inject('communication') private communication: CommunicationService,
        @Inject('config') private config: ConfigSchema,
        @Inject('mailer') private mailer: MailerInterface,
        @Inject('store-config') private storeConfig: StoreConfigService) {
    }

    @Authorized('update:account', () => true)
    @Post('/change-password')
    @ResponseSchema(ChangePasswordResponse)
    public async changePassword(@CurrentUser() user: User,
        @Req() request: Request,
        @Body() body: ChangePasswordRequest): Promise<ChangePasswordResponse> {
        try {
            await this.auth.changePassword(user.email.toLowerCase(), body.secret);
            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error(
                `[AuthController] User ${user.email} failed to change their password. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:validate-password',
                controller_action: 'changePassword',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });
            return {
                status: 'failed'
            };
        }
    }

    @Authorized('create:account')
    @Post('/create-account')
    @ResponseSchema(CreateAccountResponse)
    public async createAccount(@Body() body: CreateAccountRequest,
        @Req() request: Request,
        @Res() response: Response): Promise<CreateAccountResponse> {

        try {
            const id = await this.auth.createLocal(body.email.toLowerCase(), body.secret, body.roles);
            const { otpUri, seed } = await this.auth.initializeResetTOTP(body.email.toLowerCase());
            await this.auth.confirmResetTOTP(body.email.toLowerCase(), seed);

            logger.info(`[AuthController] A user with email ${body.email} successfully created a new account`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:create',
                controller_action: 'createAccount',
                ...httpCommonFields(request)
            });

            return {
                status: 'great-success',
                id,
                otpUri
            };
        } catch (error) {
            logger.error(`[AuthController] A user with email ${body.email} attempted to create a ` +
                `new account but the operation failed. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:create',
                controller_action: 'createAccount',
                error,
                ...httpCommonFields(request)
            });

            // Don't differentiate between UserNotFoundError or other kind of error,
            // just return a generic status: failed
            return {
                status: 'failed',
                context: 'UNKNOWN_FAILURE'
            };
        }
    }

    @Post('/complete-invite')
    @ResponseSchema(CompleteInviteResponse)
    public async completeInvite(@Body() body: CompleteInviteRequest,
        @Req() request: Request,
        @Res() response: Response): Promise<CompleteInviteResponse> {

        const invite = await AdminInvite.findByToken(body.inviteToken);

        if (invite.email.toLowerCase() !== body.email.toLowerCase()) {
            logger.error(`[AuthController] A user with email ${body.email} attempted to complete an invitation but ` +
                `the provided email address does not match our records`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:complete-invive',
                controller_action: 'completeInvite',
                ...httpCommonFields(request)
            });

            response.statusCode = 400;
            return {
                status: 'failed',
                context: 'UNKNOWN_FAILURE'
            };
        }

        const { id, otpUri } = await this.auth.completeInvite(body.email.toLowerCase(), body.secret);

        logger.info(`[AuthController] User ${body.email} successfully completed their invitation`, {
            area: 'http/web',
            subarea: 'controller/auth',
            action: 'user:complete-invite',
            controller_action: 'completeInvite',
            ...httpCommonFields(request)
        });

        return {
            status: 'great-success',
            id,
            otpUri
        };
    }

    @Post('/complete-password-reset')
    @ResponseSchema(CompletePasswordResetResponse)
    public async completePasswordReset(
        @Req() request: Request,
        @Body() body: CompletePasswordResetRequest): Promise<CompletePasswordResetResponse> {

        try {
            await this.auth.completePasswordReset(body.email, body.resetToken, body.code, body.secret);

            logger.info(`[AuthController] User ${body.email} successfully reset their password`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:complete-password-reset',
                controller_action: 'completePasswordReset',
                ...httpCommonFields(request)
            });

            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error(`[AuthController] User ${body.email} attempted to complete a password reset but the ` +
                `operation failed. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:complete-password-reset',
                controller_action: 'completePasswordReset',
                error,
                ...httpCommonFields(request)
            });

            if (error instanceof InvalidResetCodeError) {
                return {
                    status: 'failed',
                    context: 'INVALID_CODE'
                };
            }

            return {
                status: 'error',
                context: 'UNKNOWN_FAILURE'
            };
        }
    }

    @Authorized('update:account')
    @Post('/confirm-reset-authenticator')
    public async confirmResetAuthenticator(@CurrentUser() user: User,
        @Session() session: UserSession,
        @Req() request: Request): Promise<ResetAuthenticatorResponse> {

        try {
            await this.auth.confirmResetTOTP(user.email.toLowerCase(), session.seed);
        } catch (error) {
            logger.error(`[AuthController] User ${user.email} failed to confirm the reset of their TOTP seed. ` +
                `Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:confirm-reset-authenticator',
                controller_action: 'resetAuthenticator',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed'
            };
        }

        logger.info(`[AuthController] User ${user.email} successfully reset their TOPT seed`, {
            area: 'http/web',
            subarea: 'controller/auth',
            action: 'user:confirm-reset-authenticator',
            controller_action: 'resetAuthenticator',
            email: user.email,
            ...httpCommonFields(request)
        });

        return {
            status: 'great-success'
        };
    }

    @Authorized('delete:account')
    @Post('/delete-account')
    @ResponseSchema(DeleteAccountResponse)
    public async deleteAccount(@CurrentUser() user,
        @Body() body: DeleteAccountRequest,
        @Req() request: Request): Promise<DeleteAccountResponse> {
        logger.info(`[AuthController] User ${user.email} is deleting user id ${body.id}`, {
            area: 'http/web',
            subarea: 'controller/auth',
            action: 'user:delete',
            controller_action: 'deleteAccount',
            data: body,
            ...httpCommonFields(request)
        });

        if (user.id === body.id) {
            logger.warn(`[AuthController] User ${user.email} attempted to delete their own account`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'auth:delete',
                controller_action: 'deleteAccount',
                data: body,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed',
                context: 'SELF_DELETE'
            };
        }

        await this.auth.deleteUser(body.id);

        return {
            status: 'great-success'
        };
    }

    @Authorized('update:account', () => true)
    @Post('/edit-account')
    @ResponseSchema(EditAccountResponse)
    public async editAccount(@CurrentUser() user,
        @Body() body: EditAccountRequest,
        @Req() request: Request): Promise<EditAccountResponse> {
        logger.info(`[AuthController] User ${user.email} is editing user id ${body.id}`, {
            area: 'http/web',
            subarea: 'controller/auth',
            action: 'user:edit',
            controller_action: 'editAccount',
            data: body,
            ...httpCommonFields(request)
        });

        if (body.roles) {
            await this.auth.setUserRoles(body.id, body.roles);
        }

        if (body.name) {
            await this.auth.setUserInfo(body.id, {
                name: body.name
            });
        }

        return {
            status: 'great-success'
        };
    }

    @Post('/finish-invite')
    @ResponseSchema(FinishInviteResponse)
    public async finishInvite(@Body() body: FinishInviteRequest,
        @Req() request: Request): Promise<FinishInviteResponse> {
        const { id } = await AdminUser.findByEmail(body.email.toLowerCase());
        await AdminInvite.delete({ id: body.inviteToken });
        await AdminUser.setStatus(id, 'enabled');

        logger.info(`[AuthController] User ${body.email} successfully finished their invitation`, {
            area: 'http/web',
            subarea: 'controller/auth',
            action: 'user:complete-invite',
            controller_action: 'completeInvite',
            ...httpCommonFields(request)
        });

        return {
            status: 'great-success'
        };
    }

    @Authorized('update:account')
    @Post('/initialize-reset-authenticator')
    public async initializeResetAuthenticator(@CurrentUser() user: User,
        @Session() session: UserSession,
        @Req() request: Request): Promise<ResetAuthenticatorResponse> {

        let uri: string;

        try {
            const { otpUri, seed } = await this.auth.initializeResetTOTP(user.email.toLowerCase());
            uri = otpUri;
            session.seed = seed;
        } catch (error) {
            logger.error(`[AuthController] User ${user.email} failed to initiate the reset their TOTP seed. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:initialize-reset-authenticator',
                controller_action: 'resetAuthenticator',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed'
            };
        }

        logger.info(`[AuthController] User ${user.email} successfully initialized the reset of their TOPT seed`, {
            area: 'http/web',
            subarea: 'controller/auth',
            action: 'user:initialize-reset-authenticator',
            controller_action: 'resetAuthenticator',
            email: user.email,
            ...httpCommonFields(request)
        });

        return {
            status: 'great-success',
            uri
        };
    }

    @Authorized('create:account')
    @Post('/initiate-invite')
    @ResponseSchema(InitiateInviteResponse)
    public async initiateInvite(@CurrentUser() user: User,
        @Session() session: UserSession,
        @Body() body: InitiateInviteRequest,
        @Req() request: Request,
        @Res() response: Response): Promise<InitiateInviteResponse> {
        try {
            const id = await this.auth.initiateInviteLocal(body.name, body.email.toLowerCase(), body.roles);
            const inviteToken = await AdminInvite.createInvite(id, body.email.toLowerCase());

            await this.communication.sendInvite({
                lang: await this.storeConfig.primaryLanguage(),
                inviteLink:
                    `${ensureTrailingSlash(this.config.env.rootUrl.gui)}invite/` +
                    `${body.email.toLowerCase()}/${inviteToken}`,
                inviterName: `${user.info.name.firstName} ${user.info.name.lastName}`,
                inviteeName: `${body.name.firstName} ${body.name.lastName}`,
                inviteeEmail: body.email
            });

            logger.info(`[AuthController] User ${user?.email} successfully invited ${body.email}.`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:initiate-invite',
                controller_action: 'initiateInvite',
                initiatingUser: user?.email,
                invitee: body.email,
                roles: body.roles,
                ...httpCommonFields(request)
            });

            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error(`[AuthController] User ${user?.email} invited ${body.email} but failed. ` +
                `Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:initiate-invite',
                controller_action: 'initiateInvite',
                initiatingUserEmail: user?.email,
                inviteeEmail: body.email,
                roles: body.roles,
                error: error,
                ...httpCommonFields(request)
            });

            response.statusCode = 400;
            if (error instanceof UserExistError) {
                return {
                    status: 'failed',
                    context: 'USER_EXIST'
                };
            } else {
                return {
                    status: 'failed',
                    context: 'UNKNOWN_FAILURE'
                };
            }
        }
    }

    @Get('/initiate-password-reset')
    @ResponseSchema(InitiatePasswordResetResponse)
    public async initiatePasswordReset(
        @Req() request: Request,
        @QueryParams() query: InitiatePasswordResetRequest): Promise<InitiatePasswordResetResponse> {

        try {
            const { email, info } = await AdminUser.findByEmail(query.email);

            if (email) {
                const code = await this.auth.initiatePasswordReset(email);

                await this.communication.sendResetPassword({
                    lang: await this.storeConfig.primaryLanguage(),
                    resetCode: code,
                    userName: `${info.name.firstName} ${info.name.lastName}`,
                    userEmail: email
                });

                logger.info(`[AuthController] Initiating a password reset for ${email}`, {
                    area: 'http/web',
                    subarea: 'controller/auth',
                    action: 'user:initiate-password-reset',
                    controller_action: 'initiatePasswordReset',
                    email,
                    ...httpCommonFields(request)
                });
            }

            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error(`[AuthController] There was an error while initiating a password reset for ${query.email}.` +
                `Error: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:initiate-password-reset',
                controller_action: 'initiatePasswordReset',
                email: query.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error'
            };
        }
    }

    @Post('/login')
    public async login(@Body() body: LoginRequest,
        @Req() request: Request,
        @Res() response: Response): Promise<LoginResponse> {
        let id: string;
        let token: string;

        try {
            ({ id, token } = await this.auth.authenticateLocal(body.email.toLowerCase(), body.secret, body.token));
        } catch (error) {
            if (error instanceof UserNotFoundError ||
                error instanceof WrongSecretError ||
                error instanceof WrongTOTPTokenError ||
                error instanceof NotEnabledError) {

                response.statusCode = 400;
                return {
                    status: 'failed',
                    context: 'USER_OR_PASS_OR_TOKEN_INCORRECT'
                };
            } else {
                logger.error(`[AuthController] A user with email ${body.email} attempted to login but failed. ` +
                    `Reason: ${error.message}`, {
                    area: 'http/web',
                    subarea: 'controller/auth',
                    action: 'user:login',
                    loginType: 'local',
                    controller_action: 'login',
                    email: body.email,
                    error,
                    ...httpCommonFields(request)
                });

                response.statusCode = 500;
                return {
                    status: 'error',
                    context: 'UNKNOWN_FAILURE'
                };
            }
        }

        logger.info(`[AuthController] User ${body.email} successfully logged in`, {
            area: 'http/web',
            subarea: 'controller/auth',
            action: 'user:login',
            loginType: 'local',
            controller_action: 'login',
            email: body.email
        });

        return {
            status: 'great-success',
            token,
            id
        };
    }

    @Get('/validate-invite-token')
    @ResponseSchema(ValidateInviteTokenResponse)
    public async validateInviteToken(
        @Req() request: Request,
        @QueryParams() query: VerifyInviteTokenRequest): Promise<ValidateInviteTokenResponse> {
        const valid = await this.auth.validateInviteToken(query.email, query.token);
        const user = valid ? await AdminUser.findByEmail(query.email) : null;

        logger.info(`[AuthController] An invitee with email ${query.email} opened` +
            `${valid ? 'a valid invite' : 'an invalid invite'}`, {
            area: 'http/web',
            subarea: 'controller/auth',
            action: 'user:verify-invite-token',
            controller_action: 'validateInviteToken',
            email: query.email,
            ...httpCommonFields(request)
        });

        return {
            status: valid ? 'great-success' : 'failed',
            user
        };
    }

    @Authorized('read:account', () => true)
    @Post('/validate-password')
    @ResponseSchema(ValidatePasswordResponse)
    public async validatePassword(@CurrentUser() user: User,
        @Req() request: Request,
        @Body() body: ValidatePasswordRequest): Promise<ValidatePasswordResponse> {
        let response: boolean;

        try {
            response = await this.auth.verifyPassword(user.email.toLowerCase(), body.secret);
        } catch (error) {
            logger.error(
                `[AuthController] User ${user.email} failed to verify their password. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:validate-password',
                controller_action: 'validatePassword',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                valid: false,
                status: 'failed'
            };
        }

        logger.info(`[AuthController] User ${user.email} successfully verify their password`, {
            area: 'http/web',
            subarea: 'controller/auth',
            action: 'user:validate-password',
            controller_action: 'validatePassword',
            email: user.email,
            ...httpCommonFields(request)
        });

        return {
            status: 'great-success',
            valid: response
        };
    }

    @Get('/validate-reset-password-code')
    @ResponseSchema(ValidateResetPasswordCodeResponse)
    public async validateResetPasswordCode(
        @Req() request: Request,
        @QueryParams() query: ValidateResetPasswordCodeRequest): Promise<ValidateResetPasswordCodeResponse> {

        try {
            const result = await this.auth.checkPasswordResetCode(query.email, query.code);

            logger.info(`[AuthController] A user with email ${query.email} validated their password reset code`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:validate-password-reset-code',
                controller_action: 'validateResetPasswordCode',
                email: query.email,
                ...httpCommonFields(request)
            });

            return {
                status: result.valid ? 'great-success' : 'failed',
                resetToken: result.valid ? result.resetToken : undefined
            };
        } catch (error) {
            logger.error(`[AuthController] A user with email ${query.email} attempted to check password reset code ` +
                `${query.code}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/auth',
                action: 'user:validate-password-reset-code',
                controller_action: 'validateResetPasswordCode',
                email: query.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_FAILURE'
            };
        }
    }

    @Get('/verify-authenticator')
    public async verifyAuthenticator(
        @Req() request: Request,
        @Session() session: UserSession,
        @QueryParams() query: VerifyAuthenticatorRequest): Promise<VerifyAuthenticatorResponse> {
        const valid = await this.auth.validateAuthenticatorToken(query.email, query.token, session.seed);

        logger.info(`[AuthController] A user with email ${query.email} validated their password reset code`, {
            area: 'http/web',
            subarea: 'controller/auth',
            action: 'user:verify-authenticator-code',
            controller_action: 'verifyAuthenticator',
            email: query.email,
            valid,
            ...httpCommonFields(request)
        });

        return {
            status: valid ? 'great-success' : 'failed'
        };
    }
}
