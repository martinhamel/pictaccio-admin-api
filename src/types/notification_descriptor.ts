import { LocalizedString } from './localized_string';

export interface NotificationDescriptor {
    title: LocalizedString;
    message: LocalizedString;
    hasProgress: boolean;
    hasStop: boolean;
    hasClose: boolean;
    animate?: boolean;
    animationSource?: HTMLElement;
    linkPath?: string;
    linkText?: LocalizedString;
}
