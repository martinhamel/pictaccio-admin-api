import { AsyncStoreService } from '@pictaccio/admin-api/services/async_store_service';
import { AuthService } from '@pictaccio/admin-api/services/auth_service';
import { Server, Socket } from 'socket.io';
import { Inject, Service } from 'typedi';
import { PushNotificationToRoles } from '@pictaccio/admin-api/types/messages/push_notification_to_roles';
import { PushNotificationToUser } from '@pictaccio/admin-api/types/messages/push_notification_to_user';
import { NotificationDescriptor } from '@pictaccio/admin-api/types/notification_descriptor';
import { User } from '@pictaccio/shared/src/types/user';
import { UserSession } from '@pictaccio/admin-api/types/user_session';

type SocketItem = {
    socket: Socket,
    user: User
}

@Service('websocket')
export default class WebsocketService {
    private _sockets: SocketItem[] = [];

    constructor(@Inject('socket-io') private socketio: Server,
        @Inject('auth') private auth: AuthService,
        @Inject('async-store') private asyncStore: AsyncStoreService) {
    }

    public init(): void {
        this._listen();
    }

    public pushNotificationToRole(descriptor: NotificationDescriptor, roles: string[]): void {
        const sockets: Socket[] = [];

        for (const socket of this.socketio.sockets.sockets.values()) {
            if (socket.data.user.roles.some(role => roles.includes(role))) {
                sockets.push(socket);
            }
        }

        this._pushNotification(descriptor, sockets);
    }

    public pushNotificationToUser(descriptor: NotificationDescriptor, userId: string): void {
        for (const socket of this.socketio.sockets.sockets.values()) {
            if (socket.connected && socket.data.user.id === userId) {
                this._pushNotification(descriptor, [socket]);
            }
        }
    }

    /* MESSAGE HANDLER */
    private _pushNotificationToRoleMessage(message: PushNotificationToRoles): void {
        this.pushNotificationToRole(message.descriptor, message.roles);
    }

    private _pushNotificationToUserMessage(message: PushNotificationToUser): void {
        this.pushNotificationToUser(message.descriptor, message.userId);
    }

    /* PRIVATE */
    private _listen(): void {
        this.socketio.on('connection', async (socket) => {
            this.asyncStore.init();
            this.asyncStore.set('socketContext', {
                socketId: socket.id,
                startTime: new Date(),
                user: {} as UserSession
            });

            const user = await this.auth.userFromToken(socket.handshake.auth.token);

            if (!user) {
                return;
            }

            socket.data = { user };
            this._listenSocket(socket);
        });
    }

    private _listenSocket(socket: Socket): void {
        socket.on('request-push-notification-to-user', this._pushNotificationToUserMessage.bind(this));
        socket.on('request-push-notification-to-roles', this._pushNotificationToRoleMessage.bind(this));
    }

    private _pushNotification(descriptor: NotificationDescriptor, sockets: Socket[]): void {
        for (const socket of sockets) {
            socket.emit('push-notification', descriptor);
        }
    }
}
