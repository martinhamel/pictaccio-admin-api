import { NotificationDescriptor } from '@pictaccio/admin-api/types/notification_descriptor';

export type PushNotificationToRoles = {
    descriptor: NotificationDescriptor,
    roles: string[]
}
