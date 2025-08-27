export type MailerItem = {
    to: string|string[],
    cc?: string|string[],
    bcc?: string|string[],
    from: string,
    subject: string,
    message: string
}

export interface MailerInterface {
    send(item: MailerItem): Promise<void>;
}
