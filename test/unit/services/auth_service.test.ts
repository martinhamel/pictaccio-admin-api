import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticator } from 'otplib';
import sinon, { createSandbox, SinonSandbox } from 'sinon'
import { Container } from 'typedi';
import { AdminUser } from '../../../src/database/entities/admin_user';
import { UserNotFoundError } from '../../../src/errors/user_not_found_error';
import { WrongSecretError } from '../../../src/errors/wrong_secret_error';
import { WrongTOTPTokenError } from '../../../src/errors/wrong_totp_token_error';
import { UserExistError } from '../../../src/errors/user_exist_error';
import { UserStatuses } from '/app/lib/shared/src/types/user_status';

const MockConfig = {
    auth: {
        secret: 'test'
    }
};
Container.set('config', MockConfig);
import { AuthService } from '../../../src/services/auth_service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dummy = require('services/auth_service');

describe('Services/AuthService', () => {
    let sandbox: SinonSandbox;
    let auth: AuthService;

    beforeEach(() => {
        sandbox = createSandbox();
        auth = Container.get('auth');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should throw UserNotFoundError when the user is not found', async () => {
        sandbox.stub(AdminUser, 'emailExists').returns(Promise.resolve(false));

        try {
            await auth.authenticateLocal('test@email.com', 'password', '123456');
        } catch (e) {
            expect(e).to.be.an.instanceof(UserNotFoundError);
        }
    });

    it('should throw WrongSecretError when the password is incorrect', async () => {
        sandbox.stub(AdminUser, 'emailExists').returns(Promise.resolve(true));
        sandbox.stub(AdminUser, 'findByEmail').returns(Promise.resolve({
            id: 1,
            email: 'test@email.com',
            rev: 1,
            data_json: {},
            hash: '...',
            salt: '...',
            seed: '...',
            status: 'enabled',
            created: Date.now(),
            last_login: Date.now()
        } as unknown as AdminUser));

        try {
            await auth.authenticateLocal('test@email.com', 'password', '123456');
        } catch (e) {
            expect(e).to.be.an.instanceof(WrongSecretError);
        }
    });

    it('should throw WrongTOTPTokenError when the totp token is incorrect', async () => {
        sandbox.stub(AdminUser, 'emailExists').returns(Promise.resolve(true));
        sandbox.stub(AdminUser, 'findByEmail').returns(Promise.resolve({
            id: 1,
            email: 'test@email.com',
            rev: 1,
            data_json: {},
            hash: '3e37c9d09f2a18c63900ccd9731863f67eabcb9794a55932cddc888faf3511fffb0398e413e1eb83e73e50c0bb80c57b157528960fa56cf202d6707a99d0541b',
            salt: 'testsalt',
            seed: '695516',
            status: 'enabled',
            created: Date.now(),
            last_login: Date.now()
        } as unknown as AdminUser));

        try {
            await auth.authenticateLocal('test@email.com', 'password', authenticator.generate('695516') + '1');
        } catch (e) {
            expect(e).to.be.an.instanceof(WrongTOTPTokenError);
        }
    });

    it('should authenticate a user if all information is correct', async () => {
        sandbox.stub(AdminUser, 'emailExists').returns(Promise.resolve(true));
        sandbox.stub(AdminUser, 'setLastLogin');
        sandbox.stub(AdminUser, 'findByEmail').returns(Promise.resolve({
            id: 1,
            email: 'test@email.com',
            rev: 1,
            data_json: {},
            hash: '3e37c9d09f2a18c63900ccd9731863f67eabcb9794a55932cddc888faf3511fffb0398e413e1eb83e73e50c0bb80c57b157528960fa56cf202d6707a99d0541b',
            salt: 'testsalt',
            seed: '695516',
            status: 'enabled',
            created: Date.now(),
            last_login: Date.now()
        } as unknown as AdminUser));

        await auth.authenticateLocal('test@email.com', 'password', authenticator.generate('695516'));

        expect(AdminUser.setLastLogin).to.have.been.calledWith();
    });

    it('should fail creating a user if the email address already exist in the db', async () => {
        sandbox.stub(AdminUser, 'emailExists').returns(Promise.resolve(true));

        try {
            await auth.createLocal('test@email.com', 'password', ['admin']);
        } catch (e) {
            expect(e).to.be.an.instanceof(UserExistError);
        }
    });

    it('should call createUser, setUserHashAndSalt and setStatus', async () => {
        sandbox.stub(AdminUser, 'emailExists').returns(Promise.resolve(false));
        sandbox.stub(AdminUser, 'createUser').returns(Promise.resolve('1'));
        sandbox.stub(AdminUser, 'setStatus');
        sandbox.stub(AdminUser, 'setUserHashAndSalt').returns(Promise.resolve());

        await auth.createLocal('test@email.com', 'password', ['admin']);

        expect(AdminUser.createUser).to.have.been.calledWith();
        expect(AdminUser.setUserHashAndSalt).to.have.been.calledWith();
    });

    it('should fail if the user doesn\'t exist when resetting TOTP', async () => {
        sandbox.stub(AdminUser, 'emailExists').returns(Promise.resolve(false));
        sandbox.stub(AdminUser, 'findByEmail').returns(Promise.resolve({ id: 1 } as unknown as AdminUser));
        sandbox.stub(AdminUser, 'setStatus');
        sandbox.stub(AdminUser, 'setUserSeed');

        try {
            await auth.initializeResetTOTP('test@email.com');
        } catch (e) {
            expect(e).to.be.an.instanceof(UserNotFoundError);
        }
    });

    it('should succeed to reset TOTP if the user exist', async () => {
        sandbox.stub(AdminUser, 'emailExists').returns(Promise.resolve(true));
        sandbox.stub(AdminUser, 'findByEmail').returns(Promise.resolve({ id: 1 } as unknown as AdminUser));
        sandbox.stub(AdminUser, 'setStatus');
        sandbox.stub(AdminUser, 'setUserSeed');

        const result = await auth.initializeResetTOTP('test@email.com');
        await auth.confirmResetTOTP('test@email.com', result.seed);

        expect(AdminUser.setUserSeed).to.have.been.calledWith(1, sinon.match.any);
    });

    it('should return a key in the form of an url', async () => {
        sandbox.stub(AdminUser, 'emailExists').returns(Promise.resolve(true));
        sandbox.stub(AdminUser, 'findByEmail').returns(Promise.resolve({ id: 1 } as unknown as AdminUser));
        sandbox.stub(AdminUser, 'setStatus');
        sandbox.stub(AdminUser, 'setUserSeed');

        const result = await auth.initializeResetTOTP('test@email.com');

        expect(result.otpUri).to.match(
            /otpauth:\/\/totp.Pictaccio:test%40email\.com\?secret=[^&]*&period=30&digits=6&algorithm=SHA1&issuer=Pictaccio/i);
    });

    it('should throw when inviting a user with an email address that already exist', async () => {
        sandbox.stub(AdminUser, 'emailExists').returns(Promise.resolve(true));
        sandbox.stub(AdminUser, 'setStatus');

        try {
            await auth.initiateInviteLocal({ firstName: 'Test', lastName: 'test' }, 'test@email.com', ['admin']);
        } catch (e) {
            expect(e).to.be.an.instanceof(UserExistError);
        }
    });

    it('should succeed when inviting a user with an email that isn\'t in the db', async () => {
        sandbox.stub(AdminUser, 'emailExists').returns(Promise.resolve(false));
        sandbox.stub(AdminUser, 'createUser').returns(Promise.resolve('1'));
        sandbox.stub(AdminUser, 'setUserInfo');
        sandbox.stub(AdminUser, 'setStatus');

        await auth.initiateInviteLocal({ firstName: 'Test', lastName: 'test' }, 'test@email.com', ['admin']);

        expect(AdminUser.createUser).to.have.been.calledWith();
    });
});
