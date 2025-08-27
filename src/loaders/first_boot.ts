import { LoaderInterface } from '../bootstrap';
import { ConfigSchema } from '../core/config_schema';
import { AsyncStoreService } from '../services/async_store_service';
import type { AuthService } from '../services/auth_service';
import type CommunicationService from '../services/communication_service';
import type { UserService } from '../services/user_service';
import { ensureTrailingSlash } from '../utils/ensure_trailing_slash';
import Container from 'typedi';

export const firstBootLoader: LoaderInterface = async (): Promise<any> => {
    const { AdminInvite } = await import('../database/entities/admin_invite.js');
    const asyncStoreService = Container.get<AsyncStoreService>('async-store');
    const authService = Container.get<AuthService>('auth');
    const communicationService = Container.get<CommunicationService>('communication');
    const config = Container.get<ConfigSchema>('config');
    const userService = Container.get<UserService>('user');

    asyncStoreService.init();
    asyncStoreService.set('firstBoot', null);

    if ((await userService.listAll()).length === 0 &&
        config.env.firstUserFirstName &&
        config.env.firstUserLastName &&
        config.env.firstUserEmail) {

        const id = await authService.initiateInviteLocal({
            firstName: config.env.firstUserFirstName,
            lastName: config.env.firstUserLastName
        }, config.env.firstUserEmail, ['super-admin']);
        const inviteToken = await AdminInvite.createInvite(id, config.env.firstUserEmail);

        await communicationService.sendInvite({
            lang: 'en',
            inviteLink:
                `${ensureTrailingSlash(config.env.rootUrl.gui)}invite/` +
                `${config.env.firstUserEmail}/${inviteToken}`,
            inviterName: `Pictaccio System`,
            inviteeName: `${config.env.firstUserFirstName} ${config.env.firstUserLastName}`,
            inviteeEmail: config.env.firstUserEmail
        });
    }
};
