import { NotificationDescriptor } from '@pictaccio/admin-api/types/notification_descriptor';

export type PushNotificationToUser = {
    descriptor: NotificationDescriptor,
    userId: string
}
