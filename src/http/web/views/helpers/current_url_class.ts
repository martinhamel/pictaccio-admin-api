import { SLOT_URL } from '@pictaccio/admin-api/http/web/views/view';

export default function currentUrlClass(url: string, className: string, options): string {
    const internalUrl = options.data.root.__internals__[SLOT_URL];

    return internalUrl.url === url
        ? className
        : '';
}
