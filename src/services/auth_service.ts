import { ConfigSchema } from '../core/config_schema';
import { logger } from '../core/logger';
import { AdminInvite } from '../database/entities/admin_invite';
import { AdminResetRequest } from '../database/entities/admin_reset_request';
import { AdminUser } from '../database/entities/admin_user';
import { InvalidResetCodeError } from '../errors/invalid_reset_code_error';
import { NotEnabledError } from '../errors/not_enabled_error';
import { UserExistError } from '../errors/user_exist_error';
import { UserNotFoundError } from '../errors/user_not_found_error';
import { WrongSecretError } from '../errors/wrong_secret_error';
import { WrongTOTPTokenError } from '../errors/wrong_totp_token_error';
import { AuthenticatedUser } from '../types/authenticated_user';
import { ResourceIdentifier } from '@pictaccio/shared/types/resource_identifier';
import { ResourceTokenData } from '@pictaccio/shared/types/resource_token_data';
import { TokenData } from '@pictaccio/shared/types/token_data';
import { User } from '@pictaccio/shared/types/user';
import { UserInfo } from '@pictaccio/shared/types/user_info';
import { UserName } from '@pictaccio/shared/types/user_name';
import { pbkdf2, randomBytes } from 'crypto';
import { Secret, sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { Inject, Service } from 'typedi';
import { promisify } from 'util';

const CURRENT_REV = 1;

@Service('auth')
export class AuthService {
    constructor(@Inject('config')
    private config: ConfigSchema) {
    }

    /**
     * Authenticate a user against the local database
     * @param email Email address of the user
     * @param password The password
     * @param totpToken The one-time authenticator key
     */
    public async authenticateLocal(email: string, password: string, totpToken: string): Promise<AuthenticatedUser> {
        logger.info(`[AuthService] Authenticating user ${email} locally...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:authenticate-local',
            email
        });

        // Check if user exist...
        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:authenticate-local',
                result: 'failed',
                context: 'user-not-found',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Check if password is correct...
        const { id, status, hash, salt, seed, rev } = (await AdminUser.findByEmail(email));
        switch (rev) {
            case 1:
                if (await this._hashRev1(salt + password, salt) !== hash) {
                    logger.warn(`[AuthService] ...failed. Reason: User ${email} entered an incorrect password`, {
                        area: 'services',
                        subarea: 'auth',
                        action: 'auth:authenticate-local',
                        result: 'failed',
                        context: 'incorrect-password',
                        email
                    });
                    throw new WrongSecretError(email);
                }
        }

        if (status !== 'enabled') {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} isn't enabled`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:authenticate-local',
                result: 'failed',
                context: 'user-not-enabled',
                email
            });
            throw new NotEnabledError(email);
        }

        // Check if TOTP is correct...
        if (!authenticator.check(totpToken, seed)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} has failed totp test`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:authenticate-local',
                result: 'failed',
                context: 'incorrect-totp',
                email
            });
            throw new WrongTOTPTokenError(email);
        }

        await AdminUser.setLastLogin(id);

        logger.info(`[AuthService] ...success`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:authenticate-local',
            result: 'success',
            email
        });

        return {
            id,
            token: sign({ id, email }, this.config.auth.secret)
        };
    }

    /**
     * Change the password for a user
     * @param email The email address
     * @param secret The new password
     */
    public async changePassword(email: string, secret: string): Promise<void> {
        logger.info(`[AuthService] changing password for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:change-password',
            email
        });

        // Check if user exist...
        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:change-password',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Change password
        const { id, status, hash, salt, seed, rev } = (await AdminUser.findByEmail(email));
        const newHash = await this._hashRev1(salt + secret, salt);
        await AdminUser.setUserHashAndSalt(id, newHash, salt);

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:change-password',
            result: 'success',
            email
        });
    }

    /**
     * Check if a password reset code is valid and not expired for a given email address
     * @param email The email address
     * @param code The code to verify
     */
    public async checkPasswordResetCode(email: string, code: string): Promise<{ valid: boolean, resetToken: string }> {
        logger.info(`[AuthService] Checking password reset code for user ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:check-password-reset-code',
            email
        });

        // Check if user exist...
        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:check-password-reset-code',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:check-password-reset-code',
            result: 'success',
            email
        });
        return await AdminResetRequest.checkResetEntry(email, code);
    }

    /**
     * Complete the invite process
     * @param email The email
     * @param secret The secret
     */
    public async completeInvite(email: string, secret: string): Promise<{ id: string, otpUri: string }> {
        logger.info(`[AuthService] Completing invite for ${email}`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:complete-invite',
            email
        });

        const { id } = await AdminUser.findByEmail(email);
        const { otpUri, seed } = await this.initializeResetTOTP(email);
        await this._setUserSecret(id, secret);
        await AdminUser.setUserSeed(id, seed);

        return {
            id,
            otpUri: otpUri
        };
    }

    /**
     * Complete a password request. The operation will success if the code and resetToken match our record
     * @param email The email address to reset the password for
     * @param resetToken The reset token
     * @param code The code
     * @param secret The secret
     */
    public async completePasswordReset(
        email: string, resetToken: string, code: string, secret: string): Promise<void> {

        logger.info(`[AuthService] Completing password reset for user ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:complete-password-reset',
            email
        });

        const { id } = await AdminUser.findByEmail(email);

        // Check if user exist...
        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:complete-password-reset',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        if (!(await AdminResetRequest.checkResetEntry(email, code, resetToken)).valid) {
            logger.warn(`[AuthService] ...failed. Reason: Incorrect reset code or token`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:complete-password-reset',
                result: 'failed',
                email
            });
            throw new InvalidResetCodeError(email);
        }

        await AdminResetRequest.deleteFromResetToken(resetToken);

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:complete-password-reset',
            result: 'success',
            email
        });
        await this._setUserSecret(id, secret);
    }

    /**
     * Confirm the resetting of the TOTP in the database
     * @param email
     * @param seed
     */
    public async confirmResetTOTP(email: string, seed: string): Promise<string> {
        logger.info(`[AuthService] Confirm resetting TOTP for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:confirm-reset-totp',
            email
        });

        // Check if user exist...
        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:confirm-reset-totp',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        const { id } = await AdminUser.findByEmail(email);
        await AdminUser.setUserSeed(id, seed);
        await AdminUser.setStatus(id, 'enabled');

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:confirm-reset-totp',
            result: 'success',
            email
        });

        return 'great-success';
    }

    /**
     * Create a user in the local db
     * @param email Email of the user
     * @param secret The secret
     * @param roles The roles the user has
     */
    public async createLocal(email: string, secret: string, roles: string[]): Promise<string> {
        logger.info(`[AuthService] Creating user ${email}...`);

        // Check if user exist...
        if (await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} exist in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:create-local',
                result: 'failed',
                email
            });
            throw new UserExistError(email);
        }

        // Create user
        const id = await AdminUser.createUser(email, 'created', roles, CURRENT_REV);
        await this._setUserSecret(id, secret);
        await AdminUser.setStatus(id, 'created');

        // At this point the user can't be logged into until the authenticator
        // seed has been generated with resetTOTP

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:create-local',
            result: 'success',
            email
        });
        return id;
    }

    /**
     * Delete a user from the database
     * @param id
     */
    public async deleteUser(id: string): Promise<void> {
        logger.info(`[AuthService] Deleting user id ${id}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:delete-user',
            targetUserId: id
        });

        if (await AdminUser.deleteUser(id)) {
            logger.info('[AuthService] ...success', {
                area: 'services',
                subarea: 'auth',
                action: 'auth:delete-user',
                result: 'success',
                targetUserId: id
            });
        } else {
            logger.error(`[AuthService] Failed to delete user id ${id}`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:delete-user',
                result: 'failed',
                targetUserId: id
            });
        }
    }

    /**
     * Enable or disable a user. Disabled users cannot login
     * @param id The id of the user to enable/disable
     * @param enabled Whether the user should be enabled/disabled
     */
    public async enableUser(id: string, enabled: boolean): Promise<void> {
        logger.info(`[AuthService] ${enabled ? 'Enabling ' : 'Disabling '} user id ${id}`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:enable-user',
            targetUserId: id,
            enabled
        });

        if (await AdminUser.enableUser(id, enabled)) {
            logger.error(`[AuthService] Failed to ${enabled ? 'enable ' : 'disable '} user id ${id}`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:enable-user',
                result: 'failed',
                targetUserId: id,
                enabled
            });
        } else {
            logger.info('[AuthService] ...success', {
                area: 'services',
                subarea: 'auth',
                action: 'auth:enable-user',
                result: 'success',
                targetUserId: id,
                enabled
            });
        }
    }

    /**
     * Reset OTP seed for an email
     * @param email An email address
     */
    public async initializeResetTOTP(email: string): Promise<{ otpUri: string, seed: string }> {
        logger.info(`[AuthService] Initialize resetting TOTP for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initialize-reset-totp',
            email
        });

        // Check if user exist...
        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:initialize-reset-totp',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Generate a new seed
        const seed = authenticator.generateSecret();
        const otpUri = authenticator.keyuri(email, 'Pictaccio', seed);

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initialize-reset-totp',
            result: 'success',
            email
        });

        return { otpUri, seed };
    }

    /**
     * Start an invitation process by reserving the email address in the db
     * @param name
     * @param email The email address
     * @param roles The roles the invited user will have
     */
    public async initiateInviteLocal(name: UserName, email: string, roles: string[]): Promise<string> {
        logger.info(`[AuthService] Inviting ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initiate-invite-local',
            email
        });

        if (await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} exist in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:initiate-invite-local',
                result: 'failed',
                email
            });
            throw new UserExistError(email);
        }

        // Create user
        const id = await AdminUser.createUser(email, 'invited', roles, CURRENT_REV);
        await AdminUser.setUserInfo(id, {
            name
        });
        await AdminUser.setStatus(id, 'invited');

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initiate-invite-local',
            result: 'success',
            email
        });
        return id;
    }

    /**
     * Initiate a password reset by sending an 8-digit code to the email address requested if it exist in the database
     * @param email The email address to reset the password for
     */
    public async initiatePasswordReset(email: string): Promise<string> {
        logger.info(`[AuthService] Initiating password reset for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initiate-password-reset',
            email
        });

        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User doesn't exist in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:initiate-password-reset',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        await AdminResetRequest.deleteFromEmail(email);

        const { id } = await AdminUser.findByEmail(email);
        const code = this._generateResetPasswordCode();
        AdminResetRequest.createResetEntry(id, email, code);

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initiate-password-reset',
            result: 'success',
            email
        });
        return code;
    }

    /**
     * Generate a resource token for unattended access
     * @param sourceUserId The user id of the source user
     * @param resources The resources to access
     * @param duration The duration of the token in seconds
     */
    public async generateResourceToken(sourceUserId: string,
        resources: ResourceIdentifier[],
        duration: number = this.config.auth.resourceTokenDefaultExpiry): Promise<string> {
        logger.info(`[AuthService] Generating resource token for user id ${sourceUserId}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:resource-token',
            sourceUserId,
            resources
        });

        return await promisify<ResourceTokenData, string, SignOptions, string>(sign)({
            sourceUserId,
            resources
        }, this.config.auth.resourceSecret, {
            expiresIn: duration
        });
    }

    public async verifyPassword(email: string, secret: string): Promise<boolean> {
        logger.info(`[AuthService] verifying password for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:verify-password',
            email
        });

        // Check if user exist...
        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:verify-password',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Check if password is correct...
        let result = false;
        const { id, status, hash, salt, seed, rev } = (await AdminUser.findByEmail(email));

        if (await this._hashRev1(salt + secret, salt) !== hash) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} entered an incorrect password`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:verify-secret',
                result: 'failed',
                context: 'incorrect-password',
                email
            });
            result = false;
            throw new WrongSecretError(email);
        }
        else {
            result = true;
        }

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:verify-password',
            result: 'success',
            email
        });

        return result;
    }

    /**
     * Identify a user behind a token
     * @param token The token
     */
    public async userFromToken(token: string): Promise<User> {
        try {
            const decoded: TokenData =
                await promisify<string, Secret, VerifyOptions, TokenData>(verify)(
                    token, this.config.auth.secret, {});

            return decoded.id ? await this._userAsInterface(decoded.id) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Validate a token
     * @param token  The token
     */
    public async validateAuthentication(token: string): Promise<boolean> {
        try {
            await promisify<string, Secret, VerifyOptions, TokenData>(verify)(token, this.config.auth.secret, {});
        } catch (e) {
            return false;
        }

        return true;
    }

    /**
     * Validate a resource token
     * @param token The token
     */
    public async validateResourceToken(token: string): Promise<ResourceTokenData & { valid: boolean }> {
        try {
            const decoded: ResourceTokenData =
                await promisify<string, Secret, VerifyOptions, ResourceTokenData>(verify)(
                    token, this.config.auth.resourceSecret, {});
            return {
                ...decoded,
                valid: true
            };
        } catch (e) {
            return {
                valid: false,
                sourceUserId: null,
                resources: []
            };
        }
    }

    /**
     * Validate whether an authenticator token is valid
     * @param email
     * @param totpToken
     * @param overrideSeed
     */
    public async validateAuthenticatorToken(email: string, totpToken: string, overrideSeed?: string): Promise<boolean> {
        const { seed } = (await AdminUser.findByEmail(email));

        return authenticator.check(totpToken, overrideSeed || seed);
    }

    /**
     * Validate an invite token
     * @param email
     * @param token
     */
    public async validateInviteToken(email: string, token: string): Promise<boolean> {
        logger.info(`[AuthService] Validating invite token for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:validate-invite-token',
            email
        });

        // Check if user exist...
        if (!await AdminUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:validate-invite-token',
                result: 'failed',
                email
            });
            return false;
        }

        if (!await AdminUser.userStatusIs(email, 'invited')) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} is not invited`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:validate-invite-token',
                result: 'failed',
                email
            });
            return false;
        }

        const valid = await AdminInvite.checkInviteToken(email, token);

        if (valid) {
            logger.info('[AuthService] ...success', {
                area: 'services',
                subarea: 'auth',
                action: 'auth:validate-invite-token',
                result: 'success',
                email
            });
        } else {
            logger.warn(`[AuthService] ...failed. Reason: Incorrect invite token`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:validate-invite-token',
                result: 'failed',
                email
            });
        }

        return valid;
    }

    /**
     * Change a users' avatar and name
     * @param id
     * @param info
     */
    public async setUserInfo(id: string, info: UserInfo): Promise<void> {
        logger.info(`[AuthService] Changing user id ${id} info...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:set-user-info',
            data: info
        });

        await AdminUser.setUserInfo(id, info);

        logger.info(`[AuthService] ... success`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:set-user-info',
            result: 'success'
        });
    }

    /**
     * Set roles for a user
     * @param id
     * @param roles
     */
    public async setUserRoles(id: string, roles: string[]): Promise<void> {
        logger.info(`[AuthService] Changing user id ${id} roles...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:set-user-roles',
            roles
        });

        await AdminUser.setUserRoles(id, roles);

        logger.info(`[AuthService] ... success`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:set-user-info',
            result: 'success'
        });
    }

    /* PRIVATE */
    private _generateResetPasswordCode(): string {
        return parseInt(randomBytes(4).toString('hex'), 16).toString().substring(0, 8);
    }

    private async _setUserSecret(id: string, secret: string): Promise<void> {
        const salt = this._saltRev1();
        const hash = await this._hashRev1(salt + secret, salt);

        await AdminUser.setUserHashAndSalt(id, hash, salt);
    }

    /* Password revs */
    private async _hashRev1(secret: string, salt: string): Promise<string> {
        return (await promisify(pbkdf2)(secret, salt, 100000, 64, 'sha512')).toString('hex');
    }

    private _saltRev1() {
        return randomBytes(64).toString('hex');
    }

    private async _userAsInterface(id: string): Promise<User> {
        const user = await AdminUser.findOne({ where: { id } });
        const propTransforms = [
            { name: 'id', newName: 'id', transformer: value => value },
            { name: 'status', newName: 'status', transformer: value => value },
            { name: 'email', newName: 'email', transformer: value => value },
            { name: 'roles', newName: 'roles', transformer: value => value },
            { name: 'info', newName: 'info', transformer: value => value },
            { name: 'created', newName: 'created', transformer: value => value },
            { name: 'last_login', newName: 'lastLogin', transformer: value => value }
        ];

        return propTransforms.reduce((newUser, transform) => {
            newUser[transform.newName] = transform.transformer(user[transform.name]);
            return newUser;
        },
            {}
        ) as unknown as User;
    }
}
